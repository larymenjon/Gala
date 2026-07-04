import { collection, deleteDoc, deleteField, doc, getDoc, getDocs, orderBy, query, setDoc, updateDoc } from 'firebase/firestore';
import type { EventItem } from '../types';
import { db } from './firebase';
import { localDb } from './storage';

const KEY = 'events';

function getLocalEvents(): EventItem[] {
  return localDb.read<EventItem[]>(KEY, []);
}

function saveLocalEvents(events: EventItem[]): void {
  localDb.write(KEY, events);
}

function stripUndefined<T extends Record<string, unknown>>(input: T): Partial<T> {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined)) as Partial<T>;
}

function mapEventData(id: string, data: Record<string, unknown>): EventItem {
  return {
    id,
    name: String(data.name ?? ''),
    date: String(data.date ?? ''),
    time: String(data.time ?? ''),
    location: String(data.location ?? ''),
    description: String(data.description ?? ''),
    welcomeMessage: String(data.welcomeMessage ?? ''),
    invitationStyle: data.invitationStyle as EventItem['invitationStyle'],
    invitationArtworkUrl: data.invitationArtworkUrl as string | undefined,
    primaryColor: data.primaryColor as string | undefined,
    secondaryColor: data.secondaryColor as string | undefined,
    textColor: data.textColor as string | undefined,
    mutedTextColor: data.mutedTextColor as string | undefined,
    backgroundColor: data.backgroundColor as string | undefined,
    cardBackgroundColor: data.cardBackgroundColor as string | undefined,
    borderColor: data.borderColor as string | undefined,
    invitationHeadline: data.invitationHeadline as string | undefined,
    invitationSubtitle: data.invitationSubtitle as string | undefined,
    invitationNote: data.invitationNote as string | undefined,
    primaryActionLabel: data.primaryActionLabel as string | undefined,
    secondaryActionLabel: data.secondaryActionLabel as string | undefined,
    maxGuestsTotal: typeof data.maxGuestsTotal === 'number' ? data.maxGuestsTotal : undefined,
    coverIcon: data.coverIcon as EventItem['coverIcon'],
    createdAt: String(data.createdAt ?? new Date().toISOString()),
  };
}

export async function listEvents(): Promise<EventItem[]> {
  if (!db) {
    const events = getLocalEvents().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return localDb.delay(events);
  }

  try {
    const snapshot = await getDocs(query(collection(db, KEY), orderBy('createdAt', 'desc')));
    return snapshot.docs.map((snap) => mapEventData(snap.id, snap.data()));
  } catch {
    const events = getLocalEvents().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return localDb.delay(events);
  }
}

export async function getEvent(id: string): Promise<EventItem | undefined> {
  if (!db) {
    const event = getLocalEvents().find((e) => e.id === id);
    return localDb.delay(event);
  }

  try {
    const snapshot = await getDoc(doc(db, KEY, id));
    if (!snapshot.exists()) return undefined;
    return mapEventData(snapshot.id, snapshot.data());
  } catch {
    const event = getLocalEvents().find((e) => e.id === id);
    return localDb.delay(event);
  }
}

export async function createEvent(input: Omit<EventItem, 'id' | 'createdAt'>): Promise<EventItem> {
  const event: EventItem = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  if (!db) {
    const events = getLocalEvents();
    events.push(event);
    saveLocalEvents(events);
    return localDb.delay(event);
  }

  try {
    await setDoc(doc(db, KEY, event.id), stripUndefined({
      ...input,
      createdAt: event.createdAt,
    }));
    return event;
  } catch {
    const events = getLocalEvents();
    events.push(event);
    saveLocalEvents(events);
    return localDb.delay(event);
  }
}

export async function updateEvent(id: string, patch: Partial<Omit<EventItem, 'id' | 'createdAt'>>): Promise<EventItem | undefined> {
  if (!db) {
    const events = getLocalEvents();
    const idx = events.findIndex((e) => e.id === id);
    if (idx === -1) return undefined;
    events[idx] = { ...events[idx], ...patch };
    saveLocalEvents(events);
    return localDb.delay(events[idx]);
  }

  const ref = doc(db, KEY, id);
  try {
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) return undefined;

    const normalizedPatch = Object.fromEntries(
      Object.entries(patch).map(([key, value]) => [key, value === undefined ? deleteField() : value]),
    );
    await updateDoc(ref, normalizedPatch);
    const updated = await getDoc(ref);
    if (!updated.exists()) return undefined;
    return mapEventData(updated.id, updated.data());
  } catch {
    const events = getLocalEvents();
    const idx = events.findIndex((e) => e.id === id);
    if (idx === -1) return undefined;
    events[idx] = { ...events[idx], ...patch };
    saveLocalEvents(events);
    return localDb.delay(events[idx]);
  }
}

export async function deleteEvent(id: string): Promise<void> {
  if (!db) {
    const events = getLocalEvents().filter((e) => e.id !== id);
    saveLocalEvents(events);
    return localDb.delay(undefined);
  }

  try {
    await deleteDoc(doc(db, KEY, id));
  } catch {
    const events = getLocalEvents().filter((e) => e.id !== id);
    saveLocalEvents(events);
    await localDb.delay(undefined);
  }
}
