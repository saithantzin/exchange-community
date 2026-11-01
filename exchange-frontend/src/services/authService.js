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
   * Upload user avatar / profile image.
   */
  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.post('/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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
  },

  /**
   * Get authenticated user full profile with location and contacts.
   */
  async getProfile() {
    const response = await api.get('/profile');
    return response.data;
  },

  /**
   * Update profile details and communication contacts.
   */
  async updateProfile(profileData) {
    const response = await api.put('/profile', profileData);
    return response.data;
  },

  /**
   * Update / Change password.
   */
  async changePassword(passwordData) {
    const response = await api.put('/profile/password', passwordData);
    return response.data;
  }
};

export default authService;
