import { type RiskLevel, riskColor } from '@/design/risk';
import { cn } from '@/lib/cn';

export function RiskBadge({ level }: { level: RiskLevel }) {
  const { bg, text } = riskColor(level);
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-chip px-2 py-0.5 text-xs font-bold uppercase',
        `bg-[${bg}] text-[${text}]`,
      )}
    >
      {level}
    </span>
  );
}
