import { useCallback, useEffect, useState } from 'react';
import type { EventItem } from '../types';
import * as eventService from '../services/eventService';

export function useEvents() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await eventService.listEvents();
    setEvents(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { events, loading, refresh };
}
