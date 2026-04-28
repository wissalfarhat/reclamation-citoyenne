import React, { useState, useEffect } from 'react';  // ← AJOUTÉ useEffect
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api/auth';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = () => {
  const { user, logout, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    telephone: user?.telephone || '',
    adresse: user?.adresse || '',
  });
  const [passwordData, setPasswordData] = useState({
    ancienMotDePasse: '',
    nouveauMotDePasse: '',
    confirmPassword: '',
  });

  // ============================================
  // METTRE À JOUR LE PROFIL
  // ============================================
  const handleUpdateProfile = async () => {
    if (!formData.nom || !formData.prenom) {
      Alert.alert('Erreur', 'Le nom et le prénom sont requis');
      return;
    }

    setLoading(true);
    try {
      console.log('📤 Mise à jour profil avec:', formData);
      
      const response = await authAPI.updateProfile(formData);
      console.log('📥 Réponse:', response);
      
      if (response.success) {
        const updatedUser = {
          ...user,
          nom: formData.nom,
          prenom: formData.prenom,
          telephone: formData.telephone,
          adresse: formData.adresse,
        };
        
        console.log('👤 Ancien utilisateur:', user);
        console.log('👤 Nouvel utilisateur:', updatedUser);
        
        await AsyncStorage.setItem('@user_data', JSON.stringify(updatedUser));
        
        if (updateUser) {
          updateUser({
            nom: formData.nom,
            prenom: formData.prenom,
            telephone: formData.telephone,
            adresse: formData.adresse,
          });
        }
        
        Alert.alert('Succès', 'Profil mis à jour');
        setIsEditing(false);
      } else {
        Alert.alert('Erreur', response.message || 'Erreur de mise à jour');
      }
    } catch (error) {
      console.error('❌ Erreur updateProfile:', error);
      Alert.alert('Erreur', error.response?.data?.message || 'Erreur de mise à jour');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // CHANGER LE MOT DE PASSE
  // ============================================
  const handleChangePassword = async () => {
    if (!passwordData.ancienMotDePasse || !passwordData.nouveauMotDePasse) {
      Alert.alert('Erreur', 'Tous les champs sont requis');
      return;
    }
    if (passwordData.nouveauMotDePasse.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    if (passwordData.nouveauMotDePasse !== passwordData.confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    try {
      console.log('🔐 Changement de mot de passe');
      
      const response = await authAPI.changePassword({
        ancienMotDePasse: passwordData.ancienMotDePasse,
        nouveauMotDePasse: passwordData.nouveauMotDePasse,
      });
      
      console.log('📥 Réponse:', response);
      
      if (response.success) {
        Alert.alert('Succès', 'Mot de passe modifié');
        setShowPasswordModal(false);
        setPasswordData({
          ancienMotDePasse: '',
          nouveauMotDePasse: '',
          confirmPassword: '',
        });
      } else {
        Alert.alert('Erreur', response.message || 'Erreur de modification');
      }
    } catch (error) {
      console.error('❌ Erreur changePassword:', error);
      Alert.alert('Erreur', error.response?.data?.message || 'Erreur de modification');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // DÉCONNEXION
  // ============================================
  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnexion', 
          onPress: async () => {
            await logout();
          },
          style: 'destructive',
        },
      ]
    );
  };

  // ============================================
  // COMPOSANT InfoRow - VERSION CORRIGÉE (avec useEffect)
  // ============================================
  const InfoRow = ({ icon, label, value }) => {
    const fieldName = label.toLowerCase();
    const [localValue, setLocalValue] = useState(value);
    
    // ✅ Synchroniser localValue quand value change
    useEffect(() => {
      setLocalValue(value);
    }, [value]);
    
    return (
      <View style={styles.infoRow}>
        <Icon name={icon} size={20} color="#666" style={styles.infoIcon} />
        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>{label}</Text>
          {isEditing ? (
            <TextInput
              style={styles.infoInput}
              value={localValue}
              onChangeText={setLocalValue}
              onBlur={() => {
                setFormData({...formData, [fieldName]: localValue});
              }}
              placeholder={`Votre ${label.toLowerCase()}`}
            />
          ) : (
            <Text style={styles.infoValue}>{value || 'Non renseigné'}</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* En-tête */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Icon name="person" size={60} color="#007AFF" />
        </View>
        <Text style={styles.userName}>{user?.prenom} {user?.nom}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        <Text style={styles.userType}>
          {user?.typeUtilisateur === 'Citoyen' ? 'Citoyen' : user?.typeUtilisateur}
        </Text>
      </View>

      {/* Section Informations personnelles */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Informations personnelles</Text>
          <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
            <Icon 
              name={isEditing ? 'close' : 'edit'} 
              size={20} 
              color={isEditing ? '#FF3B30' : '#007AFF'} 
            />
          </TouchableOpacity>
        </View>

        <InfoRow icon="person" label="Nom" value={user?.nom} />
        <InfoRow icon="person" label="Prenom" value={user?.prenom} />
        <InfoRow icon="phone" label="Telephone" value={user?.telephone} />
        <InfoRow icon="location-on" label="Adresse" value={user?.adresse} />

        {isEditing && (
          <View style={styles.editActions}>
            <TouchableOpacity
              style={[styles.editButton, styles.cancelEdit]}
              onPress={() => {
                setIsEditing(false);
                setFormData({
                  nom: user?.nom || '',
                  prenom: user?.prenom || '',
                  telephone: user?.telephone || '',
                  adresse: user?.adresse || '',
                });
              }}
            >
              <Text style={styles.cancelEditText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.editButton, styles.saveEdit]}
              onPress={handleUpdateProfile}
              disabled={loading}
            >
              <Text style={styles.saveEditText}>
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Section Sécurité */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sécurité</Text>
        
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => setShowPasswordModal(true)}
        >
          <Icon name="lock" size={20} color="#666" />
          <Text style={styles.menuText}>Changer le mot de passe</Text>
          <Icon name="chevron-right" size={20} color="#999" />
        </TouchableOpacity>
      </View>

      {/* Bouton Déconnexion */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="logout" size={20} color="#FF3B30" />
        <Text style={styles.logoutText}>Déconnexion</Text>
      </TouchableOpacity>

      {/* Modal de changement de mot de passe */}
      <Modal
        visible={showPasswordModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Changer le mot de passe</Text>
              <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Ancien mot de passe</Text>
                <TextInput
                  style={styles.input}
                  secureTextEntry
                  value={passwordData.ancienMotDePasse}
                  onChangeText={(text) => setPasswordData({...passwordData, ancienMotDePasse: text})}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Nouveau mot de passe</Text>
                <TextInput
                  style={styles.input}
                  secureTextEntry
                  value={passwordData.nouveauMotDePasse}
                  onChangeText={(text) => setPasswordData({...passwordData, nouveauMotDePasse: text})}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirmer le mot de passe</Text>
                <TextInput
                  style={styles.input}
                  secureTextEntry
                  value={passwordData.confirmPassword}
                  onChangeText={(text) => setPasswordData({...passwordData, confirmPassword: text})}
                />
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowPasswordModal(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleChangePassword}
                disabled={loading}
              >
                <Text style={styles.confirmButtonText}>
                  {loading ? 'Modification...' : 'Confirmer'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  userType: {
    fontSize: 12,
    color: '#007AFF',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 10,
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  infoIcon: {
    marginRight: 15,
    width: 20,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
  },
  infoInput: {
    fontSize: 14,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#007AFF',
    paddingVertical: 2,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 15,
  },
  editButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelEdit: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  cancelEditText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '600',
  },
  saveEdit: {
    backgroundColor: '#007AFF',
  },
  saveEditText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 15,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    margin: 20,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
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
  modalBody: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;