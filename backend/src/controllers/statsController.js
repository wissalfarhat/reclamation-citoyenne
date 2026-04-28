const db = require('../config/database');

// STATISTIQUES EN TEMPS RÉEL
exports.getStatsTempsReel = async (req, res) => {
    try {
        const [global] = await db.execute(`
            SELECT 
                COUNT(*) as totalReclamations,
                SUM(CASE WHEN statut = 'EN_ATTENTE' THEN 1 ELSE 0 END) as enAttente,
                SUM(CASE WHEN statut = 'EN_COURS' THEN 1 ELSE 0 END) as enCours,
                SUM(CASE WHEN statut = 'TRAITEE' THEN 1 ELSE 0 END) as traitees,
                SUM(CASE WHEN statut = 'REFUSEE' THEN 1 ELSE 0 END) as refusees,
                ROUND(AVG(priorite), 2) as prioriteMoyenne,
                COUNT(DISTINCT idCitoyen) as citoyensActifs,
                COUNT(DISTINCT idAgent) as agentsActifs
            FROM Reclamation
        `);
        
        res.json({
            success: true,
            data: {
                tempsReel: global[0],
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// STATISTIQUES QUOTIDIENNES
exports.getStatsQuotidiennes = async (req, res) => {
    try {
        const { date } = req.query;
        const targetDate = date || new Date().toISOString().split('T')[0];
        
        const [stats] = await db.execute(
            'SELECT * FROM StatsQuotidiennes WHERE date = ?',
            [targetDate]
        );
        
        res.json({
            success: true,
            data: stats[0] || { date: targetDate, message: "Aucune donnée pour cette date" }
        });
        
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// STATISTIQUES PAR CATÉGORIE
exports.getStatsParCategorie = async (req, res) => {
    try {
        const [stats] = await db.execute(`
            SELECT 
                c.nomCategorie,
                COALESCE(sc.nouvelles, 0) as nouvelles,
                COALESCE(sc.traitees, 0) as traitees,
                COALESCE(sc.enAttente, 0) as enAttente,
                COALESCE(sc.enCours, 0) as enCours,
                (SELECT COUNT(*) FROM Reclamation r WHERE r.idCategorie = c.idCategorie) as total
            FROM Categorie c
            LEFT JOIN StatsCategories sc ON c.idCategorie = sc.idCategorie AND sc.date = CURDATE()
            ORDER BY total DESC
        `);
        
        res.json({
            success: true,
            data: stats
        });
        
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// PERFORMANCE DES AGENTS
exports.getPerformanceAgents = async (req, res) => {
    try {
        const [stats] = await db.execute(`
            SELECT 
                u.nom,
                u.prenom,
                a.service,
                a.zoneGeographique,
                COALESCE(sa.traitees, 0) as traitees,
                COALESCE(sa.refusees, 0) as refusees,
                COALESCE(sa.total, 0) as total,
                COALESCE(sa.tauxResolution, 0) as tauxResolution
            FROM AgentMunicipal a
            JOIN Utilisateur u ON a.idUtilisateur = u.idUtilisateur
            LEFT JOIN StatsAgents sa ON a.idUtilisateur = sa.idAgent AND sa.date = CURDATE()
            ORDER BY sa.traitees DESC
        `);
        
        res.json({
            success: true,
            data: stats
        });
        
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// STATISTIQUES (Dashboard)
exports.getDashboardStats = async (req, res) => {
    try {
        // Stats en temps réel
        const [tempsReel] = await db.execute(`
            SELECT 
                COUNT(*) as totalReclamations,
                SUM(CASE WHEN statut = 'EN_ATTENTE' THEN 1 ELSE 0 END) as enAttente,
                SUM(CASE WHEN statut = 'EN_COURS' THEN 1 ELSE 0 END) as enCours,
                SUM(CASE WHEN statut = 'Traitée' THEN 1 ELSE 0 END) as traitees,
                SUM(CASE WHEN statut = 'REFUSEE' THEN 1 ELSE 0 END) as refusees
            FROM Reclamation
        `);
        
        // Stats par catégorie
        const [parCategorie] = await db.execute(`
            SELECT c.nomCategorie, COUNT(r.idReclamation) as nombre
            FROM Categorie c
            LEFT JOIN Reclamation r ON c.idCategorie = r.idCategorie
            GROUP BY c.idCategorie
            ORDER BY nombre DESC
        `);
        
        // Performance agents
        const [agents] = await db.execute(`
            SELECT 
                u.nom, u.prenom,
                COUNT(r.idReclamation) as total,
                SUM(CASE WHEN r.statut = 'Traitée' THEN 1 ELSE 0 END) as traitees
            FROM AgentMunicipal a
            JOIN Utilisateur u ON a.idUtilisateur = u.idUtilisateur
            LEFT JOIN Reclamation r ON a.idUtilisateur = r.idAgent
            GROUP BY a.idUtilisateur
            ORDER BY traitees DESC
            LIMIT 5
        `);
        
        // Évolution sur 7 jours
        const [evolution] = await db.execute(`
            SELECT 
                DATE(dateCreation) as jour,
                COUNT(*) as nombre
            FROM Reclamation
            WHERE dateCreation >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            GROUP BY DATE(dateCreation)
            ORDER BY jour
        `);
        
        res.json({
            success: true,
            data: {
                global: tempsReel[0],
                parCategorie,
                topAgents: agents,
                evolution,
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error(' Erreur dashboard:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};