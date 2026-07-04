import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { useEvents } from '../hooks/useEvents';
import AdminLayout from '../components/AdminLayout';
import Button from '../components/Button';
import EventFormModal from '../components/EventFormModal';
import ConfirmDialog from '../components/ConfirmDialog';
import type { EventItem } from '../types';
import * as eventService from '../services/eventService';
import * as guestService from '../services/guestService';
import { formatDate } from '../utils/format';
import { getEventIcon } from '../utils/eventIcons';

export default function EventsPage() {
  const { events, loading, refresh } = useEvents();
  const [showCreate, setShowCreate] = useState(false);
  const [toDelete, setToDelete] = useState<EventItem | null>(null);
  const [deleteError, setDeleteError] = useState('');

  async function handleCreate(data: Omit<EventItem, 'id' | 'createdAt'>) {
    await eventService.createEvent(data);
    refresh();
  }

  async function handleDelete() {
    if (!toDelete) return;
    setDeleteError('');
    try {
      const guests = await guestService.listGuestsByEvent(toDelete.id);
      await Promise.allSettled(guests.map((g) => guestService.deleteGuest(g.id)));
      await eventService.deleteEvent(toDelete.id);
      await refresh();
      setToDelete(null);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Não foi possível remover o evento.');
    }
  }

  return (
    <AdminLayout
      title="Eventos"
      description="Gerencie eventos e os convidados ligados a cada um deles."
      actions={<Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowCreate(true)}>Novo evento</Button>}
    >
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-ink/50">{events.length} evento{events.length !== 1 ? 's' : ''} cadastrado{events.length !== 1 ? 's' : ''}</p>
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowCreate(true)}>Novo evento</Button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-sm text-ink/40">Carregando eventos...</div>
      ) : events.length === 0 ? (
        <div className="py-20 text-center max-w-lg mx-auto">
          <CalendarDays className="h-12 w-12 mx-auto text-ink/25 mb-4" />
          <p className="font-display text-xl mb-2">Nenhum evento ainda</p>
          <p className="text-sm text-ink/50 mb-6">Crie seu primeiro evento para começar a gerenciar confirmações de presença.</p>
          <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowCreate(true)}>Criar primeiro evento</Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {events.map((ev) => (
            <EventCard key={ev.id} event={ev} onDelete={() => setToDelete(ev)} />
          ))}
        </div>
      )}

      <EventFormModal open={showCreate} onClose={() => setShowCreate(false)} onSubmit={handleCreate} />
      <ConfirmDialog
        open={!!toDelete}
        title="Remover evento"
        message={`Tem certeza que deseja remover "${toDelete?.name}"? Todos os convidados cadastrados também serão excluídos. Esta ação não pode ser desfeita.`}
        confirmLabel="Remover"
        danger
        onConfirm={handleDelete}
        onClose={() => {
          setToDelete(null);
          setDeleteError('');
        }}
      />
      {deleteError && (
        <div className="fixed bottom-4 right-4 max-w-sm rounded-xl border border-rose/20 bg-white px-4 py-3 text-sm text-rose shadow-card">
          {deleteError}
        </div>
      )}
    </AdminLayout>
  );
}

function EventCard({ event, onDelete }: { event: EventItem; onDelete: () => void }) {
  const Icon = getEventIcon(event.coverIcon);
  return (
    <div className="group bg-white rounded-2xl border border-ink/8 shadow-soft hover:shadow-card transition-shadow">
      <Link to={`/admin/eventos/${event.id}`} className="block p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="h-12 w-12 rounded-2xl bg-ink/5 flex items-center justify-center text-gold-dark">
            <Icon className="h-6 w-6" />
          </div>
          <span className="text-xs text-ink/35">{formatDate(event.date)}</span>
        </div>
        <h2 className="font-display text-lg font-medium mb-1 leading-tight">{event.name}</h2>
        <p className="text-sm text-ink/50 truncate">{event.location}</p>
        {event.maxGuestsTotal && (
          <p className="text-xs text-gold-dark mt-2">Limite: {event.maxGuestsTotal} convidados</p>
        )}
      </Link>
      <div className="px-5 pb-5 flex gap-2">
        <Link to={`/admin/eventos/${event.id}`} className="flex-1 inline-flex items-center justify-center gap-2 text-xs font-medium rounded-xl border border-ink/10 px-3 py-2.5 hover:border-ink/25 transition-colors">
          Gerenciar
          <ChevronRight className="h-4 w-4" />
        </Link>
        <button onClick={onDelete} className="inline-flex items-center justify-center rounded-xl border border-ink/10 px-3 py-2.5 text-ink/35 hover:text-rose hover:border-rose/20 transition-colors">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
