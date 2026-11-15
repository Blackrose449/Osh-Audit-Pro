import { useState } from 'react';
import { User } from 'lucide-react';
import { Button } from '@/components/ui';

export function Team() {
  const [members] = useState([
    { id: 'u-1', name: 'Grace Wanjiku', email: 'grace@greenfield.example', role: 'admin', status: 'Active' },
    { id: 'u-2', name: 'Auditor One', email: 'auditor@greenfield.example', role: 'auditor', status: 'Active' },
    { id: 'u-3', name: 'Reviewer One', email: 'reviewer@greenfield.example', role: 'reviewer', status: 'Active' },
    { id: 'u-4', name: 'Viewer One', email: 'viewer@greenfield.example', role: 'viewer', status: 'Active' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-ink">Team and roles</h1>
          <p className="text-brand-ink/60 mt-1">Organization members and access</p>
        </div>
        <Button variant="secondary"><User className="w-4 h-4 mr-2" /> Invite member</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-border">
              <th className="text-left pb-2 text-xs font-semibold text-brand-ink/70 uppercase">Member</th>
              <th className="text-left pb-2 text-xs font-semibold text-brand-ink/70 uppercase">Email</th>
              <th className="text-left pb-2 text-xs font-semibold text-brand-ink/70 uppercase">Role</th>
              <th className="text-left pb-2 text-xs font-semibold text-brand-ink/70 uppercase">Status</th>
              <th className="text-right pb-2 w-24"></th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-b border-brand-border/50 hover:bg-brand-light/50 transition">
                <td className="py-3 text-brand-ink">{m.name}</td>
                <td className="py-3 text-brand-ink/70">{m.email}</td>
                <td className="py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${m.role === 'admin' ? 'bg-brand-light text-brand-dark' : 'bg-brand-light/50 text-brand-ink/70'}`}>{m.role}</span></td>
                <td className="py-3"><span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs">{m.status}</span></td>
                <td className="py-3 text-right">                  <Button variant="ghost"><User className="w-3 h-3" /></Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
