import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import itemService from '../../services/itemService';
import categoryService from '../../services/categoryService';
import authService from '../../services/authService';

function formatItemFromBackend(bItem) {
  const primaryImage = bItem.images?.find(i => i.is_primary)?.image_url
    || bItem.images?.[0]?.image_url
    || 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80';

  const township = bItem.township?.name || '';
  const region = bItem.township?.state_region?.name || '';
  const city = township && region ? `${township}, ${region}` : (bItem.city || 'Mandalay');

  const conditionColors = {
    'New': { bg: '#EAF2EC', color: '#2E693D' },
    'Like New': { bg: '#F9F1E2', color: '#87571B' },
    'Good': { bg: '#F4EAE1', color: '#734E26' },
    'Fair': { bg: '#EFEFEF', color: '#555555' },
    'Poor': { bg: '#FDE8E8', color: '#9B1C1C' }
  };
  const condStyle = conditionColors[bItem.condition] || { bg: '#F9F1E2', color: '#87571B' };

  return {
    id: bItem.id,
    title: bItem.title,
    categoryName: bItem.category?.name || 'General',
    categoryId: bItem.category_id,
    condition: bItem.condition || 'Used',
    conditionColor: condStyle.color,
    conditionBg: condStyle.bg,
    defects: bItem.defects || '',
    description: bItem.description || '',
    exchangePreference: bItem.looking_for || 'Open to offers',
    city: city,
    cityCode: city.toLowerCase().includes('mandalay') ? 'MDY' : city.toLowerCase().includes('yangon') ? 'YGN' : 'MM',
    allowIntercity: bItem.allow_intercity ?? true,
    image: primaryImage,
    images: bItem.images?.map(i => i.image_url) || [primaryImage],
    owner: {
      id: bItem.user?.id || bItem.user_id,
      name: bItem.user?.name || 'Community Member',
      rating: Number(bItem.user?.rating) || 5.0,
      avatar: bItem.user?.profile_image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80'
    },
    views: bItem.views || 0,
    createdAt: bItem.created_at ? new Date(bItem.created_at).toLocaleDateString() : 'Recently'
  };
}

export default function BrowseItemsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // State
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [favorites, setFavorites] = useState({});

  // Filters state from URL params
  const searchQuery = searchParams.get('q') || '';
  const category = searchParams.get('cat') || 'all';
  const city = searchParams.get('city') || 'all';
  const condition = searchParams.get('cond') || 'all';
  const sortBy = searchParams.get('sort') || 'newest';
  const currentPage = Number(searchParams.get('page')) || 1;

  // Local form inputs for immediate responsiveness
  const [inputQuery, setInputQuery] = useState(searchQuery);

  // Sync input query with URL
  useEffect(() => {
    setInputQuery(searchQuery);
  }, [searchQuery]);

  // Load dynamic categories & locations on mount
  useEffect(() => {
    categoryService.getCategories()
      .then(res => {
        if (res?.success && Array.isArray(res.data)) {
          setCategories(res.data);
        }
      })
      .catch(err => console.warn('Could not load categories:', err));

    authService.getLocations()
      .then(res => {
        if (res?.success && Array.isArray(res.data)) {
          setLocations(res.data);
        }
      })
      .catch(err => console.warn('Could not load locations:', err));
  }, []);

  // Fetch dynamic items from MySQL API whenever filter parameters change
  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: 12,
        sort: sortBy
      };

      if (searchQuery.trim()) params.q = searchQuery.trim();
      if (category && category !== 'all') params.cat = category;
      if (condition && condition !== 'all') params.condition = condition;
      if (city && city !== 'all') params.city = city;

      const res = await itemService.getItems(params);

      if (res?.success && res.data) {
        const rawItems = res.data.data || [];
        const formatted = rawItems.map(formatItemFromBackend);
        setItems(formatted);
        setTotalItems(res.data.total || formatted.length);
        setTotalPages(res.data.last_page || Math.ceil((res.data.total || formatted.length) / 12) || 1);
      } else {
        setItems([]);
        setTotalItems(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.warn('Could not retrieve items from backend:', err?.message);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, category, condition, city, sortBy, currentPage]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const updateParam = (newParams) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([k, v]) => {
      if (!v || v === 'all') {
        next.delete(k);
      } else {
        next.set(k, v);
      }
    });
    // Reset to page 1 unless page itself is explicitly updated
    if (!newParams.page) {
      next.delete('page');
    }
    setSearchParams(next);
  };

  const handleApplySearch = (e) => {
    if (e) e.preventDefault();
    updateParam({ q: inputQuery.trim() });
  };

  const handleResetFilters = () => {
    setInputQuery('');
    setSearchParams({});
  };

  const toggleFavorite = (id, e) => {
    e.stopPropagation();
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="py-5" style={{ backgroundColor: 'var(--bg-warm)', minHeight: '85vh' }}>
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
              <span className="section-pre-title mb-0">Community Barter Marketplace</span>
              <h1 className="font-serif fw-bold display-6 mb-1 text-dark">Available Items for Exchange</h1>
            </div>
            <span className="text-muted mt-2 mt-md-0 fw-medium" style={{ fontSize: '0.90rem' }}>
              {isLoading ? 'Scanning catalog...' : `Showing ${items.length} of ${totalItems} active listings`}
            </span>
          </div>
        </div>

        {/* Filter and Control Bar (Dynamic DB Filters) */}
        <div className="bg-white p-4 rounded-3 border mb-5 shadow-sm" style={{ borderColor: 'var(--border-light)' }}>
          <div className="row g-3 g-md-4 align-items-center">
            
            {/* Search Query */}
            <div className="col-12 col-md-3">
              <label className="form-label text-muted small fw-semibold mb-2">Search Items</label>
              <form onSubmit={handleApplySearch}>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <i className="bi bi-search text-muted"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Title, keyword, model..."
                    value={inputQuery}
                    onChange={(e) => setInputQuery(e.target.value)}
                  />
                  {inputQuery && (
                    <button
                      type="button"
                      className="btn btn-link text-muted border border-start-0 text-decoration-none"
                      onClick={() => {
                        setInputQuery('');
                        updateParam({ q: '' });
                      }}
                    >
                      <i className="bi bi-x"></i>
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Dynamic Category Selector */}
            <div className="col-6 col-md-2">
              <label className="form-label text-muted small fw-semibold mb-2">Category</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => updateParam({ cat: e.target.value })}
              >
                <option value="all">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.slug || c.id}>
                    {c.name} {c.items_count !== undefined ? `(${c.items_count})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Condition Selector */}
            <div className="col-6 col-md-2">
              <label className="form-label text-muted small fw-semibold mb-2">Condition</label>
              <select
                className="form-select"
                value={condition}
                onChange={(e) => updateParam({ cond: e.target.value })}
              >
                <option value="all">All Conditions</option>
                <option value="New">New</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>

            {/* Dynamic City / Region Selector */}
            <div className="col-6 col-md-2">
              <label className="form-label text-muted small fw-semibold mb-2">Location / Region</label>
              <select
                className="form-select"
                value={city}
                onChange={(e) => updateParam({ city: e.target.value })}
              >
                <option value="all">All Locations (Nationwide)</option>
                <option value="MDY">Mandalay Region (MDY)</option>
                <option value="YGN">Yangon Region (YGN)</option>
                <option value="NPT">Naypyitaw (NPT)</option>
                {locations
                  .filter(loc => !['Yangon', 'Mandalay', 'Naypyitaw'].some(k => loc.name.includes(k)))
                  .map(loc => (
                    <option key={loc.id} value={loc.name}>
                      {loc.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Sorting */}
            <div className="col-6 col-md-2">
              <label className="form-label text-muted small fw-semibold mb-2">Sorting</label>
              <select
                className="form-select"
                value={sortBy}
                onChange={(e) => updateParam({ sort: e.target.value })}
              >
                <option value="newest">Newest First</option>
                <option value="popular">Most Viewed</option>
                <option value="title-asc">Title: A to Z</option>
                <option value="title-desc">Title: Z to A</option>
              </select>
            </div>

            {/* Reset Filters Button */}
            <div className="col-12 col-md-1 d-flex align-items-end">
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn btn-outline-secondary w-100 py-2 d-flex align-items-center justify-content-center"
                style={{ height: '44px' }}
                title="Reset all filters"
              >
                <i className="bi bi-arrow-counterclockwise me-1"></i>
                <span className="d-md-none">Reset</span>
              </button>
            </div>

          </div>
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="text-center py-5 my-4 bg-white rounded-3 border">
            <div className="spinner-border mb-3" role="status" style={{ color: 'var(--primary-brown)', width: '2.8rem', height: '2.8rem' }}></div>
            <h5 className="font-serif fw-bold text-dark">Loading Available Community Items...</h5>
            <p className="text-muted small mb-0">Querying live listings from database catalog.</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && items.length === 0 && (
          <div className="bg-white p-5 rounded-4 border text-center my-4 shadow-sm" style={{ borderColor: 'var(--border-light)' }}>
            <div
              className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-4"
              style={{ width: '70px', height: '70px', backgroundColor: 'var(--bg-sand)', color: 'var(--primary-brown)' }}
            >
              <i className="bi bi-search fs-3"></i>
            </div>
            <h4 className="font-serif fw-bold mb-2 text-dark">No Items Found Matching Your Filter</h4>
            <p className="text-muted mx-auto mb-4" style={{ maxWidth: '440px', fontSize: '0.92rem', lineHeight: 1.7 }}>
              We could not find any active community listings matching your search parameters. Try removing filters or searching with different keywords.
            </p>
            <button onClick={handleResetFilters} className="btn-nordic-primary px-4 py-2">
              <i className="bi bi-arrow-counterclockwise me-1.5"></i> Clear All Filters
            </button>
          </div>
        )}

        {/* Responsive Items Grid (Dynamic Cards) */}
        {!isLoading && items.length > 0 && (
          <div className="row g-4 g-lg-5 mb-5">
            {items.map(item => (
              <div key={item.id} className="col-12 col-sm-6 col-lg-3">
                <div
                  className="nordic-item-card h-100"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/item/${item.id}`)}
                >
                  {/* Image & Badges */}
                  <div className="card-img-container">
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80';
                      }}
                    />
                    
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
                      title={favorites[item.id] ? 'Remove from favorites' : 'Save to favorites'}
                    >
                      <i className={`bi ${favorites[item.id] ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                    </button>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 d-flex flex-column flex-grow-1">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span
                        className="text-uppercase fw-semibold"
                        style={{ fontSize: '0.72rem', letterSpacing: '0.10em', color: 'var(--text-muted)' }}
                      >
                        {item.categoryName}
                      </span>
                      <span className="text-muted" style={{ fontSize: '0.74rem' }}>
                        {item.createdAt}
                      </span>
                    </div>

                    <h5
                      className="card-title fw-semibold text-dark mb-2 text-truncate-2"
                      style={{ fontSize: '1.02rem', lineHeight: 1.5, minHeight: '3em' }}
                    >
                      {item.title}
                    </h5>

                    {/* Defect Disclosure Notice Badge */}
                    {item.defects && (
                      <div className="mb-2.5">
                        <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle" style={{ fontSize: '0.72rem' }}>
                          <i className="bi bi-exclamation-circle me-1"></i> Defect Disclosed
                        </span>
                      </div>
                    )}

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
                          src={item.owner?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80'}
                          alt={item.owner?.name || 'Owner'}
                          className="rounded-circle border"
                          style={{ width: '28px', height: '28px', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80';
                          }}
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

        {/* Dynamic Server-Side Pagination Controls */}
        {!isLoading && totalPages > 1 && (
          <div className="d-flex justify-content-center align-items-center gap-3 pt-4">
            <button
              onClick={() => updateParam({ page: Math.max(1, currentPage - 1) })}
              disabled={currentPage <= 1}
              className="btn btn-sm btn-outline-secondary px-4 py-2"
              style={{ fontSize: '0.88rem' }}
            >
              <i className="bi bi-chevron-left me-1"></i> Previous
            </button>

            <div className="d-flex gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => updateParam({ page: i + 1 })}
                  className={`btn btn-sm ${currentPage === i + 1 ? 'btn-nordic-primary' : 'btn-outline-secondary'}`}
                  style={{ width: '40px', height: '40px' }}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => updateParam({ page: Math.min(totalPages, currentPage + 1) })}
              disabled={currentPage >= totalPages}
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
