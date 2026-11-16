import { Link } from 'react-router-dom';
import { ArrowLeft, Compass, Lock, LogIn, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/cn';

interface ErrorPageProps {
  code?: string;
  icon: React.ElementType;
  title: string;
  description: string;
  primaryLabel: string;
  primaryTo: string;
  secondaryLabel?: string;
  secondaryTo?: string;
  contained?: boolean;
}

function ErrorPage({
  code,
  icon: Icon,
  title,
  description,
  primaryLabel,
  primaryTo,
  secondaryLabel,
  secondaryTo,
  contained = false,
}: ErrorPageProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center px-4',
        contained ? 'py-16' : 'min-h-screen bg-brand-light',
      )}
    >
      <div className="w-full max-w-md text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
          <Icon className="h-7 w-7" />
        </span>
        {code && (
          <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-primary">{code}</p>
        )}
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-brand-ink">{title}</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-brand-ink/55">{description}</p>
        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <Link to={primaryTo} className="btn btn-primary">
            {primaryLabel}
          </Link>
          {secondaryLabel && secondaryTo && (
            <Link to={secondaryTo} className="btn btn-secondary">
              {secondaryLabel}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export function NotFound() {
  return (
    <ErrorPage
      code="404"
      icon={Compass}
      title="We couldn’t find that page"
      description="The link may be broken or the page may have moved. Let’s get you back to familiar ground."
      primaryLabel="Go to dashboard"
      primaryTo="/"
      secondaryLabel="Browse audits"
      secondaryTo="/audits"
    />
  );
}

export function Forbidden() {
  return (
    <ErrorPage
      code="403"
      icon={Lock}
      title="You don’t have access to this page"
      description="Your role doesn’t include this area. If you think this is a mistake, ask an administrator to update your permissions."
      primaryLabel="Back to dashboard"
      primaryTo="/"
      secondaryLabel="View profile"
      secondaryTo="/profile"
      contained
    />
  );
}

export function SessionExpired() {
  return (
    <ErrorPage
      icon={ShieldAlert}
      title="Your session has expired"
      description="For your security we signed you out after a period of inactivity. Sign in again to pick up where you left off."
      primaryLabel="Sign in again"
      primaryTo="/login"
      secondaryLabel="Back to home"
      secondaryTo="/"
      contained
    />
  );
}

export function ErrorLinks() {
  return (
    <div className="flex items-center gap-3 text-xs text-brand-ink/50">
      <Link to="/" className="inline-flex items-center gap-1 font-semibold text-brand-primary hover:underline">
        <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
      </Link>
      <Link to="/login" className="inline-flex items-center gap-1 font-semibold text-brand-primary hover:underline">
        <LogIn className="h-3.5 w-3.5" /> Sign in
      </Link>
    </div>
  );
}
