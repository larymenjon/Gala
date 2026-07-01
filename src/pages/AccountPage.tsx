import { useEffect, useRef, useState } from 'react';
import { Camera, Crown, LogOut, ShieldAlert, Trash2, UserRound } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import Button from '../components/Button';
import ConfirmDialog from '../components/ConfirmDialog';
import { Field, Input } from '../components/FormFields';
import { useAuth } from '../hooks/useAuth';
import { formatDateShort } from '../utils/format';

export default function AccountPage() {
  const { user, logout, updateAccount, updateProfilePhoto, deleteAccount } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(user?.name ?? '');
    setEmail(user?.email ?? '');
  }, [user?.name, user?.email]);

  async function handleSave() {
    setMessage('');
    setError('');
    const result = await updateAccount({
      name,
      email,
      password: password || undefined,
    });
    if (!result.ok) {
      setError(result.error ?? 'Não foi possível atualizar a conta.');
      return;
    }
    setPassword('');
    setMessage('Dados da conta atualizados com sucesso.');
  }

  async function handlePhoto(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const photoUrl = String(reader.result ?? '');
      await updateProfilePhoto(photoUrl);
      setMessage('Foto de perfil atualizada.');
    };
    reader.readAsDataURL(file);
  }

  async function handleDeleteAccount() {
    const result = await deleteAccount();
    if (!result.ok) {
      setError(result.error ?? 'Não foi possível excluir a conta.');
      return;
    }
    logout();
  }

  return (
    <AdminLayout
      title="Conta"
      description="Gerencie os dados do seu acesso com segurança."
      actions={<Button variant="secondary" icon={<LogOut className="h-4 w-4" />} onClick={logout}>Sair</Button>}
    >
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="space-y-4">
          <div className="rounded-2xl border border-ink/8 bg-white p-5 shadow-soft">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gold/10 overflow-hidden flex items-center justify-center text-gold-dark">
                {user?.photoUrl ? <img src={user.photoUrl} alt={user.name} className="h-full w-full object-cover" /> : <UserRound className="h-7 w-7" />}
              </div>
              <div>
                <h2 className="font-display text-xl font-medium text-ink">{user?.name}</h2>
                <p className="text-sm text-ink/50">{user?.email}</p>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="mt-2 inline-flex items-center gap-2 text-sm text-gold-dark hover:text-gold transition-colors"
                >
                  <Camera className="h-4 w-4" />
                  Alterar foto
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handlePhoto(e.target.files?.[0] ?? null)} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-ink/8 bg-white p-5 shadow-soft space-y-3 text-sm text-ink/65">
            <p className="flex items-center gap-2"><Crown className="h-4 w-4 text-gold-dark" /> Plano: <strong className="text-ink">{user?.plan?.name ?? 'Sem plano'}</strong></p>
            <p>Status: <strong className="text-ink">{user?.plan?.status ?? 'Sem informação'}</strong></p>
            <p>Autenticação: <strong className="text-ink">{user?.authProvider === 'google' ? 'Google' : user?.authProvider === 'password' ? 'E-mail e senha' : 'Local'}</strong></p>
            <p>Conta criada em: <strong className="text-ink">{user?.createdAt ? formatDateShort(user.createdAt.slice(0, 10)) : '---'}</strong></p>
            {user?.plan?.renewAt && <p>Renovação: <strong className="text-ink">{formatDateShort(user.plan.renewAt.slice(0, 10))}</strong></p>}
          </div>

          <div className="rounded-2xl border border-rose/20 bg-rose/8 p-5">
            <div className="flex items-center gap-2 text-rose font-medium mb-2">
              <ShieldAlert className="h-4 w-4" />
              Área sensível
            </div>
            <p className="text-sm text-ink/60">Alterar e-mail e senha afeta o próximo acesso ao sistema. A exclusão da conta apaga sua sessão local imediatamente.</p>
          </div>
        </section>

        <section className="rounded-2xl border border-ink/8 bg-white p-6 shadow-soft space-y-4">
          <h3 className="font-display text-xl font-medium">Editar dados da conta</h3>

          <Field label="Nome">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>

          <Field label="E-mail">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>

          <Field label="Nova senha" hint="Deixe em branco para manter a senha atual.">
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Digite uma nova senha" />
          </Field>

          {message && <p className="rounded-xl bg-sage/10 px-4 py-3 text-sm text-[#4F6650]">{message}</p>}
          {error && <p className="rounded-xl bg-rose/8 px-4 py-3 text-sm text-rose">{error}</p>}

          <div className="flex flex-wrap gap-2 pt-2">
            <Button onClick={handleSave}>Salvar alterações</Button>
            <Button
              variant="danger"
              icon={<Trash2 className="h-4 w-4" />}
              onClick={() => setConfirmDelete(true)}
            >
              Excluir conta
            </Button>
          </div>
        </section>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Excluir conta"
        message="Essa ação é definitiva. Sua conta e a sessão atual serão removidas deste navegador."
        confirmLabel="Excluir definitivamente"
        danger
        onConfirm={handleDeleteAccount}
        onClose={() => setConfirmDelete(false)}
      />
    </AdminLayout>
  );
}
