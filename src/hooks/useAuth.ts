import { useCallback, useEffect, useState } from 'react';
import {
  createAccountWithGoogle,
  deleteAccount as deleteAccountService,
  getCurrentUser,
  login as loginService,
  loginWithGoogle,
  logout as logoutService,
  sendPasswordReset,
  subscribeAuthState,
  updateAccount as updateAccountService,
  updateProfilePhoto as updateProfilePhotoService,
} from '../services/authService';
import { isFirebaseConfigured } from '../services/firebase';
import type { AccountFormValues, AdminUser } from '../types';

export function useAuth() {
  const [user, setUser] = useState<AdminUser | null>(getCurrentUser());
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setUser(null);
      setLoading(false);
      return;
    }
    const unsubscribe = subscribeAuthState((nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setActionLoading(true);
    const result = await loginService(email, password);
    setActionLoading(false);
    if (result.ok) setUser(getCurrentUser());
    return result;
  }, []);

  const loginWithGoogleAccount = useCallback(async () => {
    setActionLoading(true);
    const result = await loginWithGoogle();
    setActionLoading(false);
    if (result.ok) setUser(getCurrentUser());
    return result;
  }, []);

  const createGoogleAccount = useCallback(async () => {
    setActionLoading(true);
    const result = await createAccountWithGoogle();
    setActionLoading(false);
    if (result.ok) setUser(getCurrentUser());
    return result;
  }, []);

  const logout = useCallback(() => {
    logoutService();
    setUser(null);
  }, []);

  const updateAccount = useCallback(async (patch: Partial<AccountFormValues>) => {
    const result = await updateAccountService(patch);
    if (result.ok && result.user) setUser(result.user);
    return result;
  }, []);

  const updateProfilePhoto = useCallback(async (photoUrl: string) => {
    const result = await updateProfilePhotoService(photoUrl);
    if (result.ok && result.user) setUser(result.user);
    return result;
  }, []);

  const deleteAccount = useCallback(async () => {
    const result = await deleteAccountService();
    if (result.ok) setUser(null);
    return result;
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    return sendPasswordReset(email);
  }, []);

  return {
    user,
    loading: loading || actionLoading,
    login,
    loginWithGoogle: loginWithGoogleAccount,
    createGoogleAccount,
    requestPasswordReset,
    logout,
    updateAccount,
    updateProfilePhoto,
    deleteAccount,
    isAuthenticated: !!user,
  };
}
