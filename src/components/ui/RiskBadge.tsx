import { type RiskLevel, riskColor } from '@/design/risk';

export function RiskBadge({ level }: { level: RiskLevel }) {
  const { bg, text } = riskColor(level);
  return (
    <span
      className="inline-flex items-center rounded-chip px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide"
      style={{ backgroundColor: bg, color: text }}
      title={`Risk level: ${level}`}
    >
      {level}
    </span>
  );
}
