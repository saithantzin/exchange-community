import React from 'react';
import { TESTIMONIALS_DATA } from '../data/mockData';

export default function TestimonialsSection() {
  return (
    <section className="py-5" style={{ backgroundColor: '#FAF7F2', borderTop: '1px solid var(--border-light)' }}>
      <div className="container-xl">
        
        {/* Section Header */}
        <div className="d-flex flex-wrap justify-content-between align-items-end mb-4 pb-2 border-bottom" style={{ borderColor: 'var(--border-light)' }}>
          <div>
            <span className="section-pre-title">What Our Members Say</span>
            <h2 className="section-main-title mb-0">Loved in Real Neighborhoods</h2>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="badge rounded-pill bg-light text-dark border px-3 py-2" style={{ fontSize: '0.8rem' }}>
              <i className="bi bi-star-fill text-warning me-1"></i> 4.9 Average Community Rating
            </span>
          </div>
        </div>

        {/* Testimonial Cards Grid matching Reference Image */}
        <div className="row g-4">
          {TESTIMONIALS_DATA.map((t) => (
            <div key={t.id} className="col-12 col-md-4">
              <div
                className="bg-white p-4 rounded-3 border h-100 d-flex flex-column shadow-sm"
                style={{ borderColor: 'var(--border-light)', transition: 'transform 0.25s ease' }}
              >
                {/* User Header */}
                <div className="d-flex align-items-center gap-3 mb-3">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="rounded-circle"
                    style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                  />
                  <div>
                    <h6 className="mb-0 fw-bold text-dark" style={{ fontSize: '0.96rem' }}>
                      {t.name}
                    </h6>
                    <span className="text-muted" style={{ fontSize: '0.80rem' }}>
                      {t.city} • <span className="text-success"><i className="bi bi-patch-check-fill"></i> Verified Swapper</span>
                    </span>
                  </div>
                </div>

                {/* Stars */}
                <div className="mb-3 text-warning" style={{ fontSize: '0.9rem' }}>
                  {[...Array(t.rating)].map((_, i) => (
                    <i key={i} className="bi bi-star-fill me-1"></i>
                  ))}
                </div>

                {/* Exchange summary badge */}
                <div className="p-2.5 px-3 rounded mb-3 bg-light" style={{ fontSize: '0.82rem', border: '1px solid var(--border-light)' }}>
                  <i className="bi bi-arrow-left-right text-muted me-1.5"></i>
                  <span className="fw-medium text-dark">{t.exchangeSummary}</span>
                </div>

                {/* Comment */}
                <p className="text-muted mb-0 fst-italic" style={{ fontSize: '0.88rem', lineHeight: 1.75 }}>
                  "{t.comment}"
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
