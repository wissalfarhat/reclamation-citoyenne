import api from './axios';

export const userAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/admin/users');
      return response.data;
    } catch (error) {
      console.error('Erreur getAll users:', error);
      throw error;
    }
  },

  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/admin/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur delete user:', error);
      throw error;
    }
  },

  createAgent: async (data) => {
    try {
      const response = await api.post('/auth/register', {
        nom:              data.nom,
        prenom:           data.prenom,
        email:            data.email,
        motDePasse:       data.motDePasse,
        typeUtilisateur:  'AgentMunicipal',
        telephone:        data.telephone        || '',
        service:          data.service          || '',
        zoneGeographique: data.zoneGeographique || '',
      });
      return response.data;
    } catch (error) {
      console.error('Erreur createAgent:', error);
      throw error;
    }
  },

  createAdmin: async (data) => {
    try {
      const response = await api.post('/auth/register', {
        nom:             data.nom,
        prenom:          data.prenom,
        email:           data.email,
        motDePasse:      data.motDePasse,
        typeUtilisateur: 'Administrateur',
        telephone:       data.telephone || '',
        service:         data.service   || '',
      });
      return response.data;
    } catch (error) {
      console.error('Erreur createAdmin:', error);
      throw error;
    }
  },

  createUser: async (data) => {
    try {
      const response = await api.post('/auth/register', {
        nom:              data.nom,
        prenom:           data.prenom,
        email:            data.email,
        motDePasse:       data.motDePasse,
        typeUtilisateur:  data.typeUtilisateur,
        telephone:        data.telephone        || '',
        service:          data.service          || '',
        zoneGeographique: data.zoneGeographique || '',
      });
      return response.data;
    } catch (error) {
      console.error('Erreur createUser:', error);
      throw error;
    }
  },

  // ✅ Fixed - now sends typeUtilisateur
  updateUser: async (id, data) => {
    try {
      const response = await api.put(`/admin/users/${id}`, {
        nom:              data.nom,
        prenom:           data.prenom,
        telephone:        data.telephone        || '',
        service:          data.service          || '',
        zoneGeographique: data.zoneGeographique || '',
        typeUtilisateur:  data.typeUtilisateur,  // ✅ This was missing
      });
      return response.data;
    } catch (error) {
      console.error('Erreur updateUser:', error);
      throw error;
    }
  },

  getAgents: async () => {
    try {
      const response = await api.get('/agent/all');
      return response.data;
    } catch (error) {
      console.error('Erreur getAgents:', error);
      throw error;
    }
  },
};