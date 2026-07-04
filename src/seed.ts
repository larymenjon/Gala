/**
 * Dados de demonstração para facilitar a primeira execução do app.
 */

import type { EventItem, Guest } from './types';
import { generateSlug } from './utils/slug';
import { isFirebaseConfigured } from './services/firebase';

const NS = 'gala_system_v1';
const DEMO_EVENT_ID = 'demo-event-001';
const DEMO_GUEST_PREFIX = 'demo-guest-00';

function stored(key: string) {
  return localStorage.getItem(`${NS}:${key}`);
}

export function seedDemoData() {
  if (isFirebaseConfigured) return;
  if (stored('events')) return;

  const eventId = 'demo-event-001';
  const now = new Date().toISOString();

  const event: EventItem = {
    id: eventId,
    name: 'Casamento de Ana & Pedro',
    date: '2025-11-15',
    time: '19:00',
    location: 'Espaço Jardim das Flores, São Paulo - SP',
    description: 'Cerimônia às 19h, seguida de jantar e festa. Traje passeio completo.',
    welcomeMessage: 'Que alegria ter você com a gente nesse momento tão especial! Confirme sua presença abaixo.',
    maxGuestsTotal: 200,
    coverIcon: 'heart',
    createdAt: now,
  };

  const guestsRaw: Omit<Guest, 'id' | 'slug' | 'createdAt'>[] = [
    { eventId, responsibleName: 'Convidado Demo 1', phone: '(11) 90000-0001', expectedPeople: 2, confirmedPeople: 2, status: 'confirmado', respondedAt: now },
    { eventId, responsibleName: 'Convidado Demo 2', phone: '(11) 90000-0002', expectedPeople: 4, confirmedPeople: 3, status: 'confirmado', respondedAt: now },
    { eventId, responsibleName: 'Convidado Demo 3', phone: '(21) 90000-0003', expectedPeople: 2, confirmedPeople: 0, status: 'recusado', respondedAt: now },
    { eventId, responsibleName: 'Convidado Demo 4', phone: '(11) 90000-0004', expectedPeople: 3, confirmedPeople: 0, status: 'pendente' },
    { eventId, responsibleName: 'Convidado Demo 5', phone: '(31) 90000-0005', expectedPeople: 2, confirmedPeople: 0, status: 'pendente' },
    { eventId, responsibleName: 'Convidado Demo 6', phone: '(11) 90000-0006', expectedPeople: 1, confirmedPeople: 1, status: 'confirmado', respondedAt: now },
  ];

  const guests: Guest[] = guestsRaw.map((g, i) => ({
    ...g,
    id: `demo-guest-00${i + 1}`,
    slug: generateSlug(),
    createdAt: now,
  }));

  localStorage.setItem(`${NS}:events`, JSON.stringify([event]));
  localStorage.setItem(`${NS}:guests`, JSON.stringify(guests));
}

export function clearDemoData() {
  try {
    const eventsRaw = localStorage.getItem(`${NS}:events`);
    const guestsRaw = localStorage.getItem(`${NS}:guests`);

    if (eventsRaw) {
      const events = JSON.parse(eventsRaw) as EventItem[];
      const filteredEvents = events.filter((event) => event.id !== DEMO_EVENT_ID);
      localStorage.setItem(`${NS}:events`, JSON.stringify(filteredEvents));
    }

    if (guestsRaw) {
      const guests = JSON.parse(guestsRaw) as Guest[];
      const filteredGuests = guests.filter((guest) => guest.eventId !== DEMO_EVENT_ID && !guest.id.startsWith(DEMO_GUEST_PREFIX));
      localStorage.setItem(`${NS}:guests`, JSON.stringify(filteredGuests));
    }
  } catch {
    // Ignora erros de parse e deixa o app seguir normalmente.
  }
}
