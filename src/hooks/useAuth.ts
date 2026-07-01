import { useCallback, useEffect, useState } from 'react';
import {
  deleteAccount as deleteAccountService,
  getCurrentUser,
  login as loginService,
  logout as logoutService,
  updateAccount as updateAccountService,
  updateProfilePhoto as updateProfilePhotoService,
} from '../services/authService';
import type { AccountFormValues, AdminUser } from '../types';

export function useAuth() {
  const [user, setUser] = useState<AdminUser | null>(getCurrentUser());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    const result = await loginService(email, password);
    setLoading(false);
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
    await deleteAccountService();
    setUser(null);
  }, []);

  return {
    user,
    loading,
    login,
    logout,
    updateAccount,
    updateProfilePhoto,
    deleteAccount,
    isAuthenticated: !!user,
  };
}
