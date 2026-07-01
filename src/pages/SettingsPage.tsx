import { useState } from 'react';
import { DatabaseZap, RefreshCcw, SlidersHorizontal, Trash2 } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import Button from '../components/Button';
import ConfirmDialog from '../components/ConfirmDialog';
import { localDb } from '../services/storage';
import { useEvents } from '../hooks/useEvents';
import { useAuth } from '../hooks/useAuth';

export default function SettingsPage() {
  const { events, refresh } = useEvents();
  const { user } = useAuth();
  const [clearOpen, setClearOpen] = useState(false);
  const [message, setMessage] = useState('');

  function handleResetDemo() {
    localStorage.removeItem('rsvp_system_v1:events');
    localStorage.removeItem('rsvp_system_v1:guests');
    setMessage('Dados de demonstração removidos. Recarregue a página para começar do zero.');
    refresh();
  }

  function handleExportSnapshot() {
    const snapshot = {
      events: localDb.read('events', []),
      guests: localDb.read('guests', []),
      user,
    };
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gala-backup.json';
    a.click();
    URL.revokeObjectURL(url);
    setMessage('Backup local exportado com sucesso.');
  }

  return (
    <AdminLayout
      title="Configurações"
      description="Ajustes gerais do ambiente e manutenção dos dados."
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <section className="space-y-4">
          <div className="rounded-2xl border border-ink/8 bg-white p-5 shadow-soft">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-11 w-11 rounded-2xl bg-gold/10 flex items-center justify-center text-gold-dark">
                <SlidersHorizontal className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-xl font-medium">Preferências do sistema</h2>
                <p className="text-sm text-ink/50">Estas opções afetam apenas este navegador.</p>
              </div>
            </div>
            <div className="space-y-3 text-sm text-ink/65">
              <p>Listas cadastradas: <strong className="text-ink">{events.length}</strong></p>
              <p>Conta ativa: <strong className="text-ink">{user?.email ?? '---'}</strong></p>
            </div>
          </div>

          <div className="rounded-2xl border border-ink/8 bg-white p-5 shadow-soft">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-11 w-11 rounded-2xl bg-rose/10 flex items-center justify-center text-rose">
                <DatabaseZap className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-xl font-medium">Manutenção</h2>
                <p className="text-sm text-ink/50">Ações úteis para administrar os dados locais.</p>
              </div>
            </div>

            {message && <p className="mb-4 rounded-xl bg-sage/10 px-4 py-3 text-sm text-[#4F6650]">{message}</p>}

            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" icon={<RefreshCcw className="h-4 w-4" />} onClick={handleExportSnapshot}>
                Exportar backup
              </Button>
              <Button variant="danger" icon={<Trash2 className="h-4 w-4" />} onClick={() => setClearOpen(true)}>
                Limpar demonstração
              </Button>
            </div>
          </div>
        </section>

        <aside className="rounded-2xl border border-ink/8 bg-white p-5 shadow-soft">
          <h3 className="font-display text-lg font-medium mb-3">Sobre o ambiente</h3>
          <div className="space-y-3 text-sm text-ink/60">
            <p>Os dados deste projeto ficam no armazenamento local do navegador.</p>
            <p>A exportação de backup gera um JSON simples para auditoria e restauração manual.</p>
            <p>Se conectar um backend no futuro, esta área pode virar configuração de conta, integrações e branding.</p>
          </div>
        </aside>
      </div>

      <ConfirmDialog
        open={clearOpen}
        title="Limpar demonstração"
        message="Todos os eventos e convidados de demonstração serão removidos do navegador. Deseja continuar?"
        confirmLabel="Limpar"
        danger
        onConfirm={handleResetDemo}
        onClose={() => setClearOpen(false)}
      />
    </AdminLayout>
  );
}
