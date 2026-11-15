import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Filter, Plus } from 'lucide-react';
import { Button, Input, Card } from '@/components/ui';
import { companyApi } from '@/api/client';
import { useEffect } from 'react';

export function Companies() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  useEffect(() => {
    companyApi.list().then((data) => { setCompanies(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = companies.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-ink">Companies</h1>
          <p className="text-brand-ink/60 mt-1">Client organizations under Greenfield Workplace Solutions Ltd.</p>
        </div>
        <Link to="/companies/new" className="btn btn-primary">
          <Plus className="w-4 h-4 mr-2" /> Add company
        </Link>
      </div>
      <div className="flex gap-2">
        <Input label="Search companies" placeholder="Search by name or industry" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Button variant="secondary" className="hidden sm:inline-flex"><Filter className="w-4 h-4 mr-2" /> Filters</Button>
      </div>
      {loading ? (
        <div className="animate-pulse space-y-3"><div className="h-8 bg-brand-border rounded"></div><div className="h-8 bg-brand-border rounded w-3/4"></div></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-3 card text-center py-12">
              <p className="text-brand-ink/60">No companies found.</p>
            </div>
          ) : (
            filtered.map((c) => (
              <Card key={c.id} className="cursor-pointer hover:border-brand-primary/50 transition" onClick={() => navigateToWorkplaces(c.id)}>
                <div className="w-10 h-10 rounded-full bg-brand-light/50 flex items-center justify-center text-brand-primary mb-3">
                  {c.name.split(' ').map((w: string) => w[0]).join('')}
                </div>
                <h4 className="font-semibold text-brand-ink">{c.name}</h4>
                <p className="text-xs text-brand-ink/60">{c.industry}</p>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-brand-ink/70">{c.workplaceCount} workplaces</span>
                  <span className="text-brand-ink/70">{c.auditCount} audits</span>
                </div>
                <p className="mt-2 text-xs text-brand-ink/60">Last audit: {c.lastAudit ?? '—'}</p>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );

  function navigateToWorkplaces(id: string) {
    navigate(`/companies/${id}/workplaces`);
  }
}
