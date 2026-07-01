import { useState } from 'react';

export default function CopyLinkButton({ url, label = 'Copiar link' }: { url: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback discreto caso a Clipboard API não esteja disponível
      window.prompt('Copie o link abaixo:', url);
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 rounded-md bg-ink/5 hover:bg-ink/10 px-2.5 py-1 text-xs font-medium text-ink/70 transition-colors"
      title={url}
    >
      {copied ? 'Link copiado ✓' : label}
    </button>
  );
}
