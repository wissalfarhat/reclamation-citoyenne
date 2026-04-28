import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { reclamationAPI } from '../../api/reclamation';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ReclamationDetailScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const [reclamation, setReclamation] = useState(null);
  const [historique, setHistorique] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [recResponse, histResponse] = await Promise.all([
        reclamationAPI.getReclamationById(id),
        reclamationAPI.getHistorique(id),
      ]);

      if (recResponse?.data) {
        setReclamation(recResponse.data);
      } else {
        Alert.alert('Erreur', 'Réclamation introuvable');
        navigation.goBack();
        return;
      }

      const hist = histResponse?.data || [];

      // ✅ Only statut changes and comments, sorted by date desc
      const filtered = hist
        .filter(h =>
          h.action?.includes('Statut') ||
          h.action?.includes('Commentaire')
        )
        .sort((a, b) => new Date(b.dateAction) - new Date(a.dateAction));

      setHistorique(filtered);

    } catch (error) {
      console.error(' Erreur chargement:', error);
      Alert.alert('Erreur', 'Impossible de charger la réclamation');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (statut) => {
    switch (statut) {
      case 'En attente': return '#FFA000';
      case 'En cours':   return '#2196F3';
      case 'Traitée':    return '#4CAF50';
      case 'Refusée':    return '#F44336';
      default:           return '#9E9E9E';
    }
  };

  const getHistoryIcon = (action) => {
    if (action?.includes('Commentaire')) return { icon: 'chat',   color: '#667eea' };
    if (action?.includes('Statut'))      return { icon: 'update', color: '#17a2b8' };
    return                                      { icon: 'history',color: '#6c757d' };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    const date = new Date(dateString.replace(' ', 'T'));
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const openMap = () => {
    if (reclamation?.latitude && reclamation?.longitude) {
      const url = `https://www.google.com/maps/search/?api=1&query=${reclamation.latitude},${reclamation.longitude}`;
      Linking.openURL(url);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10, color: '#666' }}>Chargement...</Text>
      </View>
    );
  }

  if (!reclamation) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="error" size={50} color="#FF3B30" />
        <Text style={styles.errorText}>Réclamation non trouvée</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>

      {/* Header with status */}
      <View style={[styles.header, { backgroundColor: getStatusColor(reclamation.statut) + '15' }]}>
        <View style={styles.statusContainer}>
          <Icon name="info" size={24} color={getStatusColor(reclamation.statut)} />
          <Text style={[styles.statusText, { color: getStatusColor(reclamation.statut) }]}>
            {reclamation.statut || 'Statut inconnu'}
          </Text>
        </View>
        <Text style={styles.reference}>Réf: #{reclamation.idReclamation}</Text>
      </View>

      {/* Title & description */}
      <View style={styles.section}>
        <Text style={styles.title}>{reclamation.titre || 'Sans titre'}</Text>
        <Text style={styles.description}>{reclamation.description || 'Aucune description'}</Text>
      </View>

      {/* Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}> Informations</Text>

        <View style={styles.infoRow}>
          <Icon name="category" size={20} color="#666" />
          <Text style={styles.infoLabel}>Catégorie:</Text>
          <Text style={styles.infoValue}>{reclamation.nomCategorie || 'Non catégorisé'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Icon name="priority-high" size={20} color="#666" />
          <Text style={styles.infoLabel}>Priorité:</Text>
          <View style={[styles.priorityBadge, {
            backgroundColor: reclamation.priorite > 7 ? '#FF3B30' : '#FFA000'
          }]}>
            <Text style={styles.priorityText}>{reclamation.priorite || 1}/10</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Icon name="event" size={20} color="#666" />
          <Text style={styles.infoLabel}>Créée le:</Text>
          <Text style={styles.infoValue}>{formatDate(reclamation.dateCreation)}</Text>
        </View>

        {reclamation.dateModification && (
          <View style={styles.infoRow}>
            <Icon name="update" size={20} color="#666" />
            <Text style={styles.infoLabel}>Modifiée:</Text>
            <Text style={styles.infoValue}>{formatDate(reclamation.dateModification)}</Text>
          </View>
        )}
      </View>

      {/* Location */}
      {(reclamation.adresse || reclamation.ville) && (
        <TouchableOpacity style={styles.section} onPress={openMap}>
          <Text style={styles.sectionTitle}> Localisation</Text>
          {reclamation.adresse && reclamation.adresse !== 'Adresse non spécifiée' && (
            <View style={styles.infoRow}>
              <Icon name="location-on" size={20} color="#666" />
              <Text style={styles.infoValue}>{reclamation.adresse}</Text>
            </View>
          )}
          {reclamation.quartier && reclamation.quartier !== 'Non spécifié' && (
            <Text style={styles.locationDetail}>
              {reclamation.quartier}, {reclamation.ville || 'Tunis'}
            </Text>
          )}
          {reclamation.latitude && reclamation.longitude && (
            <Text style={styles.mapLink}> Voir sur la carte</Text>
          )}
        </TouchableOpacity>
      )}

      {/* ✅ History - only statut + comments, no agent names */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
           Suivi de la réclamation
          {historique.length > 0 && (
            <Text style={styles.historyCount}> ({historique.length})</Text>
          )}
        </Text>

        {historique.length === 0 ? (
          <View style={styles.emptyHistory}>
            <Icon name="history" size={40} color="#ddd" />
            <Text style={styles.emptyHistoryText}>Aucune mise à jour pour le moment</Text>
          </View>
        ) : (
          historique.map((item, index) => {
            const { icon, color } = getHistoryIcon(item.action);
            const isComment = item.action?.includes('Commentaire');

            return (
              <View key={index} style={styles.historyItem}>
                {/* Timeline */}
                <View style={styles.timelineLeft}>
                  <View style={[styles.historyIconCircle, { backgroundColor: color + '20' }]}>
                    <Icon name={icon} size={16} color={color} />
                  </View>
                  {index < historique.length - 1 && (
                    <View style={styles.timelineLine} />
                  )}
                </View>

                {/* Content */}
                <View style={[
                  styles.historyContent,
                  isComment && styles.commentBox
                ]}>
                  <Text style={[styles.historyAction, { color }]}>
                    {item.action}
                  </Text>
                  {item.commentaire && item.commentaire.trim() !== '' && (
                    <Text style={styles.historyComment}>
                      {item.commentaire}
                    </Text>
                  )}
                  {/* ✅ Only date shown - no agent/admin name */}
                  <Text style={styles.historyMeta}>
                    {formatDate(item.dateAction)}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container:           { flex: 1, backgroundColor: '#f5f5f5' },
  centerContainer:     { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText:           { marginTop: 10, fontSize: 16, color: '#666' },
  header:              { padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  statusContainer:     { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 5 },
  statusText:          { fontSize: 16, fontWeight: '600' },
  reference:           { fontSize: 12, color: '#999' },
  section:             { backgroundColor: '#fff', padding: 20, marginTop: 10 },
  sectionTitle:        { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 15 },
  historyCount:        { fontSize: 14, color: '#999', fontWeight: 'normal' },
  title:               { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  description:         { fontSize: 14, color: '#666', lineHeight: 20 },
  infoRow:             { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  infoLabel:           { fontSize: 14, color: '#999', marginLeft: 8, width: 80 },
  infoValue:           { flex: 1, fontSize: 14, color: '#333' },
  priorityBadge:       { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  priorityText:        { color: '#fff', fontSize: 12, fontWeight: '600' },
  locationDetail:      { fontSize: 12, color: '#666', marginLeft: 28, marginTop: 2 },
  mapLink:             { fontSize: 13, color: '#007AFF', marginLeft: 28, marginTop: 6 },
  emptyHistory:        { alignItems: 'center', paddingVertical: 30 },
  emptyHistoryText:    { color: '#999', marginTop: 10, fontSize: 14 },
  historyItem:         { flexDirection: 'row', marginBottom: 16 },
  timelineLeft:        { alignItems: 'center', marginRight: 12, width: 32 },
  historyIconCircle:   { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  timelineLine:        { width: 2, flex: 1, backgroundColor: '#eee', marginTop: 4 },
  historyContent:      { flex: 1, paddingBottom: 8 },
  commentBox:          { backgroundColor: '#f8f9fa', padding: 12, borderRadius: 8, borderLeftWidth: 3, borderLeftColor: '#667eea' },
  historyAction:       { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  historyComment:      { fontSize: 13, color: '#444', marginTop: 4, lineHeight: 18 },
  historyMeta:         { fontSize: 11, color: '#999', marginTop: 6 },
});

export default ReclamationDetailScreen;