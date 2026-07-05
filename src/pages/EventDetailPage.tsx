import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import Button from '../components/Button';
import MetricCard from '../components/MetricCard';
import StatusDonutChart from '../components/StatusDonutChart';
import GuestTable from '../components/GuestTable';
import GuestFormModal from '../components/GuestFormModal';
import EventFormModal from '../components/EventFormModal';
import ConfirmDialog from '../components/ConfirmDialog';
import CopyLinkButton from '../components/CopyLinkButton';
import { useEventDetail } from '../hooks/useEventDetail';
import type { EventItem, Guest } from '../types';
import * as eventService from '../services/eventService';
import * as guestService from '../services/guestService';
import { exportGuestsToCsv, exportGuestsToPdf } from '../utils/exporters';
import { formatCountdownLabel, formatDate } from '../utils/format';
import { getEventIcon } from '../utils/eventIcons';
import { publicEventUrl } from '../utils/slug';

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { event, guests, metrics, loading, refresh } = useEventDetail(id);
  const [showAddGuest, setShowAddGuest] = useState(false);
  const [showEditEvent, setShowEditEvent] = useState(false);
  const [toDelete, setToDelete] = useState<Guest | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const shareUrl = event ? publicEventUrl(event.id) : '';
  const countdownLabel = formatCountdownLabel(event?.date);

  async function handleAddGuest(data: { responsibleName: string; phone: string; expectedPeople: number }) {
    if (!id) return;
    await guestService.createGuest({ eventId: id, ...data });
    refresh();
  }

  async function handleUpdateEvent(data: Omit<EventItem, 'id' | 'createdAt'>) {
    if (!id) return;
    await eventService.updateEvent(id, data);
    refresh();
  }

  async function handleDeleteGuest() {
    if (!toDelete) return;
    setDeleteError('');
    try {
      await guestService.deleteGuest(toDelete.id);
      setToDelete(null);
      await refresh();
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Não foi possível remover o convidado.');
    }
  }

  if (loading) {
    return (
      <AdminLayout title="Carregando..." breadcrumb={<Link to="/admin">Eventos</Link>}>
        <div className="py-20 text-center text-sm text-ink/40">Carregando dados do evento...</div>
      </AdminLayout>
    );
  }

  if (!event) {
    return (
      <AdminLayout title="Evento não encontrado" breadcrumb={<Link to="/admin">Eventos</Link>}>
        <p className="text-sm text-ink/60">O evento que você procura não existe ou foi removido.</p>
        <Link to="/admin" className="mt-4 inline-block text-sm font-medium underline underline-offset-2">Voltar para eventos</Link>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={event.name}
      breadcrumb={<Link to="/admin" className="hover:text-ink transition-colors">Eventos</Link>}
    >
      {/* Event info bar */}
      <div className="bg-white rounded-2xl border border-ink/8 shadow-soft px-6 py-4 mb-6 flex flex-wrap items-center gap-4 justify-between">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="h-12 w-12 rounded-2xl bg-gold/10 text-gold-dark flex items-center justify-center">
            {(() => {
              const Icon = getEventIcon(event.coverIcon);
              return <Icon className="h-6 w-6" />;
            })()}
          </div>
          <div>
            <p className="text-sm text-ink/50">{formatDate(event.date)} às {event.time}</p>
            <p className="text-sm text-ink/70">{event.location}</p>
          </div>
          {countdownLabel && (
            <span className="text-xs bg-amber-50 text-amber-900 font-medium px-2.5 py-1 rounded-full border border-amber-200">
              {countdownLabel}
            </span>
          )}
          {event.maxGuestsTotal && (
            <span className="text-xs bg-gold/10 text-gold-dark font-medium px-2.5 py-1 rounded-full">
              Limite: {event.maxGuestsTotal} pessoas
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {shareUrl && (
            <div className="flex items-center gap-2 rounded-xl border border-ink/10 bg-ink/[0.02] px-3 py-2">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.22em] text-ink/40">Link do convite</p>
                <p className="max-w-[240px] truncate text-xs text-ink/65">{shareUrl}</p>
              </div>
              <CopyLinkButton url={shareUrl} label="Copiar" />
            </div>
          )}
          <Button variant="secondary" size="sm" onClick={() => setShowEditEvent(true)}>Editar evento</Button>
        </div>
      </div>

      {/* Metrics */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <MetricCard label="Convites" value={metrics.totalInvites} />
          <MetricCard label="Confirmados" value={metrics.totalConfirmations} accent="sage" />
          <MetricCard label="Pessoas confirmadas" value={metrics.totalConfirmedPeople} accent="sage" />
          <MetricCard label="Pendentes" value={metrics.totalPending} accent="gold" />
          <MetricCard label="Recusados" value={metrics.totalDeclined} accent="rose" />
          <MetricCard label="Previsto total" value={metrics.totalExpectedPeople} />
          <MetricCard label="Taxa de resposta" value={metrics.confirmationRate} suffix="%" />
          <div className="col-span-1">
            <StatusDonutChart metrics={metrics} />
          </div>
        </div>
      )}

      {/* Guests section */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-medium">Convidados</h2>
        <div className="flex gap-2">
          {guests.length > 0 && (
            <>
              <Button variant="secondary" size="sm" onClick={() => exportGuestsToCsv(event, guests)}>
                Exportar CSV
              </Button>
              <Button variant="secondary" size="sm" onClick={() => exportGuestsToPdf(event, guests)}>
                Exportar PDF
              </Button>
            </>
          )}
          <Button size="sm" onClick={() => setShowAddGuest(true)}>+ Convidado</Button>
        </div>
      </div>

      <GuestTable guests={guests} onDelete={(g) => setToDelete(g)} />

      {/* Modals */}
      <GuestFormModal open={showAddGuest} onClose={() => setShowAddGuest(false)} onSubmit={handleAddGuest} />
      <EventFormModal open={showEditEvent} onClose={() => setShowEditEvent(false)} onSubmit={handleUpdateEvent} initial={event} />
      <ConfirmDialog
        open={!!toDelete}
        title="Remover convidado"
        message={`Tem certeza que deseja remover "${toDelete?.responsibleName}" do evento? Esta ação não pode ser desfeita.`}
        confirmLabel="Remover"
        danger
        onConfirm={handleDeleteGuest}
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
