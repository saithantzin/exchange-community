import React, { useState } from 'react';

export default function ListItemModal({
  isOpen,
  onClose,
  isLoggedIn,
  onOpenAuthModal,
  onAddItem,
  currentUser
}) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('furniture');
  const [condition, setCondition] = useState('Like New');
  const [city, setCity] = useState(currentUser?.cityCode || 'MDY');
  const [allowIntercity, setAllowIntercity] = useState(true);
  const [exchangePreference, setExchangePreference] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !exchangePreference) {
      alert('Please fill in the item title and what you would like in exchange.');
      return;
    }

    const newItem = {
      id: Date.now(),
      title,
      category,
      categoryName: category.charAt(0).toUpperCase() + category.slice(1),
      condition,
      conditionColor: condition === 'New' ? '#2C5B7C' : condition === 'Like New' ? '#87571B' : '#3E6347',
      conditionBg: condition === 'New' ? '#E8F1F7' : condition === 'Like New' ? '#F9F1E2' : '#EAF2EC',
      city: city,
      cityCode: city.substring(0, 3).toUpperCase(),
      exchangePreference: `Looking for: ${exchangePreference}`,
      description: description || 'Genuine pre-loved item ready for exchange. Kept in clean condition.',
      owner: {
        name: currentUser.name,
        rating: 5.0,
        exchanges: 1,
        avatar: currentUser.avatar,
        joined: 'Joined Recently'
      },
      shippingOption: allowIntercity ? `${city} in-person or express courier to other cities` : `${city} in-person meetup only`,
      allowIntercity,
      image: imageUrl,
      createdAt: 'Just now',
      featured: true
    };

    onAddItem(newItem);
    onClose();
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(30, 24, 20, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1060 }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content shadow-lg">
          
          <div className="modal-header">
            <div>
              <span className="section-pre-title mb-0">Community Circular Listing</span>
              <h5 className="modal-title font-serif fw-bold text-dark">List an Item for Exchange</h5>
            </div>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
          </div>

          <div className="modal-body p-4">
            {!isLoggedIn ? (
              /* Guest Redirection Alert */
              <div className="text-center py-4">
                <div
                  className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3"
                  style={{ width: '64px', height: '64px', backgroundColor: 'var(--bg-sand)', color: 'var(--primary-brown)' }}
                >
                  <i className="bi bi-person-lock fs-2"></i>
                </div>
                <h4 className="font-serif fw-bold mb-2">Member Account Required</h4>
                <p className="text-muted mx-auto mb-4" style={{ maxWidth: '420px', fontSize: '0.9rem' }}>
                  To maintain genuine community trust, prevent ghost items, and verify member identities in Mandalay and Yangon, please sign in or register before listing an item.
                </p>
                <div className="d-flex justify-content-center gap-3">
                  <button
                    onClick={() => { onClose(); onOpenAuthModal('login'); }}
                    className="btn-nordic-primary px-4 py-2"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => { onClose(); onOpenAuthModal('register'); }}
                    className="btn-nordic-secondary px-4 py-2"
                  >
                    Register New Account
                  </button>
                </div>
              </div>
            ) : (
              /* Member Item Submission Form */
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  
                  {/* Title */}
                  <div className="col-12">
                    <label className="form-label fw-semibold small">Item Title & Model</label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      placeholder="e.g. Solid Oak Study Desk or Sony Wireless Headphones"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  {/* Category & Condition */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Category</label>
                    <select
                      className="form-select"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="electronics">Electronics</option>
                      <option value="books">Books</option>
                      <option value="clothing">Clothing</option>
                      <option value="household">Household Items</option>
                      <option value="furniture">Furniture</option>
                      <option value="other">Other Items</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Condition</label>
                    <select
                      className="form-select"
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                    >
                      <option value="New">New (Unopened / Tagged)</option>
                      <option value="Like New">Like New (Mint condition, gently used)</option>
                      <option value="Good">Good (Normal wear, fully functional)</option>
                      <option value="Fair">Fair (Noticeable cosmetics, working)</option>
                      <option value="Poor">Poor (Heavily used / for parts)</option>
                    </select>
                  </div>

                  {/* City & Handover */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Item Location</label>
                    <select
                      className="form-select"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    >
                      <option value="Yangon">Yangon</option>
                      <option value="Mandalay">Mandalay</option>
                      <option value="Naypyitaw">Naypyitaw</option>
                      <option value="Taunggyi">Taunggyi</option>
                      <option value="Mawlamyine">Mawlamyine</option>
                      <option value="Bago">Bago</option>
                      <option value="Monywa">Monywa</option>
                      <option value="Pathein">Pathein</option>
                      <option value="Pyin Oo Lwin">Pyin Oo Lwin</option>
                    </select>
                  </div>

                  <div className="col-md-6 d-flex align-items-center">
                    <div className="form-check pt-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="modalIntercityCheck"
                        checked={allowIntercity}
                        onChange={(e) => setAllowIntercity(e.target.checked)}
                      />
                      <label className="form-check-label small fw-semibold" htmlFor="modalIntercityCheck">
                        Accept Express Courier for Other Cities
                      </label>
                      <div className="text-muted" style={{ fontSize: '0.76rem' }}>
                        Local swaps remain direct in-person. Courier used for other cities.
                      </div>
                    </div>
                  </div>

                  {/* Desired Exchange */}
                  <div className="col-12">
                    <label className="form-label fw-semibold small">
                      What are you looking for in return? <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      placeholder="e.g. Ergonomic Office Chair, Kindle, or Bookshelf"
                      value={exchangePreference}
                      onChange={(e) => setExchangePreference(e.target.value)}
                    />
                    <small className="text-muted">Our smart matching engine uses this to find mutual trade partners.</small>
                  </div>

                  {/* Photo Preview */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Photo URL (Daylight unedited image)</label>
                    <input
                      type="url"
                      className="form-control"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Photo Preview</label>
                    <div className="rounded border overflow-hidden bg-light" style={{ height: '70px', width: '100%' }}>
                      <img src={imageUrl} alt="Preview" className="w-100 h-100" style={{ objectFit: 'cover' }} />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="col-12">
                    <label className="form-label fw-semibold small">Honest Condition Description</label>
                    <textarea
                      rows="3"
                      className="form-control"
                      placeholder="Mention any scratches, battery health, included accessories, or reasons for exchange..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                  </div>

                </div>

                <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                  <button type="button" onClick={onClose} className="btn btn-outline-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-nordic-primary px-4">
                    <i className="bi bi-cloud-arrow-up"></i> Publish Listing
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
