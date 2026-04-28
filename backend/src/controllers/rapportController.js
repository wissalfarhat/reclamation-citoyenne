const Rapport = require('../models/Rapport');
const Statistique = require('../models/Statistique');

exports.createRapport = async (req, res) => {
    try {
        // Si une statistique est fournie, la créer d'abord
        if (req.body.statistiqueData) {
            const idStatistique = await Statistique.create(req.body.statistiqueData);
            req.body.idStatistique = idStatistique;
        }

        const id = await Rapport.create(req.body);
        res.status(201).json({ message: 'Rapport créé avec succès', id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la création du rapport' });
    }
};

exports.getAllRapports = async (req, res) => {
    try {
        const rapports = await Rapport.getAll();
        res.json(rapports);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la récupération des rapports' });
    }
};

exports.getRapportById = async (req, res) => {
    try {
        const { id } = req.params;
        const rapport = await Rapport.findById(id);
        
        if (!rapport) {
            return res.status(404).json({ message: 'Rapport non trouvé' });
        }
        
        res.json(rapport);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la récupération du rapport' });
    }
};

exports.updateRapport = async (req, res) => {
    try {
        const { id } = req.params;
        const affectedRows = await Rapport.update(id, req.body);
        
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Rapport non trouvé' });
        }
        
        res.json({ message: 'Rapport mis à jour avec succès' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour du rapport' });
    }
};

exports.deleteRapport = async (req, res) => {
    try {
        const { id } = req.params;
        const affectedRows = await Rapport.delete(id);
        
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Rapport non trouvé' });
        }
        
        res.json({ message: 'Rapport supprimé avec succès' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la suppression du rapport' });
    }
};

// ============================================
// GÉNÉRER RAPPORT AUTOMATIQUE
// ============================================
exports.genererRapportAutomatique = async (req, res) => {
    try {
        console.log('📊 Génération rapport automatique...');
        console.log('Données reçues:', req.body);
        
        const { titre, periode = 'mois', type = 'pdf' } = req.body;
        
        if (!titre) {
            return res.status(400).json({
                success: false,
                message: 'Le titre du rapport est requis'
            });
        }
        
        // Simuler la génération d'un rapport
        const idRapport = Math.floor(Math.random() * 1000);
        
        res.status(201).json({
            success: true,
            message: 'Rapport généré avec succès',
            idRapport,
            titre,
            periode,
            type,
            dateGeneration: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Erreur:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la génération du rapport',
            error: error.message
        });
    }
};