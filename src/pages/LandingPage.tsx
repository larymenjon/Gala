import { useMemo } from 'react';
import { ArrowRight, CheckCircle2, FileSpreadsheet, Heart, Link2, Mail, PenTool, ShieldCheck, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import BrandMark from '../components/BrandMark';

const features = [
  { icon: PenTool, title: 'Criação do convite', description: 'Personalize cada detalhe do seu evento e envie para os seus convidados.' },
  { icon: Mail, title: 'Convite recebido', description: 'Seus convidados recebem um convite bonito, completo e fácil de abrir no celular.' },
  { icon: CheckCircle2, title: 'Confirmação de presença', description: 'As confirmações chegam em tempo real e já entram no painel do evento.' },
];

const benefits = [
  { icon: Link2, title: 'Link único', description: 'Um link exclusivo para cada convite.' },
  { icon: UsersRound, title: 'Confirmações', description: 'Controle de convidados em tempo real.' },
  { icon: FileSpreadsheet, title: 'Relatórios', description: 'Exportação em PDF e CSV quando quiser.' },
  { icon: ShieldCheck, title: 'Dados seguros', description: 'Suas informações ficam organizadas e protegidas.' },
];

const eventTypes = ['Casamentos', 'Chás de bebê', 'Aniversários', 'Formaturas', 'Igreja', 'Corporativo'];

export default function LandingPage() {
  const stats = useMemo(
    () => [
      { value: '250+', label: 'convites criados' },
      { value: '99,9%', label: 'clareza nas confirmações' },
      { value: '1 clique', label: 'exportação CSV/PDF' },
    ],
    [],
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#fff7f0_0%,#fbf2ea_36%,#f6ebdf_62%,#f8f4ef_100%)] text-ink">
      <Backdrop />

      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-5 sm:px-6 lg:px-8">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div className="rounded-full border border-[#e7d5c7] bg-white/70 px-4 py-2 text-xs uppercase tracking-[0.28em] text-gold-dark shadow-[0_12px_30px_rgba(15,27,51,0.06)] backdrop-blur-sm">
            Convites premium para celular
          </div>
          <BrandMark
            size={54}
            className="items-center gap-3"
            iconClassName="rounded-[16px] shadow-[0_14px_35px_rgba(15,27,51,0.10)]"
            labelClassName="text-[clamp(2rem,3vw,3rem)]"
            subtitleClassName="text-[0.58rem] tracking-[0.36em] text-gold-dark"
          />
        </header>

        <section className="text-center">
          <h1 className="mx-auto max-w-4xl font-display text-[clamp(2.9rem,5vw,5.6rem)] leading-[0.95] tracking-[-0.04em] text-[#17263b]">
            Do seu jeito. Para seus convidados.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-ink/70 sm:text-lg">
            Crie convites personalizados e acompanhe confirmações em tempo real, com uma experiência feita para brilhar no celular.
          </p>
        </section>

        <section className="mt-12 grid gap-5 lg:grid-cols-[1.1fr_0.95fr_0.95fr]">
          {features.map(({ icon: Icon, title, description }, index) => (
            <article
              key={title}
              className={`rounded-[28px] border border-[#e8d9c9] bg-white/75 p-5 text-left shadow-[0_18px_45px_rgba(15,27,51,0.06)] backdrop-blur-sm ${
                index === 0 ? 'lg:translate-y-2' : ''
              }`}
            >
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-gold/20 bg-gold/8 text-gold-dark">
                <Icon className="h-7 w-7" />
              </div>
              <h2 className="font-display text-2xl text-[#8b5c2d]">{title}</h2>
              <p className="mt-2 text-sm leading-7 text-ink/65">{description}</p>
            </article>
          ))}
        </section>

        <section className="mt-10 grid gap-8 lg:grid-cols-[1.18fr_0.82fr]">
          <div className="relative overflow-hidden rounded-[38px] border border-[#eadccf] bg-[linear-gradient(180deg,#fffdf9_0%,#fcf7f2_100%)] p-4 shadow-[0_24px_80px_rgba(15,27,51,0.10)]">
            <div className="absolute left-[-10%] top-[-10%] h-64 w-64 rounded-full bg-gold/10 blur-3xl" />
            <div className="absolute bottom-[-12%] right-[-8%] h-64 w-64 rounded-full bg-rose/10 blur-3xl" />

            <div className="relative overflow-hidden rounded-[28px] border border-[#e8d9c9] bg-[#0f1b33] p-4 text-white shadow-[0_16px_45px_rgba(15,27,51,0.25)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.26em] text-white/45">Criação do convite</p>
                  <h3 className="mt-2 font-display text-2xl">Novo convite</h3>
                </div>
                <div className="flex gap-2">
                  <button className="rounded-xl border border-white/15 px-3 py-2 text-xs text-white/80">Salvar rascunho</button>
                  <button className="rounded-xl bg-white px-4 py-2 text-xs font-semibold text-[#0f1b33]">Próximo</button>
                </div>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[220px_1fr]">
                <aside className="rounded-[22px] border border-white/10 bg-white/5 p-3">
                  <SidebarStep title="Modelo" desc="Escolha um modelo" active />
                  <SidebarStep title="Cores e fontes" desc="Personalize estilo" />
                  <SidebarStep title="Informações" desc="Detalhes do evento" />
                  <SidebarStep title="Perguntas" desc="Confirmação e adicionais" />
                  <SidebarStep title="Mensagem" desc="Mensagem aos convidados" />
                  <SidebarStep title="Prévia e envio" desc="Revise e envie" />
                </aside>

                <div className="rounded-[24px] bg-[#fbf6ef] p-4 text-[#15223a]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-[#8b5c2d]">Escolha um modelo</p>
                      <p className="mt-1 text-sm text-[#5f6674]">Selecione um modelo para o seu convite.</p>
                    </div>
                    <div className="rounded-full border border-[#d8c4ae] px-3 py-1 text-xs text-[#8b5c2d]">Todos</div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    <TemplateCard title="Floral Rosé" subtitle="Chá de bebê" accent="bg-[#ffdfe1]" />
                    <TemplateCard title="Minimalista" subtitle="Elegante" accent="bg-[#f5ead7]" />
                    <TemplateCard title="Clássico" subtitle="Evento especial" accent="bg-[#efe6db]" />
                    <TemplateCard title="Botânico" subtitle="Jantar" accent="bg-[#e7efe0]" />
                    <TemplateCard title="Moderno" subtitle="Formatura" accent="bg-[#e9eff9]" />
                    <TemplateCard title="Aquarela" subtitle="Celebração" accent="bg-[#f9e7e9]" />
                  </div>

                  <div className="mt-4 rounded-[22px] border border-[#e4d7c8] bg-white p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-[#8b5c2d]">Cores e fontes</p>
                    <div className="mt-3 flex flex-wrap gap-3">
                      {['#f3ddcf', '#efc5bb', '#ead9c3', '#8b5c2d', '#0f1b33'].map((color) => (
                        <span key={color} className="h-8 w-8 rounded-full border border-black/5 shadow-sm" style={{ backgroundColor: color }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <PhonePreview
              title="Convite recebido"
              description="Seus convidados recebem um convite lindo e completo."
              accent="bg-[#f4ddd6]"
              buttonLabel="Confirmar presença"
              footer="O convite pode ser compartilhado por link, WhatsApp, e-mail ou QR Code."
            />
            <PhonePreview
              title="Confirmação de presença"
              description="Os convidados confirmam presença de forma rápida e prática."
              accent="bg-[#f1ddda]"
              buttonLabel="Enviar confirmação"
              footer="As confirmações aparecem em tempo real no painel do evento."
              confirmationMode
            />
          </div>
        </section>

        <section className="mt-10 rounded-[34px] border border-[#eadbcf] bg-white/80 px-6 py-6 shadow-[0_20px_60px_rgba(15,27,51,0.08)] backdrop-blur-sm">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {benefits.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-gold/20 bg-gold/8 text-gold-dark">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-[#17263b]">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-ink/60">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {eventTypes.map((item) => (
            <span key={item} className="rounded-full border border-[#e7d7ca] bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-ink/55 shadow-[0_10px_25px_rgba(15,27,51,0.04)]">
              {item}
            </span>
          ))}
        </section>

        <section className="mt-10 grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-[24px] border border-[#eadbcf] bg-white/80 p-5 text-center shadow-[0_18px_45px_rgba(15,27,51,0.06)]">
              <div className="font-display text-3xl text-[#17263b]">{stat.value}</div>
              <div className="mt-2 text-xs uppercase tracking-[0.28em] text-ink/45">{stat.label}</div>
            </div>
          ))}
        </section>

        <div className="mt-12 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link to="/admin/login" className="inline-flex items-center justify-center gap-2 rounded-[18px] bg-[#17263b] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_20px_60px_rgba(15,27,51,0.18)] transition-transform hover:-translate-y-0.5">
            Criar meu convite
            <ArrowRight className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="rounded-[18px] border border-[#d9c1aa] bg-white/65 px-6 py-3.5 text-sm font-semibold text-[#8b5c2d] shadow-[0_16px_45px_rgba(15,27,51,0.06)]"
          >
            Ver detalhes
          </button>
        </div>

        <section id="how-it-works" className="mt-14 pb-10">
          <div className="rounded-[32px] border border-[#eadbcf] bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,27,51,0.08)] backdrop-blur-sm sm:p-8">
            <div className="mb-8 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-gold-dark">Como funciona</p>
              <h2 className="mt-3 font-display text-3xl text-[#17263b] sm:text-4xl">Crie, envie e acompanhe tudo em um só lugar.</h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-ink/60">
                O Gala foi pensado para que o convite chegue bonito no celular do convidado e as confirmações apareçam direto no painel do evento.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {[
                { step: '01', title: 'Monte o convite', description: 'Escolha o modelo, personalize a arte e adicione as informações do evento.', icon: Heart },
                { step: '02', title: 'Compartilhe o link', description: 'Envie o convite por WhatsApp, e-mail ou redes sociais em poucos segundos.', icon: Link2 },
                { step: '03', title: 'Acompanhe as respostas', description: 'As confirmações chegam em tempo real e entram na sua lista automaticamente.', icon: FileSpreadsheet },
              ].map(({ step, title, description, icon: Icon }) => (
                <article key={step} className="rounded-[24px] border border-[#eadbcf] bg-[#fffdfb] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-dark">{step}</div>
                      <h3 className="mt-3 font-display text-2xl text-[#17263b]">{title}</h3>
                    </div>
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-gold/20 bg-gold/8 text-gold-dark">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-ink/60">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function TemplateCard({ title, subtitle, accent }: { title: string; subtitle: string; accent: string }) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-[#e6d9cb] bg-white shadow-[0_16px_35px_rgba(15,27,51,0.05)]">
      <div className={`h-28 ${accent}`} />
      <div className="p-3">
        <p className="font-display text-lg text-[#17263b]">{title}</p>
        <p className="mt-1 text-xs uppercase tracking-[0.24em] text-ink/45">{subtitle}</p>
      </div>
    </div>
  );
}

function SidebarStep({ title, desc, active = false }: { title: string; desc: string; active?: boolean }) {
  return (
    <div className={`mb-2 rounded-[16px] border px-3 py-3 ${active ? 'border-gold/30 bg-gold/12 text-white' : 'border-white/10 bg-white/5 text-white/75'}`}>
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-0.5 text-xs opacity-75">{desc}</p>
    </div>
  );
}

function PhonePreview({
  title,
  description,
  accent,
  buttonLabel,
  footer,
  confirmationMode = false,
}: {
  title: string;
  description: string;
  accent: string;
  buttonLabel: string;
  footer: string;
  confirmationMode?: boolean;
}) {
  return (
    <div className="mx-auto w-full max-w-[360px]">
      <div className="mb-4 text-center">
        <div className="mx-auto mb-3 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-gold/20 bg-white/70 text-gold-dark shadow-[0_14px_30px_rgba(15,27,51,0.06)]">
          {confirmationMode ? <CheckCircle2 className="h-7 w-7" /> : <Mail className="h-7 w-7" />}
        </div>
        <h3 className="font-display text-2xl text-[#8b5c2d]">{title}</h3>
        <p className="mt-2 text-sm leading-7 text-ink/60">{description}</p>
      </div>

      <div className="rounded-[36px] border border-[#eadbcf] bg-[#0f1b33] p-3 shadow-[0_24px_65px_rgba(15,27,51,0.18)]">
        <div className={`overflow-hidden rounded-[28px] ${accent} p-4`}>
          <div className="rounded-[26px] border border-white/30 bg-white/75 px-4 py-5 text-center text-[#3d3d4d] shadow-[0_18px_45px_rgba(15,27,51,0.10)] backdrop-blur-sm">
            <p className="font-display text-[1.7rem] leading-tight text-[#8b5c2d]">
              {confirmationMode ? 'Confirme sua presença' : 'Chá de Bebê da Betina'}
            </p>
            <p className="mt-2 text-sm uppercase tracking-[0.24em] text-[#8b5c2d]/80">
              {confirmationMode ? 'Confirmação de presença' : '25 de Maio de 2024'}
            </p>

            <div className="mx-auto mt-5 max-w-[245px] rounded-[18px] border border-[#e8cdbd] bg-white/85 px-4 py-4 text-sm leading-7">
              {confirmationMode ? (
                <div className="space-y-3 text-left">
                  <FieldRow label="Seu nome" value="Ana" />
                  <FieldRow label="Quem vai comparecer?" value="Laryssa, Jhone, Heitor" />
                  <FieldRow label="Pessoas da casa" value="3 pessoas" />
                </div>
              ) : (
                <div className="space-y-3 text-center">
                  <p>Salão de Festas Encanto</p>
                  <p>Rua das Flores, 123 - Curitiba/PR</p>
                  <p>Sua presença tornará este dia ainda mais especial.</p>
                </div>
              )}
            </div>

            <button
              type="button"
              className="mt-5 w-full rounded-[16px] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(204,129,120,0.28)]"
              style={{ backgroundColor: confirmationMode ? '#d58b82' : '#c98b7f' }}
            >
              {buttonLabel}
            </button>

            {confirmationMode && (
              <p className="mt-4 text-xs leading-6 text-ink/55">
                Obrigado! <span className="font-semibold">Sua confirmação foi registrada.</span>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-[18px] border border-[#e6d8ca] bg-white/75 px-4 py-3 text-center text-sm text-ink/60 shadow-[0_10px_28px_rgba(15,27,51,0.05)]">
        {footer}
      </div>
    </div>
  );
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.2em] text-ink/45">{label}</p>
      <p className="mt-1 text-sm text-[#17263b]">{value}</p>
    </div>
  );
}

function Backdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute left-[-10%] top-[-12%] h-[30rem] w-[30rem] rounded-full bg-gold/10 blur-3xl" />
      <div className="absolute right-[-8%] top-[10%] h-[24rem] w-[24rem] rounded-full bg-rose/10 blur-3xl" />
      <div className="absolute bottom-[-14%] left-[6%] h-[22rem] w-[22rem] rounded-full bg-white/70 blur-3xl" />
    </div>
  );
}
