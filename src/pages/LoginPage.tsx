import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Field, Input } from '../components/FormFields';
import Button from '../components/Button';
import BrandMark from '../components/BrandMark';
import { LockKeyhole } from 'lucide-react';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@evento.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    const result = await login(email, password);
    if (result.ok) navigate('/admin/inicio');
    else setError(result.error ?? 'Erro ao entrar.');
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
        </form>

        <p className="text-center text-cream/25 text-xs mt-6">
          Credenciais padrão: admin@evento.com / admin123
        </p>
      </div>
    </div>
  );
}
