export const RISK_COLORS = {
  HIGH: { bg: '#FF0000', text: '#FFFFFF' },
  MEDIUM: { bg: '#FFD966', text: '#000000' },
  LOW: { bg: '#00B050', text: '#FFFFFF' },
} as const;

export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export function riskColor(level: RiskLevel) {
  return RISK_COLORS[level];
}

export const COLORS = {
  brandDark: '#0B493D',
  brandPrimary: '#126B58',
  brandLight: '#F8FAF9',
  brandInk: '#172B27',
  brandBorder: '#E2E8E5',
} as const;

export const RADIUS = {
  card: '14px',
  button: '9px',
  choice: '12px',
  chip: '6px',
} as const;
