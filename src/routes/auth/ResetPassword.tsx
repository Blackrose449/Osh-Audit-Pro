import { useState } from 'react';
import { Card, Input, Button } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

export function ResetPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="flex h-screen items-center justify-center bg-brand-light px-4">
        <Card className="w-full max-w-md" padding="lg">
          <h2 className="mb-6 text-xl font-bold text-brand-ink">Reset password</h2>
          <div className="text-brand-ink/70">A reset link has been sent to {email}.</div>
          <p className="mt-6"><a href="/login" className="text-brand-primary font-medium underline">Back to sign in</a></p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center bg-brand-light px-4">
      <Card className="w-full max-w-md" padding="lg">
        <h2 className="mb-6 text-xl font-bold text-brand-ink">Reset password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email" id="email" placeholder="you@company.example" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          {error && <div className="text-sm text-red-600 bg-red-50 rounded-button p-2">{error}</div>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Sending…' : 'Send reset link'}
          </Button>
        </form>
        <p className="mt-4 text-xs text-center text-brand-ink/60">
          Remember your password? <a href="/login" className="text-brand-primary font-medium underline">Sign in</a>
        </p>
      </Card>
    </div>
  );
}
