const db = require('../config/database');

class Administrateur {
    static async create(idUtilisateur, adminData) {
        const [result] = await db.execute(
            'INSERT INTO Administrateur (idUtilisateur, service) VALUES (?, ?)',
            [idUtilisateur, adminData.service]
        );
        return result.insertId;
    }

    static async findById(idUtilisateur) {
        const [rows] = await db.execute(
            'SELECT u.*, a.service FROM Utilisateur u JOIN Administrateur a ON u.idUtilisateur = a.idUtilisateur WHERE u.idUtilisateur = ?',
            [idUtilisateur]
        );
        return rows[0];
    }

    static async getDashboardStats() {
        const [stats] = await db.execute(`
            SELECT 
                (SELECT COUNT(*) FROM Reclamation) as totalReclamations,
                (SELECT COUNT(*) FROM Reclamation WHERE statut = 'En attente') as enAttente,
                (SELECT COUNT(*) FROM Reclamation WHERE statut = 'En cours') as enCours,
                (SELECT COUNT(*) FROM Reclamation WHERE statut = 'Traitée') as traitees,
                (SELECT COUNT(*) FROM Reclamation WHERE statut = 'Refusée') as refusees,
                (SELECT COUNT(*) FROM Citoyen) as totalCitoyens,
                (SELECT COUNT(*) FROM AgentMunicipal) as totalAgents
        `);
        return stats[0];
    }
}

module.exports = Administrateur;