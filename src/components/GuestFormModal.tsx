import { useEffect, useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import { Field, Input } from './FormFields';

export default function GuestFormModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { responsibleName: string; phone: string; expectedPeople: number }) => Promise<void>;
}) {
  const [form, setForm] = useState({ responsibleName: '', phone: '', expectedPeople: '1' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({ responsibleName: '', phone: '', expectedPeople: '1' });
      setErrors({});
    }
  }, [open]);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.responsibleName.trim()) e.responsibleName = 'Informe o nome do responsável.';
    if (!form.phone.trim()) e.phone = 'Informe o telefone/WhatsApp.';
    if (!form.expectedPeople || Number(form.expectedPeople) < 1) e.expectedPeople = 'Informe ao menos 1 pessoa.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSaving(true);
    try {
      await onSubmit({
        responsibleName: form.responsibleName.trim(),
        phone: form.phone.trim(),
        expectedPeople: Number(form.expectedPeople),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Novo convidado">
      <div className="space-y-4">
        <Field label="Nome do responsável pelo convite" error={errors.responsibleName}>
          <Input placeholder="Ex.: Maria Souza" value={form.responsibleName} onChange={(e) => setForm((f) => ({ ...f, responsibleName: e.target.value }))} />
        </Field>
        <Field label="Telefone / WhatsApp" error={errors.phone}>
          <Input placeholder="(11) 91234-5678" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
        </Field>
        <Field label="Quantidade de pessoas previstas" hint="Quantas pessoas esse convite contempla (incluindo o responsável)." error={errors.expectedPeople}>
          <Input type="number" min={1} value={form.expectedPeople} onChange={(e) => setForm((f) => ({ ...f, expectedPeople: e.target.value }))} />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={saving}>{saving ? 'Salvando...' : 'Cadastrar convidado'}</Button>
        </div>
      </div>
    </Modal>
  );
}
