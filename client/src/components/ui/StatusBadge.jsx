import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';

export default function StatusBadge({ status, size = 'sm', showIcon = true, className = '' }) {
  const norm = String(status || '').trim();

  let config = {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-800',
    dot: 'bg-emerald-500',
    label: 'In Stock',
    Icon: CheckCircle2
  };

  if (norm === 'Low Stock' || norm.toLowerCase().includes('low')) {
    config = {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      dot: 'bg-amber-500',
      label: 'Low Stock',
      Icon: AlertTriangle
    };
  } else if (norm === 'Out of Stock' || norm.toLowerCase().includes('out') || norm === 'Unavailable') {
    config = {
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      text: 'text-rose-800',
      dot: 'bg-rose-500',
      label: 'Out of Stock',
      Icon: XCircle
    };
  } else if (norm !== 'In Stock') {
    config = {
      bg: 'bg-slate-50',
      border: 'border-slate-200',
      text: 'text-slate-700',
      dot: 'bg-slate-400',
      label: norm || 'Unknown',
      Icon: HelpCircle
    };
  }

  const { Icon } = config;
  const isSm = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium border rounded-full ${config.bg} ${config.border} ${config.text} ${
        isSm ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      } ${className}`}
      role="status"
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} shrink-0`} aria-hidden="true" />
      {showIcon && <Icon className={`${isSm ? 'w-3.5 h-3.5' : 'w-4 h-4'} shrink-0`} aria-hidden="true" />}
      <span>{config.label}</span>
    </span>
  );
}
