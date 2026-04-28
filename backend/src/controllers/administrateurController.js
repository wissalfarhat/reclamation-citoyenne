const db = require('../config/database');
const bcrypt = require('bcryptjs');

exports.getDashboardStats = async (req, res) => {
  try {
    const [stats] = await db.execute(`
      SELECT 
        (SELECT COUNT(*) FROM Reclamation) as totalReclamations,
        (SELECT COUNT(*) FROM Reclamation WHERE statut = 'En attente') as enAttente,
        (SELECT COUNT(*) FROM Reclamation WHERE statut = 'En cours') as enCours,
        (SELECT COUNT(*) FROM Reclamation WHERE statut = 'Traitée') as traitees,
        (SELECT COUNT(*) FROM Reclamation WHERE statut = 'Refusée') as refusees,
        (SELECT COUNT(*) FROM Utilisateur WHERE typeUtilisateur = 'Citoyen') as totalCitoyens,
        (SELECT COUNT(*) FROM Utilisateur WHERE typeUtilisateur = 'AgentMunicipal') as totalAgents,
        (SELECT COUNT(*) FROM Utilisateur WHERE typeUtilisateur = 'Administrateur') as totalAdmins
    `);
    res.json({ success: true, data: stats[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.execute(`
      SELECT 
        u.idUtilisateur, u.nom, u.prenom, u.email, u.typeUtilisateur,
        c.telephone, c.adresse,
        a.service          as service,
        a.zoneGeographique as zoneGeographique
      FROM Utilisateur u
      LEFT JOIN Citoyen c        ON u.idUtilisateur = c.idUtilisateur
      LEFT JOIN AgentMunicipal a ON u.idUtilisateur = a.idUtilisateur
      ORDER BY u.idUtilisateur DESC
    `);
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('DELETE FROM Utilisateur WHERE idUtilisateur = ?', [id]);
    res.json({ success: true, message: 'Utilisateur supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, prenom, telephone, service, zoneGeographique, typeUtilisateur } = req.body;

    console.log('🔄 Update user:', id, '| nouveau rôle:', typeUtilisateur);

    // Get current role
    const [currentUser] = await db.execute(
      'SELECT typeUtilisateur FROM Utilisateur WHERE idUtilisateur = ?', [id]
    );

    if (currentUser.length === 0) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    const oldRole = currentUser[0].typeUtilisateur;
    const newRole = typeUtilisateur || oldRole;

    console.log('🔄 Rôle:', oldRole, '→', newRole);

    await db.execute(
      'UPDATE Utilisateur SET nom = ?, prenom = ?, typeUtilisateur = ? WHERE idUtilisateur = ?',
      [nom, prenom, newRole, id]
    );

    if (oldRole !== newRole) {
      console.log('🔄 Changement de rôle détecté');

      if (oldRole === 'AgentMunicipal') {
        await db.execute('DELETE FROM AgentMunicipal WHERE idUtilisateur = ?', [id]);
      } else if (oldRole === 'Administrateur') {
        await db.execute('DELETE FROM Administrateur WHERE idUtilisateur = ?', [id]);
      } else if (oldRole === 'Citoyen') {
        await db.execute('DELETE FROM Citoyen WHERE idUtilisateur = ?', [id]);
      }

      if (newRole === 'AgentMunicipal') {
        await db.execute(
          'INSERT INTO AgentMunicipal (idUtilisateur, service, zoneGeographique) VALUES (?, ?, ?)',
          [id, service || '', zoneGeographique || '']
        );
        console.log(' AgentMunicipal créé');
      } else if (newRole === 'Administrateur') {
        await db.execute(
          'INSERT INTO Administrateur (idUtilisateur, service) VALUES (?, ?)',
          [id, service || '']
        );
        console.log(' Administrateur créé');
      } else if (newRole === 'Citoyen') {
        await db.execute(
          'INSERT INTO Citoyen (idUtilisateur, telephone, adresse) VALUES (?, ?, ?)',
          [id, telephone || '', '']
        );
        console.log(' Citoyen créé');
      }

    } else {
      if (newRole === 'AgentMunicipal') {
        const [existing] = await db.execute(
          'SELECT idUtilisateur FROM AgentMunicipal WHERE idUtilisateur = ?', [id]
        );
        if (existing.length > 0) {
          await db.execute(
            'UPDATE AgentMunicipal SET service = ?, zoneGeographique = ? WHERE idUtilisateur = ?',
            [service || '', zoneGeographique || '', id]
          );
        } else {
          await db.execute(
            'INSERT INTO AgentMunicipal (idUtilisateur, service, zoneGeographique) VALUES (?, ?, ?)',
            [id, service || '', zoneGeographique || '']
          );
        }
      } else if (newRole === 'Administrateur') {
        const [existing] = await db.execute(
          'SELECT idUtilisateur FROM Administrateur WHERE idUtilisateur = ?', [id]
        );
        if (existing.length > 0) {
          await db.execute(
            'UPDATE Administrateur SET service = ? WHERE idUtilisateur = ?',
            [service || '', id]
          );
        } else {
          await db.execute(
            'INSERT INTO Administrateur (idUtilisateur, service) VALUES (?, ?)',
            [id, service || '']
          );
        }
      }
    }

    res.json({ success: true, message: 'Utilisateur mis à jour avec succès' });

  } catch (error) {
    console.error(' Erreur updateUser:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createAgent = async (req, res) => {
  try {
    const { nom, prenom, email, motDePasse, service, zoneGeographique } = req.body;

    const [existing] = await db.execute(
      'SELECT idUtilisateur FROM Utilisateur WHERE email = ?', [email]
    );
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Cet email est déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(motDePasse, 10);
    const [result] = await db.execute(
      'INSERT INTO Utilisateur (nom, prenom, email, motDePasse, typeUtilisateur) VALUES (?, ?, ?, ?, ?)',
      [nom, prenom, email, hashedPassword, 'AgentMunicipal']
    );
    const userId = result.insertId;

    await db.execute(
      'INSERT INTO AgentMunicipal (idUtilisateur, service, zoneGeographique) VALUES (?, ?, ?)',
      [userId, service || '', zoneGeographique || '']
    );

    res.status(201).json({ success: true, message: 'Agent créé avec succès', id: userId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createAdmin = async (req, res) => {
  try {
    const { nom, prenom, email, motDePasse, service } = req.body;

    const [existing] = await db.execute(
      'SELECT idUtilisateur FROM Utilisateur WHERE email = ?', [email]
    );
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Cet email est déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(motDePasse, 10);
    const [result] = await db.execute(
      'INSERT INTO Utilisateur (nom, prenom, email, motDePasse, typeUtilisateur) VALUES (?, ?, ?, ?, ?)',
      [nom, prenom, email, hashedPassword, 'Administrateur']
    );
    const userId = result.insertId;

    await db.execute(
      'INSERT INTO Administrateur (idUtilisateur, service) VALUES (?, ?)',
      [userId, service || '']
    );

    res.status(201).json({ success: true, message: 'Administrateur créé avec succès', id: userId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const [categories] = await db.execute('SELECT * FROM Categorie ORDER BY idCategorie');
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { nomCategorie, description, prioriteDefaut } = req.body;

    // ✅ Check if name already exists
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

    const [result] = await db.execute(
      'INSERT INTO Categorie (nomCategorie, description, prioriteDefaut) VALUES (?, ?, ?)',
      [nomCategorie, description, prioriteDefaut]
    );
    res.status(201).json({ success: true, message: 'Catégorie créée', id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { nomCategorie, description, prioriteDefaut } = req.body;

    // ✅ Check if name already exists for another category
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

    await db.execute(
      'UPDATE Categorie SET nomCategorie = ?, description = ?, prioriteDefaut = ? WHERE idCategorie = ?',
      [nomCategorie, description, prioriteDefaut, id]
    );
    res.json({ success: true, message: 'Catégorie modifiée' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('DELETE FROM Categorie WHERE idCategorie = ?', [id]);
    res.json({ success: true, message: 'Catégorie supprimée' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStatistiques = async (req, res) => {
  try {
    const [stats] = await db.execute(`
      SELECT 
        COUNT(*) as totalReclamations,
        SUM(CASE WHEN statut = 'En attente' THEN 1 ELSE 0 END) as enAttente,
        SUM(CASE WHEN statut = 'En cours'   THEN 1 ELSE 0 END) as enCours,
        SUM(CASE WHEN statut = 'Traitée'    THEN 1 ELSE 0 END) as traitees,
        SUM(CASE WHEN statut = 'Refusée'    THEN 1 ELSE 0 END) as refusees,
        ROUND(AVG(priorite), 2) as prioriteMoyenne
      FROM Reclamation
    `);
    res.json({ success: true, data: stats[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStatsByCategory = async (req, res) => {
  try {
    const [stats] = await db.execute(`
      SELECT c.nomCategorie, COUNT(r.idReclamation) as nombre
      FROM Categorie c
      LEFT JOIN Reclamation r ON c.idCategorie = r.idCategorie
      GROUP BY c.idCategorie
      ORDER BY nombre DESC
    `);
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStatsByStatus = async (req, res) => {
  try {
    const [stats] = await db.execute(
      'SELECT statut, COUNT(*) as nombre FROM Reclamation GROUP BY statut'
    );
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAgentPerformance = async (req, res) => {
  try {
    const [agents] = await db.execute(`
      SELECT u.nom, u.prenom, a.service, a.zoneGeographique,
             COUNT(r.idReclamation) as total,
             SUM(CASE WHEN r.statut = 'Traitée' THEN 1 ELSE 0 END) as traitees
      FROM AgentMunicipal a
      JOIN Utilisateur u ON a.idUtilisateur = u.idUtilisateur
      LEFT JOIN Reclamation r ON a.idUtilisateur = r.idAgent
      GROUP BY a.idUtilisateur
      ORDER BY traitees DESC
    `);
    res.json({ success: true, data: agents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllAgents = async (req, res) => {
  try {
    const [agents] = await db.execute(`
      SELECT u.idUtilisateur, u.nom, u.prenom, u.email,
             a.service, a.zoneGeographique
      FROM AgentMunicipal a
      JOIN Utilisateur u ON a.idUtilisateur = u.idUtilisateur
      ORDER BY u.nom, u.prenom
    `);
    res.json({ success: true, data: agents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const { service, zoneGeographique } = req.body;
    await db.execute(
      'UPDATE AgentMunicipal SET service = ?, zoneGeographique = ? WHERE idUtilisateur = ?',
      [service || '', zoneGeographique || '', id]
    );
    res.json({ success: true, message: 'Agent modifié' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteAgent = async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('DELETE FROM AgentMunicipal WHERE idUtilisateur = ?', [id]);
    await db.execute('DELETE FROM Utilisateur WHERE idUtilisateur = ?', [id]);
    res.json({ success: true, message: 'Agent supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllAdmins = async (req, res) => {
  try {
    const [admins] = await db.execute(`
      SELECT u.idUtilisateur, u.nom, u.prenom, u.email, a.service
      FROM Administrateur a
      JOIN Utilisateur u ON a.idUtilisateur = u.idUtilisateur
    `);
    res.json({ success: true, data: admins });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, prenom, service } = req.body;
    await db.execute(
      'UPDATE Utilisateur SET nom = ?, prenom = ? WHERE idUtilisateur = ?',
      [nom, prenom, id]
    );
    await db.execute(
      'UPDATE Administrateur SET service = ? WHERE idUtilisateur = ?',
      [service, id]
    );
    res.json({ success: true, message: 'Administrateur mis à jour' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('DELETE FROM Administrateur WHERE idUtilisateur = ?', [id]);
    await db.execute('DELETE FROM Utilisateur WHERE idUtilisateur = ?', [id]);
    res.json({ success: true, message: 'Administrateur supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createUser = async (req, res) => {
  res.status(200).json({ success: true, message: 'Fonction createUser à implémenter' });
};