const express = require('express');
const router = express.Router();
const administrateurController = require('../controllers/administrateurController');

const { verifyToken, isAdmin } = require('../middlewares/auth');

// Middleware global pour toutes les routes du routeur
router.use(verifyToken, isAdmin);

// ============================================
// TABLEAU DE BORD
// ============================================
router.get('/dashboard-stats', administrateurController.getDashboardStats);

// ============================================
// GESTION DES UTILISATEURS
// ============================================
router.get('/users', administrateurController.getAllUsers);
router.post('/users', administrateurController.createUser);       // Optionnel si admin peut créer
router.put('/users/:id', administrateurController.updateUser);
router.delete('/users/:id', administrateurController.deleteUser);

// ============================================
// GESTION DES CATÉGORIES
// ============================================
router.get('/categories', administrateurController.getAllCategories);
router.post('/categories', administrateurController.createCategory);
router.put('/categories/:id', administrateurController.updateCategory);
router.delete('/categories/:id', administrateurController.deleteCategory);

// ============================================
// STATISTIQUES
// ============================================
router.get('/statistiques', administrateurController.getStatistiques);
router.get('/statistiques/categories', administrateurController.getStatsByCategory);
router.get('/statistiques/statuts', administrateurController.getStatsByStatus);
router.get('/statistiques/agents', administrateurController.getAgentPerformance);

// ============================================
// GESTION DES AGENTS
// ============================================
router.get('/agents', administrateurController.getAllAgents);
router.post('/agents', administrateurController.createAgent);
router.put('/agents/:id', administrateurController.updateAgent);
router.delete('/agents/:id', administrateurController.deleteAgent);

// ============================================
// GESTION DES ADMINISTRATEURS
// ============================================
router.get('/administrateurs', administrateurController.getAllAdmins);
router.post('/administrateurs', administrateurController.createAdmin);
router.put('/administrateurs/:id', administrateurController.updateAdmin);
router.delete('/administrateurs/:id', administrateurController.deleteAdmin);


module.exports = router;