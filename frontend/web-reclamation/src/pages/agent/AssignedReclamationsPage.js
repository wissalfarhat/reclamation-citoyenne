import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { reclamationAPI } from '../../api/reclamation';
import Loader from '../../components/common/Loader';
import { FaEye, FaCheck, FaTimes, FaPlay } from 'react-icons/fa';
import './AssignedReclamationsPage.css';

const AssignedReclamationsPage = () => {
  const navigate = useNavigate();
  const [reclamations, setReclamations]             = useState([]);
  const [loading, setLoading]                       = useState(true);
  const [showModal, setShowModal]                   = useState(false);
  const [selectedReclamation, setSelectedReclamation] = useState(null);
  const [commentaire, setCommentaire]               = useState('');
  const [newStatus, setNewStatus]                   = useState('');
  const [statusFilter, setStatusFilter]             = useState('all');
  const [zoneFilter, setZoneFilter]                 = useState('all'); 

  useEffect(() => {
    loadReclamations();
  }, []);

  const loadReclamations = async () => {
    setLoading(true);
    try {
      const data = await reclamationAPI.getAssigned();
      setReclamations(data.data || []);
    } catch (error) {
      console.error('Erreur chargement réclamations:', error);
      toast.error('Erreur lors du chargement des réclamations');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (reclamation, status) => {
    setSelectedReclamation(reclamation);
    setNewStatus(status);
    setCommentaire('');
    setShowModal(true);
  };

  const handleConfirm = async () => {
    if (!selectedReclamation) return;
    try {
      await reclamationAPI.updateStatus(
        selectedReclamation.idReclamation, newStatus, commentaire
      );
      toast.success(`Statut mis à jour: ${newStatus}`);
      setShowModal(false);
      loadReclamations();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'En attente': return '#ffc107';
      case 'En cours':   return '#17a2b8';
      case 'Traitée':    return '#28a745';
      case 'Refusée':    return '#dc3545';
      default:           return '#6c757d';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'En attente': return 'warning';
      case 'En cours':   return 'info';
      case 'Traitée':    return 'success';
      case 'Refusée':    return 'danger';
      default:           return 'secondary';
    }
  };

  //  Get unique zones
  const zones = [...new Set(
    reclamations
      .map(r => r.quartier || r.ville)
      .filter(Boolean)
  )].sort();

  //  Apply both filters
  const filteredReclamations = reclamations.filter(r => {
    const matchStatus = statusFilter === 'all' || r.statut === statusFilter;
    const matchZone   = zoneFilter   === 'all' ||
                        r.quartier   === zoneFilter ||
                        r.ville      === zoneFilter;
    return matchStatus && matchZone;
  });

  if (loading) return <Loader />;

  return (
    <div className="assigned-reclamations-page">
      <div className="page-header">
        <h1>Mes réclamations assignées</h1>

        {/*  Filters */}
        <div className="filters-row">
          <div className="filter-group">
            <label>Statut</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">Tous ({reclamations.length})</option>
              <option value="En attente">En attente ({reclamations.filter(r => r.statut === 'En attente').length})</option>
              <option value="En cours">En cours ({reclamations.filter(r => r.statut === 'En cours').length})</option>
              <option value="Traitée">Traitées ({reclamations.filter(r => r.statut === 'Traitée').length})</option>
              <option value="Refusée">Refusées ({reclamations.filter(r => r.statut === 'Refusée').length})</option>
            </select>
          </div>

          {/*  Zone filter */}
          <div className="filter-group">
            <label>Zone</label>
            <select value={zoneFilter} onChange={(e) => setZoneFilter(e.target.value)}>
              <option value="all">Toutes les zones</option>
              {zones.map(zone => (
                <option key={zone} value={zone}>{zone}</option>
              ))}
            </select>
          </div>

          {/*  Active filters indicator */}
          {(statusFilter !== 'all' || zoneFilter !== 'all') && (
            <button
              className="btn-secondary"
              onClick={() => { setStatusFilter('all'); setZoneFilter('all'); }}
              style={{ alignSelf: 'flex-end' }}
            >
              Réinitialiser filtres
            </button>
          )}

          <div style={{ alignSelf: 'flex-end', fontSize: '14px', color: '#666' }}>
            {filteredReclamations.length} résultat(s)
          </div>
        </div>
      </div>

      {filteredReclamations.length === 0 ? (
        <div className="empty-state">
          <p>Aucune réclamation trouvée</p>
        </div>
      ) : (
        <div className="reclamations-grid">
          {filteredReclamations.map((rec) => (
            <div key={rec.idReclamation} className="reclamation-card">
              <div className="card-header">
                <h3>{rec.titre}</h3>
                <span
                  className={`status-badge ${getStatusLabel(rec.statut)}`}
                  style={{ backgroundColor: getStatusColor(rec.statut) }}
                >
                  {rec.statut}
                </span>
              </div>
              <p className="card-description">{rec.description}</p>
              <div className="card-meta">
                <span> {rec.nomCategorie || '-'}</span>
                <span> Priorité: {rec.priorite}/10</span>
                {(rec.quartier || rec.ville) && (
                  <span> {rec.quartier ? `${rec.quartier}, ` : ''}{rec.ville || ''}</span>
                )}
                <span> {new Date(rec.dateCreation).toLocaleDateString()}</span>
              </div>
              <div className="card-actions">
                <button
                  className="btn-secondary"
                  onClick={() => navigate(`/reclamations/${rec.idReclamation}`)}
                >
                  <FaEye /> Voir détails
                </button>

                {rec.statut === 'En attente' && (
                  <button
                    className="btn-primary"
                    onClick={() => handleStatusChange(rec, 'En cours')}
                  >
                    <FaPlay /> Prendre en charge
                  </button>
                )}

                {rec.statut === 'En cours' && (
                  <>
                    <button
                      className="btn-success"
                      onClick={() => handleStatusChange(rec, 'Traitée')}
                    >
                      <FaCheck /> Marquer traitée
                    </button>
                    <button
                      className="btn-danger"
                      onClick={() => handleStatusChange(rec, 'Refusée')}
                    >
                      <FaTimes /> Refuser
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && selectedReclamation && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Changer le statut</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <p><strong>Réclamation:</strong> {selectedReclamation.titre}</p>
              <p><strong>Statut actuel:</strong> {selectedReclamation.statut}</p>
              <p>
                <strong>Nouveau statut:</strong>{' '}
                <span style={{ color: getStatusColor(newStatus), fontWeight: '600' }}>
                  {newStatus}
                </span>
              </p>
              <div className="form-group">
                <label>Commentaire {newStatus === 'Refusée' ? '(obligatoire)' : '(optionnel)'}</label>
                <textarea
                  rows="3"
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  placeholder="Ajoutez un commentaire pour justifier ce changement..."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>
                Annuler
              </button>
              <button className="btn-primary" onClick={handleConfirm}>
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignedReclamationsPage;