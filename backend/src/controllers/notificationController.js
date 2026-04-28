const Notification = require('../models/Notification');

// ✅ Get all notifications for current user
// ✅ Fix — fetch by userId regardless of role
exports.getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.typeUtilisateur;
    console.log('🔔 Notifications pour user:', userId, userType);

    let notifications;

    if (userType === 'Citoyen') {
      notifications = await Notification.findByCitoyen(userId);
    } else {
      // Agent or Admin — fetch by idUtilisateur
      notifications = await Notification.findByUser(userId);
    }

    res.json({ success: true, data: notifications });
  } catch (error) {
    console.error('❌ Erreur getMyNotifications:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.typeUtilisateur;

    let count;
    if (userType === 'Citoyen') {
      count = await Notification.getUnreadCount(userId);
    } else {
      count = await Notification.getUnreadCountByUser(userId);
    }

    res.json({ success: true, count });
  } catch (error) {
    console.error('❌ Erreur getUnreadCount:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get notifications for specific reclamation
exports.getReclamationNotifications = async (req, res) => {
  try {
    const { idReclamation } = req.params;
    const notifications = await Notification.findByReclamation(idReclamation);
    res.json({ success: true, data: notifications });
  } catch (error) {
    console.error('❌ Erreur getReclamationNotifications:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Mark one as read
exports.markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.markAsRead(id);
    res.json({ success: true, message: 'Notification marquée comme lue' });
  } catch (error) {
    console.error('❌ Erreur markNotificationAsRead:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Mark all as read
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await Notification.markAllAsRead(userId);
    res.json({ success: true, message: `${count} notification(s) marquée(s) comme lues` });
  } catch (error) {
    console.error('❌ Erreur markAllAsRead:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};