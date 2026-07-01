import type { GuestStatus } from '../types';

const config: Record<GuestStatus, { label: string; classes: string; dot: string }> = {
  confirmado: { label: 'Confirmado', classes: 'bg-sage/15 text-[#4F6650]', dot: 'bg-sage' },
  recusado: { label: 'Recusado', classes: 'bg-rose/10 text-rose', dot: 'bg-rose' },
  pendente: { label: 'Pendente', classes: 'bg-gold/15 text-gold-dark', dot: 'bg-gold' },
};

export default function StatusBadge({ status }: { status: GuestStatus }) {
  const c = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${c.classes}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}
