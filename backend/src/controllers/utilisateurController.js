const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const Utilisateur = require('../models/Utilisateur');
const Citoyen = require('../models/Citoyen');
const AgentMunicipal = require('../models/AgentMunicipal');
const Administrateur = require('../models/Administrateur');
require('dotenv').config();

// ============================================
// INSCRIPTION
// ============================================
exports.register = async (req, res) => {
    try {
        const { nom, prenom, email, motDePasse, typeUtilisateur, ...additionalData } = req.body;

        const existingUser = await Utilisateur.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'Cet email est déjà utilisé' });
        }

        const hashedPassword = await bcrypt.hash(motDePasse, 10);

        const utilisateurData = {
            nom,
            prenom,
            email,
            motDePasse: hashedPassword,
            typeUtilisateur
        };

        const idUtilisateur = await Utilisateur.create(utilisateurData);

        if (typeUtilisateur === 'Citoyen') {
            await Citoyen.create(idUtilisateur, additionalData);
        } else if (typeUtilisateur === 'AgentMunicipal') {
            await AgentMunicipal.create(idUtilisateur, additionalData);
        } else if (typeUtilisateur === 'Administrateur') {
            await Administrateur.create(idUtilisateur, additionalData);
        }

        res.status(201).json({
            message: 'Utilisateur créé avec succès',
            idUtilisateur
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la création de l'utilisateur" });
    }
};

// ============================================
// CONNEXION
// ============================================
exports.login = async (req, res) => {
    try {
        const { email, motDePasse } = req.body;
        
        console.log('🔑 Tentative login pour:', email);
        console.log('🔐 Mot de passe reçu:', motDePasse ? 'Présent' : 'MANQUANT');

        if (!motDePasse) {
            return res.status(400).json({ message: 'Mot de passe requis' });
        }

        const utilisateur = await Utilisateur.findByEmail(email);
        
        if (!utilisateur) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        console.log('✅ Utilisateur trouvé:', utilisateur.email);
        
        const validPassword = await bcrypt.compare(motDePasse, utilisateur.motDePasse);

        if (!validPassword) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        const token = jwt.sign(
            {
                id: utilisateur.idUtilisateur,
                email: utilisateur.email,
                typeUtilisateur: utilisateur.typeUtilisateur
            },
            process.env.JWT_SECRET || 'votre_secret_key_temporaire_123456',
            { expiresIn: '24h' }
        );

        let userData = {};

        if (utilisateur.typeUtilisateur === 'Citoyen') {
            const [citoyen] = await db.execute(
                'SELECT telephone, adresse FROM Citoyen WHERE idUtilisateur = ?',
                [utilisateur.idUtilisateur]
            );
            if (citoyen.length > 0) {
                userData = citoyen[0];
            }
        }

        res.json({
            success: true,
            token,
            user: {
                id: utilisateur.idUtilisateur,
                nom: utilisateur.nom,
                prenom: utilisateur.prenom,
                email: utilisateur.email,
                typeUtilisateur: utilisateur.typeUtilisateur,
                ...userData
            }
        });

    } catch (error) {
        console.error('❌ Erreur login:', error);
        res.status(500).json({ 
            success: false,
            message: 'Erreur lors de la connexion' 
        });
    }
};

// ============================================
// PROFIL
// ============================================
exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const userType = req.user.typeUtilisateur;

        let userData;

        if (userType === 'Citoyen') {
            userData = await Citoyen.findById(userId);
        } else if (userType === 'AgentMunicipal') {
            userData = await AgentMunicipal.findById(userId);
        } else if (userType === 'Administrateur') {
            userData = await Administrateur.findById(userId);
        }

        if (!userData) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        res.json(userData);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la récupération du profil' });
    }
};

// ============================================
// MISE À JOUR PROFIL (VERSION CORRIGÉE)
// ============================================
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { nom, prenom, email, telephone, adresse } = req.body;
        
        console.log('✏️ Mise à jour profil pour utilisateur:', userId);
        console.log('📦 Données reçues:', { nom, prenom, email, telephone, adresse });

        // 1️⃣ Mettre à jour Utilisateur
        await db.execute(
            'UPDATE Utilisateur SET nom = ?, prenom = ?, email = ? WHERE idUtilisateur = ?',
            [nom, prenom, email, userId]
        );

        // 2️⃣ Mettre à jour Citoyen (si c'est un citoyen)
        if (req.user.typeUtilisateur === 'Citoyen') {
            await db.execute(
                'UPDATE Citoyen SET telephone = ?, adresse = ? WHERE idUtilisateur = ?',
                [telephone || '', adresse || '', userId]
            );
        }

        res.json({ 
            success: true,
            message: 'Profil mis à jour avec succès' 
        });

    } catch (error) {
        console.error('❌ Erreur updateProfile:', error);
        res.status(500).json({ 
            success: false,
            message: 'Erreur lors de la mise à jour du profil' 
        });
    }
};

// ============================================
// DÉCONNEXION
// ============================================
exports.logout = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Token manquant'
            });
        }

        console.log(`Utilisateur ${req.user.id} déconnecté`);

        res.json({
            success: true,
            message: 'Déconnexion réussie'
        });

    } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la déconnexion'
        });
    }
};