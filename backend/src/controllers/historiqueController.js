const Historique = require('../models/Historique');

exports.getReclamationHistory = async (req, res) => {
    try {
        const { idReclamation } = req.params;
        const historique = await Historique.findByReclamation(idReclamation);
        res.json(historique);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la récupération de l\'historique' });
    }
};

exports.getRecentActions = async (req, res) => {
    try {
        const limit = req.query.limit || 50;
        const actions = await Historique.getRecentActions(limit);
        res.json(actions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la récupération des actions récentes' });
    }
};