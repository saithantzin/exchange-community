import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useExchange } from '../../context/ExchangeContext';

export default function MyItemsPage() {
  const { currentUser } = useAuth();
  const { myItems, deleteItem } = useExchange();
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const filteredItems = myItems.filter(item => {
    if (statusFilter === 'all') return true;
    return (item.status || 'Available').toLowerCase() === statusFilter.toLowerCase();
  });

  const handleDelete = (id) => {
    deleteItem(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="py-5" style={{ backgroundColor: 'var(--bg-warm)', minHeight: '85vh' }}>
      <div className="container-xl">
        
        {/* Header */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom" style={{ borderColor: 'var(--border-light)' }}>
          <div>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-1" style={{ fontSize: '0.8rem' }}>
                <li className="breadcrumb-item"><Link to="/dashboard" className="text-muted text-decoration-none">Dashboard</Link></li>
                <li className="breadcrumb-item active text-dark">My Items</li>
              </ol>
            </nav>
            <h1 className="font-serif fw-bold h3 mb-0 text-dark">My Listed Items</h1>
            <span className="text-muted" style={{ fontSize: '0.84rem' }}>
              Items you have made available for the community in <strong>{currentUser.city}</strong>
            </span>
          </div>

          <Link to="/add-item" className="btn-nordic-primary py-2 px-3 mt-3 mt-md-0" style={{ fontSize: '0.86rem' }}>
            <i className="bi bi-plus-circle"></i> Add New Item
          </Link>
        </div>

        {/* Filter Bar */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="btn-group btn-group-sm">
            <button
              onClick={() => setStatusFilter('all')}
              className={`btn ${statusFilter === 'all' ? 'btn-dark' : 'btn-outline-secondary'}`}
            >
              All Items ({myItems.length})
            </button>
            <button
              onClick={() => setStatusFilter('available')}
              className={`btn ${statusFilter === 'available' ? 'btn-dark' : 'btn-outline-secondary'}`}
            >
              Available
            </button>
            <button
              onClick={() => setStatusFilter('in exchange')}
              className={`btn ${statusFilter === 'in exchange' ? 'btn-dark' : 'btn-outline-secondary'}`}
            >
              In Active Swap
            </button>
          </div>

          <span className="text-muted small">
            Showing {filteredItems.length} items
          </span>
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="bg-white p-5 rounded-3 border text-center shadow-sm" style={{ borderColor: 'var(--border-light)' }}>
            <div
              className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3"
              style={{ width: '64px', height: '64px', backgroundColor: 'var(--bg-sand)', color: 'var(--primary-brown)' }}
            >
              <i className="bi bi-box-seam fs-2"></i>
            </div>
            <h4 className="font-serif fw-bold mb-2">No Items in This Category</h4>
            <p className="text-muted mx-auto mb-4" style={{ maxWidth: '420px', fontSize: '0.88rem' }}>
              You don't have any items matching this filter right now. Declutter an unwanted item from your home to start receiving swap offers!
            </p>
            <Link to="/add-item" className="btn-nordic-primary">
              <i className="bi bi-plus-circle me-1"></i> List an Item Now
            </Link>
          </div>
        )}

        {/* Items Grid */}
        <div className="row g-4">
          {filteredItems.map(item => (
            <div key={item.id} className="col-12 col-md-6 col-lg-4">
              <div className="bg-white rounded-3 border shadow-sm overflow-hidden h-100 d-flex flex-column" style={{ borderColor: 'var(--border-light)' }}>
                
                {/* Photo & Badges */}
                <div className="position-relative" style={{ height: '200px', backgroundColor: '#F3ECE5' }}>
                  <img src={item.image} alt={item.title} className="w-100 h-100" style={{ objectFit: 'cover' }} />
                  
                  <span
                    className="badge-condition"
                    style={{ backgroundColor: item.conditionBg || '#F9F1E2', color: item.conditionColor || '#87571B' }}
                  >
                    {item.condition}
                  </span>

                  <span className="badge-city">
                    {item.city} {item.allowIntercity ? '⇄ Intercity' : ''}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4 d-flex flex-column flex-grow-1">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-uppercase text-muted fw-semibold" style={{ fontSize: '0.74rem', letterSpacing: '0.1em' }}>
                      {item.categoryName}
                    </span>
                    <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1" style={{ fontSize: '0.74rem' }}>
                      {item.status || 'Available'}
                    </span>
                  </div>

                  <h5 className="fw-bold text-dark mb-2 font-serif text-truncate" title={item.title} style={{ fontSize: '1.12rem' }}>
                    {item.title}
                  </h5>

                  {/* Trade Preference */}
                  <div className="p-3 rounded-2 bg-light border mb-3 mt-auto" style={{ fontSize: '0.82rem', lineHeight: 1.55 }}>
                    <span className="fw-bold d-block text-dark mb-0.5">Wanted in exchange:</span>
                    <span className="text-muted text-truncate d-block">{item.exchangePreference}</span>
                  </div>

                  {/* Defect note */}
                  {item.defects && (
                    <div className="mb-3 text-muted small text-truncate" style={{ fontSize: '0.78rem' }}>
                      <i className="bi bi-info-circle me-1 text-warning"></i>
                      <strong>Reported Wear:</strong> {item.defects}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="d-flex gap-2 pt-3 border-top mt-auto" style={{ borderColor: 'var(--border-light)' }}>
                    <Link
                      to={`/item/${item.id}`}
                      className="btn btn-sm btn-outline-secondary w-50 py-2"
                      style={{ fontSize: '0.84rem' }}
                    >
                      <i className="bi bi-eye"></i> View Public
                    </Link>

                    <Link
                      to={`/edit-item/${item.id}`}
                      className="btn btn-sm btn-outline-dark w-50 py-2"
                      style={{ fontSize: '0.84rem' }}
                    >
                      <i className="bi bi-pencil"></i> Edit
                    </Link>

                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(item.id)}
                      className="btn btn-sm btn-outline-danger px-2.5 py-2"
                      title="Delete item"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>

                </div>

              </div>
            </div>
          ))}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirmId && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(30, 24, 20, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1080 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title font-serif fw-bold text-danger">Confirm Item Deletion</h5>
                  <button type="button" className="btn-close" onClick={() => setDeleteConfirmId(null)}></button>
                </div>
                <div className="modal-body p-4 text-center">
                  <i className="bi bi-exclamation-triangle-fill fs-1 text-warning mb-2 d-block"></i>
                  <p className="text-muted mb-0">
                    Are you sure you want to remove this item listing from the community exchange? Any pending swap proposals for this item will be cancelled.
                  </p>
                </div>
                <div className="modal-footer">
                  <button type="button" onClick={() => setDeleteConfirmId(null)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="button" onClick={() => handleDelete(deleteConfirmId)} className="btn btn-danger">
                    Yes, Delete Item
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
