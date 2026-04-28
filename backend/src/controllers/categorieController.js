const Categorie = require('../models/Categorie');
const db = require('../config/database');

exports.createCategorie = async (req, res) => {
    try {
        const { nomCategorie, description, prioriteDefaut } = req.body;

        // ✅ Check duplicate
        const [existing] = await db.execute(
            'SELECT idCategorie FROM Categorie WHERE nomCategorie = ?',
            [nomCategorie]
        );
        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: `La catégorie "${nomCategorie}" existe déjà`
            });
        }

        const id = await Categorie.create(req.body);
        res.status(201).json({ success: true, message: 'Catégorie créée avec succès', id });
    } catch (error) {
        console.error('❌ Erreur createCategorie:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Categorie.getAll();
        res.json({ success: true, data: categories });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getCategorieById = async (req, res) => {
    try {
        const { id } = req.params;
        const categorie = await Categorie.findById(id);
        if (!categorie) {
            return res.status(404).json({ success: false, message: 'Catégorie non trouvée' });
        }
        res.json({ success: true, data: categorie });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateCategorie = async (req, res) => {
    try {
        const { id } = req.params;
        const { nomCategorie } = req.body;

        // ✅ Check duplicate for another category
        const [existing] = await db.execute(
            'SELECT idCategorie FROM Categorie WHERE nomCategorie = ? AND idCategorie != ?',
            [nomCategorie, id]
        );
        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: `La catégorie "${nomCategorie}" existe déjà`
            });
        }

        const affectedRows = await Categorie.update(id, req.body);
        if (affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Catégorie non trouvée' });
        }
        res.json({ success: true, message: 'Catégorie mise à jour avec succès' });
    } catch (error) {
        console.error('❌ Erreur updateCategorie:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteCategorie = async (req, res) => {
    try {
        const { id } = req.params;
        const affectedRows = await Categorie.delete(id);
        if (affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Catégorie non trouvée' });
        }
        res.json({ success: true, message: 'Catégorie supprimée avec succès' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};