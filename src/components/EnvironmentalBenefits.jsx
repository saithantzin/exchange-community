import React from 'react';
import { PLATFORM_STATS } from '../data/mockData';

export default function EnvironmentalBenefits() {
  return (
    <section className="py-5" style={{ backgroundColor: 'var(--bg-warm)' }}>
      <div className="container-xl">
        <div
          className="p-4 p-md-5 rounded-3 position-relative overflow-hidden"
          style={{
            backgroundColor: '#ECE3D6',
            border: '1px solid var(--border-medium)'
          }}
        >
          <div className="row g-4 align-items-center">
            
            <div className="col-lg-6">
              <span className="section-pre-title text-success fw-bold" style={{ color: 'var(--eco-green) !important' }}>
                <i className="bi bi-recycle me-1"></i> Circular Economy Impact
              </span>
              <h2 className="section-main-title mb-3 font-serif">
                Small Daily Choices Make a Real Difference
              </h2>
              <p className="text-muted mb-4" style={{ fontSize: '0.98rem', lineHeight: 1.8 }}>
                Every desk, laptop, book, or jacket kept in circulation means one fewer manufactured item shipped and disposed of in landfills. By empowering citizens in Mandalay and Yangon to trade usable goods locally, we build conscious habits and reduce municipal waste.
              </p>

              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0"
                  style={{ width: '44px', height: '44px', backgroundColor: 'var(--primary-brown)', fontSize: '1.1rem' }}
                >
                  <i className="bi bi-heart-pulse"></i>
                </div>
                <div>
                  <h6 className="mb-1 fw-bold text-dark" style={{ fontSize: '0.94rem' }}>
                    100% Non-Profit Community Initiative
                  </h6>
                  <p className="mb-0 text-muted" style={{ fontSize: '0.85rem', lineHeight: 1.55 }}>
                    Designed by university researchers to study peer-to-peer circularity.
                  </p>
                </div>
              </div>
            </div>

            {/* Real Platform Counters */}
            <div className="col-lg-6">
              <div className="row g-3">
                <div className="col-6">
                  <div className="bg-white p-3 p-md-4 rounded-3 border text-center h-100 shadow-sm" style={{ borderColor: 'var(--border-light)' }}>
                    <div className="h2 font-serif fw-bold mb-1" style={{ color: 'var(--primary-brown)' }}>
                      {PLATFORM_STATS.itemsExchanged}
                    </div>
                    <div className="fw-semibold text-dark mb-1" style={{ fontSize: '0.88rem' }}>
                      Items Kept in Use
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.80rem' }}>
                      Across Mandalay & Yangon
                    </div>
                  </div>
                </div>

                <div className="col-6">
                  <div className="bg-white p-3 p-md-4 rounded-3 border text-center h-100 shadow-sm" style={{ borderColor: 'var(--border-light)' }}>
                    <div className="h2 font-serif fw-bold mb-1" style={{ color: 'var(--eco-green)' }}>
                      {PLATFORM_STATS.landfillWastePreventedKg} kg
                    </div>
                    <div className="fw-semibold text-dark mb-1" style={{ fontSize: '0.88rem' }}>
                      Waste Diverted
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.80rem' }}>
                      Calculated from reported weight
                    </div>
                  </div>
                </div>

                <div className="col-6">
                  <div className="bg-white p-3 p-md-4 rounded-3 border text-center h-100 shadow-sm" style={{ borderColor: 'var(--border-light)' }}>
                    <div className="h2 font-serif fw-bold mb-1" style={{ color: 'var(--primary-brown)' }}>
                      {PLATFORM_STATS.activeMembers}
                    </div>
                    <div className="fw-semibold text-dark mb-1" style={{ fontSize: '0.88rem' }}>
                      Active Households
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.80rem' }}>
                      Participating members
                    </div>
                  </div>
                </div>

                <div className="col-6">
                  <div className="bg-white p-3 p-md-4 rounded-3 border text-center h-100 shadow-sm" style={{ borderColor: 'var(--border-light)' }}>
                    <div className="h2 font-serif fw-bold mb-1" style={{ color: 'var(--eco-green)' }}>
                      {PLATFORM_STATS.co2SavedTons} t
                    </div>
                    <div className="fw-semibold text-dark mb-1" style={{ fontSize: '0.88rem' }}>
                      CO₂e Spared
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.80rem' }}>
                      Estimated manufacturing offsets
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
