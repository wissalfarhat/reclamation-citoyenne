import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { reclamationAPI } from '../../api/reclamation';
import { useAuth } from '../../context/AuthContext';
import './MapPage.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const TUNIS_CENTER = [36.8065, 10.1815];

const CITY_COORDS = {
  'tunis':            { lat: 36.8065, lng: 10.1815 },
  'sfax':             { lat: 34.7400, lng: 10.7600 },
  'sousse':           { lat: 35.8333, lng: 10.6333 },
  'gafsa':            { lat: 34.4250, lng: 8.7842  },
  'bizerte':          { lat: 37.2744, lng: 9.8739  },
  'kairouan':         { lat: 35.6781, lng: 10.0963 },
  'gabes':            { lat: 33.8833, lng: 10.1000 },
  'ariana':           { lat: 36.8625, lng: 10.1956 },
  'ben arous':        { lat: 36.7533, lng: 10.2281 },
  'la marsa':         { lat: 36.8781, lng: 10.3247 },
  'nabeul':           { lat: 36.4561, lng: 10.7376 },
  'hammamet':         { lat: 36.4000, lng: 10.6167 },
  'monastir':         { lat: 35.7643, lng: 10.8113 },
  'mahdia':           { lat: 35.5047, lng: 11.0622 },
  'soliman':          { lat: 36.7000, lng: 10.4833 },
  'sulayman':         { lat: 36.7000, lng: 10.4833 },
  'manouba':          { lat: 36.8100, lng: 10.1011 },
  'zaghouan':         { lat: 36.4028, lng: 10.1428 },
  'siliana':          { lat: 36.0833, lng: 9.3667  },
  'le bardo':         { lat: 36.8094, lng: 10.1408 },
  'bardo':            { lat: 36.8094, lng: 10.1408 },
  'carthage':         { lat: 36.8528, lng: 10.3233 },
  'sidi bou said':    { lat: 36.8681, lng: 10.3414 },
  'el aouina':        { lat: 36.8317, lng: 10.2281 },
  'megrine':          { lat: 36.7711, lng: 10.2239 },
  'rades':            { lat: 36.7681, lng: 10.2772 },
  'centre ville':     { lat: 36.8065, lng: 10.1815 },
  'centre':           { lat: 36.8065, lng: 10.1815 },
  'medina':           { lat: 36.7992, lng: 10.1707 },
  'el menzah':        { lat: 36.8417, lng: 10.1781 },
  'el manar':         { lat: 36.8333, lng: 10.1667 },
  'el omrane':        { lat: 36.8167, lng: 10.1500 },
  'bab souika':       { lat: 36.8083, lng: 10.1731 },
  'bab el bhar':      { lat: 36.7997, lng: 10.1822 },
  'lafayette':        { lat: 36.8139, lng: 10.1789 },
  'montplaisir':      { lat: 36.8083, lng: 10.1861 },
  'el mourouj':       { lat: 36.7167, lng: 10.2167 },
  'hammam lif':       { lat: 36.7333, lng: 10.3333 },
  'hammam chott':     { lat: 36.7167, lng: 10.3667 },
  'bir el bey':       { lat: 36.7167, lng: 10.3000 },
  'fouchana':         { lat: 36.7000, lng: 10.1667 },
  'mohamadia':        { lat: 36.7833, lng: 10.1667 },
  'tebourba':         { lat: 36.8333, lng: 9.8333  },
  'kef':              { lat: 36.1742, lng: 8.7147  },
  'jendouba':         { lat: 36.5011, lng: 8.7803  },
  'beja':             { lat: 36.7256, lng: 9.1817  },
  'kasserine':        { lat: 35.1667, lng: 8.8333  },
  'sidi bouzid':      { lat: 35.0381, lng: 9.4858  },
  'medenine':         { lat: 33.3547, lng: 10.5053 },
  'tataouine':        { lat: 32.9211, lng: 10.4517 },
  'kebili':           { lat: 33.7042, lng: 8.9689  },
  'tozeur':           { lat: 33.9197, lng: 8.1336  },
  'zarzis':           { lat: 33.5047, lng: 11.1122 },
  'djerba':           { lat: 33.8333, lng: 10.8500 },
  'houmt souk':       { lat: 33.8667, lng: 10.8500 },
  'korba':            { lat: 36.5667, lng: 10.8667 },
  'kelibia':          { lat: 36.8500, lng: 11.1000 },
  'grombalia':        { lat: 36.6000, lng: 10.5000 },
  'el haouaria':      { lat: 37.0500, lng: 11.0000 },
  'menzel bourguiba': { lat: 37.1500, lng: 9.7833  },
  'mateur':           { lat: 37.0500, lng: 9.6667  },
  'tabarka':          { lat: 36.9544, lng: 8.7583  },
  'testour':          { lat: 36.5500, lng: 9.4500  },
  'medjez el bab':    { lat: 36.6500, lng: 9.6167  },
  'maktar':           { lat: 35.8583, lng: 9.2000  },
  'enfidha':          { lat: 36.1333, lng: 10.3833 },
  'msaken':           { lat: 35.7333, lng: 10.5833 },
  'ksar hellal':      { lat: 35.6500, lng: 10.8833 },
  'el jem':           { lat: 35.2972, lng: 10.7083 },
  'sfax centre':      { lat: 34.7400, lng: 10.7600 },
};

const normalize = (str) => {
  if (!str) return '';
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
};

const getCityCoords = (ville, quartier) => {
  const nv = normalize(ville);
  const nq = normalize(quartier);
  for (const [key, coords] of Object.entries(CITY_COORDS)) {
    if (nq && normalize(key) === nq) return coords;
  }
  for (const [key, coords] of Object.entries(CITY_COORDS)) {
    const nk = normalize(key);
    if (nq && (nq.includes(nk) || nk.includes(nq))) return coords;
  }
  for (const [key, coords] of Object.entries(CITY_COORDS)) {
    if (nv && normalize(key) === nv) return coords;
  }
  for (const [key, coords] of Object.entries(CITY_COORDS)) {
    const nk = normalize(key);
    if (nv && (nv.includes(nk) || nk.includes(nv))) return coords;
  }
  return null;
};

const createColoredIcon = (color) => L.divIcon({
  className: '',
  html: `<div style="width:22px;height:22px;background-color:${color};border:2px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  popupAnchor: [0, -13],
});

const getMarkerColor = (statut) => {
  switch (statut) {
    case 'En attente': return '#ffc107';
    case 'En cours':   return '#17a2b8';
    case 'Traitée':    return '#28a745';
    case 'Refusée':    return '#dc3545';
    default:           return '#6c757d';
  }
};

const MapPage = () => {
  const { user } = useAuth();
  const [allReclamations, setAllReclamations] = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [filterStatut, setFilterStatut]       = useState('');
  const [filterZone, setFilterZone]           = useState('');

  const isAgent = user?.typeUtilisateur === 'AgentMunicipal';
  const isAdmin = user?.typeUtilisateur === 'Administrateur';

  useEffect(() => { loadReclamations(); }, []);

  const loadReclamations = async () => {
    try {
      const data = await reclamationAPI.getAll();
      const list = data.data || [];

      const processed = list.map((rec) => {
        const lat = parseFloat(rec.latitude);
        const lng = parseFloat(rec.longitude);
        const hasRealGPS = !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0
          && !(Math.abs(lat - 36.8065) < 0.0001 && Math.abs(lng - 10.1815) < 0.0001);

        let finalLat, finalLng, positionType;
        if (hasRealGPS) {
          finalLat = lat; finalLng = lng; positionType = 'gps';
        } else {
          const cityCoords = getCityCoords(rec.ville, rec.quartier);
          if (cityCoords) {
            const offset = 0.003;
            finalLat = cityCoords.lat + (Math.random() - 0.5) * offset;
            finalLng = cityCoords.lng + (Math.random() - 0.5) * offset;
            positionType = 'city';
          } else {
            const offset = 0.005;
            finalLat = TUNIS_CENTER[0] + (Math.random() - 0.5) * offset;
            finalLng = TUNIS_CENTER[1] + (Math.random() - 0.5) * offset;
            positionType = 'default';
          }
        }
        return { ...rec, latitude: finalLat, longitude: finalLng, positionType };
      });

      setAllReclamations(processed);
    } catch (error) {
      console.error('Erreur chargement carte:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Extract unique zones from reclamations
  const zonesDisponibles = [...new Set(
    allReclamations.map(r => r.ville).filter(Boolean)
  )].sort();

  // ✅ Role-based + zone + statut filtering
  const filtered = allReclamations.filter(rec => {
    // Agent: only assigned reclamations
    if (isAgent && rec.idAgent !== user?.id) return false;
    // Admin/Agent: filter by statut
    if (filterStatut && rec.statut !== filterStatut) return false;
    // Admin: filter by zone (ville)
    if (filterZone && rec.ville !== filterZone) return false;
    return true;
  });

  const counts = {
    total:     filtered.length,
    enAttente: filtered.filter(r => r.statut === 'En attente').length,
    enCours:   filtered.filter(r => r.statut === 'En cours').length,
    traitee:   filtered.filter(r => r.statut === 'Traitée').length,
    refusee:   filtered.filter(r => r.statut === 'Refusée').length,
    gps:       filtered.filter(r => r.positionType === 'gps').length,
    city:      filtered.filter(r => r.positionType === 'city').length,
  };

  return (
    <div className="map-page">
      <div className="map-header">
        <h1>Carte des réclamations</h1>

        <div className="map-controls">
          {/* Statut filter */}
          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="map-filter"
          >
            <option value="">Tous les statuts ({allReclamations.filter(r => isAgent ? r.idAgent === user?.id : true).length})</option>
            <option value="En attente">En attente</option>
            <option value="En cours">En cours</option>
            <option value="Traitée">Traitée</option>
            <option value="Refusée">Refusée</option>
          </select>

          {/* ✅ Zone filter — Admin only */}
          {isAdmin && (
            <select
              value={filterZone}
              onChange={(e) => setFilterZone(e.target.value)}
              className="map-filter"
            >
              <option value="">Toutes les zones</option>
              {zonesDisponibles.map(zone => (
                <option key={zone} value={zone}>{zone}</option>
              ))}
            </select>
          )}

          {/* ✅ Agent badge */}
          {isAgent && (
            <div style={{
              background: '#e8f4fd',
              color: '#0066cc',
              padding: '5px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '500',
            }}>
              Mes réclamations assignées
            </div>
          )}

          <div className="map-legend">
            {[
              { label: 'En attente', color: '#ffc107' },
              { label: 'En cours',   color: '#17a2b8' },
              { label: 'Traitée',    color: '#28a745' },
              { label: 'Refusée',    color: '#dc3545' },
            ].map(item => (
              <div key={item.label} className="legend-item">
                <div className="legend-dot" style={{ backgroundColor: item.color }} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          <div className="map-count">
            <strong>{counts.total}</strong> réclamation(s) •{' '}
            <span style={{ color: '#28a745' }}>🛰️ {counts.gps} GPS</span> •{' '}
            <span style={{ color: '#17a2b8' }}>🏙️ {counts.city} par ville</span>
          </div>
        </div>
      </div>

      <div className="map-container">
        {loading ? (
          <div className="map-loading">
            <div className="map-spinner" />
            Chargement de la carte...
          </div>
        ) : (
          <MapContainer center={TUNIS_CENTER} zoom={10} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />

            {filtered.map((rec) => (
              <Marker
                key={rec.idReclamation}
                position={[rec.latitude, rec.longitude]}
                icon={createColoredIcon(getMarkerColor(rec.statut))}
              >
                <Popup maxWidth={280}>
                  <div className="popup-content">
                    {rec.positionType !== 'gps' && (
                      <p style={{ background: '#e8f4fd', color: '#0066cc', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', marginBottom: 8 }}>
                        Position approximative ({rec.ville || 'Tunis'})
                      </p>
                    )}
                    <div style={{ marginBottom: 8 }}>
                      <span style={{ background: getMarkerColor(rec.statut), color: 'white', padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '500' }}>
                        {rec.statut}
                      </span>
                    </div>
                    <h4 style={{ margin: '0 0 6px', color: '#222', fontSize: '14px' }}>{rec.titre}</h4>
                    {rec.description && (
                      <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#555' }}>
                        {rec.description.length > 80 ? rec.description.substring(0, 80) + '...' : rec.description}
                      </p>
                    )}
                    <hr style={{ margin: '8px 0', borderColor: '#eee' }} />
                    {rec.nomCategorie && (
                      <p style={{ margin: '3px 0', fontSize: '13px' }}>
                        <strong>Catégorie:</strong> {rec.nomCategorie}
                      </p>
                    )}
                    {rec.quartier && rec.quartier !== 'Non spécifié' && (
                      <p style={{ margin: '3px 0', fontSize: '13px' }}>
                        <strong>Quartier:</strong> {rec.quartier}
                      </p>
                    )}
                    {rec.ville && (
                      <p style={{ margin: '3px 0', fontSize: '13px' }}>
                        <strong>Ville:</strong> {rec.ville}
                      </p>
                    )}
                    {rec.adresse && rec.adresse !== 'Adresse non spécifiée' && (
                      <p style={{ margin: '3px 0', fontSize: '13px' }}>
                        <strong>Adresse:</strong> {rec.adresse}
                      </p>
                    )}
                    {/* ✅ Show agent info */}
                    {rec.agentNom && (
                      <p style={{ margin: '3px 0', fontSize: '13px' }}>
                        <strong>Agent:</strong> {rec.agentPrenom} {rec.agentNom}
                      </p>
                    )}
                    {rec.agentZone && (
                      <p style={{ margin: '3px 0', fontSize: '13px' }}>
                        <strong>Zone agent:</strong> {rec.agentZone}
                      </p>
                    )}
                    <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#999' }}>
                      {new Date(rec.dateCreation).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
    </div>
  );
};

export default MapPage;