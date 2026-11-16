import { cn } from '@/lib/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ className, children, padding = 'md', ...props }: CardProps) {
  const pad: Record<string, string> = { none: '', sm: 'p-3', md: 'p-4', lg: 'p-6' };
  return (
    <div className={cn('card', pad[padding], className)} {...props}>
      {children}
    </div>
  );
}
