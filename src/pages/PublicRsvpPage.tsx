import { useEffect, useState, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { CalendarDays, Clock3, MailX, MapPin, SearchX, PartyPopper } from 'lucide-react';
import type { EventItem, Guest } from '../types';
import * as guestService from '../services/guestService';
import * as eventService from '../services/eventService';
import { formatDate } from '../utils/format';
import { Field, Input } from '../components/FormFields';
import BrandMark from '../components/BrandMark';
import { getEventIcon } from '../utils/eventIcons';
import { getInvitationTheme, INVITATION_STYLE_LABELS } from '../utils/invitationTheme';

type Screen = 'loading' | 'not_found' | 'form' | 'success';

export default function PublicRsvpPage() {
  const { slug } = useParams<{ slug: string }>();
  const [screen, setScreen] = useState<Screen>('loading');
  const [guest, setGuest] = useState<Guest | null>(null);
  const [event, setEvent] = useState<EventItem | null>(null);

  const [name, setName] = useState('');
  const [people, setPeople] = useState('1');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState<'confirmado' | 'recusado' | null>(null);

  useEffect(() => {
    async function load() {
      if (!slug) {
        setScreen('not_found');
        return;
      }

      const g = await guestService.getGuestBySlug(slug);
      if (!g) {
        setScreen('not_found');
        return;
      }

      const ev = await eventService.getEvent(g.eventId);
      setGuest(g);
      setEvent(ev ?? null);
      setName(g.responsibleName);
      setPeople(g.status === 'confirmado' ? String(g.confirmedPeople) : String(g.expectedPeople));
      setScreen(g.status !== 'pendente' ? 'success' : 'form');
      setConfirmed(g.status !== 'pendente' ? (g.status as 'confirmado' | 'recusado') : null);
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

    const result = await guestService.submitResponse(slug, {
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

  if (screen === 'loading') {
    return (
      <PublicShell>
        <div className="py-20 text-center text-sm text-cream/40">Carregando seu convite...</div>
      </PublicShell>
    );
  }

  if (screen === 'not_found') {
    return (
      <PublicShell>
        <div className="mx-auto max-w-sm py-16 text-center">
          <SearchX className="mx-auto mb-5 h-12 w-12 text-gold/80" />
          <h2 className="mb-3 font-display text-2xl text-cream">Convite não encontrado</h2>
          <p className="text-sm text-cream/50">Verifique se o link está correto ou entre em contato com o organizador do evento.</p>
        </div>
      </PublicShell>
    );
  }

  if (screen === 'success') {
    const isConfirmed = confirmed === 'confirmado';
    return (
      <PublicShell event={event ?? undefined}>
        <div className="mx-auto max-w-md animate-[fadeIn_0.4s_ease-out] py-8 text-center">
          <div className="mb-6 flex justify-center">
            {isConfirmed ? <PartyPopper className="h-14 w-14 text-gold" /> : <MailX className="h-14 w-14 text-gold" />}
          </div>
          <h2 className="mb-3 font-display text-3xl text-cream">
            {isConfirmed ? 'Presença confirmada!' : 'Recebemos sua resposta'}
          </h2>
          <p className="mb-8 text-sm leading-relaxed text-cream/60">
            {isConfirmed
              ? `Que ótima notícia, ${guest?.responsibleName?.split(' ')[0]}! Estamos ansiosos para receber ${
                  guest?.confirmedPeople === 1 ? 'você' : `você e mais ${(guest?.confirmedPeople ?? 1) - 1} pessoa(s)`
                }.`
              : `Sentiremos sua falta, ${guest?.responsibleName?.split(' ')[0]}. Obrigado por nos avisar!`}
          </p>

          {isConfirmed && (
            <button
              onClick={() => {
                setScreen('form');
                setError('');
              }}
              className="text-xs text-cream/40 underline underline-offset-2 transition-colors hover:text-cream/60"
            >
              Precisa alterar a quantidade de pessoas? Clique aqui.
            </button>
          )}
        </div>
      </PublicShell>
    );
  }

  const theme = getInvitationTheme(event?.invitationStyle);

  return (
    <PublicShell event={event ?? undefined}>
      <div className="mx-auto max-w-md py-6">
        {event?.invitationStyle && (
          <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.34em] text-gold/80">
            {INVITATION_STYLE_LABELS[event.invitationStyle]}
          </p>
        )}

        {event?.invitationArtworkUrl && (
          <div className="mb-6 overflow-hidden rounded-[28px] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.16)]">
            <img
              src={event.invitationArtworkUrl}
              alt={`Convite personalizado de ${event.name}`}
              className="h-auto w-full object-cover"
            />
          </div>
        )}

        {event?.invitationHeadline && (
          <div className="mb-4 text-center">
            <h2 className="font-display text-3xl leading-tight text-cream">{event.invitationHeadline}</h2>
            {event.invitationSubtitle && <p className="mt-2 text-sm leading-relaxed text-cream/55">{event.invitationSubtitle}</p>}
          </div>
        )}

        {event?.welcomeMessage && <p className="mb-8 text-center text-sm leading-relaxed text-cream/60">{event.welcomeMessage}</p>}

        {event?.invitationNote && (
          <div className="mb-6 rounded-2xl border border-gold/15 bg-gold/5 px-4 py-3 text-center text-sm text-cream/75">
            {event.invitationNote}
          </div>
        )}

        <div
          className="space-y-5 rounded-2xl border p-6 backdrop-blur-sm"
          style={{
            backgroundColor: theme.cardBackgroundColor,
            borderColor: theme.borderColor,
            color: theme.textColor,
          }}
        >
          <Field label={<span className="text-cream/80">Seu nome</span> as unknown as string}>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Como preferir ser chamado(a)"
              className="placeholder:text-cream/25"
              style={{
                backgroundColor: 'rgba(255,255,255,0.08)',
                borderColor: theme.borderColor,
                color: theme.textColor,
              }}
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
              className="placeholder:text-cream/25"
              style={{
                backgroundColor: 'rgba(255,255,255,0.08)',
                borderColor: theme.borderColor,
                color: theme.textColor,
              }}
            />
          </Field>

          {error && <p className="rounded-lg border border-rose/20 bg-rose/10 px-4 py-2.5 text-sm text-rose">{error}</p>}

          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={() => handleSubmit('confirmado')}
              disabled={submitting}
              className="w-full rounded-xl py-3.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: theme.primaryColor, color: '#FFFFFF' }}
            >
              {submitting ? 'Confirmando...' : event?.primaryActionLabel || 'Confirmar presença'}
            </button>
            <button
              onClick={() => handleSubmit('recusado')}
              disabled={submitting}
              className="w-full rounded-xl border py-3 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                backgroundColor: 'transparent',
                borderColor: theme.secondaryColor,
                color: theme.secondaryColor,
              }}
            >
              {event?.secondaryActionLabel || 'Não poderei ir'}
            </button>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}

function PublicShell({ event, children }: { event?: EventItem; children: ReactNode }) {
  const EventIcon = getEventIcon(event?.coverIcon);
  const theme = getInvitationTheme(event?.invitationStyle);

  return (
    <div className="bg-noise flex min-h-screen flex-col" style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full blur-3xl" style={{ backgroundColor: `${theme.secondaryColor}14` }} />
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="mb-10 text-center animate-[fadeIn_0.35s_ease-out]">
          <BrandMark
            size={72}
            className="justify-center"
            iconClassName="rounded-[22px] shadow-[0_18px_45px_rgba(0,0,0,0.35)]"
            labelClassName=""
            subtitleClassName=""
          />
        </div>

        {event && (
          <div className="mb-6 w-full max-w-md animate-[fadeIn_0.3s_ease-out] text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10 text-gold">
              <EventIcon className="h-7 w-7" />
            </div>
            <h1 className="mb-3 font-display text-3xl leading-tight md:text-4xl" style={{ color: theme.textColor }}>{event.name}</h1>
            <div className="flex flex-wrap items-center justify-center gap-3 text-sm" style={{ color: theme.mutedTextColor }}>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" />
                {formatDate(event.date)}
              </span>
              <span style={{ color: theme.mutedTextColor }}>•</span>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="h-4 w-4" />
                {event.time}
              </span>
              <span style={{ color: theme.mutedTextColor }}>•</span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {event.location}
              </span>
            </div>
            {event.description && <p className="mx-auto mt-3 max-w-sm text-xs leading-relaxed" style={{ color: theme.mutedTextColor }}>{event.description}</p>}
          </div>
        )}

        <div className="w-full max-w-md">{children}</div>
      </div>

      <footer className="relative py-5 text-center text-xs" style={{ color: theme.mutedTextColor }}>
        Powered by <span className="font-display">Gala</span>
      </footer>
    </div>
  );
}
