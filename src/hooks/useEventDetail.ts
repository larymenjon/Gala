import { useCallback, useEffect, useState } from 'react';
import type { EventItem, EventMetrics, Guest } from '../types';
import * as eventService from '../services/eventService';
import * as guestService from '../services/guestService';

export function useEventDetail(eventId: string | undefined) {
  const [event, setEvent] = useState<EventItem | undefined>(undefined);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [metrics, setMetrics] = useState<EventMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!eventId) return;
    setLoading(true);
    const [ev, gs, m] = await Promise.all([
      eventService.getEvent(eventId),
      guestService.listGuestsByEvent(eventId),
      guestService.getEventMetrics(eventId),
    ]);
    setEvent(ev);
    setGuests(gs);
    setMetrics(m);
    setLoading(false);
  }, [eventId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { event, guests, metrics, loading, refresh };
}
