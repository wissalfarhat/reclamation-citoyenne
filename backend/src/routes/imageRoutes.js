const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');
const { verifyToken } = require('../middlewares/auth');

// Upload d'images pour une réclamation
router.post(
    '/Reclamation/:id/images',
    verifyToken,
    imageController.uploadImages,
    imageController.addImagesToReclamation
);

// Supprimer une image
router.delete(
    '/Reclamation/:id/images/:imageId',
    verifyToken,
    imageController.deleteImage
);

// Servir les images (public)
router.get('/Reclamation/:id/:filename', imageController.serveImage);

module.exports = router;