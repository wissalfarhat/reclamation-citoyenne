import api from './axios';

export const reclamationAPI = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/reclamations${params ? '?' + params : ''}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/reclamations/${id}`);
    return response.data;
  },

  getAssigned: async () => {
    try {
      const response = await api.get('/agent/reclamations');
      return response.data;
    } catch (error) {
      console.error('Erreur getAssigned:', error);
      throw error;
    }
  },

    updateStatus: async (id, status, commentaire) => {
    console.log(` Mise à jour statut: /agent/reclamations/${id}/status`);
    console.log(` Données:`, { statut: status, commentaire });
    
    const response = await api.put(`/agent/reclamations/${id}/statut`, { 
      statut: status, 
      commentaire 
    });
    return response.data;
  },

  assignToAgent: async (id, idAgent) => {
    const response = await api.put(`/reclamations/${id}/assign`, { idAgent });
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/stats/dashboard');
    return response.data;
  },

  getStatsByCategory: async () => {
    const response = await api.get('/reclamations/stats/categories');
    return response.data;
  },
    addComment: async (id, commentaire) => {
    try {
      const response = await api.post(`/agent/reclamations/${id}/commentaire`, {
        commentaire: commentaire
      });
      return response.data;
    } catch (error) {
      console.error('Erreur addComment:', error);
      throw error;
    }
  },
};