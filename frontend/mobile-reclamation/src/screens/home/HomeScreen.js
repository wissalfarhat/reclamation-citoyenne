import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { reclamationAPI } from '../../api/reclamation';
import Icon from 'react-native-vector-icons/MaterialIcons';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [reclamations, setReclamations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    enAttente: 0,
    enCours: 0,
    traitees: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const reclamationsRes = await reclamationAPI.getMyReclamations();
      setReclamations(reclamationsRes.data || []);

      const data = reclamationsRes.data || [];
      setStats({
        total: data.length,
        enAttente: data.filter(r => r.statut === 'En attente').length,
        enCours: data.filter(r => r.statut === 'En cours').length,
        traitees: data.filter(r => r.statut === 'Traitée').length,
      });

      const notifRes = await reclamationAPI.getNotifications();
      setNotifications(notifRes.data || []);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getStatusColor = (statut) => {
    switch (statut) {
      case 'En attente': return '#FFA000';
      case 'En cours': return '#2196F3';
      case 'Traitée': return '#4CAF50';
      default: return '#9E9E9E';
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <View style={[styles.statCard, { backgroundColor: color + '20' }]}>
      <Icon name={icon} size={24} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{title}</Text>
    </View>
  );

  const unreadCount = notifications.filter(n => !n.lu).length;

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bonjour,</Text>
          <Text style={styles.userName}>{user?.prenom} {user?.nom}</Text>
        </View>
        <TouchableOpacity 
          style={styles.notificationBell}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Icon name="notifications" size={24} color="#333" />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Vos statistiques</Text>
      <View style={styles.statsGrid}>
        <StatCard title="Total" value={stats.total} icon="assignment" color="#007AFF" />
        <StatCard title="En attente" value={stats.enAttente} icon="hourglass-empty" color="#FFA000" />
        <StatCard title="En cours" value={stats.enCours} icon="engineering" color="#2196F3" />
        <StatCard title="Traitées" value={stats.traitees} icon="check-circle" color="#4CAF50" />
      </View>

      <TouchableOpacity
        style={styles.quickAction}
        onPress={() => navigation.navigate('Nouvelle')}
      >
        <Icon name="add-circle" size={24} color="#fff" />
        <Text style={styles.quickActionText}>Nouvelle réclamation</Text>
      </TouchableOpacity>

      {reclamations.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Réclamations récentes</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Mes réclamations')}>
              <Text style={styles.seeAll}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.recentList}>
            {reclamations.slice(0, 3).map(item => (
              <TouchableOpacity
                key={item.idReclamation}
                style={styles.recentItem}
                onPress={() => navigation.navigate('ReclamationDetail', { id: item.idReclamation })}
              >
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.statut) }]} />
                <View style={styles.recentContent}>
                  <Text style={styles.recentTitle} numberOfLines={1}>{item.titre}</Text>
                  <Text style={styles.recentDate}>
                    {new Date(item.dateCreation).toLocaleDateString()}
                  </Text>
                </View>
                <Icon name="chevron-right" size={20} color="#999" />
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {reclamations.length === 0 && (
        <View style={styles.emptyContainer}>
          <Icon name="info" size={50} color="#ccc" />
          <Text style={styles.emptyText}>Aucune réclamation pour le moment</Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => navigation.navigate('Nouvelle')}
          >
            <Text style={styles.emptyButtonText}>Créer une réclamation</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  greeting: {
    fontSize: 14,
    color: '#666',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  notificationBell: {
    position: 'relative',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  seeAll: {
    color: '#007AFF',
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 10,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  quickAction: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 10,
    padding: 15,
    borderRadius: 12,
    gap: 10,
  },
  quickActionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  recentList: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 10,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  recentContent: {
    flex: 1,
  },
  recentTitle: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  recentDate: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    marginHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
    marginBottom: 20,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default HomeScreen;