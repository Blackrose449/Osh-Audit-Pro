import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Download } from 'lucide-react';
import { reportApi } from '@/api/client';
import { Button, Card } from '@/components/ui';

export function ReportSetup() {
  const { id } = useParams<{ id: string }>();
  const [format, setFormat] = useState<'PDF' | 'DOCX'>('PDF');
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await reportApi.generate(id!, format);
      setGenerating(false);
    } catch (err) {
      setGenerating(false);
      alert('Report generation failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to={`/audits/${id}`} className="text-sm text-brand-primary hover:underline">&larr; Back to audit</Link>
      </div>
      <Card>
        <h2 className="text-xl font-bold text-brand-ink mb-1">Generate audit report</h2>
        <p className="text-sm text-brand-ink/60 mb-4">Configure the report before generating.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-brand-ink/70 uppercase">Audit</p>
            <p className="text-brand-ink">Plant A — Initial Safety Audit</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-brand-ink/70 uppercase">Company</p>
            <p className="text-brand-ink">Apex Manufacturing Ltd.</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-brand-ink/70 uppercase">Workplace</p>
            <p className="text-brand-ink">Plant A — Assembly</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-brand-ink/70 uppercase">Auditor</p>
            <p className="text-brand-ink">Grace Wanjiku</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-brand-ink/70 uppercase">Findings</p>
            <p className="text-brand-ink">3 verified</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-brand-ink/70 uppercase">Photographs</p>
            <p className="text-brand-ink">6 included</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-brand-ink/70 uppercase">Report language</p>
            <p className="text-brand-ink">English</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-brand-ink/70 uppercase">Template</p>
            <p className="text-brand-ink">Risk Assessment Audit — Version 1</p>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-brand-border space-y-3">
          <p className="text-xs font-semibold text-brand-ink/70 uppercase">Format</p>
          <div className="flex gap-2">
            <button onClick={() => setFormat('PDF')} className={`px-4 py-2 rounded-button text-sm font-medium border ${format === 'PDF' ? 'bg-brand-primary border-brand-primary text-white' : 'bg-white border-brand-border text-brand-ink'}`}>PDF</button>
            <button onClick={() => setFormat('DOCX')} className={`px-4 py-2 rounded-button text-sm font-medium border ${format === 'DOCX' ? 'bg-brand-primary border-brand-primary text-white' : 'bg-white border-brand-border text-brand-ink'}`}>DOCX</button>
          </div>
        </div>
        <div className="mt-6">
          <Button onClick={handleGenerate} className="w-full" disabled={generating}>
            {generating ? 'Generating…' : <><Download className="w-4 h-4 mr-2" /> Generate {format} report</>}
          </Button>
          <p className="mt-2 text-xs text-brand-ink/60">Preview opens after generation. Download from the report library.</p>
        </div>
      </Card>
    </div>
  );
}
