const db = require('../config/database');

class Localisation {
    static async create(localisationData) {
        try {
            const [result] = await db.execute(
                'INSERT INTO localisation (latitude, longitude, adresse, ville, quartier) VALUES (?, ?, ?, ?, ?)',
                [
                    localisationData.latitude || null,
                    localisationData.longitude || null,
                    localisationData.adresse || '',
                    localisationData.ville || '',
                    localisationData.quartier || ''
                ]
            );
            return result.insertId;
        } catch (error) {
            console.error('Erreur DB dans Localisation.create:', error.message);
            throw error;
        }
    }

    static async findById(id) {
        try {
            const [rows] = await db.execute(
                'SELECT * FROM localisation WHERE idLocalisation = ?',
                [id]
            );
            return rows[0];
        } catch (error) {
            console.error('Erreur DB dans Localisation.findById:', error.message);
            throw error;
        }
    }

    static async findByQuartier(quartier) {
        try {
            const [rows] = await db.execute(
                'SELECT * FROM localisation WHERE quartier = ?',
                [quartier]
            );
            return rows;
        } catch (error) {
            console.error('Erreur DB dans Localisation.findByQuartier:', error.message);
            throw error;
        }
    }

    static async getAll() {
        try {
            const [rows] = await db.execute('SELECT * FROM localisation');
            return rows;
        } catch (error) {
            console.error('Erreur DB dans Localisation.getAll:', error.message);
            throw error;
        }
    }

    static async update(id, localisationData) {
        try {
            const [result] = await db.execute(
                'UPDATE localisation SET latitude = ?, longitude = ?, adresse = ?, ville = ?, quartier = ? WHERE idLocalisation = ?',
                [
                    localisationData.latitude || null,
                    localisationData.longitude || null,
                    localisationData.adresse || '',
                    localisationData.ville || '',
                    localisationData.quartier || '',
                    id
                ]
            );
            return result.affectedRows;
        } catch (error) {
            console.error('Erreur DB dans Localisation.update:', error.message);
            throw error;
        }
    }
}

module.exports = Localisation;