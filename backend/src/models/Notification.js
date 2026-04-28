const db = require('../config/database');

class Notification {

  // ============================================
  // CREATE
  // ============================================
  static async create(notificationData) {
    console.log(' Création notification:', notificationData);
    try {
      const [result] = await db.execute(
        `INSERT INTO Notification 
        (message, dateEnvoi, type, lu, idReclamation, idCitoyen, idUtilisateur) 
        VALUES (?, UTC_TIMESTAMP(), ?, FALSE, ?, ?, ?)`,
        [
          notificationData.message,
          notificationData.type || 'info',
          notificationData.idReclamation || null,
          notificationData.idCitoyen     || null,
          notificationData.idUtilisateur || notificationData.idCitoyen || null,
        ]
      );
      console.log(` Notification créée ID: ${result.insertId}`);
      return result.insertId;
    } catch (error) {
      console.error(' Erreur création notification:', error);
      throw error;
    }
  }

  // ============================================
  // FIND BY CITOYEN (mobile)
  // ============================================
  static async findByCitoyen(idCitoyen) {
    try {
      const [rows] = await db.execute(`
        SELECT n.*, r.titre as reclamationTitre
        FROM Notification n
        LEFT JOIN Reclamation r ON n.idReclamation = r.idReclamation
        WHERE n.idCitoyen = ?
        ORDER BY n.idNotification DESC
        LIMIT 50
      `, [idCitoyen]);
      return rows;
    } catch (error) {
      console.error(' Erreur findByCitoyen:', error);
      throw error;
    }
  }

  // ============================================
  // FIND BY USER (agent / admin)
  // ============================================
  static async findByUser(idUtilisateur) {
    try {
      const [rows] = await db.execute(`
        SELECT n.*, r.titre as reclamationTitre
        FROM Notification n
        LEFT JOIN Reclamation r ON n.idReclamation = r.idReclamation
        WHERE n.idUtilisateur = ?
        ORDER BY n.idNotification DESC
        LIMIT 50
      `, [idUtilisateur]);
      return rows;
    } catch (error) {
      console.error(' Erreur findByUser:', error);
      throw error;
    }
  }

  // ============================================
  // FIND BY RECLAMATION
  // ============================================
  static async findByReclamation(idReclamation) {
    try {
      const [rows] = await db.execute(`
        SELECT n.*, u.nom, u.prenom 
        FROM Notification n
        LEFT JOIN Utilisateur u ON u.idUtilisateur = n.idCitoyen
        WHERE n.idReclamation = ? 
        ORDER BY n.dateEnvoi DESC
      `, [idReclamation]);
      return rows;
    } catch (error) {
      console.error(' Erreur findByReclamation:', error);
      throw error;
    }
  }

  // ============================================
  // UNREAD COUNT — citoyen
  // ============================================
  static async getUnreadCount(idCitoyen) {
    try {
      const [rows] = await db.execute(
        'SELECT COUNT(*) as count FROM Notification WHERE idCitoyen = ? AND lu = FALSE',
        [idCitoyen]
      );
      return rows[0].count;
    } catch (error) {
      console.error(' Erreur getUnreadCount:', error);
      throw error;
    }
  }

  // ============================================
  // UNREAD COUNT — agent / admin
  // ============================================
  static async getUnreadCountByUser(idUtilisateur) {
    try {
      const [rows] = await db.execute(
        'SELECT COUNT(*) as count FROM Notification WHERE idUtilisateur = ? AND lu = FALSE',
        [idUtilisateur]
      );
      return rows[0].count;
    } catch (error) {
      console.error(' Erreur getUnreadCountByUser:', error);
      throw error;
    }
  }

  // ============================================
  // MARK ONE AS READ
  // ============================================
  static async markAsRead(idNotification) {
    try {
      const [result] = await db.execute(
        'UPDATE Notification SET lu = TRUE WHERE idNotification = ?',
        [idNotification]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error(' Erreur markAsRead:', error);
      throw error;
    }
  }

  // ============================================
  // MARK ALL AS READ — citoyen
  // ============================================
  static async markAllAsRead(idCitoyen) {
    try {
      const [result] = await db.execute(
        'UPDATE Notification SET lu = TRUE WHERE idCitoyen = ? AND lu = FALSE',
        [idCitoyen]
      );
      return result.affectedRows;
    } catch (error) {
      console.error(' Erreur markAllAsRead:', error);
      throw error;
    }
  }

  // ============================================
  // MARK ALL AS READ — agent / admin
  // ============================================
  static async markAllAsReadByUser(idUtilisateur) {
    try {
      const [result] = await db.execute(
        'UPDATE Notification SET lu = TRUE WHERE idUtilisateur = ? AND lu = FALSE',
        [idUtilisateur]
      );
      return result.affectedRows;
    } catch (error) {
      console.error(' Erreur markAllAsReadByUser:', error);
      throw error;
    }
  }

  // ============================================
  // UNREAD BY CITOYEN
  // ============================================
  static async getUnreadByCitoyen(idCitoyen) {
    try {
      const [rows] = await db.execute(`
        SELECT n.*, r.titre as reclamationTitre
        FROM Notification n
        LEFT JOIN Reclamation r ON n.idReclamation = r.idReclamation
        WHERE n.idCitoyen = ? AND n.lu = FALSE
        ORDER BY n.dateEnvoi DESC
      `, [idCitoyen]);
      return rows;
    } catch (error) {
      console.error(' Erreur getUnreadByCitoyen:', error);
      throw error;
    }
  }

  // ============================================
  // RECENT NOTIFICATIONS (dashboard)
  // ============================================
  static async getRecentNotifications(limit = 10) {
    try {
      const [rows] = await db.execute(`
        SELECT n.*, r.titre, u.nom, u.prenom, u.email
        FROM Notification n
        JOIN Reclamation r ON n.idReclamation = r.idReclamation
        JOIN Utilisateur u ON n.idCitoyen = u.idUtilisateur
        ORDER BY n.dateEnvoi DESC
        LIMIT ?
      `, [limit]);
      return rows;
    } catch (error) {
      console.error(' Erreur getRecentNotifications:', error);
      throw error;
    }
  }
}

module.exports = Notification;