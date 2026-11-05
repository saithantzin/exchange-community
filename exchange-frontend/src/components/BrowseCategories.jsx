import React from 'react';
import { useExchange } from '../context/ExchangeContext';
import { CATEGORIES as FALLBACK_CATEGORIES } from '../data/mockData';

const DEFAULT_CATEGORY_IMAGES = {
  'electronics': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&q=80',
  'electronics-gadgets': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&q=80',
  'books': 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=300&q=80',
  'fashion-accessories': 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=300&q=80',
  'clothing': 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=300&q=80',
  'home-furniture': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&q=80',
  'furniture': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&q=80',
  'sports-outdoors': 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=300&q=80',
  'kitchen-appliances': 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=300&q=80',
  'household': 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=300&q=80',
  'cameras-optics': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&q=80',
  'musical-instruments': 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=300&q=80',
};

export default function BrowseCategories({ selectedCategory, onSelectCategory }) {
  const { categories } = useExchange();

  // Use dynamic categories if loaded, otherwise fallback
  const displayCategories = categories && categories.length > 0
    ? categories.slice(0, 6).map(c => ({
        id: c.slug || c.id,
        name: c.name,
        count: `${c.items_count || 0} listings`,
        image: DEFAULT_CATEGORY_IMAGES[c.slug] || DEFAULT_CATEGORY_IMAGES[c.name?.toLowerCase()] || 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=300&q=80'
      }))
    : FALLBACK_CATEGORIES;

  return (
    <section id="categories" className="py-5" style={{ backgroundColor: '#FAF7F2' }}>
      <div className="container-xl">
        {/* Section Header */}
        <div className="d-flex flex-wrap justify-content-between align-items-end mb-5 pb-3 border-bottom" style={{ borderColor: 'var(--border-light)' }}>
          <div>
            <span className="section-pre-title">Shop by Category</span>
            <h2 className="section-main-title mb-0">Browse Items for Every Need</h2>
          </div>
          <button
            onClick={() => onSelectCategory('all')}
            className="btn btn-link text-decoration-none p-0 fw-semibold mt-2 mt-md-0"
            style={{ color: 'var(--primary-brown)', fontSize: '0.92rem' }}
          >
            View all categories <i className="bi bi-arrow-right ms-1"></i>
          </button>
        </div>

        {/* Circular Category Row matching Reference Image */}
        <div className="row g-4 g-lg-5 justify-content-center text-center">
          {displayCategories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <div key={cat.id} className="col-6 col-sm-4 col-md-2">
                <div
                  className="category-circle-wrapper"
                  onClick={() => onSelectCategory(cat.id)}
                  title={`Browse ${cat.name}`}
                  style={{ cursor: 'pointer' }}
                >
                  <div
                    className="category-circle-img-box"
                    style={{
                      border: isActive ? '2px solid var(--primary-brown)' : '1px solid var(--border-light)',
                      boxShadow: isActive ? '0 8px 20px rgba(92, 64, 51, 0.22)' : 'none'
                    }}
                  >
                    <img
                      src={cat.image}
                      alt={cat.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=300&q=80';
                      }}
                    />
                  </div>
                  <h6
                    className="category-circle-name mb-1"
                    style={{
                      fontWeight: isActive ? 700 : 600,
                      color: isActive ? 'var(--primary-brown)' : 'var(--text-main)',
                      fontSize: '0.95rem',
                      lineHeight: 1.4
                    }}
                  >
                    {cat.name}
                  </h6>
                  <span className="text-muted d-block" style={{ fontSize: '0.78rem', letterSpacing: '0.02em' }}>
                    {cat.count}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
