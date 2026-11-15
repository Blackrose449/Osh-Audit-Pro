import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2 } from 'lucide-react';
import { auditApi } from '@/api/client';
import { RiskBadge } from '@/components/ui/RiskBadge';
import { type RiskLevel } from '@/design/risk';
import { Button, Input } from '@/components/ui';

export function Findings() {
  const { id } = useParams<{ id: string }>();
  const [findings, setFindings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<{
    section: string;
    riskLevel: RiskLevel;
    identifiedHazards: string;
    recommendedControlMeasures: string;
  }>({
    section: '',
    riskLevel: 'MEDIUM',
    identifiedHazards: '',
    recommendedControlMeasures: '',
  });

  useEffect(() => {
    if (!id) return;
    auditApi.findings(id)
      .then((data) => { setFindings(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const RISK_LEVELS = [
    { key: 'HIGH', label: 'High' },
    { key: 'MEDIUM', label: 'Medium' },
    { key: 'LOW', label: 'Low' },
  ];

  const handleSave = async (finding: any) => {
    const updated = await auditApi.updateFinding(id!, finding.id, {
      section: draft.section,
      riskLevel: draft.riskLevel,
      identifiedHazards: draft.identifiedHazards,
      recommendedControlMeasures: draft.recommendedControlMeasures,
    });
    setFindings(findings.map((f) => (f.id === updated.id ? updated : f)));
    setEditing(null);
  };

  if (loading) {
    return <div className="py-10 text-center text-brand-ink/60">Loading findings…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to={`/audits/${id}`} className="text-sm text-brand-primary hover:underline">
          &larr; Back to audit
        </Link>
        <Button onClick={() => setEditing('new')}>
          <Plus className="w-4 h-4 mr-2" /> Add finding
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-brand-border">
            <tr>
              <th className="text-left pb-3 text-xs font-semibold text-brand-ink/70 uppercase">
                Section in the Workplace
              </th>
              <th className="text-left pb-3 text-xs font-semibold text-brand-ink/70 uppercase">
                Risk Level
              </th>
              <th className="text-left pb-3 text-xs font-semibold text-brand-ink/70 uppercase">
                Identified Hazards
              </th>
              <th className="text-left pb-3 text-xs font-semibold text-brand-ink/70 uppercase">
                Recommended Control Measures
              </th>
              <th className="text-left pb-3 text-xs font-semibold text-brand-ink/70 uppercase">
                Status
              </th>
              <th className="text-right pb-3 w-24"></th>
            </tr>
          </thead>
          <tbody>
            {editing === 'new' && (
              <tr className="bg-brand-light/50 border-b border-brand-border/50">
                <td className="py-3">
                  <Input
                    value={draft.section}
                    onChange={(e) => setDraft({ ...draft, section: e.target.value })}
                    placeholder="Section"
                  />
                </td>
                <td className="py-3">
                  <select value={draft.riskLevel} onChange={(e) => setDraft({ ...draft, riskLevel: e.target.value as RiskLevel })} className="input w-full">
                    {RISK_LEVELS.map((r) => (
                      <option key={r.key} value={r.key}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-3">
                  <Input
                    value={draft.identifiedHazards}
                    onChange={(e) => setDraft({ ...draft, identifiedHazards: e.target.value })}
                    placeholder="Identified hazards"
                  />
                </td>
                <td className="py-3">
                  <Input
                    value={draft.recommendedControlMeasures}
                    onChange={(e) => setDraft({ ...draft, recommendedControlMeasures: e.target.value })}
                    placeholder="Recommended control measures"
                  />
                </td>
                <td className="py-3">
                  <RiskBadge level={draft.riskLevel as any} />
                </td>
                <td className="py-3 text-right">
                  <Button variant="ghost" onClick={handleNewSave}>Save</Button>
                  <Button variant="ghost" onClick={() => setEditing(null)}>
                    Cancel
                  </Button>
                </td>
              </tr>
            )}
            {findings.map((f) => (
              <tr key={f.id} className="border-b border-brand-border/50 hover:bg-brand-light/50 transition">
                <td className="py-3">
                  {editing === f.id ? (
                    <Input value={draft.section} onChange={(e) => setDraft({ ...draft, section: e.target.value })} />
                  ) : (
                    f.section
                  )}
                </td>
                <td className="py-3">
                  {editing === f.id ? (
                  <select value={draft.riskLevel} onChange={(e) => setDraft({ ...draft, riskLevel: e.target.value as RiskLevel })} className="input w-full">
                      {RISK_LEVELS.map((r) => (
                        <option key={r.key} value={r.key}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <RiskBadge level={f.riskLevel} />
                  )}
                </td>
                <td className="py-3">
                  {editing === f.id ? (
                    <Input value={draft.identifiedHazards} onChange={(e) => setDraft({ ...draft, identifiedHazards: e.target.value })} />
                  ) : (
                    f.identifiedHazards
                  )}
                </td>
                <td className="py-3">
                  {editing === f.id ? (
                    <Input value={draft.recommendedControlMeasures} onChange={(e) => setDraft({ ...draft, recommendedControlMeasures: e.target.value })} />
                  ) : (
                    f.recommendedControlMeasures
                  )}
                </td>
                <td className="py-3">
                  <span className={`text-xs font-bold capitalize ${f.status === 'verified' ? 'text-green-700' : f.status === 'ai_suggestion' ? 'text-yellow-700' : 'text-brand-ink/70'}`}>
                    {f.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="py-3 text-right">
                  {editing === f.id ? (
                    <>
                      <Button variant="ghost" onClick={() => handleSave(f)}>
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" onClick={() => setEditing(null)}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" onClick={() => startEdit(f)}>
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      {f.aiSource && (
                        <Button variant="ghost" className="text-red-600" onClick={() => setFindings(findings.filter((x) => x.id !== f.id))}>
                          Reject
                        </Button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-brand-border">
        <span className="text-sm text-brand-ink/60">
          {findings.length} finding{findings.length !== 1 ? 's' : ''}
        </span>
        <Link to={`/audits/${id}/review`} className="btn btn-primary">
          Continue to review
        </Link>
      </div>
    </div>
  );

  function handleNewSave() {
    const f = {
      id: `f-${Date.now()}`,
      auditId: id,
      ...draft,
      status: 'ai_suggestion' as const,
      confidence: 85,
      aiSource: true,
      photoRefs: [] as string[],
    };
    setFindings([...findings, f]);
    setEditing(null);
    setDraft({
      section: '',
      riskLevel: 'MEDIUM',
      identifiedHazards: '',
      recommendedControlMeasures: '',
    });
  }

  function startEdit(f: any) {
    setEditing(f.id);
    setDraft({
      section: f.section,
      riskLevel: f.riskLevel,
      identifiedHazards: f.identifiedHazards,
      recommendedControlMeasures: f.recommendedControlMeasures,
    });
  }
}
