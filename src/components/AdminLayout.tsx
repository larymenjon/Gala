import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  CalendarDays,
  Cog,
  House,
  ListChecks,
  LogOut,
  UserRound,
  Upload,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { isFirebaseConfigured } from '../services/firebase';
import BrandMark from './BrandMark';

const NAV = [
  { to: '/admin/inicio', label: 'Início', icon: House },
  { to: '/admin/listas', label: 'Eventos', icon: ListChecks },
  { to: '/admin/importar', label: 'Importar', icon: Upload },
  { to: '/admin/relatorios', label: 'Relatórios', icon: BarChart3 },
  { to: '/admin/conta', label: 'Conta', icon: UserRound },
  { to: '/admin/configuracoes', label: 'Configurações', icon: Cog },
];

export default function AdminLayout({
  children,
  title,
  breadcrumb,
  actions,
  description,
}: {
  children: ReactNode;
  title: string;
  breadcrumb?: ReactNode;
  actions?: ReactNode;
  description?: string;
}) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F4F1E9] lg:flex">
      <aside className="hidden lg:flex w-72 shrink-0 flex-col bg-ink text-cream/90 px-5 py-6">
        <NavLink to="/admin/inicio" className="mb-10 px-1">
          <BrandMark
            showLabel={false}
            size={38}
            iconClassName="rounded-[12px]"
          />
          <div className="mt-3">
            <div className="font-display text-xl tracking-tight">Gala</div>
            <div className="text-[0.65rem] uppercase tracking-[0.28em] text-cream/45 mt-1">Gestão de eventos</div>
          </div>
        </NavLink>

        <nav className="flex-1 space-y-1 text-sm">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-3 transition-colors ${
                    isActive ? 'bg-gold text-ink shadow-sm' : 'text-cream/80 hover:bg-white/10'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-cream/70">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-gold/15 flex items-center justify-center">
              <CalendarDays className="h-4 w-4 text-gold" />
            </div>
            <div>
              <p className="font-medium text-cream">{user?.name}</p>
              <p className="truncate text-cream/45">{user?.email}</p>
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/admin/login'); }} className="inline-flex items-center gap-2 text-cream/70 hover:text-cream transition-colors">
            <LogOut className="h-4 w-4" />
            Sair da conta
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        {!isFirebaseConfigured && (
          <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <div className="mx-auto flex max-w-7xl items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <p>
                O Firebase não está configurado neste ambiente. Os convites criados aqui ficam só no navegador e não vão abrir para outras pessoas.
              </p>
            </div>
          </div>
        )}
        <header className="sticky top-0 z-20 border-b border-ink/8 bg-white/95 backdrop-blur-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-start justify-between gap-4">
            <div className="min-w-0">
              {breadcrumb && <div className="text-xs text-ink/40 mb-1">{breadcrumb}</div>}
              <h1 className="font-display text-2xl font-medium text-ink">{title}</h1>
              {description && <p className="mt-1 text-sm text-ink/55 max-w-2xl">{description}</p>}
            </div>
            <div className="flex items-center gap-2">{actions}</div>
          </div>

          <div className="lg:hidden border-t border-ink/8 px-4 py-3 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {NAV.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                        isActive ? 'bg-ink text-cream' : 'bg-ink/5 text-ink/70 hover:bg-ink/10'
                      }`
                    }
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          </div>
        </header>

        <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
