import api from './axios';

export const statsAPI = {
  // Récupérer les statistiques du dashboard
  getDashboard: async () => {
    try {
      console.log('📊 Appel API: GET /stats/dashboard');
      const response = await api.get('/stats/dashboard');
      console.log('📥 Réponse stats:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getDashboard:', error);
      throw error;
    }
  },

  // Récupérer les stats globales
  getGlobal: async () => {
    try {
      const response = await api.get('/stats/global');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getGlobal:', error);
      throw error;
    }
  },

  // Récupérer les stats par statut
  getByStatus: async (periode = 'mois') => {
    try {
      const response = await api.get(`/stats/status?periode=${periode}`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getByStatus:', error);
      throw error;
    }
  },

  // Récupérer les stats par catégorie
  getByCategory: async () => {
    try {
      const response = await api.get('/stats/categories');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getByCategory:', error);
      throw error;
    }
  },

  // Récupérer l'évolution mensuelle
  getMonthlyEvolution: async (annee = null) => {
    try {
      const url = annee ? `/stats/monthly?annee=${annee}` : '/stats/monthly';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getMonthlyEvolution:', error);
      throw error;
    }
  },

  // Récupérer la performance des agents
  getAgentPerformance: async () => {
    try {
      const response = await api.get('/stats/agents');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getAgentPerformance:', error);
      throw error;
    }
  },

  // Récupérer les stats géographiques
  getGeographique: async () => {
    try {
      const response = await api.get('/stats/geographique');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getGeographique:', error);
      throw error;
    }
  },

  // Récupérer les délais de traitement
  getDelais: async () => {
    try {
      const response = await api.get('/stats/delais');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getDelais:', error);
      throw error;
    }
  },

  // Récupérer le taux de satisfaction
  getSatisfaction: async () => {
    try {
      const response = await api.get('/stats/satisfaction');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getSatisfaction:', error);
      throw error;
    }
  },
};