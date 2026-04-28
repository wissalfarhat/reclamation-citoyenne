const db = require('../config/database');

class StatsService {
    
    // ============================================
    // 1. METTRE À JOUR TOUTES LES STATISTIQUES
    // ============================================
    static async mettreAJourToutesStats() {
        try {
            
            await this.mettreAJourStatsGlobales();
            await this.mettreAJourStatsParCategorie();
            await this.mettreAJourStatsParStatut();
            await this.mettreAJourStatsGeographiques();
            await this.mettreAJourPerformanceAgents();
            await this.mettreAJourDelais();
            
            console.log(' Toutes les statistiques mises à jour');
            return true;
            
        } catch (error) {
            console.error(' Erreur mise à jour stats:', error);
            return false;
        }
    }

    // ============================================
    // 2. STATISTIQUES GLOBALES
    // ============================================
    static async mettreAJourStatsGlobales() {
        try {
            const [stats] = await db.execute(`
                SELECT 
                    COUNT(*) as totalReclamations,
                    SUM(CASE WHEN statut = 'En attente' THEN 1 ELSE 0 END) as 'En attente',
                    SUM(CASE WHEN statut = 'En cours' THEN 1 ELSE 0 END) as 'En cours',
                    SUM(CASE WHEN statut = 'Traitée' THEN 1 ELSE 0 END) as 'Traitée',
                    SUM(CASE WHEN statut = 'Refusée' THEN 1 ELSE 0 END) as 'Refusée',
                    COUNT(DISTINCT idCitoyen) as citoyensActifs,
                    COUNT(DISTINCT idAgent) as agentsActifs,
                    ROUND(AVG(priorite), 2) as prioriteMoyenne,
                    ROUND(AVG(CASE WHEN statut = 'Traitée' 
                        THEN TIMESTAMPDIFF(HOUR, dateCreation, dateModification) 
                        ELSE NULL END), 2) as delaiMoyenHeures
                FROM Reclamation
            `);

            await this.enregistrerStatistique('global', stats[0]);
            console.log('✅ Stats globales enregistrées');
            return stats[0];
            
        } catch (error) {
            console.error('❌ Erreur stats globales:', error);
            throw error;
        }
    }

    // ============================================
    // 3. STATISTIQUES PAR CATÉGORIE
    // ============================================
    static async mettreAJourStatsParCategorie() {
        try {
            const [stats] = await db.execute(`
                SELECT 
                    c.idCategorie,
                    c.nomCategorie,
                    COUNT(r.idReclamation) as total,
                    SUM(CASE WHEN r.statut = 'En attente' THEN 1 ELSE 0 END) as 'En attente',
                    SUM(CASE WHEN r.statut = 'En cours' THEN 1 ELSE 0 END) as 'En cours',
                    SUM(CASE WHEN r.statut = 'Traitée' THEN 1 ELSE 0 END) as 'Traitée',
                    SUM(CASE WHEN r.statut = 'Refusée' THEN 1 ELSE 0 END) as 'Refusée',
                    ROUND(AVG(r.priorite), 2) as prioriteMoyenne,
                    ROUND((SUM(CASE WHEN r.statut = 'Traitée' THEN 1 ELSE 0 END) * 100.0 / 
                        NULLIF(COUNT(r.idReclamation), 0)), 2) as tauxResolution
                FROM Categorie c
                LEFT JOIN Reclamation r ON c.idCategorie = r.idCategorie
                GROUP BY c.idCategorie, c.nomCategorie
                ORDER BY total DESC
            `);

            await this.enregistrerStatistique('parCategorie', stats);
            console.log('✅ Stats par catégorie enregistrées');
            return stats;
            
        } catch (error) {
            console.error('❌ Erreur stats par catégorie:', error);
            throw error;
        }
    }

    // ============================================
    // 4. STATISTIQUES PAR STATUT
    // ============================================
    static async mettreAJourStatsParStatut() {
        try {
            const [stats] = await db.execute(`
                SELECT 
                    statut,
                    COUNT(*) as nombre,
                    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM Reclamation), 2) as pourcentage,
                    SUM(CASE WHEN priorite >= 5 THEN 1 ELSE 0 END) as hautePriorite,
                    ROUND(AVG(priorite), 2) as prioriteMoyenne
                FROM Reclamation
                GROUP BY statut
            `);

            await this.enregistrerStatistique('parStatut', stats);
            console.log('Stats par statut enregistrées');
            return stats;
            
        } catch (error) {
            console.error(' Erreur stats par statut:', error);
            throw error;
        }
    }

    // ============================================
    // 5. STATISTIQUES GÉOGRAPHIQUES
    // ============================================
    static async mettreAJourStatsGeographiques() {
        try {
            // Top quartiers
            const [quartiers] = await db.execute(`
                SELECT 
                    l.ville,
                    l.quartier,
                    COUNT(r.idReclamation) as nombre,
                    ROUND(AVG(r.priorite), 2) as prioriteMoyenne,
                    GROUP_CONCAT(DISTINCT c.nomCategorie) as categories
                FROM Localisation l
                JOIN Reclamation r ON l.idLocalisation = r.idLocalisation
                JOIN Categorie c ON r.idCategorie = c.idCategorie
                WHERE l.quartier IS NOT NULL
                GROUP BY l.ville, l.quartier
                ORDER BY nombre DESC
                LIMIT 10
            `);

            // Top villes
            const [villes] = await db.execute(`
                SELECT 
                    l.ville,
                    COUNT(r.idReclamation) as nombre,
                    COUNT(DISTINCT l.quartier) as quartiersConcernes
                FROM Localisation l
                JOIN Reclamation r ON l.idLocalisation = r.idLocalisation
                GROUP BY l.ville
                ORDER BY nombre DESC
            `);

            await this.enregistrerStatistique('geographique', { villes, quartiers });
            console.log(' Stats géographiques enregistrées');
            return { villes, quartiers };
            
        } catch (error) {
            console.error(' Erreur stats géographiques:', error);
            throw error;
        }
    }

    // ============================================
    // 6. PERFORMANCE DES AGENTS
    // ============================================
    static async mettreAJourPerformanceAgents() {
        try {
            const [agents] = await db.execute(`
                SELECT 
                    u.idUtilisateur,
                    u.nom,
                    u.prenom,
                    a.service,
                    a.zoneGeographique,
                    COUNT(r.idReclamation) as totalAssignees,
                    SUM(CASE WHEN r.statut = 'Traitée' THEN 1 ELSE 0 END) as traitees,
                    SUM(CASE WHEN r.statut = 'En cours' THEN 1 ELSE 0 END) as enCours,
                    SUM(CASE WHEN r.statut = 'Refusée' THEN 1 ELSE 0 END) as refusees,
                    ROUND(AVG(CASE WHEN r.statut = 'Traitée' 
                        THEN TIMESTAMPDIFF(HOUR, r.dateCreation, r.dateModification) 
                        ELSE NULL END), 2) as delaiMoyen,
                    ROUND((SUM(CASE WHEN r.statut = 'Traitée' THEN 1 ELSE 0 END) * 100.0 / 
                        NULLIF(COUNT(r.idReclamation), 0)), 2) as tauxResolution
                FROM AgentMunicipal a
                JOIN Utilisateur u ON a.idUtilisateur = u.idUtilisateur
                LEFT JOIN Reclamation r ON a.idUtilisateur = r.idAgent
                GROUP BY u.idUtilisateur, u.nom, u.prenom, a.service, a.zoneGeographique
                HAVING totalAssignees > 0
                ORDER BY traitees DESC
            `);

            await this.enregistrerStatistique('performanceAgents', agents);
            console.log('Performance agents enregistrée');
            return agents;
            
        } catch (error) {
            console.error(' Erreur performance agents:', error);
            throw error;
        }
    }

    // ============================================
    // 7. DÉLAIS DE TRAITEMENT
    // ============================================
    static async mettreAJourDelais() {
        try {
            const [delais] = await db.execute(`
                SELECT 
                    ROUND(AVG(TIMESTAMPDIFF(HOUR, dateCreation, dateModification)), 2) as delaiGlobal,
                    MIN(TIMESTAMPDIFF(HOUR, dateCreation, dateModification)) as delaiMin,
                    MAX(TIMESTAMPDIFF(HOUR, dateCreation, dateModification)) as delaiMax,
                    COUNT(*) as totalTraitees,
                    SUM(CASE WHEN TIMESTAMPDIFF(HOUR, dateCreation, dateModification) <= 24 THEN 1 ELSE 0 END) as moins24h,
                    SUM(CASE WHEN TIMESTAMPDIFF(HOUR, dateCreation, dateModification) BETWEEN 24 AND 48 THEN 1 ELSE 0 END) as entre24_48h,
                    SUM(CASE WHEN TIMESTAMPDIFF(HOUR, dateCreation, dateModification) > 48 THEN 1 ELSE 0 END) as plus48h
                FROM Reclamation
                WHERE statut = 'Traitée'
            `);

            await this.enregistrerStatistique('delais', delais[0]);
            console.log(' Délais enregistrés');
            return delais[0];
            
        } catch (error) {
            console.error(' Erreur délais:', error);
            throw error;
        }
    }

    // ============================================
    // 8. ENREGISTRER DANS LA TABLE STATISTIQUE
    // ============================================
    static async enregistrerStatistique(type, donnees) {
        try {
            const maintenant = new Date();
            const dateDebut = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1).toISOString().split('T')[0];
            const dateFin = new Date(maintenant.getFullYear(), maintenant.getMonth() + 1, 0).toISOString().split('T')[0];

            const [result] = await db.execute(
                `INSERT INTO Statistique 
                (dateDebut, dateFin, typeStatistique, donnees) 
                VALUES (?, ?, ?, ?)`,
                [dateDebut, dateFin, type, JSON.stringify(donnees)]
            );

            console.log(`✅ Statistique "${type}" enregistrée avec ID: ${result.insertId}`);
            return result.insertId;
            
        } catch (error) {
            console.error(` Erreur enregistrement statistique ${type}:`, error);
            throw error;
        }
    }

    // ============================================
    // 9. DÉCLENCHÉ APRÈS CRÉATION DE RÉCLAMATION
    // ============================================
    static async onReclamationCreee(reclamation) {
        console.log(` Mise à jour stats - Nouvelle réclamation ${reclamation.idReclamation}`);
        await this.mettreAJourToutesStats();
    }

    // ============================================
    // 10. DÉCLENCHÉ APRÈS CHANGEMENT DE STATUT
    // ============================================
    static async onStatutChange(reclamationId, ancienStatut, nouveauStatut, agentId) {
        console.log(`Mise à jour stats - Changement statut ${reclamationId}: ${ancienStatut} → ${nouveauStatut}`);
        await this.mettreAJourToutesStats();
    }
}

module.exports = StatsService;