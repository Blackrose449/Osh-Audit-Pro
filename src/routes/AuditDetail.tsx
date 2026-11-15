import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { auditApi } from '@/api/client';
import { Button, Card } from '@/components/ui';

export function AuditDetail() {
  const { id } = useParams<{ id: string }>();
  const [audit, setAudit] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([auditApi.get(id), auditApi.photos(id)]).then(([a, p]) => {
      setAudit(a);
      setPhotos(p);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="py-10 text-center text-brand-ink/60">Loading audit…</div>;
  if (!audit) return <div className="py-10 text-center text-brand-ink/60">Audit not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/audits" className="text-sm text-brand-primary hover:underline">&larr; Back to audits</Link>
        <div className="flex gap-2">
          <Link to={`/audits/${id}/findings`} className="btn btn-primary">Edit findings</Link>
          <Link to={`/audits/${id}/review`} className="btn btn-secondary">Request review</Link>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-brand-ink">{audit.title}</h2>
                <p className="text-sm text-brand-ink/60">{audit.type} audit • {new Date(audit.createdAt).toLocaleDateString()}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${audit.status === 'approved' ? 'bg-green-100 text-green-700' : audit.status === 'pending_review' ? 'bg-yellow-100 text-yellow-700' : 'bg-brand-light text-brand-ink/70'}`}>
                {audit.status.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-brand-ink/70 uppercase">Company</p><p className="text-brand-ink">Apex Manufacturing Ltd.</p></div>
              <div><p className="text-xs text-brand-ink/70 uppercase">Workplace</p><p className="text-brand-ink">Plant A — Assembly</p></div>
              <div><p className="text-xs text-brand-ink/70 uppercase">Auditor</p><p className="text-brand-ink">Grace Wanjiku</p></div>
              <div><p className="text-xs text-brand-ink/70 uppercase">Reviewer</p><p className="text-brand-ink">{audit.reviewerId ? 'Reviewer One' : '—'}</p></div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-brand-ink/70 uppercase mb-1">Photographs ({photos.length})</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {photos.map((photo) => (
                  <div key={photo.id} className="aspect-square rounded-card border border-brand-border overflow-hidden">
                    <img src={photo.url} alt={photo.filename} className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 p-1 bg-black/60 text-xs text-white truncate">{photo.caption || photo.filename}</div>
                  </div>
                ))}
                {photos.length === 0 && <div className="col-span-full text-center py-4 text-brand-ink/60 text-sm">No photographs uploaded.</div>}
              </div>
            </div>
          </Card>
        </div>
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-4">
            <h3 className="text-xs font-semibold text-brand-ink/70 uppercase mb-3">Audit summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-brand-ink/60">Photographs</span>
                <span className="font-medium text-brand-ink">{photos.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-brand-ink/60">Findings</span>
                <span className="font-medium text-brand-ink">{audit.findingCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-brand-ink/60">Status</span>
                <span className="font-medium text-brand-ink capitalize">{audit.status.replace(/_/g, ' ')}</span>
              </div>
            </div>
          </Card>
          <div className="flex gap-2">
            <Link to={`/audits/${id}/report`} className="btn btn-primary w-full">Generate report</Link>
            <Button variant="ghost" className="w-full">Share</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
