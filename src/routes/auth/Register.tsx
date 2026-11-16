import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { Button, Input, Select } from '@/components/ui';
import type { UserRole } from '@/types';
import { AuthShell } from '@/routes/auth/AuthShell';

export function Register() {
  const [form, setForm] = useState<{
    name: string;
    email: string;
    password: string;
    role: UserRole;
  }>({ name: '', email: '', password: '', role: 'auditor' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      toast('Account created. Welcome aboard!');
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join the demo workspace in a few seconds."
      footer={
        <p className="text-center text-xs text-brand-ink/50">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-primary hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          label="Full name"
          id="name"
          placeholder="e.g. Grace Wanjiku"
          autoComplete="name"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          required
        />
        <Input
          label="Work email"
          id="email"
          type="email"
          placeholder="you@company.example"
          autoComplete="email"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          required
        />
        <Input
          label="Password"
          id="password"
          type="password"
          placeholder="Create a password"
          hint="Demo only — use anything you can remember."
          autoComplete="new-password"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          required
        />
        <Select
          label="Your role"
          id="role"
          value={form.role}
          onChange={(event) => setForm({ ...form, role: event.target.value as UserRole })}
        >
          <option value="auditor">Auditor — run audits and record findings</option>
          <option value="reviewer">Reviewer — approve findings</option>
          <option value="viewer">Viewer — read-only access</option>
          <option value="admin">Admin — manage the workspace</option>
        </Select>
        {error && (
          <div className="rounded-button border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        )}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
          {!loading && <ArrowRight className="h-4 w-4" />}
        </Button>
        <p className="text-center text-[11px] leading-relaxed text-brand-ink/40">
          By continuing you agree to this demo’s use of local mock data. No real safety records are
          created.
        </p>
      </form>
    </AuthShell>
  );
}
