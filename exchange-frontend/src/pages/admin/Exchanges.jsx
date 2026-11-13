import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Truck,
  Users,
  CheckCircle2,
  ArrowRight,
  CreditCard,
  Wallet,
  ShieldCheck
} from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import exchangeService from '../../services/exchangeService';

export default function Exchanges() {
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [methodFilter, setMethodFilter] = useState('All');
  const [escrowFilter, setEscrowFilter] = useState('All');

  React.useEffect(() => {
    let active = true;
    const loadExchanges = async () => {
      try {
        const firstResponse = await exchangeService.getAdminExchanges({ per_page: 100, page: 1 });
        const firstPage = firstResponse?.data;
        if (!firstResponse?.success) {
          throw new Error(firstResponse?.message || 'Could not load exchanges.');
        }

        const rows = Array.isArray(firstPage) ? [...firstPage] : [...(firstPage?.data || [])];
        if (!Array.isArray(firstPage) && !Array.isArray(firstPage?.data)) {
          throw new Error('The server returned an invalid exchange list.');
        }

        const lastPage = Number(firstPage?.last_page) || 1;
        for (let page = 2; page <= lastPage; page += 1) {
          const response = await exchangeService.getAdminExchanges({ per_page: 100, page });
          if (!response?.success || !Array.isArray(response.data?.data)) {
            throw new Error(response?.message || 'Could not load all exchanges.');
          }
          rows.push(...response.data.data);
        }

        if (active) {
          setExchanges(rows);
          setLoadError('');
        }
      } catch (error) {
        console.warn('Could not load admin exchanges:', error?.message);
        if (active) {
          setLoadError(error?.response?.data?.message || error?.message || 'Could not load exchanges.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadExchanges();

    return () => { active = false; };
  }, [reloadToken]);

  const filteredExchanges = exchanges.filter((e) => {
    const matchesSearch =
      String(e.id || '').toLowerCase().includes(search.toLowerCase()) ||
      String(e.partyA?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      String(e.partyB?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      String(e.itemA?.title || '').toLowerCase().includes(search.toLowerCase()) ||
      String(e.itemB?.title || '').toLowerCase().includes(search.toLowerCase());

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

  const depositReviewCount = exchanges.reduce((count, e) => count + (
    e.isIntercity
      ? [e.deposits?.partyA?.status, e.deposits?.partyB?.status]
        .filter((status) => status === 'Payment Submitted').length
      : 0
  ), 0);
  const refundPayoutCount = exchanges.reduce((count, e) => count + (
    e.isIntercity
      ? [e.refundWorkflow?.partyA?.status, e.refundWorkflow?.partyB?.status]
        .filter((status) => status === 'Processing Payout').length
      : 0
  ), 0);

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
      accessor: 'itemA.title',
      sortable: false,
      render: (e) => (
        <div className="text-xs space-y-1 max-w-xs">
          <div className="truncate text-[#2C1D15] font-medium">• {e.itemA?.title || 'Offered item'}</div>
          <div className="truncate text-[#5C4033] font-medium">• {e.itemB?.title || 'Requested item'}</div>
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
          <h2 className="text-lg font-bold text-[#2C1D15]">Escrow Deposits & Refund Payouts</h2>
          <p className="text-xs text-[#5C4033] mt-0.5">
            Review submitted deposit slips and process member refund payouts from one queue.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 bg-[#DDD1BF]/40 text-[#2C1D15] rounded-lg border border-[#EBE2D8]">
            {filteredExchanges.length} Exchanges
          </span>
          {loadError && (
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                setReloadToken((token) => token + 1);
              }}
              className="text-xs font-semibold px-3 py-1.5 bg-white text-[#5C4033] rounded-lg border border-[#EBE2D8] hover:bg-[#F9F6F0]"
            >
              Retry
            </button>
          )}
        </div>
      </div>

      {loadError && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800">
          Could not load the live escrow queue: {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => setEscrowFilter('DepositPending')}
          className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-left hover:bg-amber-100 transition-colors"
        >
          <span className="block text-xs font-semibold text-amber-900">Deposit approvals</span>
          <span className="mt-1 block text-2xl font-bold text-amber-800">{depositReviewCount}</span>
        </button>
        <button
          type="button"
          onClick={() => setEscrowFilter('RefundReady')}
          className="rounded-xl border border-purple-200 bg-purple-50 p-4 text-left hover:bg-purple-100 transition-colors"
        >
          <span className="block text-xs font-semibold text-purple-900">Refund payouts</span>
          <span className="mt-1 block text-2xl font-bold text-purple-800">{refundPayoutCount}</span>
        </button>
        <button
          type="button"
          onClick={() => setEscrowFilter('All')}
          className="rounded-xl border border-[#EBE2D8] bg-white p-4 text-left hover:bg-[#F9F6F0] transition-colors"
        >
          <span className="block text-xs font-semibold text-[#5C4033]">All escrow exchanges</span>
          <span className="mt-1 block text-2xl font-bold text-[#2C1D15]">{exchanges.length}</span>
        </button>
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
                <option value="Pending">Pending</option>
                <option value="Accepted">Accepted</option>
                <option value="Deposit Payment">Deposit Payment</option>
                <option value="Deposit Review">Deposit Review</option>
                <option value="Deposits Verified">Deposits Verified</option>
                <option value="Arrangement Confirmed">Arrangement Confirmed</option>
                <option value="Shipping">Shipping</option>
                <option value="In Transit">In Transit</option>
                <option value="Partially Received">Partially Received</option>
                <option value="Completed">Completed</option>
                <option value="Disputed">Disputed</option>
                <option value="Rejected">Rejected</option>
                <option value="Cancelled">Cancelled</option>
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
        searchable={false}
        loading={loading}
        loadingMessage="Loading live escrow and refund requests..."
        emptyMessage={loadError || 'No exchange transactions match the selected filters.'}
        pageSize={8}
      />
    </div>
  );
}
