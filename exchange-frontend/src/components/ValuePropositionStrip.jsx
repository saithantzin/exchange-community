import React from 'react';

export default function ValuePropositionStrip() {
  const values = [
    {
      icon: 'bi-tree',
      title: 'Mindful Circular Reuse',
      desc: 'Extend the lifespan of useful things & reduce waste'
    },
    {
      icon: 'bi-geo-alt',
      title: 'Safe Local Meetups',
      desc: 'Direct handovers in comfortable public community spots'
    },
    {
      icon: 'bi-shield-check',
      title: 'Direct Physical Inspection',
      desc: 'Inspect items in person before completing the trade'
    },
    {
      icon: 'bi-patch-check',
      title: 'Honest Condition Logs',
      desc: 'Unedited photos & admin dispute assistance'
    }
  ];

  return (
    <div className="features-strip">
      <div className="container-xl">
        <div className="row g-4 g-lg-5 justify-content-between">
          {values.map((v, index) => (
            <div key={index} className="col-12 col-sm-6 col-lg-3">
              <div className="feature-badge-item">
                <div className="feature-badge-icon">
                  <i className={`bi ${v.icon}`}></i>
                </div>
                <div>
                  <h6 className="mb-2 fw-bold text-dark" style={{ fontSize: '0.98rem', letterSpacing: '0.01em' }}>
                    {v.title}
                  </h6>
                  <p className="mb-0 text-muted" style={{ fontSize: '0.84rem', lineHeight: 1.6 }}>
                    {v.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
