import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { reclamationAPI } from '../../api/reclamation';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ReclamationsListScreen = ({ navigation }) => {
  const [reclamations, setReclamations] = useState([]);
  const [filteredReclamations, setFilteredReclamations] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  const statusOptions = ['all', 'En attente', 'En cours', 'Traitée', 'Refusée'];

  useFocusEffect(
    useCallback(() => {
      loadReclamations();
    }, [])
  );

  // ============================================
  // VERSION AVEC LOGS AMÉLIORÉS
  // ============================================
  const loadReclamations = async () => {
    try {
      setLoading(true);
      console.log('\n🔍 ===== CHARGEMENT DES RÉCLAMATIONS =====');
      
      const token = await AsyncStorage.getItem('@auth_token');
      console.log('1️⃣ Token présent:', token ? '✅ OUI' : '❌ NON');
      
      if (!token) {
        console.log('❌ Aucun token - arrêt du chargement');
        setLoading(false);
        setRefreshing(false);
        return;
      }

      console.log('2️⃣ Appel API: getMyReclamations()');
      const response = await reclamationAPI.getMyReclamations();
      
      console.log('3️⃣ RÉPONSE API:', JSON.stringify(response, null, 2));
      
      // ✅ Extraire les données correctement
      let reclamationsData = [];
      
      if (response?.data && Array.isArray(response.data)) {
        console.log('✅ Format: response.data est un tableau');
        reclamationsData = response.data;
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        console.log('✅ Format: response.data.data est un tableau');
        reclamationsData = response.data.data;
      } else if (Array.isArray(response)) {
        console.log('✅ Format: response est un tableau');
        reclamationsData = response;
      }
      
      console.log(`4️⃣ ${reclamationsData.length} réclamation(s) trouvée(s)`);
      
      if (reclamationsData.length > 0) {
        console.log('\n📋 PREMIÈRE RÉCLAMATION:', reclamationsData[0]);
      }
      
      setReclamations(reclamationsData);
      setFilteredReclamations(reclamationsData);
      
    } catch (error) {
      console.error('\n❌ ERREUR CHARGEMENT:', error.message);
      if (error.response) {
        console.error('   Status:', error.response.status);
        console.error('   Data:', error.response.data);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      console.log('🏁 ===== FIN CHARGEMENT =====\n');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadReclamations();
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    filterReclamations(text, selectedStatus);
  };

  const handleFilter = (status) => {
    setSelectedStatus(status);
    filterReclamations(searchQuery, status);
    setFilterModalVisible(false);
  };

  const filterReclamations = (query, status) => {
    let filtered = [...reclamations];

    if (query) {
      filtered = filtered.filter(r =>
        r.titre?.toLowerCase().includes(query.toLowerCase()) ||
        r.description?.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (status !== 'all') {
      filtered = filtered.filter(r => r.statut === status);
    }

    setFilteredReclamations(filtered);
  };

  const getStatusColor = (statut) => {
    switch (statut) {
      case 'En attente': return '#FFA000';
      case 'En cours': return '#2196F3';
      case 'Traitée': return '#4CAF50';
      case 'Refusée': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const ReclamationCard = ({ item }) => {
    // ✅ Vérification que l'item existe
    if (!item) return null;
    
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('ReclamationDetail', { id: item.idReclamation })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.titre || 'Sans titre'}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.statut) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.statut) }]}>
              {item.statut || 'Inconnu'}
            </Text>
          </View>
        </View>

        <Text style={styles.cardDescription} numberOfLines={2}>
          {item.description || 'Aucune description'}
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.footerItem}>
            <Icon name="event" size={14} color="#999" />
            <Text style={styles.footerText}>
              {item.dateCreation ? new Date(item.dateCreation).toLocaleDateString() : 'Date inconnue'}
            </Text>
          </View>
          <View style={styles.footerItem}>
            <Icon name="location-on" size={14} color="#999" />
            <Text style={styles.footerText}>{item.quartier || 'Non localisé'}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const FilterModal = () => (
    <Modal
      visible={filterModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setFilterModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filtrer par statut</Text>
            <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {statusOptions.map(status => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterOption,
                selectedStatus === status && styles.filterOptionSelected
              ]}
              onPress={() => handleFilter(status)}
            >
              <Text style={[
                styles.filterOptionText,
                selectedStatus === status && styles.filterOptionTextSelected
              ]}>
                {status === 'all' ? 'Tous' : status}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <Text>Chargement des réclamations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Icon name="filter-list" size={24} color="#007AFF" />
          {selectedStatus !== 'all' && <View style={styles.filterBadge} />}
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredReclamations}
        renderItem={({ item }) => <ReclamationCard item={item} />}
        keyExtractor={item => item?.idReclamation?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="info" size={50} color="#ccc" />
            <Text style={styles.emptyText}>Aucune réclamation trouvée</Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => navigation.navigate('Nouvelle')}
            >
              <Text style={styles.createButtonText}>Créer une réclamation</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <FilterModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 20,
    marginBottom: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  filterButton: {
    padding: 8,
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 15,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  filterOption: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterOptionSelected: {
    backgroundColor: '#f0f8ff',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#333',
  },
  filterOptionTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default ReclamationsListScreen;