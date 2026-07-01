/**
 * Camada de persistência local (mock).
 *
 * Este projeto foi desenhado para funcionar imediatamente sem nenhuma
 * configuração de backend, usando o localStorage do navegador como banco
 * de dados. Toda a lógica de acesso a dados está isolada nos arquivos de
 * `src/services`, então trocar esta camada por Supabase/Firebase no futuro
 * não exige alterar nenhuma tela — basta reimplementar as funções de
 * `eventService.ts` e `guestService.ts` usando o client real, mantendo as
 * mesmas assinaturas. Veja `src/services/supabase.schema.sql` para o schema
 * SQL pronto para Supabase/Postgres.
 */

const NAMESPACE = 'rsvp_system_v1';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${NAMESPACE}:${key}`);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  localStorage.setItem(`${NAMESPACE}:${key}`, JSON.stringify(value));
}

/** Pequeno atraso artificial para simular round-trip de rede real. */
function delay<T>(value: T, ms = 220): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export const localDb = { read, write, delay };
