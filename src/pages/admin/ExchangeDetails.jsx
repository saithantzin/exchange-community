import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Truck,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Package,
  MapPin,
  Calendar,
  ShieldCheck,
  ExternalLink,
  Check,
  XCircle
} from 'lucide-react';
import StatusBadge from '../../components/admin/StatusBadge';
import ConfirmModal from '../../components/admin/ConfirmModal';
import { ADMIN_EXCHANGES } from '../../data/adminMockData';

export default function ExchangeDetails() {
  const { id } = useParams();
  const [exchange, setExchange] = useState(() => {
    return ADMIN_EXCHANGES.find((e) => e.id === id) || ADMIN_EXCHANGES[0];
  });

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    action: ''
  });

  if (!exchange) {
    return (
      <div className="p-8 text-center text-[#8C7A6B]">
        <p>Exchange record not found.</p>
        <Link to="/admin/exchanges" className="text-xs text-[#5C4033] underline mt-2 inline-block">
          Return to Exchanges
        </Link>
      </div>
    );
  }

  const { partyA, partyB, isIntercity, handoverMethod } = exchange;

  // Check Two-Sided Completion requirement
  const canMarkCompleted = isIntercity
    ? partyA.confirmedReceipt && partyB.confirmedReceipt
    : true; // In person can be marked with mutual handshake

  const handleAdminComplete = () => {
    setExchange((prev) => ({
      ...prev,
      status: 'Completed',
      isCompleted: true,
      completedDate: new Date().toISOString().substring(0, 10),
      history: [
        ...prev.history,
        {
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          event: 'Exchange formally marked as Completed by Platform Administrator.'
        }
      ]
    }));
    setConfirmModal({ isOpen: false, action: '' });
  };

  return (
    <div className="space-y-6">
      {/* Back and Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/exchanges"
            className="p-2 rounded-lg bg-white border border-[#EBE2D8] text-[#5C4033] hover:text-[#2C1D15] hover:bg-[#F9F6F0] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#2C1D15] font-mono">{exchange.id}</h2>
              <StatusBadge status={exchange.status} size="lg" />
            </div>
            <p className="text-xs text-[#5C4033] mt-0.5">
              Initiated on {exchange.initiatedDate} via {handoverMethod}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {exchange.status !== 'Completed' && (
            <button
              onClick={() => setConfirmModal({ isOpen: true, action: 'Complete' })}
              disabled={!canMarkCompleted}
              className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors ${
                canMarkCompleted
                  ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                  : 'bg-emerald-100 text-emerald-400 cursor-not-allowed border border-emerald-200'
              }`}
              title={
                !canMarkCompleted
                  ? 'Two-sided completion criteria not yet satisfied by both parties'
                  : 'Mark completed'
              }
            >
              <Check className="w-4 h-4" />
              <span>Mark Completed</span>
            </button>
          )}
        </div>
      </div>

      {/* Two-Sided Completion Progress Notice (Crucial intercity requirement) */}
      {isIntercity && (
        <div className="bg-white border border-[#EBE2D8] rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-[#DDD1BF]/40 text-[#5C4033]">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#2C1D15]">
                  Two-Sided Completion Policy (Intercity Courier)
                </h3>
                <p className="text-xs text-[#5C4033]">
                  Both members must independently acknowledge parcel arrival before the transaction can complete.
                </p>
              </div>
            </div>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                partyA.confirmedReceipt && partyB.confirmedReceipt
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {partyA.confirmedReceipt && partyB.confirmedReceipt
                ? 'Both Received (2/2)'
                : partyA.confirmedReceipt || partyB.confirmedReceipt
                ? 'Partially Confirmed (1/2)'
                : 'Awaiting Both Receipts (0/2)'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-[#EBE2D8]">
            {/* Party A receipt verification */}
            <div
              className={`p-3.5 rounded-xl border flex items-center justify-between ${
                partyA.confirmedReceipt
                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50/60 border-amber-200 text-amber-900'
              }`}
            >
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider block">
                  Party A ({partyA.name})
                </span>
                <span className="text-xs mt-0.5 block">
                  {partyA.confirmedReceipt
                    ? `✓ Confirmed receipt on ${partyA.receiptDate || 'recent'}`
                    : '⏳ Parcel in transit to destination'}
                </span>
              </div>
              {partyA.confirmedReceipt ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <Clock className="w-5 h-5 text-amber-600 shrink-0" />
              )}
            </div>

            {/* Party B receipt verification */}
            <div
              className={`p-3.5 rounded-xl border flex items-center justify-between ${
                partyB.confirmedReceipt
                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50/60 border-amber-200 text-amber-900'
              }`}
            >
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider block">
                  Party B ({partyB.name})
                </span>
                <span className="text-xs mt-0.5 block">
                  {partyB.confirmedReceipt
                    ? `✓ Confirmed receipt on ${partyB.receiptDate || 'recent'}`
                    : '⏳ Parcel in transit to destination'}
                </span>
              </div>
              {partyB.confirmedReceipt ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <Clock className="w-5 h-5 text-amber-600 shrink-0" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Exchanged Items Side-by-Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Party A Item & Courier */}
        <div className="bg-white border border-[#EBE2D8] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EBE2D8]">
            <div>
              <span className="text-[10px] font-bold text-[#8C7A6B] uppercase tracking-wider">Party A Originator</span>
              <h4 className="font-bold text-sm text-[#2C1D15]">{partyA.name}</h4>
              <p className="text-xs text-[#5C4033] flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" /> {partyA.city}
              </p>
            </div>
            <span className="text-xs font-mono text-[#8C7A6B]">{partyA.email}</span>
          </div>

          <div className="flex gap-4">
            <img
              src={partyA.itemImage}
              alt={partyA.itemTitle}
              className="w-20 h-20 rounded-xl object-cover border border-[#EBE2D8] shrink-0"
            />
            <div className="text-xs space-y-1">
              <span className="text-[11px] font-medium text-[#8C7A6B]">Offered Item:</span>
              <p className="font-semibold text-sm text-[#2C1D15]">{partyA.itemTitle}</p>
            </div>
          </div>

          {isIntercity && partyA.courier && (
            <div className="bg-[#F9F6F0] p-3.5 rounded-xl border border-[#EBE2D8] text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[#8C7A6B] font-medium">Courier Service</span>
                <span className="font-semibold text-[#2C1D15]">{partyA.courier}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8C7A6B] font-medium">Tracking Waybill #</span>
                <span className="font-mono font-bold text-[#5C4033]">{partyA.trackingNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8C7A6B] font-medium">Dispatched Proof</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Receipt Uploaded
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Party B Item & Courier */}
        <div className="bg-white border border-[#EBE2D8] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EBE2D8]">
            <div>
              <span className="text-[10px] font-bold text-[#8C7A6B] uppercase tracking-wider">Party B Counterpart</span>
              <h4 className="font-bold text-sm text-[#2C1D15]">{partyB.name}</h4>
              <p className="text-xs text-[#5C4033] flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" /> {partyB.city}
              </p>
            </div>
            <span className="text-xs font-mono text-[#8C7A6B]">{partyB.email}</span>
          </div>

          <div className="flex gap-4">
            <img
              src={partyB.itemImage}
              alt={partyB.itemTitle}
              className="w-20 h-20 rounded-xl object-cover border border-[#EBE2D8] shrink-0"
            />
            <div className="text-xs space-y-1">
              <span className="text-[11px] font-medium text-[#8C7A6B]">Offered Item:</span>
              <p className="font-semibold text-sm text-[#2C1D15]">{partyB.itemTitle}</p>
            </div>
          </div>

          {isIntercity && partyB.courier && (
            <div className="bg-[#F9F6F0] p-3.5 rounded-xl border border-[#EBE2D8] text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[#8C7A6B] font-medium">Courier Service</span>
                <span className="font-semibold text-[#2C1D15]">{partyB.courier}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8C7A6B] font-medium">Tracking Waybill #</span>
                <span className="font-mono font-bold text-[#5C4033]">{partyB.trackingNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8C7A6B] font-medium">Dispatched Proof</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Receipt Uploaded
                </span>
              </div>
            </div>
          )}

          {!isIntercity && exchange.meetupLocation && (
            <div className="bg-[#F9F6F0] p-3.5 rounded-xl border border-[#EBE2D8] text-xs">
              <span className="text-[#8C7A6B] block">Agreed In-Person Handover Location</span>
              <p className="font-semibold text-[#2C1D15] mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#5C4033]" /> {exchange.meetupLocation}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Timeline / Audit History */}
      <div className="bg-white border border-[#EBE2D8] rounded-xl p-5 shadow-xs">
        <h3 className="font-semibold text-sm text-[#2C1D15] mb-4">Milestone Timeline & Action Log</h3>
        <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#EBE2D8]">
          {exchange.history && exchange.history.map((event, idx) => (
            <div key={idx} className="flex items-start gap-4 pl-8 relative">
              <div className="w-2.5 h-2.5 rounded-full bg-[#5C4033] ring-4 ring-white absolute left-2 top-1.5" />
              <div className="text-xs">
                <span className="font-bold text-[#2C1D15]">{event.event}</span>
                <p className="text-[11px] text-[#8C7A6B] mt-0.5">{event.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Complete Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Mark Exchange Completed"
        message="Are you sure you want to officially finalize this exchange? Both parties have fulfilled exchange and receipt criteria."
        confirmText="Confirm Complete"
        type="primary"
        onConfirm={handleAdminComplete}
        onCancel={() => setConfirmModal({ isOpen: false, action: '' })}
      />
    </div>
  );
}
