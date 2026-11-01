import React from 'react';
import { Link } from 'react-router-dom';

export default function HowItWorksPage() {
  const steps = [
    {
      num: '01',
      title: 'Sign Up & Select Your City',
      icon: 'bi-person-check',
      desc: 'Create your account and select your city. Your private contact details are kept strictly secure and never exposed on public item listings.'
    },
    {
      num: '02',
      title: 'List an Unused Item with Honest Photos',
      icon: 'bi-camera',
      desc: 'Take real daylight photos showing all angles. Honestly describe the item condition (New, Like New, Good, Fair) and specify what you would love in return.'
    },
    {
      num: '03',
      title: 'Discover & Propose Swaps',
      icon: 'bi-arrow-left-right',
      desc: 'Browse items or let our matching engine connect you with mutual trade partners. Send a clear swap request specifying which of your items you offer.'
    },
    {
      num: '04',
      title: 'Handover & Intercity Dispatch',
      icon: 'bi-geo-alt-fill',
      desc: 'Meet safely in person for same-city swaps. For other cities, connect via social channels (Facebook, Viber, Telegram) to coordinate courier dispatch & waybill tracking.'
    }
  ];

  return (
    <div className="py-5" style={{ backgroundColor: 'var(--bg-warm)', minHeight: '80vh' }}>
      <div className="container-xl">
        
        {/* Header */}
        <div className="text-center max-w-700 mx-auto mb-5" style={{ maxWidth: '680px' }}>
          <span className="section-pre-title text-center">Process & Protocols</span>
          <h1 className="font-serif fw-bold display-5 mb-3" style={{ lineHeight: 1.3 }}>How Bartering Works Safely</h1>
          <p className="lead text-muted" style={{ fontSize: '1.05rem', lineHeight: 1.8 }}>
            A sustainable, money-free community exchange platform connecting members nationwide to reuse pre-loved items with complete peace of mind.
          </p>
        </div>

        {/* 4-Step Process Grid */}
        <div className="row g-4 mb-5">
          {steps.map((s, idx) => (
            <div key={idx} className="col-12 col-sm-6 col-lg-3">
              <div
                className="bg-white p-4 rounded-3 border h-100 d-flex flex-column shadow-sm position-relative"
                style={{ borderColor: 'var(--border-light)' }}
              >
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center text-white"
                    style={{ width: '48px', height: '48px', backgroundColor: 'var(--primary-brown)', fontSize: '1.25rem' }}
                  >
                    <i className={`bi ${s.icon}`}></i>
                  </div>
                  <span className="font-serif fw-bold text-muted" style={{ fontSize: '1.85rem', opacity: 0.35 }}>
                    {s.num}
                  </span>
                </div>

                <h5 className="font-serif fw-bold text-dark mb-2" style={{ fontSize: '1.2rem', lineHeight: 1.35 }}>
                  {s.title}
                </h5>

                <p className="text-muted mb-0" style={{ fontSize: '0.90rem', lineHeight: 1.75 }}>
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Safety & Handover Rules Section (Same City vs Other City) */}
        <div className="bg-white p-4 p-md-5 rounded-3 border shadow-sm mb-5" style={{ borderColor: 'var(--border-light)' }}>
          <div className="text-center mb-5" style={{ maxWidth: '720px', margin: '0 auto' }}>
            <span className="section-pre-title text-primary fw-bold">Flexible Handover Standards</span>
            <h2 className="font-serif fw-bold mb-3">Same-City vs. Other-City Exchanges</h2>
            <p className="text-muted" style={{ fontSize: '0.96rem', lineHeight: 1.75 }}>
              Our platform adapts the exchange process based on participant location to keep things simple for neighbors and completely secure across cities.
            </p>
          </div>

          <div className="row g-4">
            {/* Same City (In-Person Meetup) */}
            <div className="col-12 col-lg-6">
              <div className="p-4 rounded-3 h-100 border" style={{ backgroundColor: '#FAF8F5', borderColor: 'var(--border-medium)' }}>
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div className="rounded-circle d-flex align-items-center justify-content-center text-white" style={{ width: '40px', height: '40px', backgroundColor: 'var(--primary-brown)' }}>
                    <i className="bi bi-geo-alt-fill"></i>
                  </div>
                  <div>
                    <h5 className="font-serif fw-bold text-dark mb-0">1. Same-City Handover (In-Person)</h5>
                    <span className="badge bg-success-subtle text-success small">No Courier Needed</span>
                  </div>
                </div>

                <p className="text-muted small mb-3" style={{ lineHeight: 1.7 }}>
                  When two members are located in the same city, there is no need for courier tracking or complicated multi-stage parcel progress:
                </p>

                <ul className="list-unstyled d-flex flex-column gap-2.5 text-muted small mb-0" style={{ lineHeight: 1.65 }}>
                  <li className="d-flex align-items-start gap-2">
                    <i className="bi bi-check-circle-fill text-success mt-0.5"></i>
                    <span><strong>Meet in Public:</strong> Coordinate a safe, well-lit public spot such as a cafe, mall, or community center.</span>
                  </li>
                  <li className="d-flex align-items-start gap-2">
                    <i className="bi bi-check-circle-fill text-success mt-0.5"></i>
                    <span><strong>Direct Inspection:</strong> Inspect items face-to-face on the spot before handing over.</span>
                  </li>
                  <li className="d-flex align-items-start gap-2">
                    <i className="bi bi-check-circle-fill text-success mt-0.5"></i>
                    <span><strong>Single-Click Completion:</strong> Mark the swap as completed immediately with 1 click in the app.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Other City (Intercity Courier & Two-Sided Completion) */}
            <div className="col-12 col-lg-6">
              <div className="p-4 rounded-3 h-100 border" style={{ backgroundColor: '#F4F7F9', borderColor: '#C8D8E4' }}>
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div className="rounded-circle d-flex align-items-center justify-content-center text-white" style={{ width: '40px', height: '40px', backgroundColor: '#2C5B7C' }}>
                    <i className="bi bi-truck"></i>
                  </div>
                  <div>
                    <h5 className="font-serif fw-bold text-dark mb-0">2. Other-City Handover (Intercity Express)</h5>
                    <span className="badge bg-primary-subtle text-primary small">Two-Sided Completion Required</span>
                  </div>
                </div>

                <p className="text-muted small mb-3" style={{ lineHeight: 1.7 }}>
                  When members exchange items between different cities (e.g. Mandalay ⇄ Yangon), the platform activates our secure intercity shipping protocol:
                </p>

                <ul className="list-unstyled d-flex flex-column gap-2.5 text-muted small mb-0" style={{ lineHeight: 1.65 }}>
                  <li className="d-flex align-items-start gap-2">
                    <i className="bi bi-chat-heart-fill text-primary mt-0.5"></i>
                    <span><strong>Direct Social Account Coordination:</strong> Connect directly via Facebook, Viber, or Telegram to coordinate delivery preferences and exchange parcel packing videos.</span>
                  </li>
                  <li className="d-flex align-items-start gap-2">
                    <i className="bi bi-truck text-primary mt-0.5"></i>
                    <span><strong>Registered Courier Express:</strong> Dispatch via verified carriers (Royal Express, Elite Cargo, Aung Express) and record waybill tracking & receipt slip.</span>
                  </li>
                  <li className="d-flex align-items-start gap-2">
                    <i className="bi bi-shield-check text-primary mt-0.5"></i>
                    <span><strong>Two-Sided Confirmation:</strong> Member A and Member B each receive their parcel and independently inspect the items.</span>
                  </li>
                  <li className="d-flex align-items-start gap-2">
                    <i className="bi bi-check-circle-fill text-primary mt-0.5"></i>
                    <span><strong>Finalized Only When Both Confirm:</strong> The intercity trade is officially Completed only after both sides confirm receipt.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Dedicated Intercity Social Contact & Shipping Instructions Guide */}
        <div className="bg-white p-4 p-md-5 rounded-3 border shadow-sm mb-5" style={{ borderColor: 'var(--border-light)' }}>
          <div className="text-center mb-5" style={{ maxWidth: '760px', margin: '0 auto' }}>
            <span className="section-pre-title text-primary fw-bold">Intercity Communication Protocol</span>
            <h2 className="font-serif fw-bold mb-3">How to Connect with Partners in Other Cities</h2>
            <p className="text-muted" style={{ fontSize: '0.96rem', lineHeight: 1.75 }}>
              Trading between Yangon, Mandalay, Naypyidaw, Mawlamyine, or Taunggyi? Follow our verified social coordination steps using Facebook, Viber, or Telegram for a seamless, trustworthy swap.
            </p>
          </div>

          {/* Social Channels 3-Card Row */}
          <div className="row g-4 mb-5">
            {/* Viber */}
            <div className="col-12 col-md-4">
              <div
                className="p-4 rounded-3 h-100 border text-center d-flex flex-column"
                style={{ backgroundColor: '#FAF6FE', borderColor: '#E5D6F9' }}
              >
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center text-white mx-auto mb-3 shadow-xs"
                  style={{ width: '56px', height: '56px', backgroundColor: '#7360F2', fontSize: '1.4rem' }}
                >
                  <i className="bi bi-telephone-fill"></i>
                </div>
                <h5 className="font-serif fw-bold text-dark mb-1">Viber Messenger</h5>
                <span className="badge mx-auto mb-3 px-2.5 py-1" style={{ backgroundColor: '#EDE5FC', color: '#5B41C7', fontSize: '0.74rem' }}>
                  Best for Live Coordination
                </span>
                <p className="text-muted small mb-0" style={{ lineHeight: 1.7 }}>
                  Use Viber to send direct messages, place quick verification voice calls, and share short 10-second daylight videos of the item functioning before packaging.
                </p>
              </div>
            </div>

            {/* Telegram */}
            <div className="col-12 col-md-4">
              <div
                className="p-4 rounded-3 h-100 border text-center d-flex flex-column"
                style={{ backgroundColor: '#F0F8FE', borderColor: '#CDE5FC' }}
              >
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center text-white mx-auto mb-3 shadow-xs"
                  style={{ width: '56px', height: '56px', backgroundColor: '#229ED9', fontSize: '1.4rem' }}
                >
                  <i className="bi bi-telegram"></i>
                </div>
                <h5 className="font-serif fw-bold text-dark mb-1">Telegram Handle</h5>
                <span className="badge mx-auto mb-3 px-2.5 py-1" style={{ backgroundColor: '#E1F1FD', color: '#106BA3', fontSize: '0.74rem' }}>
                  Best for HD Photos & Receipts
                </span>
                <p className="text-muted small mb-0" style={{ lineHeight: 1.7 }}>
                  Use Telegram to send uncompressed high-resolution photos of parcel bubble-wrap cushioning, outer box seals, and crystal-clear courier waybill slips.
                </p>
              </div>
            </div>

            {/* Facebook / Messenger */}
            <div className="col-12 col-md-4">
              <div
                className="p-4 rounded-3 h-100 border text-center d-flex flex-column"
                style={{ backgroundColor: '#F3F6FD', borderColor: '#CFDCF9' }}
              >
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center text-white mx-auto mb-3 shadow-xs"
                  style={{ width: '56px', height: '56px', backgroundColor: '#1877F2', fontSize: '1.4rem' }}
                >
                  <i className="bi bi-facebook"></i>
                </div>
                <h5 className="font-serif fw-bold text-dark mb-1">Facebook Profile</h5>
                <span className="badge mx-auto mb-3 px-2.5 py-1" style={{ backgroundColor: '#E3ECFD', color: '#0F56B3', fontSize: '0.74rem' }}>
                  Best for Trust Verification
                </span>
                <p className="text-muted small mb-0" style={{ lineHeight: 1.7 }}>
                  Inspect each other’s public profile, verify mutual community connections, and send direct Messenger confirmations for extra peace of mind.
                </p>
              </div>
            </div>
          </div>

          {/* Step-by-Step Intercity Handover Guide */}
          <div className="p-4 p-md-4 rounded-3 border" style={{ backgroundColor: '#FAF8F5', borderColor: 'var(--border-medium)' }}>
            <h5 className="font-serif fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-signpost-2-fill text-brown" style={{ color: 'var(--primary-brown)' }}></i>
              4-Step Intercity Contact & Shipping Instruction
            </h5>

            <div className="row g-3">
              <div className="col-12 col-md-6 col-lg-3">
                <div className="bg-white p-3 rounded-3 border h-100 shadow-2xs">
                  <div className="fw-bold text-dark mb-1 small d-flex align-items-center gap-1.5">
                    <span className="badge bg-secondary-subtle text-dark">Step 1</span>
                    <span>Accept & Reveal Profile</span>
                  </div>
                  <p className="text-muted small mb-0" style={{ fontSize: '0.82rem', lineHeight: 1.6 }}>
                    Once both sides agree on the swap, click <strong>"View Member Profile"</strong> to unlock their verified phone, Viber number, Telegram username, and Facebook profile.
                  </p>
                </div>
              </div>

              <div className="col-12 col-md-6 col-lg-3">
                <div className="bg-white p-3 rounded-3 border h-100 shadow-2xs">
                  <div className="fw-bold text-dark mb-1 small d-flex align-items-center gap-1.5">
                    <span className="badge bg-secondary-subtle text-dark">Step 2</span>
                    <span>Message & Share Video</span>
                  </div>
                  <p className="text-muted small mb-0" style={{ fontSize: '0.82rem', lineHeight: 1.6 }}>
                    Connect on Viber, Telegram, or Facebook Messenger. Send a 10-second video of the item powered on, plus photos of careful bubble wrap & box packaging.
                  </p>
                </div>
              </div>

              <div className="col-12 col-md-6 col-lg-3">
                <div className="bg-white p-3 rounded-3 border h-100 shadow-2xs">
                  <div className="fw-bold text-dark mb-1 small d-flex align-items-center gap-1.5">
                    <span className="badge bg-secondary-subtle text-dark">Step 3</span>
                    <span>Dispatch & Waybill Entry</span>
                  </div>
                  <p className="text-muted small mb-0" style={{ fontSize: '0.82rem', lineHeight: 1.6 }}>
                    Drop parcels off at <strong>Royal Express</strong>, <strong>Elite Cargo</strong>, or <strong>Aung Express</strong>. Take a photo of the receipt and enter the tracking number into ReCirculate.
                  </p>
                </div>
              </div>

              <div className="col-12 col-md-6 col-lg-3">
                <div className="bg-white p-3 rounded-3 border h-100 shadow-2xs">
                  <div className="fw-bold text-dark mb-1 small d-flex align-items-center gap-1.5">
                    <span className="badge bg-secondary-subtle text-dark">Step 4</span>
                    <span>Inspect & Dual Confirm</span>
                  </div>
                  <p className="text-muted small mb-0" style={{ fontSize: '0.82rem', lineHeight: 1.6 }}>
                    Receive and unbox your parcel. Inspect the item condition. Once both Member A and Member B tap <strong>"Confirm Receipt"</strong>, the swap is officially Completed!
                  </p>
                </div>
              </div>
            </div>

            {/* Safety Notice Note */}
            <div className="mt-3.5 pt-3 border-top d-flex align-items-start gap-2 text-muted small" style={{ fontSize: '0.82rem' }}>
              <i className="bi bi-shield-exclamation text-warning-emphasis fs-5 flex-shrink-0"></i>
              <span>
                <strong>Community Safety Rule:</strong> ReCirculate is 100% money-free. Never send advance money transfers (KPay, WavePay) to trade partners. Only pay standard counter cargo fees directly to the courier office when dropping off or picking up parcels.
              </span>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="p-4 p-md-5 rounded-3 text-center" style={{ backgroundColor: 'var(--bg-accent-banner)', border: '1px solid var(--border-medium)' }}>
          <h3 className="font-serif fw-bold mb-2">Ready to Give an Item a Second Life?</h3>
          <p className="text-muted mb-4" style={{ fontSize: '0.96rem', lineHeight: 1.75 }}>
            Join community members nationwide exchanging electronics, books, furniture, and home goods today.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/register" className="btn-nordic-primary px-4 py-2">
              Create an Account
            </Link>
            <Link to="/browse" className="btn-nordic-secondary px-4 py-2">
              Browse Available Items
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
