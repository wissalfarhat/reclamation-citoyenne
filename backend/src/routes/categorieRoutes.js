const express = require('express');
const router = express.Router();
const categorieController = require('../controllers/categorieController');
const { verifyToken, isAdmin } = require('../middlewares/auth');
const db = require('../config/database');

// ✅ UNE SEULE ROUTE GET - avec ORDER BY idCategorie
router.get('/', async (req, res) => {
  try {
    console.log('📋 Récupération des catégories');
    const [rows] = await db.execute('SELECT * FROM Categorie ORDER BY idCategorie');
    console.log(`✅ ${rows.length} catégories trouvées`);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('❌ Erreur récupération catégories:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ Route pour une catégorie spécifique (DIFFÉRENTE)
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM Categorie WHERE idCategorie = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Catégorie non trouvée' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ Routes protégées (admin)
router.post('/', verifyToken, isAdmin, categorieController.createCategorie);
router.put('/:id', verifyToken, isAdmin, categorieController.updateCategorie);
router.delete('/:id', verifyToken, isAdmin, categorieController.deleteCategorie);

module.exports = router;