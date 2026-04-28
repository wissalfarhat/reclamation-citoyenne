import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaUserPlus, FaCheck, FaTimes } from 'react-icons/fa';

const UserTable = ({ users, onDelete, onEdit, onCreateAgent }) => {
  const [showModal, setShowModal] = useState(false);
  const [newAgent, setNewAgent] = useState({
    nom: '',
    prenom: '',
    email: '',
    motDePasse: '',
    telephone: '',
    service: '',
    zoneGeographique: '',
  });

  const handleCreateAgent = async (e) => {
    e.preventDefault();
    await onCreateAgent(newAgent);
    setShowModal(false);
    setNewAgent({
      nom: '',
      prenom: '',
      email: '',
      motDePasse: '',
      telephone: '',
      service: '',
      zoneGeographique: '',
    });
  };

  const getRoleBadge = (type) => {
    switch(type) {
      case 'Administrateur': return <span className="role-badge admin">Admin</span>;
      case 'AgentMunicipal': return <span className="role-badge agent">Agent</span>;
      default: return <span className="role-badge citoyen">Citoyen</span>;
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Liste des utilisateurs</h2>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <FaUserPlus /> Nouvel agent
        </button>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom</th>
              <th>Prénom</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Téléphone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.idUtilisateur}>
                <td>{user.idUtilisateur}</td>
                <td>{user.nom}</td>
                <td>{user.prenom}</td>
                <td>{user.email}</td>
                <td>{getRoleBadge(user.typeUtilisateur)}</td>
                <td>{user.telephone || '-'}</td>
                <td className="actions">
                  <button className="btn-icon" onClick={() => onEdit(user)} title="Modifier">
                    <FaEdit />
                  </button>
                  {user.typeUtilisateur !== 'Administrateur' && (
                    <button 
                      className="btn-icon delete" 
                      onClick={() => onDelete(user.idUtilisateur, `${user.prenom} ${user.nom}`)}
                      title="Supprimer"
                    >
                      <FaTrash />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal création agent */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Créer un agent municipal</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateAgent}>
              <div className="form-row">
                <div className="form-group">
                  <label>Nom *</label>
                  <input
                    type="text"
                    required
                    value={newAgent.nom}
                    onChange={(e) => setNewAgent({...newAgent, nom: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Prénom *</label>
                  <input
                    type="text"
                    required
                    value={newAgent.prenom}
                    onChange={(e) => setNewAgent({...newAgent, prenom: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  required
                  value={newAgent.email}
                  onChange={(e) => setNewAgent({...newAgent, email: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Mot de passe *</label>
                <input
                  type="password"
                  required
                  value={newAgent.motDePasse}
                  onChange={(e) => setNewAgent({...newAgent, motDePasse: e.target.value})}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Téléphone</label>
                  <input
                    type="tel"
                    value={newAgent.telephone}
                    onChange={(e) => setNewAgent({...newAgent, telephone: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Service</label>
                  <input
                    type="text"
                    value={newAgent.service}
                    onChange={(e) => setNewAgent({...newAgent, service: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Zone géographique</label>
                <input
                  type="text"
                  value={newAgent.zoneGeographique}
                  onChange={(e) => setNewAgent({...newAgent, zoneGeographique: e.target.value})}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  Créer l'agent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTable;