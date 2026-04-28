import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const isAuthenticated = user !== null;

  // ============================================
  // METTRE À JOUR L'UTILISATEUR (NOUVELLE FONCTION)
  // ============================================
  const updateUser = (updatedData) => {
    setUser(prevUser => {
      const newUser = { ...prevUser, ...updatedData };
      console.log('👤 Mise à jour utilisateur:', newUser);
      return newUser;
    });
  };

  // ============================================
  // CHARGER L'UTILISATEUR AU DÉMARRAGE
  // ============================================
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      console.log('🔍 Chargement de l\'utilisateur...');
      
      const token = await AsyncStorage.getItem('@auth_token');
      console.log('🔐 Token trouvé:', token ? '✅ Oui' : '❌ Non');
      
      if (!token) {
        setLoading(false);
        return;
      }

      const userData = await AsyncStorage.getItem('@user_data');
      console.log('👤 Données utilisateur stockées:', userData ? '✅ Présentes' : '❌ Manquantes');
      
      if (userData) {
        setUser(JSON.parse(userData));
        console.log('✅ Utilisateur restauré depuis AsyncStorage');
      } else {
        try {
          console.log('🔄 Validation du token avec le backend...');
          const response = await api.get('/auth/profile');
          if (response.data.success) {
            setUser(response.data.user);
            await AsyncStorage.setItem('@user_data', JSON.stringify(response.data.user));
            console.log('✅ Utilisateur validé et restauré depuis le backend');
          }
        } catch (error) {
          console.log('⚠️ Token invalide, nettoyage...');
          await AsyncStorage.removeItem('@auth_token');
          await AsyncStorage.removeItem('@user_data');
        }
      }
    } catch (error) {
      console.error('❌ Erreur chargement utilisateur:', error);
    } finally {
      setLoading(false);
      console.log('🏁 Chargement terminé, loading = false');
    }
  };

  // ============================================
  // CONNEXION
  // ============================================
  const login = async (email, password) => {
    try {
      setLoading(true);
      console.log('🔑 Tentative connexion:', email);
      
      const response = await api.post('/auth/login', { 
        email, 
        motDePasse: password
      });
      
      console.log('📥 Réponse:', response.data);
      
      if (response.data.success) {
        await AsyncStorage.setItem('@auth_token', response.data.token);
        await AsyncStorage.setItem('@user_data', JSON.stringify(response.data.user));
        
        setUser(response.data.user);
        console.log('✅ Utilisateur connecté');
        return { success: true };
      } else {
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      console.error('❌ Erreur login:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erreur de connexion' 
      };
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // INSCRIPTION
  // ============================================
  const register = async (userData) => {
    try {
      setLoading(true);
      console.log('📝 Tentative inscription:', userData.email);
      
      const response = await api.post('/auth/register', userData);
      console.log('📥 Réponse:', response.data);
      
      if (response.data.success) {
        return { success: true, message: 'Inscription réussie' };
      } else {
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      console.error('❌ Erreur register:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erreur d\'inscription' 
      };
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // DÉCONNEXION
  // ============================================
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('@auth_token');
      await AsyncStorage.removeItem('@user_data');
      console.log('✅ Token et données supprimés');
    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error);
    } finally {
      setUser(null);
      console.log('👤 Utilisateur déconnecté');
    }
  };

  // ✅ FOURNIR TOUTES LES VALEURS, Y COMPRIS updateUser
  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isAuthenticated,
      login, 
      register, 
      logout,
      updateUser  // ← AJOUTÉ ICI
    }}>
      {children}
    </AuthContext.Provider>
  );
};