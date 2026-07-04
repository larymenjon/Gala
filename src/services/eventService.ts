import { collection, deleteDoc, deleteField, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import type { EventItem } from '../types';
import { auth, db } from './firebase';
import { localDb } from './storage';

const KEY = 'events';

function getLocalEvents(): EventItem[] {
  return localDb.read<EventItem[]>(KEY, []);
}

function saveLocalEvents(events: EventItem[]): void {
  localDb.write(KEY, events);
}

async function syncLocalEventsToFirestore(ownerId?: string): Promise<void> {
  const firestoreDb = db;
  if (!firestoreDb || !ownerId) return;

  const localEvents = getLocalEvents();
  if (localEvents.length === 0) return;

  const remoteSnapshot = await getDocs(query(collection(firestoreDb, KEY), where('ownerId', '==', ownerId)));
  const remoteIds = new Set(remoteSnapshot.docs.map((snap) => snap.id));
  const missingEvents = localEvents.filter((event) => !remoteIds.has(event.id));

  if (missingEvents.length === 0) return;

  await Promise.all(
    missingEvents.map((event) =>
      setDoc(
        doc(firestoreDb, KEY, event.id),
        stripUndefined({
          ...event,
          ownerId,
        }),
      ),
    ),
  );
}

function stripUndefined<T extends Record<string, unknown>>(input: T): Partial<T> {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined)) as Partial<T>;
}

function mapEventData(id: string, data: Record<string, unknown>): EventItem {
  return {
    id,
    ownerId: data.ownerId as string | undefined,
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
    const ownerId = auth?.currentUser?.uid;
    await syncLocalEventsToFirestore(ownerId);
    const firestoreQuery = ownerId
      ? query(collection(db, KEY), where('ownerId', '==', ownerId))
      : query(collection(db, KEY));
    const snapshot = await getDocs(firestoreQuery);
    const firestoreEvents = snapshot.docs
      .map((snap) => mapEventData(snap.id, snap.data()))
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    const localEvents = getLocalEvents();
    const remoteIds = new Set(firestoreEvents.map((event) => event.id));
    const mergedEvents = [...firestoreEvents, ...localEvents.filter((event) => !remoteIds.has(event.id))].sort(
      (a, b) => (a.createdAt < b.createdAt ? 1 : -1),
    );
    return mergedEvents;
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
    const firestoreDb = db;
    const snapshot = await getDoc(doc(firestoreDb, KEY, id));
    if (!snapshot.exists()) {
      const localEvent = getLocalEvents().find((e) => e.id === id);
      if (localEvent && auth?.currentUser?.uid && firestoreDb) {
        await setDoc(doc(firestoreDb, KEY, localEvent.id), stripUndefined({ ...localEvent, ownerId: auth.currentUser.uid }));
      }
      return localDb.delay(localEvent);
    }
    const event = mapEventData(snapshot.id, snapshot.data());
    return event;
  } catch {
    const event = getLocalEvents().find((e) => e.id === id);
    return localDb.delay(event);
  }
}

export async function createEvent(input: Omit<EventItem, 'id' | 'createdAt'>): Promise<EventItem> {
  const ownerId = auth?.currentUser?.uid;
  const event: EventItem = {
    ...input,
    ownerId,
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
    if (!ownerId) {
      const events = getLocalEvents();
      events.push(event);
      saveLocalEvents(events);
      return localDb.delay(event);
    }
    await setDoc(doc(db, KEY, event.id), stripUndefined({
      ...input,
      ownerId,
      createdAt: event.createdAt,
    }));
    const events = getLocalEvents();
    events.push(event);
    saveLocalEvents(events);
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
    const ownerId = auth?.currentUser?.uid;
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) return undefined;
    if (ownerId && snapshot.data()?.ownerId && snapshot.data().ownerId !== ownerId) return undefined;

    const normalizedPatch = Object.fromEntries(
      Object.entries(patch).map(([key, value]) => [key, value === undefined ? deleteField() : value]),
    );
    await updateDoc(ref, normalizedPatch);
    const updated = await getDoc(ref);
    if (!updated.exists()) return undefined;
    const mapped = mapEventData(updated.id, updated.data());
    const events = getLocalEvents();
    const idx = events.findIndex((e) => e.id === id);
    if (idx !== -1) {
      events[idx] = mapped;
      saveLocalEvents(events);
    }
    return mapped;
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
    const ref = doc(db, KEY, id);
    const snapshot = await getDoc(ref);
    const ownerId = auth?.currentUser?.uid;
    if (snapshot.exists() && ownerId && snapshot.data()?.ownerId && snapshot.data().ownerId !== ownerId) return;
    await deleteDoc(ref);
    const events = getLocalEvents().filter((e) => e.id !== id);
    saveLocalEvents(events);
  } catch {
    const events = getLocalEvents().filter((e) => e.id !== id);
    saveLocalEvents(events);
    await localDb.delay(undefined);
  }
}
