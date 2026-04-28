import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { categorieAPI } from '../../api/categorie';
import Loader from '../../components/common/Loader';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

const PRIORITY_OPTIONS = [
  { value: 1,  label: 'Très basse',  color: '#28a745' },
  { value: 3,  label: 'Basse',       color: '#17a2b8' },
  { value: 5,  label: 'Moyenne',     color: '#ffc107' },
  { value: 7,  label: 'Haute',       color: '#fd7e14' },
  { value: 10, label: 'Très haute',  color: '#dc3545' },
];

const getPriorityInfo = (value) => {
  if (value <= 2)  return { label: 'Très basse', color: '#28a745' };
  if (value <= 4)  return { label: 'Basse',      color: '#17a2b8' };
  if (value <= 6)  return { label: 'Moyenne',    color: '#ffc107' };
  if (value <= 8)  return { label: 'Haute',      color: '#fd7e14' };
  return               { label: 'Très haute',    color: '#dc3545' };
};

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    nomCategorie:   '',
    description:    '',
    prioriteDefaut: 5,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categorieAPI.getAll();
      setCategories(data.data || []);
    } catch (error) {
      console.error('Erreur chargement catégories:', error);
    } finally {
      setLoading(false);
    }
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await categorieAPI.update(editing.idCategorie, formData);
        toast.success('Catégorie modifiée');
      } else {
        await categorieAPI.create(formData);
        toast.success('Catégorie créée');
      }
      closeModal();
      loadCategories();
    } catch (error) {
      // ✅ Show exact backend message
      toast.error(error.response?.data?.message || 'Erreur lors de l\'opération');
    }
  };

  const handleEdit = (cat) => {
    setEditing(cat);
    setFormData({
      nomCategorie:   cat.nomCategorie,
      description:    cat.description    || '',
      prioriteDefaut: cat.prioriteDefaut || 5,
    });
    setShowModal(true);
  };

  const handleDelete = async (id, nom) => {
    if (window.confirm(`Supprimer la catégorie "${nom}" ?`)) {
      try {
        await categorieAPI.delete(id);
        toast.success('Catégorie supprimée');
        loadCategories();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setFormData({ nomCategorie: '', description: '', prioriteDefaut: 5 });
  };

  if (loading) return <Loader />;

  return (
    <div className="categories-page">
      <div className="page-header">
        <h1>Gestion des catégories</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <FaPlus /> Nouvelle catégorie
        </button>
      </div>

      <div className="categories-list">
        {categories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            Aucune catégorie. Créez-en une !
          </div>
        ) : (
          categories.map((cat) => {
            const { label, color } = getPriorityInfo(cat.prioriteDefaut);
            return (
              <div key={cat.idCategorie} className="category-card">
                <div className="category-header">
                  <h3>{cat.nomCategorie}</h3>
                  <div className="category-actions">
                    <button className="btn-icon" onClick={() => handleEdit(cat)}>
                      <FaEdit />
                    </button>
                    <button className="btn-icon delete" onClick={() => handleDelete(cat.idCategorie, cat.nomCategorie)}>
                      <FaTrash />
                    </button>
                  </div>
                </div>
                <p className="category-description">{cat.description || 'Aucune description'}</p>
                <div className="category-meta">
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: color + '15',
                    color: color,
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: '500',
                    border: `1px solid ${color}30`,
                  }}>
                    <span style={{
                      width: '8px', height: '8px',
                      borderRadius: '50%',
                      background: color,
                      display: 'inline-block'
                    }} />
                    Priorité {label} ({cat.prioriteDefaut}/10)
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</h3>
              <button className="close-btn" onClick={closeModal}>&times;</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nom de la catégorie *</label>
                <input
                  type="text"
                  required
                  value={formData.nomCategorie}
                  onChange={(e) => setFormData({...formData, nomCategorie: e.target.value})}
                  placeholder="Ex: Voirie, Éclairage public..."
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Description de la catégorie..."
                />
              </div>

              {/* ✅ Visual priority selector */}
              <div className="form-group">
                <label>
                  Priorité par défaut —{' '}
                  <span style={{ color: getPriorityInfo(formData.prioriteDefaut).color, fontWeight: '600' }}>
                    {getPriorityInfo(formData.prioriteDefaut).label} ({formData.prioriteDefaut}/10)
                  </span>
                </label>

                {/* ✅ Quick select buttons */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                  {PRIORITY_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormData({...formData, prioriteDefaut: opt.value})}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '20px',
                        border: `1.5px solid ${opt.color}`,
                        background: formData.prioriteDefaut === opt.value ? opt.color : 'transparent',
                        color: formData.prioriteDefaut === opt.value ? 'white' : opt.color,
                        fontSize: '13px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* ✅ Slider */}
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.prioriteDefaut}
                  onChange={(e) => setFormData({...formData, prioriteDefaut: parseInt(e.target.value)})}
                  style={{
                    width: '100%',
                    accentColor: getPriorityInfo(formData.prioriteDefaut).color,
                    height: '6px',
                    cursor: 'pointer',
                  }}
                />

                {/* ✅ Scale labels */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#999', marginTop: '4px' }}>
                  <span>1 - Très basse</span>
                  <span>5 - Moyenne</span>
                  <span>10 - Très haute</span>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  {editing ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;