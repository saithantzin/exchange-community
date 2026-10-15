import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * LoadingState Component
 * Clean loading spinner for asynchronous admin operations.
 */
export default function LoadingState({ message = 'Loading administrative data...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-3 bg-white/50 rounded-xl border border-[#EBE2D8] text-center">
      <Loader2 className="w-8 h-8 text-[#5C4033] animate-spin" />
      <p className="text-sm font-medium text-[#5C4033]">{message}</p>
      <span className="text-xs text-[#8C7A6B]">
        Synchronizing records...
      </span>
    </div>
  );
}
