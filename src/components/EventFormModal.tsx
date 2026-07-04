import { useEffect, useState, type CSSProperties } from 'react';
import type { EventItem } from '../types';
import Modal from './Modal';
import Button from './Button';
import { Field, Input, Textarea } from './FormFields';
import { EVENT_ICON_OPTIONS } from '../utils/eventIcons';
import { Eye, Palette } from 'lucide-react';
import {
  getInvitationTheme,
  INVITATION_STYLE_LABELS,
  INVITATION_STYLE_PRESETS,
  type InvitationStyle,
} from '../utils/invitationTheme';

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('Falha ao ler a imagem.'));
    reader.readAsDataURL(file);
  });
}

export default function EventFormModal({
  open,
  onClose,
  onSubmit,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<EventItem, 'id' | 'createdAt'>) => Promise<void>;
  initial?: EventItem;
}) {
  const [form, setForm] = useState({
    name: '',
    date: '',
    time: '',
    location: '',
    description: '',
    welcomeMessage: '',
    invitationStyle: 'editorial' as InvitationStyle,
    invitationArtworkUrl: '',
    primaryColor: INVITATION_STYLE_PRESETS.editorial.primaryColor,
    secondaryColor: INVITATION_STYLE_PRESETS.editorial.secondaryColor,
    textColor: INVITATION_STYLE_PRESETS.editorial.textColor,
    mutedTextColor: INVITATION_STYLE_PRESETS.editorial.mutedTextColor,
    backgroundColor: INVITATION_STYLE_PRESETS.editorial.backgroundColor,
    cardBackgroundColor: INVITATION_STYLE_PRESETS.editorial.cardBackgroundColor,
    borderColor: INVITATION_STYLE_PRESETS.editorial.borderColor,
    invitationHeadline: '',
    invitationSubtitle: '',
    invitationNote: '',
    primaryActionLabel: '',
    secondaryActionLabel: '',
    maxGuestsTotal: '',
    coverIcon: 'sparkles' as NonNullable<EventItem['coverIcon']>,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!open) return;

    const style = initial?.invitationStyle ?? 'editorial';
    const preset = getInvitationTheme(style);

    setForm({
      name: initial?.name ?? '',
      date: initial?.date ?? '',
      time: initial?.time ?? '',
      location: initial?.location ?? '',
      description: initial?.description ?? '',
      welcomeMessage: initial?.welcomeMessage ?? 'Será uma alegria ter você com a gente nesse momento especial!',
      invitationStyle: style,
      invitationArtworkUrl: initial?.invitationArtworkUrl ?? '',
      primaryColor: initial?.primaryColor ?? preset.primaryColor,
      secondaryColor: initial?.secondaryColor ?? preset.secondaryColor,
      textColor: initial?.textColor ?? preset.textColor,
      mutedTextColor: initial?.mutedTextColor ?? preset.mutedTextColor,
      backgroundColor: initial?.backgroundColor ?? preset.backgroundColor,
      cardBackgroundColor: initial?.cardBackgroundColor ?? preset.cardBackgroundColor,
      borderColor: initial?.borderColor ?? preset.borderColor,
      invitationHeadline: initial?.invitationHeadline ?? '',
      invitationSubtitle: initial?.invitationSubtitle ?? '',
      invitationNote: initial?.invitationNote ?? '',
      primaryActionLabel: initial?.primaryActionLabel ?? '',
      secondaryActionLabel: initial?.secondaryActionLabel ?? '',
      maxGuestsTotal: initial?.maxGuestsTotal ? String(initial.maxGuestsTotal) : '',
      coverIcon: initial?.coverIcon ?? 'sparkles',
    });
    setErrors({});
    setSubmitError('');
  }, [open, initial]);

  function validate() {
    const nextErrors: Record<string, string> = {};
    if (!form.name.trim()) nextErrors.name = 'Informe o nome do evento.';
    if (!form.date) nextErrors.date = 'Informe a data.';
    if (!form.time) nextErrors.time = 'Informe o horário.';
    if (!form.location.trim()) nextErrors.location = 'Informe o local.';
    if (form.maxGuestsTotal && Number(form.maxGuestsTotal) <= 0) nextErrors.maxGuestsTotal = 'Deve ser maior que zero.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSaving(true);
    setSubmitError('');
    try {
      await onSubmit({
        name: form.name.trim(),
        date: form.date,
        time: form.time,
        location: form.location.trim(),
        description: form.description.trim(),
        welcomeMessage: form.welcomeMessage.trim(),
        invitationStyle: form.invitationStyle,
        invitationArtworkUrl: form.invitationArtworkUrl.trim(),
        primaryColor: form.primaryColor,
        secondaryColor: form.secondaryColor,
        textColor: form.textColor,
        mutedTextColor: form.mutedTextColor,
        backgroundColor: form.backgroundColor,
        cardBackgroundColor: form.cardBackgroundColor,
        borderColor: form.borderColor,
        invitationHeadline: form.invitationHeadline.trim(),
        invitationSubtitle: form.invitationSubtitle.trim(),
        invitationNote: form.invitationNote.trim(),
        primaryActionLabel: form.primaryActionLabel.trim(),
        secondaryActionLabel: form.secondaryActionLabel.trim(),
        maxGuestsTotal: form.maxGuestsTotal ? Number(form.maxGuestsTotal) : undefined,
        coverIcon: form.coverIcon,
      });
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível salvar o convite.';
      setSubmitError(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleArtworkUpload(file: File | null) {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors((current) => ({ ...current, invitationArtworkUrl: 'Envie um arquivo de imagem válido.' }));
      return;
    }

    if (file.size > 2_500_000) {
      setErrors((current) => ({ ...current, invitationArtworkUrl: 'A imagem precisa ter no máximo 2,5 MB.' }));
      return;
    }

    setErrors((current) => {
      const next = { ...current };
      delete next.invitationArtworkUrl;
      return next;
    });

    const dataUrl = await readFileAsDataUrl(file);
    setForm((current) => ({ ...current, invitationArtworkUrl: dataUrl }));
  }

  const theme = getInvitationTheme(form.invitationStyle);
  const previewHeadline = form.invitationHeadline || form.name || 'Seu convite';
  const previewSubtitle = form.invitationSubtitle || form.welcomeMessage || 'Uma celebração especial';
  const previewNote = form.invitationNote || form.description || 'Detalhes personalizados do seu evento aparecerão aqui.';
  const primaryLabel = form.primaryActionLabel || 'Confirmar presença';
  const secondaryLabel = form.secondaryActionLabel || 'Não poderei ir';
  const previewStyle = {
    '--gala-primary': form.primaryColor || theme.primaryColor,
    '--gala-secondary': form.secondaryColor || theme.secondaryColor,
    '--gala-text': form.textColor || theme.textColor,
    '--gala-muted': form.mutedTextColor || theme.mutedTextColor,
    '--gala-bg': form.backgroundColor || theme.backgroundColor,
    '--gala-card': form.cardBackgroundColor || theme.cardBackgroundColor,
    '--gala-border': form.borderColor || theme.borderColor,
  } as CSSProperties;

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Editar convite' : 'Criar convite'} width="max-w-5xl">
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-ink/8 bg-ink/[0.02] p-4">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-ink/45">
              <Palette className="h-4 w-4 text-gold-dark" />
              Personalização do convite
            </div>

            <Field label="Modelo">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {(Object.entries(INVITATION_STYLE_LABELS) as [InvitationStyle, string][]).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      const preset = getInvitationTheme(value);
                      setForm((current) => ({
                        ...current,
                        invitationStyle: value,
                        primaryColor: preset.primaryColor,
                        secondaryColor: preset.secondaryColor,
                        textColor: preset.textColor,
                        mutedTextColor: preset.mutedTextColor,
                        backgroundColor: preset.backgroundColor,
                        cardBackgroundColor: preset.cardBackgroundColor,
                        borderColor: preset.borderColor,
                      }));
                    }}
                    className={`rounded-xl border px-3 py-2 text-sm transition-colors ${
                      form.invitationStyle === value ? 'border-gold bg-gold/10 text-gold-dark' : 'border-ink/10 text-ink/60 hover:border-ink/25'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </Field>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Cor primária">
                <Input type="color" value={form.primaryColor} onChange={(e) => setForm((current) => ({ ...current, primaryColor: e.target.value }))} className="h-12 p-1" />
              </Field>
              <Field label="Cor secundária">
                <Input type="color" value={form.secondaryColor} onChange={(e) => setForm((current) => ({ ...current, secondaryColor: e.target.value }))} className="h-12 p-1" />
              </Field>
              <Field label="Cor do texto">
                <Input type="color" value={form.textColor} onChange={(e) => setForm((current) => ({ ...current, textColor: e.target.value }))} className="h-12 p-1" />
              </Field>
              <Field label="Texto secundário">
                <Input type="color" value={form.mutedTextColor} onChange={(e) => setForm((current) => ({ ...current, mutedTextColor: e.target.value }))} className="h-12 p-1" />
              </Field>
              <Field label="Fundo">
                <Input type="color" value={form.backgroundColor} onChange={(e) => setForm((current) => ({ ...current, backgroundColor: e.target.value }))} className="h-12 p-1" />
              </Field>
              <Field label="Cards">
                <Input type="color" value={form.cardBackgroundColor} onChange={(e) => setForm((current) => ({ ...current, cardBackgroundColor: e.target.value }))} className="h-12 p-1" />
              </Field>
            </div>
          </div>

          <Field
            label="Arte do convite (A5)"
            hint="Envie a arte do convite para aparecer como capa principal na página do convidado."
            error={errors.invitationArtworkUrl}
          >
            <div className="rounded-2xl border border-dashed border-ink/15 bg-ink/[0.02] p-4">
              {form.invitationArtworkUrl ? (
                <div className="space-y-3">
                  <img
                    src={form.invitationArtworkUrl}
                    alt="Prévia da imagem do convite"
                    className="aspect-[210/297] w-full rounded-2xl object-contain bg-black/5"
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setForm((current) => ({ ...current, invitationArtworkUrl: '' }))}
                    >
                      Remover imagem
                    </Button>
                    <Button size="sm" onClick={() => document.getElementById('gala-invitation-upload')?.click()}>
                      Trocar imagem
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm font-medium text-ink">Adicione uma imagem do convite</p>
                  <p className="mt-1 text-xs text-ink/50">PNG, JPG ou WEBP em formato vertical, preferencialmente A5, com até 2,5 MB.</p>
                  <div className="mt-4 flex justify-center">
                    <Button variant="secondary" size="sm" onClick={() => document.getElementById('gala-invitation-upload')?.click()}>
                      Enviar imagem
                    </Button>
                  </div>
                </div>
              )}
              <input
                id="gala-invitation-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleArtworkUpload(e.target.files?.[0] ?? null)}
              />
            </div>
          </Field>

          <Field label="Ícone do evento">
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {EVENT_ICON_OPTIONS.map(({ value, label, Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, coverIcon: value }))}
                  className={`flex flex-col items-center justify-center gap-2 rounded-xl border px-3 py-3 text-xs transition-colors ${
                    form.coverIcon === value ? 'border-gold bg-gold/10 text-gold-dark' : 'border-ink/10 text-ink/60 hover:border-ink/25'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </Field>

          <Field label="Nome do evento" error={errors.name}>
            <Input placeholder="Ex.: Casamento de Ana & Pedro" value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Data" error={errors.date}>
              <Input type="date" value={form.date} onChange={(e) => setForm((current) => ({ ...current, date: e.target.value }))} />
            </Field>
            <Field label="Horário" error={errors.time}>
              <Input type="time" value={form.time} onChange={(e) => setForm((current) => ({ ...current, time: e.target.value }))} />
            </Field>
          </div>

          <Field label="Local" error={errors.location}>
            <Input placeholder="Ex.: Espaço Jardim das Flores, São Paulo - SP" value={form.location} onChange={(e) => setForm((current) => ({ ...current, location: e.target.value }))} />
          </Field>

          <Field label="Mensagem principal" hint="Aparece em destaque na página do convidado.">
            <Input placeholder="Ex.: Convite para um momento inesquecível" value={form.invitationHeadline} onChange={(e) => setForm((current) => ({ ...current, invitationHeadline: e.target.value }))} />
          </Field>

          <Field label="Subtítulo" hint="Uma frase curta para reforçar o tom do evento.">
            <Input placeholder="Ex.: Uma celebração elegante e especial" value={form.invitationSubtitle} onChange={(e) => setForm((current) => ({ ...current, invitationSubtitle: e.target.value }))} />
          </Field>

          <Field label="Texto de boas-vindas" hint="Mensagem exibida no topo da página do convidado.">
            <Textarea rows={2} value={form.welcomeMessage} onChange={(e) => setForm((current) => ({ ...current, welcomeMessage: e.target.value }))} />
          </Field>

          <Field label="Observação" hint="Detalhes extras, dress code ou instruções especiais.">
            <Textarea rows={2} placeholder="Ex.: Traje social, estacionamento disponível..." value={form.invitationNote} onChange={(e) => setForm((current) => ({ ...current, invitationNote: e.target.value }))} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Texto do botão principal">
              <Input placeholder="Ex.: Confirmar presença" value={form.primaryActionLabel} onChange={(e) => setForm((current) => ({ ...current, primaryActionLabel: e.target.value }))} />
            </Field>
            <Field label="Texto do botão secundário">
              <Input placeholder="Ex.: Não poderei ir" value={form.secondaryActionLabel} onChange={(e) => setForm((current) => ({ ...current, secondaryActionLabel: e.target.value }))} />
            </Field>
          </div>

          <Field label="Descrição" hint="Aparece no microsite, abaixo das informações do evento.">
            <Textarea rows={3} placeholder="Detalhes do evento, dress code, observações..." value={form.description} onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))} />
          </Field>

          <Field label="Limite máximo de convidados (opcional)" error={errors.maxGuestsTotal} hint="Deixe em branco para não limitar.">
            <Input type="number" min={1} placeholder="Ex.: 150" value={form.maxGuestsTotal} onChange={(e) => setForm((current) => ({ ...current, maxGuestsTotal: e.target.value }))} />
          </Field>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={saving}>{saving ? 'Salvando...' : 'Salvar convite'}</Button>
          </div>
          {submitError && (
            <p className="rounded-xl border border-rose/20 bg-rose/10 px-4 py-3 text-sm text-rose">
              {submitError}
            </p>
          )}
        </div>

        <div className="lg:sticky lg:top-0">
          <div className="rounded-[28px] border border-[#F1EAE6] bg-[linear-gradient(180deg,#fffdf9_0%,#fbf8f4_100%)] p-5 shadow-[0_20px_60px_rgba(15,27,51,0.08)]">
            <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-ink/45">
              <Eye className="h-4 w-4 text-gold-dark" />
              Prévia do convite
            </div>

            <div
              className="rounded-[24px] border p-5 shadow-[0_18px_45px_rgba(15,27,51,0.06)]"
              style={{
                backgroundColor: form.backgroundColor || theme.backgroundColor,
                borderColor: form.borderColor || theme.borderColor,
                ...previewStyle,
              }}
            >
              {form.invitationArtworkUrl && (
                <div className="mb-5 overflow-hidden rounded-[20px] border" style={{ borderColor: form.borderColor || theme.borderColor }}>
                  <img src={form.invitationArtworkUrl} alt="Prévia da arte do convite" className="aspect-[210/297] w-full object-contain bg-black/5" />
                </div>
              )}

              <div className="text-center" style={{ color: 'var(--gala-text)' }}>
                <div className="text-xs font-semibold uppercase tracking-[0.28em]" style={{ color: 'var(--gala-secondary)' }}>
                  {INVITATION_STYLE_LABELS[form.invitationStyle]}
                </div>
                <div className="mt-3 font-display text-3xl">{previewHeadline}</div>
                <div className="mt-2 font-display text-xl" style={{ color: 'var(--gala-secondary)' }}>
                  {previewSubtitle}
                </div>
                <div className="mt-4 text-sm leading-7" style={{ color: 'var(--gala-muted)' }}>
                  {previewNote}
                </div>
              </div>

              <div
                className="mt-5 rounded-[22px] border p-4"
                style={{
                  backgroundColor: form.cardBackgroundColor || theme.cardBackgroundColor,
                  borderColor: form.borderColor || theme.borderColor,
                }}
              >
                <div className="text-center text-sm leading-7" style={{ color: 'var(--gala-muted)' }}>
                  {form.welcomeMessage || 'Mensagem de boas-vindas do convite.'}
                </div>

                <div className="mt-4 grid gap-3">
                  <button
                    type="button"
                    className="w-full rounded-[16px] px-4 py-3 text-sm font-semibold text-white"
                    style={{ backgroundColor: form.primaryColor || theme.primaryColor }}
                  >
                    {primaryLabel}
                  </button>
                  <button
                    type="button"
                    className="w-full rounded-[16px] border bg-white px-4 py-3 text-sm font-semibold"
                    style={{
                      borderColor: form.secondaryColor || theme.secondaryColor,
                      color: form.secondaryColor || theme.secondaryColor,
                    }}
                  >
                    {secondaryLabel}
                  </button>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-[0.22em]" style={{ color: 'var(--gala-muted)' }}>
                <span>{form.date || 'Data a definir'}</span>
                <span>{form.time || 'Horário'}</span>
              </div>
              <div className="mt-2 text-center text-sm" style={{ color: 'var(--gala-muted)' }}>
                {form.location || 'Local do evento'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
