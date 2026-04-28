import api from './axios';

export const agentAPI = {
  // Récupérer le dashboard agent
  getDashboard: async () => {
    try {
      const response = await api.get('/agent/dashboard');
      return response.data;
    } catch (error) {
      console.error('Erreur getAgentDashboard:', error);
      throw error;
    }
  },

  // Récupérer les réclamations assignées
  getAssignedReclamations: async () => {
    try {
      const response = await api.get('/agent/reclamations');
      return response.data;
    } catch (error) {
      console.error('Erreur getAssignedReclamations:', error);
      throw error;
    }
  },

  // Mettre à jour le statut
  updateStatus: async (id, status, commentaire) => {
    try {
      const response = await api.put(`/agent/reclamations/${id}/status`, { statut: status, commentaire });
      return response.data;
    } catch (error) {
      console.error('Erreur updateStatus:', error);
      throw error;
    }
  }
};