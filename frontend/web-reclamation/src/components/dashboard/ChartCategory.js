import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ChartCategory = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="chart-empty">Aucune donnée disponible</div>;
  }

  // Prendre les 5 premières catégories
  const topCategories = data.slice(0, 10);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={topCategories} layout="vertical" margin={{ left: 50 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis type="category" dataKey="nomCategorie" width={150} />
        <Tooltip />
        <Legend />
        <Bar dataKey="nombre" fill="#873899" name="Nombre de réclamations" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ChartCategory;