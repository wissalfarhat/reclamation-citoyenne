import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { agentAPI } from '../../api/agent';
import Loader from '../../components/common/Loader';
import { FaCheckCircle, FaHourglassHalf, FaSpinner, FaChartLine, FaClock } from 'react-icons/fa';
import { 
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import './AgentDashboardPage.css';

const AgentDashboardPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const calculateMonthlyData = (reclamations) => {
    const mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const monthlyStats = {};
    mois.forEach((m, index) => {
      monthlyStats[index + 1] = { mois: m, assignées: 0, traitées: 0, refusées: 0 };
    });
    reclamations.forEach(rec => {
      const month = new Date(rec.dateCreation).getMonth() + 1;
      if (monthlyStats[month]) {
        monthlyStats[month].assignées++;
        if (rec.statut === 'Traitée') monthlyStats[month].traitées++;
        if (rec.statut === 'Refusée') monthlyStats[month].refusées++;
      }
    });
    return Object.values(monthlyStats).filter(m => m.assignées > 0);
  };

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await agentAPI.getDashboard();
      if (response.success) {
        setDashboard(response.data);
        if (response.data.recentReclamations) {
          setMonthlyData(calculateMonthlyData(response.data.recentReclamations));
        }
      } else {
        setError(response.message || 'Erreur de chargement');
      }
    } catch (error) {
      console.error('❌ Erreur chargement dashboard:', error);
      if (error.response?.status === 403) {
        setError('Accès non autorisé. Vérifiez vos droits.');
      } else if (error.response?.status === 401) {
        setError('Session expirée. Veuillez vous reconnecter.');
      } else {
        setError(error.response?.data?.message || 'Erreur de connexion au serveur');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="agent-dashboard-error">
        <div className="error-card">
          <FaSpinner className="error-icon" />
          <h2>Erreur de chargement</h2>
          <p>{error}</p>
          <button className="btn-primary" onClick={loadDashboard}>Réessayer</button>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="agent-dashboard-error">
        <div className="error-card">
          <h2>Aucune donnée disponible</h2>
          <button className="btn-primary" onClick={loadDashboard}>Actualiser</button>
        </div>
      </div>
    );
  }

  const tauxResolution = dashboard.total > 0
    ? Math.round((dashboard.traitees / dashboard.total) * 100)
    : 0;

  return (
    <div className="agent-dashboard">
      <h1>Tableau de bord Agent</h1>

      {/* Cartes stats */}
      <div className="stats-cards">
        <div className="stat-card" onClick={() => navigate('/agent/reclamations')}>
          <div className="stat-info">
            <h3>{dashboard.total || 0}</h3>
            <p>Réclamations assignées</p>
          </div>
          <FaChartLine className="stat-icon" style={{ color: '#667eea' }} />
        </div>

        <div className="stat-card" onClick={() => navigate('/agent/reclamations?status=En%20attente')}>
          <div className="stat-info">
            <h3>{dashboard.enAttente || 0}</h3>
            <p>En attente</p>
          </div>
          <FaHourglassHalf className="stat-icon" style={{ color: '#ffc107' }} />
        </div>

        <div className="stat-card" onClick={() => navigate('/agent/reclamations?status=En%20cours')}>
          <div className="stat-info">
            <h3>{dashboard.enCours || 0}</h3>
            <p>En cours</p>
          </div>
          <FaSpinner className="stat-icon" style={{ color: '#17a2b8' }} />
        </div>

        <div className="stat-card" onClick={() => navigate('/agent/reclamations?status=Traitée')}>
          <div className="stat-info">
            <h3>{dashboard.traitees || 0}</h3>
            <p>Traitées</p>
          </div>
          <FaCheckCircle className="stat-icon" style={{ color: '#28a745' }} />
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>{dashboard.delaiMoyen || 0}h</h3>
            <p>Délai moyen</p>
          </div>
          <FaClock className="stat-icon" style={{ color: '#17a2b8' }} />
        </div>
      </div>

      <div className="dashboard-grid">

        {/* Courbe évolution mensuelle */}
        <div className="grid-item" style={{ gridColumn: 'span 2' }}>
          <h3>Évolution mensuelle de mes réclamations</h3>
          {monthlyData.length > 0 ? (
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mois" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="assignées" stroke="#667eea" strokeWidth={2} name="Assignées" dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="traitées"  stroke="#28a745" strokeWidth={2} name="Traitées"  dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="refusées"  stroke="#dc3545" strokeWidth={2} name="Refusées"  dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999', background: '#fafafa', borderRadius: '8px' }}>
              Aucune donnée disponible pour le moment
            </div>
          )}
        </div>

        {/* Statistique par localisation */}
        <div className="grid-item" style={{ gridColumn: 'span 2' }}>
          <h3>Répartition par zone géographique</h3>
          {dashboard.localisationStats && dashboard.localisationStats.length > 0 ? (
            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dashboard.localisationStats}
                  margin={{ top: 5, right: 20, left: 0, bottom: 70 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="zone" angle={-35} textAnchor="end" interval={0} tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend verticalAlign="top" />
                  <Bar dataKey="total"     fill="#667eea" name="Total"      radius={[4,4,0,0]} />
                  <Bar dataKey="traitees"  fill="#28a745" name="Traitées"   radius={[4,4,0,0]} />
                  <Bar dataKey="enCours"   fill="#17a2b8" name="En cours"   radius={[4,4,0,0]} />
                  <Bar dataKey="enAttente" fill="#ffc107" name="En attente" radius={[4,4,0,0]} />
                  <Bar dataKey="refusees"  fill="#dc3545" name="Refusées"   radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999', background: '#fafafa', borderRadius: '8px' }}>
              Aucune donnée de localisation disponible
            </div>
          )}
        </div>

        {/* Réclamations récentes */}
        <div className="grid-item">
          <h3>Mes réclamations récentes</h3>
          {!dashboard.recentReclamations || dashboard.recentReclamations.length === 0 ? (
            <div className="empty-state">
              <p>Aucune réclamation assignée</p>
            </div>
          ) : (
            <div className="recent-list">
              {dashboard.recentReclamations.slice(0, 5).map(rec => (
                <div
                  key={rec.idReclamation}
                  className="recent-item"
                  onClick={() => navigate(`/reclamations/${rec.idReclamation}`)}
                >
                  <div className="recent-info">
                    <h4>{rec.titre}</h4>
                    <p className="recent-meta">
                      {rec.nomCategorie} • {rec.quartier || rec.ville || ''} • {new Date(rec.dateCreation).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`status-badge ${
                    rec.statut === 'En attente' ? 'status-warning' :
                    rec.statut === 'En cours'   ? 'status-info' :
                    rec.statut === 'Traitée'    ? 'status-success' : 'status-danger'
                  }`}>
                    {rec.statut}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions rapides + stats */}
        <div className="grid-item">
          <h3>Actions rapides</h3>
          <div className="quick-actions">
            <button className="action-btn" onClick={() => navigate('/agent/reclamations')}>
              <FaSpinner /> Voir toutes mes réclamations
            </button>
            <button className="action-btn success" onClick={() => navigate('/map')}>
              <FaChartLine /> Voir la carte des réclamations
            </button>
          </div>

          <div className="stats-info">
            <h4>Statistiques personnelles</h4>
            <div className="stat-row">
              <span>Taux de résolution:</span>
              <strong>{tauxResolution}%</strong>
            </div>
            <div className="stat-row">
              <span>Réclamations refusées:</span>
              <strong>{dashboard.refusees || 0}</strong>
            </div>
            <div className="stat-row">
              <span>Efficacité:</span>
              <strong>
                {dashboard.total > 0
                  ? Math.round(((dashboard.traitees + dashboard.enCours) / dashboard.total) * 100)
                  : 0}%
              </strong>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AgentDashboardPage;