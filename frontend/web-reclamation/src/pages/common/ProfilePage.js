import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api/auth';
import { toast } from 'react-toastify';
import Loader from '../../components/common/Loader';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaLock, FaSave, FaEdit } from 'react-icons/fa';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [formData, setFormData] = useState({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    telephone: user?.telephone || '',
    adresse: user?.adresse || '',
  });
  const [passwordData, setPasswordData] = useState({
    ancienMotDePasse: '',
    nouveauMotDePasse: '',
    confirmPassword: '',
  });

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const response = await authAPI.updateProfile(formData);
      if (response.success) {
        updateUser(formData);
        toast.success('Profil mis à jour');
        setIsEditing(false);
      } else {
        toast.error(response.message || 'Erreur de mise à jour');
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.ancienMotDePasse || !passwordData.nouveauMotDePasse) {
      toast.warning('Tous les champs sont requis');
      return;
    }
    if (passwordData.nouveauMotDePasse.length < 6) {
      toast.warning('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    if (passwordData.nouveauMotDePasse !== passwordData.confirmPassword) {
      toast.warning('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.changePassword({
        ancienMotDePasse: passwordData.ancienMotDePasse,
        nouveauMotDePasse: passwordData.nouveauMotDePasse,
      });
      if (response.success) {
        toast.success('Mot de passe modifié');
        setShowPasswordModal(false);
        setPasswordData({
          ancienMotDePasse: '',
          nouveauMotDePasse: '',
          confirmPassword: '',
        });
      } else {
        toast.error(response.message || 'Erreur de modification');
      }
    } catch (error) {
      toast.error('Erreur lors du changement');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          <FaUser size={50} />
        </div>
        <h1>{user?.prenom} {user?.nom}</h1>
        <p className="profile-role">
          {user?.typeUtilisateur === 'Administrateur' ? 'Administrateur' :
           user?.typeUtilisateur === 'AgentMunicipal' ? 'Agent Municipal' : 'Citoyen'}
        </p>
        {!isEditing && (
          <button className="btn-edit" onClick={() => setIsEditing(true)}>
            <FaEdit /> Modifier le profil
          </button>
        )}
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <h3>Informations personnelles</h3>
          <div className="info-row">
            <div className="info-label">
              <FaUser /> Nom
            </div>
            {isEditing ? (
              <input
                type="text"
                value={formData.nom}
                onChange={(e) => setFormData({...formData, nom: e.target.value})}
              />
            ) : (
              <div className="info-value">{user?.nom}</div>
            )}
          </div>

          <div className="info-row">
            <div className="info-label">
              <FaUser /> Prénom
            </div>
            {isEditing ? (
              <input
                type="text"
                value={formData.prenom}
                onChange={(e) => setFormData({...formData, prenom: e.target.value})}
              />
            ) : (
              <div className="info-value">{user?.prenom}</div>
            )}
          </div>

          <div className="info-row">
            <div className="info-label">
              <FaEnvelope /> Email
            </div>
            <div className="info-value">{user?.email}</div>
          </div>

          <div className="info-row">
            <div className="info-label">
              <FaPhone /> Téléphone
            </div>
            {isEditing ? (
              <input
                type="tel"
                value={formData.telephone}
                onChange={(e) => setFormData({...formData, telephone: e.target.value})}
              />
            ) : (
              <div className="info-value">{user?.telephone || 'Non renseigné'}</div>
            )}
          </div>

          <div className="info-row">
            <div className="info-label">
              <FaMapMarkerAlt /> Adresse
            </div>
            {isEditing ? (
              <input
                type="text"
                value={formData.adresse}
                onChange={(e) => setFormData({...formData, adresse: e.target.value})}
              />
            ) : (
              <div className="info-value">{user?.adresse || 'Non renseignée'}</div>
            )}
          </div>

          {isEditing && (
            <div className="form-actions">
              <button className="btn-secondary" onClick={() => setIsEditing(false)}>
                Annuler
              </button>
              <button className="btn-primary" onClick={handleUpdateProfile}>
                <FaSave /> Enregistrer
              </button>
            </div>
          )}
        </div>

        <div className="profile-card">
          <h3>Sécurité</h3>
          <button className="btn-secondary" onClick={() => setShowPasswordModal(true)}>
            <FaLock /> Changer le mot de passe
          </button>
        </div>
      </div>

      {/* Modal changement de mot de passe */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Changer le mot de passe</h3>
              <button className="close-btn" onClick={() => setShowPasswordModal(false)}>&times;</button>
            </div>
            <div className="form-group">
              <label>Ancien mot de passe</label>
              <input
                type="password"
                value={passwordData.ancienMotDePasse}
                onChange={(e) => setPasswordData({...passwordData, ancienMotDePasse: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Nouveau mot de passe</label>
              <input
                type="password"
                value={passwordData.nouveauMotDePasse}
                onChange={(e) => setPasswordData({...passwordData, nouveauMotDePasse: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Confirmer le mot de passe</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
              />
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowPasswordModal(false)}>
                Annuler
              </button>
              <button className="btn-primary" onClick={handleChangePassword}>
                Modifier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;