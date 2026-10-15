import React from 'react';

export default function DualBannerSection({ onExploreIntercity, onExploreHousehold }) {
  return (
    <section className="py-4" style={{ backgroundColor: 'var(--bg-warm)' }}>
      <div className="container-xl">
        <div className="row g-4 g-lg-5">
          
          {/* Banner 1: Intercity Exchange Spotlight */}
          <div className="col-12 col-md-6">
            <div
              className="dual-banner-card shadow-sm"
              style={{
                backgroundImage: 'url("https://images.unsplash.com/photo-1513694203232-719a280e022f?w=900&q=80")',
                backgroundColor: '#3E342B'
              }}
            >
              <div className="dual-banner-content">
                <span
                  className="badge mb-3 px-3 py-1.5"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.22)',
                    backdropFilter: 'blur(8px)',
                    fontSize: '0.76rem',
                    letterSpacing: '0.1em'
                  }}
                >
                  FEATURED NETWORK
                </span>
                <h3 className="text-white font-serif fw-bold mb-3" style={{ fontSize: '1.85rem', lineHeight: 1.35 }}>
                  Mandalay ⇄ Yangon <br />Intercity Swaps
                </h3>
                <p className="text-white-50 mb-4" style={{ fontSize: '0.94rem', maxWidth: '420px', lineHeight: 1.75 }}>
                  Can't find what you need in your neighborhood? Exchange with trusted members across MDY and YGN with verified tracking.
                </p>
                <button
                  onClick={onExploreIntercity}
                  className="btn btn-light fw-medium px-4 py-2"
                  style={{ borderRadius: '6px', fontSize: '0.88rem', color: 'var(--primary-brown)', letterSpacing: '0.02em' }}
                >
                  Explore Intercity Listings <i className="bi bi-arrow-right ms-2"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Banner 2: Sustainable Home & Study Essentials */}
          <div className="col-12 col-md-6">
            <div
              className="dual-banner-card shadow-sm"
              style={{
                backgroundImage: 'url("https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=900&q=80")',
                backgroundColor: '#4A3D31'
              }}
            >
              <div className="dual-banner-content">
                <span
                  className="badge mb-3 px-3 py-1.5"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.22)',
                    backdropFilter: 'blur(8px)',
                    fontSize: '0.76rem',
                    letterSpacing: '0.1em'
                  }}
                >
                  SUSTAINABLE LIVING
                </span>
                <h3 className="text-white font-serif fw-bold mb-3" style={{ fontSize: '1.85rem', lineHeight: 1.35 }}>
                  Calmer Spaces. <br />Conscious Exchanges.
                </h3>
                <p className="text-white-50 mb-4" style={{ fontSize: '0.94rem', maxWidth: '420px', lineHeight: 1.75 }}>
                  Declutter pre-loved furniture, study tools, and home ceramics while receiving things that spark joy in your home.
                </p>
                <button
                  onClick={onExploreHousehold}
                  className="btn btn-light fw-medium px-4 py-2"
                  style={{ borderRadius: '6px', fontSize: '0.88rem', color: 'var(--primary-brown)', letterSpacing: '0.02em' }}
                >
                  Browse Home Items <i className="bi bi-arrow-right ms-2"></i>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
