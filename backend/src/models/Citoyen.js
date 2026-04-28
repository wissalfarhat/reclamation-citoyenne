const db = require('../config/database');

class Citoyen {
    static async create(idUtilisateur, citoyenData) {
        const [result] = await db.execute(
            'INSERT INTO Citoyen (idUtilisateur, adresse, telephone) VALUES (?, ?, ?)',
            [idUtilisateur, citoyenData.adresse, citoyenData.telephone]
        );
        return result.insertId;
    }

    static async findById(idUtilisateur) {
        const [rows] = await db.execute(
            'SELECT u.*, c.adresse, c.telephone FROM Utilisateur u JOIN Citoyen c ON u.idUtilisateur = c.idUtilisateur WHERE u.idUtilisateur = ?',
            [idUtilisateur]
        );
        return rows[0];
    }

    static async update(idUtilisateur, citoyenData) {
        const [result] = await db.execute(
            'UPDATE Citoyen SET adresse = ?, telephone = ? WHERE idUtilisateur = ?',
            [citoyenData.adresse, citoyenData.telephone, idUtilisateur]
        );
        return result.affectedRows;
    }

    static async getReclamations(idUtilisateur) {
        const [rows] = await db.execute(
            'SELECT * FROM Reclamation WHERE idCitoyen = ? ORDER BY dateCreation DESC',
            [idUtilisateur]
        );
        return rows;
    }
}

module.exports = Citoyen;