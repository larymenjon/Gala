import { useEffect, useState } from 'react';
import type { EventItem } from '../types';
import Modal from './Modal';
import Button from './Button';
import { Field, Input, Textarea } from './FormFields';
import { EVENT_ICON_OPTIONS } from '../utils/eventIcons';

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
        maxGuestsTotal: form.maxGuestsTotal ? Number(form.maxGuestsTotal) : undefined,
        coverIcon: form.coverIcon,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Editar evento' : 'Novo evento'} width="max-w-2xl">
      <div className="space-y-4">
        <Field label="Ícone do evento">
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
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

        <Field label="Descrição" hint="Aparece no microsite, abaixo das informações do evento.">
          <Textarea rows={3} placeholder="Detalhes do evento, dress code, observações..." value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </Field>

        <Field label="Mensagem de boas-vindas" hint="Texto de saudação exibido no topo do microsite do convidado.">
          <Textarea rows={2} value={form.welcomeMessage} onChange={(e) => setForm((f) => ({ ...f, welcomeMessage: e.target.value }))} />
        </Field>

        <Field label="Limite máximo de convidados (opcional)" error={errors.maxGuestsTotal} hint="Deixe em branco para não limitar.">
          <Input type="number" min={1} placeholder="Ex.: 150" value={form.maxGuestsTotal} onChange={(e) => setForm((f) => ({ ...f, maxGuestsTotal: e.target.value }))} />
        </Field>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={saving}>{saving ? 'Salvando...' : 'Salvar evento'}</Button>
        </div>
      </div>
    </Modal>
  );
}
