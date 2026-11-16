import { cn } from '@/lib/cn';
import { initials } from '@/types';

const PALETTE = [
  'bg-brand-primary text-white',
  'bg-brand-dark text-white',
  'bg-sky-600 text-white',
  'bg-violet-600 text-white',
  'bg-amber-500 text-brand-ink',
  'bg-emerald-600 text-white',
];

export function Avatar({
  name,
  size = 'md',
  className,
}: {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizes = {
    xs: 'h-6 w-6 text-[10px]',
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  };
  const color = PALETTE[[...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % PALETTE.length];
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-bold ring-2 ring-white/70',
        sizes[size],
        color,
        className,
      )}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}
