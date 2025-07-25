import api from './index';

export const productsAPI = {
  // Get all products (with optional myUploads param)
  getAll: async (params = {}) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  // Get product by ID
  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Create new product (admin only)
  create: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  // Update product (admin only)
  update: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  // Delete product (admin only)
  delete: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  // Get products uploaded by the current user
  getMyUploads: async () => {
    const response = await api.get('/products?myUploads=1');
    return response.data;
  },

  // Approve a product (admin)
  approve: async (id) => {
    const response = await api.put(`/products/${id}/approve`);
    return response.data;
  },

  // Reject a product (admin)
  reject: async (id) => {
    const response = await api.put(`/products/${id}/reject`);
    return response.data;
  },

  // Get all pending products (admin only)
  getPending: async () => {
    const response = await api.get('/products/pending');
    return response.data;
  }
}; 