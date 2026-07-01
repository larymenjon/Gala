import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
  icon?: ReactNode;
}

const variants: Record<string, string> = {
  primary: 'bg-ink text-cream hover:bg-ink-light shadow-soft',
  secondary: 'bg-white text-ink border border-ink/10 hover:border-ink/30',
  ghost: 'bg-transparent text-ink hover:bg-ink/5',
  danger: 'bg-rose/10 text-rose hover:bg-rose/20',
};

const sizes: Record<string, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
};

export default function Button({ variant = 'primary', size = 'md', icon, children, className = '', ...rest }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
