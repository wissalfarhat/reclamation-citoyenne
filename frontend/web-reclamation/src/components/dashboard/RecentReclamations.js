import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaMapMarkerAlt, FaCalendar } from 'react-icons/fa';

const RecentReclamations = ({ reclamations }) => {
  const navigate = useNavigate();

  const getStatusColor = (status) => {
    switch(status) {
      case 'En attente': return '#ffc107';
      case 'En cours': return '#17a2b8';
      case 'Traitée': return '#28a745';
      case 'Refusée': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return date.toLocaleDateString('fr-FR');
  };

  if (!reclamations || reclamations.length === 0) {
    return (
      <div className="empty-state">
        <p>Aucune réclamation récente</p>
      </div>
    );
  }

  // ✅ Trier par date décroissante (les plus récentes d'abord)
  const sortedReclamations = [...reclamations].sort((a, b) => 
    new Date(b.dateCreation) - new Date(a.dateCreation)
  );

  return (
    <div className="recent-list">
      {sortedReclamations.slice(0, 5).map((rec) => (
        <div key={rec.idReclamation} className="recent-item">
          <div className="recent-info">
            <h4>{rec.titre}</h4>
            <div className="recent-meta">
              <span className="recent-category">
                <FaMapMarkerAlt /> {rec.nomCategorie || 'Non catégorisé'}
              </span>
              <span className="recent-date">
                <FaCalendar /> {formatDate(rec.dateCreation)}
              </span>
            </div>
          </div>
          <div className="recent-status">
            <span 
              className="status-badge" 
              style={{ backgroundColor: getStatusColor(rec.statut) }}
            >
              {rec.statut}
            </span>
            <button 
              className="btn-icon" 
              onClick={() => navigate(`/reclamations/${rec.idReclamation}`)}
              title="Voir détails"
            >
              <FaEye />
            </button>
          </div>
        </div>
      ))}
      
      {sortedReclamations.length > 5 && (
        <div className="view-all">
          <button 
            className="btn-link" 
            onClick={() => navigate('/reclamations')}
          >
            Voir toutes les réclamations →
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentReclamations;