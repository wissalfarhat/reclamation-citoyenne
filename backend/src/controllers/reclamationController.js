const Reclamation = require('../models/Reclamation');
const Localisation = require('../models/Localisation');
const Historique = require('../models/Historique');
const Notification = require('../models/Notification');
const imageProcessor = require('../middlewares/upload/imageProcessor');
const StatsAutoService = require('../services/statsService');
const db = require('../config/database');

// ============================================
// CRÉER UNE RÉCLAMATION
// ============================================
const calculatePriority = (idCategorie) => {
  const highPriority = [8, 3]; // Sécurité et risques, Eau et assainissement
  const mediumPriority = [1, 2, 5]; // Voirie, Éclairage, Transport
  if (highPriority.includes(Number(idCategorie))) return 8;
  if (mediumPriority.includes(Number(idCategorie))) return 5;
  return 3;
};
exports.createReclamation = async (req, res) => {
    try {
        const hasImages = req.files && req.files.length > 0;
        let idLocalisation = req.body.idLocalisation;

        if (!idLocalisation && req.body.latitude && req.body.longitude) {
            const localisationData = {
                latitude: req.body.latitude,
                longitude: req.body.longitude,
                adresse: req.body.adresse || 'Adresse non spécifiée',
                ville: req.body.ville || 'Tunis',
                quartier: req.body.quartier || 'Non spécifié'
            };
            idLocalisation = await Localisation.create(localisationData);
        }

        const reclamationData = {
            titre: req.body.titre,
            description: req.body.description,
            idCategorie: req.body.idCategorie,
            idLocalisation: idLocalisation || 1,
            idCitoyen: req.user.id,
            statut: req.body.statut || 'En attente',
            priorite: req.body.priorite || calculatePriority(req.body.idCategorie)
        };
        

        const idReclamation = await Reclamation.create(reclamationData);

        let processedImages = [];
        if (hasImages) {
            processedImages = await imageProcessor.processMultipleImages(req.files, idReclamation);
            await Reclamation.update(idReclamation, { ...reclamationData, photos: processedImages });
        }

        await Historique.create({
            action: 'Réclamation créée',
            commentaire: hasImages ? `Avec ${processedImages.length} photo(s)` : 'Sans photo',
            utilisateur: `${req.user.prenom || ''} ${req.user.nom || ''}`.trim() || 'Citoyen',
            idReclamation
        });

        await Notification.create({
            message: 'Votre réclamation a été créée avec succès',
            type: 'creation',
            idReclamation,
            idCitoyen: req.user.id
        });

        try {
            const nouvelleReclamation = await Reclamation.getById(idReclamation);
            if (StatsAutoService && StatsAutoService.onReclamationCreee) {
                await StatsAutoService.onReclamationCreee(nouvelleReclamation);
            }
        } catch (statsError) {
            console.log('⚠️ Erreur stats:', statsError.message);
        }

        res.status(201).json({
            success: true,
            message: 'Réclamation créée avec succès',
            idReclamation,
            images: processedImages,
            imageCount: processedImages.length
        });

    } catch (error) {
        console.error('❌ Erreur createReclamation:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================
// LISTER TOUTES LES RÉCLAMATIONS AVEC FILTRES
// ============================================
exports.getAllReclamations = async (req, res) => {
    try {
        const { statut, idCategorie, dateDebut, dateFin, search } = req.query;

let query = `
  SELECT 
    r.*,
    c.nomCategorie,
    l.ville, l.quartier, l.adresse,
    l.latitude, l.longitude,
    u.nom as citoyenNom, u.prenom as citoyenPrenom,
    ua.nom as agentNom, ua.prenom as agentPrenom,
    am.zoneGeographique as agentZone
  FROM Reclamation r
  LEFT JOIN Categorie c ON r.idCategorie = c.idCategorie
  LEFT JOIN Localisation l ON r.idLocalisation = l.idLocalisation
  LEFT JOIN Utilisateur u ON r.idCitoyen = u.idUtilisateur
  LEFT JOIN Utilisateur ua ON r.idAgent = ua.idUtilisateur
  LEFT JOIN AgentMunicipal am ON r.idAgent = am.idUtilisateur
  WHERE 1=1
`;
        const params = [];

        if (statut && statut !== '' && statut !== 'Tous') {
            query += ' AND r.statut = ?';
            params.push(statut);
        }
        if (idCategorie && idCategorie !== '') {
            query += ' AND r.idCategorie = ?';
            params.push(idCategorie);
        }
        if (dateDebut && dateDebut !== '') {
            query += ' AND DATE(r.dateCreation) >= ?';
            params.push(dateDebut);
        }
        if (dateFin && dateFin !== '') {
            query += ' AND DATE(r.dateCreation) <= ?';
            params.push(dateFin);
        }
        if (search && search !== '') {
            query += ' AND (r.titre LIKE ? OR r.description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY r.dateCreation DESC';

        const [reclamations] = await db.execute(query, params);
        res.json({ success: true, data: reclamations, count: reclamations.length });

    } catch (error) {
        console.error('❌ Erreur getAllReclamations:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================
// OBTENIR UNE RÉCLAMATION PAR ID
// ============================================
exports.getReclamationById = async (req, res) => {
    try {
        const reclamation = await Reclamation.findById(req.params.id);
        if (!reclamation) return res.status(404).json({ success: false, message: 'Réclamation non trouvée' });
        res.json({ success: true, data: reclamation });
    } catch (error) {
        console.error('❌ Erreur getReclamationById:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================
// OBTENIR L'HISTORIQUE D'UNE RÉCLAMATION
// ============================================
exports.getHistorique = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.execute(`
            SELECT * FROM Historique
            WHERE idReclamation = ?
            ORDER BY dateAction DESC
        `, [id]);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('❌ Erreur getHistorique:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================
// METTRE À JOUR UNE RÉCLAMATION
// ============================================
exports.updateReclamation = async (req, res) => {
    res.json({ success: true, message: 'updateReclamation à implémenter' });
};

// ============================================
// METTRE À JOUR STATUT PAR AGENT
// ============================================
exports.updateStatusByAgent = async (req, res) => {
    res.json({ success: true, message: 'updateStatusByAgent à implémenter' });
};

// ============================================
// ASSIGNER À UN AGENT
// ============================================
exports.assignToAgent = async (req, res) => {
    try {
        const { id } = req.params;
        const { idAgent } = req.body;
        const affectedRows = await Reclamation.assignToAgent(id, idAgent);
        if (affectedRows === 0) return res.status(400).json({ success: false, message: 'Échec de l\'assignation' });

        await Historique.create({
            action: 'Assignation à un agent',
            commentaire: `Assigné à l'agent ID: ${idAgent}`,
            utilisateur: `${req.user.prenom || ''} ${req.user.nom || ''}`.trim() || 'Admin',
            idReclamation: id
        });

        res.json({ success: true, message: 'Réclamation assignée avec succès' });

    } catch (error) {
        console.error('❌ Erreur assignToAgent:', error);
        if (error.message === 'Agent non trouvé') return res.status(404).json({ success: false, message: 'Agent non trouvé' });
        if (error.message === 'Réclamation non trouvée') return res.status(404).json({ success: false, message: 'Réclamation non trouvée' });
        res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================
// STATISTIQUES PAR CATÉGORIE
// ============================================
exports.getStatsByCategory = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT 
                c.idCategorie,
                c.nomCategorie,
                COUNT(r.idReclamation) as nombre,
                COALESCE(SUM(CASE WHEN r.statut = 'En attente' THEN 1 ELSE 0 END), 0) as enAttente,
                COALESCE(SUM(CASE WHEN r.statut = 'En cours' THEN 1 ELSE 0 END), 0) as enCours,
                COALESCE(SUM(CASE WHEN r.statut = 'Traitée' THEN 1 ELSE 0 END), 0) as traitees
            FROM Categorie c
            LEFT JOIN Reclamation r ON c.idCategorie = r.idCategorie
            GROUP BY c.idCategorie, c.nomCategorie
            ORDER BY c.idCategorie
        `);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('❌ Erreur getStatsByCategory:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================
// RÉCLAMATIONS SIMILAIRES
// ============================================
exports.findSimilarReclamations = async (req, res) => {
    res.json({ success: true, message: 'findSimilarReclamations à implémenter', data: [] });
};

// ============================================
// AJOUTER UN COMMENTAIRE
// ============================================
exports.addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { commentaire } = req.body;

        if (!commentaire || commentaire.trim() === '') {
            return res.status(400).json({ success: false, message: 'Le commentaire est vide' });
        }

        // ✅ Get citizen to notify
        const [reclamation] = await db.execute(
            'SELECT idCitoyen, titre FROM Reclamation WHERE idReclamation = ?', [id]
        );

        await Historique.create({
            action: 'Commentaire ajouté',
            commentaire,
            utilisateur: `${req.user.prenom || ''} ${req.user.nom || ''}`.trim() || 'Agent',
            idReclamation: id
        });

        // ✅ Notify citizen
        if (reclamation[0]) {
            await Notification.create({
                message: `Un agent a commenté votre réclamation "${reclamation[0].titre}" : ${commentaire}`,
                type: 'commentaire',
                idReclamation: id,
                idCitoyen: reclamation[0].idCitoyen
            });
        }

        res.json({ success: true, message: 'Commentaire ajouté avec succès' });
    } catch (error) {
        console.error('❌ Erreur addComment:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};