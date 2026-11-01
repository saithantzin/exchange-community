import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useExchange } from '../../context/ExchangeContext';
import { CATEGORIES } from '../../data/mockData';

export default function BrowseItemsPage() {
  const { items } = useExchange();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // URL query params initialization
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('cat') || 'all';
  const initialCity = searchParams.get('city') || 'all';
  const initialCondition = searchParams.get('cond') || 'all';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [city, setCity] = useState(initialCity);
  const [condition, setCondition] = useState(initialCondition);
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [favorites, setFavorites] = useState({});

  const itemsPerPage = 8;

  // Sync state when URL params change
  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
    setCategory(searchParams.get('cat') || 'all');
    setCity(searchParams.get('city') || 'all');
    setCondition(searchParams.get('cond') || 'all');
    setCurrentPage(1);
  }, [searchParams]);

  const toggleFavorite = (id, e) => {
    e.stopPropagation();
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter & Sort Logic
  const filteredAndSortedItems = useMemo(() => {
    let result = items.filter(item => {
      // Keyword
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesPref = item.exchangePreference.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesPref) return false;
      }
      // Category
      if (category !== 'all' && item.category !== category) return false;
      // City
      if (city !== 'all') {
        const itemCode = (item.cityCode || '').toUpperCase();
        const targetCode = city.toUpperCase();
        const cityName = (item.city || '').toLowerCase();
        if (itemCode !== targetCode && !cityName.includes(city.toLowerCase())) return false;
      }
      // Condition
      if (condition !== 'all' && item.condition !== condition) return false;

      return true;
    });

    // Sort
    if (sortBy === 'newest') {
      result.sort((a, b) => b.id - a.id);
    } else if (sortBy === 'title-asc') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'title-desc') {
      result.sort((a, b) => b.title.localeCompare(a.title));
    }

    return result;
  }, [items, searchQuery, category, city, condition, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredAndSortedItems.length / itemsPerPage) || 1;
  const paginatedItems = filteredAndSortedItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleApplyFilters = () => {
    setSearchParams({
      q: searchQuery,
      cat: category,
      city: city,
      cond: condition
    });
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setCategory('all');
    setCity('all');
    setCondition('all');
    setSearchParams({});
    setCurrentPage(1);
  };

  return (
    <div className="py-5" style={{ backgroundColor: 'var(--bg-warm)', minHeight: '80vh' }}>
      <div className="container-xl">
        
        {/* Breadcrumb & Header */}
        <div className="mb-5 pb-2 border-bottom" style={{ borderColor: 'var(--border-light)' }}>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-2" style={{ fontSize: '0.84rem' }}>
              <li className="breadcrumb-item"><Link to="/" className="text-muted text-decoration-none">Home</Link></li>
              <li className="breadcrumb-item active text-dark" aria-current="page">Browse Items</li>
            </ol>
          </nav>
          <div className="d-flex flex-wrap justify-content-between align-items-end">
            <div>
              <span className="section-pre-title">Community Marketplace</span>
              <h1 className="font-serif fw-bold display-6 mb-1">Available Items for Exchange</h1>
            </div>
            <span className="text-muted mt-2 mt-md-0" style={{ fontSize: '0.92rem' }}>
              Showing {filteredAndSortedItems.length} active listings across MDY &amp; YGN
            </span>
          </div>
        </div>

        {/* Filter and Control Bar */}
        <div className="bg-white p-4 rounded-3 border mb-5 shadow-sm" style={{ borderColor: 'var(--border-light)' }}>
          <div className="row g-3 g-md-4 align-items-center">
            
            {/* Search */}
            <div className="col-12 col-md-3">
              <label className="form-label text-muted small fw-semibold mb-2">Search Items</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Keyword, model, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                />
              </div>
            </div>

            {/* Category */}
            <div className="col-6 col-md-2">
              <label className="form-label text-muted small fw-semibold mb-2">Category</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Condition */}
            <div className="col-6 col-md-2">
              <label className="form-label text-muted small fw-semibold mb-2">Condition</label>
              <select
                className="form-select"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
              >
                <option value="all">All Conditions</option>
                <option value="New">New</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>

            {/* City */}
            <div className="col-6 col-md-2">
              <label className="form-label text-muted small fw-semibold mb-2">City Hub</label>
              <select
                className="form-select"
                value={city}
                onChange={(e) => setCity(e.target.value)}
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

            {/* Sort by */}
            <div className="col-6 col-md-2">
              <label className="form-label text-muted small fw-semibold mb-2">Sorting</label>
              <select
                className="form-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Sort: Newest First</option>
                <option value="title-asc">Sort: Name (A-Z)</option>
                <option value="title-desc">Sort: Name (Z-A)</option>
              </select>
            </div>

            {/* Apply & Reset Buttons */}
            <div className="col-12 col-md-1 d-flex gap-2 align-items-end">
              <button
                onClick={handleApplyFilters}
                className="btn-nordic-primary w-100 py-2 mt-auto"
                style={{ height: '48px' }}
                title="Apply Filter"
              >
                <i className="bi bi-funnel"></i>
              </button>
              {(searchQuery || category !== 'all' || city !== 'all' || condition !== 'all') && (
                <button
                  onClick={handleResetFilters}
                  className="btn btn-outline-secondary py-2 mt-auto"
                  style={{ height: '48px', width: '48px' }}
                  title="Reset Filter"
                >
                  <i className="bi bi-arrow-counterclockwise"></i>
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="text-center py-5">
            <div className="spinner-border" role="status" style={{ color: 'var(--primary-brown)' }}></div>
            <p className="mt-3 text-muted">Retrieving community items...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredAndSortedItems.length === 0 && (
          <div className="bg-white p-5 rounded-3 border text-center my-4" style={{ borderColor: 'var(--border-light)' }}>
            <div
              className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-4"
              style={{ width: '70px', height: '70px', backgroundColor: 'var(--bg-sand)', color: 'var(--primary-brown)' }}
            >
              <i className="bi bi-search fs-3"></i>
            </div>
            <h4 className="font-serif fw-bold mb-2">No Items Found Matching Your Filter</h4>
            <p className="text-muted mx-auto mb-4" style={{ maxWidth: '440px', fontSize: '0.92rem', lineHeight: 1.7 }}>
              We could not find any active listings matching your search criteria. Try removing filters or changing city location.
            </p>
            <button onClick={handleResetFilters} className="btn-nordic-primary">
              Clear All Filters
            </button>
          </div>
        )}

        {/* Responsive Items Grid */}
        {!isLoading && filteredAndSortedItems.length > 0 && (
          <div className="row g-4 g-lg-5 mb-5">
            {paginatedItems.map(item => (
              <div key={item.id} className="col-12 col-sm-6 col-lg-3">
                <div
                  className="nordic-item-card h-100"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/item/${item.id}`)}
                >
                  {/* Image & Badges */}
                  <div className="card-img-container">
                    <img src={item.image} alt={item.title} loading="lazy" />
                    
                    <span
                      className="badge-condition"
                      style={{
                        backgroundColor: item.conditionBg || '#F9F1E2',
                        color: item.conditionColor || '#87571B'
                      }}
                    >
                      {item.condition}
                    </span>

                    <span className="badge-city">
                      <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                      {item.cityCode} {item.allowIntercity ? '⇄ Intercity' : ''}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => toggleFavorite(item.id, e)}
                      className={`btn-fav ${favorites[item.id] ? 'active' : ''}`}
                    >
                      <i className={`bi ${favorites[item.id] ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                    </button>
                  </div>

                  {/* Body with Spacious Padding */}
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
                    >
                      {item.title}
                    </h5>

                    {/* Trade Preference Box */}
                    <div
                      className="p-3 rounded-3 mb-4 mt-auto"
                      style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)', fontSize: '0.8rem', lineHeight: 1.5 }}
                    >
                      <div className="d-flex align-items-center gap-2 text-muted mb-1.5">
                        <i className="bi bi-arrow-left-right text-brown" style={{ color: 'var(--primary-brown)' }}></i>
                        <span className="fw-bold" style={{ color: 'var(--text-main)', letterSpacing: '0.01em' }}>Trade Wanted:</span>
                      </div>
                      <span className="text-muted text-truncate d-block">
                        {item.exchangePreference.replace('Looking for: ', '')}
                      </span>
                    </div>

                    {/* Owner Info & Details Action */}
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

                      <span className="btn btn-sm btn-nordic-outline py-1 px-3" style={{ fontSize: '0.82rem' }}>
                        Details <i className="bi bi-chevron-right ms-1" style={{ fontSize: '0.7rem' }}></i>
                      </span>
                    </div>

                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-center align-items-center gap-3 pt-4">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn btn-sm btn-outline-secondary px-4 py-2"
              style={{ fontSize: '0.88rem' }}
            >
              <i className="bi bi-chevron-left me-1"></i> Previous
            </button>

            <div className="d-flex gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`btn btn-sm ${currentPage === i + 1 ? 'btn-nordic-primary' : 'btn-outline-secondary'}`}
                  style={{ width: '40px', height: '40px' }}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="btn btn-sm btn-outline-secondary px-4 py-2"
              style={{ fontSize: '0.88rem' }}
            >
              Next <i className="bi bi-chevron-right ms-1"></i>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
