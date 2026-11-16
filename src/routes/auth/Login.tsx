import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, ShieldCheck, ClipboardCheck, Users, Eye as EyeIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { Button, Input } from '@/components/ui';
import type { UserRole } from '@/types';
import { AuthShell } from '@/routes/auth/AuthShell';
import { cn } from '@/lib/cn';

const DEMO_ROLES: Array<{
  role: UserRole;
  label: string;
  name: string;
  icon: React.ElementType;
  description: string;
}> = [
  { role: 'admin', label: 'Admin', name: 'Grace Wanjiku', icon: ShieldCheck, description: 'Full access' },
  { role: 'auditor', label: 'Auditor', name: 'Daniel Otieno', icon: ClipboardCheck, description: 'Runs audits' },
  { role: 'reviewer', label: 'Reviewer', name: 'Amina Hassan', icon: EyeIcon, description: 'Approves findings' },
  { role: 'viewer', label: 'Viewer', name: 'Peter Mwangi', icon: Users, description: 'Read only' },
];

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState<'form' | UserRole | null>(null);
  const { login, demoLogin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading('form');
    try {
      await login(email, password);
      toast('Welcome back.');
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(null);
    }
  };

  const handleDemo = async (role: UserRole) => {
    setError('');
    setLoading(role);
    try {
      await demoLogin(role);
      toast(`Signed in as ${role}.`);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Demo login failed');
    } finally {
      setLoading(null);
    }
  };

  return (
    <AuthShell
      title="Sign in"
      subtitle="Choose a demo role or use the seeded credentials."
      footer={
        <div className="flex items-center justify-between text-xs text-brand-ink/50">
          <Link to="/register" className="font-semibold text-brand-primary hover:underline">
            Create an account
          </Link>
          <Link to="/reset-password" className="hover:text-brand-ink hover:underline">
            Forgot password?
          </Link>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          label="Email address"
          id="email"
          type="email"
          placeholder="you@company.example"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <div className="relative">
          <Input
            label="Password"
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="pr-10"
            hint="Demo password: password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute right-2 top-[26px] rounded p-1 text-brand-ink/40 transition hover:text-brand-ink"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {error && (
          <div className="rounded-button border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        )}
        <Button type="submit" className="w-full" disabled={loading !== null}>
          {loading === 'form' ? 'Signing in…' : 'Sign in'}
          {loading !== 'form' && <ArrowRight className="h-4 w-4" />}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-brand-border" />
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-ink/40">
          or explore as
        </span>
        <span className="h-px flex-1 bg-brand-border" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {DEMO_ROLES.map((demo) => {
          const Icon = demo.icon;
          const isAdmin = demo.role === 'admin';
          return (
            <button
              key={demo.role}
              onClick={() => handleDemo(demo.role)}
              disabled={loading !== null}
              className={cn(
                'flex items-center gap-2.5 rounded-card border p-3 text-left transition disabled:opacity-60',
                isAdmin
                  ? 'border-brand-primary/30 bg-brand-primary/5 hover:border-brand-primary hover:bg-brand-primary/10'
                  : 'border-brand-border bg-white hover:border-brand-primary/40 hover:bg-brand-light',
              )}
            >
              <span
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-button',
                  isAdmin ? 'bg-brand-primary text-white' : 'bg-brand-light text-brand-primary',
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-bold text-brand-ink">
                  {loading === demo.role ? 'Signing in…' : demo.label}
                </span>
                <span className="block truncate text-[10px] text-brand-ink/50">
                  {demo.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-center text-[11px] text-brand-ink/40">
        Demo emails use the pattern <span className="font-medium">role@greenfield.example</span>.
      </p>
    </AuthShell>
  );
}
