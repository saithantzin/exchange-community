import api from './api';

export const categoryService = {
  /**
   * Fetch all categories with item counts and deposit amounts.
   */
  async getCategories() {
    const response = await api.get('/categories');
    return response.data;
  },

  /**
   * (Admin) Create category.
   */
  async createCategory(categoryData) {
    const response = await api.post('/admin/categories', categoryData);
    return response.data;
  },

  /**
   * (Admin) Update category and deposit amount.
   */
  async updateCategory(id, categoryData) {
    const response = await api.put(`/admin/categories/${id}`, categoryData);
    return response.data;
  },

  /**
   * (Admin) Delete category.
   */
  async deleteCategory(id) {
    const response = await api.delete(`/admin/categories/${id}`);
    return response.data;
  }
};

export default categoryService;
