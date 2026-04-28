import api from './axios';

export const reclamationAPI = {
  getMyReclamations: async () => {
    const response = await api.get('/citoyen/reclamations');
    return response.data;
  },

  getReclamationById: async (id) => {
    const response = await api.get(`/reclamations/${id}`);
    return response.data;
  },

  createReclamation: async (formData) => {
    const response = await api.post('/reclamations', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

 // ✅ Add these to your reclamationAPI object
getNotifications: async () => {
  const response = await api.get('/notifications');
  return response.data;
},

markNotificationAsRead: async (id) => {
  const response = await api.put(`/notifications/${id}/read`);
  return response.data;
},

markAllNotificationsAsRead: async () => {
  const response = await api.put('/notifications/read-all');
  return response.data;
},

getUnreadCount: async () => {
  const response = await api.get('/notifications/unread-count');
  return response.data;
},
getHistorique: async (id) => {
  const response = await api.get(`/reclamations/${id}/historique`);
  return response.data;
},
};