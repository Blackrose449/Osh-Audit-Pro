import { Modal } from '@/components/ui';
import { Command, Keyboard, MousePointerClick, RotateCcw } from 'lucide-react';

const DEMO_ACCOUNTS = [
  { role: 'Admin', email: 'grace@greenfield.example' },
  { role: 'Auditor', email: 'auditor@greenfield.example' },
  { role: 'Reviewer', email: 'reviewer@greenfield.example' },
  { role: 'Viewer', email: 'viewer@greenfield.example' },
];

export function HelpDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Help & demo guide"
      description="Everything runs in your browser with mock data."
      size="lg"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Tip
          icon={<MousePointerClick className="h-4 w-4" />}
          title="Start with a company"
          body="Open Companies, choose a client, then add a workplace or start an audit."
        />
        <Tip
          icon={<Keyboard className="h-4 w-4" />}
          title="Search anything"
          body="Use the search bar or press Ctrl/Cmd + K to jump to companies, audits and actions."
        />
        <Tip
          icon={<Command className="h-4 w-4" />}
          title="Try the audit flow"
          body="New audit → findings → Analyze photos for AI suggestions → review → report."
        />
        <Tip
          icon={<RotateCcw className="h-4 w-4" />}
          title="Reset anytime"
          body="Use Profile → Reset demo data to restore the seeded records."
        />
      </div>

      <div className="mt-4 rounded-card border border-brand-border bg-brand-light/60 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-ink/50">
          Demo accounts
        </p>
        <p className="mt-1 text-xs text-brand-ink/60">
          Password for every account is <code className="rounded bg-white px-1.5 py-0.5">password</code>.
        </p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {DEMO_ACCOUNTS.map((account) => (
            <li
              key={account.email}
              className="flex items-center justify-between gap-2 rounded-button bg-white px-3 py-2 text-xs ring-1 ring-brand-border"
            >
              <span className="font-semibold text-brand-ink">{account.role}</span>
              <span className="truncate text-brand-ink/55">{account.email}</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-3 text-xs text-brand-ink/45">
        This is a front-end demo: data is stored in localStorage and no real audits or personal data
        are involved.
      </p>
    </Modal>
  );
}

function Tip({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-card border border-brand-border bg-white p-3">
      <span className="flex h-8 w-8 items-center justify-center rounded-button bg-brand-primary/10 text-brand-primary">
        {icon}
      </span>
      <p className="mt-2 text-sm font-semibold text-brand-ink">{title}</p>
      <p className="mt-0.5 text-xs leading-relaxed text-brand-ink/60">{body}</p>
    </div>
  );
}
