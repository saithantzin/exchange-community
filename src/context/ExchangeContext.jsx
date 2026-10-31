import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_ITEMS,
  CURRENT_USER_ITEMS,
  INITIAL_REQUESTS,
  INITIAL_EXCHANGES,
  INITIAL_DISPUTES,
  INITIAL_NOTIFICATIONS
} from '../data/mockData';
import { getCategoryDepositAmount } from '../data/adminMockData';
import { useAuth } from './AuthContext';
import itemService from '../services/itemService';
import categoryService from '../services/categoryService';

const ExchangeContext = createContext();

function formatItemFromBackend(bItem) {
  const primaryImage = bItem.images?.find(i => i.is_primary)?.image_url
    || bItem.images?.[0]?.image_url
    || 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80';

  const township = bItem.township?.name || '';
  const region = bItem.township?.state_region?.name || '';
  const city = township && region ? `${township}, ${region}` : 'Mandalay';

  return {
    id: bItem.id,
    title: bItem.title,
    category: bItem.category?.name || 'Electronics',
    categoryId: bItem.category_id,
    condition: bItem.condition,
    description: bItem.description,
    exchangePreference: bItem.looking_for || 'Open to offers',
    city: city,
    cityCode: city.toLowerCase().includes('mandalay') ? 'MDY' : 'YGN',
    images: bItem.images?.map(i => i.image_url) || [primaryImage],
    image: primaryImage,
    ownerId: bItem.user_id,
    owner: {
      id: bItem.user?.id || bItem.user_id,
      name: bItem.user?.name || 'Member',
      username: bItem.user?.username || '',
      city: city,
      rating: Number(bItem.user?.rating) || 5.0,
      avatar: bItem.user?.profile_image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80',
      joined: 'Community Member'
    },
    status: bItem.availability_status || 'Available',
    createdAt: bItem.created_at ? new Date(bItem.created_at).toLocaleDateString() : 'Recently',
    views: bItem.views || 0,
    depositAmount: bItem.category?.deposit_amount || 100000
  };
}

export function ExchangeProvider({ children }) {
  const { currentUser } = useAuth();

  const [items, setItems] = useState(INITIAL_ITEMS);
  const [myItems, setMyItems] = useState(CURRENT_USER_ITEMS);
  const [categories, setCategories] = useState([]);
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [exchanges, setExchanges] = useState(INITIAL_EXCHANGES);
  const [disputes, setDisputes] = useState(INITIAL_DISPUTES);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  // Fetch dynamic items and categories from Laravel Backend
  useEffect(() => {
    itemService.getItems({ per_page: 50 })
      .then(res => {
        if (res?.success && Array.isArray(res.data?.data) && res.data.data.length > 0) {
          const dynamicItems = res.data.data.map(formatItemFromBackend);
          setItems(dynamicItems);

          if (currentUser?.id) {
            const userItems = dynamicItems.filter(i => i.ownerId === currentUser.id);
            if (userItems.length > 0) {
              setMyItems(userItems);
            }
          }
        }
      })
      .catch(err => {
        console.warn('Could not load dynamic items, using static fallback:', err?.message);
      });

    categoryService.getCategories()
      .then(res => {
        if (res?.success && Array.isArray(res.data)) {
          setCategories(res.data);
        }
      })
      .catch(err => console.warn('Could not load dynamic categories:', err?.message));
  }, [currentUser?.id]);

  // Add Item (Persists to Backend & local state)
  const addItem = async (itemData) => {
    try {
      const payload = {
        title: itemData.title,
        category_id: itemData.categoryId || 1,
        description: itemData.description,
        condition: itemData.condition || 'Like New',
        looking_for: itemData.exchangePreference || '',
        images: itemData.images?.length > 0 ? itemData.images : [itemData.image || 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80']
      };

      const res = await itemService.createItem(payload);
      if (res?.success && res.data) {
        const formatted = formatItemFromBackend(res.data);
        setMyItems(prev => [formatted, ...prev]);
        setItems(prev => [formatted, ...prev]);
        return formatted;
      }
    } catch (e) {
      console.warn('Backend item creation failed, using client simulation:', e);
    }

    const newItem = {
      id: Date.now(),
      ...itemData,
      ownerId: currentUser?.id || 1,
      owner: {
        id: currentUser?.id || 1,
        name: currentUser?.name || 'Community Member',
        city: currentUser?.city || 'Mandalay (MDY)',
        rating: currentUser?.rating || 5.0,
        exchanges: currentUser?.completedExchanges || 0,
        avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80',
        joined: 'Joined Recently'
      },
      status: 'Available',
      createdAt: 'Just now',
      featured: false
    };

    setMyItems(prev => [newItem, ...prev]);
    setItems(prev => [newItem, ...prev]);
    return newItem;
  };

  // Edit Item
  const updateItem = async (id, updatedFields) => {
    try {
      await itemService.updateItem(id, updatedFields);
    } catch (e) {
      console.warn('Backend item update failed, updating local state:', e);
    }
    setMyItems(prev => prev.map(item => item.id === id ? { ...item, ...updatedFields } : item));
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...updatedFields } : item));
  };

  // Delete Item
  const deleteItem = async (id) => {
    try {
      await itemService.deleteItem(id);
    } catch (e) {
      console.warn('Backend item deletion failed, removing locally:', e);
    }
    setMyItems(prev => prev.filter(item => item.id !== id));
    setItems(prev => prev.filter(item => item.id !== id));
  };

  // Send Exchange Proposal (Requirement 3.E)
  const sendExchangeRequest = (requestData) => {
    const newRequest = {
      id: `REQ-${Date.now().toString().slice(-4)}`,
      type: 'outgoing',
      recipient: requestData.recipient,
      requestedItem: requestData.requestedItem,
      offeredItem: requestData.offeredItem,
      handoverMethod: requestData.handoverMethod,
      message: requestData.message,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'Pending'
    };

    setRequests(prev => [newRequest, ...prev]);

    // Add notification
    const newNotif = {
      id: `NOTIF-${Date.now()}`,
      title: 'Exchange Proposal Submitted',
      message: `Your exchange offer for "${requestData.requestedItem.title}" has been transmitted to ${requestData.recipient.name}.`,
      time: 'Just now',
      type: 'request',
      link: '/requests',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
    return newRequest;
  };

  // Accept Incoming Request
  const acceptRequest = (requestId) => {
    const req = requests.find(r => r.id === requestId);
    if (!req) return null;

    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'Accepted' } : r));

    const isIntercity = Boolean(
      req.isIntercity ||
      req.handoverMethod?.toLowerCase().includes('courier') ||
      req.handoverMethod?.toLowerCase().includes('express') ||
      req.handoverMethod?.toLowerCase().includes('intercity') ||
      (req.requestedItem?.city && req.offeredItem?.city && req.requestedItem.city !== req.offeredItem.city)
    );

    // Automatically instantiate an ongoing exchange
    const partyAAmount = getCategoryDepositAmount(req.requestedItem?.category || req.requestedItem?.title);
    const partyBAmount = getCategoryDepositAmount(req.offeredItem?.category || req.offeredItem?.title);

    const newExchange = {
      id: `EXC-${Math.floor(1000 + Math.random() * 9000)}`,
      status: isIntercity ? 'Deposit Payment' : 'In Progress',
      intercityStage: isIntercity ? 2 : 1, // State 2: Deposit Payment
      isIntercity: isIntercity,
      handoverMethod: req.handoverMethod || (isIntercity ? 'Intercity Courier Delivery' : 'In-Person Meetup'),
      initiatedDate: new Date().toISOString().split('T')[0],
      itemA: {
        title: req.requestedItem.title,
        category: req.requestedItem.category || 'Electronics',
        ownerName: `${currentUser?.name || 'Thant Zin'} (You)`,
        ownerCity: req.requestedItem.city || 'Mandalay',
        image: req.requestedItem.image
      },
      itemB: {
        title: req.offeredItem.title,
        category: req.offeredItem.category || 'Electronics',
        ownerName: req.requester?.name || 'Partner',
        ownerCity: req.offeredItem?.city || 'Other City',
        image: req.offeredItem?.image
      },
      ...(isIntercity ? {
        deposits: {
          partyA: {
            itemTitle: req.requestedItem.title,
            category: req.requestedItem.category || 'Electronics',
            amount: partyAAmount,
            status: 'Unpaid', // 'Unpaid' | 'Payment Submitted' | 'Verified' | 'Rejected'
            paymentMethod: null,
            referenceNumber: '',
            slipImage: null,
            submittedAt: null,
            verifiedAt: null
          },
          partyB: {
            itemTitle: req.offeredItem.title,
            category: req.offeredItem.category || 'Electronics',
            amount: partyBAmount,
            status: 'Payment Submitted', // Partner mock submitted
            paymentMethod: 'KBZPay',
            referenceNumber: 'KBZ-892102',
            slipImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&q=80',
            submittedAt: 'Today',
            verifiedAt: null
          }
        },
        courierArrangement: {
          confirmed: false,
          confirmedAt: null
        },
        refundWorkflow: {
          initiated: false,
          status: 'Pending',
          refundedAmountA: 0,
          refundedAmountB: 0,
          refundedAt: null
        },
        partyA: {
          name: `${currentUser?.name || 'Thant Zin'} (You)`,
          city: req.requestedItem.city || 'Mandalay',
          phone: currentUser?.phone || '09798123456',
          communicationContacts: currentUser?.communicationContacts || {
            telegram: '@thantzin_mdy',
            viber: '09798123456',
            facebook: 'https://facebook.com/thantzin.mdy',
            preferredMethod: 'telegram'
          },
          courier: 'Royal Express',
          trackingNumber: '',
          dispatched: false,
          confirmedReceipt: false
        },
        partyB: {
          name: req.requester?.name || 'Partner',
          city: req.offeredItem?.city || 'Yangon',
          phone: req.requester?.phone || '09450987654',
          communicationContacts: {
            telegram: req.requester?.telegram || '@kyawzin_htet',
            viber: req.requester?.viber || '09450987654',
            facebook: req.requester?.facebook || 'https://facebook.com/kyawzin.htet',
            preferredMethod: 'viber'
          },
          courier: 'Elite Cargo Express',
          trackingNumber: '',
          dispatched: false,
          confirmedReceipt: false
        },
        courierTracking: {
          route: `${req.requestedItem.city || 'Mandalay'} ⇄ ${req.offeredItem.city || 'Yangon'} Express Freight`,
          currentLocation: 'Awaiting Escrow Deposit Verification & Courier Drop-off',
          eta: 'Pending Courier Dispatch'
        }
      } : {
        meetupLocation: 'Agreed community location in ' + (req.requestedItem?.city || 'Mandalay')
      }),
      isCompleted: false,
      disputeFiled: false
    };

    setExchanges(prev => [newExchange, ...prev]);
    return newExchange;
  };

  // Reject Incoming Request
  const rejectRequest = (requestId) => {
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'Rejected' } : r));
  };

  // Cancel Outgoing Request
  const cancelRequest = (requestId) => {
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'Cancelled' } : r));
  };

  // Complete Exchange (Direct Handover / In-Person Meetup)
  const completeExchange = (exchangeId, notes = '') => {
    setExchanges(prev => prev.map(exc => {
      if (exc.id !== exchangeId) return exc;
      return {
        ...exc,
        status: 'Completed',
        isCompleted: true,
        completedDate: new Date().toISOString().split('T')[0],
        completionNotes: notes || 'Item exchanged successfully in person.'
      };
    }));
  };

  // Submit Deposit Payment Proof (Requirement 3: State 2)
  const submitDeposit = (exchangeId, partyRole = 'partyA', paymentData = {}) => {
    setExchanges(prev => prev.map(exc => {
      if (exc.id !== exchangeId) return exc;
      const currentDeposits = exc.deposits || {};
      const currentPartyDeposit = currentDeposits[partyRole] || {};
      
      const updatedPartyDeposit = {
        ...currentPartyDeposit,
        status: 'Payment Submitted',
        paymentMethod: paymentData.paymentMethod || 'KBZPay',
        referenceNumber: paymentData.referenceNumber || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
        slipImage: paymentData.slipImage || null,
        submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const updatedDeposits = {
        ...currentDeposits,
        [partyRole]: updatedPartyDeposit
      };

      return {
        ...exc,
        deposits: updatedDeposits,
        status: 'Deposit Submitted'
      };
    }));
  };

  // Verify Deposit (Admin or automated simulation)
  const verifyDeposit = (exchangeId, partyRole = 'partyA') => {
    setExchanges(prev => prev.map(exc => {
      if (exc.id !== exchangeId) return exc;
      const currentDeposits = exc.deposits || {};
      const currentPartyDeposit = currentDeposits[partyRole] || {};
      
      const updatedPartyDeposit = {
        ...currentPartyDeposit,
        status: 'Verified',
        verifiedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const updatedDeposits = {
        ...currentDeposits,
        [partyRole]: updatedPartyDeposit
      };

      const bothDepositsVerified = Boolean(
        updatedDeposits.partyA?.status === 'Verified' &&
        updatedDeposits.partyB?.status === 'Verified'
      );

      return {
        ...exc,
        deposits: updatedDeposits,
        // State 3 automatically unlocks once BOTH deposits are verified!
        intercityStage: bothDepositsVerified ? 3 : (exc.intercityStage || 2),
        status: bothDepositsVerified ? 'Deposits Verified' : exc.status
      };
    }));
  };

  // Confirm External Courier Arrangement (State 3 -> State 4)
  const confirmCourierArrangement = (exchangeId) => {
    setExchanges(prev => prev.map(exc => {
      if (exc.id !== exchangeId) return exc;
      return {
        ...exc,
        courierArrangement: {
          confirmed: true,
          confirmedAt: new Date().toISOString().split('T')[0]
        },
        intercityStage: 4, // State 4: Courier Arrangement & Shipping
        status: 'Arrangement Confirmed - Ready to Ship'
      };
    }));
  };

  // Two-Sided Confirmation (For Intercity Exchanges)
  const confirmReceipt = (exchangeId, partyRole = 'partyA', notes = '') => {
    setExchanges(prev => prev.map(exc => {
      if (exc.id !== exchangeId) return exc;
      
      const updatedPartyA = partyRole === 'partyA' 
        ? { ...(exc.partyA || {}), confirmedReceipt: true, receiptNotes: notes } 
        : (exc.partyA || { confirmedReceipt: true });

      const updatedPartyB = partyRole === 'partyB' 
        ? { ...(exc.partyB || {}), confirmedReceipt: true, receiptNotes: notes } 
        : (exc.partyB || { confirmedReceipt: true });

      const bothConfirmed = Boolean(updatedPartyA?.confirmedReceipt && updatedPartyB?.confirmedReceipt);

      return {
        ...exc,
        partyA: updatedPartyA,
        partyB: updatedPartyB,
        // When both confirmed, advance to State 6: Deposit Refund!
        intercityStage: bothConfirmed ? 6 : 5,
        status: bothConfirmed ? 'Completed' : 'Partially Received',
        isCompleted: bothConfirmed,
        completedDate: bothConfirmed ? new Date().toISOString().split('T')[0] : exc.completedDate,
        completionNotes: bothConfirmed ? 'Both members verified and confirmed receipt.' : exc.completionNotes,
        // Deposit refund workflow initiated upon successful completion
        refundWorkflow: bothConfirmed ? {
          initiated: true,
          status: 'Awaiting Member Payout Details',
          partyA: {
            amount: exc.deposits?.partyA?.amount || 100000,
            walletType: 'KBZPay',
            accountNumber: '',
            accountName: '',
            status: 'Pending Details',
            requestedAt: null,
            transactionRef: null
          },
          partyB: {
            amount: exc.deposits?.partyB?.amount || 100000,
            walletType: 'WavePay',
            accountNumber: '09450987654',
            accountName: 'Kyaw Zin Htet',
            status: 'Processing Payout',
            requestedAt: 'Today',
            transactionRef: null
          }
        } : (exc.refundWorkflow || { initiated: false, status: 'Pending' })
      };
    }));
  };

  // State 6: Submit Refund Payout Request (User enters account / phone number)
  const submitRefundRequest = (exchangeId, partyRole = 'partyA', payoutData = {}) => {
    setExchanges(prev => prev.map(exc => {
      if (exc.id !== exchangeId) return exc;
      const currentRefund = exc.refundWorkflow || {};
      const currentPartyRefund = currentRefund[partyRole] || {};

      const updatedPartyRefund = {
        ...currentPartyRefund,
        walletType: payoutData.walletType || 'KBZPay',
        accountNumber: payoutData.accountNumber || '',
        accountName: payoutData.accountName || '',
        amount: exc.deposits?.[partyRole]?.amount || 100000,
        status: 'Processing Payout',
        requestedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      return {
        ...exc,
        refundWorkflow: {
          ...currentRefund,
          initiated: true,
          status: 'Processing Payout',
          [partyRole]: updatedPartyRefund
        }
      };
    }));
  };

  // State 6: Complete Refund Payout (Admin / System simulation)
  const completeRefundPayout = (exchangeId, partyRole = 'partyA') => {
    setExchanges(prev => prev.map(exc => {
      if (exc.id !== exchangeId) return exc;
      const currentRefund = exc.refundWorkflow || {};
      const currentPartyRefund = currentRefund[partyRole] || {};

      const updatedPartyRefund = {
        ...currentPartyRefund,
        status: 'Completed',
        transactionRef: `REF-${Math.floor(100000 + Math.random() * 900000)}`,
        completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      return {
        ...exc,
        refundWorkflow: {
          ...currentRefund,
          [partyRole]: updatedPartyRefund,
          status: 'Completed'
        }
      };
    }));
  };

  // Update Courier Dispatch for Intercity Exchanges
  const updateCourierDispatch = (exchangeId, partyRole = 'partyA', dispatchData = {}) => {
    setExchanges(prev => prev.map(exc => {
      if (exc.id !== exchangeId) return exc;
      const currentParty = exc[partyRole] || {};
      const updatedParty = {
        ...currentParty,
        dispatched: true,
        courier: dispatchData.courier || currentParty.courier || 'Royal Express',
        trackingNumber: dispatchData.trackingNumber || currentParty.trackingNumber || 'RX-LIVE-TRACK',
        shippingDate: dispatchData.shippingDate || new Date().toISOString().split('T')[0],
        receiptImage: dispatchData.receiptImage || currentParty.receiptImage || null
      };

      const otherParty = partyRole === 'partyA' ? exc.partyB : exc.partyA;
      const bothDispatched = Boolean(updatedParty.dispatched && otherParty?.dispatched);

      return {
        ...exc,
        [partyRole]: updatedParty,
        intercityStage: 4,
        status: bothDispatched ? 'In Transit' : 'Dispatched'
      };
    }));
  };

  // Alias for backward compatibility
  const updateShipping = (exchangeId, partyRole = 'partyA', shippingData = {}) => {
    updateCourierDispatch(exchangeId, partyRole, shippingData);
  };

  // File Dispute / Problem (Requirement 3.H)
  const fileDispute = (disputeData) => {
    const newDispute = {
      id: `DISP-${Math.floor(100 + Math.random() * 900)}`,
      reportedItemTitle: disputeData.itemTitle,
      reportedUser: disputeData.reportedUser,
      category: disputeData.category,
      date: new Date().toISOString().split('T')[0],
      reason: disputeData.reason,
      evidenceCount: disputeData.evidenceImages?.length || disputeData.evidenceCount || 1,
      evidenceImages: disputeData.evidenceImages || (disputeData.evidenceImage ? [disputeData.evidenceImage] : []),
      status: 'Pending Admin Review',
      adminResolution: 'Our community moderation team has received your evidence and opened an inquiry.'
    };
    setDisputes(prev => [newDispute, ...prev]);

    // If related to exchange, mark as disputed
    if (disputeData.exchangeId) {
      setExchanges(prev => prev.map(e => e.id === disputeData.exchangeId ? { 
        ...e, 
        status: 'Disputed', 
        disputeFiled: true,
        disputeDetails: newDispute 
      } : e));
    }
    return newDispute;
  };

  // Notifications Handlers (Requirement 3.J)
  const markNotificationAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <ExchangeContext.Provider
      value={{
        items,
        myItems,
        requests,
        exchanges,
        disputes,
        notifications,
        unreadCount,
        addItem,
        updateItem,
        deleteItem,
        sendExchangeRequest,
        acceptRequest,
        rejectRequest,
        cancelRequest,
        submitDeposit,
        verifyDeposit,
        confirmCourierArrangement,
        updateShipping,
        updateCourierDispatch,
        confirmReceipt,
        submitRefundRequest,
        completeRefundPayout,
        completeExchange,
        fileDispute,
        markNotificationAsRead,
        markAllNotificationsAsRead
      }}
    >
      {children}
    </ExchangeContext.Provider>
  );
}

export function useExchange() {
  const context = useContext(ExchangeContext);
  if (!context) {
    throw new Error('useExchange must be used within an ExchangeProvider');
  }
  return context;
}
