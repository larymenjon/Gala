import { useEffect, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight, CalendarDays, Clock3, FileSpreadsheet, ListChecks, Plus, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import Button from '../components/Button';
import EventFormModal from '../components/EventFormModal';
import { useEvents } from '../hooks/useEvents';
import * as guestService from '../services/guestService';
import * as eventService from '../services/eventService';
import { formatDateShort, formatDateTime } from '../utils/format';

export default function DashboardPage() {
  const { events, loading, refresh } = useEvents();
  const [showCreate, setShowCreate] = useState(false);
  const [guestCount, setGuestCount] = useState(0);
  const [confirmedCount, setConfirmedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const allGuests = await guestService.listAllGuests();
      if (!mounted) return;
      setGuestCount(allGuests.length);
      setConfirmedCount(allGuests.filter((g) => g.status === 'confirmado').length);
      setPendingCount(allGuests.filter((g) => g.status === 'pendente').length);
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const recentEvents = events.slice(0, 3);

  async function handleCreate(data: Parameters<typeof eventService.createEvent>[0]) {
    await eventService.createEvent(data);
    setShowCreate(false);
    refresh();
  }

  return (
    <AdminLayout
      title="Início"
      description="Resumo rápido do que está acontecendo no Gala."
      actions={(
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => setShowCreate(true)} icon={<Plus className="h-4 w-4" />}>
            Criar convite
          </Button>
          <Link
            to="/admin/importar"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-cream shadow-soft transition-colors hover:bg-ink-light"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Importar lista
          </Link>
        </div>
      )}
    >
      {loading ? (
        <div className="py-20 text-center text-sm text-ink/40">Carregando visão geral...</div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard label="Listas ativas" value={events.length} icon={ListChecks} />
            <SummaryCard label="Convidados" value={guestCount} icon={Users} />
            <SummaryCard label="Confirmados" value={confirmedCount} icon={CalendarDays} />
            <SummaryCard label="Pendentes" value={pendingCount} icon={Clock3} />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
            <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-soft">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-lg font-medium">Acesso rápido</h2>
                  <p className="text-sm text-ink/50">Atalhos para as ações mais usadas.</p>
                </div>
                <TrendingUp className="h-5 w-5 text-gold-dark" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <QuickAction onClick={() => setShowCreate(true)} title="Criar convite" desc="Personalizar e publicar um novo convite" />
                <QuickAction to="/admin/listas" title="Gerenciar listas" desc="Abrir eventos e convidados" />
                <QuickAction to="/admin/importar" title="Importar planilha" desc="Adicionar convidados em lote" />
                <QuickAction to="/admin/relatorios" title="Ver relatórios" desc="Acompanhar métricas gerais" />
                <QuickAction to="/admin/conta" title="Minha conta" desc="Dados pessoais e segurança" />
              </div>
            </section>

            <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-soft">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-lg font-medium">Listas recentes</h2>
                  <p className="text-sm text-ink/50">Os últimos eventos criados.</p>
                </div>
                <CalendarDays className="h-5 w-5 text-gold-dark" />
              </div>

              <div className="space-y-3">
                {recentEvents.length === 0 ? (
                  <p className="py-6 text-sm text-ink/45">Ainda não há listas cadastradas.</p>
                ) : (
                  recentEvents.map((event) => (
                    <Link
                      key={event.id}
                      to={`/admin/eventos/${event.id}`}
                      className="flex items-center justify-between gap-3 rounded-xl border border-ink/8 px-4 py-3 transition-colors hover:border-ink/20 hover:bg-ink/[0.02]"
                    >
                      <div>
                        <p className="font-medium text-ink">{event.name}</p>
                        <p className="text-xs text-ink/45">
                          {formatDateShort(event.date)} · {event.time}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-ink/30" />
                    </Link>
                  ))
                )}
              </div>
            </section>
          </div>

          <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-soft">
            <h2 className="mb-4 font-display text-lg font-medium">Atividade recente</h2>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {events.slice(0, 6).map((event) => (
                <Link
                  key={event.id}
                  to={`/admin/eventos/${event.id}`}
                  className="rounded-xl border border-ink/8 px-4 py-3 transition-colors hover:border-ink/20 hover:bg-ink/[0.02]"
                >
                  <p className="font-medium text-ink">{event.name}</p>
                  <p className="mt-1 text-xs text-ink/45">{formatDateTime(event.createdAt)}</p>
                </Link>
              ))}
            </div>
          </section>
        </div>
      )}

      <EventFormModal open={showCreate} onClose={() => setShowCreate(false)} onSubmit={handleCreate} />
    </AdminLayout>
  );
}

function SummaryCard({ label, value, icon: Icon }: { label: string; value: number; icon: LucideIcon }) {
  return (
    <div className="rounded-2xl border border-ink/8 bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink/45">{label}</p>
          <p className="mt-2 font-display text-3xl text-ink">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold/10 text-gold-dark">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function QuickAction(props: { to?: string; onClick?: () => void; title: string; desc: string }) {
  const className = 'rounded-xl border border-ink/8 px-4 py-4 text-left transition-colors hover:border-gold/30 hover:bg-gold/5';

  if (props.to) {
    return (
      <Link to={props.to} className={className}>
        <p className="font-medium text-ink">{props.title}</p>
        <p className="mt-1 text-sm text-ink/50">{props.desc}</p>
      </Link>
    );
  }

  return (
    <button type="button" onClick={props.onClick} className={className}>
      <p className="font-medium text-ink">{props.title}</p>
      <p className="mt-1 text-sm text-ink/50">{props.desc}</p>
    </button>
  );
}
