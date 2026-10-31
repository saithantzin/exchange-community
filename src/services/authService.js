import api from './api';

export const authService = {
  /**
   * Register a new member.
   */
  async register(data) {
    const response = await api.post('/register', data);
    return response.data;
  },

  /**
   * User / Member login.
   */
  async login(credentials) {
    const response = await api.post('/login', credentials);
    return response.data;
  },

  /**
   * Admin portal login.
   */
  async adminLogin(credentials) {
    const response = await api.post('/admin/login', credentials);
    return response.data;
  },

  /**
   * Get authenticated user profile.
   */
  async getMe() {
    const response = await api.get('/me');
    return response.data;
  },

  /**
   * Logout user.
   */
  async logout() {
    try {
      await api.post('/logout');
    } catch (e) {
      console.warn('Logout API failed or token already invalid', e);
    }
  },

  /**
   * Get Myanmar states, regions & townships.
   */
  async getLocations() {
    const response = await api.get('/locations');
    return response.data;
  }
};

export default authService;
