import { cn } from '@/lib/cn';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
}

export function Textarea({ label, hint, className, id, ...props }: TextareaProps) {
  return (
    <div className="mb-3">
      {label && (
        <label className="label" htmlFor={id}>
          {label}
        </label>
      )}
      <textarea id={id} className={cn('input min-h-[90px] resize-y', className)} {...props} />
      {hint && <p className="mt-1 text-xs text-brand-ink/50">{hint}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export function Select({ label, className, id, children, ...props }: SelectProps) {
  return (
    <div className="mb-3">
      {label && (
        <label className="label" htmlFor={id}>
          {label}
        </label>
      )}
      <select id={id} className={cn('input appearance-none', className)} {...props}>
        {children}
      </select>
    </div>
  );
}
