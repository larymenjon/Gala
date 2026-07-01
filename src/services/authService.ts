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

function ensureAccount() {
  const existing = localDb.read<(typeof DEFAULT_ACCOUNT) | null>(ACCOUNT_KEY, null);
  if (!existing) {
    localDb.write(ACCOUNT_KEY, DEFAULT_ACCOUNT);
    return DEFAULT_ACCOUNT;
  }
  return existing;
}

function readAccount(): typeof DEFAULT_ACCOUNT {
  return ensureAccount();
}

function writeAccount(account: typeof DEFAULT_ACCOUNT) {
  localDb.write(ACCOUNT_KEY, account);
}

function publicAccount(account: typeof DEFAULT_ACCOUNT): AdminUser {
  return {
    name: account.name,
    email: account.email,
    createdAt: account.createdAt,
    photoUrl: account.photoUrl || undefined,
    plan: account.plan,
  };
}

export async function login(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
  const account = readAccount();
  const normalized = email.trim().toLowerCase();
  if (normalized !== account.email || password !== account.password) {
    return localDb.delay({ ok: false, error: 'E-mail ou senha incorretos.' }, 350);
  }
  localDb.write(SESSION_KEY, { email: normalized, loggedAt: new Date().toISOString() });
  return localDb.delay({ ok: true }, 350);
}

export function logout(): void {
  localStorage.removeItem(`rsvp_system_v1:${SESSION_KEY}`);
}

export function getCurrentUser(): AdminUser | null {
  const session = localDb.read<{ email: string } | null>(SESSION_KEY, null);
  if (!session) return null;
  const account = readAccount();
  if (session.email !== account.email) return null;
  return publicAccount(account);
}

export async function updateAccount(patch: Partial<AccountFormValues>): Promise<{ ok: boolean; error?: string; user?: AdminUser }> {
  const account = readAccount();
  const nextPassword = patch.password?.trim() || account.password;
  const nextEmail = patch.email?.trim().toLowerCase() || account.email;
  const nextName = patch.name?.trim() || account.name;

  if (!nextEmail) return localDb.delay({ ok: false, error: 'Informe um e-mail válido.' }, 220);
  if (nextPassword.length < 6) return localDb.delay({ ok: false, error: 'A senha precisa ter ao menos 6 caracteres.' }, 220);

  const nextAccount = {
    ...account,
    name: nextName,
    email: nextEmail,
    password: nextPassword,
    photoUrl: patch.photoUrl ?? account.photoUrl,
  };

  writeAccount(nextAccount);
  localDb.write(SESSION_KEY, { email: nextEmail, loggedAt: new Date().toISOString() });
  return localDb.delay({ ok: true, user: publicAccount(nextAccount) }, 220);
}

export async function updateProfilePhoto(photoUrl: string): Promise<{ ok: boolean; user?: AdminUser }> {
  const account = readAccount();
  const nextAccount = { ...account, photoUrl };
  writeAccount(nextAccount);
  return localDb.delay({ ok: true, user: publicAccount(nextAccount) }, 220);
}

export async function deleteAccount(): Promise<void> {
  localStorage.removeItem(`rsvp_system_v1:${ACCOUNT_KEY}`);
  localStorage.removeItem(`rsvp_system_v1:${SESSION_KEY}`);
  return localDb.delay(undefined, 220);
}

export function getAccountData(): AdminUser {
  return publicAccount(readAccount());
}
