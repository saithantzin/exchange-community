import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, X } from 'lucide-react';

/**
 * ConfirmModal Component
 * Modal dialog for reviewing and confirming sensitive moderation actions.
 */
export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning', // 'warning' | 'danger' | 'info' | 'primary'
  onConfirm,
  onCancel,
  children
}) {
  if (!isOpen) return null;

  const typeConfig = {
    warning: {
      icon: AlertTriangle,
      iconBg: 'bg-amber-50 text-amber-800 border-amber-200',
      btnBg: 'bg-amber-600 hover:bg-amber-700 text-white'
    },
    danger: {
      icon: AlertCircle,
      iconBg: 'bg-rose-50 text-rose-800 border-rose-200',
      btnBg: 'bg-rose-600 hover:bg-rose-700 text-white'
    },
    info: {
      icon: CheckCircle,
      iconBg: 'bg-sky-50 text-sky-800 border-sky-200',
      btnBg: 'bg-sky-600 hover:bg-sky-700 text-white'
    },
    primary: {
      icon: AlertCircle,
      iconBg: 'bg-[#DDD1BF]/40 text-[#5C4033] border-[#EBE2D8]',
      btnBg: 'bg-[#5C4033] hover:bg-[#2C1D15] text-white'
    }
  };

  const config = typeConfig[type] || typeConfig.warning;
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#EBE2D8] space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${config.iconBg}`}>
              <Icon className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#2C1D15]">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg text-[#8C7A6B] hover:text-[#2C1D15] hover:bg-[#F9F6F0] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-[#5C4033] leading-relaxed">{message}</p>

        {children && <div className="pt-2">{children}</div>}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EBE2D8]">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-[#EBE2D8] text-[#5C4033] hover:bg-[#F9F6F0] transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors shadow-xs ${config.btnBg}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
