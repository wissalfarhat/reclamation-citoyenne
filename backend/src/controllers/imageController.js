const upload = require('../middlewares/upload/uploadConfig');
const imageProcessor = require('../middlewares/upload/imageProcessor');
const Reclamation = require('../models/Reclamation');
const path = require('path');
const fs = require('fs').promises;

// Middleware pour l'upload multiple
exports.uploadImages = upload.array('images', 5);

// Traiter les images après upload
exports.processUploadedImages = async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            req.processedImages = [];
            return next();
        }

        console.log(` ${req.files.length} image(s) reçue(s)`);
        
        // On ne peut traiter qu'après avoir l'ID de la réclamation
        // Donc on passe simplement les fichiers au prochain middleware
        req.tempImages = req.files;
        next();
        
    } catch (error) {
        console.error(' Erreur traitement images:', error);
        
        // Nettoyer les fichiers temporaires
        if (req.files) {
            for (const file of req.files) {
                try {
                    await fs.unlink(file.path);
                } catch (e) {}
            }
        }
        
        res.status(500).json({
            success: false,
            message: 'Erreur lors du traitement des images',
            error: error.message
        });
    }
};

// Ajouter des images à une réclamation existante
exports.addImagesToReclamation = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Aucune image fournie'
            });
        }

        // Récupérer la réclamation
        const reclamation = await Reclamation.findById(id);
        if (!reclamation) {
            return res.status(404).json({
                success: false,
                message: 'Réclamation non trouvée'
            });
        }

        // Traiter les images
        const processedImages = await imageProcessor.processMultipleImages(req.files, id);
        
        // Mettre à jour la réclamation avec les nouvelles images
        let currentPhotos = [];
        try {
            currentPhotos = reclamation.photos ? JSON.parse(reclamation.photos) : [];
        } catch (e) {
            currentPhotos = reclamation.photos ? [reclamation.photos] : [];
        }

        const newPhotos = [...currentPhotos, ...processedImages];
        
        await Reclamation.update(id, {
            ...reclamation,
            photos: newPhotos
        });

        res.json({
            success: true,
            message: `${processedImages.length} image(s) ajoutée(s) avec succès`,
            images: processedImages,
            totalImages: newPhotos.length
        });

    } catch (error) {
        console.error(' Erreur ajout images:', error);
        
        // Nettoyer les fichiers temporaires
        if (req.files) {
            for (const file of req.files) {
                try {
                    await fs.unlink(file.path);
                } catch (e) {}
            }
        }
        
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'ajout des images',
            error: error.message
        });
    }
};

// Supprimer une image
exports.deleteImage = async (req, res) => {
    try {
        const { id, imageId } = req.params;
        
        // Récupérer la réclamation
        const reclamation = await Reclamation.findById(id);
        if (!reclamation) {
            return res.status(404).json({
                success: false,
                message: 'Réclamation non trouvée'
            });
        }

        // Parser les photos
        let photos = [];
        try {
            photos = reclamation.photos ? JSON.parse(reclamation.photos) : [];
        } catch (e) {
            photos = reclamation.photos ? [reclamation.photos] : [];
        }

        // Trouver l'image à supprimer
        const imageIndex = photos.findIndex(img => img.uniqueId === imageId);
        if (imageIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Image non trouvée'
            });
        }

        const imageToDelete = photos[imageIndex];

        // Supprimer les fichiers physiques
        const imageDir = path.join(__dirname, '../uploads/reclamations', String(id));
        
        for (const version of Object.values(imageToDelete.versions)) {
            try {
                const filePath = path.join(imageDir, version.filename);
                await fs.unlink(filePath);
            } catch (e) {
                console.warn(` Impossible de supprimer ${version.filename}:`, e.message);
            }
        }

        // Supprimer de la base de données
        photos.splice(imageIndex, 1);
        await Reclamation.update(id, {
            ...reclamation,
            photos: photos
        });

        res.json({
            success: true,
            message: 'Image supprimée avec succès',
            remainingImages: photos.length
        });

    } catch (error) {
        console.error(' Erreur suppression image:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de l\'image',
            error: error.message
        });
    }
};

// Servir les images statiquement
exports.serveImage = (req, res) => {
    const { id, filename } = req.params;
    const imagePath = path.join(__dirname, '../uploads/reclamations', id, filename);
    res.sendFile(imagePath);
};