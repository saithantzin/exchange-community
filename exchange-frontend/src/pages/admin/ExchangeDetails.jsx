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
  XCircle,
  Eye,
  CreditCard,
  Wallet,
  Smartphone,
  MessageSquare,
  FileText,
  RotateCcw,
  Copy,
  X
} from 'lucide-react';
import StatusBadge from '../../components/admin/StatusBadge';
import ConfirmModal from '../../components/admin/ConfirmModal';
import exchangeService from '../../services/exchangeService';

export default function ExchangeDetails() {
  const { id } = useParams();
  const [exchange, setExchange] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Fetch real exchange record from backend API
  React.useEffect(() => {
    let isMounted = true;
    setLoading(true);
    exchangeService.adminGetExchange(id)
      .then((res) => {
        if (!isMounted) return;
        if (res?.success && res.data) {
          setExchange(res.data);
          setLoadError(null);
        } else {
          throw new Error(res?.message || 'Could not load exchange details.');
        }
      })
      .catch((err) => {
        console.warn('Could not load exchange from API:', err?.message);
        if (isMounted) setLoadError(err?.response?.data?.message || err?.message || 'Could not load exchange details.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [id]);

  React.useEffect(() => {
    const exchangeId = exchange?.numericId;
    if (!exchangeId) return undefined;

    let cancelled = false;
    const objectUrls = [];
    Promise.all(['partyA', 'partyB'].map(async (partyRole) => {
      if (!exchange.deposits?.[partyRole]?.slipImage) return [partyRole, null];
      try {
        const url = await exchangeService.getAdminDepositEvidence(exchangeId, partyRole);
        objectUrls.push(url);
        return [partyRole, url];
      } catch (err) {
        console.warn(`Could not load ${partyRole} deposit evidence:`, err?.message);
        return [partyRole, null];
      }
    })).then((entries) => {
      if (cancelled) {
        objectUrls.forEach((url) => URL.revokeObjectURL(url));
        return;
      }
      setDepositEvidence(Object.fromEntries(entries));
    });

    return () => {
      cancelled = true;
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [exchange?.numericId, exchange?.deposits?.partyA?.slipImage, exchange?.deposits?.partyB?.slipImage]);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    action: ''
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [depositEvidence, setDepositEvidence] = useState({});
  const [copiedField, setCopiedField] = useState(null);
  const [processingDepositRole, setProcessingDepositRole] = useState(null);

  // Refund release modal state
  const [payoutModal, setPayoutModal] = useState({
    isOpen: false,
    partyRole: null,
    partyName: '',
    amount: 0,
    provider: '',
    accountNumber: '',
    accountName: '',
    txRef: ''
  });

  // Deposit rejection modal state
  const [rejectModal, setRejectModal] = useState({
    isOpen: false,
    partyRole: null,
    partyName: '',
    reason: ''
  });

  if (loading && !exchange) {
    return (
      <div className="p-12 text-center text-[#8C7A6B]">
        <div className="w-8 h-8 border-3 border-[#5C4033] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium">Loading exchange details from database...</p>
      </div>
    );
  }

  if (!exchange) {
    return (
      <div className="p-8 text-center text-[#8C7A6B]">
        <p>{loadError || 'Exchange record not found.'}</p>
        <Link to="/admin/exchanges" className="text-xs text-[#5C4033] underline mt-2 inline-block">
          Return to Exchanges
        </Link>
      </div>
    );
  }

  const { partyA, partyB, isIntercity, handoverMethod, deposits, externalContacts, refundWorkflow } = exchange;

  // Deposit statuses
  const partyADeposit = deposits?.partyA;
  const partyBDeposit = deposits?.partyB;
  const bothDepositsVerified = isIntercity && partyADeposit?.status === 'Verified' && partyBDeposit?.status === 'Verified';

  // Two-Sided Completion requirement
  const canMarkCompleted = isIntercity
    ? partyA.confirmedReceipt && partyB.confirmedReceipt
    : true;

  const handleCopy = (text, fieldName) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

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

  // Admin approves deposit slip
  const handleApproveDeposit = async (partyRole) => {
    if (processingDepositRole) return;
    setProcessingDepositRole(partyRole);

    try {
      const res = await exchangeService.adminApproveDeposit(exchange.numericId || exchange.id || id, { partyRole });
      if (!res?.success || !res.data) {
        throw new Error(res?.message || 'The server did not confirm deposit approval.');
      }
      setExchange(res.data);
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || 'Failed to approve deposit. No local status was changed.');
    } finally {
      setProcessingDepositRole(null);
    }
  };

  // Open Reject Modal
  const openRejectModal = (partyRole) => {
    const partyName = partyRole === 'partyA' ? partyA.name : partyB.name;
    setRejectModal({
      isOpen: true,
      partyRole,
      partyName,
      reason: ''
    });
  };

  // Confirm Reject Deposit
  const handleConfirmRejectDeposit = async () => {
    const { partyRole, reason } = rejectModal;
    if (!partyRole || processingDepositRole) return;
    if (reason.trim().length < 3) {
      alert('Enter a rejection reason of at least 3 characters.');
      return;
    }
    setProcessingDepositRole(partyRole);

    try {
      const res = await exchangeService.adminRejectDeposit(exchange.numericId || exchange.id || id, { partyRole, reason });
      if (!res?.success || !res.data) {
        throw new Error(res?.message || 'The server did not confirm deposit rejection.');
      }
      setExchange(res.data);
      setRejectModal({ isOpen: false, partyRole: null, partyName: '', reason: '' });
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || 'Failed to reject deposit. No local status was changed.');
    } finally {
      setProcessingDepositRole(null);
    }
  };

  // Open Refund Payout Modal
  const openPayoutModal = (partyRole) => {
    const party = partyRole === 'partyA' ? partyA : partyB;
    const refundInfo = refundWorkflow?.[partyRole] || {};
    const autoRef = `REF-${Math.floor(100000 + Math.random() * 900000)}`;

    setPayoutModal({
      isOpen: true,
      partyRole,
      partyName: party.name,
      amount: refundInfo.amount || deposits?.[partyRole]?.amount || 100000,
      provider: refundInfo.paymentProvider || 'KBZPay',
      accountNumber: refundInfo.accountNumber || '09XXXXXXXXX',
      accountName: refundInfo.accountName || party.name,
      txRef: autoRef
    });
  };

  // Confirm Release Refund
  const handleConfirmReleasePayout = async () => {
    try {
      const res = await exchangeService.adminProcessRefund(exchange.numericId || exchange.id || id, payoutModal);
      if (!res?.success || !res.data) {
        throw new Error(res?.message || 'The server did not confirm the refund payout.');
      }
      setExchange(res.data);
      setPayoutModal({ isOpen: false, partyRole: null, partyName: '', amount: 0, provider: '', accountNumber: '', accountName: '', txRef: '' });
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || 'Failed to release refund. No local status was changed.');
    }
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
              {isIntercity && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  Intercity Escrow Protocol
                </span>
              )}
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

      {/* 1. STATE 2: INTERCITY ESCROW DEPOSIT AUDIT PANEL */}
      {isIntercity && deposits && (
        <div className="bg-white border border-[#EBE2D8] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#EBE2D8]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#2C1D15]">
                  State 2: Escrow Deposit Verification & Audit
                </h3>
                <p className="text-xs text-[#5C4033]">
                  Both members must pay fixed category deposits before contact channels are unlocked. Admin reviews screenshots.
                </p>
              </div>
            </div>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full self-start sm:self-auto ${
                bothDepositsVerified
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}
            >
              {bothDepositsVerified ? '✓ Both Deposits Verified' : 'Deposit Verification In Progress'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Party A Deposit Card */}
            <div className="p-4 rounded-xl border border-[#EBE2D8] bg-[#F9F6F0] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#8C7A6B] uppercase tracking-wider block">
                    Party A Deposit
                  </span>
                  <span className="font-bold text-sm text-[#2C1D15]">{partyA.name}</span>
                </div>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    partyADeposit?.status === 'Verified'
                      ? 'bg-emerald-100 text-emerald-800'
                      : partyADeposit?.status === 'Payment Submitted'
                      ? 'bg-blue-100 text-blue-800 animate-pulse'
                      : partyADeposit?.status === 'Rejected'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-stone-200 text-stone-700'
                  }`}
                >
                  {partyADeposit?.status || 'Pending Payment'}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-[#2C1D15]">
                <div className="flex justify-between">
                  <span className="text-[#8C7A6B]">Category Deposit:</span>
                  <span className="font-bold">{(partyADeposit?.amount || 100000).toLocaleString()} MMK</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8C7A6B]">Payment Method:</span>
                  <span className="font-medium">{partyADeposit?.paymentMethod || 'KBZPay'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8C7A6B]">Transaction Ref:</span>
                  <span className="font-mono font-semibold">{partyADeposit?.referenceNumber || 'N/A'}</span>
                </div>
              </div>

              {/* Payment Slip Image Preview */}
              {depositEvidence.partyA && (
                <div className="pt-2 border-t border-[#EBE2D8]">
                  <span className="text-[10px] font-medium text-[#8C7A6B] block mb-1">
                    Payment Transfer Slip:
                  </span>
                  <div
                    onClick={() => setPreviewImage(depositEvidence.partyA)}
                    className="relative group cursor-pointer rounded-lg overflow-hidden border border-[#DDD1BF] h-28 bg-stone-100 flex items-center justify-center"
                  >
                    <img
                      src={depositEvidence.partyA}
                      alt="Party A Payment Slip"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-semibold">
                      <Eye className="w-4 h-4" />
                      <span>Click to Inspect Slip</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Admin Action Buttons for Party A */}
              {partyADeposit?.status === 'Payment Submitted' && (
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleApproveDeposit('partyA')}
                    disabled={processingDepositRole !== null}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 text-xs font-semibold flex items-center justify-center gap-1 shadow-xs transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{processingDepositRole === 'partyA' ? 'Approving...' : 'Approve Deposit'}</span>
                  </button>
                  <button
                    onClick={() => openRejectModal('partyA')}
                    disabled={processingDepositRole !== null}
                    className="py-1.5 px-3 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              )}

              {partyADeposit?.status === 'Verified' && (
                <div className="p-2 bg-emerald-50 rounded-lg text-[11px] text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Payment verified{partyADeposit.verifiedBy ? ` by ${partyADeposit.verifiedBy}` : ''}.
                    {partyADeposit.verifiedAt ? ` ${partyADeposit.verifiedAt}` : ''}
                  </span>
                </div>
              )}
              {partyADeposit?.rejectionReason && partyADeposit.status === 'Rejected' && (
                <p className="text-xs text-rose-800">Rejection reason: {partyADeposit.rejectionReason}</p>
              )}
            </div>

            {/* Party B Deposit Card */}
            <div className="p-4 rounded-xl border border-[#EBE2D8] bg-[#F9F6F0] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#8C7A6B] uppercase tracking-wider block">
                    Party B Deposit
                  </span>
                  <span className="font-bold text-sm text-[#2C1D15]">{partyB.name}</span>
                </div>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    partyBDeposit?.status === 'Verified'
                      ? 'bg-emerald-100 text-emerald-800'
                      : partyBDeposit?.status === 'Payment Submitted'
                      ? 'bg-blue-100 text-blue-800 animate-pulse'
                      : partyBDeposit?.status === 'Rejected'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-stone-200 text-stone-700'
                  }`}
                >
                  {partyBDeposit?.status || 'Pending Payment'}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-[#2C1D15]">
                <div className="flex justify-between">
                  <span className="text-[#8C7A6B]">Category Deposit:</span>
                  <span className="font-bold">{(partyBDeposit?.amount || 150000).toLocaleString()} MMK</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8C7A6B]">Payment Method:</span>
                  <span className="font-medium">{partyBDeposit?.paymentMethod || 'WavePay'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8C7A6B]">Transaction Ref:</span>
                  <span className="font-mono font-semibold">{partyBDeposit?.referenceNumber || 'N/A'}</span>
                </div>
              </div>

              {/* Payment Slip Image Preview */}
              {depositEvidence.partyB && (
                <div className="pt-2 border-t border-[#EBE2D8]">
                  <span className="text-[10px] font-medium text-[#8C7A6B] block mb-1">
                    Payment Transfer Slip:
                  </span>
                  <div
                    onClick={() => setPreviewImage(depositEvidence.partyB)}
                    className="relative group cursor-pointer rounded-lg overflow-hidden border border-[#DDD1BF] h-28 bg-stone-100 flex items-center justify-center"
                  >
                    <img
                      src={depositEvidence.partyB}
                      alt="Party B Payment Slip"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-semibold">
                      <Eye className="w-4 h-4" />
                      <span>Click to Inspect Slip</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Admin Action Buttons for Party B */}
              {partyBDeposit?.status === 'Payment Submitted' && (
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleApproveDeposit('partyB')}
                    disabled={processingDepositRole !== null}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 text-xs font-semibold flex items-center justify-center gap-1 shadow-xs transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{processingDepositRole === 'partyB' ? 'Approving...' : 'Approve Deposit'}</span>
                  </button>
                  <button
                    onClick={() => openRejectModal('partyB')}
                    disabled={processingDepositRole !== null}
                    className="py-1.5 px-3 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              )}

              {partyBDeposit?.status === 'Verified' && (
                <div className="p-2 bg-emerald-50 rounded-lg text-[11px] text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Payment verified{partyBDeposit.verifiedBy ? ` by ${partyBDeposit.verifiedBy}` : ''}.
                    {partyBDeposit.verifiedAt ? ` ${partyBDeposit.verifiedAt}` : ''}
                  </span>
                </div>
              )}
              {partyBDeposit?.rejectionReason && partyBDeposit.status === 'Rejected' && (
                <p className="text-xs text-rose-800">Rejection reason: {partyBDeposit.rejectionReason}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* IN-PERSON MEETUP PROTOCOL NOTICE */}
      {!isIntercity && (
        <div className="bg-[#FAF8F5] border border-[#DDD1BF] rounded-xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#2C1D15]">In-Person Meetup Swap Protocol (No Deposit Required)</h3>
              <p className="text-xs text-[#5C4033] mt-0.5">
                This exchange is scheduled for direct face-to-face handover at {exchange.meetupLocation || 'a local public meeting place'}. Escrow deposits are strictly reserved for Intercity Courier Delivery.
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full whitespace-nowrap">
            2 States: Accept & Handover
          </span>
        </div>
      )}

      {/* 2. STATE 3: AUDIT EXTERNAL COMMUNICATION CONTACT DETAILS */}
      {isIntercity && (
        <div className="bg-white border border-[#EBE2D8] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EBE2D8]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-[#DDD1BF]/40 text-[#5C4033]">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#2C1D15]">
                  State 3: External Communication Contact Channels
                </h3>
                <p className="text-xs text-[#5C4033]">
                  {bothDepositsVerified
                    ? 'Both deposits verified. Participants have unlocked each other’s external contact methods.'
                    : 'Locked until both deposits are approved by administrator. Contact info is shielded.'}
                </p>
              </div>
            </div>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                bothDepositsVerified
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-stone-100 text-stone-600'
              }`}
            >
              {bothDepositsVerified ? 'Unlocked for Participants' : 'Shielded / Locked'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Party A Contacts */}
            <div className="p-3.5 rounded-xl border border-[#EBE2D8] bg-[#F9F6F0] space-y-2 text-xs">
              <span className="text-[11px] font-bold text-[#8C7A6B] uppercase tracking-wider block">
                Party A ({partyA.name}) Contacts
              </span>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[#8C7A6B]">Telegram:</span>
                  <span className="font-mono font-medium">{externalContacts?.partyA?.telegram || '@thantzin_mdy'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#8C7A6B]">Viber / Phone:</span>
                  <span className="font-mono font-medium">{externalContacts?.partyA?.viber || '+959798123456'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#8C7A6B]">Preferred App:</span>
                  <span className="font-semibold text-[#5C4033]">{externalContacts?.partyA?.preferredMethod || 'Telegram'}</span>
                </div>
              </div>
            </div>

            {/* Party B Contacts */}
            <div className="p-3.5 rounded-xl border border-[#EBE2D8] bg-[#F9F6F0] space-y-2 text-xs">
              <span className="text-[11px] font-bold text-[#8C7A6B] uppercase tracking-wider block">
                Party B ({partyB.name}) Contacts
              </span>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[#8C7A6B]">Telegram:</span>
                  <span className="font-mono font-medium">{externalContacts?.partyB?.telegram || '@kyawzin_ygn'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#8C7A6B]">Viber / Phone:</span>
                  <span className="font-mono font-medium">{externalContacts?.partyB?.viber || '+959450987654'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#8C7A6B]">Preferred App:</span>
                  <span className="font-semibold text-[#5C4033]">{externalContacts?.partyB?.preferredMethod || 'Viber'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. STATE 4 & 5: COURIER SHIPPING & TWO-SIDED RECEIPT CONFIRMATION */}
      {isIntercity && (
        <div className="bg-white border border-[#EBE2D8] rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-[#DDD1BF]/40 text-[#5C4033]">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#2C1D15]">
                  State 5: Two-Sided Receipt Confirmation Policy
                </h3>
                <p className="text-xs text-[#5C4033]">
                  Both members must independently acknowledge parcel arrival before the deposit refund workflow initiates.
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

      {/* 4. STATE 6: ESCROW DEPOSIT REFUND PAYOUT MODERATION */}
      {isIntercity && (
        <div className="bg-white border border-[#EBE2D8] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#EBE2D8]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#2C1D15]">
                  State 6: Escrow Deposit Refund Payout Moderation
                </h3>
                <p className="text-xs text-[#5C4033]">
                  Both users submit their mobile wallet/bank account number after receiving items. Admin verifies and releases refund payout.
                </p>
              </div>
            </div>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full self-start sm:self-auto ${
                refundWorkflow?.partyA?.status === 'Completed' && refundWorkflow?.partyB?.status === 'Completed'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : partyA.confirmedReceipt && partyB.confirmedReceipt
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'bg-stone-100 text-stone-600 border border-stone-200'
              }`}
            >
              {refundWorkflow?.partyA?.status === 'Completed' && refundWorkflow?.partyB?.status === 'Completed'
                ? '✓ Both Refunds Released'
                : partyA.confirmedReceipt && partyB.confirmedReceipt
                ? 'Ready for Refund Payout'
                : 'Awaiting Item Delivery'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Party A Refund Payout Card */}
            <div className="p-4 rounded-xl border border-[#EBE2D8] bg-[#F9F6F0] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#8C7A6B] uppercase tracking-wider block">
                    Party A Refund
                  </span>
                  <span className="font-bold text-sm text-[#2C1D15]">{partyA.name}</span>
                </div>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    refundWorkflow?.partyA?.status === 'Completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : refundWorkflow?.partyA?.status === 'Processing Payout'
                      ? 'bg-amber-100 text-amber-800 animate-pulse'
                      : 'bg-stone-200 text-stone-700'
                  }`}
                >
                  {refundWorkflow?.partyA?.status || 'Pending Details'}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-[#2C1D15]">
                <div className="flex justify-between">
                  <span className="text-[#8C7A6B]">Refund Amount:</span>
                  <span className="font-bold text-emerald-800">
                    {(refundWorkflow?.partyA?.amount || deposits?.partyA?.amount || 100000).toLocaleString()} MMK
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8C7A6B]">Payout Wallet:</span>
                  <span className="font-semibold text-[#5C4033]">
                    {refundWorkflow?.partyA?.paymentProvider || 'KBZPay'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#8C7A6B]">Account Number:</span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-[#2C1D15]">
                    <span>{refundWorkflow?.partyA?.accountNumber || '09798123456'}</span>
                    <button
                      onClick={() => handleCopy(refundWorkflow?.partyA?.accountNumber || '09798123456', 'pA-acc')}
                      className="p-1 hover:bg-[#DDD1BF] rounded text-[#5C4033]"
                      title="Copy number"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    {copiedField === 'pA-acc' && <span className="text-[10px] text-emerald-700">Copied!</span>}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8C7A6B]">Account Holder:</span>
                  <span className="font-medium">{refundWorkflow?.partyA?.accountName || partyA.name}</span>
                </div>
                {refundWorkflow?.partyA?.refundTransactionRef && (
                  <div className="flex justify-between pt-1 border-t border-[#DDD1BF]">
                    <span className="text-[#8C7A6B]">Payout Tx Ref:</span>
                    <span className="font-mono font-bold text-emerald-700">
                      {refundWorkflow.partyA.refundTransactionRef}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              {refundWorkflow?.partyA?.status === 'Processing Payout' && (
                <button
                  onClick={() => openPayoutModal('partyA')}
                  className="w-full mt-2 py-2 px-3 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>Release Refund Payout</span>
                </button>
              )}

              {refundWorkflow?.partyA?.status === 'Completed' && (
                <div className="p-2 bg-emerald-50 rounded-lg text-[11px] text-emerald-800 flex items-center gap-1.5 mt-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Refund released successfully to member’s wallet.</span>
                </div>
              )}
            </div>

            {/* Party B Refund Payout Card */}
            <div className="p-4 rounded-xl border border-[#EBE2D8] bg-[#F9F6F0] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#8C7A6B] uppercase tracking-wider block">
                    Party B Refund
                  </span>
                  <span className="font-bold text-sm text-[#2C1D15]">{partyB.name}</span>
                </div>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    refundWorkflow?.partyB?.status === 'Completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : refundWorkflow?.partyB?.status === 'Processing Payout'
                      ? 'bg-amber-100 text-amber-800 animate-pulse'
                      : 'bg-stone-200 text-stone-700'
                  }`}
                >
                  {refundWorkflow?.partyB?.status || 'Pending Details'}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-[#2C1D15]">
                <div className="flex justify-between">
                  <span className="text-[#8C7A6B]">Refund Amount:</span>
                  <span className="font-bold text-emerald-800">
                    {(refundWorkflow?.partyB?.amount || deposits?.partyB?.amount || 100000).toLocaleString()} MMK
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8C7A6B]">Payout Wallet:</span>
                  <span className="font-semibold text-[#5C4033]">
                    {refundWorkflow?.partyB?.paymentProvider || 'WavePay'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#8C7A6B]">Account Number:</span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-[#2C1D15]">
                    <span>{refundWorkflow?.partyB?.accountNumber || '09450987654'}</span>
                    <button
                      onClick={() => handleCopy(refundWorkflow?.partyB?.accountNumber || '09450987654', 'pB-acc')}
                      className="p-1 hover:bg-[#DDD1BF] rounded text-[#5C4033]"
                      title="Copy number"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    {copiedField === 'pB-acc' && <span className="text-[10px] text-emerald-700">Copied!</span>}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8C7A6B]">Account Holder:</span>
                  <span className="font-medium">{refundWorkflow?.partyB?.accountName || partyB.name}</span>
                </div>
                {refundWorkflow?.partyB?.refundTransactionRef && (
                  <div className="flex justify-between pt-1 border-t border-[#DDD1BF]">
                    <span className="text-[#8C7A6B]">Payout Tx Ref:</span>
                    <span className="font-mono font-bold text-emerald-700">
                      {refundWorkflow.partyB.refundTransactionRef}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              {refundWorkflow?.partyB?.status === 'Processing Payout' && (
                <button
                  onClick={() => openPayoutModal('partyB')}
                  className="w-full mt-2 py-2 px-3 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>Release Refund Payout</span>
                </button>
              )}

              {refundWorkflow?.partyB?.status === 'Completed' && (
                <div className="p-2 bg-emerald-50 rounded-lg text-[11px] text-emerald-800 flex items-center gap-1.5 mt-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Refund released successfully to member’s wallet.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. EXCHANGED ITEMS SIDE-BY-SIDE */}
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

      {/* 6. TRANSACTION AUDIT LOG & TIMELINE */}
      <div className="bg-white border border-[#EBE2D8] rounded-xl p-5 shadow-xs">
        <h3 className="font-semibold text-sm text-[#2C1D15] mb-4">Milestone Timeline & Action Log</h3>
        <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#EBE2D8]">
          {exchange.history &&
            exchange.history.map((event, idx) => (
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

      {/* Lightbox Slip Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[2000] bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-[#F9F6F0] border-b border-[#DDD1BF] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#5C4033]" />
                <h4 className="font-bold text-sm text-[#2C1D15]">Payment Transfer Slip Inspection</h4>
              </div>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-1 rounded-lg text-[#8C7A6B] hover:text-[#2C1D15] hover:bg-[#DDD1BF]/40 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 bg-stone-900 flex items-center justify-center max-h-[70vh] overflow-auto">
              <img
                src={previewImage}
                alt="Document Preview"
                className="max-h-[65vh] w-auto object-contain rounded-lg"
              />
            </div>
            <div className="p-3 bg-[#F9F6F0] text-center text-xs text-[#8C7A6B]">
              Audit preview generated for administrative compliance & escrow release verification.
            </div>
          </div>
        </div>
      )}

      {/* Refund Payout Confirmation Modal */}
      {payoutModal.isOpen && (
        <div className="fixed inset-0 z-[2000] bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#EBE2D8] space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#2C1D15]">Release Deposit Refund Payout</h3>
                <p className="text-xs text-[#5C4033]">
                  Transfer escrow funds to member's registered payout wallet.
                </p>
              </div>
            </div>

            <div className="bg-[#F9F6F0] p-4 rounded-xl border border-[#EBE2D8] text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[#8C7A6B]">Recipient:</span>
                <span className="font-bold text-[#2C1D15]">{payoutModal.partyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8C7A6B]">Refund Amount:</span>
                <span className="font-bold text-emerald-800 text-sm">
                  {payoutModal.amount.toLocaleString()} MMK
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8C7A6B]">Wallet Provider:</span>
                <span className="font-semibold text-[#5C4033]">{payoutModal.provider}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8C7A6B]">Account Number:</span>
                <span className="font-mono font-bold text-[#2C1D15]">{payoutModal.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8C7A6B]">Account Name:</span>
                <span className="font-medium text-[#2C1D15]">{payoutModal.accountName}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2C1D15] mb-1">
                Bank / Wallet Transaction Reference Number:
              </label>
              <input
                type="text"
                value={payoutModal.txRef}
                onChange={(e) => setPayoutModal((p) => ({ ...p, txRef: e.target.value }))}
                className="w-full px-3 py-2 text-xs border border-[#EBE2D8] rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-[#5C4033] bg-[#F9F6F0]"
                placeholder="e.g. REF-881920 or KBZ-991204"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setPayoutModal({ ...payoutModal, isOpen: false })}
                className="flex-1 py-2 text-xs font-semibold rounded-lg border border-[#EBE2D8] text-[#5C4033] hover:bg-[#F9F6F0] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReleasePayout}
                disabled={!payoutModal.txRef.trim()}
                className="flex-1 py-2 text-xs font-semibold rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-50 transition-colors shadow-xs"
              >
                Confirm Payout Released
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Slip Modal */}
      {rejectModal.isOpen && (
        <div className="fixed inset-0 z-[2000] bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#EBE2D8] space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-100 text-rose-800">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#2C1D15]">Reject Deposit Slip</h3>
                <p className="text-xs text-[#5C4033]">
                  Reject {rejectModal.partyName}'s payment submission.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2C1D15] mb-1">
                Rejection Reason:
              </label>
              <textarea
                rows={3}
                required
                value={rejectModal.reason}
                onChange={(e) => setRejectModal((r) => ({ ...r, reason: e.target.value }))}
                className="w-full p-3 text-xs border border-[#EBE2D8] rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500 bg-[#F9F6F0]"
                placeholder="State why the payment slip was not accepted..."
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setRejectModal({ isOpen: false, partyRole: null, partyName: '', reason: '' })}
                className="flex-1 py-2 text-xs font-semibold rounded-lg border border-[#EBE2D8] text-[#5C4033] hover:bg-[#F9F6F0] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRejectDeposit}
                disabled={processingDepositRole !== null || rejectModal.reason.trim().length < 3}
                className="flex-1 py-2 text-xs font-semibold rounded-lg bg-rose-700 text-white hover:bg-rose-800 transition-colors shadow-xs"
              >
                {processingDepositRole === rejectModal.partyRole ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

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
