import api from './index';

export const contactAPI = {
  submitContact: async (contactData) => {
    console.log('Submitting contact data:', contactData);
    const response = await api.post('/contact/submit', contactData);
    return response.data;
  },

  getAllContacts: async () => {
    console.log('Fetching all contacts...');
    try {
      const response = await api.get('/contact');
      console.log('Contacts response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching contacts:', error);
      throw error;
    }
  },

  updateContactStatus: async (contactId, status) => {
    const response = await api.put(`/contact/${contactId}/status`, { status });
    return response.data;
  },

  deleteContact: async (contactId) => {
    const response = await api.delete(`/contact/${contactId}`);
    return response.data;
  }
}; 