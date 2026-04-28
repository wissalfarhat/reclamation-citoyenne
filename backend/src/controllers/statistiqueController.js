const Statistique = require('../models/Statistique');
const statsController = require('../controllers/statsController');

exports.createStatistique = async (req, res) => {
    try {
        const id = await Statistique.create(req.body);
        res.status(201).json({ message: 'Statistique créée avec succès', id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la création de la statistique' });
    }
};

exports.getStatistiqueById = async (req, res) => {
    try {
        const { id } = req.params;
        const statistique = await Statistique.findById(id);
        
        if (!statistique) {
            return res.status(404).json({ message: 'Statistique non trouvée' });
        }
        
        res.json(statistique);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la récupération de la statistique' });
    }
};

exports.getStatistiquesByType = async (req, res) => {
    try {
        const { type } = req.params;
        const limit = req.query.limit || 10;
        const statistiques = await Statistique.getByType(type, limit);
        res.json(statistiques);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la récupération des statistiques' });
    }
};

exports.getRecentStatistiques = async (req, res) => {
    try {
        const limit = req.query.limit || 20;
        const statistiques = await Statistique.getRecent(limit);
        res.json(statistiques);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la récupération des statistiques' });
    }
};

exports.generateMonthlyStats = async (req, res) => {
    try {
        const stats = await Statistique.generateMonthlyStats();
        res.json(stats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la génération des statistiques mensuelles' });
    }
};