import React, { useState, useEffect } from 'react';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  Package,
  Layers,
  Search,
  CheckCircle,
  X,
  Laptop,
  BookOpen,
  Shirt,
  Coffee,
  Armchair,
  Grid,
  ShieldCheck
} from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import ConfirmModal from '../../components/admin/ConfirmModal';
import { ADMIN_CATEGORIES } from '../../data/adminMockData';
import categoryService from '../../services/categoryService';

export default function Categories() {
  const [categories, setCategories] = useState(ADMIN_CATEGORIES);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch dynamic categories from Laravel API on mount
  useEffect(() => {
    categoryService.getCategories()
      .then((res) => {
        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          const dynamicCats = res.data.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            depositAmount: Number(c.deposit_amount) || 100000,
            itemCount: c.items_count || 0,
            description: c.name + ' items for community swaps',
            icon: c.icon || 'Grid',
            status: c.is_active ? 'Active' : 'Inactive'
          }));
          setCategories(dynamicCats);
        }
      })
      .catch((err) => {
        console.warn('Could not load categories from backend, using fallback:', err?.message);
      });
  }, []);

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: 'Grid',
    status: 'Active'
  });
  const [formErrors, setFormErrors] = useState({});

  // Delete Confirmation Modal state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    category: null
  });

  const getCategoryIcon = (iconName) => {
    switch (iconName) {
      case 'Laptop': return Laptop;
      case 'BookOpen': return BookOpen;
      case 'Shirt': return Shirt;
      case 'Coffee': return Coffee;
      case 'Armchair': return Armchair;
      default: return Grid;
    }
  };

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      depositAmount: 50000,
      description: '',
      icon: 'Grid',
      status: 'Active'
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug || cat.id,
      depositAmount: cat.depositAmount || 50000,
      description: cat.description || '',
      icon: cat.icon || 'Grid',
      status: cat.status || 'Active'
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Category name is required';
    if (!formData.slug.trim()) errors.slug = 'Slug identifier is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingCategory) {
      // Update existing
      try {
        await categoryService.updateCategory(editingCategory.id, {
          name: formData.name,
          deposit_amount: formData.depositAmount,
          icon: formData.icon,
          is_active: formData.status === 'Active'
        });
      } catch (err) {
        console.warn('Backend category update failed, updating locally:', err);
      }

      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id
            ? { ...c, ...formData }
            : c
        )
      );
    } else {
      // Create new
      let newCatId = formData.slug.toLowerCase().replace(/\s+/g, '-');
      try {
        const res = await categoryService.createCategory({
          name: formData.name,
          deposit_amount: formData.depositAmount,
          icon: formData.icon,
          is_active: formData.status === 'Active'
        });
        if (res?.success && res.data) {
          newCatId = res.data.id;
        }
      } catch (err) {
        console.warn('Backend category create failed, saving locally:', err);
      }

      const newCat = {
        id: newCatId,
        ...formData,
        itemCount: 0
      };
      setCategories((prev) => [...prev, newCat]);
    }

    setIsModalOpen(false);
  };

  const handleDeleteClick = (cat) => {
    setDeleteModal({
      isOpen: true,
      category: cat
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.category) return;
    try {
      await categoryService.deleteCategory(deleteModal.category.id);
    } catch (err) {
      console.warn('Backend category delete failed, removing locally:', err);
    }
    setCategories((prev) => prev.filter((c) => c.id !== deleteModal.category.id));
    setDeleteModal({ isOpen: false, category: null });
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      header: 'Category Taxonomy',
      accessor: 'name',
      render: (cat) => {
        const IconComponent = getCategoryIcon(cat.icon);
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#DDD1BF]/40 text-[#5C4033] flex items-center justify-center shrink-0 border border-[#EBE2D8]">
              <IconComponent className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-xs text-[#2C1D15]">{cat.name}</div>
              <div className="text-[11px] text-[#8C7A6B] font-mono">/{cat.slug || cat.id}</div>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Description',
      accessor: 'description',
      render: (cat) => (
        <span className="text-xs text-[#5C4033] line-clamp-1 max-w-sm">
          {cat.description || '—'}
        </span>
      )
    },
    {
      header: 'Catalog Item Count',
      accessor: 'itemCount',
      render: (cat) => (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2C1D15]">
          <Package className="w-3.5 h-3.5 text-[#5C4033]" />
          <span>{cat.itemCount || 0} listings</span>
        </div>
      )
    },
    {
      header: 'Intercity Deposit',
      accessor: 'depositAmount',
      render: (cat) => (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2C1D15]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          <span className="font-mono bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
            {(cat.depositAmount || 50000).toLocaleString()} MMK
          </span>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (cat) => <StatusBadge status={cat.status || 'Active'} />
    },
    {
      header: 'Actions',
      accessor: 'id',
      sortable: false,
      render: (cat) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleOpenEditModal(cat)}
            className="p-1.5 text-[#5C4033] hover:text-[#2C1D15] hover:bg-[#DDD1BF]/40 rounded transition-colors"
            title="Edit Category"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteClick(cat)}
            className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition-colors"
            title="Delete Category"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#2C1D15]">Item Categories & Taxonomy</h2>
          <p className="text-xs text-[#5C4033] mt-0.5">
            Organize catalog groupings, edit classification descriptions, and manage platform taxonomies.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-[#5C4033] text-white hover:bg-[#2C1D15] transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={filteredCategories}
        searchPlaceholder="Search categories by name or description..."
        pageSize={8}
      />

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-[#EBE2D8] shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[#EBE2D8]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#DDD1BF]/40 text-[#5C4033]">
                  <FolderTree className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-[#2C1D15]">
                  {editingCategory ? 'Edit Category' : 'Create New Category'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-[#8C7A6B] hover:text-[#2C1D15] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#2C1D15] mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      name,
                      slug: editingCategory ? prev.slug : name.toLowerCase().replace(/\s+/g, '-')
                    }));
                  }}
                  placeholder="e.g. Traditional Textiles"
                  className="w-full px-3 py-2 text-xs border border-[#EBE2D8] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#5C4033] bg-[#F9F6F0]"
                />
                {formErrors.name && (
                  <p className="text-[11px] text-rose-600 mt-1">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2C1D15] mb-1">
                  URL Slug Identifier *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g. traditional-textiles"
                  className="w-full px-3 py-2 text-xs border border-[#EBE2D8] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#5C4033] bg-[#F9F6F0] font-mono"
                />
                {formErrors.slug && (
                  <p className="text-[11px] text-rose-600 mt-1">{formErrors.slug}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2C1D15] mb-1">
                  Fixed Intercity Escrow Deposit (MMK)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="5000"
                    step="5000"
                    value={formData.depositAmount || 50000}
                    onChange={(e) => setFormData({ ...formData, depositAmount: Number(e.target.value) })}
                    placeholder="e.g. 100000"
                    className="w-full px-3 py-2 text-xs border border-[#EBE2D8] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#5C4033] bg-[#F9F6F0] font-mono"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#8C7A6B] font-semibold">
                    MMK
                  </span>
                </div>
                <p className="text-[10px] text-[#8C7A6B] mt-1">
                  Required deposit when a member offers an item in this category for an intercity exchange. Refunded 100% after dual-sided delivery confirmation.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2C1D15] mb-1">
                  Description
                </label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief summary of items classified under this category..."
                  className="w-full px-3 py-2 text-xs border border-[#EBE2D8] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#5C4033] bg-[#F9F6F0]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#2C1D15] mb-1">
                    Icon Theme
                  </label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-2.5 py-2 text-xs border border-[#EBE2D8] rounded-lg bg-[#F9F6F0] text-[#2C1D15] focus:outline-none focus:ring-1 focus:ring-[#5C4033]"
                  >
                    <option value="Laptop">Laptop / Gadgets</option>
                    <option value="BookOpen">Books & Reads</option>
                    <option value="Shirt">Clothing & Fashion</option>
                    <option value="Coffee">Household & Decor</option>
                    <option value="Armchair">Furniture</option>
                    <option value="Grid">Generic / Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2C1D15] mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-2.5 py-2 text-xs border border-[#EBE2D8] rounded-lg bg-[#F9F6F0] text-[#2C1D15] focus:outline-none focus:ring-1 focus:ring-[#5C4033]"
                  >
                    <option value="Active">Active</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#EBE2D8]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-[#EBE2D8] text-[#5C4033] hover:bg-[#F9F6F0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#5C4033] text-white hover:bg-[#2C1D15] transition-colors"
                >
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Category"
        message={`Are you sure you want to remove the category "${deleteModal.category?.name}"? Items currently assigned to this category will need to be re-classified.`}
        confirmText="Confirm Delete"
        type="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, category: null })}
      />
    </div>
  );
}
