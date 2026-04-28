import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ChartStatus = ({ stats }) => {
  // Vérifier si stats existe
  if (!stats) {
    return (
      <div className="chart-empty">
        <p>Aucune donnée disponible</p>
      </div>
    );
  }

  // Construire les données pour le graphique
  const data = [
    { name: 'En attente', value: Number(stats.enAttente) || 0, color: '#ffc107' },
    { name: 'En cours', value: Number(stats.enCours) || 0, color: '#17a2b8' },
    { name: 'Traitées', value: Number(stats.traitees) || 0, color: '#28a745' },
    { name: 'Refusées', value: Number(stats.refusees) || 0, color: '#dc3545' },
  ];

  // Calculer le total
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Si aucune donnée, afficher un message
  if (total === 0) {
    return (
      <div className="chart-empty">
        <p>Aucune réclamation pour le moment</p>
        <small>Les statistiques apparaîtront ici</small>
      </div>
    );
  }

  // Filtrer les valeurs nulles
  const filteredData = data.filter(item => item.value > 0);

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 10 }}>
        <strong>Total: {total} réclamation(s)</strong>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={filteredData}
            cx="50%"
            cy="50%"
            labelLine={true}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            dataKey="value"
          >
            {filteredData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} réclamation(s)`, 'Nombre']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartStatus;