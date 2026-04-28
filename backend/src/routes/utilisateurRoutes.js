const express = require('express');
const router = express.Router();
const utilisateurController = require('../controllers/utilisateurController');
const { verifyToken } = require('../middlewares/auth');

router.post('/register', utilisateurController.register);
router.post('/login', utilisateurController.login);
router.post('/logout', verifyToken, utilisateurController.logout); // Nouvelle route
router.get('/profile', verifyToken, utilisateurController.getProfile);
router.put('/profile', verifyToken, utilisateurController.updateProfile);

module.exports = router;