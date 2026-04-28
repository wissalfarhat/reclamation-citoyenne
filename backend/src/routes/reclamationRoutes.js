const express = require('express');
const router = express.Router();
const reclamationController = require('../controllers/reclamationController');
const imageController = require('../controllers/imageController');
const { verifyToken, isAgent } = require('../middlewares/auth'); 
// Route pour créer une réclamation AVEC images
router.post(
    '/',
    verifyToken,
    imageController.uploadImages,           // Middleware d'upload
    imageController.processUploadedImages,  // Traitement temporaire
    reclamationController.createReclamation // Création finale
);

// Routes sans images
router.get('/', verifyToken, reclamationController.getAllReclamations);
router.get('/stats/categories', verifyToken, reclamationController.getStatsByCategory);
router.get('/:id', verifyToken, reclamationController.getReclamationById);
router.get('/:id/similar', verifyToken, reclamationController.findSimilarReclamations);
router.put('/:id', verifyToken, reclamationController.updateReclamation);
router.put('/:id/assign', verifyToken, reclamationController.assignToAgent);
router.put(':id/status', verifyToken, reclamationController.updateStatusByAgent);
router.post('/reclamations/:id/commentaire', verifyToken, isAgent, reclamationController.addComment);
router.get('/:id/historique', verifyToken, reclamationController.getHistorique);
module.exports = router;