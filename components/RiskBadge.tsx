
import React from 'react';
import { RiskLevel } from '../types';
import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';

interface RiskBadgeProps {
  level: RiskLevel;
  isGenuine?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, isGenuine }) => {
  const styles = {
    low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    high: 'bg-rose-50 text-rose-700 border-rose-200'
  };

  const Icon = isGenuine ? ShieldCheck : (level === 'high' ? ShieldX : ShieldAlert);

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${styles[level]}`}>
      <Icon size={12} />
      {isGenuine ? 'Verified' : level.toUpperCase()}
    </div>
  );
};
