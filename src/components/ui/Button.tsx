import { forwardRef } from 'react';
import { cn } from '@/lib/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'soft';
  size?: 'sm' | 'md';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', disabled, children, ...props }, ref) => {
    const variants: Record<string, string> = {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      ghost: 'btn-ghost',
      danger: 'btn bg-rose-600 text-white hover:bg-rose-700',
      soft: 'btn bg-brand-primary/10 text-brand-dark hover:bg-brand-primary/15',
    };
    return (
      <button
        ref={ref}
        className={cn('btn', variants[variant], size === 'sm' && 'px-3 py-1.5 text-xs', className)}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
