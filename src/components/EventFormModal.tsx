import { useEffect, useState } from 'react';
import type { EventItem } from '../types';
import Modal from './Modal';
import Button from './Button';
import { Field, Input, Textarea } from './FormFields';
import { EVENT_ICON_OPTIONS } from '../utils/eventIcons';
import { Eye, Palette } from 'lucide-react';

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
    invitationStyle: 'editorial' as NonNullable<EventItem['invitationStyle']>,
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

  useEffect(() => {
    if (open) {
      setForm({
        name: initial?.name ?? '',
        date: initial?.date ?? '',
        time: initial?.time ?? '',
        location: initial?.location ?? '',
        description: initial?.description ?? '',
        welcomeMessage: initial?.welcomeMessage ?? 'Será uma alegria ter você com a gente nesse momento especial!',
        invitationStyle: initial?.invitationStyle ?? 'editorial',
        invitationHeadline: initial?.invitationHeadline ?? '',
        invitationSubtitle: initial?.invitationSubtitle ?? '',
        invitationNote: initial?.invitationNote ?? '',
        primaryActionLabel: initial?.primaryActionLabel ?? '',
        secondaryActionLabel: initial?.secondaryActionLabel ?? '',
        maxGuestsTotal: initial?.maxGuestsTotal ? String(initial.maxGuestsTotal) : '',
        coverIcon: initial?.coverIcon ?? 'sparkles',
      });
      setErrors({});
    }
  }, [open, initial]);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Informe o nome do evento.';
    if (!form.date) e.date = 'Informe a data.';
    if (!form.time) e.time = 'Informe o horário.';
    if (!form.location.trim()) e.location = 'Informe o local.';
    if (form.maxGuestsTotal && Number(form.maxGuestsTotal) <= 0) e.maxGuestsTotal = 'Deve ser maior que zero.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSaving(true);
    try {
      await onSubmit({
        name: form.name.trim(),
        date: form.date,
        time: form.time,
        location: form.location.trim(),
        description: form.description.trim(),
        welcomeMessage: form.welcomeMessage.trim(),
        invitationStyle: form.invitationStyle,
        invitationHeadline: form.invitationHeadline.trim(),
        invitationSubtitle: form.invitationSubtitle.trim(),
        invitationNote: form.invitationNote.trim(),
        primaryActionLabel: form.primaryActionLabel.trim(),
        secondaryActionLabel: form.secondaryActionLabel.trim(),
        maxGuestsTotal: form.maxGuestsTotal ? Number(form.maxGuestsTotal) : undefined,
        coverIcon: form.coverIcon,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  const previewHeadline = form.invitationHeadline || form.name || 'Seu convite';
  const previewSubtitle = form.invitationSubtitle || form.welcomeMessage || 'Uma celebração especial';
  const previewNote = form.invitationNote || form.description || 'Detalhes personalizados do seu evento aparecerão aqui.';
  const primaryLabel = form.primaryActionLabel || 'Confirmar presença';
  const secondaryLabel = form.secondaryActionLabel || 'Não poderei ir';
  const styleLabels: Record<NonNullable<EventItem['invitationStyle']>, string> = {
    editorial: 'Editorial',
    modern: 'Moderno',
    romantic: 'Romântico',
    classic: 'Clássico',
  };

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Editar convite' : 'Criar convite'} width="max-w-5xl">
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-ink/8 bg-ink/[0.02] p-4">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-ink/45">
              <Palette className="h-4 w-4 text-gold-dark" />
              Personalização do convite
            </div>
            <Field label="Estilo visual">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { value: 'editorial', label: 'Editorial' },
                  { value: 'modern', label: 'Moderno' },
                  { value: 'romantic', label: 'Romântico' },
                  { value: 'classic', label: 'Clássico' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, invitationStyle: option.value as NonNullable<EventItem['invitationStyle']> }))}
                    className={`rounded-xl border px-3 py-2 text-sm transition-colors ${
                      form.invitationStyle === option.value ? 'border-gold bg-gold/10 text-gold-dark' : 'border-ink/10 text-ink/60 hover:border-ink/25'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </Field>
          </div>

          <Field label="Ícone do evento">
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {EVENT_ICON_OPTIONS.map(({ value, label, Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, coverIcon: value }))}
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
            <Input placeholder="Ex.: Casamento de Ana & Pedro" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Data" error={errors.date}>
              <Input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
            </Field>
            <Field label="Horário" error={errors.time}>
              <Input type="time" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} />
            </Field>
          </div>

          <Field label="Local" error={errors.location}>
            <Input placeholder="Ex.: Espaço Jardim das Flores, São Paulo - SP" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
          </Field>

          <Field label="Mensagem principal" hint="Aparece em destaque na página do convidado.">
            <Input placeholder="Ex.: Convite para um momento inesquecível" value={form.invitationHeadline} onChange={(e) => setForm((f) => ({ ...f, invitationHeadline: e.target.value }))} />
          </Field>

          <Field label="Subtítulo do convite" hint="Uma frase curta para reforçar o tom do evento.">
            <Input placeholder="Ex.: Uma celebração elegante e especial" value={form.invitationSubtitle} onChange={(e) => setForm((f) => ({ ...f, invitationSubtitle: e.target.value }))} />
          </Field>

          <Field label="Texto de boas-vindas" hint="Mensagem exibida no topo da página do convidado.">
            <Textarea rows={2} value={form.welcomeMessage} onChange={(e) => setForm((f) => ({ ...f, welcomeMessage: e.target.value }))} />
          </Field>

          <Field label="Observação do convite" hint="Detalhes extras, dress code ou instruções especiais.">
            <Textarea rows={2} placeholder="Ex.: Traje social, estacionamento disponível..." value={form.invitationNote} onChange={(e) => setForm((f) => ({ ...f, invitationNote: e.target.value }))} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Texto do botão principal">
              <Input placeholder="Ex.: Confirmar presença" value={form.primaryActionLabel} onChange={(e) => setForm((f) => ({ ...f, primaryActionLabel: e.target.value }))} />
            </Field>
            <Field label="Texto do botão secundário">
              <Input placeholder="Ex.: Não poderei ir" value={form.secondaryActionLabel} onChange={(e) => setForm((f) => ({ ...f, secondaryActionLabel: e.target.value }))} />
            </Field>
          </div>

          <Field label="Descrição" hint="Aparece no microsite, abaixo das informações do evento.">
            <Textarea rows={3} placeholder="Detalhes do evento, dress code, observações..." value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </Field>

          <Field label="Limite máximo de convidados (opcional)" error={errors.maxGuestsTotal} hint="Deixe em branco para não limitar.">
            <Input type="number" min={1} placeholder="Ex.: 150" value={form.maxGuestsTotal} onChange={(e) => setForm((f) => ({ ...f, maxGuestsTotal: e.target.value }))} />
          </Field>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={saving}>{saving ? 'Salvando...' : 'Salvar convite'}</Button>
          </div>
        </div>

        <div className="lg:sticky lg:top-0">
          <div className="rounded-[28px] border border-[#F1EAE6] bg-[linear-gradient(180deg,#fffdf9_0%,#fbf8f4_100%)] p-5 shadow-[0_20px_60px_rgba(15,27,51,0.08)]">
            <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-ink/45">
              <Eye className="h-4 w-4 text-gold-dark" />
              Prévia do convite
            </div>
            <div className="rounded-[24px] border border-[#F1EAE6] bg-white p-5 shadow-[0_18px_45px_rgba(15,27,51,0.06)]">
              <div className="text-center">
                <div className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-dark">{styleLabels[form.invitationStyle]}</div>
                <div className="mt-3 font-display text-3xl text-ink">{previewHeadline}</div>
                <div className="mt-2 font-display text-xl text-gold-dark">{previewSubtitle}</div>
                <div className="mt-4 text-sm leading-7 text-ink/60">{previewNote}</div>
              </div>

              <div className="mt-5 rounded-[22px] border border-[#F1EAE6] bg-[#FFFCFA] p-4">
                <div className="text-center text-sm leading-7 text-ink/70">
                  {form.welcomeMessage || 'Mensagem de boas-vindas do convite.'}
                </div>

                <div className="mt-4 grid gap-3">
                  <button type="button" className="w-full rounded-[16px] bg-ink px-4 py-3 text-sm font-semibold text-white">
                    {primaryLabel}
                  </button>
                  <button type="button" className="w-full rounded-[16px] border border-gold/60 bg-white px-4 py-3 text-sm font-semibold text-gold-dark">
                    {secondaryLabel}
                  </button>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-[0.22em] text-ink/35">
                <span>{form.date || 'Data a definir'}</span>
                <span>{form.time || 'Horário'}</span>
              </div>
              <div className="mt-2 text-center text-sm text-ink/55">{form.location || 'Local do evento'}</div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
