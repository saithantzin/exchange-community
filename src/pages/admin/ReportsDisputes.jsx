import React, { useState } from 'react';
import {
  AlertTriangle,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  ShieldAlert,
  UserX,
  Ban,
  FileText,
  Calendar,
  X,
  ChevronRight
} from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import ConfirmModal from '../../components/admin/ConfirmModal';
import { ADMIN_REPORTS } from '../../data/adminMockData';

export default function ReportsDisputes() {
  const [reports, setReports] = useState(ADMIN_REPORTS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // Investigation Drawer
  const [selectedReport, setSelectedReport] = useState(null);
  const [newNote, setNewNote] = useState('');

  // Status Action Modal
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    report: null,
    targetStatus: 'Resolved', // 'Resolved' | 'Rejected' | 'Under Review'
    actionType: 'none' // 'none' | 'suspend' | 'deactivate'
  });

  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.reportedItemTitle.toLowerCase().includes(search.toLowerCase()) ||
      r.reporter.name.toLowerCase().includes(search.toLowerCase()) ||
      r.reportedUser.name.toLowerCase().includes(search.toLowerCase()) ||
      r.type.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    const matchesType = typeFilter === 'All' || r.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleOpenActionModal = (report, targetStatus, actionType = 'none') => {
    setActionModal({
      isOpen: true,
      report,
      targetStatus,
      actionType
    });
  };

  const handleConfirmAction = () => {
    if (!actionModal.report) return;

    const actionText =
      actionModal.actionType === 'suspend'
        ? `Status set to ${actionModal.targetStatus}. Suspended member ${actionModal.report.reportedUser.name}.`
        : actionModal.actionType === 'deactivate'
        ? `Status set to ${actionModal.targetStatus}. Deactivated item "${actionModal.report.reportedItemTitle}".`
        : `Status updated to ${actionModal.targetStatus}.`;

    const updatedActionHistory = [
      ...(actionModal.report.actionHistory || []),
      {
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        action: actionText,
        by: 'Kyaw Swar Hein (Admin)'
      }
    ];

    setReports((prev) =>
      prev.map((r) =>
        r.id === actionModal.report.id
          ? {
              ...r,
              status: actionModal.targetStatus,
              actionHistory: updatedActionHistory
            }
          : r
      )
    );

    if (selectedReport && selectedReport.id === actionModal.report.id) {
      setSelectedReport((prev) => ({
        ...prev,
        status: actionModal.targetStatus,
        actionHistory: updatedActionHistory
      }));
    }

    setActionModal({ isOpen: false, report: null, targetStatus: 'Resolved', actionType: 'none' });
  };

  const handleAddNote = () => {
    if (!newNote.trim() || !selectedReport) return;
    const updatedNote = selectedReport.adminNotes
      ? `${selectedReport.adminNotes} | Note: ${newNote}`
      : newNote;

    setReports((prev) =>
      prev.map((r) => (r.id === selectedReport.id ? { ...r, adminNotes: updatedNote } : r))
    );

    setSelectedReport((prev) => ({ ...prev, adminNotes: updatedNote }));
    setNewNote('');
  };

  const columns = [
    {
      header: 'Case ID & Type',
      accessor: 'id',
      render: (r) => (
        <div>
          <div
            className="font-bold text-xs text-[#5C4033] hover:underline cursor-pointer font-mono"
            onClick={() => setSelectedReport(r)}
          >
            {r.id}
          </div>
          <div className="text-[11px] font-semibold text-[#2C1D15] mt-0.5">{r.type}</div>
        </div>
      )
    },
    {
      header: 'Parties Involved',
      accessor: 'reporter',
      render: (r) => (
        <div className="text-xs space-y-0.5">
          <div>
            <span className="text-[#8C7A6B]">Reporter:</span>{' '}
            <strong className="text-[#2C1D15]">{r.reporter.name}</strong>
          </div>
          <div>
            <span className="text-[#8C7A6B]">Reported:</span>{' '}
            <strong className="text-rose-700">{r.reportedUser.name}</strong>
          </div>
        </div>
      )
    },
    {
      header: 'Item / Exchange',
      accessor: 'reportedItemTitle',
      render: (r) => (
        <div className="text-xs max-w-xs">
          <div className="font-semibold text-[#2C1D15] truncate">{r.reportedItemTitle}</div>
          <div className="text-[11px] text-[#8C7A6B] font-mono">{r.exchangeId}</div>
        </div>
      )
    },
    {
      header: 'Case Status',
      accessor: 'status',
      render: (r) => <StatusBadge status={r.status} />
    },
    {
      header: 'Filed Date',
      accessor: 'date',
      render: (r) => <span className="text-xs text-[#5C4033]">{r.date}</span>
    },
    {
      header: 'Actions',
      accessor: 'id',
      sortable: false,
      render: (r) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSelectedReport(r)}
            className="p-1.5 text-[#5C4033] hover:text-[#2C1D15] hover:bg-[#DDD1BF]/40 rounded transition-colors"
            title="Investigate Case"
          >
            <Eye className="w-4 h-4" />
          </button>
          {r.status === 'Open' && (
            <button
              onClick={() => handleOpenActionModal(r, 'Under Review')}
              className="p-1.5 text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded transition-colors"
              title="Mark Under Review"
            >
              <Clock className="w-4 h-4" />
            </button>
          )}
          {r.status !== 'Resolved' && (
            <button
              onClick={() => handleOpenActionModal(r, 'Resolved')}
              className="p-1.5 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded transition-colors"
              title="Resolve Dispute"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#2C1D15]">Reports & Dispute Moderation</h2>
          <p className="text-xs text-[#5C4033] mt-0.5">
            Investigate member complaints, inspect photographic evidence, resolve disputes, and apply sanctions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 bg-[#DDD1BF]/40 text-[#2C1D15] rounded-lg border border-[#EBE2D8]">
            {filteredReports.length} Cases Displayed
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#EBE2D8] rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7A6B]" />
          <input
            type="text"
            placeholder="Search reports by ID, item name or member..."
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
              <option value="Open">Open</option>
              <option value="Under Review">Under Review</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#5C4033] font-medium whitespace-nowrap">Category:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xs border border-[#EBE2D8] rounded-lg px-2.5 py-2 bg-[#F9F6F0] text-[#2C1D15] focus:outline-none focus:ring-1 focus:ring-[#5C4033] max-w-[160px]"
            >
              <option value="All">All Complaint Types</option>
              <option value="Misleading Description">Misleading Description</option>
              <option value="Missing Parcel / Delayed Dispatch">Missing Parcel</option>
              <option value="Damaged Item">Damaged Item</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={filteredReports}
        emptyMessage="No reports match the selected criteria."
        pageSize={8}
      />

      {/* Case Investigation Drawer / Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#EBE2D8] shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-[#EBE2D8] flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2.5">
                <StatusBadge status={selectedReport.status} size="lg" />
                <span className="font-mono font-bold text-sm text-[#2C1D15]">{selectedReport.id}</span>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-1 text-[#8C7A6B] hover:text-[#2C1D15] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Report Headline */}
              <div>
                <h3 className="font-bold text-base text-[#2C1D15]">{selectedReport.type}</h3>
                <p className="text-xs text-[#5C4033] mt-0.5">
                  Associated Exchange: <strong className="font-mono">{selectedReport.exchangeId}</strong> • Filed on {selectedReport.date}
                </p>
              </div>

              {/* Members Involved */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-[#F9F6F0] p-4 rounded-xl border border-[#EBE2D8]">
                <div>
                  <span className="text-[#8C7A6B] block">Reporting Member:</span>
                  <p className="font-semibold text-[#2C1D15] mt-0.5">{selectedReport.reporter.name}</p>
                  <p className="text-[11px] text-[#5C4033]">{selectedReport.reporter.email}</p>
                </div>
                <div>
                  <span className="text-[#8C7A6B] block">Reported Member:</span>
                  <p className="font-semibold text-rose-700 mt-0.5">{selectedReport.reportedUser.name}</p>
                  <p className="text-[11px] text-[#5C4033]">{selectedReport.reportedUser.email}</p>
                </div>
              </div>

              {/* Complaint Statement */}
              <div>
                <h4 className="text-xs font-bold text-[#8C7A6B] uppercase tracking-wider mb-1.5">
                  Member Grievance Statement
                </h4>
                <div className="p-3.5 bg-white rounded-xl border border-[#EBE2D8] text-xs text-[#2C1D15] leading-relaxed">
                  "{selectedReport.description}"
                </div>
              </div>

              {/* Photographic Evidence */}
              {selectedReport.evidenceImages && selectedReport.evidenceImages.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-[#8C7A6B] uppercase tracking-wider mb-2">
                    Photographic Evidence
                  </h4>
                  <div className="flex gap-3">
                    {selectedReport.evidenceImages.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt="Evidence"
                        className="w-24 h-24 rounded-lg object-cover border border-[#EBE2D8]"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Moderator Notes & Action Trail */}
              <div>
                <h4 className="text-xs font-bold text-[#8C7A6B] uppercase tracking-wider mb-1.5">
                  Investigation Audit Notes
                </h4>
                <p className="text-xs text-[#5C4033] bg-[#F9F6F0] p-3 rounded-lg border border-[#EBE2D8]">
                  {selectedReport.adminNotes || 'No notes recorded yet.'}
                </p>

                {/* Add new note inline */}
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Append internal investigation note..."
                    className="flex-1 px-3 py-1.5 text-xs border border-[#EBE2D8] rounded-lg bg-[#F9F6F0] focus:outline-none focus:ring-1 focus:ring-[#5C4033]"
                  />
                  <button
                    onClick={handleAddNote}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#5C4033] text-white hover:bg-[#2C1D15]"
                  >
                    Add Note
                  </button>
                </div>
              </div>

              {/* Moderator Quick Actions */}
              <div className="pt-3 border-t border-[#EBE2D8] space-y-2">
                <span className="text-[11px] font-bold text-[#8C7A6B] uppercase tracking-wider block">
                  Moderator Enforcement Actions
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleOpenActionModal(selectedReport, 'Under Review', 'none')}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
                  >
                    Set Under Review
                  </button>
                  <button
                    onClick={() => handleOpenActionModal(selectedReport, 'Resolved', 'none')}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                  >
                    Mark Resolved
                  </button>
                  <button
                    onClick={() => handleOpenActionModal(selectedReport, 'Under Review', 'suspend')}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100"
                  >
                    Suspend Reported User
                  </button>
                  <button
                    onClick={() => handleOpenActionModal(selectedReport, 'Resolved', 'deactivate')}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200"
                  >
                    Deactivate Item Listing
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#F9F6F0] border-t border-[#EBE2D8] flex justify-end rounded-b-2xl">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-white border border-[#EBE2D8] text-[#2C1D15] hover:bg-[#F9F6F0]"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Action Modal */}
      <ConfirmModal
        isOpen={actionModal.isOpen}
        title={`Apply Moderation Action: ${actionModal.targetStatus}`}
        message={`Are you sure you want to update case ${actionModal.report?.id}? This action will be permanently recorded in the system audit trail.`}
        confirmText="Confirm Action"
        type="warning"
        onConfirm={handleConfirmAction}
        onCancel={() => setActionModal({ isOpen: false, report: null, targetStatus: 'Resolved', actionType: 'none' })}
      />
    </div>
  );
}
