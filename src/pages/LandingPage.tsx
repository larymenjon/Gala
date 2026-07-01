import { useMemo } from 'react';
import { ArrowRight, BarChart3, CheckCircle2, FileSpreadsheet, Heart, Link2, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import BrandMark from '../components/BrandMark';

const features = [
  { icon: Link2, title: 'Links únicos para convidados', description: 'Cada convidado recebe um link exclusivo e fácil de compartilhar.' },
  { icon: CheckCircle2, title: 'Confirmações em tempo real', description: 'As respostas chegam instantaneamente, sem retrabalho manual.' },
  { icon: BarChart3, title: 'Painel ao vivo', description: 'Acompanhe status, taxa de resposta e ocupação com clareza.' },
  { icon: FileSpreadsheet, title: 'Exportação PDF e CSV', description: 'Exporte listas e relatórios com um clique.' },
  { icon: UsersRound, title: 'Gestão de convidados', description: 'Organize convidados, limites e respostas em um só lugar.' },
];

const eventTypes = ['Casamentos', 'Chás de bebê', 'Aniversários', 'Formaturas', 'Eventos da igreja', 'Eventos corporativos'];

const confetti = [
  { top: '7%', left: '18%', rotate: '-22deg', size: 'w-2 h-2', color: 'bg-gold/40' },
  { top: '12%', left: '54%', rotate: '18deg', size: 'w-1.5 h-1.5', color: 'bg-rose/40' },
  { top: '18%', left: '74%', rotate: '35deg', size: 'w-2 h-2', color: 'bg-gold/35' },
  { top: '30%', left: '8%', rotate: '12deg', size: 'w-1.5 h-1.5', color: 'bg-[#D9A7A2]/45' },
  { top: '44%', left: '88%', rotate: '-18deg', size: 'w-2 h-2', color: 'bg-gold/30' },
  { top: '68%', left: '14%', rotate: '28deg', size: 'w-1.5 h-1.5', color: 'bg-rose/35' },
  { top: '74%', left: '76%', rotate: '-14deg', size: 'w-2 h-2', color: 'bg-gold/30' },
  { top: '84%', left: '45%', rotate: '26deg', size: 'w-1.5 h-1.5', color: 'bg-[#D9A7A2]/35' },
];

export default function LandingPage() {
  const stats = useMemo(
    () => [
      { value: '250+', label: 'eventos gerenciados' },
      { value: '99,9%', label: 'clareza nas confirmações' },
      { value: '1 clique', label: 'exportação CSV/PDF' },
    ],
    [],
  );

  const mockupSrc = `${import.meta.env.BASE_URL}Mockup.svg`;

  return (
    <main className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,#fffdf9_0%,#fbf8f4_38%,#f4e2de_100%)] text-ink">
      <DecorativeBackground />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between py-6 sm:py-8">
          <BrandMark
            size={48}
            iconClassName="rounded-[14px] shadow-[0_14px_35px_rgba(15,27,51,0.10)]"
            labelClassName="text-[clamp(2.25rem,4vw,3.5rem)]"
            subtitleClassName="text-[0.62rem] tracking-[0.38em] text-ink/45"
          />

          <nav className="hidden md:flex items-center gap-6 text-sm text-ink/60">
            <span>Gestão premium</span>
            <span>Design editorial</span>
            <span>Controle em tempo real</span>
          </nav>
        </header>

        <section className="grid items-center gap-12 pb-16 pt-6 lg:grid-cols-[0.98fr_1.02fr] lg:pb-24 lg:pt-10">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#F1EAE6] bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-gold-dark shadow-[0_12px_35px_rgba(15,27,51,0.05)] backdrop-blur-sm">
              Plataforma premium de eventos
            </div>

            <h1 className="font-display text-[clamp(3.4rem,8vw,6.8rem)] leading-[0.88] tracking-[-0.04em] text-ink">
              Convide.
              <span className="block text-gold-dark">Confirme.</span>
              Celebre.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-ink/65 sm:text-lg">
              O Gala ajuda você a criar convites personalizados, gerar links exclusivos para convidados e acompanhar confirmações em tempo real.
              Foi pensado para quem deseja uma experiência refinada, confiável e muito bem organizada.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/admin/login"
                className="inline-flex items-center justify-center gap-2 rounded-[16px] bg-ink px-6 py-3.5 text-sm font-semibold text-white shadow-[0_20px_60px_rgba(15,27,51,0.18)] transition-transform hover:-translate-y-0.5 hover:bg-ink-light"
              >
                Criar meu evento
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="inline-flex items-center justify-center gap-2 rounded-[16px] border border-gold/70 bg-white/45 px-6 py-3.5 text-sm font-semibold text-gold-dark shadow-[0_20px_60px_rgba(15,27,51,0.06)] backdrop-blur-sm transition-colors hover:border-gold hover:bg-white/80"
              >
                Ver como funciona
              </button>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {features.map(({ icon: Icon, title, description }) => (
                <div key={title} className="rounded-[24px] border border-[#F1EAE6] bg-white p-4 shadow-[0_20px_60px_rgba(15,27,51,0.08)]">
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-gold/20 bg-gold/8 text-gold-dark">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <h2 className="font-display text-xl leading-tight text-ink">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-ink/55">{description}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-2">
              {eventTypes.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-[#F1EAE6] bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-ink/55 shadow-[0_10px_25px_rgba(15,27,51,0.04)]"
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-6 border-t border-[#F1EAE6] pt-6">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="font-display text-3xl text-ink">{stat.value}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.28em] text-ink/45">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[760px]">
            <div className="absolute -left-6 top-10 h-28 w-28 rounded-full bg-gold/12 blur-3xl" />
            <div className="absolute -right-4 bottom-12 h-36 w-36 rounded-full bg-rose/10 blur-3xl" />

            <div className="relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[760px]">
                <div className="absolute -left-8 top-14 z-0 h-[82%] w-[82%] rounded-[36px] bg-white/50 blur-[18px]" />
                <div className="relative overflow-hidden rounded-[36px] border border-[#F1EAE6] bg-white shadow-[0_20px_60px_rgba(15,27,51,0.08)]">
                  <img
                    src={mockupSrc}
                    alt="Mockup do app Gala com painel e convite de eventos"
                    className="block h-auto w-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="pb-20 lg:pb-28">
          <div className="rounded-[32px] border border-[#F1EAE6] bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,27,51,0.08)] backdrop-blur-sm sm:p-8">
            <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.34em] text-gold-dark">Como funciona</p>
                <h2 className="mt-3 font-display text-3xl text-ink sm:text-4xl">Feito para parecer simples desde o primeiro convite.</h2>
              </div>
              <p className="max-w-xl text-sm leading-7 text-ink/60">
                O Gala entrega convites refinados, fluxo de confirmações ao vivo e um painel centralizado para você organizar tudo com confiança.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {[
                { step: '01', title: 'Monte o convite', description: 'Personalize a página com detalhes elegantes e identidade visual.', icon: Heart },
                { step: '02', title: 'Compartilhe o link de acesso', description: 'Envie um link único para cada convidado, família ou grupo.', icon: Link2 },
                { step: '03', title: 'Acompanhe e exporte', description: 'Veja as confirmações ao vivo e exporte relatórios quando quiser.', icon: FileSpreadsheet },
              ].map(({ step, title, description, icon: Icon }) => (
                <div key={step} className="rounded-[24px] border border-[#F1EAE6] bg-[#FFFEFC] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-dark">{step}</div>
                      <h3 className="mt-3 font-display text-2xl text-ink">{title}</h3>
                    </div>
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-gold/20 bg-gold/8 text-gold-dark">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-ink/60">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function DecorativeBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute left-[-8%] top-[-10%] h-[36rem] w-[36rem] rounded-full bg-gold/10 blur-3xl" />
      <div className="absolute right-[-10%] top-[16%] h-[32rem] w-[32rem] rounded-full bg-rose/12 blur-3xl" />
      <div className="absolute bottom-[-12%] left-[10%] h-[24rem] w-[24rem] rounded-full bg-white/70 blur-3xl" />

      <div className="absolute inset-0 opacity-70">
        {confetti.map((piece, index) => (
          <span
            key={`${piece.top}-${index}`}
            className={`absolute ${piece.size} rounded-sm ${piece.color} shadow-[0_8px_20px_rgba(15,27,51,0.10)]`}
            style={{ top: piece.top, left: piece.left, transform: `rotate(${piece.rotate})` }}
          />
        ))}
      </div>

      <div className="absolute right-[6%] top-[10%] h-28 w-28 rounded-full border border-gold/20 opacity-70" />
      <div className="absolute right-[2%] top-[14%] h-40 w-40 rounded-full border border-gold/10 opacity-50" />
      <div className="absolute left-[5%] bottom-[12%] h-24 w-24 rounded-full border border-rose/20 opacity-70" />
      <div className="absolute left-[12%] bottom-[8%] h-40 w-40 rounded-full border border-rose/10 opacity-50" />
      <div className="absolute left-[50%] top-[22%] h-px w-44 -translate-x-1/2 rotate-[-18deg] rounded-full bg-gradient-to-r from-transparent via-gold/35 to-transparent blur-[1px]" />
      <div className="absolute left-[58%] top-[28%] h-px w-56 -translate-x-1/2 rotate-[18deg] rounded-full bg-gradient-to-r from-transparent via-rose/25 to-transparent blur-[1px]" />
    </div>
  