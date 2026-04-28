const db = require('../config/database');

class AgentMunicipal {
    static async create(idUtilisateur, agentData) {
        const [result] = await db.execute(
            'INSERT INTO AgentMunicipal (idUtilisateur, service, zoneGeographique) VALUES (?, ?, ?)',
            [idUtilisateur, agentData.service, agentData.zoneGeographique]
        );
        return result.insertId;
    }

    static async findById(idUtilisateur) {
        const [rows] = await db.execute(
            'SELECT u.*, a.service, a.zoneGeographique FROM Utilisateur u JOIN AgentMunicipal a ON u.idUtilisateur = a.idUtilisateur WHERE u.idUtilisateur = ?',
            [idUtilisateur]
        );
        return rows[0];
    }

    static async update(idUtilisateur, agentData) {
        const [result] = await db.execute(
            'UPDATE AgentMunicipal SET service = ?, zoneGeographique = ? WHERE idUtilisateur = ?',
            [agentData.service, agentData.zoneGeographique, idUtilisateur]
        );
        return result.affectedRows;
    }

    static async getReclamationsAssignees(idUtilisateur) {
        const [rows] = await db.execute(
            'SELECT r.*, c.nomCategorie, l.ville, l.quartier FROM Reclamation r LEFT JOIN Categorie c ON r.idCategorie = c.idCategorie LEFT JOIN Localisation l ON r.idLocalisation = l.idLocalisation WHERE r.idAgent = ? ORDER BY r.priorite DESC, r.dateCreation DESC',
            [idUtilisateur]
        );
        return rows;
    }

    static async getAll() {
        const [rows] = await db.execute(
            'SELECT u.*, a.service, a.zoneGeographique FROM Utilisateur u JOIN AgentMunicipal a ON u.idUtilisateur = a.idUtilisateur'
        );
        return rows;
    }
    static async updateReclamationStatus(idReclamation, statut, commentaire) {
        return db.execute(
      'UPDATE Reclamation SET statut = ?, dateModification = NOW() WHERE idReclamation = ?',          
        [statut,  idReclamation]
        );
    }
}

module.exports = AgentMunicipal;