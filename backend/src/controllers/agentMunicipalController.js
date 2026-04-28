const AgentMunicipal = require('../models/AgentMunicipal');
const Historique = require('../models/Historique');
const Notification = require('../models/Notification');
const StatsService = require('../services/statsService');
const db = require('../config/database');

// ============================================
// RÉCUPÉRER LES RÉCLAMATIONS ASSIGNÉES
// ============================================
exports.getAssignedReclamations = async (req, res) => {
  try {
    const agentId = req.user.id;
    const [reclamations] = await db.execute(`
      SELECT 
        r.*,
        c.nomCategorie,
        l.ville,
        l.quartier,
        l.adresse,
        u.nom as citoyenNom,
        u.prenom as citoyenPrenom
      FROM Reclamation r
      LEFT JOIN Categorie c ON r.idCategorie = c.idCategorie
      LEFT JOIN Localisation l ON r.idLocalisation = l.idLocalisation
      LEFT JOIN Utilisateur u ON r.idCitoyen = u.idUtilisateur
      WHERE r.idAgent = ?
      ORDER BY r.priorite DESC, r.dateCreation DESC
    `, [agentId]);

    res.json({ success: true, data: reclamations });
  } catch (error) {
    console.error('❌ Erreur getAssignedReclamations:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des réclamations' });
  }
};

// ============================================
// DASHBOARD AGENT
// ============================================
exports.getAgentDashboard = async (req, res) => {
  try {
    const agentId = req.user.id;

    const [assignees] = await db.execute(`
      SELECT 
        r.*,
        c.nomCategorie,
        l.ville,
        l.quartier,
        l.adresse
      FROM Reclamation r
      LEFT JOIN Categorie c ON r.idCategorie = c.idCategorie
      LEFT JOIN Localisation l ON r.idLocalisation = l.idLocalisation
      WHERE r.idAgent = ?
      ORDER BY r.dateCreation DESC
    `, [agentId]);

    const total     = assignees.length;
    const enAttente = assignees.filter(r => r.statut === 'En attente').length;
    const enCours   = assignees.filter(r => r.statut === 'En cours').length;
    const traitees  = assignees.filter(r => r.statut === 'Traitée').length;
    const refusees  = assignees.filter(r => r.statut === 'Refusée').length;

    let delaiMoyen = 0;
    const traiteesList = assignees.filter(r => r.statut === 'Traitée' && r.dateModification);
    if (traiteesList.length > 0) {
      const totalDelai = traiteesList.reduce((sum, r) => {
        return sum + (new Date(r.dateModification) - new Date(r.dateCreation)) / (1000 * 60 * 60);
      }, 0);
      delaiMoyen = Math.round(totalDelai / traiteesList.length);
    }

    // ✅ Stats par localisation avec refusées
    const localisationMap = {};
    assignees.forEach(r => {
      const zone = r.quartier
        ? `${r.quartier}, ${r.ville || ''}`
        : (r.ville || 'Non défini');

      if (!localisationMap[zone]) {
        localisationMap[zone] = { zone, total: 0, traitees: 0, enCours: 0, enAttente: 0, refusees: 0 };
      }
      localisationMap[zone].total++;
      if (r.statut === 'Traitée')    localisationMap[zone].traitees++;
      if (r.statut === 'En cours')   localisationMap[zone].enCours++;
      if (r.statut === 'En attente') localisationMap[zone].enAttente++;
      if (r.statut === 'Refusée')    localisationMap[zone].refusees++;
    });

    const localisationStats = Object.values(localisationMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    res.json({
      success: true,
      data: {
        total, enAttente, enCours, traitees, refusees, delaiMoyen,
        recentReclamations: assignees,
        localisationStats
      }
    });

  } catch (error) {
    console.error('❌ Erreur dashboard agent:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du chargement du dashboard' });
  }
};

// ============================================
// METTRE À JOUR LE STATUT
// ============================================
exports.updateReclamationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { statut, commentaire } = req.body;
    const agentId = req.user.id;

    const statutsValides = ['En cours', 'Traitée', 'Refusée'];
    if (!statutsValides.includes(statut)) {
      return res.status(400).json({ success: false, message: `Statut invalide. Utilisez: ${statutsValides.join(', ')}` });
    }

    const [ancienneReclamation] = await db.execute(
      'SELECT statut, idCitoyen, titre FROM Reclamation WHERE idReclamation = ?', [id]
    );

    if (!ancienneReclamation[0]) {
      return res.status(404).json({ success: false, message: 'Réclamation non trouvée' });
    }

    const { statut: ancienStatut, idCitoyen, titre } = ancienneReclamation[0];

    await AgentMunicipal.updateReclamationStatus(id, statut, commentaire);
    await StatsService.onStatutChange(id, ancienStatut, statut, agentId);

    await Historique.create({
      action: `Statut changé: ${ancienStatut} → ${statut}`,
      commentaire: commentaire || '',
      utilisateur: `${req.user.prenom} ${req.user.nom}`,
      idReclamation: id
    });

    await Notification.create({
      message: genererMessageNotification(titre, ancienStatut, statut, commentaire, req.user),
      type: getNotificationType(statut),
      idReclamation: id,
      idCitoyen
    });

    res.json({
      success: true,
      message: 'Statut mis à jour avec succès',
      data: { ancienStatut, nouveauStatut: statut }
    });

  } catch (error) {
    console.error('❌ Erreur updateReclamationStatus:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// AJOUTER UN COMMENTAIRE
// ============================================
exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { commentaire } = req.body;

    if (!commentaire) {
      return res.status(400).json({ success: false, message: 'Le commentaire est requis.' });
    }

    await Historique.create({
      action: 'Commentaire ajouté',
      commentaire,
      utilisateur: `${req.user.prenom} ${req.user.nom}`,
      idReclamation: id
    });

    res.json({ success: true, message: 'Commentaire ajouté avec succès' });
  } catch (error) {
    console.error('❌ Erreur addComment:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// RÉCUPÉRER TOUS LES AGENTS
// ============================================
exports.getAllAgents = async (req, res) => {
  try {
    const agents = await AgentMunicipal.getAll();
    res.json({ success: true, count: agents.length, data: agents });
  } catch (error) {
    console.error('❌ Erreur getAllAgents:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des agents' });
  }
};

// ============================================
// HELPERS
// ============================================
function genererMessageNotification(titre, ancienStatut, nouveauStatut, commentaire, agent) {
  const agentNom = `${agent.prenom} ${agent.nom}`;
  switch (nouveauStatut) {
    case 'En cours': return `Votre réclamation "${titre}" est en cours de traitement. Agent responsable : ${agentNom}`;
    case 'Traitée':  return `Votre réclamation "${titre}" a été traitée avec succès.`;
    case 'Refusée':  return `Votre réclamation "${titre}" a été refusée.${commentaire ? ` Raison : ${commentaire}` : ''}`;
    default:         return `Statut modifié : ${ancienStatut} → ${nouveauStatut}`;
  }
}

function getNotificationType(statut) {
  switch (statut) {
    case 'En cours': return 'statut_en_cours';
    case 'Traitée':  return 'statut_traitee';
    case 'Refusée':  return 'statut_refusee';
    default:         return 'statut_change';
  }
}