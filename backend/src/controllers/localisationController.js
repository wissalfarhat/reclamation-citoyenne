const Localisation = require('../models/Localisation');

exports.createLocalisation = async (req, res) => {
    try {
        const id = await Localisation.create(req.body);
        res.status(201).json({ message: 'Localisation créée avec succès', id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la création de la localisation' });
    }
};

exports.getAllLocalisations = async (req, res) => {
    try {
        const localisations = await Localisation.getAll();
        res.json(localisations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la récupération des localisations' });
    }
};

exports.getLocalisationById = async (req, res) => {
    try {
        const { id } = req.params;
        const localisation = await Localisation.findById(id);
        
        if (!localisation) {
            return res.status(404).json({ message: 'Localisation non trouvée' });
        }
        
        res.json(localisation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la récupération de la localisation' });
    }
};

exports.getLocalisationByQuartier = async (req, res) => {
    try {
        const { quartier } = req.params;
        const localisations = await Localisation.findByQuartier(quartier);
        res.json(localisations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la récupération des localisations' });
    }
};