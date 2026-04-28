import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { reclamationAPI } from '../../api/reclamation';

// Fix pour les icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const ReclamationMap = ({ filters, onReclamationClick }) => {
  const [reclamations, setReclamations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [center] = useState([36.8065, 10.1815]); // Tunis
  const [zoom] = useState(12);

  useEffect(() => {
    loadReclamations();
  }, [filters]);

  const loadReclamations = async () => {
    setLoading(true);
    try {
      const data = await reclamationAPI.getAll(filters);
      setReclamations(data.data || []);
    } catch (error) {
      console.error('Erreur chargement carte:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMarkerColor = (status) => {
    switch(status) {
      case 'En attente': return '#ffc107';
      case 'En cours': return '#17a2b8';
      case 'Traitée': return '#28a745';
      case 'Refusée': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getMarkerIcon = (status) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="background-color: ${getMarkerColor(status)}; 
                         width: 20px; height: 20px; border-radius: 50%; 
                         border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  };

  if (loading) {
    return <div className="loader">Chargement de la carte...</div>;
  }

  const validReclamations = reclamations.filter(rec => rec.latitude && rec.longitude);

  return (
    <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      {validReclamations.map((rec) => (
        <Marker
          key={rec.idReclamation}
          position={[rec.latitude, rec.longitude]}
          icon={getMarkerIcon(rec.statut)}
          eventHandlers={{
            click: () => onReclamationClick && onReclamationClick(rec.idReclamation)
          }}
        >
          <Popup>
            <div className="popup-content">
              <h4>{rec.titre}</h4>
              <p><strong>Statut:</strong> {rec.statut}</p>
              <p><strong>Catégorie:</strong> {rec.nomCategorie}</p>
              <p><strong>Priorité:</strong> {rec.priorite}/10</p>
              <p><strong>Quartier:</strong> {rec.quartier || 'Non spécifié'}</p>
              <button onClick={() => onReclamationClick && onReclamationClick(rec.idReclamation)}>
                Voir détails
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default ReclamationMap;