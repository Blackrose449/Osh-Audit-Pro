import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

export function Actions() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-ink">Corrective actions</h1>
          <p className="text-brand-ink/60 mt-1">Track findings to closure</p>
        </div>
        <Link to="/actions/new" className="btn btn-primary"><AlertCircle className="w-4 h-4 mr-2" /> New action</Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-xs text-brand-ink/70 uppercase">Total</p>
          <p className="text-2xl font-bold text-brand-ink">14</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-brand-ink/70 uppercase">Open</p>
          <p className="text-2xl font-bold text-brand-ink">5</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-brand-ink/70 uppercase">Overdue</p>
          <p className="text-2xl font-bold text-brand-ink">1</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-brand-ink/70 uppercase">Completed</p>
          <p className="text-2xl font-bold text-brand-ink">8</p>
        </div>
      </div>
      <div className="card">
        <h3 className="text-sm font-semibold text-brand-ink/70 uppercase mb-3">Recent actions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-border">
                <th className="text-left pb-2 text-xs font-semibold text-brand-ink/70 uppercase">Action</th>
                <th className="text-left pb-2 text-xs font-semibold text-brand-ink/70 uppercase">Responsible</th>
                <th className="text-left pb-2 text-xs font-semibold text-brand-ink/70 uppercase">Deadline</th>
                <th className="text-left pb-2 text-xs font-semibold text-brand-ink/70 uppercase">Status</th>
                <th className="text-right pb-2 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {[
                { title: 'Install press guards', responsible: 'Plant Manager', deadline: 'Oct 25, 2025', status: 'Open' },
                { title: 'Issue hearing protection', responsible: 'Safety Officer', deadline: 'Oct 15, 2025', status: 'Overdue' },
                { title: 'Clean oil spill', responsible: 'Shift Lead', deadline: 'Oct 12, 2025', status: 'Completed' },
              ].map((a) => (
                <tr key={a.title} className="border-b border-brand-border/50">
                  <td className="py-3 text-brand-ink">{a.title}</td>
                  <td className="py-3 text-brand-ink/70">{a.responsible}</td>
                  <td className="py-3 text-brand-ink/70">{a.deadline}</td>
                  <td className="py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${a.status === 'Completed' ? 'bg-green-100 text-green-700' : a.status === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-brand-light text-brand-ink/70'}`}>{a.status}</span></td>
                  <td className="py-3 text-right"><Link to={`/actions/${a.title}`} className="text-brand-primary text-xs underline">View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
