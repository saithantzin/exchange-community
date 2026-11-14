import React, { useEffect, useState } from 'react';
import reviewService from '../services/reviewService';

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState({
    reviews: [],
    averageRating: null,
    reviewCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadTestimonials = async () => {
      try {
        const data = await reviewService.getTestimonials();
        if (isMounted) {
          setTestimonials(data);
        }
      } catch (error) {
        console.error('Failed to load homepage testimonials:', error);
        if (isMounted) {
          setLoadError('Community reviews are temporarily unavailable.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadTestimonials();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="py-5" style={{ backgroundColor: '#FAF7F2', borderTop: '1px solid var(--border-light)' }}>
      <div className="container-xl">
        <div className="d-flex flex-wrap justify-content-between align-items-end mb-4 pb-2 border-bottom" style={{ borderColor: 'var(--border-light)' }}>
          <div>
            <span className="section-pre-title">What Our Members Say</span>
            <h2 className="section-main-title mb-0">Loved in Real Neighborhoods</h2>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="badge rounded-pill bg-light text-dark border px-3 py-2" style={{ fontSize: '0.8rem' }}>
              <i className="bi bi-star-fill text-warning me-1"></i>
              {isLoading
                ? 'Loading community rating...'
                : loadError
                  ? 'Community rating unavailable'
                  : testimonials.averageRating === null
                ? 'No community ratings yet'
                : `${Number(testimonials.averageRating).toFixed(1)} Average Community Rating`}
            </span>
          </div>
        </div>

        <div className="row g-4">
          {isLoading ? (
            <div className="col-12 text-center text-muted py-4" role="status">
              <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
              Loading member reviews...
            </div>
          ) : loadError ? (
            <div className="col-12">
              <div className="alert alert-warning mb-0" role="alert">{loadError}</div>
            </div>
          ) : testimonials.reviews.length === 0 ? (
            <div className="col-12 text-center text-muted py-4">
              No reviews from completed exchanges yet.
            </div>
          ) : testimonials.reviews.map((review) => (
            <div key={review.id} className="col-12 col-md-4">
              <div
                className="bg-white p-4 rounded-3 border h-100 d-flex flex-column shadow-sm"
                style={{ borderColor: 'var(--border-light)', transition: 'transform 0.25s ease' }}
              >
                <div className="d-flex align-items-center gap-3 mb-3">
                  {review.avatar ? (
                    <img
                      src={review.avatar}
                      alt=""
                      className="rounded-circle"
                      style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      className="rounded-circle bg-light d-flex align-items-center justify-content-center text-secondary"
                      style={{ width: '48px', height: '48px' }}
                      aria-hidden="true"
                    >
                      <i className="bi bi-person-fill"></i>
                    </div>
                  )}
                  <div>
                    <h6 className="mb-0 fw-bold text-dark" style={{ fontSize: '0.96rem' }}>
                      {review.name}
                    </h6>
                    <span className="text-muted" style={{ fontSize: '0.80rem' }}>
                      {review.city} • <span className="text-success"><i className="bi bi-patch-check-fill"></i> Verified Swapper</span>
                    </span>
                  </div>
                </div>

                <div className="mb-3 text-warning" style={{ fontSize: '0.9rem' }} aria-label={`${review.rating} out of 5 stars`}>
                  {Array.from({ length: Number(review.rating) }, (_, index) => (
                    <i key={index} className="bi bi-star-fill me-1"></i>
                  ))}
                </div>

                <div className="p-2.5 px-3 rounded mb-3 bg-light" style={{ fontSize: '0.82rem', border: '1px solid var(--border-light)' }}>
                  <i className="bi bi-arrow-left-right text-muted me-1.5"></i>
                  <span className="fw-medium text-dark">{review.exchangeSummary}</span>
                </div>

                <p className="text-muted mb-0 fst-italic" style={{ fontSize: '0.88rem', lineHeight: 1.75 }}>
                  "{review.comment}"
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
