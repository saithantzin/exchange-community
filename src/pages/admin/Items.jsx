import React, { useState } from 'react';
import {
  Package,
  Search,
  Filter,
  Eye,
  Trash2,
  AlertTriangle,
  Ban,
  CheckCircle,
  MapPin,
  Calendar,
  User,
  Tag,
  X
} from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import ConfirmModal from '../../components/admin/ConfirmModal';
import { ADMIN_ITEMS, ADMIN_CATEGORIES } from '../../data/adminMockData';
import { MYANMAR_REGIONS } from '../../data/myanmarLocations';

export default function Items() {
  const [items, setItems] = useState(ADMIN_ITEMS);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [conditionFilter, setConditionFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');

  // Selected Item Modal
  const [selectedItem, setSelectedItem] = useState(null);

  // Moderation / Deactivation Modal
  const [moderationModal, setModerationModal] = useState({
    isOpen: false,
    item: null,
    reason: ''
  });

  // Filter Items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.owner.name.toLowerCase().includes(search.toLowerCase()) ||
      item.city.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === 'All' || item.category.toLowerCase() === categoryFilter.toLowerCase();

    const matchesCondition =
      conditionFilter === 'All' || item.condition.toLowerCase() === conditionFilter.toLowerCase();

    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;

    const matchesLocation =
      locationFilter === 'All' || item.region === locationFilter || item.city.includes(locationFilter);

    return matchesSearch && matchesCategory && matchesCondition && matchesStatus && matchesLocation;
  });

  const handleDeactivateClick = (item) => {
    setModerationModal({
      isOpen: true,
      item,
      reason: ''
    });
  };

  const handleConfirmDeactivation = () => {
    if (!moderationModal.item) return;

    setItems((prev) =>
      prev.map((i) =>
        i.id === moderationModal.item.id
          ? {
              ...i,
              status: 'Deactivated',
              moderationNote: moderationModal.reason || 'Deactivated by administrator for review'
            }
          : i
      )
    );

    if (selectedItem && selectedItem.id === moderationModal.item.id) {
      setSelectedItem((prev) => ({
        ...prev,
        status: 'Deactivated',
        moderationNote: moderationModal.reason || 'Deactivated by administrator for review'
      }));
    }

    setModerationModal({ isOpen: false, item: null, reason: '' });
  };

  const handleReactivateItem = (item) => {
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, status: 'Available', moderationNote: undefined } : i))
    );
    if (selectedItem && selectedItem.id === item.id) {
      setSelectedItem((prev) => ({ ...prev, status: 'Available', moderationNote: undefined }));
    }
  };

  const columns = [
    {
      header: 'Item Listing',
      accessor: 'title',
      render: (item) => (
        <div className="flex items-center gap-3">
          <img
            src={item.image}
            alt={item.title}
            className="w-12 h-12 rounded-lg object-cover border border-[#EBE2D8] shrink-0"
          />
          <div className="min-w-0">
            <div
              className="font-semibold text-xs text-[#2C1D15] hover:underline cursor-pointer truncate max-w-xs"
              onClick={() => setSelectedItem(item)}
            >
              {item.title}
            </div>
            <div className="text-[11px] text-[#8C7A6B] flex items-center gap-1.5 mt-0.5">
              <span>{item.category}</span>
              <span>•</span>
              <span className="font-medium text-[#5C4033]">{item.condition}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Owner',
      accessor: 'owner',
      render: (item) => (
        <div className="text-xs">
          <div className="font-semibold text-[#2C1D15]">{item.owner.name}</div>
          <div className="text-[11px] text-[#8C7A6B]">{item.owner.email}</div>
        </div>
      )
    },
    {
      header: 'Location',
      accessor: 'city',
      render: (item) => (
        <div className="text-xs">
          <div className="font-medium text-[#2C1D15] flex items-center gap-1">
            <MapPin className="w-3 h-3 text-[#5C4033]" />
            {item.city}
          </div>
          <div className="text-[11px] text-[#8C7A6B]">{item.region}</div>
        </div>
      )
    },
    {
      header: 'Listing Status',
      accessor: 'status',
      render: (item) => <StatusBadge status={item.status} />
    },
    {
      header: 'Listed On',
      accessor: 'createdDate',
      render: (item) => <span className="text-xs text-[#5C4033]">{item.createdDate}</span>
    },
    {
      header: 'Actions',
      accessor: 'id',
      sortable: false,
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSelectedItem(item)}
            className="p-1.5 text-[#5C4033] hover:text-[#2C1D15] hover:bg-[#DDD1BF]/40 rounded transition-colors"
            title="Inspect Listing"
          >
            <Eye className="w-4 h-4" />
          </button>
          {item.status !== 'Deactivated' ? (
            <button
              onClick={() => handleDeactivateClick(item)}
              className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition-colors"
              title="Deactivate Listing"
            >
              <Ban className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => handleReactivateItem(item)}
              className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded transition-colors"
              title="Restore Listing"
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
          <h2 className="text-lg font-bold text-[#2C1D15]">Item Listing Moderation</h2>
          <p className="text-xs text-[#5C4033] mt-0.5">
            Audit catalog inventory, verify item conditions, review flagged listings, and manage availability.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 bg-[#DDD1BF]/40 text-[#2C1D15] rounded-lg border border-[#EBE2D8]">
            {filteredItems.length} Listings Filtered
          </span>
        </div>
      </div>

      {/* Search and Multi-filter Bar */}
      <div className="bg-white border border-[#EBE2D8] rounded-xl p-4 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7A6B]" />
          <input
            type="text"
            placeholder="Search items by title, owner name or township..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-[#EBE2D8] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#5C4033] bg-[#F9F6F0]"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-[#EBE2D8]">
          <div>
            <label className="block text-[11px] font-semibold text-[#5C4033] mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full text-xs border border-[#EBE2D8] rounded-lg px-2.5 py-1.5 bg-[#F9F6F0] text-[#2C1D15] focus:outline-none focus:ring-1 focus:ring-[#5C4033]"
            >
              <option value="All">All Categories</option>
              {ADMIN_CATEGORIES.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#5C4033] mb-1">Condition</label>
            <select
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value)}
              className="w-full text-xs border border-[#EBE2D8] rounded-lg px-2.5 py-1.5 bg-[#F9F6F0] text-[#2C1D15] focus:outline-none focus:ring-1 focus:ring-[#5C4033]"
            >
              <option value="All">All Conditions</option>
              <option value="New">New</option>
              <option value="Like New">Like New</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#5C4033] mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs border border-[#EBE2D8] rounded-lg px-2.5 py-1.5 bg-[#F9F6F0] text-[#2C1D15] focus:outline-none focus:ring-1 focus:ring-[#5C4033]"
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="In Exchange">In Exchange</option>
              <option value="Completed">Completed</option>
              <option value="Deactivated">Deactivated</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#5C4033] mb-1">Location</label>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full text-xs border border-[#EBE2D8] rounded-lg px-2.5 py-1.5 bg-[#F9F6F0] text-[#2C1D15] focus:outline-none focus:ring-1 focus:ring-[#5C4033]"
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
        data={filteredItems}
        emptyMessage="No items match your selected filter criteria."
        pageSize={8}
      />

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-[#EBE2D8] shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-[#EBE2D8] flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <StatusBadge status={selectedItem.status} />
                <span className="text-xs text-[#8C7A6B]">Item #{selectedItem.id}</span>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1 text-[#8C7A6B] hover:text-[#2C1D15] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="aspect-video w-full rounded-xl overflow-hidden border border-[#EBE2D8] bg-[#F9F6F0]">
                <img
                  src={selectedItem.image}
                  alt={selectedItem.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h3 className="font-bold text-lg text-[#2C1D15]">{selectedItem.title}</h3>
                <div className="flex items-center gap-3 text-xs text-[#5C4033] mt-1">
                  <span>Category: <strong>{selectedItem.category}</strong></span>
                  <span>•</span>
                  <span>Condition: <strong>{selectedItem.condition}</strong></span>
                  <span>•</span>
                  <span>Views: <strong>{selectedItem.views || 0}</strong></span>
                </div>
              </div>

              {selectedItem.moderationNote && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                  <span className="font-bold">Moderation Action:</span> {selectedItem.moderationNote}
                </div>
              )}

              <div className="bg-[#F9F6F0] p-4 rounded-xl border border-[#EBE2D8] space-y-2">
                <h4 className="text-xs font-bold text-[#8C7A6B] uppercase tracking-wider">Item Description</h4>
                <p className="text-xs text-[#5C4033] leading-relaxed">{selectedItem.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#F9F6F0] rounded-xl border border-[#EBE2D8]">
                  <span className="text-[#8C7A6B] block">Owner Information</span>
                  <p className="font-semibold text-[#2C1D15] mt-0.5">{selectedItem.owner.name}</p>
                  <p className="text-[11px] text-[#5C4033]">{selectedItem.owner.email}</p>
                </div>
                <div className="p-3 bg-[#F9F6F0] rounded-xl border border-[#EBE2D8]">
                  <span className="text-[#8C7A6B] block">Location</span>
                  <p className="font-semibold text-[#2C1D15] mt-0.5">{selectedItem.city}</p>
                  <p className="text-[11px] text-[#5C4033]">{selectedItem.region}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#F9F6F0] border-t border-[#EBE2D8] flex items-center justify-between rounded-b-2xl">
              <span className="text-xs text-[#8C7A6B]">Listed {selectedItem.createdDate}</span>
              <div className="flex items-center gap-2">
                {selectedItem.status !== 'Deactivated' ? (
                  <button
                    onClick={() => {
                      setSelectedItem(null);
                      handleDeactivateClick(selectedItem);
                    }}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                  >
                    Deactivate Listing
                  </button>
                ) : (
                  <button
                    onClick={() => handleReactivateItem(selectedItem)}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                  >
                    Reactivate Listing
                  </button>
                )}
                <button
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-white border border-[#EBE2D8] text-[#2C1D15] hover:bg-[#F9F6F0]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Moderation Reason Modal */}
      <ConfirmModal
        isOpen={moderationModal.isOpen}
        title="Deactivate Inappropriate Listing"
        message={`Are you sure you want to deactivate "${moderationModal.item?.title}"? Please provide a moderation reason for the audit trail.`}
        confirmText="Confirm Deactivation"
        type="danger"
        onConfirm={handleConfirmDeactivation}
        onCancel={() => setModerationModal({ isOpen: false, item: null, reason: '' })}
      >
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#2C1D15]">
            Moderator Action Reason *
          </label>
          <input
            type="text"
            value={moderationModal.reason}
            onChange={(e) => setModerationModal({ ...moderationModal, reason: e.target.value })}
            placeholder="e.g. Misleading description, counterfeit item, or prohibited goods"
            className="w-full px-3 py-2 text-xs border border-[#EBE2D8] rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500 bg-[#F9F6F0]"
          />
        </div>
      </ConfirmModal>
    </div>
  );
}
