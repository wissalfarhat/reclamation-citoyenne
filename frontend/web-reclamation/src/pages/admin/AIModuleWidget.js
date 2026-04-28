import React, { useState } from 'react';
import { aiAPI } from '../../api/ai';
import { toast } from 'react-toastify';
import { FaRobot, FaLightbulb, FaChartBar } from 'react-icons/fa';
import './AIModuleWidget.css';

const getPriorityColor = (priorite) => {
  if (priorite <= 2) return '#28a745';
  if (priorite <= 4) return '#17a2b8';
  if (priorite <= 6) return '#ffc107';
  if (priorite <= 8) return '#fd7e14';
  return '#dc3545';
};

const AIModuleWidget = () => {
  const [activeTab, setActiveTab]       = useState('suggest');
  const [titre, setTitre]               = useState('');
  const [description, setDescription]   = useState('');
  const [suggestion, setSuggestion]     = useState(null);
  const [trends, setTrends]             = useState(null);
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const [loadingTrends, setLoadingTrends]   = useState(false);

  const handleSuggest = async () => {
    if (!titre && !description) {
      toast.warning('Veuillez saisir un titre ou une description');
      return;
    }
    setLoadingSuggest(true);
    setSuggestion(null);
    try {
      const response = await aiAPI.suggest(titre, description);
      if (response.success) {
        setSuggestion(response.data);
      }
    } catch (error) {
      toast.error('Erreur lors de la suggestion IA');
    } finally {
      setLoadingSuggest(false);
    }
  };

  const handleTrends = async () => {
    setLoadingTrends(true);
    setTrends(null);
    try {
      const response = await aiAPI.trends();
      if (response.success) {
        setTrends(response.data);
      }
    } catch (error) {
      toast.error('Erreur lors de l\'analyse des tendances');
    } finally {
      setLoadingTrends(false);
    }
  };

  return (
    <div className="ai-widget">
      <div className="ai-widget-header">
        <FaRobot className="ai-icon" />
        <div>
          <h2>Module IA</h2>
          <p>Analyse intelligente des réclamations</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="ai-tabs">
        <button
          className={`ai-tab ${activeTab === 'suggest' ? 'active' : ''}`}
          onClick={() => setActiveTab('suggest')}
        >
          <FaLightbulb /> Suggestion catégorie
        </button>
        <button
          className={`ai-tab ${activeTab === 'trends' ? 'active' : ''}`}
          onClick={() => setActiveTab('trends')}
        >
          <FaChartBar /> Analyse tendances
        </button>
      </div>

      {/* ✅ Tab 1 - Suggest */}
      {activeTab === 'suggest' && (
        <div className="ai-tab-content">
          <p className="ai-description">
            Saisissez le contenu d'une réclamation pour que l'IA suggère automatiquement
            la catégorie et la priorité adaptées.
          </p>

          <div className="form-group">
            <label>Titre de la réclamation</label>
            <input
              type="text"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              placeholder="Ex: Nid de poule dangereux avenue Habib Bourguiba"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Un nid de poule de grande taille bloque la route principale et cause des accidents..."
            />
          </div>

          <button
            className="ai-btn"
            onClick={handleSuggest}
            disabled={loadingSuggest}
          >
            {loadingSuggest ? (
              <>⏳ Analyse en cours...</>
            ) : (
              <><FaRobot /> Analyser avec l'IA</>
            )}
          </button>

          {/* ✅ Result */}
          {suggestion && (
            <div className="ai-result">
              <div className="ai-result-header">
                <FaRobot />
                <span>Suggestion IA</span>
                <span className="confidence-badge">{suggestion.confidence}% confiance</span>
              </div>

              <div className="ai-result-body">
                <div className="ai-result-item">
                  <span className="ai-result-label">📁 Catégorie suggérée</span>
                  <span className="ai-result-value category">{suggestion.nomCategorie}</span>
                </div>

                <div className="ai-result-item">
                  <span className="ai-result-label">⚡ Priorité suggérée</span>
                  <span
                    className="ai-result-value priority"
                    style={{ color: getPriorityColor(suggestion.priorite) }}
                  >
                    {suggestion.prioriteLabel} ({suggestion.priorite}/10)
                  </span>
                </div>

                {/* Priority bar */}
                <div className="priority-bar-container">
                  <div
                    className="priority-bar"
                    style={{
                      width: `${suggestion.priorite * 10}%`,
                      backgroundColor: getPriorityColor(suggestion.priorite)
                    }}
                  />
                </div>

                <div className="ai-reasoning">
                  <span>💡</span>
                  <p>{suggestion.raisonnement}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ✅ Tab 2 - Trends */}
      {activeTab === 'trends' && (
        <div className="ai-tab-content">
          <p className="ai-description">
            L'IA analyse les 50 dernières réclamations pour identifier les tendances,
            les zones problématiques et fournir des recommandations.
          </p>

          <button
            className="ai-btn"
            onClick={handleTrends}
            disabled={loadingTrends}
          >
            {loadingTrends ? (
              <>⏳ Analyse en cours...</>
            ) : (
              <><FaChartBar /> Analyser les tendances</>
            )}
          </button>

          {trends && (
            <div className="ai-trends-result">

              <div className="ai-trends-section">
                <h4>📊 Résumé</h4>
                <p>{trends.resume}</p>
              </div>

              <div className="ai-trends-grid">
                <div className="ai-trends-card">
                  <h4>📈 Tendances détectées</h4>
                  <ul>
                    {trends.tendances?.map((t, i) => <li key={i}>• {t}</li>)}
                  </ul>
                </div>

                <div className="ai-trends-card">
                  <h4>📍 Zones problématiques</h4>
                  <ul>
                    {trends.zonesProblematiques?.map((z, i) => <li key={i}>• {z}</li>)}
                  </ul>
                </div>

                <div className="ai-trends-card">
                  <h4>📁 Catégories fréquentes</h4>
                  <ul>
                    {trends.categoriesFrequentes?.map((c, i) => <li key={i}>• {c}</li>)}
                  </ul>
                </div>

                <div className="ai-trends-card recommendations">
                  <h4>✅ Recommandations</h4>
                  <ul>
                    {trends.recommandations?.map((r, i) => <li key={i}>• {r}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
<AIModuleWidget />

export default AIModuleWidget;