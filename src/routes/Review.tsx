import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { RiskBadge } from '@/components/ui/RiskBadge';
import { auditApi } from '@/api/client';

export function Review() {
  const { id } = useParams<{ id: string }>();
  const [audit, setAudit] = useState<any>(null);
  const [findings, setFindings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [decision, setDecision] = useState<'approved' | 'changes_requested' | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([auditApi.get(id), auditApi.findings(id)]).then(([a, f]) => {
      setAudit(a);
      setFindings(f);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const handleDecision = async (d: 'approved' | 'changes_requested') => {
    setDecision(d);
    await auditApi.update(id!, { status: d, reviewerId: 'u-3' });
    setAudit({ ...audit, status: d });
  };

  if (loading) return <div className="py-10 text-center text-brand-ink/60">Loading review…</div>;
  if (!audit) return <div className="py-10 text-center text-brand-ink/60">Audit not found.</div>;

  const unverified = findings.some((f) => f.status !== 'verified');
  const highRisk = findings.filter((f) => f.riskLevel === 'HIGH').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to={`/audits/${id}`} className="text-sm text-brand-primary hover:underline">&larr; Back to audit</Link>
      </div>
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-brand-ink">Risk assessment review</h2>
            <p className="text-sm text-brand-ink/60">{audit.title}</p>
          </div>
          <div className="flex gap-2">
            <div className="text-right">
              <p className="text-xs text-brand-ink/70 uppercase">Reviewer</p>
              <p className="text-brand-ink font-medium">Reviewer One</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="card p-3">
            <p className="text-xs text-brand-ink/70 uppercase">Total findings</p>
            <p className="text-2xl font-bold text-brand-ink">{findings.length}</p>
          </div>
          <div className="card p-3">
            <p className="text-xs text-brand-ink/70 uppercase">High risk</p>
            <p className="text-2xl font-bold text-brand-ink">{highRisk}</p>
          </div>
          <div className="card p-3">
            <p className="text-xs text-brand-ink/70 uppercase">Unverified</p>
            <p className="text-2xl font-bold text-brand-ink">{findings.filter((f) => f.status !== 'verified').length}</p>
          </div>
        </div>
        {unverified && (
          <div className="p-4 rounded-button bg-amber-50 border border-amber-200">
            <p className="text-sm text-amber-800">Some findings are not yet verified. Complete verification before approving.</p>
          </div>
        )}
        <div className="flex items-center justify-between pt-4 border-t border-brand-border">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-brand-primary" />
              <span className="text-sm font-medium text-brand-ink">{decision === 'approved' ? 'Approved' : decision === 'changes_requested' ? 'Changes requested' : 'Pending decision'}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {!decision && (
              <>
                <Button disabled={unverified} onClick={() => handleDecision('approved')}>Approve findings</Button>
                <Button variant="secondary" onClick={() => handleDecision('changes_requested')}>Request changes</Button>
              </>
            )}
            {decision && <Link to={`/audits/${id}/report`} className="btn btn-primary">Continue to report</Link>}
          </div>
        </div>
      </Card>
      <div>
        <h3 className="text-sm font-semibold text-brand-ink/70 uppercase mb-3">Findings</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-border">
                <th className="text-left pb-2 text-xs font-semibold text-brand-ink/70 uppercase">Section</th>
                <th className="text-left pb-2 text-xs font-semibold text-brand-ink/70 uppercase">Risk</th>
                <th className="text-left pb-2 text-xs font-semibold text-brand-ink/70 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {findings.map((f) => (
                <tr key={f.id} className="border-b border-brand-border/50">
                  <td className="py-3 text-brand-ink">{f.section}</td>
                  <td className="py-3"><RiskBadge level={f.riskLevel} /></td>
                  <td className="py-3"><span className={`text-xs font-bold ${f.status === 'verified' ? 'text-green-700' : 'text-brand-ink/70'}`}>{f.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
