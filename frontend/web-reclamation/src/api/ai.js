import api from './axios';

export const aiAPI = {
  suggest: async (titre, description) => {
    const response = await api.post('/ai/suggest', { titre, description });
    return response.data;
  },
  trends: async () => {
    const response = await api.get('/ai/trends');
    return response.data;
  },
};