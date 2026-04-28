import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { reclamationAPI } from '../../api/reclamation';
import Icon from 'react-native-vector-icons/MaterialIcons';

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [])
  );

  const loadNotifications = async () => {
    try {
      const response = await reclamationAPI.getNotifications();
      console.log(' Notifications reçues:', response);
      setNotifications(response.data || []);
    } catch (error) {
      console.error(' Erreur chargement notifications:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const markAsRead = async (id) => {
    try {
      await reclamationAPI.markNotificationAsRead(id);
      loadNotifications();
    } catch (error) {
      console.error(' Erreur marquage:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await reclamationAPI.markAllNotificationsAsRead();
      loadNotifications();
    } catch (error) {
      console.error(' Erreur marquage tout:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'creation':        return 'note-add';
      case 'statut_en_cours': return 'autorenew';
      case 'statut_traitee':  return 'check-circle';
      case 'statut_refusee':  return 'cancel';
      default:                return 'notifications';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'statut_traitee':  return '#28a745';
      case 'statut_refusee':  return '#dc3545';
      case 'statut_en_cours': return '#17a2b8';
      case 'creation':        return '#007AFF';
      default:                return '#007AFF';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1)   return 'À l\'instant';
    if (diffMins < 60)  return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    return `Il y a ${diffDays}j`;
  };

  const unreadCount = notifications.filter(n => !n.lu).length;

  const NotificationItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.lu && styles.notificationUnread]}
      onPress={() => {
        if (!item.lu) markAsRead(item.idNotification);
        if (item.idReclamation) {
          navigation.navigate('ReclamationDetail', { id: item.idReclamation });
        }
      }}
    >
      <View style={[
        styles.iconContainer,
        { backgroundColor: !item.lu ? `${getNotificationColor(item.type)}20` : '#f5f5f5' }
      ]}>
        <Icon
          name={getNotificationIcon(item.type)}
          size={20}
          color={!item.lu ? getNotificationColor(item.type) : '#999'}
        />
      </View>

      <View style={styles.notificationContent}>
        <Text style={[styles.notificationMessage, !item.lu && styles.unreadText]}>
          {item.message}
        </Text>
        {item.reclamationTitre && (
          <Text style={styles.reclamationTitle}>
             {item.reclamationTitre}
          </Text>
        )}
        <Text style={styles.notificationDate}>
          {formatDate(item.dateEnvoi)}
        </Text>
      </View>

      {!item.lu && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <View style={styles.headerRight}>
          {unreadCount > 0 && (
            <>
              <Text style={styles.unreadCount}>
                {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
              </Text>
              <TouchableOpacity onPress={markAllAsRead} style={styles.markAllBtn}>
                <Text style={styles.markAllText}>Tout lire</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <FlatList
        data={notifications}
        renderItem={({ item }) => <NotificationItem item={item} />}
        keyExtractor={item => item.idNotification.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="notifications-none" size={60} color="#ccc" />
            <Text style={styles.emptyText}>Aucune notification</Text>
            <Text style={styles.emptySubText}>
              Vous serez notifié des mises à jour de vos réclamations
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: '#f5f5f5' },
  header:             { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  title:              { fontSize: 20, fontWeight: 'bold', color: '#333' },
  headerRight:        { flexDirection: 'row', alignItems: 'center', gap: 10 },
  unreadCount:        { color: '#007AFF', fontSize: 14 },
  markAllBtn:         { backgroundColor: '#007AFF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  markAllText:        { color: '#fff', fontSize: 12, fontWeight: '500' },
  listContainer:      { padding: 15 },
  notificationItem:   { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 10, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  notificationUnread: { backgroundColor: '#f0f8ff', borderWidth: 1, borderColor: '#007AFF' },
  iconContainer:      { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  notificationContent:{ flex: 1 },
  notificationMessage:{ fontSize: 14, color: '#333', marginBottom: 3, lineHeight: 20 },
  unreadText:         { fontWeight: '600', color: '#111' },
  reclamationTitle:   { fontSize: 12, color: '#667eea', marginBottom: 3 },
  notificationDate:   { fontSize: 12, color: '#999' },
  unreadDot:          { width: 10, height: 10, borderRadius: 5, backgroundColor: '#007AFF', marginLeft: 8 },
  emptyContainer:     { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText:          { fontSize: 18, color: '#666', marginTop: 15, fontWeight: '500' },
  emptySubText:       { fontSize: 14, color: '#999', marginTop: 8, textAlign: 'center', paddingHorizontal: 30 },
});

export default NotificationsScreen;