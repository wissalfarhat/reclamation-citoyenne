const db = require('../config/database');

class Reclamation {

    // CREATE (Transaction + vérifications)
    static async create(data) {
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            // Vérifier localisation
            const [locCheck] = await connection.execute(
                'SELECT idLocalisation FROM Localisation WHERE idLocalisation = ?',
                [data.idLocalisation]
            );
            if (locCheck.length === 0)
                throw new Error(`Localisation ${data.idLocalisation} non trouvée`);

            // Vérifier catégorie
            const [catCheck] = await connection.execute(
                'SELECT idCategorie FROM Categorie WHERE idCategorie = ?',
                [data.idCategorie]
            );
            if (catCheck.length === 0)
                throw new Error(`Catégorie ${data.idCategorie} non trouvée`);

            // Vérifier citoyen
            const [citoyenCheck] = await connection.execute(
                'SELECT idUtilisateur FROM Citoyen WHERE idUtilisateur = ?',
                [data.idCitoyen]
            );
            if (citoyenCheck.length === 0)
                throw new Error(`Citoyen ${data.idCitoyen} non trouvé`);

            // Convertir photos en JSON
            let photosJson = null;
            if (data.photos) {
                photosJson = typeof data.photos === 'string'
                    ? data.photos
                    : JSON.stringify(data.photos);
            }

            const [result] = await connection.execute(
                `INSERT INTO Reclamation 
                (titre, description, dateCreation, dateModification, statut, priorite, photos, idCitoyen, idAgent, idCategorie, idLocalisation) 
                VALUES (?, ?, NOW(), NOW(), ?, ?, ?, ?, NULL, ?, ?)`,
                [
                    data.titre,
                    data.description,
                    data.statut || 'En attente',
                    data.priorite || 1,
                    photosJson,
                    data.idCitoyen,
                    data.idCategorie,
                    data.idLocalisation
                ]
            );

            await connection.commit();
            return result.insertId;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // GET ALL
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM Reclamation');
        return rows;
    }


    // GET BY ID SIMPLE
    static async getById(id) {
        const [rows] = await db.query(
            'SELECT * FROM Reclamation WHERE idReclamation = ?',
            [id]
        );
        return rows[0];
    }


    // FIND BY ID (avec JOINs)
    static async findById(id) {
        const [rows] = await db.execute(`
            SELECT r.*, 
                   u.nom as citoyenNom, u.prenom as citoyenPrenom,
                   c.nomCategorie,
                   l.adresse, l.ville, l.quartier
            FROM Reclamation r
            JOIN Utilisateur u ON r.idCitoyen = u.idUtilisateur
            JOIN Categorie c ON r.idCategorie = c.idCategorie
            JOIN Localisation l ON r.idLocalisation = l.idLocalisation
            WHERE r.idReclamation = ?
        `, [id]);

        if (rows.length === 0) return null;

        const reclamation = rows[0];

        // Parser photos JSON
        if (reclamation.photos) {
            try {
                reclamation.photos = JSON.parse(reclamation.photos);
            } catch (e) {}
        }

        return reclamation;
    }


    // UPDATE COMPLET
    static async update(id, data) {

        let photosJson = data.photos;
        if (photosJson && typeof photosJson !== 'string') {
            photosJson = JSON.stringify(photosJson);
        }

        const [result] = await db.execute(
            `UPDATE Reclamation 
             SET titre = ?, 
                 description = ?, 
                 dateModification = NOW(), 
                 statut = ?, 
                 priorite = ?, 
                 photos = ?, 
                 idCategorie = ?
             WHERE idReclamation = ?`,
            [
                data.titre,
                data.description,
                data.statut,
                data.priorite,
                photosJson,
                data.idCategorie,
                id
            ]
        );

        return result.affectedRows;
    }

    // UPDATE STATUT (Agent)
    static async updateStatut(id, statut, idAgent) {

        const [result] = await db.execute(
            `UPDATE Reclamation 
             SET statut = ?, 
                 idAgent = ?, 
                 dateModification = NOW()
             WHERE idReclamation = ?`,
            [statut, idAgent, id]
        );

        return result.affectedRows;
    }
    // ============================================
// ASSIGNER À UN AGENT (AVEC VÉRIFICATION)
// ============================================
static async assignToAgent(idReclamation, idAgent) {
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();
        
        // 1. Vérifier que l'agent existe
        const [agent] = await connection.execute(
            'SELECT idUtilisateur FROM AgentMunicipal WHERE idUtilisateur = ?',
            [idAgent]
        );
        
        if (agent.length === 0) {
            throw new Error('Agent non trouvé');
        }
        
        // 2. Vérifier que la réclamation existe
        const [reclamation] = await connection.execute(
            'SELECT idReclamation FROM Reclamation WHERE idReclamation = ?',
            [idReclamation]
        );
        
        if (reclamation.length === 0) {
            throw new Error('Réclamation non trouvée');
        }
        
        // 3. Mettre à jour
        const [result] = await connection.execute(
            'UPDATE Reclamation SET idAgent = ? WHERE idReclamation = ?',
            [idAgent, idReclamation]
        );
        
        if (result.affectedRows === 0) {
            throw new Error('Échec de la mise à jour');
        }
        
        await connection.commit();
        return result.affectedRows;
        
    } catch (error) {
        await connection.rollback();
        throw error;
        
    } finally {
        connection.release();
    }
}

}

module.exports = Reclamation;