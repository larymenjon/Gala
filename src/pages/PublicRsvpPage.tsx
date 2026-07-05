import { useEffect, useState, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { CalendarDays, Clock3, MailX, MapPin, PartyPopper, Plus, SearchX, Trash2, Users } from 'lucide-react';
import type { EventItem, Guest, GuestAttendee, GuestAttendeeType } from '../types';
import * as guestService from '../services/guestService';
import * as eventService from '../services/eventService';
import { formatCountdownLabel, formatDate, getDaysUntilDate } from '../utils/format';
import { Field, Input } from '../components/FormFields';
import BrandMark from '../components/BrandMark';
import { getEventIcon } from '../utils/eventIcons';
import { getInvitationTheme, INVITATION_STYLE_LABELS } from '../utils/invitationTheme';

type Screen = 'loading' | 'not_found' | 'form' | 'success';
type Mode = 'legacy' | 'event';

type AttendeeDraft = {
  id: string;
  name: string;
  type: GuestAttendeeType;
};

const MAX_EVENT_ATTENDEES = 10;

function createAttendeeDraft(type: GuestAttendeeType = 'adult'): AttendeeDraft {
  return {
    id: crypto.randomUUID(),
    name: '',
    type,
  };
}

function normalizeEventAttendees(rows: AttendeeDraft[]): GuestAttendee[] {
  return rows
    .map((row) => ({
      name: row.name.trim(),
      type: row.type,
    }))
    .filter((row) => row.name.length > 0);
}

function attendeeTypeLabel(type: GuestAttendeeType): string {
  return type === 'child' ? 'Criança' : 'Adulto';
}

export default function PublicRsvpPage() {
  const { slug, eventId } = useParams<{ slug?: string; eventId?: string }>();
  const mode: Mode = eventId ? 'event' : 'legacy';
  const [screen, setScreen] = useState<Screen>('loading');
  const [guest, setGuest] = useState<Guest | null>(null);
  const [event, setEvent] = useState<EventItem | null>(null);

  const [contactName, setContactName] = useState('');
  const [people, setPeople] = useState('1');
  const [attendees, setAttendees] = useState<AttendeeDraft[]>([createAttendeeDraft()]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState<'confirmado' | 'recusado' | null>(null);

  useEffect(() => {
    async function load() {
      if (slug && mode === 'legacy') {
        const g = await guestService.getGuestBySlug(slug);
        if (!g) {
          setScreen('not_found');
          return;
        }

        const ev = await eventService.getEvent(g.eventId);
        setGuest(g);
        setEvent(ev ?? null);
        setContactName(g.responsibleName);
        const initialPeople = g.status === 'confirmado' ? g.confirmedPeople : g.expectedPeople;
        setPeople(String(Math.min(Math.max(initialPeople || 1, 1), MAX_EVENT_ATTENDEES)));
        setScreen(g.status !== 'pendente' ? 'success' : 'form');
        setConfirmed(g.status !== 'pendente' ? (g.status as 'confirmado' | 'recusado') : null);
        return;
      }

      if (eventId && mode === 'event') {
        const ev = await eventService.getEvent(eventId);
        if (!ev) {
          setScreen('not_found');
          return;
        }

        setGuest(null);
        setEvent(ev);
        setContactName('');
        setPeople('1');
        setAttendees([createAttendeeDraft()]);
        setScreen('form');
        setConfirmed(null);
        return;
      }

      setScreen('not_found');
    }

    load();
  }, [slug, eventId, mode]);

  async function handleLegacySubmit(status: 'confirmado' | 'recusado') {
    if (!slug) return;
    if (status === 'confirmado' && (!people || Number(people) < 1)) {
      setError('Informe quantas pessoas irão.');
      return;
    }
    if (status === 'confirmado' && Number(people) > MAX_EVENT_ATTENDEES) {
      setError(`Você pode confirmar no máximo ${MAX_EVENT_ATTENDEES} pessoas.`);
      return;
    }

    setSubmitting(true);
    setError('');

    const result = await guestService.submitResponse(slug, {
      responsibleName: contactName,
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

  async function handleEventSubmit(status: 'confirmado' | 'recusado') {
    if (!eventId) return;
    const normalizedAttendees = normalizeEventAttendees(attendees);

    if (status === 'confirmado') {
      if (normalizedAttendees.length < 1) {
        setError('Adicione pelo menos um nome para confirmar a presença.');
        return;
      }

      if (normalizedAttendees.length > MAX_EVENT_ATTENDEES) {
        setError(`Você pode confirmar no máximo ${MAX_EVENT_ATTENDEES} pessoas por convite.`);
        return;
      }

      if (normalizedAttendees.some((attendee) => !attendee.name)) {
        setError('Preencha o nome de todos os convidados antes de confirmar.');
        return;
      }
    }

    setSubmitting(true);
    setError('');

    const result = await guestService.submitOpenEventResponse(eventId, {
      attendees: status === 'confirmado' ? normalizedAttendees : [],
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
      <PublicShell event={event ?? undefined}>
        <div className="py-20 text-center text-sm text-cream/40">Carregando seu convite...</div>
      </PublicShell>
    );
  }

  if (screen === 'not_found') {
    return (
      <PublicShell event={event ?? undefined}>
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
        <div className="mx-auto w-full max-w-[560px] px-3 py-4 sm:px-0 sm:py-6">
          <InvitationHero event={event ?? undefined} compact />

          <div className="mt-5 rounded-[28px] border border-white/10 bg-white/10 p-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.16)] backdrop-blur-sm">
            <div className="mb-6 flex justify-center">
              {isConfirmed ? <PartyPopper className="h-14 w-14 text-gold" /> : <MailX className="h-14 w-14 text-gold" />}
            </div>
            <h2 className="mb-3 font-display text-3xl text-cream">
              {isConfirmed ? 'Presença confirmada!' : 'Recebemos sua resposta'}
            </h2>
            <p className="mb-8 text-sm leading-relaxed text-cream/60">
              {isConfirmed
                ? 'Sua confirmação foi salva com sucesso. Em breve o organizador verá sua lista de convidados.'
                : 'Sentiremos sua falta. Obrigado por nos avisar!'}
            </p>

            {isConfirmed && guest?.attendees?.length ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-cream/70">
                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-cream/40">Convidados confirmados</p>
                <ul className="space-y-1.5">
                  {guest.attendees.map((attendee) => (
                    <li key={`${attendee.name}-${attendee.type}`} className="flex items-center justify-between gap-3">
                      <span>{attendee.name}</span>
                      <span className="text-xs text-cream/45">{attendeeTypeLabel(attendee.type)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {isConfirmed && mode === 'event' && (
              <button
                onClick={() => {
                  setScreen('form');
                  setError('');
                }}
                className="mt-6 text-xs text-cream/40 underline underline-offset-2 transition-colors hover:text-cream/60"
              >
                Precisa alterar a lista? Clique aqui.
              </button>
            )}
          </div>
        </div>
      </PublicShell>
    );
  }

  const theme = getInvitationTheme(event?.invitationStyle);

  return (
    <PublicShell event={event ?? undefined}>
      <div className="mx-auto w-full max-w-[560px] px-3 py-4 sm:px-0 sm:py-6">
        <div className="space-y-5">
          <InvitationHero event={event ?? undefined} />

          {event?.invitationNote && (
            <div
              className="rounded-[24px] border px-4 py-3 text-sm leading-relaxed shadow-[0_14px_40px_rgba(15,27,51,0.06)]"
              style={{
                backgroundColor: theme.cardBackgroundColor,
                borderColor: theme.borderColor,
                color: theme.textColor,
              }}
            >
              {event.invitationNote}
            </div>
          )}

          <div
            className="space-y-5 rounded-[28px] border p-5 shadow-[0_20px_60px_rgba(15,27,51,0.08)] backdrop-blur-sm sm:p-6"
            style={{
              backgroundColor: theme.cardBackgroundColor,
              borderColor: theme.borderColor,
              color: theme.textColor,
            }}
          >
            {mode === 'legacy' ? (
              <>
                <Field label="Seu nome">
                  <Input
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Como preferir ser chamado(a)"
                    className="placeholder:text-cream/25"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.08)',
                      borderColor: theme.borderColor,
                      color: theme.textColor,
                    }}
                  />
                </Field>

                <Field label="Quantas pessoas irão?" hint="Você pode confirmar de 1 até 10 pessoas, incluindo crianças.">
                  <Input
                    type="number"
                    min={1}
                    max={MAX_EVENT_ATTENDEES}
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
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-2xl" style={{ color: theme.textColor }}>
                      Quem vai comparecer?
                    </h3>
                    <p className="mt-1 text-sm" style={{ color: theme.mutedTextColor }}>
                      Liste os nomes um por linha e marque se cada pessoa é adulto ou criança.
                    </p>
                  </div>
                  <div className="rounded-full border px-3 py-1 text-xs font-medium" style={{ borderColor: theme.borderColor, color: theme.mutedTextColor }}>
                    {normalizeEventAttendees(attendees).length}/{MAX_EVENT_ATTENDEES}
                  </div>
                </div>

                <div className="space-y-3">
                  {attendees.map((attendee, index) => (
                    <div key={attendee.id} className="grid gap-3 rounded-2xl border p-3 sm:grid-cols-[minmax(0,1fr)_150px_auto]" style={{ borderColor: theme.borderColor }}>
                      <Input
                        value={attendee.name}
                        onChange={(e) =>
                          setAttendees((current) =>
                            current.map((item) => (item.id === attendee.id ? { ...item, name: e.target.value } : item)),
                          )
                        }
                        placeholder={`Nome ${index + 1}`}
                        className="placeholder:text-cream/25"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.08)',
                          borderColor: theme.borderColor,
                          color: theme.textColor,
                        }}
                      />

                      <select
                        value={attendee.type}
                        onChange={(e) =>
                          setAttendees((current) =>
                            current.map((item) =>
                              item.id === attendee.id ? { ...item, type: e.target.value === 'child' ? 'child' : 'adult' } : item,
                            ),
                          )
                        }
                        className="h-12 rounded-xl border bg-transparent px-4 text-sm outline-none"
                        style={{
                          borderColor: theme.borderColor,
                          color: theme.textColor,
                          backgroundColor: 'rgba(255,255,255,0.08)',
                        }}
                      >
                        <option value="adult">Adulto</option>
                        <option value="child">Criança</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => setAttendees((current) => (current.length === 1 ? current : current.filter((item) => item.id !== attendee.id)))}
                        className="inline-flex h-12 items-center justify-center rounded-xl border px-3 text-sm transition-colors hover:bg-rose/10 disabled:cursor-not-allowed disabled:opacity-40"
                        style={{ borderColor: theme.borderColor, color: theme.textColor }}
                        disabled={attendees.length === 1}
                        aria-label={`Remover ${attendee.name || `nome ${index + 1}`}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setAttendees((current) => {
                        if (current.length >= MAX_EVENT_ATTENDEES) return current;
                        return [...current, createAttendeeDraft()];
                      })
                    }
                    className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition-colors hover:bg-ink/5"
                    style={{ borderColor: theme.borderColor, color: theme.textColor }}
                    disabled={normalizeEventAttendees(attendees).length >= MAX_EVENT_ATTENDEES}
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar nome
                  </button>
                  <div className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm" style={{ borderColor: theme.borderColor, color: theme.mutedTextColor }}>
                    <Users className="h-4 w-4" />
                    Até {MAX_EVENT_ATTENDEES} pessoas
                  </div>
                </div>
              </div>
            )}

            {error && <p className="rounded-lg border border-rose/20 bg-rose/10 px-4 py-2.5 text-sm text-rose">{error}</p>}

            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={() => (mode === 'legacy' ? handleLegacySubmit('confirmado') : handleEventSubmit('confirmado'))}
                disabled={submitting}
                className="w-full rounded-xl py-3.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                style={{ backgroundColor: theme.primaryColor, color: '#FFFFFF' }}
              >
                {submitting ? 'Confirmando...' : event?.primaryActionLabel || 'Confirmar presença'}
              </button>
              <button
                onClick={() => (mode === 'legacy' ? handleLegacySubmit('recusado') : handleEventSubmit('recusado'))}
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
      </div>
    </PublicShell>
  );
}

function InvitationHero({ event, compact = false }: { event?: EventItem; compact?: boolean }) {
  const theme = getInvitationTheme(event?.invitationStyle);
  const hasArtwork = Boolean(event?.invitationArtworkUrl);
  const countdownLabel = formatCountdownLabel(event?.date);
  const countdownDays = getDaysUntilDate(event?.date);
  const countdownHasNumber = countdownDays != null && countdownDays >= 0;

  return (
    <section
      className="overflow-hidden rounded-[30px] border shadow-[0_28px_80px_rgba(15,27,51,0.16)]"
      style={{
        backgroundColor: theme.cardBackgroundColor,
        borderColor: theme.borderColor,
        color: theme.textColor,
      }}
    >
      {hasArtwork ? (
        <div className="p-3 sm:p-4">
          <div className="overflow-hidden rounded-[24px] bg-black/5">
            <img
              src={event?.invitationArtworkUrl}
              alt={`Convite personalizado de ${event?.name ?? 'evento'}`}
              className={`aspect-[210/297] w-full object-contain ${compact ? 'max-h-[64vh] sm:max-h-[72vh]' : 'max-h-[72vh] sm:max-h-[78vh]'}`}
            />
          </div>
          <div className="px-1 pb-1 pt-4 text-center">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em]" style={{ color: theme.secondaryColor }}>
              {event?.invitationStyle ? INVITATION_STYLE_LABELS[event.invitationStyle] : 'Convite'}
            </p>
            <h2 className="mt-2 font-display text-2xl leading-tight sm:text-3xl">{event?.name}</h2>
            {event?.date && (
              <p className="mt-2 text-sm leading-relaxed" style={{ color: theme.mutedTextColor }}>
                {formatDate(event.date)} • {event.time} • {event.location}
              </p>
            )}
            {countdownLabel && countdownHasNumber && (
              <div className="relative mt-5 flex justify-center">
                <div className="absolute inset-x-8 top-7 h-28 rounded-full blur-3xl" style={{ backgroundColor: `${theme.secondaryColor}18` }} />
                <div
                  className="relative flex h-44 w-44 flex-col items-center justify-center rounded-full border shadow-[0_18px_45px_rgba(15,27,51,0.12)] sm:h-52 sm:w-52"
                  style={{
                    borderColor: theme.borderColor,
                    background: `radial-gradient(circle at 30% 30%, ${theme.secondaryColor}18 0%, ${theme.cardBackgroundColor} 55%, ${theme.backgroundColor} 100%)`,
                  }}
                >
                  <p className="text-[0.62rem] font-semibold uppercase tracking-[0.36em]" style={{ color: theme.secondaryColor }}>
                    Grande dia
                  </p>
                  <div className="mt-3 flex items-end gap-2">
                    <span className="font-display text-6xl leading-none sm:text-7xl" style={{ color: theme.textColor }}>
                      {Math.max(countdownDays ?? 0, 0)}
                    </span>
                    <span className="pb-2 text-[0.72rem] font-semibold uppercase tracking-[0.26em]" style={{ color: theme.mutedTextColor }}>
                      {countdownDays === 1 ? 'dia' : 'dias'}
                    </span>
                  </div>
                  <p className="mt-3 max-w-[140px] text-center text-xs leading-relaxed" style={{ color: theme.mutedTextColor }}>
                    {countdownLabel}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-5 p-6 sm:p-7">
          {event?.invitationStyle && (
            <p className="text-center text-[0.68rem] font-semibold uppercase tracking-[0.3em]" style={{ color: theme.secondaryColor }}>
              {INVITATION_STYLE_LABELS[event.invitationStyle]}
            </p>
          )}

          {event?.invitationHeadline ? (
            <div className="text-center">
              <h2 className="font-display text-3xl leading-tight sm:text-4xl" style={{ color: theme.textColor }}>
                {event.invitationHeadline}
              </h2>
              {event.invitationSubtitle && (
                <p className="mt-2 text-sm leading-relaxed" style={{ color: theme.mutedTextColor }}>
                  {event.invitationSubtitle}
                </p>
              )}
            </div>
          ) : (
            <div className="text-center">
              <h2 className="font-display text-3xl leading-tight sm:text-4xl" style={{ color: theme.textColor }}>
                {event?.name}
              </h2>
              {event?.welcomeMessage && (
                <p className="mt-2 text-sm leading-relaxed" style={{ color: theme.mutedTextColor }}>
                  {event.welcomeMessage}
                </p>
              )}
            </div>
          )}

          <div className="rounded-[24px] border p-4 sm:p-5" style={{ borderColor: theme.borderColor, backgroundColor: `${theme.secondaryColor}08` }}>
            <div className="text-center">
              <p className="font-display text-2xl" style={{ color: theme.textColor }}>
                {event?.name}
              </p>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: theme.mutedTextColor }}>
                {event?.date ? formatDate(event.date) : 'Data a definir'} • {event?.time || 'Horário a definir'}
              </p>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: theme.mutedTextColor }}>
                {event?.location || 'Local do evento'}
              </p>
            </div>
          </div>

          {countdownLabel && countdownHasNumber && (
            <div className="relative flex justify-center py-2">
              <div className="absolute inset-x-10 top-6 h-32 rounded-full blur-3xl" style={{ backgroundColor: `${theme.secondaryColor}18` }} />
              <div
                className="relative flex h-52 w-52 flex-col items-center justify-center rounded-full border shadow-[0_18px_45px_rgba(15,27,51,0.12)] sm:h-60 sm:w-60"
                style={{
                  borderColor: theme.borderColor,
                  background: `radial-gradient(circle at 30% 30%, ${theme.secondaryColor}1E 0%, ${theme.cardBackgroundColor} 58%, ${theme.backgroundColor} 100%)`,
                }}
              >
                <p className="text-[0.64rem] font-semibold uppercase tracking-[0.4em]" style={{ color: theme.secondaryColor }}>
                  Contagem regressiva
                </p>
                <div className="mt-3 flex items-end gap-2">
                  <span className="font-display text-7xl leading-none sm:text-8xl" style={{ color: theme.textColor }}>
                    {Math.max(countdownDays ?? 0, 0)}
                  </span>
                  <span className="pb-3 text-[0.72rem] font-semibold uppercase tracking-[0.26em]" style={{ color: theme.mutedTextColor }}>
                    {countdownDays === 1 ? 'dia' : 'dias'}
                  </span>
                </div>
                <p className="mt-3 max-w-[160px] text-center text-sm leading-relaxed" style={{ color: theme.mutedTextColor }}>
                  {countdownLabel}
                </p>
            </div>
            </div>
          )}

          {event?.welcomeMessage && (
            <p className="text-center text-sm leading-relaxed" style={{ color: theme.textColor }}>
              {event.welcomeMessage}
            </p>
          )}
        </div>
      )}
    </section>
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

      <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-8 sm:py-12">
        <div className="mb-8 text-center animate-[fadeIn_0.35s_ease-out]">
          <BrandMark
            size={72}
            className="justify-center"
            iconClassName="rounded-[22px] shadow-[0_18px_45px_rgba(0,0,0,0.35)]"
            labelClassName=""
            subtitleClassName=""
          />
        </div>

        {event && !event.invitationArtworkUrl && (
          <div className="mb-6 w-full max-w-[560px] animate-[fadeIn_0.3s_ease-out] text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10 text-gold">
              <EventIcon className="h-7 w-7" />
            </div>
            <h1 className="mb-3 font-display text-3xl leading-tight md:text-4xl" style={{ color: theme.textColor }}>
              {event.name}
            </h1>
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
            {event.description && (
              <p className="mx-auto mt-3 max-w-sm text-xs leading-relaxed" style={{ color: theme.mutedTextColor }}>
                {event.description}
              </p>
            )}
          </div>
        )}

        <div className="w-full max-w-[560px]">{children}</div>
      </div>

      <footer className="relative py-5 text-center text-xs" style={{ color: theme.mutedTextColor }}>
        Powered by <span className="font-display">Gala</span>
      </footer>
    </div>
  );
}
