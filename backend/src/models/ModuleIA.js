const db = require('../config/database');

class ModuleIA {

    // ============================================
    // RÉCUPÉRER LA CONFIGURATION
    // ============================================
    static async getConfig() {
        try {
            console.log('🤖 Récupération configuration IA...');

            const [rows] = await db.execute(
                'SELECT * FROM ModuleIA ORDER BY idModuleIA DESC LIMIT 1'
            );

            if (rows.length === 0) {
                console.log('⚠️ Aucune configuration trouvée, création...');

                const [result] = await db.execute(
                    'INSERT INTO ModuleIA (seuilUrgence, tauxSimilarite, modeleEntraine) VALUES (5, 0.8, FALSE)'
                );

                const [newConfig] = await db.execute(
                    'SELECT * FROM ModuleIA WHERE idModuleIA = ?',
                    [result.insertId]
                );

                return newConfig[0];
            }

            console.log('✅ Configuration trouvée:', rows[0]);
            return rows[0];

        } catch (error) {
            console.error('❌ Erreur getConfig:', error);
            throw error;
        }
    }

    // ============================================
    // PROPOSER UNE PRIORITÉ
    // ============================================
    static async proposerPriorite(description, categorieId) {
        try {
            console.log('🤖 Calcul de priorité...');

            const config = await this.getConfig();
            let priorite = 1;

            const motsUrgence = [
                'urgence', 'urgent', 'dangereux', 'danger', 'grave',
                'accident', 'blessé', 'incendie', 'explosion', 'effondrement',
                'chute', 'électrocuté', 'intoxication'
            ];

            const descriptionLower = description?.toLowerCase() || '';

            motsUrgence.forEach(mot => {
                if (descriptionLower.includes(mot)) {
                    priorite += 2;
                }
            });

            priorite = Math.min(priorite, 10);

            console.log(`✅ Priorité calculée: ${priorite} (seuil: ${config.seuilUrgence})`);
            return priorite;

        } catch (error) {
            console.error('❌ Erreur proposerPriorite:', error);
            return 1;
        }
    }

    // ============================================
    // CLASSIFIER PAR CATÉGORIE
    // ============================================
    static async classifierParCategorie(description) {
        try {
            console.log('🤖 Classification...');

            const descriptionLower = description?.toLowerCase() || '';

            const motsCles = {
                1: ['route', 'rue', 'trottoir', 'nid de poule', 'chaussée', 'voie'],
                2: ['lampadaire', 'éclairage', 'lumière', 'éteint', 'panne', 'poteau'],
                3: ['eau', 'fuite', 'coupure', 'égout', 'canalisation', 'inondation'],
                4: ['déchet', 'poubelle', 'ordures', 'propreté', 'sale', 'dépotoir'],
                5: ['bus', 'transport', 'métro', 'arrêt', 'retard', 'station'],
                6: ['pollution', 'bruit', 'nuisance', 'animal', 'errant', 'odeur'],
                7: ['parc', 'jardin', 'espace vert', 'aire de jeu', 'banc'],
                8: ['sécurité', 'risque', 'dangereux', 'câble', 'trou', 'effondrement'],
                9: ['service', 'municipal', 'administration', 'dossier', 'retard']
            };

            let meilleureCategorie = 10;
            let meilleurScore = 0;

            for (const [catId, mots] of Object.entries(motsCles)) {

                let score = 0;

                mots.forEach(mot => {
                    if (descriptionLower.includes(mot)) {
                        score++;
                    }
                });

                if (score > meilleurScore) {
                    meilleurScore = score;
                    meilleureCategorie = parseInt(catId);
                }
            }

            console.log(`✅ Catégorie: ${meilleureCategorie} (score: ${meilleurScore})`);
            return meilleureCategorie;

        } catch (error) {
            console.error('❌ Erreur classifierParCategorie:', error);
            return 10;
        }
    }

    // ============================================
    // METTRE À JOUR LA CONFIGURATION
    // ============================================
    static async updateConfig(data) {
        try {
            console.log('🤖 Mise à jour configuration:', data);

            const [result] = await db.execute(
                `UPDATE ModuleIA 
                 SET seuilUrgence = ?, tauxSimilarite = ?, modeleEntraine = ? 
                 WHERE idModuleIA = ?`,
                [
                    data.seuilUrgence,
                    data.tauxSimilarite,
                    data.modeleEntraine,
                    data.idModuleIA
                ]
            );

            console.log(`✅ Configuration mise à jour: ${result.affectedRows} ligne(s)`);
            return result.affectedRows > 0;

        } catch (error) {
            console.error('❌ Erreur updateConfig:', error);
            throw error;
        }
    }

    // ============================================
    // DÉTECTER LES RÉCLAMATIONS SIMILAIRES
    // ============================================
    static async detecterSimilarite(description, localisation, limite = 5) {
        try {
            console.log('🤖 Recherche de réclamations similaires...');

            const config = await this.getConfig();
            const descriptionLower = description?.toLowerCase() || '';

            const mots = descriptionLower
                .split(' ')
                .filter(mot => mot && mot.length > 3)
                .map(mot => mot.replace(/[.,!?;:]/g, ''));

            if (mots.length === 0) {
                console.log('⚠️ Pas assez de mots pour la recherche');
                return [];
            }

            let whereClause = '';
            const params = [];

            mots.slice(0, 5).forEach((mot, index) => {

                if (index === 0) {
                    whereClause = 'WHERE (description LIKE ? OR titre LIKE ?';
                } else {
                    whereClause += ' OR description LIKE ? OR titre LIKE ?';
                }

                params.push(`%${mot}%`, `%${mot}%`);
            });

            whereClause += ')';

            if (localisation?.quartier) {
                whereClause += ' AND idLocalisation IN (SELECT idLocalisation FROM Localisation WHERE quartier = ?)';
                params.push(localisation.quartier);
            }

            const [rows] = await db.execute(
                `SELECT 
                    r.idReclamation,
                    r.titre,
                    r.description,
                    r.statut,
                    r.priorite,
                    r.dateCreation,
                    c.nomCategorie
                FROM Reclamation r
                LEFT JOIN Categorie c ON r.idCategorie = c.idCategorie
                ${whereClause}
                ORDER BY r.dateCreation DESC
                LIMIT ${limite}`,
                params
            );

            const resultats = rows.map(row => {

                const texte = (row.titre + ' ' + row.description).toLowerCase();
                let motsTrouves = 0;

                mots.forEach(mot => {
                    if (texte.includes(mot)) {
                        motsTrouves++;
                    }
                });

                const similarite = Math.round((motsTrouves / mots.length) * 100);

                return {
                    idReclamation: row.idReclamation,
                    titre: row.titre,
                    description: row.description.substring(0, 100) + '...',
                    statut: row.statut,
                    priorite: row.priorite,
                    categorie: row.nomCategorie,
                    similarite: similarite,
                    date: row.dateCreation
                };

            }).filter(r => r.similarite > config.tauxSimilarite * 100);

            return resultats;

        } catch (error) {
            console.error('❌ Erreur detecterSimilarite:', error);
            return [];
        }
    }
}

module.exports = ModuleIA;