const Citoyen = require('../models/Citoyen');
const Reclamation = require('../models/Reclamation');
const Notification = require('../models/Notification');

exports.getCitoyenReclamations = async (req, res) => {
    try {
        const idCitoyen = req.user.id;
        const reclamations = await Citoyen.getReclamations(idCitoyen);
        res.json(reclamations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la récupération des réclamations' });
    }
};

exports.getCitoyenNotifications = async (req, res) => {
    try {
        const idCitoyen = req.user.id;
        const notifications = await Notification.getUnreadByCitoyen(idCitoyen);
        res.json(notifications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la récupération des notifications' });
    }
};

exports.markNotificationsAsRead = async (req, res) => {
    try {
        const idCitoyen = req.user.id;
        await Notification.markAllAsRead(idCitoyen);
        res.json({ message: 'Notifications marquées comme lues' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors du marquage des notifications' });
    }
};