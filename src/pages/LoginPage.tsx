import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Field, Input } from '../components/FormFields';
import Button from '../components/Button';
import BrandMark from '../components/BrandMark';
import { Globe, LockKeyhole } from 'lucide-react';

export default function LoginPage() {
  const { login, loginWithGoogle, createGoogleAccount, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@evento.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [googleMode, setGoogleMode] = useState<'login' | 'create'>('login');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    const result = await login(email, password);
    if (result.ok) navigate('/admin/inicio');
    else setError(result.error ?? 'Erro ao entrar.');
  }

  async function handleGoogleAccess() {
    setError('');
    const result = googleMode === 'create' ? await createGoogleAccount() : await loginWithGoogle();
    if (result.ok) navigate('/admin/inicio');
    else setError(result.error ?? 'Não foi possível acessar com o Google.');
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center p-4 bg-noise">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <BrandMark
              showLabel={false}
              size={72}
              iconClassName="rounded-[22px] shadow-[0_18px_40px_rgba(0,0,0,0.35)]"
            />
          </div>
          <h1 className="font-display text-3xl text-cream mb-1">Gala</h1>
          <p className="text-cream/40 text-sm">Painel de gestão de eventos</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-7 shadow-card space-y-4">
          <Field label="E-mail">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
          </Field>
          <Field label="Senha">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              placeholder="Digite sua senha"
            />
          </Field>
          {error && <p className="text-xs text-rose bg-rose/8 rounded-lg px-3 py-2">{error}</p>}
          <Button type="submit" className="w-full justify-center" icon={<LockKeyhole className="h-4 w-4" />} disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>

          <div className="relative py-2">
            <div className="h-px bg-ink/10" />
            <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 mx-auto w-fit bg-white px-3 text-[10px] uppercase tracking-[0.3em] text-ink/35">
              ou
            </span>
          </div>

          <div className="space-y-2">
            <Button
              type="button"
              variant="secondary"
              className="w-full justify-center"
              icon={<Globe className="h-4 w-4" />}
              onClick={handleGoogleAccess}
              disabled={loading}
            >
              {googleMode === 'create' ? 'Criar conta com Google' : 'Continuar com Google'}
            </Button>
            <button
              type="button"
              onClick={() => setGoogleMode((mode) => (mode === 'login' ? 'create' : 'login'))}
              className="w-full text-center text-xs text-ink/45 hover:text-ink/70 transition-colors"
            >
              {googleMode === 'create' ? 'Já tenho conta Google' : 'Quero criar conta com Google'}
            </button>
          </div>
        </form>

        <p className="text-center text-cream/25 text-xs mt-6">
          O Google cria ou acessa sua conta automaticamente. O e-mail e senha continuam disponíveis para a conta local de demonstração.
        </p>
      </div>
    </div>
  );
}
