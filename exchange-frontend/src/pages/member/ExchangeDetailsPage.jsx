import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useExchange } from '../../context/ExchangeContext';
import MemberProfileModal from '../../components/MemberProfileModal';
import exchangeService from '../../services/exchangeService';
import {
  Shield,
  ShieldCheck,
  Lock,
  Unlock,
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  Truck,
  Box,
  ArrowRight,
  Phone,
  Upload,
  X,
  Eye,
  RefreshCw,
  Coins,
  Send,
  Calendar,
  MessageCircle
} from 'lucide-react';

export default function ExchangeDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const {
    exchanges,
    completeExchange,
    confirmReceipt,
    updateCourierDispatch,
    fileDispute,
    submitDeposit,
    verifyDeposit,
    confirmCourierArrangement,
    submitRefundRequest,
    completeRefundPayout
  } = useExchange();

  const exchange = exchanges.find(e => e.id === id) || exchanges[0];

  const isIntercity = Boolean(
    exchange.isIntercity ||
    exchange.handoverMethod?.toLowerCase().includes('courier') ||
    exchange.handoverMethod?.toLowerCase().includes('express') ||
    (exchange.partyA && exchange.partyB) ||
    (exchange.itemA?.ownerCity && exchange.itemB?.ownerCity && exchange.itemA.ownerCity !== exchange.itemB.ownerCity)
  );

  // Fallback safe deposit structure if exchange was initialized prior to deposit updates
  const myDeposit = exchange.deposits?.partyA || {
    itemTitle: exchange.itemA?.title || 'Your Item',
    category: exchange.itemA?.category || 'Electronics',
    amount: 100000,
    status: exchange.status === 'Completed' || exchange.status === 'In Transit' ? 'Verified' : 'Unpaid',
    paymentMethod: 'KBZPay',
    referenceNumber: 'KBZ-491204',
    slipImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&q=80',
    submittedAt: 'Today',
    verifiedAt: exchange.status === 'Completed' || exchange.status === 'In Transit' ? 'Today' : null
  };

  const otherDeposit = exchange.deposits?.partyB || {
    itemTitle: exchange.itemB?.title || 'Partner Item',
    category: exchange.itemB?.category || 'Electronics',
    amount: 100000,
    status: exchange.status === 'Completed' || exchange.status === 'In Transit' ? 'Verified' : 'Payment Submitted',
    paymentMethod: 'WavePay',
    referenceNumber: 'WAVE-819441',
    slipImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&q=80',
    submittedAt: 'Today',
    verifiedAt: exchange.status === 'Completed' || exchange.status === 'In Transit' ? 'Today' : null
  };

  const bothDepositsVerified = Boolean(myDeposit.status === 'Verified' && otherDeposit.status === 'Verified');
  const isArrangementConfirmed = Boolean(exchange.courierArrangement?.confirmed || exchange.partyA?.dispatched || exchange.partyB?.dispatched || exchange.isCompleted);
  const bothReceiptsConfirmed = Boolean(exchange.partyA?.confirmedReceipt && exchange.partyB?.confirmedReceipt);

  // State 6: Refund Workflow details
  const myRefund = exchange.refundWorkflow?.partyA || {
    amount: myDeposit.amount || 100000,
    walletType: 'KBZPay',
    accountNumber: '',
    accountName: '',
    status: exchange.isCompleted ? 'Pending Details' : 'Awaiting Receipt Confirmation',
    requestedAt: null,
    transactionRef: null
  };

  const otherRefund = exchange.refundWorkflow?.partyB || {
    amount: otherDeposit.amount || 100000,
    walletType: 'WavePay',
    accountNumber: '09450987654',
    accountName: 'Kyaw Zin Htet',
    status: exchange.isCompleted ? 'Processing Payout' : 'Awaiting Receipt Confirmation',
    requestedAt: 'Today',
    transactionRef: null
  };

  // Compute current Intercity stage (1 to 6)
  const currentStage = (() => {
    if (myRefund.status === 'Completed') return 6;
    if (bothReceiptsConfirmed || exchange.isCompleted) return 6;
    if (exchange.partyA?.dispatched || exchange.partyB?.dispatched) return 5;
    if (isArrangementConfirmed) return 4;
    if (bothDepositsVerified) return 3;
    return 2;
  })();

  // Toast notification state
  const [toastMessage, setToastMessage] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  // Partner Profile Modal State
  const [showPartnerProfile, setShowPartnerProfile] = useState(false);

  // Deposit Payment Modal State (State 2)
  const [showPayDepositModal, setShowPayDepositModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('KBZPay');
  const [paymentRefNumber, setPaymentRefNumber] = useState('');
  const [paymentSlipImage, setPaymentSlipImage] = useState('');
  const [submittingDeposit, setSubmittingDeposit] = useState(false);

  // Courier Dispatch Modal State (State 4)
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [courierName, setCourierName] = useState(exchange.partyA?.courier || 'Royal Express');
  const [trackingNumber, setTrackingNumber] = useState(exchange.partyA?.trackingNumber || '');
  const [shippingDate, setShippingDate] = useState(new Date().toISOString().split('T')[0]);
  const [receiptImage, setReceiptImage] = useState(exchange.partyA?.receiptImage || '');

  // State 6: Refund Request Payout Form State
  const [refundWalletType, setRefundWalletType] = useState('KBZPay');
  const [refundAccountNumber, setRefundAccountNumber] = useState(currentUser?.phone || '09798123456');
  const [refundAccountName, setRefundAccountName] = useState(currentUser?.name || 'Thant Zin');
  const [submittingRefund, setSubmittingRefund] = useState(false);

  // Dispute Modal State
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeCategory, setDisputeCategory] = useState('Misleading Item Condition');
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeImage, setDisputeImage] = useState('');

  // Image Lightbox Preview
  const [previewImageModal, setPreviewImageModal] = useState(null);

  // Copy to clipboard helper
  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  // Submit Deposit (State 2)
  const handlePayDepositSubmit = async (e) => {
    e.preventDefault();
    if (!paymentRefNumber.trim()) {
      alert('Please enter your transaction reference number or last 6 digits.');
      return;
    }
    setSubmittingDeposit(true);

    try {
      await exchangeService.submitDeposit(exchange.id, {
        paymentMethod: selectedPaymentMethod,
        referenceNumber: paymentRefNumber,
        slipImage: paymentSlipImage || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&q=80'
      });

      submitDeposit(exchange.id, 'partyA', {
        paymentMethod: selectedPaymentMethod,
        referenceNumber: paymentRefNumber,
        slipImage: paymentSlipImage || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&q=80'
      });

      setShowPayDepositModal(false);
      setToastMessage({
        title: 'Deposit Payment Submitted!',
        text: 'Your escrow payment proof has been submitted for platform verification.'
      });
      setTimeout(() => setToastMessage(null), 5000);
    } catch {
      alert('Failed to submit deposit. Please try again.');
    } finally {
      setSubmittingDeposit(false);
    }
  };

  // Simulate Verifying Deposits for testing
  const handleSimulateVerifyMyDeposit = async () => {
    await exchangeService.verifyDeposit(exchange.id, 'partyA');
    verifyDeposit(exchange.id, 'partyA');
    setToastMessage({
      title: 'Your Deposit Verified!',
      text: 'Platform administrator verified your escrow payment.'
    });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSimulateVerifyOtherDeposit = async () => {
    await exchangeService.verifyDeposit(exchange.id, 'partyB');
    verifyDeposit(exchange.id, 'partyB');
    setToastMessage({
      title: "Partner's Deposit Verified!",
      text: "Both deposits verified! Communication contact information is now unlocked."
    });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Confirm Courier Arrangement (State 3 -> State 4)
  const handleConfirmArrangement = async () => {
    await exchangeService.confirmCourierArrangement(exchange.id);
    confirmCourierArrangement(exchange.id);
    setToastMessage({
      title: 'Courier Arrangement Confirmed!',
      text: 'You can now drop off your parcel at the courier branch and upload waybill tracking.'
    });
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Submit Courier Shipping Dispatch (State 4)
  const handleSaveDispatch = async (e) => {
    e.preventDefault();
    if (!trackingNumber.trim()) {
      alert('Please enter a valid courier tracking or waybill ID.');
      return;
    }

    const payload = {
      courier: courierName,
      trackingNumber,
      shippingDate,
      receiptImage: receiptImage || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&q=80'
    };

    await exchangeService.submitShipping(exchange.id, payload);
    updateCourierDispatch(exchange.id, 'partyA', payload);
    setShowDispatchModal(false);
    setToastMessage({
      title: 'Waybill & Parcel Dispatched!',
      text: `Your parcel has been marked dispatched with ${courierName}.`
    });
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Simulate Partner Dispatching Parcel
  const handleSimulatePartnerDispatch = () => {
    updateCourierDispatch(exchange.id, 'partyB', {
      courier: 'Elite Cargo Express',
      trackingNumber: `EC-${Math.floor(1000 + Math.random() * 9000)}-YM`,
      shippingDate: new Date().toISOString().split('T')[0],
      receiptImage: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&q=80'
    });
    setToastMessage({
      title: 'Partner Dispatched Parcel!',
      text: 'Kyaw Zin Htet dispatched his parcel via Elite Cargo Express.'
    });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Confirm Receipt (State 5)
  const handleConfirmIntercityReceipt = async () => {
    confirmReceipt(exchange.id, 'partyA', 'Verified item condition from parcel.');
    setToastMessage({
      title: 'Parcel Receipt Confirmed!',
      text: exchange.partyB?.confirmedReceipt
        ? 'Both members confirmed receipt! Please proceed to State 6 to enter your payout number for the deposit refund.'
        : 'You confirmed receipt. Awaiting partner receipt confirmation to unlock State 6 refund.'
    });
    setTimeout(() => setToastMessage(null), 5000);
  };

  // State 6: Submit Refund Request (User enters their account number)
  const handleSubmitRefund = async (e) => {
    e.preventDefault();
    if (!refundAccountNumber.trim()) {
      alert('Please enter your mobile wallet or bank account number.');
      return;
    }
    if (!refundAccountName.trim()) {
      alert('Please enter the account holder name.');
      return;
    }

    setSubmittingRefund(true);
    try {
      await exchangeService.requestRefund(exchange.id, {
        walletType: refundWalletType,
        accountNumber: refundAccountNumber,
        accountName: refundAccountName,
        partyRole: 'partyA'
      });

      submitRefundRequest(exchange.id, 'partyA', {
        walletType: refundWalletType,
        accountNumber: refundAccountNumber,
        accountName: refundAccountName
      });

      setToastMessage({
        title: 'Deposit Refund Requested!',
        text: `Your payout request of ${(myDeposit.amount || 100000).toLocaleString()} MMK to ${refundWalletType} (${refundAccountNumber}) has been submitted for transfer.`
      });
      setTimeout(() => setToastMessage(null), 5000);
    } catch {
      alert('Failed to submit refund payout request.');
    } finally {
      setSubmittingRefund(false);
    }
  };

  // State 6: Simulate Admin Transferring Deposit Refund
  const handleSimulateCompleteRefund = async () => {
    await exchangeService.processRefundPayout(exchange.id, 'partyA');
    completeRefundPayout(exchange.id, 'partyA');
    setToastMessage({
      title: 'Deposit Refund Released!',
      text: `Full deposit of ${(myDeposit.amount || 100000).toLocaleString()} MMK has been transferred to your ${myRefund.walletType || refundWalletType} account.`
    });
    setTimeout(() => setToastMessage(null), 5000);
  };

  // File Dispute
  const handleFileDispute = (e) => {
    e.preventDefault();
    if (!disputeReason.trim()) {
      alert('Please explain the issue or defect with the received item.');
      return;
    }
    fileDispute({
      exchangeId: exchange.id,
      itemTitle: exchange.itemB?.title || 'Received Item',
      reportedUser: exchange.partyB?.name || 'Partner',
      category: disputeCategory,
      reason: disputeReason,
      evidenceImage: disputeImage
    });
    setShowDisputeModal(false);
    setToastMessage({
      title: 'Dispute Filed with Platform Moderation',
      text: 'Your evidence has been assigned to an administrator for review.'
    });
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Partner Communication Profile
  const partnerContacts = exchange.partyB?.communicationContacts || {
    telegram: '@kyawzin_htet',
    viber: '09450987654',
    facebook: 'https://facebook.com/kyawzin.htet',
    alternative: 'Signal: +959450987654',
    preferredMethod: 'telegram'
  };

  const myContacts = currentUser?.communicationContacts || {
    telegram: '@thantzin_mdy',
    viber: currentUser?.phone || '09798123456',
    facebook: 'https://facebook.com/thantzin.mdy',
    alternative: '',
    preferredMethod: 'viber'
  };

  return (
    <div className="py-8 bg-[#F9F6F0] min-h-[85vh]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 max-w-md bg-white border border-[#DDD1BF] border-l-4 border-l-[#5C4033] rounded-xl shadow-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <div className="font-bold text-[#2C1D15] text-sm">{toastMessage.title}</div>
              <div className="text-[#5C4033] mt-0.5 leading-relaxed">{toastMessage.text}</div>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-[#8C7A6B] hover:text-[#2C1D15] text-sm p-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Breadcrumb & Title */}
        <div className="mb-6 pb-4 border-b border-[#DDD1BF] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <nav className="flex items-center gap-2 text-xs text-[#8C7A6B] mb-1 font-medium">
              <Link to="/dashboard" className="hover:text-[#2C1D15] transition-colors">Dashboard</Link>
              <span>/</span>
              <Link to="/requests" className="hover:text-[#2C1D15] transition-colors">Exchanges</Link>
              <span>/</span>
              <span className="text-[#2C1D15] font-semibold">#{exchange.id}</span>
            </nav>
            <div className="flex items-center gap-3">
              <h1 className="font-serif font-bold text-2xl text-[#2C1D15]">
                Exchange #{exchange.id}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#DDD1BF]/60 text-[#2C1D15] border border-[#c8bba7]">
                {isIntercity ? 'Intercity Courier' : 'Local Meetup'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              exchange.isCompleted
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : 'bg-amber-100 text-amber-800 border border-amber-200'
            }`}>
              {exchange.status || (exchange.isCompleted ? 'Completed' : 'In Progress')}
            </span>

            <button
              onClick={() => setShowDisputeModal(true)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 transition-colors inline-flex items-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Report Dispute</span>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* INTERCITY 6-STAGE PROGRESS STEPPER                        */}
        {/* ======================================================== */}
        {isIntercity && (
          <div className="bg-white rounded-2xl border border-[#DDD1BF] p-5 sm:p-6 mb-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-[#8C7A6B] uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#5C4033]" />
                Intercity Exchange Protocol Stepper
              </h2>
              <span className="text-[11px] font-semibold text-[#5C4033] bg-[#F9F6F0] px-2.5 py-0.5 rounded-full border border-[#DDD1BF]">
                Stage {currentStage} of 6
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5 text-center">
              {/* Stage 1 */}
              <div className="p-2 rounded-xl border bg-emerald-50 border-emerald-200 text-emerald-900">
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center mx-auto mb-1">
                  ✓
                </div>
                <div className="text-[11px] font-bold leading-tight">1. Accepted</div>
                <div className="text-[10px] text-emerald-700 mt-0.5">Approved</div>
              </div>

              {/* Stage 2 */}
              <div className={`p-2 rounded-xl border transition-all ${
                bothDepositsVerified
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : currentStage === 2
                  ? 'bg-amber-50 border-amber-300 text-amber-900 ring-2 ring-amber-300'
                  : 'bg-white border-[#EBE2D8] text-[#8C7A6B]'
              }`}>
                <div className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center mx-auto mb-1 ${
                  bothDepositsVerified ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
                }`}>
                  {bothDepositsVerified ? '✓' : '2'}
                </div>
                <div className="text-[11px] font-bold leading-tight">2. Deposit</div>
                <div className="text-[10px] mt-0.5">
                  {bothDepositsVerified ? 'Both Verified' : 'Awaiting Payment'}
                </div>
              </div>

              {/* Stage 3 */}
              <div className={`p-2 rounded-xl border transition-all ${
                isArrangementConfirmed || currentStage >= 4
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : bothDepositsVerified
                  ? 'bg-blue-50 border-blue-300 text-blue-900 ring-2 ring-blue-300'
                  : 'bg-white border-[#EBE2D8] text-[#8C7A6B] opacity-60'
              }`}>
                <div className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center mx-auto mb-1 ${
                  isArrangementConfirmed || currentStage >= 4
                    ? 'bg-emerald-600 text-white'
                    : bothDepositsVerified
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#DDD1BF] text-[#5C4033]'
                }`}>
                  {isArrangementConfirmed || currentStage >= 4 ? '✓' : bothDepositsVerified ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                </div>
                <div className="text-[11px] font-bold leading-tight">3. Contact</div>
                <div className="text-[10px] mt-0.5">
                  {bothDepositsVerified ? 'Unlocked' : 'Locked'}
                </div>
              </div>

              {/* Stage 4 */}
              <div className={`p-2 rounded-xl border transition-all ${
                exchange.partyA?.dispatched && exchange.partyB?.dispatched
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : currentStage === 4
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-900 ring-2 ring-indigo-300'
                  : 'bg-white border-[#EBE2D8] text-[#8C7A6B] opacity-60'
              }`}>
                <div className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center mx-auto mb-1 ${
                  exchange.partyA?.dispatched && exchange.partyB?.dispatched
                    ? 'bg-emerald-600 text-white'
                    : currentStage === 4
                    ? 'bg-indigo-600 text-white'
                    : 'bg-[#DDD1BF] text-[#5C4033]'
                }`}>
                  {exchange.partyA?.dispatched && exchange.partyB?.dispatched ? '✓' : '4'}
                </div>
                <div className="text-[11px] font-bold leading-tight">4. Shipping</div>
                <div className="text-[10px] mt-0.5">
                  {exchange.partyA?.dispatched ? 'Dispatched' : 'Waybill Recording'}
                </div>
              </div>

              {/* Stage 5 */}
              <div className={`p-2 rounded-xl border transition-all ${
                bothReceiptsConfirmed
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : currentStage === 5
                  ? 'bg-purple-50 border-purple-300 text-purple-900 ring-2 ring-purple-300'
                  : 'bg-white border-[#EBE2D8] text-[#8C7A6B] opacity-60'
              }`}>
                <div className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center mx-auto mb-1 ${
                  bothReceiptsConfirmed
                    ? 'bg-emerald-600 text-white'
                    : currentStage === 5
                    ? 'bg-purple-600 text-white'
                    : 'bg-[#DDD1BF] text-[#5C4033]'
                }`}>
                  {bothReceiptsConfirmed ? '✓' : '5'}
                </div>
                <div className="text-[11px] font-bold leading-tight">5. Receipt</div>
                <div className="text-[10px] mt-0.5">
                  {bothReceiptsConfirmed ? 'Both Confirmed' : 'Inspection'}
                </div>
              </div>

              {/* Stage 6 */}
              <div className={`p-2 rounded-xl border transition-all ${
                myRefund.status === 'Completed'
                  ? 'bg-emerald-100 border-emerald-300 text-emerald-900 ring-2 ring-emerald-400'
                  : currentStage === 6
                  ? 'bg-amber-50 border-amber-300 text-amber-900 ring-2 ring-amber-300'
                  : 'bg-white border-[#EBE2D8] text-[#8C7A6B] opacity-60'
              }`}>
                <div className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center mx-auto mb-1 ${
                  myRefund.status === 'Completed'
                    ? 'bg-emerald-600 text-white'
                    : currentStage === 6
                    ? 'bg-amber-600 text-white'
                    : 'bg-[#DDD1BF] text-[#5C4033]'
                }`}>
                  {myRefund.status === 'Completed' ? '✓' : '6'}
                </div>
                <div className="text-[11px] font-bold leading-tight">6. Refund</div>
                <div className="text-[10px] mt-0.5">
                  {myRefund.status === 'Completed' ? 'Released' : currentStage === 6 ? 'Enter Number' : 'Locked'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STATE 2: ESCROW DEPOSIT PAYMENT CARDS                     */}
        {/* ======================================================== */}
        {isIntercity && (
          <div className="bg-white rounded-2xl border border-[#DDD1BF] p-5 sm:p-6 mb-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-[#EBE2D8] gap-2">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#2C1D15] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                  State 2: Escrow Deposit Payments
                </h3>
                <p className="text-xs text-[#5C4033] mt-0.5">
                  Each participant pays their deposit based on their offered item's category. 100% refunded upon dual delivery confirmation.
                </p>
              </div>

              {/* Simulation Testing Shortcuts */}
              <div className="flex flex-wrap items-center gap-2">
                {myDeposit.status !== 'Verified' && (
                  <button
                    onClick={handleSimulateVerifyMyDeposit}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                    title="Simulate administrator approving your deposit"
                  >
                    ⚡ Test: Verify My Deposit
                  </button>
                )}
                {otherDeposit.status !== 'Verified' && (
                  <button
                    onClick={handleSimulateVerifyOtherDeposit}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                    title="Simulate partner paying and getting verified"
                  >
                    ⚡ Test: Verify Partner Deposit
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Card 1: My Deposit */}
              <div className="p-4 rounded-xl border border-[#DDD1BF] bg-[#FAF8F5] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#5C4033]">
                      My Deposit (You)
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      myDeposit.status === 'Verified'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : myDeposit.status === 'Payment Submitted'
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {myDeposit.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={exchange.itemA?.image}
                      alt={exchange.itemA?.title}
                      className="w-14 h-14 rounded-lg object-cover border border-[#DDD1BF]"
                    />
                    <div>
                      <div className="font-semibold text-xs text-[#2C1D15] line-clamp-1">{myDeposit.itemTitle}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-[#8C7A6B] bg-white px-2 py-0.5 rounded border border-[#EBE2D8]">
                          Category: {myDeposit.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-white border border-[#EBE2D8] mb-3">
                    <div className="text-[11px] text-[#8C7A6B]">Required Escrow Deposit:</div>
                    <div className="text-lg font-bold font-mono text-[#2C1D15]">
                      {(myDeposit.amount || 100000).toLocaleString()} MMK
                    </div>
                    {myDeposit.referenceNumber && (
                      <div className="text-[11px] text-[#5C4033] mt-1 font-mono">
                        Ref: {myDeposit.referenceNumber} ({myDeposit.paymentMethod || 'KBZPay'})
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  {myDeposit.status === 'Unpaid' || myDeposit.status === 'Rejected' ? (
                    <button
                      onClick={() => setShowPayDepositModal(true)}
                      className="w-full py-2 px-3 text-xs font-bold rounded-lg bg-[#5C4033] text-white hover:bg-[#2C1D15] transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Coins className="w-4 h-4" />
                      <span>Pay Deposit ({(myDeposit.amount || 100000).toLocaleString()} MMK)</span>
                    </button>
                  ) : myDeposit.status === 'Payment Submitted' ? (
                    <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>Payment slip submitted. Platform admin verification in progress.</span>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Your deposit is verified and securely held in escrow.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card 2: Other Member's Deposit */}
              <div className="p-4 rounded-xl border border-[#DDD1BF] bg-[#FAF8F5] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#5C4033]">
                      Other Member's Deposit ({exchange.partyB?.name || 'Kyaw Zin Htet'})
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      otherDeposit.status === 'Verified'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : otherDeposit.status === 'Payment Submitted'
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {otherDeposit.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={exchange.itemB?.image}
                      alt={exchange.itemB?.title}
                      className="w-14 h-14 rounded-lg object-cover border border-[#DDD1BF]"
                    />
                    <div>
                      <div className="font-semibold text-xs text-[#2C1D15] line-clamp-1">{otherDeposit.itemTitle}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-[#8C7A6B] bg-white px-2 py-0.5 rounded border border-[#EBE2D8]">
                          Category: {otherDeposit.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-white border border-[#EBE2D8] mb-3">
                    <div className="text-[11px] text-[#8C7A6B]">Required Escrow Deposit:</div>
                    <div className="text-lg font-bold font-mono text-[#2C1D15]">
                      {(otherDeposit.amount || 100000).toLocaleString()} MMK
                    </div>
                    {otherDeposit.referenceNumber && (
                      <div className="text-[11px] text-[#5C4033] mt-1 font-mono">
                        Ref: {otherDeposit.referenceNumber} ({otherDeposit.paymentMethod || 'WavePay'})
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  {otherDeposit.status === 'Verified' ? (
                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Partner's deposit is verified and held in escrow.</span>
                    </div>
                  ) : otherDeposit.status === 'Payment Submitted' ? (
                    <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>Partner submitted payment proof. Awaiting verification.</span>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Awaiting partner to submit their escrow deposit.</span>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STATE 3: EXTERNAL COMMUNICATION CONTACT DETAILS           */}
        {/* (LOCKED until both deposits are verified)                */}
        {/* ======================================================== */}
        {isIntercity && (
          <div className="bg-white rounded-2xl border border-[#DDD1BF] p-5 sm:p-6 mb-6 shadow-xs">
            {!bothDepositsVerified ? (
              /* LOCKED STATE */
              <div className="text-center py-6 px-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-6 h-6" />
                </div>
                <h4 className="font-serif font-bold text-base text-[#2C1D15] mb-1">
                  State 3: Exchange Contact Information Locked
                </h4>
                <p className="text-xs text-[#5C4033] max-w-lg mx-auto leading-relaxed mb-4">
                  To safeguard both community members, personal communication channels remain strictly confidential and locked until <strong>BOTH participants' deposits have been verified</strong> by the platform.
                </p>

                <div className="inline-flex flex-col sm:flex-row items-center gap-2 sm:gap-4 p-3 rounded-xl bg-[#FAF8F5] border border-[#DDD1BF] text-xs">
                  <div className="flex items-center gap-1.5 font-medium">
                    {myDeposit.status === 'Verified' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-amber-600" />
                    )}
                    <span>My Deposit: <strong>{myDeposit.status}</strong></span>
                  </div>
                  <span className="hidden sm:inline text-[#c8bba7]">•</span>
                  <div className="flex items-center gap-1.5 font-medium">
                    {otherDeposit.status === 'Verified' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-amber-600" />
                    )}
                    <span>Partner Deposit: <strong>{otherDeposit.status}</strong></span>
                  </div>
                </div>
              </div>
            ) : (
              /* UNLOCKED STATE */
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-[#EBE2D8] gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">
                        <Unlock className="w-3.5 h-3.5" />
                      </span>
                      <h3 className="font-serif font-bold text-lg text-[#2C1D15]">
                        State 3: External Communication Contact Details
                      </h3>
                    </div>
                    <p className="text-xs text-[#5C4033] mt-0.5">
                      Both deposits verified! Connect through your preferred external apps to arrange courier details.
                    </p>
                  </div>

                  {!isArrangementConfirmed && (
                    <button
                      onClick={handleConfirmArrangement}
                      className="px-4 py-2 text-xs font-bold rounded-lg bg-[#5C4033] text-white hover:bg-[#2C1D15] transition-colors inline-flex items-center gap-2 shadow-xs"
                    >
                      <Check className="w-4 h-4" />
                      <span>Confirm Courier Arrangement</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  
                  {/* Other Participant's Contact Information */}
                  <div className="p-4 rounded-xl border border-[#DDD1BF] bg-[#FAF6FE]/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#7360F2] text-white flex items-center justify-center text-xs font-bold">
                          K
                        </div>
                        <div>
                          <div className="font-bold text-xs text-[#2C1D15]">{exchange.partyB?.name || 'Kyaw Zin Htet'}</div>
                          <div className="text-[11px] text-[#8C7A6B]">Exchange Partner ({exchange.partyB?.city || 'Yangon'})</div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EDE5FC] text-[#5B41C7] border border-[#DDD1BF]">
                        ⭐ Preferred: {partnerContacts.preferredMethod ? partnerContacts.preferredMethod.toUpperCase() : 'TELEGRAM'}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      {/* Telegram */}
                      <div className="p-2.5 rounded-lg bg-white border border-[#EBE2D8] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[#229ED9] font-bold">✈ Telegram:</span>
                          <span className="font-mono text-[#2C1D15]">{partnerContacts.telegram || '@kyawzin_htet'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleCopy(partnerContacts.telegram || '@kyawzin_htet', 'partner_telegram')}
                            className="p-1 text-[#8C7A6B] hover:text-[#2C1D15] rounded hover:bg-[#F9F6F0]"
                            title="Copy handle"
                          >
                            {copiedField === 'partner_telegram' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <a
                            href={`https://t.me/${(partnerContacts.telegram || 'kyawzin_htet').replace('@', '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-1 bg-[#229ED9] text-white rounded text-[11px] font-semibold hover:bg-[#1b88bd] inline-flex items-center gap-1"
                          >
                            <span>Open</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>

                      {/* Viber */}
                      <div className="p-2.5 rounded-lg bg-white border border-[#EBE2D8] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[#7360F2] font-bold">💬 Viber:</span>
                          <span className="font-mono text-[#2C1D15]">{partnerContacts.viber || '09450987654'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleCopy(partnerContacts.viber || '09450987654', 'partner_viber')}
                            className="p-1 text-[#8C7A6B] hover:text-[#2C1D15] rounded hover:bg-[#F9F6F0]"
                            title="Copy number"
                          >
                            {copiedField === 'partner_viber' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <a
                            href={`viber://chat?number=${partnerContacts.viber || '09450987654'}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-1 bg-[#7360F2] text-white rounded text-[11px] font-semibold hover:bg-[#5f4cd6] inline-flex items-center gap-1"
                          >
                            <span>Chat</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>

                      {/* Facebook Messenger */}
                      <div className="p-2.5 rounded-lg bg-white border border-[#EBE2D8] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[#1877F2] font-bold">👤 Messenger:</span>
                          <span className="font-mono text-[#2C1D15] text-[11px] truncate max-w-[130px]">
                            {partnerContacts.facebook || 'kyawzin.htet'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleCopy(partnerContacts.facebook || 'https://facebook.com/kyawzin.htet', 'partner_fb')}
                            className="p-1 text-[#8C7A6B] hover:text-[#2C1D15] rounded hover:bg-[#F9F6F0]"
                            title="Copy link"
                          >
                            {copiedField === 'partner_fb' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <a
                            href={partnerContacts.facebook?.startsWith('http') ? partnerContacts.facebook : `https://${partnerContacts.facebook || 'facebook.com/kyawzin.htet'}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-1 bg-[#1877F2] text-white rounded text-[11px] font-semibold hover:bg-[#0f60c4] inline-flex items-center gap-1"
                          >
                            <span>Profile</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* My Contact Information (As displayed to partner) */}
                  <div className="p-4 rounded-xl border border-[#DDD1BF] bg-[#FAF8F5]">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#5C4033] text-white flex items-center justify-center text-xs font-bold">
                          {currentUser?.name?.charAt(0) || 'T'}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-[#2C1D15]">My Contact Details</div>
                          <div className="text-[11px] text-[#8C7A6B]">Visible only to your verified partner</div>
                        </div>
                      </div>
                      <Link
                        to="/profile-settings"
                        className="text-[11px] font-semibold text-[#5C4033] hover:underline"
                      >
                        Edit in Profile →
                      </Link>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-white border border-[#EBE2D8] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[#229ED9] font-bold">✈ Telegram:</span>
                          <span className="font-mono text-[#2C1D15]">{myContacts.telegram || '@thantzin_mdy'}</span>
                        </div>
                        <span className="text-[11px] text-[#8C7A6B]">Active</span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-white border border-[#EBE2D8] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[#7360F2] font-bold">💬 Viber:</span>
                          <span className="font-mono text-[#2C1D15]">{myContacts.viber || '09798123456'}</span>
                        </div>
                        <span className="text-[11px] text-[#8C7A6B]">Active</span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-white border border-[#EBE2D8] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[#1877F2] font-bold">👤 Messenger:</span>
                          <span className="font-mono text-[#2C1D15] text-[11px] truncate max-w-[140px]">
                            {myContacts.facebook || 'facebook.com/thantzin.mdy'}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#8C7A6B]">Active</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Important Platform Protocol Notice */}
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#DDD1BF] text-xs text-[#5C4033] flex items-start gap-2.5 leading-relaxed">
                  <AlertCircle className="w-4 h-4 text-[#5C4033] shrink-0 mt-0.5" />
                  <div>
                    <strong>External Arrangement Protocol:</strong> Communicate via Viber, Telegram, or Facebook to agree on your exchange date, preferred courier company (e.g., Royal Express, Elite Cargo, Aung Express), drop-off branch, and parcel packaging. Once agreed, click <strong>"Confirm Courier Arrangement"</strong> above to proceed to shipping.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* STATE 4: COURIER ARRANGEMENT & SHIPPING DISPATCH         */}
        {/* ======================================================== */}
        {isIntercity && isArrangementConfirmed && (
          <div className="bg-white rounded-2xl border border-[#DDD1BF] p-5 sm:p-6 mb-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-[#EBE2D8] gap-2">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#2C1D15] flex items-center gap-2">
                  <Truck className="w-5 h-5 text-indigo-700" />
                  State 4: Courier Dispatch & Shipping Details
                </h3>
                <p className="text-xs text-[#5C4033] mt-0.5">
                  Record tracking numbers and upload receipt slips so both sides and the platform can monitor freight progress.
                </p>
              </div>

              {!exchange.partyB?.dispatched && (
                <button
                  onClick={handleSimulatePartnerDispatch}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  ⚡ Test: Partner Dispatches Parcel
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Party A (You) Shipping */}
              <div className="p-4 rounded-xl border border-[#DDD1BF] bg-[#FAF8F5]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#5C4033]">
                    Your Parcel Dispatch (Member A)
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    exchange.partyA?.dispatched
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {exchange.partyA?.dispatched ? 'Dispatched' : 'Pending Drop-off'}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-[#2C1D15] mb-3">
                  <div>Parcel Item: <strong>{exchange.itemA?.title}</strong></div>
                  <div>Courier Company: <strong>{exchange.partyA?.courier || 'Royal Express'}</strong></div>
                  <div>
                    Tracking / Waybill ID:{' '}
                    <span className="font-mono font-bold text-[#5C4033]">
                      {exchange.partyA?.trackingNumber || 'Not recorded yet'}
                    </span>
                  </div>
                  {exchange.partyA?.shippingDate && (
                    <div className="text-[11px] text-[#8C7A6B]">Shipping Date: {exchange.partyA.shippingDate}</div>
                  )}
                </div>

                {exchange.partyA?.receiptImage && (
                  <div className="mb-3">
                    <span className="text-[11px] text-[#8C7A6B] block mb-1">Waybill Slip Evidence:</span>
                    <img
                      src={exchange.partyA.receiptImage}
                      alt="Waybill Slip"
                      onClick={() => setPreviewImageModal(exchange.partyA.receiptImage)}
                      className="w-24 h-16 rounded-lg object-cover border border-[#DDD1BF] cursor-pointer hover:opacity-90"
                      title="Click to enlarge"
                    />
                  </div>
                )}

                <button
                  onClick={() => setShowDispatchModal(true)}
                  className="w-full py-2 px-3 text-xs font-semibold rounded-lg border border-[#c8bba7] bg-white text-[#2C1D15] hover:bg-[#F9F6F0] transition-colors"
                >
                  {exchange.partyA?.dispatched ? 'Update Courier Info or Receipt' : 'Enter Courier Tracking & Slip'}
                </button>
              </div>

              {/* Party B (Partner) Shipping */}
              <div className="p-4 rounded-xl border border-[#DDD1BF] bg-[#FAF8F5]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#5C4033]">
                    Partner's Parcel ({exchange.partyB?.name || 'Kyaw Zin Htet'})
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    exchange.partyB?.dispatched
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {exchange.partyB?.dispatched ? 'Dispatched' : 'Pending Drop-off'}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-[#2C1D15] mb-3">
                  <div>Parcel Item: <strong>{exchange.itemB?.title}</strong></div>
                  <div>Courier Company: <strong>{exchange.partyB?.courier || 'Elite Cargo Express'}</strong></div>
                  <div>
                    Tracking / Waybill ID:{' '}
                    <span className="font-mono font-bold text-[#5C4033]">
                      {exchange.partyB?.trackingNumber || 'Pending'}
                    </span>
                  </div>
                </div>

                {exchange.partyB?.receiptImage && (
                  <div className="mb-3">
                    <span className="text-[11px] text-[#8C7A6B] block mb-1">Partner Dispatch Slip:</span>
                    <img
                      src={exchange.partyB.receiptImage}
                      alt="Partner Slip"
                      onClick={() => setPreviewImageModal(exchange.partyB.receiptImage)}
                      className="w-24 h-16 rounded-lg object-cover border border-[#DDD1BF] cursor-pointer hover:opacity-90"
                      title="Click to enlarge"
                    />
                  </div>
                )}

                <div className="p-2.5 rounded-lg bg-white border border-[#EBE2D8] text-xs text-[#5C4033]">
                  {exchange.partyB?.dispatched ? (
                    <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Partner has dispatched their parcel via Elite Cargo.</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[#8C7A6B]">
                      <Clock className="w-4 h-4" />
                      <span>Awaiting partner to complete drop-off and enter waybill ID.</span>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STATE 5: DELIVERY RECEIPT CONFIRMATION                   */}
        {/* ======================================================== */}
        {isIntercity && (exchange.partyA?.dispatched || exchange.partyB?.dispatched || exchange.isCompleted) && (
          <div className="bg-white rounded-2xl border border-[#DDD1BF] p-5 sm:p-6 mb-6 shadow-xs">
            <div className="pb-4 mb-4 border-b border-[#EBE2D8]">
              <h3 className="font-serif font-bold text-lg text-[#2C1D15] flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-purple-700" />
                State 5: Delivery Receipt Confirmation
              </h3>
              <p className="text-xs text-[#5C4033] mt-0.5">
                Inspect your parcel. Both participants must independently inspect and confirm receipt before the exchange is completed.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              
              {/* Member A Receipt */}
              <div className="p-4 rounded-xl border border-[#DDD1BF] bg-[#FAF8F5]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#5C4033]">Your Inspection & Confirmation</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    exchange.partyA?.confirmedReceipt
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {exchange.partyA?.confirmedReceipt ? 'Confirmed Receipt' : 'Awaiting Your Confirmation'}
                  </span>
                </div>
                <p className="text-xs text-[#5C4033] mb-3">
                  Inspect the parcel containing <strong>{exchange.itemB?.title}</strong> from {exchange.partyB?.city || 'Yangon'}.
                </p>

                {!exchange.partyA?.confirmedReceipt ? (
                  <button
                    onClick={handleConfirmIntercityReceipt}
                    className="w-full py-2 px-3 text-xs font-bold rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 transition-colors shadow-xs"
                  >
                    Confirm I Received Item & Condition Matches
                  </button>
                ) : (
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>You confirmed parcel delivery.</span>
                  </div>
                )}
              </div>

              {/* Member B Receipt */}
              <div className="p-4 rounded-xl border border-[#DDD1BF] bg-[#FAF8F5]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#5C4033]">Partner's Confirmation ({exchange.partyB?.name || 'Kyaw Zin Htet'})</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    exchange.partyB?.confirmedReceipt
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {exchange.partyB?.confirmedReceipt ? 'Confirmed Receipt' : 'Awaiting Partner'}
                  </span>
                </div>
                <p className="text-xs text-[#5C4033] mb-3">
                  Partner inspecting parcel containing <strong>{exchange.itemA?.title}</strong> dispatched from {exchange.partyA?.city || 'Mandalay'}.
                </p>

                {exchange.partyB?.confirmedReceipt ? (
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Partner confirmed parcel delivery.</span>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Awaiting partner to confirm arrival in Yangon.</span>
                  </div>
                )}
              </div>

            </div>

            {bothReceiptsConfirmed && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  ✓ Both participants verified and confirmed delivery receipt! Exchange is officially completed. Proceed below to <strong>State 6</strong> to enter your payout number for your Escrow Deposit Refund.
                </span>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* STATE 6: DEPOSIT REFUND REQUEST & PAYOUT                */}
        {/* (User enters their wallet / phone number to get refund)  */}
        {/* ======================================================== */}
        {isIntercity && bothReceiptsConfirmed && (
          <div className="bg-white rounded-2xl border border-[#DDD1BF] p-5 sm:p-6 mb-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-[#EBE2D8] gap-2">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#2C1D15] flex items-center gap-2">
                  <Coins className="w-5 h-5 text-amber-700" />
                  State 6: Escrow Deposit Refund & Payout
                </h3>
                <p className="text-xs text-[#5C4033] mt-0.5">
                  Both participants have confirmed receipt with zero disputes. Please enter your mobile wallet or bank number to receive your full 100% deposit refund.
                </p>
              </div>

              {myRefund.status === 'Processing Payout' && (
                <button
                  onClick={handleSimulateCompleteRefund}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  ⚡ Test: Admin Process & Release Refund
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Left Column: Your Refund Payout Request */}
              <div className="p-4 rounded-xl border border-[#DDD1BF] bg-[#FAF8F5]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#5C4033]">
                    Your Deposit Refund ({(myDeposit.amount || 100000).toLocaleString()} MMK)
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    myRefund.status === 'Completed'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : myRefund.status === 'Processing Payout'
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {myRefund.status === 'Completed' ? 'Refund Released' : myRefund.status === 'Processing Payout' ? 'Processing Payout' : 'Enter Payout Number'}
                  </span>
                </div>

                {myRefund.status !== 'Completed' && myRefund.status !== 'Processing Payout' ? (
                  /* Form to enter payout number */
                  <form onSubmit={handleSubmitRefund} className="space-y-3">
                    <p className="text-xs text-[#5C4033] leading-relaxed">
                      Enter the mobile wallet or account number where you wish to receive your <strong>{(myDeposit.amount || 100000).toLocaleString()} MMK</strong> security deposit:
                    </p>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#2C1D15] mb-1">
                        Select Payout Wallet / Bank:
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {['KBZPay', 'WavePay', 'AYA Pay'].map(w => (
                          <button
                            key={w}
                            type="button"
                            onClick={() => setRefundWalletType(w)}
                            className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-colors ${
                              refundWalletType === w
                                ? 'bg-[#5C4033] text-white border-[#5C4033]'
                                : 'bg-white text-[#2C1D15] border-[#DDD1BF] hover:bg-[#FAF8F5]'
                            }`}
                          >
                            {w}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#2C1D15] mb-1">
                        {refundWalletType} Phone / Account Number <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 09798123456"
                        value={refundAccountNumber}
                        onChange={(e) => setRefundAccountNumber(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-[#DDD1BF] rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#5C4033] font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#2C1D15] mb-1">
                        Account Holder Name <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Thant Zin"
                        value={refundAccountName}
                        onChange={(e) => setRefundAccountName(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-[#DDD1BF] rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#5C4033]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingRefund}
                      className="w-full py-2.5 px-4 text-xs font-bold rounded-lg bg-[#5C4033] text-white hover:bg-[#2C1D15] transition-colors shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <Coins className="w-4 h-4" />
                      <span>{submittingRefund ? 'Submitting...' : `Request Refund Payout (${(myDeposit.amount || 100000).toLocaleString()} MMK)`}</span>
                    </button>
                  </form>
                ) : myRefund.status === 'Processing Payout' ? (
                  /* Processing State */
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 leading-relaxed">
                      <div className="font-bold flex items-center gap-1.5 mb-1">
                        <Clock className="w-4 h-4 text-blue-600" />
                        Payout Transfer Scheduled
                      </div>
                      Your request has been queued for automated escrow payout. Funds will transfer within 2–4 hours.
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-[#EBE2D8] text-xs space-y-1">
                      <div className="text-[11px] text-[#8C7A6B]">Destination Account:</div>
                      <div className="font-mono font-bold text-[#2C1D15]">
                        {myRefund.walletType || refundWalletType}: {myRefund.accountNumber || refundAccountNumber}
                      </div>
                      <div className="text-[11px] text-[#5C4033]">
                        Account Holder: <strong>{myRefund.accountName || refundAccountName}</strong>
                      </div>
                      <div className="text-[11px] text-[#5C4033]">
                        Refund Amount: <strong>{(myDeposit.amount || 100000).toLocaleString()} MMK</strong>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Completed State */
                  <div className="space-y-3">
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 leading-relaxed">
                      <div className="font-bold flex items-center gap-1.5 mb-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Refund Payout Completed
                      </div>
                      Full escrow deposit has been transferred to your wallet account.
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-[#EBE2D8] text-xs space-y-1">
                      <div className="text-[11px] text-[#8C7A6B]">Transaction Reference:</div>
                      <div className="font-mono font-bold text-emerald-800">
                        {myRefund.transactionRef || 'REF-492104'}
                      </div>
                      <div className="text-[11px] text-[#5C4033]">
                        Transferred to: <strong>{myRefund.walletType || refundWalletType} ({myRefund.accountNumber || refundAccountNumber})</strong>
                      </div>
                      <div className="text-[11px] text-[#5C4033]">
                        Amount: <strong>{(myDeposit.amount || 100000).toLocaleString()} MMK (100% Refunded)</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Other Member's Refund Status */}
              <div className="p-4 rounded-xl border border-[#DDD1BF] bg-[#FAF8F5]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#5C4033]">
                    Partner Refund ({exchange.partyB?.name || 'Kyaw Zin Htet'})
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    otherRefund.status === 'Completed'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-blue-100 text-blue-800 border border-blue-300'
                  }`}>
                    {otherRefund.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-white rounded-lg border border-[#EBE2D8] space-y-1">
                    <div className="text-[11px] text-[#8C7A6B]">Partner Payout Wallet:</div>
                    <div className="font-mono font-bold text-[#2C1D15]">
                      {otherRefund.walletType || 'WavePay'}: {otherRefund.accountNumber || '09450987654'}
                    </div>
                    <div className="text-[11px] text-[#5C4033]">
                      Account Holder: <strong>{otherRefund.accountName || 'Kyaw Zin Htet'}</strong>
                    </div>
                    <div className="text-[11px] text-[#5C4033]">
                      Refund Amount: <strong>{(otherDeposit.amount || 100000).toLocaleString()} MMK</strong>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Both members' escrow deposits are handled independently and refunded 100%.</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* LOCAL MEETUP VIEW (Same City)                            */}
        {/* ======================================================== */}
        {!isIntercity && (
          <div className="bg-white rounded-2xl border border-[#DDD1BF] p-5 sm:p-6 mb-6 shadow-xs">
            <h3 className="font-serif font-bold text-lg text-[#2C1D15] mb-2 flex items-center gap-2">
              <Box className="w-5 h-5 text-[#5C4033]" />
              Same-City In-Person Handover
            </h3>
            <p className="text-xs text-[#5C4033] mb-4">
              Local meetup exchanges do not require deposit payments or courier tracking. Coordinate a safe, well-lit public spot in your city to inspect items directly.
            </p>

            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#DDD1BF] mb-4">
              <div className="text-xs text-[#2C1D15] mb-2">
                Location: <strong>{exchange.meetupLocation || 'Convenient public location in city'}</strong>
              </div>
              <div className="text-xs text-[#8C7A6B]">
                Timeline: Initiated {exchange.initiatedDate}
              </div>
            </div>

            {!exchange.isCompleted ? (
              <button
                onClick={() => completeExchange(exchange.id, 'Handover completed in person.')}
                className="w-full py-2.5 px-4 text-xs font-bold rounded-lg bg-[#5C4033] text-white hover:bg-[#2C1D15] transition-colors shadow-xs"
              >
                Mark In-Person Exchange Completed (1-Click)
              </button>
            ) : (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-semibold text-center">
                ✓ Exchange Successfully Completed!
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* COMPARED ITEMS PREVIEW                                   */}
        {/* ======================================================== */}
        <div className="bg-white rounded-2xl border border-[#DDD1BF] p-5 sm:p-6 mb-6 shadow-xs">
          <h3 className="font-serif font-bold text-base text-[#2C1D15] mb-4">
            Items Involved in this Exchange
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Item A */}
            <div className="p-3.5 rounded-xl border border-[#EBE2D8] flex items-center gap-3">
              <img
                src={exchange.itemA?.image}
                alt={exchange.itemA?.title}
                className="w-16 h-16 rounded-lg object-cover border border-[#DDD1BF]"
              />
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A6B]">You Provide:</span>
                <div className="font-semibold text-xs text-[#2C1D15] truncate">{exchange.itemA?.title}</div>
                <div className="text-[11px] text-[#5C4033]">{exchange.itemA?.ownerCity || 'Mandalay'}</div>
              </div>
            </div>

            {/* Item B */}
            <div className="p-3.5 rounded-xl border border-[#EBE2D8] flex items-center gap-3">
              <img
                src={exchange.itemB?.image}
                alt={exchange.itemB?.title}
                className="w-16 h-16 rounded-lg object-cover border border-[#DDD1BF]"
              />
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A6B]">You Receive:</span>
                <div className="font-semibold text-xs text-[#2C1D15] truncate">{exchange.itemB?.title}</div>
                <div className="text-[11px] text-[#5C4033]">{exchange.itemB?.ownerCity || 'Yangon'}</div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* MODAL 1: PAY DEPOSIT MODAL (State 2)                     */}
      {/* ======================================================== */}
      {showPayDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-[#DDD1BF] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-[#EBE2D8] flex items-center justify-between bg-[#F9F6F0]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <h4 className="font-serif font-bold text-sm text-[#2C1D15]">
                  Pay Escrow Deposit: {(myDeposit.amount || 100000).toLocaleString()} MMK
                </h4>
              </div>
              <button
                onClick={() => setShowPayDepositModal(false)}
                className="text-[#8C7A6B] hover:text-[#2C1D15]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePayDepositSubmit} className="p-5 space-y-4">
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EBE2D8] text-xs text-[#5C4033] leading-relaxed">
                Deposit amount is determined by your offered item's category (<strong>{myDeposit.category}</strong>). Your funds are held securely in platform escrow and refunded 100% after dual delivery confirmation.
              </div>

              {/* Payment Method Select */}
              <div>
                <label className="block text-xs font-semibold text-[#2C1D15] mb-1.5">
                  Select Payment Method:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['KBZPay', 'WavePay', 'AYA Pay'].map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setSelectedPaymentMethod(method)}
                      className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                        selectedPaymentMethod === method
                          ? 'bg-[#5C4033] text-white border-[#5C4033] shadow-xs'
                          : 'bg-white text-[#2C1D15] border-[#DDD1BF] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Official Account Payee Details */}
              <div className="p-3 rounded-xl bg-white border border-[#DDD1BF] text-xs space-y-1">
                <div className="text-[11px] text-[#8C7A6B]">Transfer to Official ReCirculate Escrow Account:</div>
                <div className="font-mono font-bold text-[#2C1D15] text-sm">
                  {selectedPaymentMethod === 'KBZPay' ? '09798123456 (ReCirculate Escrow MDY)' : selectedPaymentMethod === 'WavePay' ? '09798123456 (ReCirculate Escrow)' : '2001-9876-1234 (AYA Pay)'}
                </div>
                <div className="text-[10px] text-[#8C7A6B]">
                  Exact Amount: <strong>{(myDeposit.amount || 100000).toLocaleString()} MMK</strong>
                </div>
              </div>

              {/* Reference Number */}
              <div>
                <label className="block text-xs font-semibold text-[#2C1D15] mb-1">
                  Transaction Reference Number / Last 6 Digits <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. KBZ-982144 or 491204"
                  value={paymentRefNumber}
                  onChange={(e) => setPaymentRefNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#DDD1BF] rounded-lg bg-[#FAF8F5] focus:outline-none focus:ring-1 focus:ring-[#5C4033]"
                />
              </div>

              {/* Screenshot Upload */}
              <div>
                <label className="block text-xs font-semibold text-[#2C1D15] mb-1">
                  Payment Slip Screenshot <span className="text-[#8C7A6B] font-normal">(Optional)</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setPaymentSlipImage(reader.result);
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full text-xs text-[#5C4033] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#DDD1BF]/60 file:text-[#2C1D15] hover:file:bg-[#DDD1BF]"
                />

                {paymentSlipImage ? (
                  <div className="mt-2 relative inline-block">
                    <img src={paymentSlipImage} alt="Payment Slip" className="h-20 rounded border border-[#DDD1BF] object-contain" />
                    <button
                      type="button"
                      onClick={() => setPaymentSlipImage('')}
                      className="absolute -top-2 -right-2 bg-rose-600 text-white rounded-full p-0.5 text-xs"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPaymentSlipImage('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&q=80')}
                    className="text-[11px] text-[#5C4033] hover:underline mt-1 block"
                  >
                    + Insert sample deposit receipt for testing
                  </button>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EBE2D8]">
                <button
                  type="button"
                  onClick={() => setShowPayDepositModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-[#DDD1BF] text-[#5C4033] hover:bg-[#FAF8F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDeposit}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-[#5C4033] text-white hover:bg-[#2C1D15] transition-colors"
                >
                  {submittingDeposit ? 'Submitting...' : 'Submit Deposit Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: COURIER DISPATCH & WAYBILL (State 4)            */}
      {/* ======================================================== */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-[#DDD1BF] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-[#EBE2D8] flex items-center justify-between bg-[#F9F6F0]">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-700" />
                <h4 className="font-serif font-bold text-sm text-[#2C1D15]">
                  Submit Courier Dispatch Information
                </h4>
              </div>
              <button
                onClick={() => setShowDispatchModal(false)}
                className="text-[#8C7A6B] hover:text-[#2C1D15]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDispatch} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#2C1D15] mb-1">
                  Courier Company Name <span className="text-rose-600">*</span>
                </label>
                <select
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#DDD1BF] rounded-lg bg-[#FAF8F5] focus:outline-none focus:ring-1 focus:ring-[#5C4033]"
                >
                  <option value="Royal Express">Royal Express</option>
                  <option value="Elite Cargo Express">Elite Cargo Express</option>
                  <option value="Aung Express">Aung Express</option>
                  <option value="KMD Express">KMD Express</option>
                  <option value="Myanmar Speed Post">Myanmar Speed Post</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2C1D15] mb-1">
                  Tracking Number / Waybill ID <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. RX-9014-MDY"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#DDD1BF] rounded-lg bg-[#FAF8F5] focus:outline-none focus:ring-1 focus:ring-[#5C4033] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2C1D15] mb-1">
                  Shipping Date
                </label>
                <input
                  type="date"
                  value={shippingDate}
                  onChange={(e) => setShippingDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#DDD1BF] rounded-lg bg-[#FAF8F5] focus:outline-none focus:ring-1 focus:ring-[#5C4033]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2C1D15] mb-1">
                  Courier Waybill Slip / Receipt <span className="text-[#8C7A6B] font-normal">(Optional)</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setReceiptImage(reader.result);
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full text-xs text-[#5C4033] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#DDD1BF]/60 file:text-[#2C1D15] hover:file:bg-[#DDD1BF]"
                />

                {receiptImage ? (
                  <div className="mt-2 relative inline-block">
                    <img src={receiptImage} alt="Receipt Slip" className="h-20 rounded border border-[#DDD1BF] object-contain" />
                    <button
                      type="button"
                      onClick={() => setReceiptImage('')}
                      className="absolute -top-2 -right-2 bg-rose-600 text-white rounded-full p-0.5 text-xs"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setReceiptImage('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&q=80')}
                    className="text-[11px] text-[#5C4033] hover:underline mt-1 block"
                  >
                    + Insert sample waybill receipt photo
                  </button>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EBE2D8]">
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-[#DDD1BF] text-[#5C4033] hover:bg-[#FAF8F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-[#5C4033] text-white hover:bg-[#2C1D15] transition-colors"
                >
                  Save Dispatch & Waybill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: REPORT DISPUTE MODAL                            */}
      {/* ======================================================== */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-rose-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-rose-100 flex items-center justify-between bg-rose-50">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <h4 className="font-serif font-bold text-sm text-rose-900">
                  Report Problem or Dispute
                </h4>
              </div>
              <button
                onClick={() => setShowDisputeModal(false)}
                className="text-rose-400 hover:text-rose-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFileDispute} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#2C1D15] mb-1">
                  Category of Incident
                </label>
                <select
                  value={disputeCategory}
                  onChange={(e) => setDisputeCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#DDD1BF] rounded-lg bg-[#FAF8F5] focus:outline-none focus:ring-1 focus:ring-rose-500"
                >
                  <option value="Misleading Item Condition">Misleading Item Condition / Hidden Defects</option>
                  <option value="Damaged in Courier Transit">Damaged during Courier Transit</option>
                  <option value="Wrong Item Dispatched">Wrong Item / Missing Accessories</option>
                  <option value="Handover No-Show">Member Did Not Dispatch Item</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2C1D15] mb-1">
                  Incident Explanation & Inspection Findings <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="Detail what happened upon unboxing the parcel..."
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#DDD1BF] rounded-lg bg-[#FAF8F5] focus:outline-none focus:ring-1 focus:ring-rose-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2C1D15] mb-1">
                  Supporting Photo Evidence <span className="text-[#8C7A6B] font-normal">(Optional)</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setDisputeImage(reader.result);
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full text-xs text-[#5C4033] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#DDD1BF]/60 file:text-[#2C1D15]"
                />

                {disputeImage && (
                  <div className="mt-2 relative inline-block">
                    <img src={disputeImage} alt="Dispute Evidence" className="h-20 rounded border border-rose-200 object-contain" />
                    <button
                      type="button"
                      onClick={() => setDisputeImage('')}
                      className="absolute -top-2 -right-2 bg-rose-600 text-white rounded-full p-0.5 text-xs"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EBE2D8]">
                <button
                  type="button"
                  onClick={() => setShowDisputeModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-[#DDD1BF] text-[#5C4033] hover:bg-[#FAF8F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-rose-700 text-white hover:bg-rose-800 transition-colors"
                >
                  Submit Formal Dispute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: LIGHTBOX IMAGE PREVIEW                           */}
      {/* ======================================================== */}
      {previewImageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs"
          onClick={() => setPreviewImageModal(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh] w-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreviewImageModal(null)}
              className="absolute -top-10 right-0 text-white hover:text-[#DDD1BF] p-1.5 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={previewImageModal}
              alt="Enlarged Preview"
              className="max-h-[80vh] max-w-full rounded-xl shadow-2xl object-contain"
            />
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: MEMBER PROFILE MODAL                            */}
      {/* ======================================================== */}
      <MemberProfileModal
        show={showPartnerProfile}
        onClose={() => setShowPartnerProfile(false)}
        member={exchange.partyB}
        isIntercity={isIntercity}
      />

    </div>
  );
}
