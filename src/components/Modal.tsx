import type { ReactNode } from 'react';
import { useEffect } from 'react';

export default function Modal({ open, onClose, title, children, width = 'max-w-lg' }: { open: boolean; onClose: () => void; title: string; children: ReactNode; width?: string }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${width} bg-white rounded-2xl shadow-card max-h-[90vh] overflow-y-auto animate-[fadeIn_0.15s_ease-out]`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink/10 sticky top-0 bg-white rounded-t-2xl">
          <h3 className="font-display text-lg font-medium">{title}</h3>
          <button onClick={onClose} aria-label="Fechar" className="text-ink/40 hover:text-ink transition-colors text-xl leading-none p-1">
            ×
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
