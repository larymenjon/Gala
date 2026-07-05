export function formatDate(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, (m || 1) - 1, d || 1);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

export function formatDateShort(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, (m || 1) - 1, d || 1);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatDateTime(iso?: string): string {
  if (!iso) return '—';
  const date = new Date(iso);
  return date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function formatPhoneForWhatsApp(phone: string): string {
  return phone.replace(/\D/g, '');
}

function toLocalMidnight(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function getDaysUntilDate(iso?: string): number | null {
  if (!iso) return null;
  const target = toLocalMidnight(iso);
  if (Number.isNaN(target.getTime())) return null;

  const today = new Date();
  const localToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diffMs = target.getTime() - localToday.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function formatCountdownLabel(iso?: string): string | null {
  const days = getDaysUntilDate(iso);
  if (days == null) return null;
  if (days > 1) return `Faltam ${days} dias`;
  if (days === 1) return 'Falta 1 dia';
  if (days === 0) return 'É hoje';
  return 'Evento já aconteceu';
}
