import { cn } from '@/lib/cn';

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-card border border-dashed border-brand-border bg-white/60 px-6 py-12 text-center',
        className,
      )}
    >
      {icon && (
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-light text-brand-primary">
          {icon}
        </div>
      )}
      <p className="text-base font-semibold text-brand-ink">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-brand-ink/60">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
