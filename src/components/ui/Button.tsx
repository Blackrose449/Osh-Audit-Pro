import { forwardRef } from 'react';
import { cn } from '@/lib/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant = 'primary', disabled, children, ...props }, ref) => {
  const base = 'btn';
  const variants: Record<string, string> = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
  };
  return (
    <button ref={ref} className={cn(base, variants[variant], className)} disabled={disabled} {...props}>
      {children}
    </button>
  );
});

Button.displayName = 'Button';
