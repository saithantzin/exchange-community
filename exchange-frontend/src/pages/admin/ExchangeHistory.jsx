import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  History,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Truck,
  Users,
  Eye,
  FileSpreadsheet
} from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import { ADMIN_EXCHANGES } from '../../data/adminMockData';

export default function ExchangeHistory() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Completed & closed records
  const historicalExchanges = ADMIN_EXCHANGES.filter((e) =>
    e.status === 'Completed' || e.status === 'Resolved' || e.isCompleted || statusFilter !== 'All'
  );

  const filteredData = ADMIN_EXCHANGES.filter((e) => {
    const matchesSearch =
      e.id.toLowerCase().includes(search.toLowerCase()) ||
      e.partyA.name.toLowerCase().includes(search.toLowerCase()) ||
      e.partyB.name.toLowerCase().includes(search.toLowerCase()) ||
      e.partyA.itemTitle.toLowerCase().includes(search.toLowerCase()) ||
      e.partyB.itemTitle.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'All' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      header: 'Exchange Record',
      accessor: 'id',
      render: (e) => (
        <div>
          <Link
            to={`/admin/exchanges/${e.id}`}
            className="font-bold text-xs text-[#5C4033] hover:underline font-mono"
          >
            {e.id}
          </Link>
          <div className="text-[10px] text-[#8C7A6B] mt-0.5">{e.handoverMethod}</div>
        </div>
      )
    },
    {
      header: 'Members',
      accessor: 'partyA',
      render: (e) => (
        <div className="text-xs">
          <div className="font-semibold text-[#2C1D15]">{e.partyA.name} ({e.partyA.city})</div>
          <div className="text-[#5C4033] font-medium">⇄ {e.partyB.name} ({e.partyB.city})</div>
        </div>
      )
    },
    {
      header: 'Exchanged Items',
      accessor: 'partyA.itemTitle',
      render: (e) => (
        <div className="text-xs space-y-0.5 max-w-xs">
          <div className="truncate text-[#2C1D15]">• {e.partyA.itemTitle}</div>
          <div className="truncate text-[#8C7A6B]">• {e.partyB.itemTitle}</div>
        </div>
      )
    },
    {
      header: 'Final Status',
      accessor: 'status',
      render: (e) => <StatusBadge status={e.status} />
    },
    {
      header: 'Dates',
      accessor: 'initiatedDate',
      render: (e) => (
        <div className="text-xs">
          <div className="text-[#8C7A6B]">Started: {e.initiatedDate}</div>
          {e.completedDate && (
            <div className="text-emerald-800 font-semibold">Done: {e.completedDate}</div>
          )}
        </div>
      )
    },
    {
      header: 'Details',
      accessor: 'id',
      sortable: false,
      render: (e) => (
        <Link
          to={`/admin/exchanges/${e.id}`}
          className="p-1.5 text-[#5C4033] hover:text-[#2C1D15] hover:bg-[#DDD1BF]/40 rounded inline-flex transition-colors"
          title="View Full Archive Details"
        >
          <Eye className="w-4 h-4" />
        </Link>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#2C1D15]">Exchange Transaction History Archive</h2>
          <p className="text-xs text-[#5C4033] mt-0.5">
            Audit historical swap records, finalized two-sided confirmations, and resolved transaction archives.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 bg-[#DDD1BF]/40 text-[#2C1D15] rounded-lg border border-[#EBE2D8]">
            {filteredData.length} Historic Records
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#EBE2D8] rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7A6B]" />
          <input
            type="text"
            placeholder="Search historic exchanges by ID, member, item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-[#EBE2D8] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#5C4033] bg-[#F9F6F0]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#5C4033] font-medium whitespace-nowrap">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-[#EBE2D8] rounded-lg px-2.5 py-2 bg-[#F9F6F0] text-[#2C1D15] focus:outline-none focus:ring-1 focus:ring-[#5C4033]"
          >
            <option value="All">All Transactions</option>
            <option value="Completed">Completed Only</option>
            <option value="Disputed">Disputed / Resolved</option>
            <option value="Shipping">Shipping</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={filteredData}
        emptyMessage="No historical exchange records found."
        pageSize={8}
      />
    </div>
  );
}
