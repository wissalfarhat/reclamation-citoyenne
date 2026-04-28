const express = require('express');
const router = express.Router();
const statistiqueController = require('../controllers/statistiqueController');
const { verifyToken, isAdmin } = require('../middlewares/auth');

router.post('/', verifyToken, isAdmin, statistiqueController.createStatistique);
router.get('/:id', verifyToken, isAdmin, statistiqueController.getStatistiqueById);
router.get('/type/:type', verifyToken, isAdmin, statistiqueController.getStatistiquesByType);
router.get('/recent', verifyToken, isAdmin, statistiqueController.getRecentStatistiques);
router.get('/monthly/generate', verifyToken, isAdmin, statistiqueController.generateMonthlyStats);

module.exports = router;