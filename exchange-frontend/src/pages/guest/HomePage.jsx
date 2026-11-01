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
  const { items, sendExchangeRequest } = useExchange();
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

  const handleProposalSuccess = (proposalData) => {
    sendExchangeRequest({
      recipient: { name: 'Community Member' },
      requestedItem: { title: proposalData.targetItem, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80' },
      offeredItem: { title: proposalData.offeredItem, image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&q=80' },
      handoverMethod: proposalData.handoverType,
      message: 'Proposal initiated from Home Page preview.'
    });
    showToast(`Exchange proposal sent for "${proposalData.targetItem}"! Dual confirmation pending.`);
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

      {/* Latest Available Items */}
      <LatestItemsGrid
        items={items.slice(0, 8)}
        isLoading={false}
        error={null}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
        onOpenItemDetail={(item) => navigate(`/item/${item.id}`)}
        onResetFilters={handleResetFilters}
      />

      {/* Smart Item Matching Section */}
      <SmartMatchingPreview
        isLoggedIn={isLoggedIn}
        onOpenAuthModal={handleOpenAuthModal}
        onSendExchangeRequest={handleSendMatchRequest}
        onOpenItemDetail={(item) => navigate(`/item/${item.id}`)}
        currentUser={currentUser || { name: 'Guest', city: 'Mandalay' }}
      />

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
