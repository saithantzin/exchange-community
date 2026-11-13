import api from './api';

/**
 * Exchange & Deposit API Service
 * Encapsulates all Intercity Exchange workflow endpoints for Laravel API integration.
 * Provides fallback mock responses when Laravel backend endpoints are not connected.
 */
export const exchangeService = {
  // Fetch Dynamic Exchange Requests from Backend API
  async getExchangeRequests(params = {}) {
    const res = await api.get('/exchange-requests', { params });
    return res.data;
  },

  // Create / Propose a new Exchange Request
  async createExchangeRequest(payload) {
    const res = await api.post('/exchange-requests', payload);
    return res.data;
  },

  // Get single exchange request by ID
  async getExchangeRequestById(id) {
    const res = await api.get(`/exchange-requests/${id}`);
    return res.data;
  },

  // Accept an incoming exchange proposal
  async acceptExchangeRequest(id) {
    const res = await api.post(`/exchange-requests/${id}/accept`);
    return res.data;
  },

  // Reject an incoming exchange proposal
  async rejectExchangeRequest(id) {
    const res = await api.post(`/exchange-requests/${id}/reject`);
    return res.data;
  },

  // Cancel an outgoing exchange proposal
  async cancelExchangeRequest(id) {
    const res = await api.post(`/exchange-requests/${id}/cancel`);
    return res.data;
  },

  // Fetch real Exchange History from Backend API
  async getExchangeHistory(params = {}) {
    try {
      const res = await api.get('/exchange-history', { params });
      return res.data;
    } catch (err) {
      console.warn('Failed to fetch /exchange-history, fallback to empty:', err?.message);
      return { success: false, data: [] };
    }
  },

  // Submit Partner Review / Rating
  async submitExchangeReview(exchangeId, payload) {
    const res = await api.post(`/exchange-requests/${exchangeId}/review`, payload);
    return res.data;
  },

  // Fetch Category Deposit Rates
  async getCategoryDeposits() {
    try {
      const res = await api.get('/categories/deposits');
      return res.data;
    } catch {
      return {
        electronics: 100000,
        laptops: 150000,
        books: 20000,
        clothing: 30000,
        furniture: 50000,
        kitchenware: 40000,
        appliances: 80000,
        default: 50000
      };
    }
  },

  // Submit Deposit Payment Proof (KBZPay, WavePay, etc.)
  async submitDeposit(exchangeId, payload) {
    const cleanId = String(exchangeId).replace(/^#/, '').trim();
    const res = await api.post(`/exchanges/${cleanId}/deposit`, payload, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  // Complete an exchange (In-Person Handover or Courier receipt)
  async completeExchange(exchangeId, payload = {}) {
    const cleanId = String(exchangeId).replace(/^#/, '').trim();
    const res = await api.post(`/exchanges/${cleanId}/complete`, payload);
    return res.data;
  },

  // Confirm In-Person Handover (Two-Sided)
  async confirmHandover(exchangeId, payload = {}) {
    const cleanId = String(exchangeId).replace(/^#/, '').trim();
    const res = await api.post(`/exchanges/${cleanId}/handover`, payload);
    return res.data;
  },

  // Admin: Get all platform exchanges
  async getAdminExchanges(params = {}) {
    const res = await api.get('/admin/exchanges', { params });
    return res.data;
  },

  // Admin: Get single exchange with real deposits & workflow
  async adminGetExchange(id) {
    const cleanId = String(id).replace(/^#/, '').trim();
    const res = await api.get(`/admin/exchanges/${cleanId}`);
    return res.data;
  },

  // Admin: Get pending escrow deposit slips (Intercity Courier Delivery only)
  async getAdminPendingDeposits(params = {}) {
    const res = await api.get('/admin/pending-deposits', { params });
    return res.data;
  },

  async getAdminDepositEvidence(id, partyRole) {
    const cleanId = String(id).replace(/^#/, '').trim();
    const res = await api.get(`/admin/exchanges/${cleanId}/deposits/${partyRole}/evidence`, {
      responseType: 'blob'
    });
    return URL.createObjectURL(res.data);
  },

  // Admin: Approve escrow deposit
  async adminApproveDeposit(id, payload) {
    const cleanId = String(id).replace(/^#/, '').trim();
    const res = await api.post(`/admin/exchanges/${cleanId}/deposit/approve`, payload);
    return res.data;
  },

  // Admin: Reject escrow deposit
  async adminRejectDeposit(id, payload) {
    const cleanId = String(id).replace(/^#/, '').trim();
    const res = await api.post(`/admin/exchanges/${cleanId}/deposit/reject`, payload);
    return res.data;
  },

  // Admin: Process deposit refund payout
  async adminProcessRefund(id, payload) {
    const cleanId = String(id).replace(/^#/, '').trim();
    const res = await api.post(`/admin/exchanges/${cleanId}/refund/process`, payload);
    return res.data;
  },

  // Confirm External Courier Arrangement (State 3 -> State 4)
  async confirmCourierArrangement(exchangeId) {
    const cleanId = String(exchangeId).replace(/^#/, '').trim();
    const res = await api.post(`/exchanges/${cleanId}/courier/confirm-arrangement`);
    return res.data;
  },

  // Submit Courier Shipping & Waybill Info
  async submitShipping(exchangeId, payload) {
    const cleanId = String(exchangeId).replace(/^#/, '').trim();
    const res = await api.post(`/exchanges/${cleanId}/shipping`, payload, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  async getShippingEvidence(exchangeId, partyRole) {
    const cleanId = String(exchangeId).replace(/^#/, '').trim();
    const res = await api.get(`/exchanges/${cleanId}/shipping/${partyRole}/evidence`, {
      responseType: 'blob'
    });
    return URL.createObjectURL(res.data);
  },

  // Confirm Parcel Receipt (State 5)
  async confirmReceipt(exchangeId, payload) {
    const cleanId = String(exchangeId).replace(/^#/, '').trim();
    const res = await api.post(`/exchanges/${cleanId}/receipt/confirm`, payload);
    return res.data;
  },

  // Submit Deposit Refund Account Details (State 6)
  async requestRefund(exchangeId, payload) {
    const cleanId = String(exchangeId).replace(/^#/, '').trim();
    const res = await api.post(`/exchanges/${cleanId}/deposit/request-refund`, payload);
    return res.data;
  },

  // Process / Complete Escrow Deposit Refund (State 6 completion)
  async processRefundPayout(exchangeId, partyRole = 'partyA') {
    const cleanId = String(exchangeId).replace(/^#/, '').trim();
    const res = await api.post(`/exchanges/${cleanId}/deposit/refund/process`, { partyRole });
    return res.data;
  },

  // Trigger Escrow Deposit Refund (legacy alias)
  async refundDeposit(exchangeId) {
    return this.processRefundPayout(exchangeId);
  }
};

export default exchangeService;
