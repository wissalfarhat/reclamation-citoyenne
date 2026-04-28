import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FaHome, FaList, FaMapMarkedAlt, FaChartBar, 
  FaUsers, FaFolder, FaCog, FaTasks 
} from 'react-icons/fa';

const Sidebar = () => {
  const { isAdmin, isAgent } = useAuth();
  const navigate = useNavigate();

  // Log pour déboguer
  console.log('Sidebar rendu - isAdmin:', isAdmin(), 'isAgent:', isAgent());

  const handleClick = (path) => {
    console.log('Navigation vers:', path);
    navigate(path);
  };

  return (
    <aside className="sidebar">
      <nav>
        <NavLink 
          to="/" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          end
        >
          <FaHome /> Tableau de bord
        </NavLink>
        
        <NavLink 
          to="/reclamations" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <FaList /> Réclamations
        </NavLink>
        
        <NavLink 
          to="/map" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <FaMapMarkedAlt /> Carte
        </NavLink>
        
        {isAgent() && (
          <NavLink 
            to="/agent/reclamations" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <FaTasks /> Mes réclamations
          </NavLink>
        )}
        
        {isAdmin() && (
          <>
            <NavLink 
              to="/statistiques" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <FaChartBar /> Statistiques
            </NavLink>
            <NavLink 
              to="/utilisateurs" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <FaUsers /> Utilisateurs
            </NavLink>
            <NavLink 
              to="/categories" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <FaFolder /> Catégories
            </NavLink>
          </>
        )}
        
        <NavLink 
          to="/profile" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <FaCog /> Mon profil
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;