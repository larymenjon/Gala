import { useEffect, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { BarChart3, Download, FileText, PieChart, Users } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import Button from '../components/Button';
import { useEvents } from '../hooks/useEvents';
import * as guestService from '../services/guestService';
import * as eventService from '../services/eventService';
import { exportGuestsToCsv, exportGuestsToPdf } from '../utils/exporters';
import { formatDateShort } from '../utils/format';

export default function ReportsPage() {
  const { events, loading } = useEvents();
  const [allGuests, setAllGuests] = useState<Awaited<ReturnType<typeof guestService.listAllGuests>>>([]);

  useEffect(() => {
    let active = true;
    guestService.listAllGuests().then((guests) => {
      if (active) setAllGuests(guests);
    });
    return () => { active = false; };
  }, []);

  const confirmed = allGuests.filter((guest) => guest.status === 'confirmado');
  const declined = allGuests.filter((guest) => guest.status === 'recusado');
  const pending = allGuests.filter((guest) => guest.status === 'pendente');
  const totalPeople = allGuests.reduce((sum, guest) => sum + guest.expectedPeople, 0);

  return (
    <AdminLayout
      title="Relatórios"
      description="Resumo consolidado das listas, convidados e respostas."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-6">
        <ReportCard label="Convidados" value={allGuests.length} icon={Users} />
        <ReportCard label="Confirmados" value={confirmed.length} icon={PieChart} />
        <ReportCard label="Pendentes" value={pending.length} icon={FileText} />
        <ReportCard label="Total previsto" value={totalPeople} icon={BarChart3} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="bg-white rounded-2xl border border-ink/8 shadow-soft p-5">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="font-display text-lg font-medium">Listas e exportação</h2>
              <p className="text-sm text-ink/50">Baixe cada lista em CSV ou PDF.</p>
            </div>
            <Download className="h-5 w-5 text-gold-dark" />
          </div>

          {loading ? (
            <p className="py-10 text-center text-sm text-ink/40">Carregando relatórios...</p>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <EventReportRow
                  key={event.id}
                  eventId={event.id}
                  title={event.name}
                  subtitle={`${formatDateShort(event.date)} · ${event.time}`}
                />
              ))}
              {events.length === 0 && <p className="py-10 text-center text-sm text-ink/40">Nenhuma lista cadastrada.</p>}
            </div>
          )}
        </section>

        <section className="bg-white rounded-2xl border border-ink/8 shadow-soft p-5">
          <h2 className="font-display text-lg font-medium mb-4">Leitura rápida</h2>
          <div className="space-y-3 text-sm text-ink/60">
            <p>Total de recusas: <strong className="text-ink">{declined.length}</strong></p>
            <p>Confirmados + pendentes mostram o andamento geral da operação.</p>
            <p>Use o menu de listas para incluir novos convidados ou abrir uma lista específica.</p>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}

function ReportCard({ label, value, icon: Icon }: { label: string; value: number; icon: LucideIcon }) {
  return (
    <div className="rounded-2xl border border-ink/8 bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-ink/45 uppercase tracking-wide">{label}</p>
          <p className="mt-2 font-display text-3xl text-ink">{value}</p>
        </div>
        <div className="h-11 w-11 rounded-2xl bg-gold/10 flex items-center justify-center text-gold-dark">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function EventReportRow({ eventId, title, subtitle }: { eventId: string; title: string; subtitle: string }) {
  const [guests, setGuests] = useState<Awaited<ReturnType<typeof guestService.listGuestsByEvent>>>([]);
  const [event, setEvent] = useState<Awaited<ReturnType<typeof eventService.getEvent>>>(undefined);

  useEffect(() => {
    let active = true;
    Promise.all([guestService.listGuestsByEvent(eventId), eventService.getEvent(eventId)]).then(([gs, ev]) => {
      if (!active) return;
      setGuests(gs);
      setEvent(ev);
    });
    return () => { active = false; };
  }, [eventId]);

  const confirmed = guests.filter((guest) => guest.status === 'confirmado').length;

  return (
    <div className="rounded-xl border border-ink/8 px-4 py-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-medium text-ink">{title}</p>
          <p className="text-xs text-ink/45 mt-1">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="rounded-full bg-ink/5 px-2.5 py-1 text-ink/70">{guests.length} convidados</span>
          <span className="rounded-full bg-sage/10 px-2.5 py-1 text-[#4F6650]">{confirmed} confirmados</span>
          <Button variant="secondary" size="sm" icon={<Download className="h-4 w-4" />} onClick={() => event && exportGuestsToCsv(event, guests)}>
            CSV
          </Button>
          <Button variant="secondary" size="sm" icon={<Download className="h-4 w-4" />} onClick={() => event && exportGuestsToPdf(event, guests)}>
            PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
