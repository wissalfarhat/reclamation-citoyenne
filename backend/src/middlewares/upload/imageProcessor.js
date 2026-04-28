const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

class ImageProcessor {
    constructor() {
        this.qualities = {
            thumbnail: { width: 200, height: 200, fit: 'cover' },
            medium: { width: 800, height: 600, fit: 'inside' },
            large: { width: 1200, height: 900, fit: 'inside' }
        };
    }

    /**
     * Traite et optimise une image
     * @param {string} tempPath - Chemin temporaire de l'image
     * @param {string} filename - Nom du fichier original
     * @param {number} reclamationId - ID de la réclamation
     * @returns {Promise<Object>} - Informations sur l'image traitée
     */
    async processImage(tempPath, filename, reclamationId) {
        try {
            const uniqueId = uuidv4();
            const extension = path.extname(filename);
            const baseName = path.basename(filename, extension);
            
            // Créer le dossier pour cette réclamation
            const reclamationUploadDir = path.join(__dirname, '../../uploads/reclamations', String(reclamationId));
            await fs.mkdir(reclamationUploadDir, { recursive: true });

            // Informations sur l'image originale
            const metadata = await sharp(tempPath).metadata();
            
            // Générer différentes tailles
            const versions = {};
            
            for (const [size, options] of Object.entries(this.qualities)) {
                const outputFilename = `${baseName}_${size}${extension}`;
                const outputPath = path.join(reclamationUploadDir, outputFilename);
                
                await sharp(tempPath)
                    .resize(options.width, options.height, {
                        fit: options.fit,
                        withoutEnlargement: true
                    })
                    .jpeg({ quality: 80, mozjpeg: true })
                    .toFile(outputPath);
                
                versions[size] = {
                    filename: outputFilename,
                    path: `/uploads/reclamations/${reclamationId}/${outputFilename}`,
                    width: options.width,
                    height: options.height
                };
            }

            // Supprimer le fichier temporaire
            await fs.unlink(tempPath);

            return {
                originalName: filename,
                uniqueId: uniqueId,
                versions: versions,
                metadata: {
                    width: metadata.width,
                    height: metadata.height,
                    format: metadata.format,
                    size: metadata.size
                }
            };

        } catch (error) {
            console.error('❌ Erreur lors du traitement de l\'image:', error);
            throw error;
        }
    }

    /**
     * Traite plusieurs images
     * @param {Array} files - Fichiers uploadés
     * @param {number} reclamationId - ID de la réclamation
     * @returns {Promise<Array>}
     */
    async processMultipleImages(files, reclamationId) {
        const processedImages = [];
        
        for (const file of files) {
            try {
                const processed = await this.processImage(
                    file.path,
                    file.originalname,
                    reclamationId
                );
                processedImages.push(processed);
            } catch (error) {
                console.error(`❌ Erreur sur ${file.originalname}:`, error);
                // Nettoyer le fichier temporaire en cas d'erreur
                try {
                    await fs.unlink(file.path);
                } catch (unlinkError) {
                    // Ignorer
                }
            }
        }
        
        return processedImages;
    }

    /**
     * Supprime les images d'une réclamation
     * @param {number} reclamationId - ID de la réclamation
     */
    async deleteReclamationImages(reclamationId) {
        const dirPath = path.join(__dirname, '../../uploads/reclamations', String(reclamationId));
        
        try {
            await fs.rm(dirPath, { recursive: true, force: true });
            console.log(`✅ Images supprimées pour réclamation ${reclamationId}`);
        } catch (error) {
            console.error(`❌ Erreur lors de la suppression des images:`, error);
        }
    }
}

module.exports = new ImageProcessor();