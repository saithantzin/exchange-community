import api from './api';

export const itemService = {
  /**
   * Browse items dynamically with search, category, condition, location filters.
   */
  async getItems(params = {}) {
    const response = await api.get('/items', { params });
    return response.data;
  },

  /**
   * Get item details by ID.
   */
  async getItemById(id) {
    const response = await api.get(`/items/${id}`);
    return response.data;
  },

  /**
   * (Auth) Create a new item.
   */
  async createItem(itemData) {
    const response = await api.post('/items', itemData);
    return response.data;
  },

  /**
   * (Auth) Update an existing item.
   */
  async updateItem(id, itemData) {
    const response = await api.put(`/items/${id}`, itemData);
    return response.data;
  },

  /**
   * (Auth) Delete an item.
   */
  async deleteItem(id) {
    const response = await api.delete(`/items/${id}`);
    return response.data;
  },

  /**
   * (Auth) Get current user's items.
   */
  async getMyItems() {
    const response = await api.get('/my-items');
    return response.data;
  },

  /**
   * (Auth) Upload an item image file.
   */
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/items/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};

export default itemService;
