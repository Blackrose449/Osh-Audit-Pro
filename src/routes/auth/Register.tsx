import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, Input, Button } from '@/components/ui';

export function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'auditor' as const });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Register failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-brand-light px-4">
      <Card className="w-full max-w-md" padding="lg">
        <h2 className="mb-6 text-xl font-bold text-brand-ink">Create account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full name" id="name" placeholder="Grace Wanjiku" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Email" id="email" placeholder="you@company.example" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input label="Password" id="password" placeholder="••••••••" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <div className="mb-3">
            <label className="label">Role</label>
            <select
              className="input"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as any })}
            >
              <option value="admin">Admin</option>
              <option value="auditor">Auditor</option>
              <option value="reviewer">Reviewer</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          {error && <div className="text-sm text-red-600 bg-red-50 rounded-button p-2">{error}</div>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating…' : 'Create account'}
          </Button>
        </form>
        <p className="mt-4 text-xs text-center text-brand-ink/60">
          Already have an account? <a href="/login" className="text-brand-primary font-medium underline">Sign in</a>
        </p>
      </Card>
    </div>
  );
}
