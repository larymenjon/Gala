import { collection, deleteDoc, doc, getDoc, getDocs, limit, query, setDoc, updateDoc, where, writeBatch } from 'firebase/firestore';
import type { EventMetrics, Guest, GuestStatus } from '../types';
import { generateSlug } from '../utils/slug';
import { auth, db } from './firebase';
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

function compareGuestNames(a: Guest, b: Guest): number {
  const byName = a.responsibleName.localeCompare(b.responsibleName, 'pt-BR', { sensitivity: 'base' });
  if (byName !== 0) return byName;
  return a.createdAt.localeCompare(b.createdAt);
}

function getLocalGuests(): Guest[] {
  return localDb.read<Guest[]>(KEY, []);
}

function saveLocalGuests(guests: Guest[]): void {
  localDb.write(KEY, guests);
}

function mapGuestData(id: string, data: Record<string, unknown>): Guest {
  return {
    id,
    eventId: String(data.eventId ?? ''),
    responsibleName: String(data.responsibleName ?? ''),
    phone: String(data.phone ?? ''),
    expectedPeople: Number(data.expectedPeople ?? 1),
    confirmedPeople: Number(data.confirmedPeople ?? 0),
    status: data.status as GuestStatus,
    respondedAt: data.respondedAt ? String(data.respondedAt) : undefined,
    createdAt: String(data.createdAt ?? new Date().toISOString()),
    slug: String(data.slug ?? ''),
  };
}

async function uniqueSlug(existing: Guest[]): Promise<string> {
  let slug = generateSlug();
  let safety = 0;
  while (existing.some((g) => g.slug === slug) && safety < 8) {
    slug = generateSlug();
    safety += 1;
  }
  return slug;
}

async function slugExists(candidate: string): Promise<boolean> {
  if (!db) return false;
  const snapshot = await getDocs(query(collection(db, KEY), where('slug', '==', candidate), limit(1)));
  return !snapshot.empty;
}

export async function listGuestsByEvent(eventId: string): Promise<Guest[]> {
  if (!db) {
    const guests = getLocalGuests()
      .filter((g) => g.eventId === eventId)
      .sort(compareGuestNames);
    return localDb.delay(guests);
  }

  try {
    const snapshot = await getDocs(query(collection(db, KEY), where('eventId', '==', eventId)));
    if (snapshot.empty) {
      const guests = getLocalGuests()
        .filter((g) => g.eventId === eventId)
        .sort(compareGuestNames);
      return localDb.delay(guests);
    }
    return snapshot.docs
      .map((snap) => mapGuestData(snap.id, snap.data()))
      .sort(compareGuestNames);
  } catch {
    const guests = getLocalGuests()
      .filter((g) => g.eventId === eventId)
      .sort(compareGuestNames);
    return localDb.delay(guests);
  }
}

export async function listAllGuests(): Promise<Guest[]> {
  if (!db) {
    const guests = getLocalGuests().sort(compareGuestNames);
    return localDb.delay(guests);
  }

  try {
    const snapshot = await getDocs(collection(db, KEY));
    if (snapshot.empty) {
      const guests = getLocalGuests().sort(compareGuestNames);
      return localDb.delay(guests);
    }
    return snapshot.docs
      .map((snap) => mapGuestData(snap.id, snap.data()))
      .sort(compareGuestNames);
  } catch {
    const guests = getLocalGuests().sort(compareGuestNames);
    return localDb.delay(guests);
  }
}

export async function getGuestBySlug(slug: string): Promise<Guest | undefined> {
  if (!db) {
    const guest = getLocalGuests().find((g) => g.slug === slug);
    return localDb.delay(guest);
  }

  try {
    const snapshot = await getDocs(query(collection(db, KEY), where('slug', '==', slug), limit(1)));
    if (snapshot.empty) {
      const guest = getLocalGuests().find((g) => g.slug === slug);
      return localDb.delay(guest);
    }
    const snap = snapshot.docs[0];
    return mapGuestData(snap.id, snap.data());
  } catch {
    const guest = getLocalGuests().find((g) => g.slug === slug);
    return localDb.delay(guest);
  }
}

export async function createGuest(input: {
  eventId: string;
  responsibleName: string;
  phone: string;
  expectedPeople: number;
}): Promise<Guest> {
  if (!db) {
    const guests = getLocalGuests();
    const guest: Guest = {
      id: crypto.randomUUID(),
      eventId: input.eventId,
      responsibleName: input.responsibleName.trim(),
      phone: input.phone.trim(),
      expectedPeople: Math.max(1, input.expectedPeople),
      confirmedPeople: 0,
      status: 'pendente',
      createdAt: new Date().toISOString(),
      slug: await uniqueSlug(guests),
    };
    guests.push(guest);
    saveLocalGuests(guests);
    return localDb.delay(guest);
  }

  try {
    const createdAt = new Date().toISOString();
    let slug = generateSlug();
    let safety = 0;
    while ((await slugExists(slug)) && safety < 8) {
      slug = generateSlug();
      safety += 1;
    }

    const guest: Guest = {
      id: crypto.randomUUID(),
      eventId: input.eventId,
      responsibleName: input.responsibleName.trim(),
      phone: input.phone.trim(),
      expectedPeople: Math.max(1, input.expectedPeople),
      confirmedPeople: 0,
      status: 'pendente',
      createdAt,
      slug,
    };

    await setDoc(doc(db, KEY, guest.id), guest);
    return guest;
  } catch {
    const guests = getLocalGuests();
    const guest: Guest = {
      id: crypto.randomUUID(),
      eventId: input.eventId,
      responsibleName: input.responsibleName.trim(),
      phone: input.phone.trim(),
      expectedPeople: Math.max(1, input.expectedPeople),
      confirmedPeople: 0,
      status: 'pendente',
      createdAt: new Date().toISOString(),
      slug: await uniqueSlug(guests),
    };
    guests.push(guest);
    saveLocalGuests(guests);
    return localDb.delay(guest);
  }
}

export interface GuestImportRow {
  responsibleName: string;
  phone?: string;
  expectedPeople?: number;
}

export interface GuestImportResult {
  imported: number;
  skippedDuplicates: number;
  skippedInvalid: number;
  total: number;
}

export async function importGuestsToEvent(eventId: string, rows: GuestImportRow[]): Promise<GuestImportResult> {
  const existingGuests = await listGuestsByEvent(eventId);
  const existingKeys = new Set(existingGuests.map((g) => `${normalizeText(g.responsibleName)}|${normalizePhone(g.phone) || 'sem-telefone'}`));
  const batchKeys = new Set<string>();
  let imported = 0;
  let skippedDuplicates = 0;
  let skippedInvalid = 0;

  if (!db) {
    const guests = getLocalGuests();
    for (const row of rows) {
      const name = row.responsibleName.trim();
      const phone = row.phone?.trim() ?? '';
      const expectedPeople = Math.max(1, Math.floor(Number(row.expectedPeople ?? 1)));
      const key = `${normalizeText(name)}|${normalizePhone(phone) || 'sem-telefone'}`;

      if (!name || Number.isNaN(expectedPeople) || expectedPeople < 1) {
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
        slug: await uniqueSlug(guests),
      });
      imported += 1;
    }

    saveLocalGuests(guests);
    return localDb.delay({ imported, skippedDuplicates, skippedInvalid, total: rows.length });
  }

  const batch = writeBatch(db);
  const guestsCollection = collection(db, KEY);
  const currentDocs = await getDocs(guestsCollection);
  const currentGuests = currentDocs.docs.map((snap) => mapGuestData(snap.id, snap.data()));
  const slugSet = new Set(currentGuests.map((g) => g.slug));

  for (const row of rows) {
    const name = row.responsibleName.trim();
    const phone = row.phone?.trim() ?? '';
    const expectedPeople = Math.max(1, Math.floor(Number(row.expectedPeople ?? 1)));
    const key = `${normalizeText(name)}|${normalizePhone(phone) || 'sem-telefone'}`;

    if (!name || Number.isNaN(expectedPeople) || expectedPeople < 1) {
      skippedInvalid += 1;
      continue;
    }

    if (existingKeys.has(key) || batchKeys.has(key)) {
      skippedDuplicates += 1;
      continue;
    }

    batchKeys.add(key);
    let slug = generateSlug();
    let safety = 0;
    while (slugSet.has(slug) && safety < 8) {
      slug = generateSlug();
      safety += 1;
    }
    slugSet.add(slug);

    const ref = doc(collection(db, KEY));
    batch.set(ref, {
      id: ref.id,
      eventId,
      responsibleName: name,
      phone,
      expectedPeople,
      confirmedPeople: 0,
      status: 'pendente',
      createdAt: new Date().toISOString(),
      slug,
    });
    imported += 1;
  }

  try {
    await batch.commit();
    return { imported, skippedDuplicates, skippedInvalid, total: rows.length };
  } catch {
    const guests = getLocalGuests();
    for (const row of rows) {
      const name = row.responsibleName.trim();
      const phone = row.phone?.trim() ?? '';
      const expectedPeople = Math.max(1, Math.floor(Number(row.expectedPeople ?? 1)));
      const key = `${normalizeText(name)}|${normalizePhone(phone) || 'sem-telefone'}`;

      if (!name || Number.isNaN(expectedPeople) || expectedPeople < 1) {
        continue;
      }

      if (existingKeys.has(key) || batchKeys.has(key)) {
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
        slug: await uniqueSlug(guests),
      });
      imported += 1;
    }

    saveLocalGuests(guests);
    return localDb.delay({ imported, skippedDuplicates, skippedInvalid, total: rows.length });
  }
}

export async function updateGuest(id: string, patch: Partial<Pick<Guest, 'responsibleName' | 'phone' | 'expectedPeople'>>): Promise<Guest | undefined> {
  if (!db) {
    const guests = getLocalGuests();
    const idx = guests.findIndex((g) => g.id === id);
    if (idx === -1) return undefined;
    guests[idx] = { ...guests[idx], ...patch };
    saveLocalGuests(guests);
    return localDb.delay(guests[idx]);
  }

  const ref = doc(db, KEY, id);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return undefined;
  await updateDoc(ref, patch);
  const reloaded = await getDoc(ref);
  if (!reloaded.exists()) return undefined;
  return mapGuestData(reloaded.id, reloaded.data());
}

export async function deleteGuest(id: string): Promise<void> {
  if (!db) {
    const guests = getLocalGuests().filter((g) => g.id !== id);
    saveLocalGuests(guests);
    return localDb.delay(undefined);
  }

  try {
    const ref = doc(db, KEY, id);
    const snapshot = await getDoc(ref);
    const ownerId = auth?.currentUser?.uid;
    if (snapshot.exists() && ownerId && snapshot.data()?.ownerId && snapshot.data().ownerId !== ownerId) {
      return;
    }

    await deleteDoc(ref);
    const guests = getLocalGuests().filter((g) => g.id !== id);
    saveLocalGuests(guests);
  } catch {
    const guests = getLocalGuests().filter((g) => g.id !== id);
    saveLocalGuests(guests);
    await localDb.delay(undefined);
  }
}

export interface ResponseResult {
  ok: boolean;
  guest?: Guest;
  error?: string;
}

/**
 * Regra central de negócio da página pública:
 * - Um convidado só existe se já tiver sido cadastrado pelo administrador (link único).
 * - Confirmar presença sempre ATUALIZA o registro existente (nunca cria duplicado).
 * - Se o evento tiver limite máximo de pessoas, a soma de confirmados não pode ultrapassá-lo.
 * - Sempre grava data/hora da resposta.
 */
export async function submitResponse(
  slug: string,
  payload: { responsibleName: string; confirmedPeople: number; status: Extract<GuestStatus, 'confirmado' | 'recusado'> }
): Promise<ResponseResult> {
  const guests = await listAllGuests();
  const guest = guests.find((g) => g.slug === slug);
  if (!guest) {
    return { ok: false, error: 'Convite não encontrado. Verifique se o link está correto.' };
  }

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
          error:
            vagas > 0
              ? `O evento atingiu o limite de convidados. Restam apenas ${vagas} vaga(s).`
              : 'Infelizmente o evento atingiu o limite máximo de convidados.',
        };
      }
    }
  }

  const updatedGuest: Guest = {
    ...guest,
    responsibleName: payload.responsibleName.trim() || guest.responsibleName,
    confirmedPeople: payload.status === 'confirmado' ? payload.confirmedPeople : 0,
    status: payload.status,
    respondedAt: new Date().toISOString(),
  };

  if (!db) {
    const localGuests = getLocalGuests();
    const idx = localGuests.findIndex((g) => g.slug === slug);
    if (idx === -1) {
      return { ok: false, error: 'Convite não encontrado. Verifique se o link está correto.' };
    }
    localGuests[idx] = updatedGuest;
    saveLocalGuests(localGuests);
    return { ok: true, guest: updatedGuest };
  }

  try {
    await updateDoc(doc(db, KEY, guest.id), {
      responsibleName: updatedGuest.responsibleName,
      confirmedPeople: updatedGuest.confirmedPeople,
      status: updatedGuest.status,
      respondedAt: updatedGuest.respondedAt,
    });
    return { ok: true, guest: updatedGuest };
  } catch {
    const localGuests = getLocalGuests();
    const idx = localGuests.findIndex((g) => g.slug === slug);
    if (idx !== -1) {
      localGuests[idx] = updatedGuest;
      saveLocalGuests(localGuests);
    }
    return { ok: true, guest: updatedGuest };
  }
}

export async function getEventMetrics(eventId: string): Promise<EventMetrics> {
  const guests = await listGuestsByEvent(eventId);
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
