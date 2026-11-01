import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

/**
 * StatCard Component
 * Displays key statistical metrics with icons, trend indicators, and Nordic warm theme styling.
 */
export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendUp = true,
  color = 'brown'
}) {
  const colorMap = {
    brown: 'bg-[#DDD1BF]/40 text-[#5C4033] border-[#EBE2D8]',
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-100',
    amber: 'bg-amber-50 text-amber-800 border-amber-100',
    blue: 'bg-sky-50 text-sky-800 border-sky-100',
    rose: 'bg-rose-50 text-rose-800 border-rose-100'
  };

  const iconClasses = colorMap[color] || colorMap.brown;

  return (
    <div className="bg-white border border-[#EBE2D8] rounded-xl p-5 shadow-xs transition-all hover:shadow-md hover:border-[#DDD1BF]">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-[#8C7A6B] tracking-wide uppercase">
            {title}
          </p>
          <div className="text-2xl font-bold text-[#2C1D15] tracking-tight">
            {value}
          </div>
        </div>

        {Icon && (
          <div className={`p-2.5 rounded-lg border ${iconClasses}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-3.5 pt-3 border-t border-[#EBE2D8]/60 flex items-center justify-between text-xs">
          {subtitle && (
            <span className="text-[#8C7A6B] font-medium">{subtitle}</span>
          )}
          {trend && (
            <span
              className={`inline-flex items-center gap-0.5 font-semibold ${
                trendUp ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {trendUp ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5" />
              )}
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
