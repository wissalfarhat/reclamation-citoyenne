import React, { useState, useEffect } from 'react';
import { categorieAPI } from '../../api/categorie';

const ReclamationFilters = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    statut: '',
    idCategorie: '',
    dateDebut: '',
    dateFin: '',
    search: '',
  });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categorieAPI.getAll();
      setCategories(data.data || []);
    } catch (error) {
      console.error('Erreur chargement catégories:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const activeFilters = {};
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        activeFilters[key] = filters[key];
      }
    });
    onFilterChange(activeFilters);
  };

  const handleReset = () => {
    const emptyFilters = {
      statut: '',
      idCategorie: '',
      dateDebut: '',
      dateFin: '',
      search: '',
    };
    setFilters(emptyFilters);
    onFilterChange({});
  };

  const statusOptions = [
    { value: '', label: 'Tous' },
    { value: 'En attente', label: 'En attente' },
    { value: 'En cours', label: 'En cours' },
    { value: 'Traitée', label: 'Traitée' },
    { value: 'Refusée', label: 'Refusée' },
  ];

  return (
    <form className="filters-bar" onSubmit={handleSubmit}>
      <div className="filter-group">
        <label>Statut</label>
        <select name="statut" value={filters.statut} onChange={handleChange}>
          {statusOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Catégorie</label>
        <select name="idCategorie" value={filters.idCategorie} onChange={handleChange}>
          <option value="">Toutes</option>
          {categories.map(cat => (
            <option key={cat.idCategorie} value={cat.idCategorie}>
              {cat.nomCategorie}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Date début</label>
        <input type="date" name="dateDebut" value={filters.dateDebut} onChange={handleChange} />
      </div>

      <div className="filter-group">
        <label>Date fin</label>
        <input type="date" name="dateFin" value={filters.dateFin} onChange={handleChange} />
      </div>

      <div className="filter-group">
        <label>Recherche</label>
        <input 
          type="text" 
          name="search" 
          placeholder="Titre ou description..." 
          value={filters.search} 
          onChange={handleChange} 
        />
      </div>

      <div className="filter-actions">
        <button type="submit" className="btn-filter">Filtrer</button>
        <button type="button" className="btn-reset" onClick={handleReset}>Réinitialiser</button>
      </div>
    </form>
  );
};

export default ReclamationFilters;