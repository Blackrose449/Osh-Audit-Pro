import { useParams, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { workplaceApi } from '@/api/client';
import { useEffect, useState } from 'react';
import { Building2, Plus } from 'lucide-react';
import { Card, Button } from '@/components/ui';

export function Workplaces() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workplaces, setWorkplaces] = useState<any[]>([]);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([workplaceApi.listByCompany(id)]).then(([wps]) => {
      setWorkplaces(wps);
      setLoading(false);
    }).catch(() => setLoading(false));
    // company name fallback
    setCompany({ name: id === 'c-1' ? 'Apex Manufacturing Ltd.' : id === 'c-2' ? 'Kifaru Logistics Group' : 'Mwangaza Food Industries' });
  }, [id]);

  if (loading) return <div className="py-10 text-center text-brand-ink/60">Loading…</div>;
  if (!id) return <div className="py-10 text-center text-brand-ink/60">Company not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/companies" className="text-sm text-brand-primary hover:underline">&larr; Back to companies</Link>
      </div>
      <div>
        <h1 className="text-2xl font-bold text-brand-ink">{company?.name}</h1>
        <p className="text-brand-ink/60 mt-1">Workplaces and sites</p>
      </div>
      <div className="flex gap-2">
        <Button variant="secondary"><Plus /> Add workplace</Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {workplaces.length === 0 ? (
          <div className="col-span-3 card text-center py-12">
            <p className="text-brand-ink/60">No workplaces for this company.</p>
          </div>
        ) : (
          workplaces.map((w) => (
            <Card key={w.id} className="cursor-pointer hover:border-brand-primary/50 transition" onClick={() => navigate(`/workplaces/${w.id}`)}>
              <div className="w-10 h-10 rounded-full bg-brand-light/50 flex items-center justify-center text-brand-primary mb-3">
                <Building2 className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-brand-ink">{w.name}</h4>
              <p className="text-xs text-brand-ink/60">{w.location}</p>
              <div className="mt-2 flex gap-2 text-xs">
                <span className="px-2 py-0.5 rounded-full bg-brand-light text-brand-ink/70">{w.openFindings} open findings</span>
                <span className="px-2 py-0.5 rounded-full bg-brand-light text-brand-ink/70">{w.auditCount} audits</span>
              </div>
              <p className="mt-2 text-xs text-brand-ink/60">Last audit: {w.lastAudit ?? '—'}</p>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
