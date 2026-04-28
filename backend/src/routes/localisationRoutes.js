const express = require('express');
const router = express.Router();
const localisationController = require('../controllers/localisationController');
const { verifyToken } = require('../middlewares/auth');

router.post('/', verifyToken, localisationController.createLocalisation);
router.get('/', localisationController.getAllLocalisations);
router.get('/:id', localisationController.getLocalisationById);
router.get('/quartier/:quartier', localisationController.getLocalisationByQuartier);

module.exports = router;