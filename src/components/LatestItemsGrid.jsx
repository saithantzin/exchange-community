import React, { useState } from 'react';

export default function LatestItemsGrid({
  items,
  isLoading,
  error,
  selectedCategory,
  onSelectCategory,
  onOpenItemDetail,
  onResetFilters
}) {
  const [favorites, setFavorites] = useState({});

  const toggleFavorite = (id, e) => {
    e.stopPropagation();
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const categoryTabs = [
    { id: 'all', label: 'All Items' },
    { id: 'furniture', label: 'Furniture' },
    { id: 'electronics', label: 'Electronics' },
    { id: 'household', label: 'Household' },
    { id: 'books', label: 'Books' },
    { id: 'clothing', label: 'Clothing' },
    { id: 'other', label: 'Other' },
  ];

  return (
    <section id="browse" className="py-5" style={{ backgroundColor: 'var(--bg-warm)' }}>
      <div className="container-xl">
        {/* Section Header */}
        <div className="d-flex flex-wrap justify-content-between align-items-end mb-4 pb-3 border-bottom" style={{ borderColor: 'var(--border-light)' }}>
          <div>
            <span className="section-pre-title">Bestsellers &amp; Recent Swaps</span>
            <h2 className="section-main-title mb-0">Latest Available Items for Exchange</h2>
          </div>
          <div className="d-flex align-items-center gap-4 mt-2 mt-md-0">
            <span className="text-muted d-none d-md-inline" style={{ fontSize: '0.88rem' }}>
              Showing {items.length} verified listings
            </span>
            <button
              onClick={() => onSelectCategory('all')}
              className="btn btn-link text-decoration-none p-0 fw-semibold"
              style={{ color: 'var(--primary-brown)', fontSize: '0.92rem' }}
            >
              View all listings <i className="bi bi-arrow-right ms-1"></i>
            </button>
          </div>
        </div>

        {/* Category Filter Pills Bar */}
        <div className="d-flex flex-wrap gap-2 gap-md-3 mb-5 pb-2 overflow-auto">
          {categoryTabs.map(tab => {
            const isActive = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectCategory(tab.id)}
                className={`btn btn-sm px-4 py-2 rounded-pill ${
                  isActive
                    ? 'btn-nordic-primary'
                    : 'btn-nordic-secondary'
                }`}
                style={{ fontSize: '0.86rem', whiteSpace: 'nowrap', letterSpacing: '0.025em' }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Loading State Indicator */}
        {isLoading && (
          <div className="text-center py-5">
            <div className="spinner-border text-brown" role="status" style={{ color: 'var(--primary-brown)' }}>
              <span className="visually-hidden">Loading items...</span>
            </div>
            <p className="mt-3 text-muted" style={{ fontSize: '0.94rem' }}>Retrieving live available listings from community...</p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="alert alert-warning text-center py-5 my-4" style={{ backgroundColor: '#FFF7E6', borderColor: '#FFE2B8' }}>
            <i className="bi bi-exclamation-triangle-fill fs-3 text-warning mb-2 d-block"></i>
            <h5 className="fw-bold mb-2">Unable to Load Items</h5>
            <p className="text-muted mb-4" style={{ fontSize: '0.92rem' }}>{error}</p>
            <button onClick={onResetFilters} className="btn btn-nordic-primary">
              Retry &amp; Reset Filters
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && items.length === 0 && (
          <div className="text-center py-5 my-4 bg-white rounded-3 border p-5" style={{ borderColor: 'var(--border-light)' }}>
            <div
              className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-4"
              style={{ width: '70px', height: '70px', backgroundColor: 'var(--bg-sand)', color: 'var(--primary-brown)' }}
            >
              <i className="bi bi-search fs-3"></i>
            </div>
            <h4 className="font-serif fw-bold mb-3">No Matching Items Found</h4>
            <p className="text-muted mx-auto mb-4" style={{ maxWidth: '440px', fontSize: '0.92rem', lineHeight: 1.7 }}>
              We couldn't find available items matching your specific keyword, condition, or city filter. Try clearing filters or listing a swap request.
            </p>
            <button onClick={onResetFilters} className="btn-nordic-primary">
              <i className="bi bi-arrow-counterclockwise me-1"></i> Reset All Filters
            </button>
          </div>
        )}

        {/* Responsive Product-Card Grid */}
        {!isLoading && !error && items.length > 0 && (
          <div className="row g-4 g-lg-5">
            {items.map(item => (
              <div key={item.id} className="col-12 col-sm-6 col-lg-3">
                <div className="nordic-item-card h-100">
                  
                  {/* Item Image with Badges */}
                  <div className="card-img-container">
                    <img src={item.image} alt={item.title} loading="lazy" />
                    
                    {/* Condition Badge */}
                    <span
                      className="badge-condition"
                      style={{
                        backgroundColor: item.conditionBg || '#F9F1E2',
                        color: item.conditionColor || '#87571B',
                        border: '1px solid rgba(0,0,0,0.06)'
                      }}
                    >
                      {item.condition}
                    </span>

                    {/* City Badge */}
                    <span className="badge-city">
                      <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                      {item.cityCode} {item.allowIntercity ? '⇄ Intercity' : ''}
                    </span>

                    {/* Favorite Button */}
                    <button
                      onClick={(e) => toggleFavorite(item.id, e)}
                      className={`btn-fav ${favorites[item.id] ? 'active' : ''}`}
                      aria-label="Save to Wishlist"
                      title="Save to Wishlist"
                    >
                      <i className={`bi ${favorites[item.id] ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                    </button>
                  </div>

                  {/* Card Body with Generous Padding */}
                  <div className="p-4 d-flex flex-column flex-grow-1">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span
                        className="text-uppercase fw-semibold"
                        style={{ fontSize: '0.72rem', letterSpacing: '0.12em', color: 'var(--text-muted)' }}
                      >
                        {item.categoryName}
                      </span>
                      <span className="text-muted" style={{ fontSize: '0.74rem' }}>
                        {item.createdAt}
                      </span>
                    </div>

                    <h5
                      className="card-title fw-semibold text-dark mb-3 text-truncate-2"
                      style={{ fontSize: '1.02rem', lineHeight: 1.5, minHeight: '3em' }}
                      title={item.title}
                    >
                      {item.title}
                    </h5>

                    {/* Exchange Preference Pill Box */}
                    <div
                      className="p-3 rounded-3 mb-4 mt-auto"
                      style={{
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-light)',
                        fontSize: '0.8rem',
                        lineHeight: 1.5
                      }}
                    >
                      <div className="d-flex align-items-center gap-2 text-muted mb-1.5">
                        <i className="bi bi-arrow-left-right text-brown" style={{ color: 'var(--primary-brown)' }}></i>
                        <span className="fw-bold" style={{ color: 'var(--text-main)', letterSpacing: '0.01em' }}>
                          Trade Wanted:
                        </span>
                      </div>
                      <span className="text-muted text-truncate d-block" title={item.exchangePreference}>
                        {item.exchangePreference.replace('Looking for: ', '')}
                      </span>
                    </div>

                    {/* Owner Summary & View Details Action */}
                    <div className="d-flex align-items-center justify-content-between pt-3 border-top" style={{ borderColor: 'var(--border-light)' }}>
                      <div className="d-flex align-items-center gap-2">
                        <img
                          src={item.owner.avatar}
                          alt={item.owner.name}
                          className="rounded-circle"
                          style={{ width: '28px', height: '28px', objectFit: 'cover' }}
                        />
                        <span className="text-muted" style={{ fontSize: '0.78rem' }}>
                          {item.owner.name.split(' ')[0]} &nbsp;•&nbsp; <span className="text-dark fw-semibold">{item.owner.rating}★</span>
                        </span>
                      </div>

                      <button
                        onClick={() => onOpenItemDetail(item)}
                        className="btn btn-sm btn-nordic-outline py-1 px-3"
                        style={{ fontSize: '0.82rem' }}
                      >
                        Details <i className="bi bi-chevron-right ms-1" style={{ fontSize: '0.7rem' }}></i>
                      </button>
                    </div>

                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
