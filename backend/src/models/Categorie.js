const db = require('../config/database');

class Categorie {
    // ✅ Fixed - checks for duplicate name
    static async create(categorieData) {
        // Check if name already exists
        const [existing] = await db.execute(
            'SELECT idCategorie FROM Categorie WHERE nomCategorie = ?',
            [categorieData.nomCategorie]
        );
        if (existing.length > 0) {
            const error = new Error(`La catégorie "${categorieData.nomCategorie}" existe déjà`);
            error.statusCode = 400;
            throw error;
        }

        const [result] = await db.execute(
            'INSERT INTO Categorie (nomCategorie, description, prioriteDefaut) VALUES (?, ?, ?)',
            [categorieData.nomCategorie, categorieData.description, categorieData.prioriteDefaut]
        );
        return result.insertId;
    }

    static async findById(id) {
        const [rows] = await db.execute('SELECT * FROM Categorie WHERE idCategorie = ?', [id]);
        return rows[0];
    }

    static async getAll() {
        const [rows] = await db.execute('SELECT * FROM Categorie ORDER BY nomCategorie');
        return rows;
    }

    // ✅ Fixed - checks for duplicate name on update
    static async update(id, categorieData) {
        // Check if name already exists for another category
        const [existing] = await db.execute(
            'SELECT idCategorie FROM Categorie WHERE nomCategorie = ? AND idCategorie != ?',
            [categorieData.nomCategorie, id]
        );
        if (existing.length > 0) {
            const error = new Error(`La catégorie "${categorieData.nomCategorie}" existe déjà`);
            error.statusCode = 400;
            throw error;
        }

        const [result] = await db.execute(
            'UPDATE Categorie SET nomCategorie = ?, description = ?, prioriteDefaut = ? WHERE idCategorie = ?',
            [categorieData.nomCategorie, categorieData.description, categorieData.prioriteDefaut, id]
        );
        return result.affectedRows;
    }

    static async delete(id) {
        const [result] = await db.execute('DELETE FROM Categorie WHERE idCategorie = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = Categorie;