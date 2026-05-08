import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { reclamationAPI } from '../../api/reclamation';
import { userAPI } from '../../api/user';
import { useAuth } from '../../context/AuthContext';
import Loader from '../common/Loader';
import { FaArrowLeft, FaMapMarkerAlt, FaCalendar, FaTag, FaFlag, FaUser, FaHistory, FaUserPlus } from 'react-icons/fa';
import './ReclamationDetail.css';

const ReclamationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reclamation, setReclamation] = useState(null);
  const [historique, setHistorique] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [commentaire, setCommentaire] = useState('');

  useEffect(() => {
    loadReclamation();
    if (user?.typeUtilisateur === 'Administrateur') {
      loadAgents();
    }
  }, [id]);

  const loadReclamation = async () => {
    try {
      const data = await reclamationAPI.getById(id);
      setReclamation(data.data);
      setHistorique(data.data?.historique || []);
    } catch (error) {
      console.error('Erreur chargement réclamation:', error);
      toast.error('Réclamation non trouvée');
      navigate('/reclamations');
    } finally {
      setLoading(false);
    }
  };

  const loadAgents = async () => {
    try {
      const response = await userAPI.getAgents();
      let agentsList = [];
      if (response.data && Array.isArray(response.data)) {
        agentsList = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        agentsList = response.data.data;
      } else if (Array.isArray(response)) {
        agentsList = response;
      }
      setAgents(agentsList);
      if (agentsList.length === 0) {
        toast.info("Aucun agent disponible. Veuillez créer des agents municipaux d'abord.");
      }
    } catch (error) {
      console.error('Erreur chargement agents:', error);
      toast.error('Erreur lors du chargement des agents');
    }
  };

  const handleAssign = async () => {
    if (!selectedAgent) {
      toast.warning('Veuillez sélectionner un agent');
      return;
    }
    try {
      await reclamationAPI.assignToAgent(id, selectedAgent);
      toast.success("Réclamation assignée à l'agent avec succès");
      setShowAssignModal(false);
      setSelectedAgent('');
      loadReclamation();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de l'assignation");
    }
  };

  const handleStatusChange = async () => {
    try {
      const response = await reclamationAPI.updateStatus(id, newStatus, commentaire);
      if (response.success) {
        toast.success(`Statut mis à jour: ${newStatus}`);
        setShowStatusModal(false);
        setCommentaire('');
        loadReclamation();
      } else {
        toast.error(response.message || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'En attente': return '#ffc107';
      case 'En cours':   return '#17a2b8';
      case 'Traitée':    return '#28a745';
      case 'Refusée':    return '#dc3545';
      default:           return '#6c757d';
    }
  };

  const getPriorityLabel = (priority) => {
    if (priority <= 2) return { text: 'Basse',   class: 'priority-low' };
    if (priority <= 4) return { text: 'Moyenne',  class: 'priority-medium' };
    if (priority <= 7) return { text: 'Haute',    class: 'priority-high' };
    return               { text: 'Urgente',  class: 'priority-urgent' };
  };

  if (loading) return <Loader />;
  if (!reclamation) return <div className="empty-state">Réclamation non trouvée</div>;

  const priorityInfo = getPriorityLabel(reclamation.priorite);
  const isAdmin  = user?.typeUtilisateur === 'Administrateur';
  const isAgent  = user?.typeUtilisateur === 'AgentMunicipal';
  const canAssign = isAdmin && !reclamation.idAgent;
  const canTreat  = isAgent && reclamation.idAgent === user?.id && reclamation.statut === 'En attente';
  const canUpdate = isAgent && reclamation.idAgent === user?.id && reclamation.statut === 'En cours';

  return (
    <div className="reclamation-detail">
      <button className="btn-back" onClick={() => navigate(-1)}>
        <FaArrowLeft /> Retour
      </button>

      <div className="detail-header">
        <h1>{reclamation.titre}</h1>
        <span className="status-badge" style={{ backgroundColor: getStatusColor(reclamation.statut) }}>
          {reclamation.statut}
        </span>
      </div>

      <div className="detail-grid">
        {/* Informations principales */}
        <div className="detail-card">
          <h3>Informations</h3>
          <div className="detail-row">
            <FaTag />
            <span className="label">Catégorie:</span>
            <span>{reclamation.nomCategorie}</span>
          </div>
          <div className="detail-row">
            <FaFlag />
            <span className="label">Priorité:</span>
            <span className={`priority-badge ${priorityInfo.class}`}>
              {priorityInfo.text} ({reclamation.priorite}/10)
            </span>
          </div>
          <div className="detail-row">
            <FaCalendar />
            <span className="label">Créée le:</span>
            <span>{new Date(reclamation.dateCreation).toLocaleString()}</span>
          </div>
          {reclamation.dateModification && (
            <div className="detail-row">
              <FaCalendar />
              <span className="label">Modifiée le:</span>
              <span>{new Date(reclamation.dateModification).toLocaleString()}</span>
            </div>
          )}
          <div className="detail-row">
            <FaUser />
            <span className="label">Citoyen:</span>
            <span>{reclamation.citoyenPrenom} {reclamation.citoyenNom}</span>
          </div>

          {/* ✅ Agent + zone */}
          {reclamation.agentNom && (
            <div className="detail-row">
              <FaUser />
              <span className="label">Agent:</span>
              <span>{reclamation.agentPrenom} {reclamation.agentNom}</span>
            </div>
          )}
          {reclamation.agentZone && (
            <div className="detail-row">
              <FaMapMarkerAlt />
              <span className="label">Zone de l'agent:</span>
              <span>{reclamation.agentZone}</span>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="detail-card">
          <h3>Description</h3>
          <p className="description-text">{reclamation.description}</p>
        </div>

        {/* Localisation */}
        {reclamation.adresse && (
          <div className="detail-card">
            <h3><FaMapMarkerAlt /> Localisation</h3>
            <p><strong>Adresse:</strong> {reclamation.adresse}</p>
            <p><strong>Ville:</strong> {reclamation.ville}</p>
            <p><strong>Quartier:</strong> {reclamation.quartier}</p>
            {reclamation.latitude && reclamation.longitude && (
              <p><strong>Coordonnées:</strong> {reclamation.latitude}, {reclamation.longitude}</p>
            )}
          </div>
        )}

        {/* Photos */}
        {reclamation.photos && reclamation.photos.length > 0 && (
          <div className="detail-card">
            <h3>Photos</h3>
            <div className="photos-grid">
              {reclamation.photos.map((photo, index) => (
<img src={`http://localhost:5000${photo.url}`} />
              ))}
            </div>
          </div>
        )}

        {/* Historique */}
        {historique.length > 0 && (
          <div className="detail-card full-width">
            <h3><FaHistory /> Historique</h3>
            <div className="timeline">
              {historique.map((item, index) => (
                <div key={index} className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <strong>{item.action}</strong>
                      <span className="timeline-date">{new Date(item.dateAction).toLocaleString()}</span>
                    </div>
                    {item.commentaire && <p>{item.commentaire}</p>}
                    <span className="timeline-user">Par: {item.utilisateur}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="detail-actions">
        {canAssign && (
          <button className="btn-primary" onClick={() => setShowAssignModal(true)}>
            <FaUserPlus /> Assigner à un agent
          </button>
        )}
        {canTreat && (
          <button className="btn-primary" onClick={() => { setNewStatus('En cours'); setShowStatusModal(true); }}>
            Prendre en charge
          </button>
        )}
        {canUpdate && (
          <>
            <button className="btn-success" onClick={() => { setNewStatus('Traitée'); setShowStatusModal(true); }}>
              Marquer comme traitée
            </button>
            <button className="btn-danger" onClick={() => { setNewStatus('Refusée'); setShowStatusModal(true); }}>
              Refuser
            </button>
          </>
        )}
      </div>

      {/* Modal assignation */}
      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Assigner à un agent</h3>
              <button className="close-btn" onClick={() => setShowAssignModal(false)}>&times;</button>
            </div>
            {agents.length === 0 ? (
              <div className="no-agents-message">
                <p>⚠️ Aucun agent disponible.</p>
                <p>Veuillez créer des agents municipaux d'abord.</p>
                <button className="btn-primary" onClick={() => { setShowAssignModal(false); navigate('/utilisateurs'); }} style={{ marginTop: '15px' }}>
                  Créer un agent
                </button>
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label>Sélectionner un agent</label>
                  <select value={selectedAgent} onChange={(e) => setSelectedAgent(e.target.value)} className="agent-select">
                    <option value="">-- Choisir un agent --</option>
                    {agents.map(agent => (
                      <option key={agent.idUtilisateur} value={agent.idUtilisateur}>
                        {agent.prenom} {agent.nom}
                        {agent.service ? ` - ${agent.service}` : ''}
                        {agent.zoneGeographique ? ` — ${agent.zoneGeographique}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="modal-footer">
                  <button className="btn-secondary" onClick={() => setShowAssignModal(false)}>Annuler</button>
                  <button className="btn-primary" onClick={handleAssign}>Assigner</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal changement de statut */}
      {showStatusModal && (
        <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Changer le statut</h3>
              <button className="close-btn" onClick={() => setShowStatusModal(false)}>&times;</button>
            </div>
            <p><strong>Réclamation:</strong> {reclamation.titre}</p>
            <p><strong>Nouveau statut:</strong>{' '}
              <span className="status-badge" style={{ backgroundColor: getStatusColor(newStatus) }}>{newStatus}</span>
            </p>
            <div className="form-group">
              <label>Commentaire (optionnel)</label>
              <textarea rows="3" value={commentaire} onChange={(e) => setCommentaire(e.target.value)} placeholder="Ajoutez un commentaire..." className="comment-textarea" />
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowStatusModal(false)}>Annuler</button>
              <button className="btn-primary" onClick={handleStatusChange}>Confirmer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReclamationDetail;