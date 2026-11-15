import { cn } from '@/lib/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className, id, ...props }: InputProps) {
  return (
    <div className="mb-3">
      {label && <label className="label" htmlFor={id}>{label}</label>}
      <input id={id} className={cn('input', className)} {...props} />
    </div>
  );
}
