import { cn } from '@/lib/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Input({ label, hint, error, className, id, ...props }: InputProps) {
  return (
    <div className="mb-3">
      {label && (
        <label className="label" htmlFor={id}>
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn('input', error && 'border-rose-300 focus-visible:ring-rose-300', className)}
        aria-invalid={error ? true : undefined}
        {...props}
      />
      {error ? (
        <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>
      ) : (
        hint && <p className="mt-1 text-xs text-brand-ink/50">{hint}</p>
      )}
    </div>
  );
}
