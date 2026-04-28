import api from './axios';

export const categorieAPI = {
  // Récupérer toutes les catégories
  getAll: async () => {
    try {
      const response = await api.get('/categories');
      return response.data;
    } catch (error) {
      console.error('Erreur getAll categories:', error);
      throw error;
    }
  },

  // Récupérer une catégorie par ID
  getById: async (id) => {
    try {
      const response = await api.get(`/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur getById categories:', error);
      throw error;
    }
  },

  // Créer une nouvelle catégorie (admin)
  create: async (data) => {
    try {
      const response = await api.post('/categories', data);
      return response.data;
    } catch (error) {
      console.error('Erreur create category:', error);
      throw error;
    }
  },

  // Modifier une catégorie (admin)
  update: async (id, data) => {
    try {
      const response = await api.put(`/categories/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erreur update category:', error);
      throw error;
    }
  },

  // Supprimer une catégorie (admin)
  delete: async (id) => {
    try {
      const response = await api.delete(`/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur delete category:', error);
      throw error;
    }
  },
};