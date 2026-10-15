import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Eye,
  ShieldAlert,
  ShieldCheck,
  UserX,
  UserCheck,
  MapPin,
  Calendar,
  Mail,
  Phone,
  Star,
  Package,
  Repeat,
  AlertTriangle,
  X
} from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import ConfirmModal from '../../components/admin/ConfirmModal';
import { ADMIN_MEMBERS } from '../../data/adminMockData';
import { MYANMAR_REGIONS } from '../../data/myanmarLocations';

export default function Members() {
  const [members, setMembers] = useState(ADMIN_MEMBERS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [regionFilter, setRegionFilter] = useState('All');

  // Selected Member Details Drawer/Modal
  const [selectedMember, setSelectedMember] = useState(null);

  // Status Change Confirmation Modal
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    member: null,
    action: 'Suspend', // 'Suspend' or 'Reactivate'
    reason: ''
  });

  // Filter members list based on search, status, and region
  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.city.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'All' || m.status === statusFilter;
    const matchesRegion =
      regionFilter === 'All' || m.region === regionFilter || m.city.includes(regionFilter);

    return matchesSearch && matchesStatus && matchesRegion;
  });

  const handleStatusChangeClick = (member, action) => {
    setConfirmModal({
      isOpen: true,
      member,
      action,
      reason: ''
    });
  };

  const handleConfirmStatusChange = () => {
    if (!confirmModal.member) return;
    const newStatus = confirmModal.action === 'Suspend' ? 'Suspended' : 'Active';

    setMembers((prev) =>
      prev.map((m) =>
        m.id === confirmModal.member.id
          ? { ...m, status: newStatus, suspensionReason: confirmModal.reason || undefined }
          : m
      )
    );

    if (selectedMember && selectedMember.id === confirmModal.member.id) {
      setSelectedMember((prev) => ({
        ...prev,
        status: newStatus,
        suspensionReason: confirmModal.reason || undefined
      }));
    }

    setConfirmModal({ isOpen: false, member: null, action: 'Suspend', reason: '' });
  };

  const columns = [
    {
      header: 'Member Profile',
      accessor: 'name',
      render: (m) => (
        <div className="flex items-center gap-3">
          <img
            src={m.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80'}
            alt={m.name}
            className="w-10 h-10 rounded-full object-cover border border-[#EBE2D8]"
          />
          <div>
            <div
              className="font-semibold text-xs text-[#2C1D15] hover:underline cursor-pointer"
              onClick={() => setSelectedMember(m)}
            >
              {m.name}
            </div>
            <div className="text-[11px] text-[#8C7A6B] flex items-center gap-1 mt-0.5">
              <Mail className="w-3 h-3 text-[#5C4033]" />
              {m.email}
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Location (Myanmar)',
      accessor: 'city',
      render: (m) => (
        <div>
          <div className="text-xs font-medium text-[#2C1D15] flex items-center gap-1">
            <MapPin className="w-3 h-3 text-[#5C4033]" />
            {m.city}
          </div>
          <div className="text-[11px] text-[#8C7A6B]">{m.region}</div>
        </div>
      )
    },
    {
      header: 'Account Status',
      accessor: 'status',
      render: (m) => <StatusBadge status={m.status} />
    },
    {
      header: 'Community Stats',
      accessor: 'itemsCount',
      render: (m) => (
        <div className="text-xs space-y-0.5">
          <div className="text-[#2C1D15] font-medium">{m.itemsCount || 0} listings</div>
          <div className="text-[11px] text-[#8C7A6B]">{m.exchangesCount || 0} exchanges</div>
        </div>
      )
    },
    {
      header: 'Joined Date',
      accessor: 'joinedDate',
      render: (m) => <span className="text-xs text-[#5C4033]">{m.joinedDate}</span>
    },
    {
      header: 'Actions',
      accessor: 'id',
      render: (m) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedMember(m)}
            className="p-1.5 text-[#5C4033] hover:text-[#2C1D15] hover:bg-[#DDD1BF]/40 rounded transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          {m.status === 'Active' ? (
            <button
              onClick={() => handleStatusChangeClick(m, 'Suspend')}
              className="p-1.5 text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded transition-colors"
              title="Suspend Member"
            >
              <UserX className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => handleStatusChangeClick(m, 'Reactivate')}
              className="p-1.5 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded transition-colors"
              title="Reactivate Member"
            >
              <UserCheck className="w-4 h-4" />
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
          <h2 className="text-lg font-bold text-[#2C1D15]">Registered Members Directory</h2>
          <p className="text-xs text-[#5C4033] mt-0.5">
            Manage nationwide user accounts, verification, review history and handle moderation actions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 bg-[#DDD1BF]/40 text-[#2C1D15] rounded-lg border border-[#EBE2D8]">
            {filteredMembers.length} Members Listed
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#EBE2D8] rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7A6B]" />
          <input
            type="text"
            placeholder="Search by member name, email or township..."
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
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#5C4033] font-medium whitespace-nowrap">Region:</span>
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="text-xs border border-[#EBE2D8] rounded-lg px-2.5 py-2 bg-[#F9F6F0] text-[#2C1D15] focus:outline-none focus:ring-1 focus:ring-[#5C4033] max-w-[160px]"
            >
              <option value="All">All Myanmar</option>
              {MYANMAR_REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={filteredMembers}
        emptyMessage="No members match the specified filters."
        pageSize={8}
      />

      {/* Detail Modal / Drawer */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#EBE2D8] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-[#EBE2D8] flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <img
                  src={selectedMember.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80'}
                  alt={selectedMember.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#DDD1BF]"
                />
                <div>
                  <h3 className="font-bold text-base text-[#2C1D15]">{selectedMember.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <StatusBadge status={selectedMember.status} />
                    <span className="text-xs text-[#8C7A6B]">Joined {selectedMember.joinedDate}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="p-1.5 text-[#8C7A6B] hover:text-[#2C1D15] hover:bg-[#F9F6F0] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Profile Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F9F6F0] p-4 rounded-xl border border-[#EBE2D8]">
                <div className="text-xs space-y-1">
                  <span className="text-[#8C7A6B] font-medium">Email Address</span>
                  <div className="font-semibold text-[#2C1D15] flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#5C4033]" />
                    {selectedMember.email}
                  </div>
                </div>
                <div className="text-xs space-y-1">
                  <span className="text-[#8C7A6B] font-medium">Phone Number</span>
                  <div className="font-semibold text-[#2C1D15] flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#5C4033]" />
                    {selectedMember.phone || '09798123456'}
                  </div>
                </div>
                <div className="text-xs space-y-1">
                  <span className="text-[#8C7A6B] font-medium">Location</span>
                  <div className="font-semibold text-[#2C1D15] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#5C4033]" />
                    {selectedMember.city}, {selectedMember.region}
                  </div>
                </div>
                <div className="text-xs space-y-1">
                  <span className="text-[#8C7A6B] font-medium">Community Trust Score</span>
                  <div className="font-semibold text-amber-800 flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    {selectedMember.rating || 4.9} / 5.0 (Verified Trader)
                  </div>
                </div>
              </div>

              {/* Bio Statement */}
              {selectedMember.bio && (
                <div>
                  <h4 className="text-xs font-bold text-[#8C7A6B] uppercase tracking-wider mb-1.5">Bio / Exchange Preference</h4>
                  <p className="text-xs text-[#5C4033] bg-white p-3 rounded-lg border border-[#EBE2D8] italic">
                    "{selectedMember.bio}"
                  </p>
                </div>
              )}

              {/* Suspension notice if applicable */}
              {selectedMember.status === 'Suspended' && selectedMember.suspensionReason && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Suspension Notice:</span> {selectedMember.suspensionReason}
                  </div>
                </div>
              )}

              {/* Listings & History tabs summary */}
              <div>
                <h4 className="text-xs font-bold text-[#8C7A6B] uppercase tracking-wider mb-2">Active Listings Overview</h4>
                {selectedMember.items && selectedMember.items.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedMember.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-[#EBE2D8] bg-white">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-12 h-12 rounded object-cover border border-[#EBE2D8]"
                        />
                        <div className="text-xs flex-1 min-w-0">
                          <p className="font-semibold text-[#2C1D15] truncate">{item.title}</p>
                          <p className="text-[11px] text-[#8C7A6B]">{item.category}</p>
                          <span className="inline-block mt-1 text-[10px] font-bold text-[#5C4033]">{item.condition}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#8C7A6B] italic">No active catalog listings found for this member.</p>
                )}
              </div>
            </div>

            <div className="p-4 bg-[#F9F6F0] border-t border-[#EBE2D8] flex items-center justify-between rounded-b-2xl">
              <span className="text-xs text-[#8C7A6B]">
                ID: <span className="font-mono text-[#2C1D15]">MEM-{selectedMember.id}</span>
              </span>
              <div className="flex items-center gap-2">
                {selectedMember.status === 'Active' ? (
                  <button
                    onClick={() => {
                      setSelectedMember(null);
                      handleStatusChangeClick(selectedMember, 'Suspend');
                    }}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
                  >
                    Suspend Account
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedMember(null);
                      handleStatusChangeClick(selectedMember, 'Reactivate');
                    }}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                  >
                    Reactivate Account
                  </button>
                )}
                <button
                  onClick={() => setSelectedMember(null)}
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-white border border-[#EBE2D8] text-[#2C1D15] hover:bg-[#F9F6F0]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Suspension / Reactivation */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.action === 'Suspend' ? 'Suspend Member Account' : 'Reactivate Member Account'}
        message={
          confirmModal.action === 'Suspend'
            ? `Are you sure you want to suspend member "${confirmModal.member?.name}"? They will not be able to propose exchanges or list items until reviewed.`
            : `Are you sure you want to restore full platform privileges for member "${confirmModal.member?.name}"?`
        }
        confirmText={confirmModal.action === 'Suspend' ? 'Confirm Suspension' : 'Reactivate Account'}
        type={confirmModal.action === 'Suspend' ? 'warning' : 'primary'}
        onConfirm={handleConfirmStatusChange}
        onCancel={() => setConfirmModal({ isOpen: false, member: null, action: 'Suspend', reason: '' })}
      />
    </div>
  );
}
