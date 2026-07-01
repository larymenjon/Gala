import {
  GoogleAuthProvider,
  deleteUser,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateEmail,
  updatePassword,
  updateProfile,
  type User,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './firebase';
import type { AccountFormValues, AdminUser } from '../types';

function firebaseUserToAdminUser(user: User): AdminUser {
  const providerId = user.providerData.find((p) => p.providerId === 'google.com' || p.providerId === 'password')?.providerId;
  const authProvider: AdminUser['authProvider'] = providerId === 'google.com'
    ? 'google'
    : providerId === 'password'
      ? 'password'
      : 'local';

  return {
    name: user.displayName || user.email?.split('@')[0] || 'Admin Gala',
    email: user.email || '',
    createdAt: new Date(user.metadata.creationTime ?? Date.now()).toISOString(),
    photoUrl: user.photoURL || undefined,
    authProvider,
    plan: {
      name: 'Plano Pro',
      status: 'Ativo',
      renewAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    },
  };
}

function unavailableError() {
  return { ok: false, error: 'Autenticação Firebase não configurada neste ambiente.' };
}

export function getCurrentUser(): AdminUser | null {
  if (!isFirebaseConfigured || !auth?.currentUser) return null;
  return firebaseUserToAdminUser(auth.currentUser);
}

export function subscribeAuthState(callback: (user: AdminUser | null) => void) {
  if (!isFirebaseConfigured || !auth) {
    callback(null);
    return () => undefined;
  }
  return onAuthStateChanged(auth, (user) => {
    callback(user ? firebaseUserToAdminUser(user) : null);
  });
}

export async function login(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
  if (!isFirebaseConfigured || !auth) return unavailableError();
  try {
    await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'E-mail ou senha incorretos.';
    return { ok: false, error: message };
  }
}

export async function loginWithGoogle(): Promise<{ ok: boolean; error?: string }> {
  if (!isFirebaseConfigured || !auth) return unavailableError();
  try {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Não foi possível entrar com Google.';
    return { ok: false, error: message };
  }
}

export async function createAccountWithGoogle(): Promise<{ ok: boolean; error?: string }> {
  return loginWithGoogle();
}

export function logout(): void {
  if (isFirebaseConfigured && auth) void signOut(auth);
}

export async function updateAccount(patch: Partial<AccountFormValues>): Promise<{ ok: boolean; error?: string; user?: AdminUser }> {
  if (!isFirebaseConfigured || !auth?.currentUser) return { ok: false, error: 'Você precisa estar autenticado para atualizar a conta.' };

  try {
    const nextName = patch.name?.trim();
    const nextPhotoUrl = patch.photoUrl;
    const nextEmail = patch.email?.trim();
    const nextPassword = patch.password?.trim();

    if (nextName) {
      await updateProfile(auth.currentUser, { displayName: nextName });
    }
    if (nextPhotoUrl !== undefined) {
      await updateProfile(auth.currentUser, { photoURL: nextPhotoUrl });
    }
    if (nextEmail && nextEmail.toLowerCase() !== (auth.currentUser.email ?? '').toLowerCase()) {
      await updateEmail(auth.currentUser, nextEmail);
    }
    if (nextPassword) {
      await updatePassword(auth.currentUser, nextPassword);
    }

    const refreshedUser = auth.currentUser;
    return { ok: true, user: firebaseUserToAdminUser(refreshedUser) };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Não foi possível atualizar a conta.';
    return { ok: false, error: message };
  }
}

export async function updateProfilePhoto(photoUrl: string): Promise<{ ok: boolean; error?: string; user?: AdminUser }> {
  if (!isFirebaseConfigured || !auth?.currentUser) return { ok: false, error: 'Você precisa estar autenticado para alterar a foto.' };

  try {
    await updateProfile(auth.currentUser, { photoURL: photoUrl });
    return { ok: true, user: firebaseUserToAdminUser(auth.currentUser) };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Não foi possível atualizar a foto.';
    return { ok: false, error: message };
  }
}

export async function deleteAccount(): Promise<{ ok: boolean; error?: string }> {
  if (!isFirebaseConfigured || !auth?.currentUser) {
    return { ok: false, error: 'Você precisa estar autenticado para excluir a conta.' };
  }

  try {
    await deleteUser(auth.currentUser);
    return { ok: true };
  } catch {
    return { ok: false, error: 'O Firebase exige reautenticação para excluir esta conta. Entre novamente e tente de novo.' };
  }
}

export async function sendPasswordReset(email: string): Promise<{ ok: boolean; error?: string }> {
  if (!isFirebaseConfigured || !auth) return unavailableError();
  try {
    await sendPasswordResetEmail(auth, email.trim().toLowerCase());
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Não foi possível enviar o e-mail de redefinição.';
    return { ok: false, error: message };
  }
}

export function getAccountData(): AdminUser | null {
  if (!isFirebaseConfigured || !auth?.currentUser) return null;
  return firebaseUserToAdminUser(auth.currentUser);
}
