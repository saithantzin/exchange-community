import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import HeroSection from '../../components/HeroSection';
import ValuePropositionStrip from '../../components/ValuePropositionStrip';
import BrowseCategories from '../../components/BrowseCategories';
import DualBannerSection from '../../components/DualBannerSection';
import LatestItemsGrid from '../../components/LatestItemsGrid';
import SmartMatchingPreview from '../../components/SmartMatchingPreview';
import HowItWorksSection from '../../components/HowItWorksSection';
import TrustSafetySection from '../../components/TrustSafetySection';
import EnvironmentalBenefits from '../../components/EnvironmentalBenefits';
import TestimonialsSection from '../../components/TestimonialsSection';
import ItemDetailModal from '../../components/ItemDetailModal';
import ExchangeRequestModal from '../../components/ExchangeRequestModal';
import AuthModal from '../../components/AuthModal';

import { useAuth } from '../../context/AuthContext';
import { useExchange } from '../../context/ExchangeContext';

export default function HomePage() {
  const { currentUser, isLoggedIn, login } = useAuth();
  const { items, categories, myItems, sendExchangeRequest } = useExchange();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedCondition, setSelectedCondition] = useState('all');

  const [selectedItemForDetail, setSelectedItemForDetail] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');
  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false);
  const [exchangeTargetItem, setExchangeTargetItem] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handlePerformSearch = () => {
    navigate(`/browse?q=${encodeURIComponent(searchQuery)}&cat=${selectedCategory}&city=${selectedCity}&cond=${selectedCondition}`);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedCity('all');
    setSelectedCondition('all');
  };

  const handleCategorySelect = (catId) => {
    navigate(`/browse?cat=${catId}`);
  };

  const handleOpenAuthModal = (tab = 'login') => {
    navigate(tab === 'login' ? '/login' : '/register');
  };

  const handleOpenListModal = () => {
    navigate(isLoggedIn ? '/add-item' : '/login');
  };

  const handleProposeExchange = (item) => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: `/item/${item.id}` } });
      return;
    }
    setSelectedItemForDetail(null);
    setExchangeTargetItem(item);
    setIsExchangeModalOpen(true);
  };

  const handleSendMatchRequest = (match) => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    setExchangeTargetItem(match);
    setIsExchangeModalOpen(true);
  };

  const handleProposalSuccess = async (proposalData) => {
    const targetObj = proposalData.targetItemObj || exchangeTargetItem;
    const reqItem = targetObj?.offeredItem || targetObj;
    const offItem = proposalData.offeredItemObj;

    await sendExchangeRequest({
      recipient: reqItem?.owner || { id: reqItem?.ownerId, name: 'Community Member' },
      requestedItem: reqItem,
      offeredItem: offItem,
      handoverMethod: proposalData.handoverType,
      message: proposalData.note || 'Proposal initiated from Home Page.'
    });
    showToast(`Exchange proposal sent for "${reqItem?.title || proposalData.targetItem}"! Waiting for member response.`);
  };

  return (
    <div>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className="position-fixed bottom-0 end-0 m-4 p-3 bg-white border rounded-3 shadow-lg d-flex align-items-center gap-3"
          style={{ zIndex: 1090, maxWidth: '420px', borderColor: 'var(--primary-brown)', borderLeftWidth: '6px' }}
        >
          <div
            className="rounded-circle d-flex align-items-center justify-content-center text-white"
            style={{ width: '32px', height: '32px', backgroundColor: 'var(--primary-brown)', flexShrink: 0 }}
          >
            <i className="bi bi-check-lg"></i>
          </div>
          <div className="flex-grow-1" style={{ fontSize: '0.84rem' }}>
            <div className="fw-bold text-dark">Notification</div>
            <div className="text-muted">{toastMessage}</div>
          </div>
          <button onClick={() => setToastMessage(null)} className="btn btn-sm btn-link text-muted p-0">
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
      )}

      {/* Hero Section */}
      <HeroSection
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        selectedCondition={selectedCondition}
        setSelectedCondition={setSelectedCondition}
        onPerformSearch={handlePerformSearch}
        onResetFilters={handleResetFilters}
        onOpenListModal={handleOpenListModal}
        onBrowseItemsClick={() => navigate('/browse')}
      />

      {/* 4 Feature Badges Strip */}
      <ValuePropositionStrip />

      {/* Circular Categories Row */}
      <BrowseCategories
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
      />

      {/* Featured Collection Dual Banners */}
      <DualBannerSection
        onExploreIntercity={() => navigate('/browse?city=all')}
        onExploreHousehold={() => navigate('/browse?cat=household')}
      />

      {/* Latest Available Items (Dynamic from MySQL Database) */}
      <LatestItemsGrid
        items={React.useMemo(() => {
          if (!items || items.length === 0) return [];
          if (!selectedCategory || selectedCategory === 'all') return items.slice(0, 8);

          const matchedCategoryObj = categories?.find(c => 
            String(c.id) === String(selectedCategory) ||
            c.slug === selectedCategory ||
            (c.name && c.name.toLowerCase() === selectedCategory.toLowerCase())
          );

          const targetId = matchedCategoryObj ? String(matchedCategoryObj.id) : null;
          const targetSlug = matchedCategoryObj?.slug || selectedCategory;
          const targetClean = (matchedCategoryObj?.name || selectedCategory).toLowerCase().replace(/[^a-z0-9]/g, '');

          return items.filter(it => {
            if (targetId && String(it.categoryId) === targetId) return true;
            if (String(it.categoryId) === String(selectedCategory)) return true;
            if (it.categorySlug && targetSlug && it.categorySlug === targetSlug) return true;

            const itemCatName = (it.categoryName || it.category || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            if (itemCatName && targetClean && (itemCatName.includes(targetClean) || targetClean.includes(itemCatName))) {
              return true;
            }

            return false;
          }).slice(0, 8);
        }, [items, selectedCategory, categories])}
        isLoading={false}
        error={null}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
        onOpenItemDetail={(item) => navigate(`/item/${item.id}`)}
        onResetFilters={handleResetFilters}
      />

      {/* Smart Item Matching Section (Only shown when user is logged in AND has active listings) */}
      {isLoggedIn && Boolean((myItems && myItems.length > 0) || (currentUser?.id && items && items.some(it => String(it.ownerId || it.owner?.id) === String(currentUser.id)))) && (
        <SmartMatchingPreview
          isLoggedIn={isLoggedIn}
          onOpenAuthModal={handleOpenAuthModal}
          onSendExchangeRequest={handleSendMatchRequest}
          onOpenItemDetail={(item) => navigate(`/item/${item.id}`)}
          currentUser={currentUser || { name: 'Member', city: 'Mandalay' }}
        />
      )}

      {/* 4 Steps How It Works */}
      <HowItWorksSection onGetStartedClick={() => navigate('/register')} />

      {/* Trust & Safety */}
      <TrustSafetySection />

      {/* Community & Environmental Benefits */}
      <EnvironmentalBenefits />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Modals */}
      <ItemDetailModal
        item={selectedItemForDetail}
        onClose={() => setSelectedItemForDetail(null)}
        onProposeExchange={handleProposeExchange}
        isLoggedIn={isLoggedIn}
        onOpenAuthModal={handleOpenAuthModal}
      />

      <ExchangeRequestModal
        isOpen={isExchangeModalOpen}
        onClose={() => setIsExchangeModalOpen(false)}
        targetItem={exchangeTargetItem}
        currentUser={currentUser || { name: 'Member', city: 'Mandalay (MDY)' }}
        onProposalSuccess={handleProposalSuccess}
      />
    </div>
  );
}
