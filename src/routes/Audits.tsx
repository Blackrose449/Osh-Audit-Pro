import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Input } from '@/components/ui';
import { auditApi } from '@/api/client';
import { useEffect } from 'react';

export function Audits() {
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    auditApi.list().then((data) => { setAudits(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = audits.filter((a) => {
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const STATUS: { key: string; label: string }[] = [
    { key: 'all', label: 'All status' },
    { key: 'draft', label: 'Draft' },
    { key: 'in_progress', label: 'In progress' },
    { key: 'pending_review', label: 'Pending review' },
    { key: 'reviewed', label: 'Reviewed' },
    { key: 'approved', label: 'Approved' },
    { key: 'changes_requested', label: 'Changes requested' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-ink">Audits</h1>
          <p className="text-brand-ink/60 mt-1">All workplace safety audits</p>
        </div>
        <Link to="/audits/new" className="btn btn-primary"><Plus className="w-4 h-4 mr-2" /> New audit</Link>
      </div>
      <div className="flex gap-2 flex-wrap">
        <Input label="Search" placeholder="Search audits..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input"
        >
          {STATUS.map((s) => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
        </select>
      </div>
      {loading ? (
        <div className="animate-pulse h-32 bg-brand-border rounded"></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-border">
                <th className="text-left pb-2 text-xs font-semibold text-brand-ink/70 uppercase">Title</th>
                <th className="text-left pb-2 text-xs font-semibold text-brand-ink/70 uppercase">Type</th>
                <th className="text-left pb-2 text-xs font-semibold text-brand-ink/70 uppercase">Status</th>
                <th className="text-left pb-2 text-xs font-semibold text-brand-ink/70 uppercase">Auditor</th>
                <th className="text-right pb-2 text-xs font-semibold text-brand-ink/70 uppercase">Updated</th>
                <th className="text-right pb-2 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-brand-ink/60">No audits found.</td></tr>
              ) : (
                filtered.map((a) => (
                  <tr key={a.id} className="border-b border-brand-border/50 hover:bg-brand-light/50 transition">
                    <td className="py-3 text-brand-ink"><Link to={`/audits/${a.id}`}>{a.title}</Link></td>
                    <td className="py-3 text-brand-ink/70 capitalize">{a.type}</td>
                    <td className="py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${a.status === 'approved' ? 'bg-green-100 text-green-700' : a.status === 'pending_review' ? 'bg-yellow-100 text-yellow-700' : 'bg-brand-light text-brand-ink/70'}`}>{a.status.replace(/_/g, ' ')}</span></td>
                    <td className="py-3 text-brand-ink/70">Grace Wanjiku</td>
                    <td className="py-3 text-right text-brand-ink/70">{new Date(a.updatedAt).toLocaleDateString()}</td>
                    <td className="py-3 text-right"><Link to={`/audits/${a.id}`} className="text-brand-primary text-xs underline">Open</Link></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
