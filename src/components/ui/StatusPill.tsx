import { cn } from '@/lib/cn';
import { statusLabel } from '@/lib/format';

export function StatusPill({
  label,
  className,
  dot = true,
}: {
  label: string;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset',
        className ?? 'bg-slate-100 text-slate-600 ring-slate-200',
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />}
      {statusLabel(label)}
    </span>
  );
}
