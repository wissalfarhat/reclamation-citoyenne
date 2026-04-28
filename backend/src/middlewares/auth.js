const jwt = require('jsonwebtoken');
const db = require('../config/database');
require('dotenv').config();

// ============================================
// VÉRIFIER LE TOKEN ET AJOUTER LES INFOS USER
// ============================================
exports.verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ success: false, message: 'Token manquant' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'Format de token invalide' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');

        if (!decoded.id) {
            return res.status(401).json({ success: false, message: 'Token invalide (id manquant)' });
        }

        const [users] = await db.execute(
            `SELECT idUtilisateur, nom, prenom, email, typeUtilisateur
             FROM Utilisateur
             WHERE idUtilisateur = ?`,
            [decoded.id]
        );

        if (users.length === 0) {
            return res.status(401).json({ success: false, message: 'Utilisateur non trouvé' });
        }

        const user = users[0];

        req.user = {
            id: user.idUtilisateur,
            nom: user.nom,
            prenom: user.prenom,
            email: user.email,
            typeUtilisateur: user.typeUtilisateur
        };

        console.log(`✅ Utilisateur authentifié : ${user.prenom} ${user.nom}`);
        next();

    } catch (error) {
        console.error('❌ Erreur auth :', error.message);
        const message = error.name === 'TokenExpiredError' ? 'Token expiré' : 'Token invalide';
        return res.status(401).json({ success: false, message });
    }
};

// ============================================
// MIDDLEWARE ADMIN
// ============================================
exports.isAdmin = (req, res, next) => {
    console.log('🔍 Vérification admin - Type utilisateur:', req.user?.typeUtilisateur);
    if (req.user?.typeUtilisateur !== 'Administrateur') {
        return res.status(403).json({ success: false, message: 'Accès réservé aux administrateurs' });
    }
    next();
};



// ============================================
// MIDDLEWARE AGENT MUNICIPAL
// ============================================
exports.isAgent = (req, res, next) => {
  if (!req.user || req.user.typeUtilisateur !== 'AgentMunicipal') {
    return res.status(403).json({
      success: false,
      message: 'Accès réservé aux agents municipaux'
    });
  }
  next();
};


// ============================================
// MIDDLEWARE CITOYEN
// ============================================
exports.isCitoyen = (req, res, next) => {
    if (req.user.typeUtilisateur !== 'Citoyen') {
        return res.status(403).json({
            message: 'Accès réservé aux citoyens'
        });
    }
    next();
};