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
import { auth } from './firebase';
import { localDb } from './storage';
import type { AccountFormValues, AdminUser } from '../types';

const ACCOUNT_KEY = 'admin_account';
const SESSION_KEY = 'admin_session';

const DEFAULT_ACCOUNT = {
  name: 'Admin Gala',
  email: 'admin@evento.com',
  password: 'admin123',
  createdAt: new Date('2026-01-01T12:00:00.000Z').toISOString(),
  photoUrl: '',
  plan: {
    name: 'Plano Pro',
    status: 'Ativo' as const,
    renewAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
  },
};

function ensureLocalAccount() {
  const existing = localDb.read<(typeof DEFAULT_ACCOUNT) | null>(ACCOUNT_KEY, null);
  if (!existing) {
    localDb.write(ACCOUNT_KEY, DEFAULT_ACCOUNT);
    return DEFAULT_ACCOUNT;
  }
  return existing;
}

function readLocalAccount(): typeof DEFAULT_ACCOUNT {
  return ensureLocalAccount();
}

function writeLocalAccount(account: typeof DEFAULT_ACCOUNT) {
  localDb.write(ACCOUNT_KEY, account);
}

function clearLocalSession() {
  localStorage.removeItem(`rsvp_system_v1:${SESSION_KEY}`);
}

function writeLocalSession(user: AdminUser) {
  localDb.write(SESSION_KEY, user);
}

function readLocalSession(): AdminUser | null {
  return localDb.read<AdminUser | null>(SESSION_KEY, null);
}

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

function localAccountToAdminUser(account: typeof DEFAULT_ACCOUNT): AdminUser {
  return {
    name: account.name,
    email: account.email,
    createdAt: account.createdAt,
    photoUrl: account.photoUrl || undefined,
    authProvider: 'local',
    plan: account.plan,
  };
}

async function syncLocalShadowFromFirebaseUser(user: User | null) {
  if (!user) {
    clearLocalSession();
    return;
  }
  writeLocalSession(firebaseUserToAdminUser(user));
}

export function getCurrentUser(): AdminUser | null {
  const firebaseUser = auth.currentUser;
  if (firebaseUser) return firebaseUserToAdminUser(firebaseUser);
  return readLocalSession();
}

export function subscribeAuthState(callback: (user: AdminUser | null) => void) {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const mapped = firebaseUserToAdminUser(user);
      writeLocalSession(mapped);
      callback(mapped);
      return;
    }
    callback(readLocalSession() ?? null);
  });
}

export async function login(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
  const normalized = email.trim().toLowerCase();
  try {
    const credential = await signInWithEmailAndPassword(auth, normalized, password);
    await syncLocalShadowFromFirebaseUser(credential.user);
    return { ok: true };
  } catch {
    const account = readLocalAccount();
    if (normalized === account.email && password === account.password) {
      const localUser = localAccountToAdminUser(account);
      writeLocalSession(localUser);
      return { ok: true };
    }
    return { ok: false, error: 'E-mail ou senha incorretos.' };
  }
}

export async function loginWithGoogle(): Promise<{ ok: boolean; error?: string }> {
  try {
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(auth, provider);
    await syncLocalShadowFromFirebaseUser(credential.user);
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
  void signOut(auth);
  clearLocalSession();
}

export async function updateAccount(patch: Partial<AccountFormValues>): Promise<{ ok: boolean; error?: string; user?: AdminUser }> {
  const firebaseUser = auth.currentUser;
  const localAccount = readLocalAccount();

  if (firebaseUser) {
    try {
      const nextName = patch.name?.trim();
      const nextPhotoUrl = patch.photoUrl;
      const nextEmail = patch.email?.trim();
      const nextPassword = patch.password?.trim();

      if (nextName) {
        await updateProfile(firebaseUser, { displayName: nextName });
      }
      if (nextPhotoUrl !== undefined) {
        await updateProfile(firebaseUser, { photoURL: nextPhotoUrl });
      }
      if (nextEmail && nextEmail.toLowerCase() !== (firebaseUser.email ?? '').toLowerCase()) {
        await updateEmail(firebaseUser, nextEmail);
      }
      if (nextPassword) {
        await updatePassword(firebaseUser, nextPassword);
      }
      const refreshedUser = auth.currentUser;
      if (!refreshedUser) return { ok: false, error: 'Não foi possível atualizar a conta.' };
      const mapped = firebaseUserToAdminUser(refreshedUser);
      writeLocalSession(mapped);
      return { ok: true, user: mapped };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível atualizar a conta.';
      return { ok: false, error: message };
    }
  }

  const nextPassword = patch.password?.trim() || localAccount.password;
  const nextEmail = patch.email?.trim().toLowerCase() || localAccount.email;
  const nextName = patch.name?.trim() || localAccount.name;

  if (!nextEmail) return { ok: false, error: 'Informe um e-mail válido.' };
  if (nextPassword.length < 6) return { ok: false, error: 'A senha precisa ter ao menos 6 caracteres.' };

  const nextAccount = {
    ...localAccount,
    name: nextName,
    email: nextEmail,
    password: nextPassword,
    photoUrl: patch.photoUrl ?? localAccount.photoUrl,
  };

  writeLocalAccount(nextAccount);
  const user = localAccountToAdminUser(nextAccount);
  writeLocalSession(user);
  return { ok: true, user };
}

export async function updateProfilePhoto(photoUrl: string): Promise<{ ok: boolean; error?: string; user?: AdminUser }> {
  const firebaseUser = auth.currentUser;
  const localAccount = readLocalAccount();

  if (firebaseUser) {
    try {
      await updateProfile(firebaseUser, { photoURL: photoUrl });
      const refreshedUser = auth.currentUser;
      if (!refreshedUser) return { ok: false, error: 'Não foi possível atualizar a foto.' };
      const mapped = firebaseUserToAdminUser(refreshedUser);
      writeLocalSession(mapped);
      return { ok: true, user: mapped };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível atualizar a foto.';
      return { ok: false, error: message };
    }
  }

  const nextAccount = { ...localAccount, photoUrl };
  writeLocalAccount(nextAccount);
  const user = localAccountToAdminUser(nextAccount);
  writeLocalSession(user);
  return { ok: true, user };
}

export async function deleteAccount(): Promise<{ ok: boolean; error?: string }> {
  try {
    if (auth.currentUser) {
      await deleteUser(auth.currentUser);
    }
    localStorage.removeItem(`rsvp_system_v1:${ACCOUNT_KEY}`);
    clearLocalSession();
    return { ok: true };
  } catch {
    return { ok: false, error: 'O Firebase exige reautenticação para excluir esta conta. Tente entrar novamente e remover outra vez.' };
  }
}

export async function sendPasswordReset(email: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await sendPasswordResetEmail(auth, email.trim().toLowerCase());
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Não foi possível enviar o e-mail de redefinição.';
    return { ok: false, error: message };
  }
}

export function getAccountData(): AdminUser {
  const firebaseUser = auth.currentUser;
  if (firebaseUser) return firebaseUserToAdminUser(firebaseUser);
  return readLocalSession() ?? localAccountToAdminUser(readLocalAccount());
}
