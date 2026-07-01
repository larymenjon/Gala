import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CalendarDays, Clock3, MailX, MapPin, SearchX, PartyPopper } from 'lucide-react';
import type { EventItem, Guest } from '../types';
import * as guestService from '../services/guestService';
import * as eventService from '../services/eventService';
import { formatDate } from '../utils/format';
import { Field, Input } from '../components/FormFields';
import BrandMark from '../components/BrandMark';
import { getEventIcon } from '../utils/eventIcons';

type Screen = 'loading' | 'not_found' | 'form' | 'success';

export default function PublicRsvpPage() {
  const { slug } = useParams<{ slug: string }>();
  const [screen, setScreen] = useState<Screen>('loading');
  const [guest, setGuest] = useState<Guest | null>(null);
  const [event, setEvent] = useState<EventItem | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [people, setPeople] = useState('1');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState<'confirmado' | 'recusado' | null>(null);

  useEffect(() => {
    async function load() {
      if (!slug) { setScreen('not_found'); return; }
      const g = await guestService.getGuestBySlug(slug);
      if (!g) { setScreen('not_found'); return; }
      const ev = await eventService.getEvent(g.eventId);
      setGuest(g);
      setEvent(ev ?? null);
      setName(g.responsibleName);
      setPeople(g.status === 'confirmado' ? String(g.confirmedPeople) : String(g.expectedPeople));
      setScreen(g.status !== 'pendente' ? 'success' : 'form');
      setConfirmed(g.status !== 'pendente' ? g.status as 'confirmado' | 'recusado' : null);
    }
    load();
  }, [slug]);

  async function handleSubmit(status: 'confirmado' | 'recusado') {
    if (!slug) return;
    if (status === 'confirmado' && (!people || Number(people) < 1)) {
      setError('Informe quantas pessoas irão.');
      return;
    }
    setSubmitting(true);
    setError('');
    const result = await guestService.submitRsvp(slug, {
      responsibleName: name,
      confirmedPeople: Number(people),
      status,
    });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error ?? 'Ocorreu um erro. Tente novamente.');
      return;
    }
    setGuest(result.guest ?? null);
    setConfirmed(status);
    setScreen('success');
  }

  // ── Loading ──────────────────────────────────────────────────
  if (screen === 'loading') {
    return (
      <PublicShell>
        <div className="py-20 text-center text-cream/40 text-sm">Carregando seu convite...</div>
      </PublicShell>
    );
  }

  // ── Not found ────────────────────────────────────────────────
  if (screen === 'not_found') {
    return (
      <PublicShell>
        <div className="max-w-sm mx-auto text-center py-16">
          <SearchX className="h-12 w-12 mx-auto text-gold/80 mb-5" />
          <h2 className="font-display text-2xl text-cream mb-3">Convite não encontrado</h2>
          <p className="text-cream/50 text-sm">Verifique se o link está correto ou entre em contato com o organizador do evento.</p>
        </div>
      </PublicShell>
    );
  }

  // ── Success / already responded ──────────────────────────────
  if (screen === 'success') {
    const isConfirmed = confirmed === 'confirmado';
    return (
      <PublicShell event={event ?? undefined}>
        <div className="max-w-md mx-auto text-center py-8 animate-[fadeIn_0.4s_ease-out]">
          <div className="mb-6 flex justify-center">
            {isConfirmed ? (
              <PartyPopper className="h-14 w-14 text-gold" />
            ) : (
              <MailX className="h-14 w-14 text-gold" />
            )}
          </div>
          <h2 className="font-display text-3xl text-cream mb-3">
            {isConfirmed ? 'Presença confirmada!' : 'Recebemos sua resposta'}
          </h2>
          <p className="text-cream/60 text-sm mb-8 leading-relaxed">
            {isConfirmed
              ? `Que ótima notícia, ${guest?.responsibleName?.split(' ')[0]}! Estamos ansiosos para receber ${guest?.confirmedPeople === 1 ? 'você' : `você e mais ${(guest?.confirmedPeople ?? 1) - 1} pessoa(s)`}.`
              : `Sentiremos sua falta, ${guest?.responsibleName?.split(' ')[0]}. Obrigado por nos avisar!`}
          </p>

          {/* Allow editing if already confirmed */}
          {isConfirmed && (
            <button
              onClick={() => { setScreen('form'); setError(''); }}
              className="text-cream/40 text-xs hover:text-cream/60 transition-colors underline underline-offset-2"
            >
              Precisa alterar a quantidade de pessoas? Clique aqui.
            </button>
          )}
        </div>
      </PublicShell>
    );
  }

  // ── RSVP form ────────────────────────────────────────────────
  return (
    <PublicShell event={event ?? undefined}>
      <div className="max-w-md mx-auto py-6">
        {event?.welcomeMessage && (
          <p className="text-cream/60 text-sm leading-relaxed mb-8 text-center">{event.welcomeMessage}</p>
        )}

        <div className="bg-white/8 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-5">
          <Field label={<span className="text-cream/80">Seu nome</span> as unknown as string}>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Como preferir ser chamado(a)"
              className="bg-white/10 border-white/15 text-cream placeholder:text-cream/25 focus:border-gold focus:ring-gold"
            />
          </Field>

          <Field
            label={<span className="text-cream/80">Quantas pessoas da sua casa irão?</span> as unknown as string}
            hint={`Esse convite contempla até ${guest?.expectedPeople} pessoa(s).`}
          >
            <Input
              type="number"
              min={1}
              max={guest?.expectedPeople}
              value={people}
              onChange={(e) => setPeople(e.target.value)}
              className="bg-white/10 border-white/15 text-cream placeholder:text-cream/25 focus:border-gold focus:ring-gold"
            />
          </Field>

          {error && (
            <p className="text-sm text-rose bg-rose/10 border border-rose/20 rounded-lg px-4 py-2.5">{error}</p>
          )}

          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={() => handleSubmit('confirmado')}
              disabled={submitting}
              className="w-full py-3.5 rounded-xl bg-gold text-ink font-semibold text-sm hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Confirmando...' : '✓ Confirmar presença'}
            </button>
            <button
              onClick={() => handleSubmit('recusado')}
              disabled={submitting}
              className="w-full py-3 rounded-xl border border-white/15 text-cream/60 text-sm hover:text-cream hover:border-white/30 transition-colors disabled:opacity-50"
            >
              Não poderei ir
            </button>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}

// ── Shell shared by all public screens ───────────────────────
function PublicShell({ event, children }: { event?: EventItem; children: React.ReactNode }) {
  const EventIcon = getEventIcon(event?.coverIcon);

  return (
    <div className="min-h-screen bg-ink bg-noise flex flex-col">
      {/* Decorative gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gold/5 rounded-full blur-3xl" />
      </div>

      <div className="relative flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="mb-10 text-center animate-[fadeIn_0.35s_ease-out]">
          <BrandMark
            size={72}
            className="justify-center"
            iconClassName="rounded-[22px] shadow-[0_18px_45px_rgba(0,0,0,0.35)]"
            labelClassName="text-cream"
            subtitleClassName="text-gold/80"
          />
        </div>

        {/* Header card */}
        {event && (
          <div className="w-full max-w-md mb-6 text-center animate-[fadeIn_0.3s_ease-out]">
            <div className="h-14 w-14 rounded-2xl bg-gold/10 text-gold mx-auto mb-4 flex items-center justify-center">
              <EventIcon className="h-7 w-7" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl text-cream mb-3 leading-tight">{event.name}</h1>
            <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-cream/50">
              <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" />{formatDate(event.date)}</span>
              <span className="text-cream/25">•</span>
              <span className="inline-flex items-center gap-1.5"><Clock3 className="h-4 w-4" />{event.time}</span>
              <span className="text-cream/25">•</span>
              <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" />{event.location}</span>
            </div>
            {event.description && (
              <p className="text-cream/40 text-xs mt-3 leading-relaxed max-w-sm mx-auto">{event.description}</p>
            )}
          </div>
        )}

        {/* Page content */}
        <div className="w-full max-w-md">{children}</div>
      </div>

      <footer className="relative text-center text-cream/20 text-xs py-5">
        Powered by <span className="font-display">Gala</span>
      </footer>
    </div>
  );
}
