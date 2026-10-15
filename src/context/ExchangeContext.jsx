import React, { createContext, useContext, useState } from 'react';
import {
  INITIAL_ITEMS,
  CURRENT_USER_ITEMS,
  INITIAL_REQUESTS,
  INITIAL_EXCHANGES,
  INITIAL_DISPUTES,
  INITIAL_NOTIFICATIONS
} from '../data/mockData';
import { useAuth } from './AuthContext';

const ExchangeContext = createContext();

export function ExchangeProvider({ children }) {
  const { currentUser } = useAuth();

  const [items, setItems] = useState(INITIAL_ITEMS);
  const [myItems, setMyItems] = useState(CURRENT_USER_ITEMS);
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [exchanges, setExchanges] = useState(INITIAL_EXCHANGES);
  const [disputes, setDisputes] = useState(INITIAL_DISPUTES);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  // Add Item (Requirement 3.B & 3.C)
  const addItem = (itemData) => {
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
  const updateItem = (id, updatedFields) => {
    setMyItems(prev => prev.map(item => item.id === id ? { ...item, ...updatedFields } : item));
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...updatedFields } : item));
  };

  // Delete Item
  const deleteItem = (id) => {
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
    if (!req) return;

    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'Accepted' } : r));

    // Automatically instantiate an ongoing exchange
    const newExchange = {
      id: `EXC-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'In Progress',
      initiatedDate: new Date().toISOString().split('T')[0],
      itemA: {
        title: req.requestedItem.title,
        ownerName: `${currentUser?.name || 'You'} (You)`,
        ownerCity: req.requestedItem.city,
        image: req.requestedItem.image
      },
      itemB: {
        title: req.offeredItem.title,
        ownerName: req.requester?.name || 'Partner',
        ownerCity: req.offeredItem?.city || 'Local',
        image: req.offeredItem?.image
      },
      handoverMethod: req.handoverMethod || 'In-Person Meetup',
      meetupLocation: 'Agreed community location',
      isCompleted: false,
      disputeFiled: false
    };

    setExchanges(prev => [newExchange, ...prev]);
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
        status: bothConfirmed ? 'Completed' : 'Partially Received',
        isCompleted: bothConfirmed,
        completedDate: bothConfirmed ? new Date().toISOString().split('T')[0] : exc.completedDate,
        completionNotes: bothConfirmed ? 'Both members verified and confirmed receipt.' : exc.completionNotes
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
        trackingNumber: dispatchData.trackingNumber || currentParty.trackingNumber || 'RX-LIVE-TRACK'
      };
      return {
        ...exc,
        [partyRole]: updatedParty,
        status: 'In Transit'
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
      evidenceCount: disputeData.evidenceCount || 1,
      status: 'Pending Admin Review',
      adminResolution: 'Our community moderation team has received your evidence and opened an inquiry.'
    };
    setDisputes(prev => [newDispute, ...prev]);

    // If related to exchange, mark as disputed
    if (disputeData.exchangeId) {
      setExchanges(prev => prev.map(e => e.id === disputeData.exchangeId ? { ...e, status: 'Disputed', disputeFiled: true } : e));
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
        updateShipping,
        updateCourierDispatch,
        confirmReceipt,
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
