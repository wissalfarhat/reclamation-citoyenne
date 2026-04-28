const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// S'assurer que les dossiers existent
const uploadsDir = path.join(__dirname, '../../uploads');
const reclamationsDir = path.join(uploadsDir, 'reclamations');
const tempDir = path.join(uploadsDir, 'temp');

[uploadsDir, reclamationsDir, tempDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Configuration du stockage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Stocker d'abord dans temp pour traitement
        cb(null, tempDir);
    },
    filename: (req, file, cb) => {
        // Générer un nom unique
        const uniqueId = uuidv4();
        const extension = path.extname(file.originalname);
        const filename = `${uniqueId}${extension}`;
        cb(null, filename);
    }
});

// Filtre pour n'accepter que les images
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Format de fichier non supporté. Utilisez JPG, PNG, GIF ou WEBP'), false);
    }
};

// Configuration de multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
        files: 5 // Maximum 5 fichiers par requête
    }
});

module.exports = upload;