import React from 'react';

export default function HowItWorksSection({ onGetStartedClick }) {
  const steps = [
    {
      number: '01',
      icon: 'bi-person-plus',
      title: 'Create an Account',
      description: 'Sign up with your verified local phone number or email. Choose your home base in Mandalay or Yangon to connect with neighbors.'
    },
    {
      number: '02',
      icon: 'bi-camera',
      title: 'List an Unused Item',
      description: 'Upload honest, daylight photos and specify your item condition (New, Like New, Good, Fair, Poor). Note what you would love in return.'
    },
    {
      number: '03',
      icon: 'bi-arrow-left-right',
      title: 'Propose an Exchange',
      description: 'Browse available listings or get matched through our engine. Send a polite swap request with your offered item and meetup preference.'
    },
    {
      number: '04',
      icon: 'bi-patch-check-fill',
      title: 'Handover & Verification',
      description: 'Meet in-person for same-city swaps, or dispatch via registered courier with Two-Sided Completion for other cities.'
    }
  ];

  return (
    <section id="how-it-works" className="py-5" style={{ backgroundColor: 'var(--bg-warm)' }}>
      <div className="container-xl py-3">
        
        {/* Section Header */}
        <div className="text-center max-w-700 mx-auto mb-5" style={{ maxWidth: '680px' }}>
          <span className="section-pre-title text-center">Simple, Circular Process</span>
          <h2 className="section-main-title text-center mb-3">How It Works in 4 Steps</h2>
          <p className="text-muted" style={{ fontSize: '0.98rem', lineHeight: 1.75 }}>
            A secure peer-to-peer bartering system designed for transparency, environmental responsibility, and genuine community trust.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="row g-4 g-lg-5 position-relative">
          {steps.map((step, index) => (
            <div key={index} className="col-12 col-sm-6 col-lg-3">
              <div
                className="bg-white p-4 rounded-3 border h-100 d-flex flex-column shadow-sm position-relative"
                style={{ borderColor: 'var(--border-light)', transition: 'all 0.3s ease' }}
              >
                {/* Step Number Tag */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{
                      width: '52px',
                      height: '52px',
                      backgroundColor: 'var(--bg-sand)',
                      color: 'var(--primary-brown)',
                      fontSize: '1.35rem'
                    }}
                  >
                    <i className={`bi ${step.icon}`}></i>
                  </div>
                  <span
                    className="font-serif fw-bold text-muted"
                    style={{ fontSize: '1.65rem', opacity: 0.35 }}
                  >
                    {step.number}
                  </span>
                </div>

                <h5 className="fw-bold text-dark mb-3 font-serif" style={{ fontSize: '1.18rem', lineHeight: 1.35 }}>
                  {step.title}
                </h5>

                <p className="text-muted mb-0" style={{ fontSize: '0.9rem', lineHeight: 1.7 }}>
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Crucial Safety Rule Alert Box */}
        <div
          className="mt-5 p-4 p-md-5 rounded-3 text-center mx-auto"
          style={{ backgroundColor: '#ECE3D6', border: '1px solid var(--border-medium)', maxWidth: '860px' }}
        >
          <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
            <i className="bi bi-shield-check text-brown fs-4" style={{ color: 'var(--primary-brown)' }}></i>
            <h5 className="mb-0 fw-bold font-serif" style={{ color: 'var(--primary-brown)' }}>
              Core Community Rule: Local Handover &amp; Intercity Dual Confirmation
            </h5>
          </div>
          <p className="mb-0 text-muted" style={{ fontSize: '0.92rem', lineHeight: 1.75, maxWidth: '720px', margin: '0 auto' }}>
            For <strong>same-city swaps</strong>, members meet directly in public places without needing couriers. For <strong>other-city swaps</strong>, parcels are dispatched via registered courier and completed only after <strong>both members confirm receipt</strong>.
          </p>
        </div>

      </div>
    </section>
  );
}
