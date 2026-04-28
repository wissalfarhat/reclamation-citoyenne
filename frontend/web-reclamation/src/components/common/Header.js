import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaSignOutAlt, FaBell } from 'react-icons/fa';

const Header = () => {
  const { user, logout, getRoleName } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-left">
        <h1>Gestion des Réclamations</h1>
      </div>
      <div className="header-right">
        <button className="notification-btn">
          <FaBell />
          <span className="badge">0</span>
        </button>
        <div className="user-menu">
          <div className="user-info">
            <FaUser />
            <div className="user-details">
              <span className="user-name">{user?.prenom} {user?.nom}</span>
              <span className="user-role">{getRoleName()}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn" title="Déconnexion">
            <FaSignOutAlt />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;