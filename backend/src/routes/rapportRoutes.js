const express = require('express');
const router = express.Router();
const rapportController = require('../controllers/rapportController');
const { verifyToken, isAdmin } = require('../middlewares/auth');

router.post('/', verifyToken, isAdmin, rapportController.createRapport);
router.get('/', verifyToken, isAdmin, rapportController.getAllRapports);
router.get('/:id', verifyToken, isAdmin, rapportController.getRapportById);
router.put('/:id', verifyToken, isAdmin, rapportController.updateRapport);
router.delete('/:id', verifyToken, isAdmin, rapportController.deleteRapport);
router.post('/auto', verifyToken, isAdmin, rapportController.genererRapportAutomatique);
module.exports = router;