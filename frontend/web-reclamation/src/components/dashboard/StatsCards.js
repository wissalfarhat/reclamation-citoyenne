import React from 'react';
import { FaList, FaHourglassHalf, FaSpinner, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const StatsCards = ({ stats }) => {
  // Vérifier si les stats existent
  if (!stats) {
    return (
      <div className="stats-cards">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="stat-card loading">
            <div className="stat-info">
              <h3>—</h3>
              <p>Chargement...</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    { 
      title: 'Total', 
      value: stats.totalReclamations || 0, 
      icon: FaList, 
      color: '#667eea' 
    },
    { 
      title: 'En attente', 
      value: stats.enAttente || 0, 
      icon: FaHourglassHalf, 
      color: '#ffc107' 
    },
    { 
      title: 'En cours', 
      value: stats.enCours || 0, 
      icon: FaSpinner, 
      color: '#17a2b8' 
    },
    { 
      title: 'Traitées', 
      value: stats.traitees || 0, 
      icon: FaCheckCircle, 
      color: '#28a745' 
    },
    { 
      title: 'Refusées', 
      value: stats.refusees || 0, 
      icon: FaTimesCircle, 
      color: '#dc3545' 
    },
  ];

  return (
    <div className="stats-cards">
      {cards.map((card, index) => (
        <div key={index} className="stat-card" style={{ borderLeftColor: card.color }}>
          <div className="stat-info">
            <h3>{card.value}</h3>
            <p>{card.title}</p>
          </div>
          <card.icon className="stat-icon" style={{ color: card.color }} />
        </div>
      ))}
    </div>
  );
};

export default StatsCards;