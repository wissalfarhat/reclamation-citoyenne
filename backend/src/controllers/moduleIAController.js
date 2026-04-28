const ModuleIA = require('../models/ModuleIA');

// RÉCUPÉRER LA CONFIGURATION
exports.getConfig = async (req, res) => {
    try {
        const config = await ModuleIA.getConfig();
        
        res.json({
            success: true,
            data: config
        });

    } catch (error) {
        console.error(' Erreur getConfig:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// PROPOSER UNE PRIORITÉ
exports.proposerPriorite = async (req, res) => {
    try {
        const { description, idCategorie } = req.body;
        
        if (!description) {
            return res.status(400).json({
                success: false,
                message: 'La description est requise'
            });
        }
        
        const priorite = await ModuleIA.proposerPriorite(description, idCategorie);
        
        res.json({
            success: true,
            prioriteSuggeree: priorite
        });

    } catch (error) {
        console.error(' Erreur proposerPriorite:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// CLASSIFIER PAR CATÉGORIE
exports.classifierParCategorie = async (req, res) => {
    try {
        const { description } = req.body;
        
        if (!description) {
            return res.status(400).json({
                success: false,
                message: 'La description est requise'
            });
        }
        
        const categorieId = await ModuleIA.classifierParCategorie(description);
        
        const db = require('../config/database');
        const [categorie] = await db.execute(
            'SELECT nomCategorie FROM Categorie WHERE idCategorie = ?',
            [categorieId]
        );
        
        res.json({
            success: true,
            categorieId,
            nomCategorie: categorie[0]?.nomCategorie || 'Autres'
        });

    } catch (error) {
        console.error(' Erreur classifierParCategorie:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// METTRE À JOUR LA CONFIGURATION
exports.updateConfig = async (req, res) => {
    try {
        const { idModuleIA, seuilUrgence, tauxSimilarite, modeleEntraine } = req.body;
        
        if (!idModuleIA) {
            return res.status(400).json({
                success: false,
                message: 'idModuleIA est requis'
            });
        }
        
        const updated = await ModuleIA.updateConfig({
            idModuleIA,
            seuilUrgence,
            tauxSimilarite,
            modeleEntraine
        });
        
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Configuration non trouvée'
            });
        }
        
        const config = await ModuleIA.getConfig();
        
        res.json({
            success: true,
            message: 'Configuration mise à jour',
            data: config
        });

    } catch (error) {
        console.error(' Erreur updateConfig:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// DÉTECTER LES SIMILITUDES
exports.detecterSimilarite = async (req, res) => {
    try {
        console.log('  Demande de détection de similarité');
        console.log(' Données reçues:', req.body);
        
        const { description, localisation, limite } = req.body;
        
        if (!description) {
            return res.status(400).json({
                success: false,
                message: 'La description est requise'
            });
        }
        
        const similaires = await ModuleIA.detecterSimilarite(
            description,
            localisation,
            limite || 5
        );
        
        res.json({
            success: true,
            count: similaires.length,
            data: similaires
        });

    } catch (error) {
        console.error(' Erreur detecterSimilarite:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};