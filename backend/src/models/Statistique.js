const db = require('../config/database');

class Statistique {
    static async create(statistiqueData) {
        const [result] = await db.execute(
            'INSERT INTO Statistique (dateDebut, dateFin, typeStatistique, donnees) VALUES (?, ?, ?, ?)',
            [statistiqueData.dateDebut, statistiqueData.dateFin, statistiqueData.typeStatistique, JSON.stringify(statistiqueData.donnees)]
        );
        return result.insertId;
    }

    static async findById(id) {
        const [rows] = await db.execute('SELECT * FROM Statistique WHERE idStatistique = ?', [id]);
        return rows[0];
    }

    static async getByType(typeStatistique, limit = 10) {
        const [rows] = await db.execute(
            'SELECT * FROM Statistique WHERE typeStatistique = ? ORDER BY dateDebut DESC LIMIT ?',
            [typeStatistique, limit]
        );
        return rows;
    }

    static async getRecent(limit = 20) {
        const [rows] = await db.execute(
            'SELECT * FROM Statistique ORDER BY dateDebut DESC LIMIT ?',
            [limit]
        );
        return rows;
    }

    static async generateMonthlyStats() {
        const [rows] = await db.execute(`
            SELECT 
                DATE_FORMAT(dateCreation, '%Y-%m') as mois,
                COUNT(*) as total_reclamations,
                SUM(CASE WHEN statut = 'Traitée' THEN 1 ELSE 0 END) as traitees,
                SUM(CASE WHEN statut = 'En cours' THEN 1 ELSE 0 END) as en_cours,
                AVG(DATEDIFF(COALESCE(dateModification, NOW()), dateCreation)) as delai_moyen
            FROM Reclamation
            WHERE dateCreation >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(dateCreation, '%Y-%m')
            ORDER BY mois DESC
        `);
        return rows;
    }
}

module.exports = Statistique;