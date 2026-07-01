import type { EventItem } from '../types';
import { localDb } from './storage';

const KEY = 'events';

function getAll(): EventItem[] {
  return localDb.read<EventItem[]>(KEY, []);
}

function saveAll(events: EventItem[]): void {
  localDb.write(KEY, events);
}

export async function listEvents(): Promise<EventItem[]> {
  const events = getAll().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return localDb.delay(events);
}

export async function getEvent(id: string): Promise<EventItem | undefined> {
  const event = getAll().find((e) => e.id === id);
  return localDb.delay(event);
}

export async function createEvent(input: Omit<EventItem, 'id' | 'createdAt'>): Promise<EventItem> {
  const event: EventItem = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  const events = getAll();
  events.push(event);
  saveAll(events);
  return localDb.delay(event);
}

export async function updateEvent(id: string, patch: Partial<Omit<EventItem, 'id' | 'createdAt'>>): Promise<EventItem | undefined> {
  const events = getAll();
  const idx = events.findIndex((e) => e.id === id);
  if (idx === -1) return undefined;
  events[idx] = { ...events[idx], ...patch };
  saveAll(events);
  return localDb.delay(events[idx]);
}

export async function deleteEvent(id: string): Promise<void> {
  const events = getAll().filter((e) => e.id !== id);
  saveAll(events);
  return localDb.delay(undefined);
}
