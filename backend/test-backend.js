const express = require('express');
const cors = require('cors');
const app = express();

// ============================================
// CONFIGURATION DE BASE
// ============================================
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// MIDDLEWARE SIMULÉ (pour les tests)
// ============================================
const verifyToken = (req, res, next) => {
  // Simuler un utilisateur connecté
  req.user = { 
    id: 1, 
    nom: 'Test', 
    prenom: 'User', 
    email: 'test@test.com',
    typeUtilisateur: 'Citoyen' 
  };
  console.log('✅ Token vérifié - Utilisateur:', req.user.email);
  next();
};

// ============================================
// ROUTE DE TEST PRINCIPALE
// ============================================
app.get('/', (req, res) => {
  res.json({ 
    message: '✅ BACKEND DE TEST FONCTIONNE',
    routes: [
      'GET /api',
      'GET /api/categories',
      'GET /api/citoyen/reclamations',
      'POST /api/auth/login',
      'POST /api/auth/register'
    ]
  });
});

// ============================================
// ROUTE API (vérification)
// ============================================
app.get('/api', (req, res) => {
  res.json({ 
    success: true, 
    message: '✅ API accessible',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// ROUTE CATEGORIES (SOLUTION 4)
// ============================================
app.get('/api/categories', (req, res) => {
  console.log('📋 Requête reçue: GET /api/categories');
  
  const categories = [
    { idCategorie: 1, nomCategorie: "Voirie et infrastructures", description: "Routes, trottoirs, nids-de-poule", prioriteDefaut: 3 },
    { idCategorie: 2, nomCategorie: "Éclairage public", description: "Lampadaires, éclairage", prioriteDefaut: 2 },
    { idCategorie: 3, nomCategorie: "Eau et assainissement", description: "Fuite, coupure d'eau", prioriteDefaut: 4 },
    { idCategorie: 4, nomCategorie: "Propreté et déchets", description: "Ordures, dépotoirs", prioriteDefaut: 3 },
    { idCategorie: 5, nomCategorie: "Transport public", description: "Bus, métro", prioriteDefaut: 2 },
    { idCategorie: 6, nomCategorie: "Environnement", description: "Pollution, nuisances", prioriteDefaut: 2 },
    { idCategorie: 7, nomCategorie: "Espaces publics", description: "Parcs, jardins", prioriteDefaut: 2 },
    { idCategorie: 8, nomCategorie: "Sécurité et risques", description: "Dangers, câbles", prioriteDefaut: 5 },
    { idCategorie: 9, nomCategorie: "Services municipaux", description: "Administration", prioriteDefaut: 1 },
    { idCategorie: 10, nomCategorie: "Autres", description: "Divers", prioriteDefaut: 1 }
  ];
  
  res.json({
    success: true,
    data: categories
  });
});

// ============================================
// ROUTE CITOYEN/RECLAMATIONS (SOLUTION 4)
// ============================================
app.get('/api/citoyen/reclamations', verifyToken, (req, res) => {
  console.log('📋 Requête reçue: GET /api/citoyen/reclamations pour utilisateur', req.user.id);
  
  const reclamations = [
    {
      idReclamation: 1,
      titre: "Nid de poule dangereux",
      description: "Grand trou au milieu de la rue",
      statut: "En attente",
      priorite: 3,
      dateCreation: new Date().toISOString(),
      nomCategorie: "Voirie et infrastructures",
      quartier: "Centre Ville",
      ville: "Tunis"
    },
    {
      idReclamation: 2,
      titre: "Lampadaire cassé",
      description: "Panne d'éclairage depuis 1 semaine",
      statut: "En cours",
      priorite: 2,
      dateCreation: new Date(Date.now() - 86400000).toISOString(),
      nomCategorie: "Éclairage public",
      quartier: "Menzah",
      ville: "Tunis"
    },
    {
      idReclamation: 3,
      titre: "Déchets non collectés",
      description: "Poubelles débordantes",
      statut: "Traitée",
      priorite: 3,
      dateCreation: new Date(Date.now() - 172800000).toISOString(),
      nomCategorie: "Propreté et déchets",
      quartier: "Lac",
      ville: "Tunis"
    }
  ];
  
  res.json({
    success: true,
    data: reclamations
  });
});

// ============================================
// ROUTE LOGIN (pour tester la connexion)
// ============================================
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  console.log('🔑 Tentative login:', email, password);
  
  // Simuler une connexion réussie
  res.json({
    success: true,
    message: 'Connexion réussie',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibm9tIjoiVGVzdCIsInByZW5vbSI6IlVzZXIiLCJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJ0eXBlVXRpbGlzYXRldXIiOiJDaXRveWVuIiwiaWF0IjoxNTE2MjM5MDIyfQ',
    user: {
      id: 1,
      nom: 'Test',
      prenom: 'User',
      email: email || 'test@test.com',
      typeUtilisateur: 'Citoyen'
    }
  });
});

// ============================================
// ROUTE REGISTER (pour tester l'inscription)
// ============================================
app.post('/api/auth/register', (req, res) => {
  console.log('📝 Tentative inscription:', req.body);
  
  res.status(201).json({
    success: true,
    message: 'Utilisateur créé avec succès',
    idUtilisateur: 123
  });
});

// ============================================
// ROUTE DE DÉCONNEXION
// ============================================
app.post('/api/auth/logout', verifyToken, (req, res) => {
  console.log('🚪 Déconnexion:', req.user.email);
  res.json({
    success: true,
    message: 'Déconnexion réussie'
  });
});

// ============================================
// ROUTE PROFIL
// ============================================
app.get('/api/auth/profile', verifyToken, (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.user.id,
      nom: req.user.nom,
      prenom: req.user.prenom,
      email: req.user.email,
      typeUtilisateur: req.user.typeUtilisateur
    }
  });
});

// ============================================
// ROUTE NOTIFICATIONS
// ============================================
app.get('/api/citoyen/notifications', verifyToken, (req, res) => {
  const notifications = [
    {
      idNotification: 1,
      message: "Votre réclamation #1 a été traitée",
      dateEnvoi: new Date().toISOString(),
      type: "statut",
      lu: false
    },
    {
      idNotification: 2,
      message: "Nouveau commentaire sur votre réclamation",
      dateEnvoi: new Date(Date.now() - 3600000).toISOString(),
      type: "commentaire",
      lu: true
    }
  ];
  
  res.json({
    success: true,
    data: notifications
  });
});

// ============================================
// ROUTE POUR MARQUER NOTIFICATION COMME LUE
// ============================================
app.put('/api/notifications/:id/read', verifyToken, (req, res) => {
  console.log('✅ Notification marquée comme lue:', req.params.id);
  res.json({
    success: true,
    message: 'Notification marquée comme lue'
  });
});

// ============================================
// ROUTE POUR MARQUER TOUTES LES NOTIFICATIONS COMME LUES
// ============================================
app.post('/api/citoyen/notifications/mark-read', verifyToken, (req, res) => {
  console.log('✅ Toutes les notifications marquées comme lues');
  res.json({
    success: true,
    message: 'Toutes les notifications marquées comme lues'
  });
});

// ============================================
// ROUTE POUR CRÉER UNE RÉCLAMATION (avec FormData)
// ============================================
app.post('/api/reclamations', verifyToken, (req, res) => {
  console.log('📝 Création réclamation:', req.body);
  console.log('📸 Fichiers reçus:', req.files ? req.files.length : 'aucun');
  
  res.status(201).json({
    success: true,
    message: 'Réclamation créée avec succès',
    idReclamation: Math.floor(Math.random() * 1000)
  });
});

// ============================================
// ROUTE POUR RÉCUPÉRER UNE RÉCLAMATION PAR ID
// ============================================
app.get('/api/reclamations/:id', verifyToken, (req, res) => {
  const id = req.params.id;
  console.log('🔍 Détail réclamation:', id);
  
  res.json({
    success: true,
    data: {
      reclamation: {
        idReclamation: parseInt(id),
        titre: "Détail de la réclamation",
        description: "Description détaillée du problème",
        statut: "En attente",
        priorite: 3,
        dateCreation: new Date().toISOString(),
        nomCategorie: "Voirie et infrastructures",
        adresse: "Avenue Habib Bourguiba",
        quartier: "Centre Ville",
        ville: "Tunis",
        latitude: 36.8065,
        longitude: 10.1815
      },
      historique: [
        {
          action: "Réclamation créée",
          commentaire: "Création initiale",
          utilisateur: "User Test",
          dateAction: new Date().toISOString()
        }
      ]
    }
  });
});

// ============================================
// GESTION DES ERREURS 404
// ============================================
app.use('*', (req, res) => {
  console.log('❌ Route non trouvée:', req.method, req.originalUrl);
  res.status(404).json({
    success: false,
    message: 'Route non trouvée',
    path: req.originalUrl
  });
});

// ============================================
// DÉMARRAGE DU SERVEUR
// ============================================
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log('\n' + '='.repeat(50));
  console.log('🚀 SERVEUR DE TEST COMPLET DÉMARRÉ');
  console.log('='.repeat(50));
  console.log(`📡 http://localhost:${PORT}`);
  console.log(`📡 http://localhost:${PORT}/api`);
  console.log(`📡 http://localhost:${PORT}/api/categories`);
  console.log(`📡 http://localhost:${PORT}/api/citoyen/reclamations`);
  console.log(`📡 http://localhost:${PORT}/api/auth/login`);
  console.log('='.repeat(50));
  console.log('✅ Routes disponibles pour votre application mobile');
  console.log('✅ Toutes les routes retournent des données de test');
  console.log('='.repeat(50) + '\n');
});