import React, { useState, useEffect } from 'react';
import { reclamationAPI } from '../../api/reclamation';
import { userAPI } from '../../api/user';
import ReclamationTable from '../../components/reclamations/ReclamationTable';
import ReclamationFilters from '../../components/reclamations/ReclamationFilters';
import Loader from '../../components/common/Loader';
import { toast } from 'react-toastify';

const ReclamationsPage = () => {
  const [reclamations, setReclamations]   = useState([]);
  const [agents, setAgents]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [filters, setFilters]             = useState({});
  const [filterZone, setFilterZone]       = useState('');

  useEffect(() => { loadAgents(); }, []);
  useEffect(() => { loadReclamations(); }, [filters]);

  const loadAgents = async () => {
    try {
      const data = await userAPI.getAgents();
      let list = [];
      if (data.data && Array.isArray(data.data)) list = data.data;
      else if (data.data?.data && Array.isArray(data.data.data)) list = data.data.data;
      else if (Array.isArray(data)) list = data;
      setAgents(list);
    } catch (error) {
      console.error('Erreur chargement agents:', error);
    }
  };

  const loadReclamations = async () => {
    setLoading(true);
    try {
      const data = await reclamationAPI.getAll(filters);
      setReclamations(data.data || []);
    } catch (error) {
      console.error('Erreur chargement réclamations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (idReclamation, idAgent) => {
    if (!idAgent) return;
    try {
      await reclamationAPI.assignToAgent(idReclamation, idAgent);
      toast.success('Réclamation assignée avec succès');
      loadReclamations();
    } catch (error) {
      toast.error("Erreur lors de l'assignation");
    }
  };

  // ✅ Zones extraites des villes des réclamations (pas des agents)
  const zonesDisponibles = [...new Set(
    reclamations.map(r => r.ville).filter(Boolean)
  )];

  // ✅ Filtrage par ville de la réclamation
  const reclamationsFiltrees = filterZone
    ? reclamations.filter(r => r.ville === filterZone)
    : reclamations;

  if (loading) return <Loader />;

  return (
    <div className="reclamations-page">
      <h1>Gestion des réclamations</h1>

      {/* Filtres existants */}
      <ReclamationFilters onFilterChange={setFilters} />

      {/* ✅ Filtre par zone */}
      <div className="zone-filter" style={{ margin: '12px 0' }}>
        <label style={{ marginRight: 8, fontWeight: 500 }}>Filtrer par zone :</label>
        <select
          value={filterZone}
          onChange={(e) => setFilterZone(e.target.value)}
          style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #ccc' }}
        >
          <option value="">Toutes les zones</option>
          {zonesDisponibles.map(zone => (
            <option key={zone} value={zone}>{zone}</option>
          ))}
        </select>
        {filterZone && (
          <button
            onClick={() => setFilterZone('')}
            style={{ marginLeft: 8, padding: '6px 10px', borderRadius: 6, border: '1px solid #ccc', cursor: 'pointer' }}
          >
            Réinitialiser
          </button>
        )}
      </div>

      <ReclamationTable
        reclamations={reclamationsFiltrees}
        agents={agents}
        onAssign={handleAssign}
      />
    </div>
  );
};

export default ReclamationsPage;