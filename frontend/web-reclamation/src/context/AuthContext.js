import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../api/auth';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

const loadUser = () => {
  const token = localStorage.getItem('@auth_token');
  const userData = localStorage.getItem('@user_data');
  
  if (token && userData) {
    const user = JSON.parse(userData);
    console.log('👤 Utilisateur chargé:', user);
    console.log('📌 Rôle:', user.typeUtilisateur);
    console.log('🔐 isAdmin?', user.typeUtilisateur === 'Administrateur');
    console.log('🔐 isAgent?', user.typeUtilisateur === 'AgentMunicipal');
    setUser(user);
  }
  setLoading(false);
};

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      
      if (response.success) {
        localStorage.setItem('@auth_token', response.token);
        localStorage.setItem('@user_data', JSON.stringify(response.user));
        setUser(response.user);
        return { success: true };
      }
      return { success: false, error: response.message };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Erreur de connexion' };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {}
    localStorage.removeItem('@auth_token');
    localStorage.removeItem('@user_data');
    setUser(null);
  };

  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem('@user_data', JSON.stringify(newUser));
  };

  // ✅ Fonction pour obtenir le nom du rôle en français
  const getRoleName = () => {
    if (!user) return '';
    switch(user.typeUtilisateur) {
      case 'Administrateur':
        return 'Administrateur';
      case 'AgentMunicipal':
        return 'Agent Municipal';
      default:
        return 'Citoyen';
    }
  };

  // ✅ Fonction pour vérifier si l'utilisateur est admin
  const isAdmin = () => {
    return user?.typeUtilisateur === 'Administrateur';
  };

  // ✅ Fonction pour vérifier si l'utilisateur est agent
  const isAgent = () => {
    return user?.typeUtilisateur === 'AgentMunicipal';
  };

  // ✅ Fonction pour vérifier si l'utilisateur est citoyen
  const isCitoyen = () => {
    return user?.typeUtilisateur === 'Citoyen';
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      updateUser,
      getRoleName,
      isAdmin,
      isAgent,
      isCitoyen
    }}>
      {children}
    </AuthContext.Provider>
  );
};