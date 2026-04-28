const db = require('../config/database');

class Utilisateur {
    static async create(utilisateurData) {
        const [result] = await db.execute(
            'INSERT INTO Utilisateur (nom, prenom, email, motDePasse, typeUtilisateur) VALUES (?, ?, ?, ?, ?)',
            [utilisateurData.nom, utilisateurData.prenom, utilisateurData.email, utilisateurData.motDePasse, utilisateurData.typeUtilisateur]
        );
        return result.insertId;
    }

static async findByEmail(email) {
  try {
        const [rows] = await db.execute(
      'SELECT idUtilisateur, nom, prenom, email, motDePasse, typeUtilisateur FROM Utilisateur WHERE email = ?',
      [email]
    );
    
    return rows[0];
  } catch (error) {
    console.error('❌ Erreur findByEmail:', error);
    throw error;
  }
};

    static async findById(id) {
        const [rows] = await db.execute('SELECT * FROM Utilisateur WHERE idUtilisateur = ?', [id]);
        return rows[0];
    }

    static async update(id, utilisateurData) {
        const [result] = await db.execute(
            'UPDATE Utilisateur SET nom = ?, prenom = ?, typeUtilisateur = ? WHERE idUtilisateur = ?',
            [utilisateurData.nom, utilisateurData.prenom, utilisateurData.email, id]
        );
        return result.affectedRows;
    }

    static async delete(id) {
        const [result] = await db.execute('DELETE FROM Utilisateur WHERE idUtilisateur = ?', [id]);
        return result.affectedRows;
    }

    static async getAll() {
        const [rows] = await db.execute('SELECT * FROM Utilisateur');
        return rows;
    }
}

module.exports = Utilisateur;