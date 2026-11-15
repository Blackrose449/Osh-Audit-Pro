import { Link } from 'react-router-dom';
import { Building2, ClipboardList, FileText, AlertCircle } from 'lucide-react';

const STATS = [
  { label: 'Total audits', value: '24', change: '+3 this month', icon: ClipboardList },
  { label: 'Open findings', value: '7', change: '2 high risk', icon: AlertCircle },
  { label: 'Workplaces', value: '9', change: '3 companies', icon: Building2 },
  { label: 'Reports generated', value: '12', change: 'Last: today', icon: FileText },
];

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-ink">Dashboard</h1>
        <p className="text-brand-ink/60 mt-1">Greenfield Workplace Solutions Ltd. — audit overview</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <div key={s.label} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-brand-ink/70 uppercase">{s.label}</p>
                <p className="text-2xl font-bold text-brand-ink">{s.value}</p>
                <p className="text-xs text-brand-primary">{s.change}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-brand-light/50 flex items-center justify-center text-brand-primary">
                <s.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <h3 className="text-sm font-semibold text-brand-ink/70 uppercase mb-3">Recent audits</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-border">
                  <th className="text-left pb-2 text-xs font-semibold text-brand-ink/70 uppercase">Audit</th>
                  <th className="text-left pb-2 text-xs font-semibold text-brand-ink/70 uppercase">Workplace</th>
                  <th className="text-left pb-2 text-xs font-semibold text-brand-ink/70 uppercase">Status</th>
                  <th className="text-right pb-2 text-xs font-semibold text-brand-ink/70 uppercase">Date</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: 'a-1', title: 'Plant A — Initial Safety Audit', workplace: 'Plant A — Assembly', status: 'Approved', date: 'Oct 11, 2025' },
                  { id: 'a-2', title: 'Depot North — Periodic Review', workplace: 'Depot North', status: 'Pending review', date: 'Sep 21, 2025' },
                  { id: 'a-3', title: 'Kitchen Line 1 — Incident Audit', workplace: 'Kitchen Line 1', status: 'In progress', date: 'Oct 1, 2025' },
                ].map((a) => (
                  <tr key={a.id} className="border-b border-brand-border/50 hover:bg-brand-light/50 transition">
                    <td className="py-3 text-brand-ink"><Link to={`/audits/${a.id}`}>{a.title}</Link></td>
                    <td className="py-3 text-brand-ink/70">{a.workplace}</td>
                    <td className="py-3 text-brand-ink/70">{a.status}</td>
                    <td className="py-3 text-right text-brand-ink/70">{a.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <h3 className="text-sm font-semibold text-brand-ink/70 uppercase mb-3">Quick actions</h3>
          <div className="space-y-2">
            <Link to="/audits/new" className="btn btn-primary w-full">New audit</Link>
            <Link to="/companies" className="btn btn-secondary w-full">Register company</Link>
            <Link to="/reports" className="btn btn-secondary w-full">Generate report</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
