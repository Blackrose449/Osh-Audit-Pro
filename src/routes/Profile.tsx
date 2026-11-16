import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, KeyRound, Mail, RefreshCw, Save, ShieldCheck, UserRound } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { demoApi, teamApi } from '@/api/client';
import { Avatar, Button, Card, Input, Modal, PageHeader, StatusPill } from '@/components/ui';
import { ROLE_STYLES } from '@/lib/format';

export function Profile() {
  const { user, updateProfile, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [saving, setSaving] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  if (!user) return null;

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (user.id) {
        await teamApi.update(user.id, { name, email });
      }
      updateProfile({ name, email });
      toast('Profile updated.');
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Could not update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDemo = async () => {
    setResetting(true);
    try {
      await demoApi.reset();
      logout();
      navigate('/login', { replace: true });
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Reset failed', 'error');
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My profile"
        subtitle="Manage your details and demo workspace settings."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card padding="lg" className="lg:col-span-2">
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <Avatar name={user.name} size="lg" className="h-20 w-20 text-2xl" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-brand-ink">{user.name}</h2>
                <StatusPill label={user.role} className={ROLE_STYLES[user.role]} />
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-brand-ink/55">
                <Mail className="h-3.5 w-3.5" /> {user.email}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-brand-ink/45">
                <Building2 className="h-3.5 w-3.5" /> Greenfield Workplace Solutions Ltd.
              </p>
            </div>
          </div>

          <hr className="my-6 border-brand-border" />

          <form onSubmit={handleSave} className="space-y-4">
            <h3 className="text-sm font-bold text-brand-ink">Personal details</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Full name"
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
              <Input
                label="Email address"
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                hint="Used for sign-in and notifications."
                required
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setName(user.name);
                  setEmail(user.email);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </form>
        </Card>

        <div className="space-y-4">
          <Card padding="lg">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-button bg-brand-primary/10 text-brand-primary">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <h3 className="text-sm font-bold text-brand-ink">Access</h3>
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-brand-ink/55">Role</dt>
                <dd className="font-semibold capitalize text-brand-ink">{user.role}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-brand-ink/55">Organization</dt>
                <dd className="font-semibold text-brand-ink">Greenfield</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-brand-ink/55">Account type</dt>
                <dd className="font-semibold text-brand-ink">Demo</dd>
              </div>
            </dl>
            <Link to="/reset-password" className="btn btn-secondary mt-4 w-full text-xs">
              <KeyRound className="h-3.5 w-3.5" /> Change password
            </Link>
          </Card>

          <Card padding="lg">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-button bg-amber-50 text-amber-600">
                <RefreshCw className="h-4 w-4" />
              </span>
              <h3 className="text-sm font-bold text-brand-ink">Demo data</h3>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-brand-ink/55">
              Restore the seeded companies, audits and findings. Your local edits and uploaded photos
              will be cleared.
            </p>
            <Button
              variant="danger"
              size="sm"
              className="mt-3 w-full"
              onClick={() => setResetOpen(true)}
            >
              <RefreshCw className="h-3.5 w-3.5" /> Reset demo data
            </Button>
          </Card>
        </div>
      </div>

      <Card padding="lg">
        <div className="flex items-center gap-2">
          <UserRound className="h-4 w-4 text-brand-ink/40" />
          <h3 className="text-sm font-bold text-brand-ink">What can I do?</h3>
        </div>
        <div className="mt-3 grid gap-3 text-xs leading-relaxed text-brand-ink/60 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-button bg-brand-light p-3">
            <p className="font-semibold text-brand-ink">Admins</p>
            <p>Manage companies, workplaces, team members and all audits.</p>
          </div>
          <div className="rounded-button bg-brand-light p-3">
            <p className="font-semibold text-brand-ink">Auditors</p>
            <p>Create audits, add findings and upload photo evidence.</p>
          </div>
          <div className="rounded-button bg-brand-light p-3">
            <p className="font-semibold text-brand-ink">Reviewers</p>
            <p>Approve findings, request changes and sign off reports.</p>
          </div>
          <div className="rounded-button bg-brand-light p-3">
            <p className="font-semibold text-brand-ink">Viewers</p>
            <p>Read audits, findings and reports without making changes.</p>
          </div>
        </div>
      </Card>

      <Modal
        open={resetOpen}
        onClose={() => !resetting && setResetOpen(false)}
        title="Reset demo data?"
        description="This clears everything stored in your browser and signs you out."
        footer={
          <>
            <Button variant="secondary" onClick={() => setResetOpen(false)} disabled={resetting}>
              Keep my data
            </Button>
            <Button variant="danger" onClick={handleResetDemo} disabled={resetting}>
              {resetting ? 'Resetting…' : 'Reset and sign out'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-brand-ink/60">
          New companies, audits, findings and reports will be re-seeded the next time you sign in.
          Uploaded files are deleted.
        </p>
      </Modal>
    </div>
  );
}
