import React from 'react';

export default function HeroSection({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedCity,
  setSelectedCity,
  selectedCondition,
  setSelectedCondition,
  onPerformSearch,
  onResetFilters,
  onOpenListModal,
  onBrowseItemsClick
}) {
  return (
    <section id="home" className="py-5" style={{ backgroundColor: 'var(--bg-warm)' }}>
      <div className="container-xl">
        <div className="row g-4 g-lg-5 align-items-center">
          
          {/* Left Column: Editorial Headline & Value Pitch */}
          <div className="col-lg-6">
            <span
              className="section-pre-title text-uppercase fw-semibold"
              style={{ letterSpacing: '0.22em', wordSpacing: '0.08em', marginBottom: '14px' }}
            >
              Natural Spaces &nbsp;•&nbsp; Conscious Sharing
            </span>

            <h1
              className="display-4 fw-bold mb-4 font-serif"
              style={{
                lineHeight: 1.3,
                color: 'var(--text-main)',
                letterSpacing: '0.015em',
                wordSpacing: '0.04em'
              }}
            >
              Give Items a <br />
              <span style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--primary-brown)' }}>
                Second Life.
              </span>
            </h1>

            <p
              className="lead text-muted mb-5"
              style={{ fontSize: '1.12rem', maxWidth: '530px', lineHeight: 1.85, wordSpacing: '0.03em' }}
            >
              A kinder, community-driven marketplace for pre-loved belongings.
              Exchange what you no longer use for items you truly need across{' '}
              <strong className="text-dark">Mandalay (MDY)</strong> and{' '}
              <strong className="text-dark">Yangon (YGN)</strong> — no money required, zero waste generated.
            </p>

            {/* Quick CTAs */}
            <div className="d-flex flex-wrap gap-3 mb-5">
              <button
                onClick={onBrowseItemsClick}
                className="btn-nordic-primary px-4 py-3 shadow-sm"
              >
                Browse Available Items <i className="bi bi-arrow-right ms-1"></i>
              </button>

              <button
                onClick={onOpenListModal}
                className="btn-nordic-secondary px-4 py-3"
              >
                <i className="bi bi-plus-circle me-1"></i> List an Item to Swap
              </button>
            </div>

            {/* Metric counters matching reference image */}
            <div className="row g-3 pt-4 border-top" style={{ borderColor: 'var(--border-light)' }}>
              <div className="col-4">
                <div
                  className="h3 fw-bold mb-1 font-serif"
                  style={{ color: 'var(--primary-brown)', letterSpacing: '0.02em' }}
                >
                  14.2K+
                </div>
                <div className="text-muted" style={{ fontSize: '0.84rem', letterSpacing: '0.02em', lineHeight: 1.4 }}>
                  Items Exchanged
                </div>
              </div>

              <div className="col-4 border-start border-end px-3 px-md-4" style={{ borderColor: 'var(--border-light)' }}>
                <div
                  className="h3 fw-bold mb-1 font-serif"
                  style={{ color: 'var(--primary-brown)', letterSpacing: '0.02em' }}
                >
                  4.9 <span style={{ fontSize: '1.1rem', color: '#E0A838' }}>★</span>
                </div>
                <div className="text-muted" style={{ fontSize: '0.84rem', letterSpacing: '0.02em', lineHeight: 1.4 }}>
                  Trust & Safety Rating
                </div>
              </div>

              <div className="col-4 ps-3 ps-md-4">
                <div
                  className="h3 fw-bold mb-1 font-serif"
                  style={{ color: 'var(--primary-brown)', letterSpacing: '0.02em' }}
                >
                  MDY ⇄ YGN
                </div>
                <div className="text-muted" style={{ fontSize: '0.84rem', letterSpacing: '0.02em', lineHeight: 1.4 }}>
                  Intercity Coverage
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual with Scandinavian Aesthetic */}
          <div className="col-lg-6">
            <div className="position-relative">
              {/* Main Card with Warm Image */}
              <div
                className="overflow-hidden shadow-lg"
                style={{
                  borderRadius: '14px',
                  backgroundColor: '#ECE3D6',
                  border: '1px solid var(--border-light)',
                  maxHeight: '520px'
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1000&q=80"
                  alt="Harmonious warm interior with sustainable teak furniture"
                  className="w-100 h-100"
                  style={{ objectFit: 'cover', minHeight: '480px', filter: 'brightness(0.98)' }}
                />
              </div>

              {/* Floating Quote Badge */}
              <div
                className="position-absolute top-0 end-0 m-4 p-3 rounded-3 shadow-sm bg-white bg-opacity-95 d-none d-sm-block"
                style={{ backdropFilter: 'blur(10px)', border: '1px solid var(--border-light)', maxWidth: '240px' }}
              >
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span
                    className="badge rounded-circle p-1 bg-success text-white"
                    style={{ width: '20px', height: '20px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <i className="bi bi-check" style={{ fontSize: '11px' }}></i>
                  </span>
                  <span className="fw-bold" style={{ fontSize: '0.84rem', letterSpacing: '0.02em' }}>
                    100% Money-Free
                  </span>
                </div>
                <p className="mb-0 text-muted" style={{ fontSize: '0.82rem', lineHeight: 1.6, wordSpacing: '0.02em' }}>
                  Direct item-for-item swaps inspected and verified by both members.
                </p>
              </div>

              {/* Floating Recent Swap Notification Card */}
              <div
                className="position-absolute bottom-0 start-0 m-4 p-3 rounded-3 shadow-lg bg-white"
                style={{ border: '1px solid var(--border-light)', maxWidth: '330px' }}
              >
                <div className="d-flex align-items-center gap-3 mb-2">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center text-white"
                    style={{ width: '32px', height: '32px', backgroundColor: 'var(--primary-brown)', fontSize: '0.82rem' }}
                  >
                    <i className="bi bi-arrow-left-right"></i>
                  </div>
                  <div>
                    <span className="d-block fw-semibold" style={{ fontSize: '0.86rem', lineHeight: 1.3 }}>
                      Just Exchanged!
                    </span>
                    <span className="text-muted" style={{ fontSize: '0.74rem' }}>
                      18 mins ago &nbsp;•&nbsp; Mandalay ⇄ Yangon
                    </span>
                  </div>
                </div>
                <div className="p-2 rounded bg-light d-flex align-items-center justify-content-between" style={{ fontSize: '0.8rem' }}>
                  <span className="fw-medium text-truncate" style={{ maxWidth: '130px' }}>Sony Headphones</span>
                  <i className="bi bi-arrow-right text-muted mx-2"></i>
                  <span className="fw-medium text-truncate" style={{ maxWidth: '130px' }}>Kindle 11th Gen</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Integrated Hero Search & Filter Console (Requirement 2.C) */}
        <div className="mt-5 pt-2">
          <div className="search-filter-card">
            <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom" style={{ borderColor: 'var(--border-light)' }}>
              <div className="d-flex align-items-center gap-3">
                <i className="bi bi-search text-muted fs-5"></i>
                <span className="fw-bold text-dark" style={{ fontSize: '1rem', letterSpacing: '0.01em' }}>
                  Smart Search & Filter
                </span>
                <span className="badge rounded-pill bg-light text-secondary border px-3 py-1" style={{ fontSize: '0.78rem' }}>
                  Direct Local & Intercity Listings
                </span>
              </div>
              {(searchQuery || selectedCategory !== 'all' || selectedCity !== 'all' || selectedCondition !== 'all') && (
                <button
                  onClick={onResetFilters}
                  className="btn btn-sm btn-link text-decoration-none text-muted p-0"
                  style={{ fontSize: '0.86rem' }}
                >
                  <i className="bi bi-x-circle me-1"></i> Clear all filters
                </button>
              )}
            </div>

            <div className="row g-3 g-md-4 align-items-center">
              {/* Keyword Search Input */}
              <div className="col-12 col-md-4">
                <label className="form-label text-muted small fw-semibold mb-2">Keywords or Item Name</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0" style={{ borderColor: 'var(--border-medium)' }}>
                    <i className="bi bi-search text-muted"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="e.g. Teak Desk, Sony Headphones, Books..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Category Dropdown */}
              <div className="col-6 col-md-2">
                <label className="form-label text-muted small fw-semibold mb-2">Category</label>
                <select
                  className="form-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  <option value="electronics">Electronics</option>
                  <option value="books">Books</option>
                  <option value="clothing">Clothing</option>
                  <option value="household">Household Items</option>
                  <option value="furniture">Furniture</option>
                  <option value="other">Other Items</option>
                </select>
              </div>

              {/* Condition Dropdown */}
              <div className="col-6 col-md-2">
                <label className="form-label text-muted small fw-semibold mb-2">Item Condition</label>
                <select
                  className="form-select"
                  value={selectedCondition}
                  onChange={(e) => setSelectedCondition(e.target.value)}
                >
                  <option value="all">All Conditions</option>
                  <option value="New">New (Unopened)</option>
                  <option value="Like New">Like New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>

              {/* City Dropdown */}
              <div className="col-6 col-md-2">
                <label className="form-label text-muted small fw-semibold mb-2">Location / City</label>
                <select
                  className="form-select"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                >
                  <option value="all">All Cities (Nationwide)</option>
                  <option value="YGN">Yangon (YGN)</option>
                  <option value="MDY">Mandalay (MDY)</option>
                  <option value="NPT">Naypyitaw (NPT)</option>
                  <option value="TGI">Taunggyi (TGI)</option>
                  <option value="MLM">Mawlamyine (MLM)</option>
                  <option value="BGO">Bago (BGO)</option>
                  <option value="MON">Monywa (MON)</option>
                  <option value="PTH">Pathein (PTH)</option>
                  <option value="POL">Pyin Oo Lwin (POL)</option>
                </select>
              </div>

              {/* Action Button */}
              <div className="col-6 col-md-2 d-flex align-items-end">
                <button
                  onClick={onPerformSearch}
                  className="btn-nordic-primary w-100 py-2 mt-auto"
                  style={{ height: '48px', fontSize: '0.92rem' }}
                >
                  <i className="bi bi-funnel me-1"></i> Apply Filter
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
