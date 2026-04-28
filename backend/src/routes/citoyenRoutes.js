const express = require('express');
const router = express.Router();
const citoyenController = require('../controllers/citoyenController');
const { verifyToken, isCitoyen } = require('../middlewares/auth');

// ✅ VERSION CORRIGÉE AVEC JOIN
router.get('/reclamations', verifyToken, isCitoyen, async (req, res) => {
  try {
    console.log('📋 Récupération réclamations pour citoyen ID:', req.user.id);
    
    const db = require('../config/database');
    
    // ✅ Requête avec JOIN pour récupérer toutes les informations
    const [rows] = await db.execute(
      `SELECT 
        r.*,
        c.nomCategorie,
        l.ville,
        l.quartier,
        l.adresse,
        l.latitude,
        l.longitude
       FROM Reclamation r
       LEFT JOIN Categorie c ON r.idCategorie = c.idCategorie
       LEFT JOIN Localisation l ON r.idLocalisation = l.idLocalisation
       WHERE r.idCitoyen = ?
       ORDER BY r.dateCreation DESC`,
      [req.user.id]
    );
    
    console.log(`✅ ${rows.length} réclamation(s) trouvée(s)`);
    
    // ✅ Parser les photos si elles existent
    const formattedRows = rows.map(row => ({
      ...row,
      photos: row.photos ? JSON.parse(row.photos) : []
    }));
    
    res.json({ 
      success: true, 
      data: formattedRows,
      count: rows.length
    });
    
  } catch (error) {
    console.error('❌ Erreur récupération réclamations:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

router.get('/notifications', verifyToken, isCitoyen, citoyenController.getCitoyenNotifications);
router.post('/notifications/mark-read', verifyToken, isCitoyen, citoyenController.markNotificationsAsRead);

module.exports = router;