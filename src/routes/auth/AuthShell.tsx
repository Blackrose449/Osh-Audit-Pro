import { ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

const FEATURES = [
  'Walk through a 5-step audit wizard',
  'Capture photos and verify AI suggestions',
  'Review, approve and generate reports',
  'Track corrective actions to closure',
];

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <aside
        className="relative hidden flex-col justify-between overflow-hidden p-12 text-white lg:flex"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 10%, rgba(48,196,160,0.28), transparent 30rem), radial-gradient(circle at 90% 90%, rgba(18,107,88,0.5), transparent 26rem), linear-gradient(160deg, #0B493D 0%, #061f1b 100%)',
        }}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
            <ShieldCheck className="h-6 w-6 text-emerald-300" />
          </span>
          <div>
            <p className="text-lg font-bold tracking-tight">OSH Audit Pro</p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">
              Adaptive safety audits
            </p>
          </div>
        </div>

        <div className="max-w-md">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-200">
            <Sparkles className="h-3.5 w-3.5" /> Interactive demo
          </span>
          <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight">
            Safety audits, without the paperwork chaos.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-white/65">
            One workspace for occupational safety inspections, findings, corrective actions and
            reports — designed for small audit teams.
          </p>
          <ul className="mt-6 space-y-2.5">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-white/80">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="max-w-md rounded-card border border-white/10 bg-white/[0.06] p-4 text-sm text-white/65">
          <p className="font-semibold text-white">Greenfield Workplace Solutions</p>
          <p className="mt-1 text-xs leading-relaxed">
            Demo tenant with 3 client companies, 7 workplaces and seeded audit history. No real
            personal or client data is used.
          </p>
        </div>
      </aside>

      <main className="flex flex-col px-5 py-8 sm:px-10 lg:px-16">
        <div className="flex items-center gap-2 lg:hidden">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary text-white">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <p className="text-base font-bold text-brand-ink">OSH Audit Pro</p>
        </div>
        <div className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-md">
            <h2 className="text-2xl font-bold tracking-tight text-brand-ink">{title}</h2>
            <p className="mt-1 text-sm text-brand-ink/55">{subtitle}</p>
            <div className="mt-7">{children}</div>
            {footer && <div className="mt-6">{footer}</div>}
          </div>
        </div>
        <p className="text-center text-[11px] text-brand-ink/35">
          Front-end demonstration · Mock data stored in your browser
        </p>
      </main>
    </div>
  );
}
