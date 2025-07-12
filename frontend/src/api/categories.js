import api from './index';

export const categoriesAPI = {
  // Get all active categories
  getAll: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  // Get all categories (including inactive for admin)
  getAllAdmin: async () => {
    const response = await api.get('/categories/all');
    return response.data;
  },

  // Get category by ID
  getById: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  // Create new category (admin only)
  create: async (categoryData) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },

  // Update category (admin only)
  update: async (id, categoryData) => {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  // Delete category (admin only)
  delete: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  }
}; 