import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Repeat,
  Search,
  Filter,
  Eye,
  Truck,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  MapPin,
  Calendar,
  CreditCard,
  Wallet,
  ShieldCheck
} from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import { ADMIN_EXCHANGES } from '../../data/adminMockData';

export default function Exchanges() {
  const [exchanges, setExchanges] = useState(ADMIN_EXCHANGES);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [methodFilter, setMethodFilter] = useState('All');
  const [escrowFilter, setEscrowFilter] = useState('All');

  const filteredExchanges = exchanges.filter((e) => {
    const matchesSearch =
      e.id.toLowerCase().includes(search.toLowerCase()) ||
      e.partyA.name.toLowerCase().includes(search.toLowerCase()) ||
      e.partyB.name.toLowerCase().includes(search.toLowerCase()) ||
      e.partyA.itemTitle.toLowerCase().includes(search.toLowerCase()) ||
      e.partyB.itemTitle.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'All' || e.status === statusFilter;
    const matchesMethod =
      methodFilter === 'All' ||
      (methodFilter === 'Intercity' && e.isIntercity) ||
      (methodFilter === 'InPerson' && !e.isIntercity);

    let matchesEscrow = true;
    if (escrowFilter === 'DepositPending') {
      matchesEscrow =
        e.isIntercity &&
        (e.deposits?.partyA?.status === 'Payment Submitted' ||
          e.deposits?.partyB?.status === 'Payment Submitted');
    } else if (escrowFilter === 'RefundReady') {
      matchesEscrow =
        e.isIntercity &&
        (e.refundWorkflow?.partyA?.status === 'Processing Payout' ||
          e.refundWorkflow?.partyB?.status === 'Processing Payout');
    } else if (escrowFilter === 'EscrowVerified') {
      matchesEscrow =
        e.isIntercity &&
        e.deposits?.partyA?.status === 'Verified' &&
        e.deposits?.partyB?.status === 'Verified';
    }

    return matchesSearch && matchesStatus && matchesMethod && matchesEscrow;
  });

  const columns = [
    {
      header: 'Exchange ID',
      accessor: 'id',
      render: (e) => (
        <Link
          to={`/admin/exchanges/${e.id}`}
          className="font-bold text-xs text-[#5C4033] hover:text-[#2C1D15] hover:underline flex items-center gap-1 font-mono"
        >
          {e.id}
        </Link>
      )
    },
    {
      header: 'Participating Members',
      accessor: 'partyA',
      render: (e) => (
        <div className="text-xs space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-[#2C1D15]">{e.partyA.name}</span>
            <span className="text-[10px] text-[#8C7A6B]">({e.partyA.city})</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#5C4033]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A6B]">⇄</span>
            <span className="font-semibold text-[#2C1D15]">{e.partyB.name}</span>
            <span className="text-[10px] text-[#8C7A6B]">({e.partyB.city})</span>
          </div>
        </div>
      )
    },
    {
      header: 'Items Traded',
      accessor: 'partyA.itemTitle',
      render: (e) => (
        <div className="text-xs space-y-1 max-w-xs">
          <div className="truncate text-[#2C1D15] font-medium">• {e.partyA.itemTitle}</div>
          <div className="truncate text-[#5C4033] font-medium">• {e.partyB.itemTitle}</div>
        </div>
      )
    },
    {
      header: 'Handover Method',
      accessor: 'handoverMethod',
      render: (e) => (
        <div className="text-xs">
          <div className="flex items-center gap-1.5 font-medium text-[#2C1D15]">
            {e.isIntercity ? (
              <Truck className="w-3.5 h-3.5 text-amber-700" />
            ) : (
              <Users className="w-3.5 h-3.5 text-[#5C4033]" />
            )}
            <span>{e.isIntercity ? 'Intercity Courier' : 'In-Person Meetup'}</span>
          </div>
          {e.isIntercity && (
            <div className="text-[10px] text-[#8C7A6B] mt-0.5">
              Two-sided: {e.partyA.confirmedReceipt && e.partyB.confirmedReceipt ? '✓ 2/2' : (e.partyA.confirmedReceipt || e.partyB.confirmedReceipt ? '⏳ 1/2' : '0/2')}
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Escrow Status',
      accessor: 'isIntercity',
      render: (e) => {
        if (!e.isIntercity) {
          return (
            <span className="text-[11px] font-medium text-[#8C7A6B] bg-stone-100 px-2 py-0.5 rounded-full">
              No Escrow (Meetup)
            </span>
          );
        }

        const hasPendingDeposit =
          e.deposits?.partyA?.status === 'Payment Submitted' ||
          e.deposits?.partyB?.status === 'Payment Submitted';

        const bothVerified =
          e.deposits?.partyA?.status === 'Verified' &&
          e.deposits?.partyB?.status === 'Verified';

        const hasPendingRefund =
          e.refundWorkflow?.partyA?.status === 'Processing Payout' ||
          e.refundWorkflow?.partyB?.status === 'Processing Payout';

        const bothRefunded =
          e.refundWorkflow?.partyA?.status === 'Completed' &&
          e.refundWorkflow?.partyB?.status === 'Completed';

        if (hasPendingDeposit) {
          return (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full animate-pulse">
              <CreditCard className="w-3 h-3 text-amber-700" />
              <span>Slip Review Needed</span>
            </span>
          );
        }

        if (hasPendingRefund) {
          return (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-800 bg-purple-100 border border-purple-200 px-2 py-0.5 rounded-full">
              <Wallet className="w-3 h-3 text-purple-700" />
              <span>Refund Payout Ready</span>
            </span>
          );
        }

        if (bothRefunded) {
          return (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Refunded & Closed</span>
            </span>
          );
        }

        if (bothVerified) {
          return (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-800 bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-full">
              <ShieldCheck className="w-3 h-3 text-blue-600" />
              <span>Escrow Held (Verified)</span>
            </span>
          );
        }

        return (
          <span className="text-[11px] font-medium text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full">
            Awaiting Deposits
          </span>
        );
      }
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (e) => <StatusBadge status={e.status} />
    },
    {
      header: 'Date',
      accessor: 'initiatedDate',
      render: (e) => <span className="text-xs text-[#8C7A6B]">{e.initiatedDate}</span>
    },
    {
      header: 'Actions',
      accessor: 'id',
      sortable: false,
      render: (e) => (
        <Link
          to={`/admin/exchanges/${e.id}`}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#DDD1BF]/40 text-[#5C4033] hover:bg-[#DDD1BF] hover:text-[#2C1D15] transition-colors"
        >
          <span>Inspect</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#2C1D15]">Exchange Transaction Monitoring</h2>
          <p className="text-xs text-[#5C4033] mt-0.5">
            Track multi-city logistics, escrow deposits, receipt confirmations, and payout refunds.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 bg-[#DDD1BF]/40 text-[#2C1D15] rounded-lg border border-[#EBE2D8]">
            {filteredExchanges.length} Total Monitored
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#EBE2D8] rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7A6B]" />
            <input
              type="text"
              placeholder="Search by Exchange ID, member name or item title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs border border-[#EBE2D8] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#5C4033] bg-[#F9F6F0]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#5C4033] font-medium whitespace-nowrap">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs border border-[#EBE2D8] rounded-lg px-2.5 py-2 bg-[#F9F6F0] text-[#2C1D15] focus:outline-none focus:ring-1 focus:ring-[#5C4033]"
              >
                <option value="All">All Statuses</option>
                <option value="Deposit Review">Deposit Review</option>
                <option value="Accepted">Accepted</option>
                <option value="Shipping">Shipping</option>
                <option value="Completed">Completed</option>
                <option value="Disputed">Disputed</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[#5C4033] font-medium whitespace-nowrap">Handover:</span>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="text-xs border border-[#EBE2D8] rounded-lg px-2.5 py-2 bg-[#F9F6F0] text-[#2C1D15] focus:outline-none focus:ring-1 focus:ring-[#5C4033]"
              >
                <option value="All">All Types</option>
                <option value="Intercity">Intercity Courier</option>
                <option value="InPerson">In-Person Meetup</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[#5C4033] font-medium whitespace-nowrap">Escrow Action:</span>
              <select
                value={escrowFilter}
                onChange={(e) => setEscrowFilter(e.target.value)}
                className="text-xs border border-[#EBE2D8] rounded-lg px-2.5 py-2 bg-[#F9F6F0] text-[#2C1D15] focus:outline-none focus:ring-1 focus:ring-[#5C4033]"
              >
                <option value="All">All Escrow States</option>
                <option value="DepositPending">Slip Review Needed</option>
                <option value="EscrowVerified">Escrow Held & Verified</option>
                <option value="RefundReady">Refund Payout Ready</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={filteredExchanges}
        emptyMessage="No exchange transactions match the selected filters."
        pageSize={8}
      />
    </div>
  );
}
