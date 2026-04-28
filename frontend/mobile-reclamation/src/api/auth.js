import api from './axios';

export const authAPI = {
  // ============================================
  // INSCRIPTION
  // ============================================
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // ============================================
  // CONNEXION
  // ============================================
  login: async (email, password) => {
    const response = await api.post('/auth/login', { 
      email, 
      motDePasse: password
    });
    return response.data;
  },

  // ============================================
  // MOT DE PASSE OUBLIÉ
  // ============================================
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // ============================================
  // RÉINITIALISER LE MOT DE PASSE
  // ============================================
  resetPassword: async (token, newPassword) => {
    const response = await api.post('/auth/reset-password', {
      token,
      nouveauMotDePasse: newPassword,
    });
    return response.data;
  },

  // ============================================
  // CHANGER LE MOT DE PASSE (connecté)
  // ============================================
  changePassword: async (data) => {
    const response = await api.put('/auth/change-password', data);
    return response.data;
  },

  // ============================================
  // DÉCONNEXION
  // ============================================
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // ============================================
  // RÉCUPÉRER LE PROFIL
  // ============================================
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // ============================================
  // METTRE À JOUR LE PROFIL (MANQUANT)
  // ============================================
  updateProfile: async (data) => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },
};