import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MailCheck, Send } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { AuthShell } from '@/routes/auth/AuthShell';

export function ResetPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
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
      <AuthShell
        title="Check your inbox"
        subtitle="A reset link is on its way. This is a demo, so no email is actually sent."
        footer={
          <button
            onClick={() => {
              setSent(false);
              setEmail('');
            }}
            className="mx-auto flex items-center gap-1 text-xs font-semibold text-brand-primary hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Try another email
          </button>
        }
      >
        <div className="rounded-card border border-emerald-200 bg-emerald-50 p-5 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-emerald-600 ring-1 ring-emerald-200">
            <MailCheck className="h-6 w-6" />
          </span>
          <p className="mt-3 text-sm font-semibold text-emerald-900">Reset link prepared</p>
          <p className="mt-1 break-all text-sm text-emerald-800/80">{email}</p>
        </div>
        <Link to="/login" className="btn btn-secondary mt-4 w-full">
          Back to sign in
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter the email you use for this workspace."
      footer={
        <p className="text-center text-xs text-brand-ink/50">
          Remembered it?{' '}
          <Link to="/login" className="font-semibold text-brand-primary hover:underline">
            Back to sign in
          </Link>
        </p>
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
        {error && (
          <div className="rounded-button border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        )}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Preparing link…' : 'Send reset link'}
          {!loading && <Send className="h-4 w-4" />}
        </Button>
      </form>
    </AuthShell>
  );
}
