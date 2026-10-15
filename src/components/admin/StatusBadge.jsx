import React from 'react';

/**
 * StatusBadge Component
 * Displays a styled status pill matching the warm Nordic color system.
 */
export default function StatusBadge({ status, size = 'sm' }) {
  const normalized = (status || '').toLowerCase().trim();

  let styles = 'bg-[#DDD1BF]/40 text-[#5C4033] border-[#DDD1BF]';

  switch (normalized) {
    case 'active':
    case 'available':
    case 'completed':
    case 'resolved':
      styles = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      break;

    case 'pending':
    case 'shipping':
    case 'in-transit':
    case 'transit':
    case 'partially received':
    case 'pending confirmation':
    case 'under review':
      styles = 'bg-amber-50 text-amber-800 border-amber-200';
      break;

    case 'accepted':
    case 'open':
      styles = 'bg-sky-50 text-sky-800 border-sky-200';
      break;

    case 'suspended':
    case 'rejected':
    case 'cancelled':
    case 'disputed':
    case 'removed':
    case 'inactive':
      styles = 'bg-rose-50 text-rose-800 border-rose-200';
      break;

    default:
      styles = 'bg-[#DDD1BF]/40 text-[#5C4033] border-[#DDD1BF]';
  }

  const sizeClasses = size === 'xs'
    ? 'text-[10px] px-2 py-0.5'
    : size === 'lg'
    ? 'text-xs px-3 py-1 font-semibold'
    : 'text-[11px] px-2.5 py-0.5 font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${sizeClasses} ${styles} font-medium tracking-wide transition-colors whitespace-nowrap`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}
