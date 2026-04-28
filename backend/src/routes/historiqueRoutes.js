const express = require('express');
const router = express.Router();
const historiqueController = require('../controllers/historiqueController');
const { verifyToken } = require('../middlewares/auth');

router.get('/reclamation/:idReclamation', verifyToken, historiqueController.getReclamationHistory);
router.get('/recent', verifyToken, historiqueController.getRecentActions);

module.exports = router;