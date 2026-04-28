import React, { useState, useEffect } from 'react';
import { statsAPI } from '../../api/stats';
import { reclamationAPI } from '../../api/reclamation';
import Loader from '../../components/common/Loader';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { FaDownload, FaChartLine, FaCheckCircle, FaClock, FaSmile } from 'react-icons/fa';
import './StatisticsPage.css';

const StatisticsPage = () => {
  const [loading, setLoading]               = useState(true);
  const [stats, setStats]                   = useState(null);
  const [monthlyData, setMonthlyData]       = useState([]);
  const [agentPerformance, setAgentPerformance] = useState([]);
  const [satisfaction, setSatisfaction]     = useState(null);
  const [localisationData, setLocalisationData] = useState([]);
  const [periode, setPeriode]               = useState('mois');
  const [annee, setAnnee]                   = useState(new Date().getFullYear());
  const [exporting, setExporting]           = useState(false);

  useEffect(() => {
    loadStats();
  }, [periode, annee]);

  const calculateMonthlyEvolution = (reclamations, year) => {
    const mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const monthlyStats = {};
    mois.forEach((m, index) => {
      monthlyStats[index + 1] = { mois: m, total: 0, traitees: 0, refusees: 0 };
    });
    reclamations.forEach(rec => {
      const date = new Date(rec.dateCreation);
      if (date.getFullYear() === year) {
        const month = date.getMonth() + 1;
        monthlyStats[month].total++;
        if (rec.statut === 'Traitée') monthlyStats[month].traitees++;
        if (rec.statut === 'Refusée') monthlyStats[month].refusees++;
      }
    });
    return Object.values(monthlyStats).filter(m => m.total > 0);
  };

  const loadStats = async () => {
    setLoading(true);
    try {
      const [dashboard, allReclamations] = await Promise.all([
        statsAPI.getDashboard(),
        reclamationAPI.getAll(),
      ]);

      const globalStats = {
        ...dashboard.data?.global,
        enAttente:         parseInt(dashboard.data?.global?.enAttente         || 0),
        enCours:           parseInt(dashboard.data?.global?.enCours           || 0),
        traitees:          parseInt(dashboard.data?.global?.traitees          || 0),
        refusees:          parseInt(dashboard.data?.global?.refusees          || 0),
        totalReclamations: parseInt(dashboard.data?.global?.totalReclamations || 0),
        delaiMoyen:        parseInt(dashboard.data?.global?.delaiMoyen        || 0),
      };

      setStats(globalStats);

      const total    = globalStats.totalReclamations;
      const traitees = globalStats.traitees;
      const taux     = total > 0 ? Math.round((traitees / total) * 100) : 0;
      setSatisfaction({ actuel: { tauxSatisfaction: taux } });

      const reclamationsList = allReclamations.data || [];
      setMonthlyData(calculateMonthlyEvolution(reclamationsList, annee));
      setAgentPerformance(dashboard.data?.agentsStats || []);

      // Localisation stats
      const localisation = (dashboard.data?.parLocalisation || []).map(l => ({
        zone:      l.quartier ? `${l.quartier}, ${l.ville}` : (l.ville || 'Non défini'),
        total:     parseInt(l.total     || 0),
        traitees:  parseInt(l.traitees  || 0),
        enCours:   parseInt(l.enCours   || 0),
        enAttente: parseInt(l.enAttente || 0),
        refusees:  parseInt(l.refusees  || 0),
      }));
      setLocalisationData(localisation);

    } catch (error) {
      console.error(' Erreur chargement stats:', error);
      toast.error('Erreur de chargement des statistiques');
      setStats({ totalReclamations: 0, enAttente: 0, enCours: 0, traitees: 0, refusees: 0, delaiMoyen: 0 });
      setMonthlyData([]);
      setAgentPerformance([]);
      setLocalisationData([]);
    } finally {
      setLoading(false);
    }
  };

  // Export Excel
  const handleExport = async () => {
    setExporting(true);
    try {
      const wb = XLSX.utils.book_new();
      const dateGen = new Date().toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });

      // Statistiques globales
      const ws1 = XLSX.utils.aoa_to_sheet([
        ['RAPPORT STATISTIQUES - GESTION DES RÉCLAMATIONS'],
        ['Généré le', dateGen],
        ['Année', annee],
        [''],
        ['STATISTIQUES GLOBALES'],
        ['Indicateur',              'Valeur'],
        ['Total réclamations',       totalReclamations],
        ['En attente',               stats?.enAttente   || 0],
        ['En cours',                 stats?.enCours     || 0],
        ['Traitées',                 stats?.traitees    || 0],
        ['Refusées',                 stats?.refusees    || 0],
        ['Taux de résolution',       `${tauxResolution}%`],
        ['Délai moyen de traitement',`${stats?.delaiMoyen || 0}h`],
        ['Satisfaction citoyens',    `${satisfaction?.actuel?.tauxSatisfaction || 0}%`],
      ]);
      ws1['!cols'] = [{ wch: 32 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, ws1, 'Statistiques globales');

      // Répartition par statut 
      const ws2 = XLSX.utils.aoa_to_sheet([
        ['RÉPARTITION PAR STATUT'],
        ['Statut', 'Nombre', 'Pourcentage'],
        ['En attente', stats?.enAttente || 0, totalReclamations > 0 ? `${Math.round(((stats?.enAttente || 0) / totalReclamations) * 100)}%` : '0%'],
        ['En cours',   stats?.enCours   || 0, totalReclamations > 0 ? `${Math.round(((stats?.enCours   || 0) / totalReclamations) * 100)}%` : '0%'],
        ['Traitées',   stats?.traitees  || 0, totalReclamations > 0 ? `${Math.round(((stats?.traitees  || 0) / totalReclamations) * 100)}%` : '0%'],
        ['Refusées',   stats?.refusees  || 0, totalReclamations > 0 ? `${Math.round(((stats?.refusees  || 0) / totalReclamations) * 100)}%` : '0%'],
        ['Total',      totalReclamations,     '100%'],
      ]);
      ws2['!cols'] = [{ wch: 20 }, { wch: 12 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, ws2, 'Répartition statuts');

      //  Évolution mensuelle 
      const ws3 = XLSX.utils.aoa_to_sheet([
        [`ÉVOLUTION MENSUELLE ${annee}`],
        ['Mois', 'Total', 'Traitées', 'Refusées', 'Taux résolution'],
        ...monthlyData.map(m => [
          m.mois,
          m.total,
          m.traitees  || 0,
          m.refusees  || 0,
          m.total > 0 ? `${Math.round(((m.traitees || 0) / m.total) * 100)}%` : '0%',
        ]),
        ...(monthlyData.length === 0 ? [['Aucune donnée pour cette année']] : []),
      ]);
      ws3['!cols'] = [{ wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 16 }];
      XLSX.utils.book_append_sheet(wb, ws3, 'Évolution mensuelle');

      //Localisation (if available)
      if (localisationData.length > 0) {
        const ws4 = XLSX.utils.aoa_to_sheet([
          ['RÉPARTITION PAR LOCALISATION'],
          ['Zone', 'Total', 'Traitées', 'En cours', 'En attente', 'Refusées'],
          ...localisationData.map(l => [
            l.zone, l.total, l.traitees, l.enCours, l.enAttente, l.refusees
          ]),
        ]);
        ws4['!cols'] = [
          { wch: 25 }, { wch: 10 }, { wch: 12 },
          { wch: 12 }, { wch: 12 }, { wch: 12 }
        ];
        XLSX.utils.book_append_sheet(wb, ws4, 'Localisation');
      }

      // Performance agents 
      if (agentPerformance.length > 0) {
        const ws5 = XLSX.utils.aoa_to_sheet([
          ['PERFORMANCE DES AGENTS'],
          ['Nom', 'Prénom', 'Service', 'Zone', 'Assignées', 'Traitées', 'Taux résolution', 'Délai moyen'],
          ...agentPerformance.map(a => [
            a.nom,
            a.prenom,
            a.service          || '-',
            a.zoneGeographique || '-',
            a.assignees        || 0,
            a.traitees         || 0,
            a.assignees > 0    ? `${Math.round(((a.traitees || 0) / a.assignees) * 100)}%` : '0%',
            `${a.delaiMoyen    || 0}h`,
          ]),
        ]);
        ws5['!cols'] = [
          { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 18 },
          { wch: 12 }, { wch: 12 }, { wch: 16 }, { wch: 14 }
        ];
        XLSX.utils.book_append_sheet(wb, ws5, 'Performance agents');
      }

      //Generate & download
      const filename = `rapport_reclamations_${annee}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      saveAs(new Blob([wbout], { type: 'application/octet-stream' }), filename);

      toast.success(' Rapport Excel généré avec succès !');

    } catch (error) {
      console.error(' Erreur export:', error);
      toast.error('Erreur lors de la génération du rapport');
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <Loader />;

  const statusData = [
    { name: 'En attente', value: stats?.enAttente || 0, color: '#ffc107' },
    { name: 'En cours',   value: stats?.enCours   || 0, color: '#17a2b8' },
    { name: 'Refusée',    value: stats?.refusees  || 0, color: '#dc3545' },
    { name: 'Traitée',    value: stats?.traitees  || 0, color: '#28a745' },
  ].filter(item => item.value > 0);

  const totalReclamations = stats?.totalReclamations || 0;
  const tauxResolution = totalReclamations > 0
    ? Math.round(((stats?.traitees || 0) / totalReclamations) * 100)
    : 0;

  return (
    <div className="statistics-page">
      <div className="page-header">
        <h1>Statistiques</h1>
        <div className="header-actions">
          <div className="filter-group">
            <select value={periode} onChange={(e) => setPeriode(e.target.value)}>
              <option value="mois">Par mois</option>
              <option value="annee">Par année</option>
            </select>
          </div>
          <div className="filter-group">
            <input
              type="number"
              value={annee}
              onChange={(e) => setAnnee(parseInt(e.target.value))}
              min="2020"
              max={new Date().getFullYear()}
            />
          </div>
          {/* Export button */}
          <button
            className="btn-primary"
            onClick={handleExport}
            disabled={exporting}
          >
            <FaDownload /> {exporting ? 'Génération...' : 'Exporter Excel'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-info">
            <h3>{totalReclamations}</h3>
            <p>Total réclamations</p>
          </div>
          <FaChartLine className="stat-icon" style={{ color: '#667eea' }} />
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <h3>{tauxResolution}%</h3>
            <p>Taux de résolution</p>
          </div>
          <FaCheckCircle className="stat-icon" style={{ color: '#28a745' }} />
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <h3>{stats?.delaiMoyen || 0}h</h3>
            <p>Délai moyen</p>
          </div>
          <FaClock className="stat-icon" style={{ color: '#ffc107' }} />
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <h3>{satisfaction?.actuel?.tauxSatisfaction || 0}%</h3>
            <p>Satisfaction</p>
          </div>
          <FaSmile className="stat-icon" style={{ color: '#17a2b8' }} />
        </div>
      </div>

      <div className="stats-grid">

        {/* Pie chart */}
        <div className="stat-card-large" style={{ minHeight: 450 }}>
          <h3>Répartition par statut</h3>
          <p style={{ textAlign: 'center', fontWeight: 'bold', color: '#555', marginBottom: 8 }}>
            Total: {totalReclamations} réclamation(s)
          </p>
          {statusData.length > 0 ? (
            <div style={{ width: '100%', height: 320, position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={true}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, name]} />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="chart-empty">Aucune donnée disponible</div>
          )}
        </div>

        {/* Évolution mensuelle */}
        <div className="stat-card-large">
          <h3>Évolution mensuelle {annee}</h3>
          {monthlyData.length > 0 ? (
            <div style={{ width: '100%', height: 320, position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mois" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total"    stroke="#667eea" strokeWidth={2} name="Total"    dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="traitees" stroke="#28a745" strokeWidth={2} name="Traitées" dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="refusees" stroke="#dc3545" strokeWidth={2} name="Refusées" dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="chart-empty">Aucune réclamation pour {annee}</div>
          )}
        </div>

        {/* Localisation */}
        {localisationData.length > 0 && (
          <div className="stat-card-large" style={{ gridColumn: 'span 2' }}>
            <h3>Répartition par localisation</h3>
            <div style={{ width: '100%', height: 350, position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={localisationData} margin={{ top: 5, right: 20, left: 0, bottom: 80 }}>
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
          </div>
        )}

        {/* Performance des agents */}
        {agentPerformance.length > 0 && (
          <div className="stat-card-large" style={{ gridColumn: 'span 2' }}>
            <h3>Performance des agents</h3>
            <div style={{ width: '100%', height: 300, position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={agentPerformance.slice(0, 5)} layout="vertical" margin={{ left: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis type="category" dataKey="nom" width={80} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="traitees"  fill="#28a745" name="Traitées"  radius={[0,4,4,0]} />
                  <Bar dataKey="assignees" fill="#667eea" name="Assignées" radius={[0,4,4,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Détail des statuts */}
        <div className="stat-card-large">
          <h3>Détail des réclamations</h3>
          <div className="status-details">
            {[
              { label: 'En attente', value: stats?.enAttente || 0, color: '#ffc107' },
              { label: 'En cours',   value: stats?.enCours   || 0, color: '#17a2b8' },
              { label: 'Traitées',   value: stats?.traitees  || 0, color: '#28a745' },
              { label: 'Refusées',   value: stats?.refusees  || 0, color: '#dc3545' },
            ].map((item, i) => (
              <div key={i} className="status-detail-item">
                <span className="status-label" style={{ color: item.color }}>● {item.label}:</span>
                <span className="status-value">{item.value}</span>
              </div>
            ))}
            <div className="status-detail-item total">
              <span className="status-label">Total:</span>
              <span className="status-value">{totalReclamations}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StatisticsPage;