const db = require('../config/database');

class Historique {
    static async create(historiqueData) {
        const [result] = await db.execute(
            'INSERT INTO Historique (dateAction, action, commentaire, utilisateur, idReclamation) VALUES (NOW(), ?, ?, ?, ?)',
            [historiqueData.action, historiqueData.commentaire, historiqueData.utilisateur, historiqueData.idReclamation]
        );
        return result.insertId;
    }

    static async findByReclamation(idReclamation) {
        const [rows] = await db.execute(
            'SELECT * FROM Historique WHERE idReclamation = ? ORDER BY dateAction DESC',
            [idReclamation]
        );
        return rows;
    }

    static async getRecentActions(limit = 50) {
        const [rows] = await db.execute(
            'SELECT * FROM Historique ORDER BY dateAction DESC LIMIT ?',
            [limit]
        );
        return rows;
    }
}

module.exports = Historique;