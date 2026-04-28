const db = require('../config/database');

class Rapport {
    static async create(rapportData) {
        const [result] = await db.execute(
            `INSERT INTO Rapport 
            (titre, dateGeneration, contenu, idStatistique, format, createdBy, periodeDebut, periodeFin) 
            VALUES (?, NOW(), ?, ?, ?, ?, ?, ?)`,
            [
                rapportData.titre,
                rapportData.contenu,
                rapportData.idStatistique || null,
                rapportData.format || 'PDF',
                rapportData.createdBy,
                rapportData.periodeDebut || null,
                rapportData.periodeFin || null
            ]
        );
        return result.insertId;
    }

    static async findById(id) {
        const [rows] = await db.execute(
            `SELECT r.*, u.nom as createurNom, u.prenom as createurPrenom 
             FROM Rapport r
             LEFT JOIN Utilisateur u ON r.createdBy = u.idUtilisateur
             WHERE r.idRapport = ?`,
            [id]
        );
        return rows[0];
    }

    static async getAll(filters = {}) {
        let query = `
            SELECT r.*, u.nom as createurNom, u.prenom as createurPrenom 
            FROM Rapport r
            LEFT JOIN Utilisateur u ON r.createdBy = u.idUtilisateur
            WHERE 1=1
        `;
        const params = [];

        if (filters.format) {
            query += ' AND r.format = ?';
            params.push(filters.format);
        }

        if (filters.createdBy) {
            query += ' AND r.createdBy = ?';
            params.push(filters.createdBy);
        }

        if (filters.dateDebut) {
            query += ' AND r.dateGeneration >= ?';
            params.push(filters.dateDebut);
        }

        if (filters.dateFin) {
            query += ' AND r.dateGeneration <= ?';
            params.push(filters.dateFin);
        }

        query += ' ORDER BY r.dateGeneration DESC';

        const [rows] = await db.execute(query, params);
        return rows;
    }

    static async delete(id) {
        const [result] = await db.execute('DELETE FROM Rapport WHERE idRapport = ?', [id]);
        return result.affectedRows;
    }

    static async getRecent(limit = 10) {
        const [rows] = await db.execute(
            `SELECT r.*, u.nom as createurNom, u.prenom as createurPrenom 
             FROM Rapport r
             LEFT JOIN Utilisateur u ON r.createdBy = u.idUtilisateur
             ORDER BY r.dateGeneration DESC 
             LIMIT ?`,
            [limit]
        );
        return rows;
    }
}

module.exports = Rapport;