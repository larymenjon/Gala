import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';

export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-ink/80 mb-1.5">{label}</span>
      {children}
      {hint && !error && <span className="block text-xs text-ink/40 mt-1">{hint}</span>}
      {error && <span className="block text-xs text-rose mt-1">{error}</span>}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className = '', ...rest } = props;
  return (
    <input
      className={`w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/30 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-colors ${className}`}
      {...rest}
    />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = '', ...rest } = props;
  return (
    <textarea
      className={`w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/30 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-colors resize-none ${className}`}
      {...rest}
    />
  );
}
