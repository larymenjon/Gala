export default function MetricCard({ label, value, suffix, accent = 'ink' }: { label: string; value: string | number; suffix?: string; accent?: 'ink' | 'sage' | 'rose' | 'gold' }) {
  const accentClasses: Record<string, string> = {
    ink: 'text-ink',
    sage: 'text-[#4F6650]',
    rose: 'text-rose',
    gold: 'text-gold-dark',
  };
  return (
    <div className="bg-white rounded-2xl border border-ink/8 p-5 shadow-soft">
      <p className="text-xs font-medium text-ink/45 uppercase tracking-wide mb-2">{label}</p>
      <p className={`font-display text-3xl font-medium ${accentClasses[accent]}`}>
        {value}
        {suffix && <span className="text-base font-body font-normal text-ink/40 ml-1">{suffix}</span>}
      </p>
    </div>
  );
}
