import React from 'react';
import { CATEGORIES } from '../data/mockData';

export default function BrowseCategories({ selectedCategory, onSelectCategory }) {
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
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <div key={cat.id} className="col-6 col-sm-4 col-md-2">
                <div
                  className="category-circle-wrapper"
                  onClick={() => onSelectCategory(cat.id)}
                  title={`Browse ${cat.name}`}
                >
                  <div
                    className="category-circle-img-box"
                    style={{
                      border: isActive ? '2px solid var(--primary-brown)' : '1px solid var(--border-light)',
                      boxShadow: isActive ? '0 8px 20px rgba(92, 64, 51, 0.22)' : 'none'
                    }}
                  >
                    <img src={cat.image} alt={cat.name} />
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
