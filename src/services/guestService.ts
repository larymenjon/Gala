import type { EventMetrics, Guest, GuestStatus } from '../types';
import { generateSlug } from '../utils/slug';
import { localDb } from './storage';
import { getEvent } from './eventService';

const KEY = 'guests';

function normalizeText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

function normalizePhone(value: string): string {
  return value.replace(/\D/g, '');
}

function getAll(): Guest[] {
  return localDb.read<Guest[]>(KEY, []);
}

function saveAll(guests: Guest[]): void {
  localDb.write(KEY, guests);
}

function uniqueSlug(existing: Guest[]): string {
  let slug = generateSlug();
  while (existing.some((g) => g.slug === slug)) {
    slug = generateSlug();
  }
  return slug;
}

export async function listGuestsByEvent(eventId: string): Promise<Guest[]> {
  const guests = getAll()
    .filter((g) => g.eventId === eventId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return localDb.delay(guests);
}

export async function listAllGuests(): Promise<Guest[]> {
  const guests = getAll().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return localDb.delay(guests);
}

export async function getGuestBySlug(slug: string): Promise<Guest | undefined> {
  const guest = getAll().find((g) => g.slug === slug);
  return localDb.delay(guest);
}

export async function createGuest(input: {
  eventId: string;
  responsibleName: string;
  phone: string;
  expectedPeople: number;
}): Promise<Guest> {
  const guests = getAll();
  const guest: Guest = {
    id: crypto.randomUUID(),
    eventId: input.eventId,
    responsibleName: input.responsibleName.trim(),
    phone: input.phone.trim(),
    expectedPeople: Math.max(1, input.expectedPeople),
    confirmedPeople: 0,
    status: 'pendente',
    createdAt: new Date().toISOString(),
    slug: uniqueSlug(guests),
  };
  guests.push(guest);
  saveAll(guests);
  return localDb.delay(guest);
}

export interface GuestImportRow {
  responsibleName: string;
  phone: string;
  expectedPeople: number;
}

export interface GuestImportResult {
  imported: number;
  skippedDuplicates: number;
  skippedInvalid: number;
  total: number;
}

export async function importGuestsToEvent(eventId: string, rows: GuestImportRow[]): Promise<GuestImportResult> {
  const guests = getAll();
  const existingKeys = new Set(
    guests
      .filter((g) => g.eventId === eventId)
      .map((g) => `${normalizeText(g.responsibleName)}|${normalizePhone(g.phone)}`)
  );
  const batchKeys = new Set<string>();
  let imported = 0;
  let skippedDuplicates = 0;
  let skippedInvalid = 0;

  for (const row of rows) {
    const name = row.responsibleName.trim();
    const phone = row.phone.trim();
    const expectedPeople = Math.max(1, Math.floor(Number(row.expectedPeople)));
    const key = `${normalizeText(name)}|${normalizePhone(phone)}`;

    if (!name || !phone || Number.isNaN(expectedPeople) || expectedPeople < 1) {
      skippedInvalid += 1;
      continue;
    }

    if (existingKeys.has(key) || batchKeys.has(key)) {
      skippedDuplicates += 1;
      continue;
    }

    batchKeys.add(key);
    guests.push({
      id: crypto.randomUUID(),
      eventId,
      responsibleName: name,
      phone,
      expectedPeople,
      confirmedPeople: 0,
      status: 'pendente',
      createdAt: new Date().toISOString(),
      slug: uniqueSlug(guests),
    });
    imported += 1;
  }

  saveAll(guests);
  return localDb.delay({ imported, skippedDuplicates, skippedInvalid, total: rows.length });
}

export async function updateGuest(id: string, patch: Partial<Pick<Guest, 'responsibleName' | 'phone' | 'expectedPeople'>>): Promise<Guest | undefined> {
  const guests = getAll();
  const idx = guests.findIndex((g) => g.id === id);
  if (idx === -1) return undefined;
  guests[idx] = { ...guests[idx], ...patch };
  saveAll(guests);
  return localDb.delay(guests[idx]);
}

export async function deleteGuest(id: string): Promise<void> {
  const guests = getAll().filter((g) => g.id !== id);
  saveAll(guests);
  return localDb.delay(undefined);
}

export interface RsvpResult {
  ok: boolean;
  guest?: Guest;
  error?: string;
}

/**
 * Regra central de negócio do microsite público:
 * - Um convidado só existe se já tiver sido cadastrado pelo administrador (link único).
 * - Confirmar presença sempre ATUALIZA o registro existente (nunca cria duplicado).
 * - Se o evento tiver limite máximo de pessoas, a soma de confirmados não pode ultrapassá-lo.
 * - Sempre grava data/hora da resposta.
 */
export async function submitRsvp(
  slug: string,
  payload: { responsibleName: string; confirmedPeople: number; status: Extract<GuestStatus, 'confirmado' | 'recusado'> }
): Promise<RsvpResult> {
  const guests = getAll();
  const idx = guests.findIndex((g) => g.slug === slug);
  if (idx === -1) {
    return { ok: false, error: 'Convite não encontrado. Verifique se o link está correto.' };
  }

  const guest = guests[idx];
  const event = await getEvent(guest.eventId);

  if (payload.status === 'confirmado') {
    if (payload.confirmedPeople < 1) {
      return { ok: false, error: 'Informe ao menos 1 pessoa para confirmar presença.' };
    }
    if (payload.confirmedPeople > guest.expectedPeople) {
      return { ok: false, error: `Esse convite contempla no máximo ${guest.expectedPeople} pessoa(s).` };
    }
    if (event?.maxGuestsTotal) {
      const othersConfirmed = guests
        .filter((g) => g.eventId === guest.eventId && g.id !== guest.id && g.status === 'confirmado')
        .reduce((sum, g) => sum + g.confirmedPeople, 0);
      if (othersConfirmed + payload.confirmedPeople > event.maxGuestsTotal) {
        const vagas = Math.max(0, event.maxGuestsTotal - othersConfirmed);
        return {
          ok: false,
          error: vagas > 0
            ? `O evento atingiu o limite de convidados. Restam apenas ${vagas} vaga(s).`
            : 'Infelizmente o evento atingiu o limite máximo de convidados.',
        };
      }
    }
  }

  guests[idx] = {
    ...guest,
    responsibleName: payload.responsibleName.trim() || guest.responsibleName,
    confirmedPeople: payload.status === 'confirmado' ? payload.confirmedPeople : 0,
    status: payload.status,
    respondedAt: new Date().toISOString(),
  };
  saveAll(guests);
  return { ok: true, guest: guests[idx] };
}

export async function getEventMetrics(eventId: string): Promise<EventMetrics> {
  const guests = (await listGuestsByEvent(eventId));
  const totalInvites = guests.length;
  const totalExpectedPeople = guests.reduce((s, g) => s + g.expectedPeople, 0);
  const confirmed = guests.filter((g) => g.status === 'confirmado');
  const declined = guests.filter((g) => g.status === 'recusado');
  const pending = guests.filter((g) => g.status === 'pendente');
  const totalConfirmedPeople = confirmed.reduce((s, g) => s + g.confirmedPeople, 0);
  const confirmationRate = totalInvites > 0 ? Math.round(((confirmed.length + declined.length) / totalInvites) * 100) : 0;

  return {
    totalInvites,
    totalExpectedPeople,
    totalConfirmations: confirmed.length,
    totalConfirmedPeople,
    totalDeclined: declined.length,
    totalPending: pending.length,
    confirmationRate,
  };
}
