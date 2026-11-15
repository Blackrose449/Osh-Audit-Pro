import { Link } from 'react-router-dom';
import { Download } from 'lucide-react';
import { reportApi } from '@/api/client';
import { useEffect, useState } from 'react';
import { Button, Card } from '@/components/ui';

export function Reports() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportApi.list().then((data) => { setReports(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-10 text-center text-brand-ink/60">Loading reports…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-ink">Report library</h1>
          <p className="text-brand-ink/60 mt-1">Generated audit reports and version history</p>
        </div>
      </div>
      {reports.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-brand-ink/60">No reports yet. Generate one from an audit.</p>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-border">
                <th className="text-left pb-2 text-xs font-semibold text-brand-ink/70 uppercase">Audit</th>
                <th className="text-left pb-2 text-xs font-semibold text-brand-ink/70 uppercase">Version</th>
                <th className="text-left pb-2 text-xs font-semibold text-brand-ink/70 uppercase">Format</th>
                <th className="text-left pb-2 text-xs font-semibold text-brand-ink/70 uppercase">Status</th>
                <th className="text-left pb-2 text-xs font-semibold text-brand-ink/70 uppercase">Generated</th>
                <th className="text-right pb-2 w-32"></th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} className="border-b border-brand-border/50">
                  <td className="py-3 text-brand-ink"><Link to={`/audits/${r.auditId}`}>Audit #{r.auditId.slice(-1)}</Link></td>
                  <td className="py-3 text-brand-ink/70">v{r.version}</td>
                  <td className="py-3 text-brand-ink/70">{r.format}</td>
                  <td className="py-3"><span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs">{r.status}</span></td>
                  <td className="py-3 text-brand-ink/70">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 text-right">
                    <Button variant="ghost"><Download className="w-4 h-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
