import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🔴 REMPLACEZ PAR VOTRE URL NGROK ACTUELLE (pointant sur le backend)
const BASE_URL = '  https://thallous-anamnestically-merrill.ngrok-free.dev/api';

console.log('🌐 API URL:', BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true', // Évite l’avertissement ngrok
  },
});

// 🔹 Intercepteur pour ajouter le token si existant (AVEC LOGS DÉTAILLÉS)
api.interceptors.request.use(
  async (config) => {
    console.log(`\n📤 ${config.method.toUpperCase()} ${config.url}`);
    
    // 🔍 LOGS POUR LE TOKEN
    const token = await AsyncStorage.getItem('@auth_token');
    console.log('🔐 Token récupéré de AsyncStorage:', token ? '✅ Présent' : '❌ MANQUANT');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Token ajouté au header Authorization');
      console.log('📋 Header complet:', config.headers);
    } else {
      console.log('⚠️ Aucun token trouvé, requête sans authentification');
    }
    
    if (config.data) {
      console.log('📦 Données envoyées:', config.data);
    }
    return config;
  },
  (error) => {
    console.error('❌ Erreur requête:', error);
    return Promise.reject(error);
  }
);

// 🔹 Intercepteur pour gérer les réponses
api.interceptors.response.use(
  (response) => {
    console.log(`📥 Réponse ${response.status}:`, response.data);
    return response;
  },
  async (error) => {
    console.error('\n❌ Erreur réponse:');
    console.error('   Message:', error.message);
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
      console.error('   Headers:', error.response.headers);
      
      if (error.response.status === 401) {
        console.log('🔐 Token 401 - nettoyage...');
        await AsyncStorage.removeItem('@auth_token');
        await AsyncStorage.removeItem('@user_data');
        console.log('✅ Token supprimé');
      }
    } else if (error.request) {
      console.error('   Pas de réponse du serveur');
    } else {
      console.error('   Erreur:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;