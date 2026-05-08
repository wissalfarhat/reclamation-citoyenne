import React, { useState, useEffect } from 'react';
import { statsAPI } from '../../api/stats';
import { reclamationAPI } from '../../api/reclamation';
import StatsCards from '../../components/dashboard/StatsCards';
import ChartStatus from '../../components/dashboard/ChartStatus';
import ChartCategory from '../../components/dashboard/ChartCategory';
import RecentReclamations from '../../components/dashboard/RecentReclamations';
import Loader from '../../components/common/Loader';
import { toast } from 'react-toastify';

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [recentReclamations, setRecentReclamations] = useState([]);
  const [statsByCategory, setStatsByCategory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log(" Dashboard mounted");
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      console.log(' Loading dashboard...');

      //  IMPORTANT: verify APIs exist before calling
      if (!statsAPI || !reclamationAPI) {
        throw new Error("API not defined");
      }

      //  FORCE sequential calls (for debugging)
      const statsData = await statsAPI.getDashboard();
      console.log(' Stats:', statsData);

      const reclamationsData = await reclamationAPI.getAll({ limit: 10 });
      console.log(' Reclamations:', reclamationsData);

      const categoryData = await reclamationAPI.getStatsByCategory();
      console.log(' Categories:', categoryData);

      setDashboardData(statsData?.data || statsData);
      setRecentReclamations(reclamationsData?.data || []);
      setStatsByCategory(categoryData?.data || []);

    } catch (err) {
      console.error(' Dashboard error:', err);
      setError(err.message);
      toast.error('Erreur lors du chargement du dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>Erreur de chargement</h3>
        <p>{error}</p>
        <button className="btn-primary" onClick={loadDashboard}>
          Réessayer
        </button>
      </div>
    );
  }

  const defaultStats = {
    totalReclamations: 0,
    enAttente: 0,
    enCours: 0,
    traitees: 0,
    refusees: 0,
    tauxResolution: 0,
    delaiMoyenHeures: 0,
  };

  const stats = dashboardData?.global || dashboardData || defaultStats;

  return (
    <div className="dashboard-page">
      <h1>Tableau de bord</h1>

      <StatsCards stats={stats} />

      <div className="dashboard-grid">
        <div className="grid-item chart-container">
          <h3>Répartition par statut</h3>
          <ChartStatus stats={stats} />
        </div>

        <div className="grid-item chart-container">
          <h3>Répartition par catégorie</h3>
          <ChartCategory data={statsByCategory} />
        </div>

        <div className="grid-item recent-container">
          <h3>Réclamations récentes</h3>
          <RecentReclamations reclamations={recentReclamations} />
        </div>
      </div>
    </div>

  );
};

export default DashboardPage;