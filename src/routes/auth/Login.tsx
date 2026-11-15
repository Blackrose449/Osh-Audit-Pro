import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, Input, Button } from '@/components/ui';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-brand-light px-4">
      <Card className="w-full max-w-md" padding="lg">
        <div className="mb-6 flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center text-white font-bold">O</div>
          <h2 className="text-xl font-bold text-brand-ink">OSH Audit Pro</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email" id="email" placeholder="you@company.example" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Password" id="password" placeholder="••••••••" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <div className="text-sm text-red-600 bg-red-50 rounded-button p-2">{error}</div>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
        <p className="mt-6 text-xs text-center text-brand-ink/60">
          Demo: any email with password 'password' works. Grace Wanjiku (admin) is pre-seeded.
        </p>
      </Card>
    </div>
  );
}
