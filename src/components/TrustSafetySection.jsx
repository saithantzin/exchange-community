import React from 'react';

export default function TrustSafetySection() {
  const safetyFeatures = [
    {
      icon: 'bi-camera-fill',
      title: 'Mandatory Unedited Photos',
      desc: 'Stock photos are prohibited. All listings require authentic photos showcasing angles, tags, and any cosmetic flaws.'
    },
    {
      icon: 'bi-geo-alt-fill',
      title: 'Local In-Person Meetups',
      desc: 'Same-city swaps take place directly at safe, public community spots such as cafes and malls without needing couriers.'
    },
    {
      icon: 'bi-truck',
      title: 'Intercity Courier & Tracking',
      desc: 'For exchanges with other cities, registered couriers and live airway tracking numbers ensure safe long-distance transit.'
    },
    {
      icon: 'bi-check2-circle',
      title: 'Two-Sided Completion Rule',
      desc: 'Intercity trades are only marked completed when both members independently inspect and confirm receipt of their parcel.'
    },
    {
      icon: 'bi-flag-fill',
      title: '1-Click Report & Flagging',
      desc: 'Community members can instantly flag fraudulent listings, inaccurate condition tags, or no-show participants.'
    },
    {
      icon: 'bi-person-badge-fill',
      title: 'Human Admin Dispute Review',
      desc: 'In case of disagreement, our platform moderators inspect chat history, listing descriptions, and photo logs to resolve issues fairly.'
    }
  ];

  return (
    <section id="safety" className="py-5" style={{ backgroundColor: '#FAF7F2', borderTop: '1px solid var(--border-light)' }}>
      <div className="container-xl">
        <div className="row g-4 align-items-center">
          
          {/* Left Visual Banner with Scandinavian Green / Forest aesthetic (matching reference image) */}
          <div className="col-lg-5">
            <div
              className="p-4 p-md-5 rounded-3 text-white h-100 d-flex flex-column justify-content-between position-relative overflow-hidden shadow-sm"
              style={{
                backgroundColor: '#3F352B',
                backgroundImage: 'linear-gradient(rgba(45, 36, 28, 0.85), rgba(45, 36, 28, 0.95)), url("https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                minHeight: '440px'
              }}
            >
              <div>
                <span className="badge px-3 py-2 mb-3" style={{ backgroundColor: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(4px)', fontSize: '0.78rem', letterSpacing: '0.12em' }}>
                  PEACE OF MIND
                </span>
                <h3 className="font-serif fw-bold display-6 mb-3" style={{ lineHeight: 1.32 }}>
                  Safe Exchanging, Built on Respect.
                </h3>
                <p className="text-white-50 mb-4" style={{ fontSize: '0.96rem', lineHeight: 1.8 }}>
                  Community commerce thrives when expectations are clear. We give members the verification tools needed to trade with fellow citizens in Mandalay and Yangon safely.
                </p>
              </div>

              {/* Honest Disclaimer (Requirement 2.H) */}
              <div
                className="p-4 rounded-3 mt-4"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
              >
                <div className="d-flex align-items-center gap-2 mb-2">
                  <i className="bi bi-info-circle text-warning fs-6"></i>
                  <span className="fw-bold" style={{ fontSize: '0.88rem' }}>Honest Platform Notice</span>
                </div>
                <p className="mb-0 text-white-50" style={{ fontSize: '0.84rem', lineHeight: 1.65 }}>
                  While our systems enforce photo integrity, shipping evidence, and dispute review, no platform can guarantee item authenticity or prevent every possible scam. Always inspect goods in a public place before confirming.
                </p>
              </div>
            </div>
          </div>

          {/* Right Safety Feature Cards */}
          <div className="col-lg-7">
            <div className="ps-lg-3">
              <span className="section-pre-title">Trust & Safety Guidelines</span>
              <h2 className="section-main-title mb-4">Five Pillars of Safe Community Swaps</h2>

              <div className="row g-3">
                {safetyFeatures.map((item, index) => (
                  <div key={index} className="col-12 col-md-6">
                    <div className="trust-card p-4">
                      <div className="d-flex align-items-center gap-3 mb-2">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0"
                          style={{ width: '38px', height: '38px', backgroundColor: 'var(--primary-brown)', fontSize: '1rem' }}
                        >
                          <i className={`bi ${item.icon}`}></i>
                        </div>
                        <h6 className="mb-0 fw-bold text-dark" style={{ fontSize: '0.95rem', lineHeight: 1.4 }}>
                          {item.title}
                        </h6>
                      </div>
                      <p className="mb-0 text-muted" style={{ fontSize: '0.86rem', lineHeight: 1.65 }}>
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
