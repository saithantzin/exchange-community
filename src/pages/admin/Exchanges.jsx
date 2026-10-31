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
  Calendar
} from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import { ADMIN_EXCHANGES } from '../../data/adminMockData';

export default function Exchanges() {
  const [exchanges, setExchanges] = useState(ADMIN_EXCHANGES);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [methodFilter, setMethodFilter] = useState('All');

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

    return matchesSearch && matchesStatus && matchesMethod;
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
              Two-sided confirmation {e.partyA.confirmedReceipt && e.partyB.confirmedReceipt ? '✓ 2/2' : (e.partyA.confirmedReceipt || e.partyB.confirmedReceipt ? '⏳ 1/2' : '0/2')}
            </div>
          )}
        </div>
      )
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
            Track multi-city logistics, meetup handshakes, and enforce two-sided completion criteria.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 bg-[#DDD1BF]/40 text-[#2C1D15] rounded-lg border border-[#EBE2D8]">
            {filteredExchanges.length} Total Monitored
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#EBE2D8] rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center gap-3">
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

        <div className="flex items-center gap-3">
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
              <option value="Shipping">Shipping</option>
              <option value="Completed">Completed</option>
              <option value="Disputed">Disputed</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#5C4033] font-medium whitespace-nowrap">Method:</span>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="text-xs border border-[#EBE2D8] rounded-lg px-2.5 py-2 bg-[#F9F6F0] text-[#2C1D15] focus:outline-none focus:ring-1 focus:ring-[#5C4033]"
            >
              <option value="All">All Handover Types</option>
              <option value="Intercity">Intercity Courier</option>
              <option value="InPerson">In-Person Meetup</option>
            </select>
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
