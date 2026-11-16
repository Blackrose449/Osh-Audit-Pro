import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  backTo?: string;
  backLabel?: string;
  className?: string;
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
  backTo,
  backLabel = 'Back',
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {backTo && (
        <Link
          to={backTo}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-primary transition hover:text-brand-dark"
        >
          <ArrowLeft className="h-4 w-4" /> {backLabel}
        </Link>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {eyebrow && (
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-primary">
              {eyebrow}
            </p>
          )}
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-brand-ink sm:text-[28px]">
            {title}
          </h1>
          {subtitle && <p className="mt-1 max-w-2xl text-sm text-brand-ink/60">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
