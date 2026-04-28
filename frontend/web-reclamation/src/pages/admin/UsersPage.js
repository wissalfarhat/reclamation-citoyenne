import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { userAPI } from '../../api/user';
import Loader from '../../components/common/Loader';
import { FaTrash, FaUserPlus, FaEdit, FaUserCog, FaUserTie } from 'react-icons/fa';
import './UsersPage.css';

const UsersPage = () => {
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData]     = useState({
    nom: '', prenom: '', email: '', motDePasse: '',
    telephone: '', typeUtilisateur: 'AgentMunicipal',
    service: '', zoneGeographique: '',
  });

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    try {
      const data = await userAPI.getAll();
      setUsers(data.data || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!formData.nom || !formData.prenom || !formData.email || !formData.motDePasse) {
      toast.warning('Veuillez remplir tous les champs obligatoires');
      return;
    }
    if (formData.motDePasse.length < 6) {
      toast.warning('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    try {
      await userAPI.createUser({
        nom:              formData.nom,
        prenom:           formData.prenom,
        email:            formData.email,
        motDePasse:       formData.motDePasse,
        typeUtilisateur:  formData.typeUtilisateur,
        telephone:        formData.telephone,
        service:          formData.service,
        zoneGeographique: formData.zoneGeographique,
      });
      toast.success('Utilisateur créé avec succès');
      closeModal();
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      // ✅ Send typeUtilisateur so backend can update role + profile
      await userAPI.updateUser(editingUser.idUtilisateur, {
        nom:              formData.nom,
        prenom:           formData.prenom,
        telephone:        formData.telephone,
        service:          formData.service,
        zoneGeographique: formData.zoneGeographique,
        typeUtilisateur:  formData.typeUtilisateur, // ✅ Added
      });
      toast.success('Utilisateur modifié avec succès');
      closeModal();
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la modification');
    }
  };

  const handleDelete = async (id, nom) => {
    if (window.confirm(`Supprimer définitivement "${nom}" ?`)) {
      try {
        await userAPI.deleteUser(id);
        toast.success('Utilisateur supprimé');
        loadUsers();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nom: '', prenom: '', email: '', motDePasse: '',
      telephone: '', typeUtilisateur: 'AgentMunicipal',
      service: '', zoneGeographique: '',
    });
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    resetForm();
  };

  const openCreateModal = () => {
    setEditingUser(null);
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      nom:              user.nom,
      prenom:           user.prenom,
      email:            user.email,
      motDePasse:       '',
      telephone:        user.telephone        || '',
      typeUtilisateur:  user.typeUtilisateur,
      service:          user.service          || '',
      zoneGeographique: user.zoneGeographique || '',
    });
    setShowModal(true);
  };

  const getRoleBadge = (type) => {
    switch(type) {
      case 'Administrateur':
        return <span className="role-badge admin"><FaUserCog /> Administrateur</span>;
      case 'AgentMunicipal':
        return <span className="role-badge agent"><FaUserTie /> Agent Municipal</span>;
      default:
        return <span className="role-badge citoyen">Citoyen</span>;
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="users-page">
      <div className="page-header">
        <h1>Gestion des utilisateurs</h1>
        <button className="btn-primary" onClick={openCreateModal}>
          <FaUserPlus /> Nouvel utilisateur
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
              <th>Service</th>
              <th>Zone</th>
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
                <td>{user.service          || '-'}</td>
                <td>{user.zoneGeographique || '-'}</td>
                <td className="actions">
                  <button className="btn-icon" onClick={() => openEditModal(user)} title="Modifier">
                    <FaEdit />
                  </button>
                  {user.typeUtilisateur !== 'Administrateur' && (
                    <button
                      className="btn-icon delete"
                      onClick={() => handleDelete(user.idUtilisateur, `${user.prenom} ${user.nom}`)}
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

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingUser ? 'Modifier l\'utilisateur' : 'Créer un nouvel utilisateur'}</h3>
              <button className="close-btn" onClick={closeModal}>&times;</button>
            </div>

            <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser}>
              <div className="form-row">
                <div className="form-group">
                  <label>Nom *</label>
                  <input
                    type="text" required
                    value={formData.nom}
                    onChange={(e) => setFormData({...formData, nom: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Prénom *</label>
                  <input
                    type="text" required
                    value={formData.prenom}
                    onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email" required
                  disabled={!!editingUser}
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
                {editingUser && <small className="form-hint">L'email ne peut pas être modifié</small>}
              </div>

              {!editingUser && (
                <div className="form-group">
                  <label>Mot de passe *</label>
                  <input
                    type="password" required
                    value={formData.motDePasse}
                    onChange={(e) => setFormData({...formData, motDePasse: e.target.value})}
                    placeholder="Minimum 6 caractères"
                  />
                </div>
              )}

              {/* ✅ Role selector - shown for both create and edit */}
              <div className="form-group">
                <label>Rôle *</label>
                <select
                  value={formData.typeUtilisateur}
                  onChange={(e) => setFormData({...formData, typeUtilisateur: e.target.value})}
                >
                  <option value="AgentMunicipal">Agent Municipal</option>
                  <option value="Administrateur">Administrateur</option>
                  <option value="Citoyen">Citoyen</option>
                </select>
                {/* ✅ Warning when changing role */}
                {editingUser && formData.typeUtilisateur !== editingUser.typeUtilisateur && (
                  <small style={{ color: '#fd7e14', marginTop: 4, display: 'block' }}>
                    ⚠️ Le rôle sera changé de "{editingUser.typeUtilisateur}" vers "{formData.typeUtilisateur}"
                  </small>
                )}
              </div>

              {!editingUser && (
                <div className="form-group">
                  <label>Téléphone</label>
                  <input
                    type="tel"
                    value={formData.telephone}
                    onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                  />
                </div>
              )}

              {/* ✅ Service for admin and agent */}
              {(formData.typeUtilisateur === 'AgentMunicipal' ||
                formData.typeUtilisateur === 'Administrateur') && (
                <div className="form-row">
                  <div className="form-group">
                    <label>Service</label>
                    <input
                      type="text"
                      value={formData.service}
                      onChange={(e) => setFormData({...formData, service: e.target.value})}
                      placeholder="Ex: Voirie, Administration..."
                    />
                  </div>

                  {/* ✅ Zone only for agent */}
                  {formData.typeUtilisateur === 'AgentMunicipal' && (
                    <div className="form-group">
                      <label>Zone géographique</label>
                      <input
                        type="text"
                        value={formData.zoneGeographique}
                        onChange={(e) => setFormData({...formData, zoneGeographique: e.target.value})}
                        placeholder="Ex: Centre Ville, Menzah..."
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  {editingUser ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;