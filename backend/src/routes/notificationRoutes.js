const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { verifyToken } = require('../middlewares/auth');

router.get('/',                          verifyToken, notificationController.getMyNotifications);
router.get('/unread-count',              verifyToken, notificationController.getUnreadCount);
router.get('/reclamation/:idReclamation',verifyToken, notificationController.getReclamationNotifications);
router.put('/read-all',                  verifyToken, notificationController.markAllAsRead);
router.put('/:id/read',                  verifyToken, notificationController.markNotificationAsRead);

module.exports = router;