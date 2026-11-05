import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useExchange } from '../../context/ExchangeContext';
import { CATEGORIES } from '../../data/mockData';
import categoryService from '../../services/categoryService';
import itemService from '../../services/itemService';
import authService from '../../services/authService';

export default function AddEditItemPage() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { myItems, addItem, updateItem } = useExchange();

  const existingItem = isEditMode ? myItems.find(i => String(i.id) === String(id)) : null;

  const [categoriesList, setCategoriesList] = useState(CATEGORIES);
  const [locations, setLocations] = useState([]);
  const [selectedRegionId, setSelectedRegionId] = useState('');
  const [selectedTownshipId, setSelectedTownshipId] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(1);
  const [condition, setCondition] = useState('Like New');
  const [defects, setDefects] = useState('');
  const [city, setCity] = useState(currentUser?.city || 'Mandalay');
  const [allowIntercity, setAllowIntercity] = useState(true);
  const [exchangePreference, setExchangePreference] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loadingItem, setLoadingItem] = useState(isEditMode);

  // Load dynamic categories & locations from backend API
  useEffect(() => {
    categoryService.getCategories()
      .then(res => {
        if (res?.success && res.data?.length > 0) {
          setCategoriesList(res.data);
          if (!isEditMode) {
            setCategory(res.data[0].id);
          }
        }
      })
      .catch(() => {});

    authService.getLocations()
      .then(res => {
        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          setLocations(res.data);
          if (!isEditMode) {
            // Default to user's region/township or Mandalay
            const defaultReg = res.data.find(r => r.name.toLowerCase().includes('mandalay')) || res.data[0];
            setSelectedRegionId(defaultReg.id);
            if (defaultReg.townships?.length > 0) {
              const defaultTownship = defaultReg.townships.find(t => t.id === currentUser?.township_id) || defaultReg.townships[0];
              setSelectedTownshipId(defaultTownship.id);
              setCity(`${defaultTownship.name}, ${defaultReg.name}`);
            }
          }
        }
      })
      .catch(err => console.warn('Could not load locations:', err));
  }, [isEditMode, currentUser?.township_id]);

  // When in Edit Mode, fetch real item data from database
  useEffect(() => {
    if (isEditMode && id) {
      setLoadingItem(true);
      itemService.getItemById(id)
        .then(res => {
          if (res?.success && res.data) {
            const itemData = res.data;
            setTitle(itemData.title || '');
            setCategory(itemData.category_id || 1);
            setCondition(itemData.condition || 'Like New');
            setDefects(itemData.defects || '');
            setExchangePreference((itemData.looking_for || '').replace(/^Looking for:\s*/i, ''));
            setDescription(itemData.description || '');

            const itemImages = itemData.images?.map(i => i.image_url) || [];
            if (itemImages.length > 0) {
              setImages(itemImages);
            }

            if (itemData.township_id) {
              setSelectedTownshipId(itemData.township_id);
              if (itemData.township?.state_region_id) {
                setSelectedRegionId(itemData.township.state_region_id);
              }
              const tName = itemData.township?.name || '';
              const rName = itemData.township?.state_region?.name || '';
              if (tName && rName) {
                setCity(`${tName}, ${rName}`);
              }
            }
          }
        })
        .catch(err => {
          console.warn('Backend item retrieve error, using local fallback:', err);
          if (existingItem) {
            setTitle(existingItem.title || '');
            setCategory(existingItem.categoryId || existingItem.category || 1);
            setCondition(existingItem.condition || 'Like New');
            setDefects(existingItem.defects || '');
            setCity(existingItem.city || 'Mandalay');
            setAllowIntercity(existingItem.allowIntercity ?? true);
            setExchangePreference((existingItem.exchangePreference || '').replace(/^Looking for:\s*/i, ''));
            setDescription(existingItem.description || '');
            setImages(existingItem.images || [existingItem.image]);
          }
        })
        .finally(() => setLoadingItem(false));
    }
  }, [isEditMode, id]);

  // Automatically sync region if township is loaded before locations
  useEffect(() => {
    if (locations.length > 0 && selectedTownshipId && !selectedRegionId) {
      for (const reg of locations) {
        const found = reg.townships?.find(t => t.id === Number(selectedTownshipId));
        if (found) {
          setSelectedRegionId(reg.id);
          setCity(`${found.name}, ${reg.name}`);
          break;
        }
      }
    }
  }, [locations, selectedTownshipId, selectedRegionId]);

  const handleRegionChange = (regionId) => {
    setSelectedRegionId(regionId);
    const reg = locations.find(r => r.id === Number(regionId));
    if (reg && reg.townships?.length > 0) {
      setSelectedTownshipId(reg.townships[0].id);
      setCity(`${reg.townships[0].name}, ${reg.name}`);
    } else {
      setSelectedTownshipId('');
    }
  };

  const handleTownshipChange = (townshipId) => {
    setSelectedTownshipId(townshipId);
    const reg = locations.find(r => r.id === Number(selectedRegionId));
    const t = reg?.townships?.find(item => item.id === Number(townshipId));
    if (t && reg) {
      setCity(`${t.name}, ${reg.name}`);
    }
  };

  const handleAddImageUrl = () => {
    if (imageUrl.trim()) {
      setImages([...images, imageUrl.trim()]);
      setImageUrl('');
    }
  };

  const handleFileUpload = async (e) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    setUploadingImage(true);
    setError('');
    try {
      const res = await itemService.uploadImage(fileList);
      if (res?.success) {
        if (res.data?.urls?.length > 0) {
          setImages(prev => [...prev, ...res.data.urls]);
        } else if (res.data?.url) {
          setImages(prev => [...prev, res.data.url]);
        }
      } else {
        // Fallback: convert files to Base64 data URLs so they persist reliably
        for (const file of Array.from(fileList)) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            setImages(prev => [...prev, evt.target.result]);
          };
          reader.readAsDataURL(file);
        }
      }
    } catch (err) {
      console.warn('Backend image upload error, using persistent data URL:', err);
      for (const file of Array.from(fileList)) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          setImages(prev => [...prev, evt.target.result]);
        };
        reader.readAsDataURL(file);
      }
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !exchangePreference.trim() || !description.trim()) {
      setError('Please provide the item title, description, and what you would like in exchange.');
      return;
    }

    if (images.length === 0) {
      setError('Please provide at least one photo showing the actual item.');
      return;
    }

    setSubmitting(true);
    const catObj = categoriesList.find(c => String(c.id) === String(category));

    const itemPayload = {
      title,
      category,
      categoryId: catObj?.id || category,
      categoryName: catObj ? catObj.name : 'General',
      condition,
      defects: defects || 'No cosmetic flaws reported by owner.',
      city: city,
      cityCode: city.toLowerCase().includes('mandalay') ? 'MDY' : 'YGN',
      township_id: selectedTownshipId || null,
      exchangePreference: `Looking for: ${exchangePreference}`,
      description,
      shippingOption: allowIntercity ? `${city} in-person or express courier to other cities` : `${city} in-person meetup only`,
      allowIntercity,
      images,
      image: images[0]
    };

    if (isEditMode) {
      await updateItem(id, itemPayload);
    } else {
      await addItem(itemPayload);
    }

    setSubmitting(false);
    navigate('/my-items');
  };

  return (
    <div className="py-5" style={{ backgroundColor: 'var(--bg-warm)', minHeight: '85vh' }}>
      <div className="container-xl">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8">
            
            {/* Header */}
            <div className="mb-4">
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb mb-1" style={{ fontSize: '0.8rem' }}>
                  <li className="breadcrumb-item"><Link to="/dashboard" className="text-muted text-decoration-none">Dashboard</Link></li>
                  <li className="breadcrumb-item"><Link to="/my-items" className="text-muted text-decoration-none">My Items</Link></li>
                  <li className="breadcrumb-item active text-dark">{isEditMode ? 'Edit Item' : 'List New Item'}</li>
                </ol>
              </nav>
              <h1 className="font-serif fw-bold h3 mb-1 text-dark">
                {isEditMode ? 'Edit Item Listing' : 'List an Item for Community Exchange'}
              </h1>
              <p className="text-muted small">
                Help other members in Mandalay and Yangon understand your item's real condition to foster seamless exchanges.
              </p>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="alert alert-danger py-2 px-3 mb-4 d-flex align-items-center gap-2" style={{ fontSize: '0.84rem' }}>
                <i className="bi bi-exclamation-triangle-fill"></i>
                <span>{error}</span>
              </div>
            )}

            {/* Main Form Card */}
            <div className="bg-white p-4 p-md-5 rounded-3 border shadow-sm" style={{ borderColor: 'var(--border-light)' }}>
              <form onSubmit={handleSubmit}>
                <div className="row g-4">
                  
                  {/* Item Title */}
                  <div className="col-12">
                    <label className="form-label fw-semibold small text-dark">
                      Item Name & Model <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      placeholder="e.g. Teak Wood Coffee Table, Sony XM4 Headphones, Olympus OM-1..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  {/* Category & Condition */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small text-dark">
                      Category <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      {categoriesList.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold small text-dark">
                      Item Condition <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                    >
                      <option value="New">New (Unopened / In original box)</option>
                      <option value="Like New">Like New (Mint, barely used, no visible scratches)</option>
                      <option value="Good">Good (Normal wear, 100% operational)</option>
                      <option value="Fair">Fair (Noticeable cosmetic marks, working)</option>
                      <option value="Poor">Poor (Heavily used / for spares)</option>
                    </select>
                  </div>

                  {/* Defects & Wear Disclosure (Requirement 3.C) */}
                  <div className="col-12">
                    <label className="form-label fw-semibold small text-dark">
                      Known Defects & Cosmetic Wear Disclosure <span className="text-danger">*</span>
                    </label>
                    <textarea
                      rows="2"
                      required
                      className="form-control"
                      placeholder="Be honest: mention minor surface scratches, battery degradation, missing cables, or fabric stains..."
                      value={defects}
                      onChange={(e) => setDefects(e.target.value)}
                    ></textarea>
                    <small className="text-muted">Honest descriptions prevent disputes upon physical handover.</small>
                  </div>

                  {/* Wanted in Return */}
                  <div className="col-12">
                    <label className="form-label fw-semibold small text-dark">
                      What are you looking for in exchange? <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      placeholder="e.g. Ergonomic Office Chair, Kindle Paperwhite, or Art Books..."
                      value={exchangePreference}
                      onChange={(e) => setExchangePreference(e.target.value)}
                    />
                    <small className="text-muted">Our smart matching engine uses this field to recommend mutual trades.</small>
                  </div>

                  {/* Myanmar State / Region & Township */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small text-dark">
                      State / Region <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      value={selectedRegionId}
                      onChange={(e) => handleRegionChange(e.target.value)}
                    >
                      {locations.map(reg => (
                        <option key={reg.id} value={reg.id}>{reg.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold small text-dark">
                      Township / City Area <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      value={selectedTownshipId}
                      onChange={(e) => handleTownshipChange(e.target.value)}
                    >
                      {(locations.find(r => r.id === Number(selectedRegionId))?.townships || []).map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-12 d-flex align-items-center">
                    <div className="form-check pt-1">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="intercityCheck"
                        checked={allowIntercity}
                        onChange={(e) => setAllowIntercity(e.target.checked)}
                      />
                      <label className="form-check-label small fw-semibold" htmlFor="intercityCheck">
                        Accept Express Courier for Other Cities
                      </label>
                      <div className="text-muted" style={{ fontSize: '0.78rem' }}>
                        Local swaps remain direct in-person. Courier &amp; Two-Sided Completion used only for other cities.
                      </div>
                    </div>
                  </div>

                  {/* Photos Section (Multiple photos support) */}
                  <div className="col-12">
                    <label className="form-label fw-semibold small text-dark d-flex justify-content-between align-items-center">
                      <span>Item Photos (Actual Daylight Photos Required) <span className="text-danger">*</span></span>
                      {uploadingImage && <span className="text-primary small"><i className="spinner-border spinner-border-sm me-1"></i> Uploading photo...</span>}
                    </label>
                    
                    <div className="row g-2 mb-2">
                      <div className="col-md-7">
                        <div className="input-group">
                          <input
                            type="url"
                            className="form-control"
                            placeholder="Paste image URL (e.g. https://...)"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={handleAddImageUrl}
                            className="btn btn-outline-secondary"
                          >
                            <i className="bi bi-plus-lg"></i> Add URL
                          </button>
                        </div>
                      </div>
                      <div className="col-md-5">
                        <label className="btn btn-outline-dark w-100 d-flex align-items-center justify-content-center gap-2 cursor-pointer mb-0">
                          <i className="bi bi-cloud-arrow-up-fill"></i>
                          <span>{uploadingImage ? 'Uploading Photos...' : 'Upload Photos (Multi-select)'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileUpload}
                            className="d-none"
                            disabled={uploadingImage}
                          />
                        </label>
                      </div>
                    </div>

                    {/* Previews Grid */}
                    <div className="d-flex flex-wrap gap-2 pt-2">
                      {images.map((img, idx) => (
                        <div key={idx} className="position-relative rounded border overflow-hidden bg-light d-flex align-items-center justify-content-center" style={{ width: '90px', height: '90px' }}>
                          <img
                            src={img}
                            alt="Preview"
                            className="w-100 h-100"
                            style={{ objectFit: 'contain' }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80';
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 p-0 rounded-circle d-flex align-items-center justify-content-center"
                            style={{ width: '20px', height: '20px', fontSize: '10px' }}
                            title="Remove photo"
                          >
                            <i className="bi bi-x"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* General Description */}
                  <div className="col-12">
                    <label className="form-label fw-semibold small text-dark">
                      Detailed Item Description <span className="text-danger">*</span>
                    </label>
                    <textarea
                      rows="4"
                      required
                      className="form-control"
                      placeholder="Describe dimensions, materials, history, and why you are exchanging it..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                  </div>

                </div>

                {/* Form Footer */}
                <div className="d-flex justify-content-end gap-2 mt-5 pt-3 border-top" style={{ borderColor: 'var(--border-light)' }}>
                  <button
                    type="button"
                    onClick={() => navigate('/my-items')}
                    className="btn btn-outline-secondary px-4"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-nordic-primary px-4"
                  >
                    {submitting ? (
                      <span className="spinner-border spinner-border-sm me-2"></span>
                    ) : (
                      <i className="bi bi-cloud-check-fill me-1"></i>
                    )}
                    {isEditMode ? 'Update Listing' : 'Publish Community Listing'}
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
