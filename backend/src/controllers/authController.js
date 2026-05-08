const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ============================================
// INSCRIPTION
// ============================================
exports.register = async (req, res) => {
  try {
    const { nom, prenom, email, motDePasse, typeUtilisateur, telephone, adresse, service, zoneGeographique } = req.body;
    
    console.log('📝 Tentative inscription:', { email, typeUtilisateur });
    
    // Vérifier si l'utilisateur existe
    const [existing] = await db.execute(
      'SELECT idUtilisateur FROM Utilisateur WHERE email = ?',
      [email]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cet email est déjà utilisé' 
      });
    }
    
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(motDePasse, 10);
    
    // Insérer l'utilisateur
    const [userResult] = await db.execute(
      'INSERT INTO Utilisateur (nom, prenom, email, motDePasse, typeUtilisateur) VALUES (?, ?, ?, ?, ?)',
      [nom, prenom, email, hashedPassword, typeUtilisateur || 'Citoyen']
    );
    
    const userId = userResult.insertId;
    
    // Profil spécifique
if (!typeUtilisateur || typeUtilisateur === 'Citoyen') {
    await db.execute(
        'INSERT INTO Citoyen (idUtilisateur, adresse, telephone) VALUES (?, ?, ?)',
        [userId, adresse || '', telephone || '']
    );
    } else if (typeUtilisateur === 'AgentMunicipal') {
      await db.execute(
        'INSERT INTO AgentMunicipal (idUtilisateur, service, zoneGeographique) VALUES (?, ?, ?)',
        [userId, service || '', zoneGeographique || '']
      );
    } else if (typeUtilisateur === 'Administrateur') {
      await db.execute(
        'INSERT INTO Administrateur (idUtilisateur, service) VALUES (?, ?)',
        [userId, service || '']
      );
    }
    
    res.status(201).json({ 
      success: true, 
      message: 'Utilisateur créé avec succès',
      idUtilisateur: userId 
    });
    
  } catch (error) {
    console.error('❌ Erreur register:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la création' 
    });
  }
};

// ============================================
// CONNEXION
// ============================================
exports.login = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;
    
    console.log('🔑 Tentative connexion:', email);
    console.log('🔐 Mot de passe reçu:', motDePasse ? 'Présent' : 'MANQUANT');

    if (!motDePasse) {
      return res.status(400).json({
        success: false,
        message: 'Mot de passe requis'
      });
    }

    const [users] = await db.execute(
      'SELECT * FROM Utilisateur WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    const user = users[0];
    console.log('✅ Utilisateur trouvé:', user.email);

    const validPassword = await bcrypt.compare(motDePasse, user.motDePasse);

    if (!validPassword) {
      console.log('❌ Mot de passe incorrect');
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    console.log('✅ Mot de passe valide');

    const token = jwt.sign(
      {
        id: user.idUtilisateur,
        email: user.email,
        typeUtilisateur: user.typeUtilisateur
      },
      process.env.JWT_SECRET || 'votre_secret_key',
      { expiresIn: '24h' }
    );

    let userInfo = {
      id: user.idUtilisateur,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      typeUtilisateur: user.typeUtilisateur
    };

    if (user.typeUtilisateur === 'Citoyen') {
      const [citoyen] = await db.execute(
        'SELECT telephone, adresse FROM Citoyen WHERE idUtilisateur = ?',
        [user.idUtilisateur]
      );
      if (citoyen.length > 0) {
        userInfo = { ...userInfo, ...citoyen[0] };
      }
    }

    res.json({
      success: true,
      message: 'Connexion réussie',
      token,
      user: userInfo
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
// RÉCUPÉRER LE PROFIL
// ============================================
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [users] = await db.execute(
      'SELECT idUtilisateur, nom, prenom, email, typeUtilisateur FROM Utilisateur WHERE idUtilisateur = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    const user = users[0];
    let userInfo = { ...user };

    if (user.typeUtilisateur === 'Citoyen') {
      const [citoyen] = await db.execute(
        'SELECT telephone, adresse FROM Citoyen WHERE idUtilisateur = ?',
        [userId]
      );
      if (citoyen.length > 0) {
        userInfo = { ...userInfo, ...citoyen[0] };
      }
    }

    res.json({
      success: true,
      data: userInfo
    });

  } catch (error) {
    console.error('❌ Erreur getProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil'
    });
  }
};

// ============================================
// METTRE À JOUR LE PROFIL
// ============================================
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nom, prenom, telephone, adresse } = req.body;
    
    console.log('✏️ Mise à jour profil pour utilisateur:', userId);
    console.log('📦 Données reçues:', { nom, prenom, telephone, adresse });

    await db.execute(
      'UPDATE Utilisateur SET nom = ?, prenom = ? WHERE idUtilisateur = ?',
      [nom, prenom, userId]
    );

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
// CHANGER LE MOT DE PASSE
// ============================================
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { ancienMotDePasse, nouveauMotDePasse } = req.body;
    
    console.log('🔐 Changement mot de passe pour utilisateur:', userId);

    const [users] = await db.execute(
      'SELECT motDePasse FROM Utilisateur WHERE idUtilisateur = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Utilisateur non trouvé' 
      });
    }

    const validPassword = await bcrypt.compare(ancienMotDePasse, users[0].motDePasse);
    
    if (!validPassword) {
      return res.status(401).json({ 
        success: false,
        message: 'Ancien mot de passe incorrect' 
      });
    }

    const hashedPassword = await bcrypt.hash(nouveauMotDePasse, 10);

    await db.execute(
      'UPDATE Utilisateur SET motDePasse = ? WHERE idUtilisateur = ?',
      [hashedPassword, userId]
    );

    res.json({ 
      success: true,
      message: 'Mot de passe modifié avec succès' 
    });

  } catch (error) {
    console.error('❌ Erreur changePassword:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors du changement de mot de passe' 
    });
  }
};

// ============================================
// MOT DE PASSE OUBLIÉ (NOUVEAU)
// ============================================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    console.log('📧 Demande de réinitialisation pour:', email);

    const [users] = await db.execute(
      'SELECT idUtilisateur FROM Utilisateur WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Aucun compte associé à cet email'
      });
    }

    console.log('✅ Email de réinitialisation envoyé (simulé)');

    res.json({
      success: true,
      message: 'Email de réinitialisation envoyé'
    });

  } catch (error) {
    console.error('❌ Erreur forgotPassword:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la demande'
    });
  }
};

// ============================================
// RÉINITIALISER LE MOT DE PASSE (NOUVEAU)
// ============================================
exports.resetPassword = async (req, res) => {
  try {
    const { token, nouveauMotDePasse } = req.body;
    console.log('🔐 Réinitialisation avec token:', token);

    const hashedPassword = await bcrypt.hash(nouveauMotDePasse, 10);

    console.log('✅ Mot de passe réinitialisé (simulé)');

    res.json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur resetPassword:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la réinitialisation'
    });
  }
};

// ============================================
// DÉCONNEXION
// ============================================
exports.logout = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Déconnexion réussie'
    });
  } catch (error) {
    console.error('❌ Erreur logout:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la déconnexion'
    });
  }
};

