import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye } from 'react-icons/fa';

const ReclamationTable = ({ reclamations, onAssign, agents = [] }) => {
  const navigate = useNavigate();

  const getStatusColor = (status) => {
    switch (status) {
      case 'En attente': return '#ffc107';
      case 'En cours':   return '#17a2b8';
      case 'Traitée':    return '#28a745';
      case 'Refusée':    return '#dc3545';
      default:           return '#6c757d';
    }
  };

  const getPriorityClass = (priority) => {
    if (priority <= 2) return 'priority-low';
    if (priority <= 4) return 'priority-medium';
    if (priority <= 7) return 'priority-high';
    return 'priority-urgent';
  };

  return (
    <div className="reclamation-table-container">
      <table className="reclamation-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Titre</th>
            <th>Catégorie</th>
            <th>Statut</th>
            <th>Priorité</th>
            <th>Zone</th>
            <th>Agent</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reclamations.map((rec) => (
            <tr key={rec.idReclamation}>
              <td>{rec.idReclamation}</td>
              <td className="reclamation-title">{rec.titre}</td>
              <td>{rec.nomCategorie || '-'}</td>
              <td>
                <span className="status-badge" style={{ backgroundColor: getStatusColor(rec.statut) }}>
                  {rec.statut}
                </span>
              </td>
              <td>
                <span className={`priority-badge ${getPriorityClass(rec.priorite)}`}>
                  {rec.priorite}/10
                </span>
              </td>

              {/* ✅ Zone = ville de la réclamation (ne change pas après assignation) */}
              <td>{rec.ville || rec.quartier || '-'}</td>

              {/* ✅ Nom de l'agent */}
              <td>
                {rec.agentNom
                  ? `${rec.agentPrenom || ''} ${rec.agentNom}`
                  : <span style={{ color: '#aaa', fontStyle: 'italic' }}>Non assigné</span>
                }
              </td>

              <td>{new Date(rec.dateCreation).toLocaleDateString()}</td>
              <td className="actions">
                <button
                  className="btn-icon"
                  onClick={() => navigate(`/reclamations/${rec.idReclamation}`)}
                  title="Voir détails"
                >
                  <FaEye />
                </button>

                {rec.statut === 'En attente' && !rec.idAgent && agents.length > 0 && onAssign && (

                  <select
                    className="assign-select"
                    onChange={(e) => onAssign(rec.idReclamation, e.target.value)}
                    defaultValue=""
                  >
                    <option value="" disabled>Assigner à...</option>
                    {agents.map(agent => (
                      <option key={agent.idUtilisateur} value={agent.idUtilisateur}>
                        {agent.prenom} {agent.nom}
                        {agent.zoneGeographique ? ` — ${agent.zoneGeographique}` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReclamationTable;