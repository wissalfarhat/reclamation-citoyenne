// src/routes/agentMunicipalRoutes.js
const express = require('express');
const router = express.Router();
const agentController = require('../controllers/AgentMunicipalController');

const { verifyToken, isAgent, isAdmin } = require('../middlewares/auth');

// ✅ Assurez-vous d'importer correctement le contrôleur
const AgentMunicipalController = require('../controllers/AgentMunicipalController'); 
router.get('/dashboard', verifyToken, isAgent, agentController.getAgentDashboard); // ← AJOUTER

// Récupérer toutes les réclamations assignées à l'agent
router.get('/reclamations', verifyToken, isAgent, AgentMunicipalController.getAssignedReclamations);

// Mettre à jour le statut d'une réclamation
router.put('/reclamations/:id/statut', verifyToken, isAgent, AgentMunicipalController.updateReclamationStatus);

// Ajouter un commentaire à une réclamation
router.post('/reclamations/:id/commentaire', verifyToken, isAgent, AgentMunicipalController.addComment);

// Récupérer tous les agents municipaux
router.get('/all', verifyToken, isAdmin, async (req, res) => {
  try {
    console.log('📋 Récupération de tous les agents...');
    console.log('👤 Utilisateur:', req.user.id, req.user.typeUtilisateur);
    
    const db = require('../config/database');
    
    const [agents] = await db.execute(`
      SELECT 
        u.idUtilisateur,
        u.nom,
        u.prenom,
        u.email,
        a.service,
        a.zoneGeographique
      FROM AgentMunicipal a
      JOIN Utilisateur u ON a.idUtilisateur = u.idUtilisateur
      ORDER BY u.nom, u.prenom
    `);
    
    console.log(`✅ ${agents.length} agent(s) trouvé(s)`);
    console.log('📋 Liste des agents:', agents);
    
    res.json({
      success: true,
      data: agents,
      count: agents.length
    });
    
  } catch (error) {
    console.error('❌ Erreur récupération agents:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des agents'
    });
  }
});
module.exports = router;