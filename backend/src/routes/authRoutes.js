const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middlewares/auth');

// Vérifions d'abord que toutes les fonctions existent
console.log('🔍 Fonctions disponibles dans authController:');
console.log('   register:', typeof authController.register);
console.log('   login:', typeof authController.login);
console.log('   logout:', typeof authController.logout);
console.log('   getProfile:', typeof authController.getProfile);
console.log('   updateProfile:', typeof authController.updateProfile);
console.log('   changePassword:', typeof authController.changePassword);
console.log('   forgotPassword:', typeof authController.forgotPassword);
console.log('   resetPassword:', typeof authController.resetPassword);

// Routes publiques
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/register', authController.register);
// Routes protégées
router.get('/profile', verifyToken, authController.getProfile);
router.put('/profile', verifyToken, authController.updateProfile);
router.put('/change-password', verifyToken, authController.changePassword);

module.exports = router;