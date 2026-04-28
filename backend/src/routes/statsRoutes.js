const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken, isAdmin } = require('../middlewares/auth');

// ============================================
// DASHBOARD STATISTIQUES
// ============================================
router.get('/dashboard', verifyToken, isAdmin, async (req, res) => {
  try {
    console.log('📊 Récupération des statistiques dashboard...');

    // Statistiques globales
    const [global] = await db.execute(`
      SELECT 
        COUNT(*) as totalReclamations,
        SUM(CASE WHEN statut = 'En attente' THEN 1 ELSE 0 END) as enAttente,
        SUM(CASE WHEN statut = 'En cours' THEN 1 ELSE 0 END) as enCours,
        SUM(CASE WHEN statut = 'Traitée' THEN 1 ELSE 0 END) as traitees,
        SUM(CASE WHEN statut = 'Refusée' THEN 1 ELSE 0 END) as refusees,
        COUNT(DISTINCT idCitoyen) as citoyensActifs,
        COUNT(DISTINCT idAgent) as agentsActifs,
        ROUND(AVG(priorite), 2) as prioriteMoyenne
      FROM Reclamation
    `);

    // ✅ Délai moyen de traitement
    const [delai] = await db.execute(`
      SELECT 
        ROUND(AVG(TIMESTAMPDIFF(HOUR, dateCreation, dateModification)), 0) as delaiMoyen
      FROM Reclamation
      WHERE statut = 'Traitée'
      AND dateModification IS NOT NULL
    `);

    // Répartition par statut
    const [parStatut] = await db.execute(`
      SELECT statut, COUNT(*) as nombre
      FROM Reclamation
      GROUP BY statut
    `);

    // Répartition par catégorie
    const [parCategorie] = await db.execute(`
      SELECT c.nomCategorie, COUNT(r.idReclamation) as nombre
      FROM Categorie c
      LEFT JOIN Reclamation r ON c.idCategorie = r.idCategorie
      GROUP BY c.idCategorie
      ORDER BY nombre DESC
    `);

    // Réclamations récentes
    const [recentes] = await db.execute(`
      SELECT r.idReclamation, r.titre, r.statut, r.dateCreation, 
             c.nomCategorie, l.quartier
      FROM Reclamation r
      LEFT JOIN Categorie c ON r.idCategorie = c.idCategorie
      LEFT JOIN Localisation l ON r.idLocalisation = l.idLocalisation
      ORDER BY r.dateCreation DESC
      LIMIT 10
    `);

    // ✅ Stats agents
    const [agentsStats] = await db.execute(`
      SELECT 
        u.nom, u.prenom, a.service, a.zoneGeographique,
        COUNT(r.idReclamation) as assignees,
        SUM(CASE WHEN r.statut = 'Traitée' THEN 1 ELSE 0 END) as traitees,
        ROUND(AVG(CASE WHEN r.statut = 'Traitée' 
          THEN TIMESTAMPDIFF(HOUR, r.dateCreation, r.dateModification)
          ELSE NULL END), 0) as delaiMoyen
      FROM AgentMunicipal a
      JOIN Utilisateur u ON a.idUtilisateur = u.idUtilisateur
      LEFT JOIN Reclamation r ON a.idUtilisateur = r.idAgent
      GROUP BY a.idUtilisateur
      HAVING COUNT(r.idReclamation) > 0
      ORDER BY traitees DESC
    `);

    res.json({
      success: true,
      data: {
        global: {
          ...global[0],
          delaiMoyen: delai[0]?.delaiMoyen || 0  // ✅ Added
        },
        distribution: { parStatut, parCategorie },
        recentes,
        agentsStats
      }
    });
    

  } catch (error) {
    console.error('❌ Erreur dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des statistiques' });
  }
});

module.exports = router;