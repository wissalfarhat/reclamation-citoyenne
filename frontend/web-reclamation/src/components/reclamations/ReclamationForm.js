import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { reclamationAPI } from '../../api/reclamation';
import { categorieAPI } from '../../api/categorie';

const ReclamationForm = ({ initialData, onSubmit, isEditing = false }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    titre: initialData?.titre || '',
    description: initialData?.description || '',
    idCategorie: initialData?.idCategorie || '',
    priorite: initialData?.priorite || 1,
    statut: initialData?.statut || 'En attente',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categorieAPI.getAll();
      setCategories(data.data || []);
      if (!formData.idCategorie && data.data?.length) {
        setFormData(prev => ({ ...prev, idCategorie: data.data[0].idCategorie }));
      }
    } catch (error) {
      console.error('Erreur chargement catégories:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (onSubmit) {
        await onSubmit(formData);
      }
      toast.success(isEditing ? 'Réclamation modifiée' : 'Réclamation créée');
      navigate('/reclamations');
    } catch (error) {
      toast.error('Erreur lors de l\'opération');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="reclamation-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Titre *</label>
        <input
          type="text"
          name="titre"
          value={formData.titre}
          onChange={handleChange}
          required
          placeholder="Ex: Nid de poule dangereux"
        />
      </div>

      <div className="form-group">
        <label>Description *</label>
        <textarea
          name="description"
          rows="5"
          value={formData.description}
          onChange={handleChange}
          required
          placeholder="Décrivez le problème en détail..."
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Catégorie *</label>
          <select name="idCategorie" value={formData.idCategorie} onChange={handleChange} required>
            {categories.map(cat => (
              <option key={cat.idCategorie} value={cat.idCategorie}>
                {cat.nomCategorie}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Priorité (1-10)</label>
          <input
            type="number"
            name="priorite"
            min="1"
            max="10"
            value={formData.priorite}
            onChange={handleChange}
          />
        </div>
      </div>

      {isEditing && (
        <div className="form-group">
          <label>Statut</label>
          <select name="statut" value={formData.statut} onChange={handleChange}>
            <option value="En attente">En attente</option>
            <option value="En cours">En cours</option>
            <option value="Traitée">Traitée</option>
            <option value="Refusée">Refusée</option>
          </select>
        </div>
      )}

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={() => navigate('/reclamations')}>
          Annuler
        </button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Enregistrement...' : (isEditing ? 'Modifier' : 'Créer')}
        </button>
      </div>
    </form>
  );
};

export default ReclamationForm;