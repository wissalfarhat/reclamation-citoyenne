import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Picker } from '@react-native-picker/picker';
import { reclamationAPI } from '../../api/reclamation';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Add this BEFORE the CreateReclamationScreen component
const calculatePriority = (idCategorie) => {
  const highPriority = [8, 3];
  const mediumPriority = [1, 2, 5];
  if (highPriority.includes(Number(idCategorie))) return 8;
  if (mediumPriority.includes(Number(idCategorie))) return 5;
  return 3;
};
const CreateReclamationScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    idCategorie: '',
    adresse: '',
    ville: 'Tunis',
    quartier: '',
  });
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  const [useManualLocation, setUseManualLocation] = useState(false);

  useEffect(() => {
    checkUser();
    loadCategories();
    getLocation();
    requestPermissions();
  }, []);

  const checkUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('@user_data');
      const token = await AsyncStorage.getItem('@auth_token');
      if (!token || !userData) {
        Alert.alert(
          'Session expirée',
          'Veuillez vous reconnecter',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      }
    } catch (error) {
      console.error(' Erreur vérification utilisateur:', error);
    }
  };

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'Nous avons besoin d\'accéder à vos photos');
      }
    }
  };

  const loadCategories = async () => {
    try {
      const response = await reclamationAPI.getCategories();
      let categoriesData = [];

      if (response?.data && Array.isArray(response.data)) {
        categoriesData = response.data;
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        categoriesData = response.data.data;
      } else if (Array.isArray(response)) {
        categoriesData = response;
      } else if (response?.success && response?.data && Array.isArray(response.data)) {
        categoriesData = response.data;
      }

      if (categoriesData.length === 0) {
        categoriesData = [
          { idCategorie: 1, nomCategorie: "Voirie et infrastructures" },
          { idCategorie: 2, nomCategorie: "Éclairage public" },
          { idCategorie: 3, nomCategorie: "Eau et assainissement" },
          { idCategorie: 4, nomCategorie: "Propreté et déchets" },
          { idCategorie: 5, nomCategorie: "Transport public" },
          { idCategorie: 6, nomCategorie: "Environnement" },
          { idCategorie: 7, nomCategorie: "Espaces publics" },
          { idCategorie: 8, nomCategorie: "Sécurité et risques" },
          { idCategorie: 9, nomCategorie: "Services municipaux" },
          { idCategorie: 10, nomCategorie: "Autres" }
        ];
      }

      setCategories(categoriesData);
      if (categoriesData.length > 0) {
        setFormData(prev => ({ ...prev, idCategorie: String(categoriesData[0].idCategorie) }));
      }
    } catch (error) {
      console.error(' Erreur chargement catégories:', error);
      const defaultCategories = [
        { idCategorie: 1, nomCategorie: "Voirie et infrastructures" },
        { idCategorie: 2, nomCategorie: "Éclairage public" },
        { idCategorie: 3, nomCategorie: "Eau et assainissement" },
        { idCategorie: 4, nomCategorie: "Propreté et déchets" },
        { idCategorie: 5, nomCategorie: "Transport public" },
        { idCategorie: 6, nomCategorie: "Environnement" },
        { idCategorie: 7, nomCategorie: "Espaces publics" },
        { idCategorie: 8, nomCategorie: "Sécurité et risques" },
        { idCategorie: 9, nomCategorie: "Services municipaux" },
        { idCategorie: 10, nomCategorie: "Autres" }
      ];
      setCategories(defaultCategories);
      setFormData(prev => ({ ...prev, idCategorie: "1" }));
    }
  };

  const getLocation = async () => {
    setLocationLoading(true);
    setUseManualLocation(false);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission refusée',
          'L\'application a besoin de votre position. Vous pouvez saisir l\'adresse manuellement.',
          [
            { text: 'Saisir manuellement', onPress: () => setUseManualLocation(true) },
            { text: 'Annuler', style: 'cancel' }
          ]
        );
        setLocationLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 10000,
      });

      const addresses = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      const address = addresses[0];
      const newLocation = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        adresse: address?.street || address?.name || '',
        ville: address?.city || address?.subregion || 'Tunis',
        quartier: address?.district || address?.subregion || '',
      };

      setLocation(newLocation);
      setFormData(prev => ({
        ...prev,
        adresse: newLocation.adresse,
        ville: newLocation.ville,
        quartier: newLocation.quartier,
      }));

      Alert.alert('Succès', 'Position détectée automatiquement !');
    } catch (error) {
      console.error(' Erreur GPS:', error);
      Alert.alert(
        'Erreur de localisation',
        'Impossible d\'obtenir votre position. Veuillez saisir l\'adresse manuellement.',
        [
          { text: 'Saisir manuellement', onPress: () => setUseManualLocation(true) },
          { text: 'Annuler', style: 'cancel' }
        ]
      );
    } finally {
      setLocationLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      const newImages = result.assets.map(asset => ({
        uri: asset.uri,
        type: 'image/jpeg',
        name: `photo_${Date.now()}.jpg`,
      }));
      setImages([...images, ...newImages]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Nous avons besoin d\'accéder à votre caméra');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled) {
      setImages([...images, {
        uri: result.assets[0].uri,
        type: 'image/jpeg',
        name: `photo_${Date.now()}.jpg`,
      }]);
    }
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const validateForm = () => {
    if (!formData.titre.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un titre');
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir une description');
      return false;
    }
    if (!formData.idCategorie) {
      Alert.alert('Erreur', 'Veuillez choisir une catégorie');
      return false;
    }
    if (!location && !useManualLocation) {
      Alert.alert('Erreur', 'Veuillez obtenir votre position ou saisir une adresse');
      return false;
    }
    if (useManualLocation && (!formData.adresse || !formData.ville || !formData.quartier)) {
      Alert.alert('Erreur', 'Veuillez saisir l\'adresse, la ville et le quartier');
      return false;
    }
    return true;
  };

  // ✅ Geocode address to get real coordinates
  const geocodeAddress = async () => {
    try {
      const fullAddress = `${formData.adresse}, ${formData.quartier}, ${formData.ville}, Tunisie`;
      console.log(' Géocodage de:', fullAddress);

      const geocoded = await Location.geocodeAsync(fullAddress);
      if (geocoded && geocoded.length > 0) {
        console.log(' Coordonnées trouvées:', geocoded[0].latitude, geocoded[0].longitude);
        return { latitude: geocoded[0].latitude, longitude: geocoded[0].longitude };
      }

      // Fallback: try with city only
      const cityGeocoded = await Location.geocodeAsync(`${formData.ville}, Tunisie`);
      if (cityGeocoded && cityGeocoded.length > 0) {
        console.log(' Coordonnées ville:', cityGeocoded[0].latitude, cityGeocoded[0].longitude);
        return { latitude: cityGeocoded[0].latitude, longitude: cityGeocoded[0].longitude };
      }

      return null;
    } catch (error) {
      console.error(' Erreur géocodage:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);

    try {
      const userData = await AsyncStorage.getItem('@user_data');
      const user = userData ? JSON.parse(userData) : null;

      if (!user || !user.id) {
        Alert.alert('Erreur', 'Utilisateur non identifié');
        setLoading(false);
        return;
      }

      const form = new FormData();
      form.append('titre', formData.titre);
      form.append('description', formData.description);
      form.append('idCategorie', formData.idCategorie);
      form.append('idCitoyen', user.id);
      form.append('priorite', String(calculatePriority(formData.idCategorie)));

      if (location && !useManualLocation) {
        // ✅ Real GPS coordinates
        form.append('latitude',  String(location.latitude));
        form.append('longitude', String(location.longitude));
        form.append('adresse',   location.adresse  || '');
        form.append('ville',     location.ville    || 'Tunis');
        form.append('quartier',  location.quartier || '');
      } else {
        // ✅ Manual location - geocode to get real coords
        const coords = await geocodeAddress();

        if (coords) {
          form.append('latitude',  String(coords.latitude));
          form.append('longitude', String(coords.longitude));
        } else {
          form.append('latitude',  '0');
          form.append('longitude', '0');
        }

        form.append('adresse',  formData.adresse  || '');
        form.append('ville',    formData.ville    || 'Tunis');
        form.append('quartier', formData.quartier || '');
      }

      images.forEach((image) => {
        form.append('images', {
          uri:  image.uri,
          type: image.type,
          name: image.name,
        });
      });

      console.log(' Envoi de la réclamation...');
      const response = await reclamationAPI.createReclamation(form);
      console.log(' Réponse:', response);

      Alert.alert(
        'Succès',
        'Votre réclamation a été envoyée !',
        [{ text: 'Voir mes réclamations', onPress: () => navigation.navigate('Mes réclamations') }]
      );

    } catch (error) {
      console.error(' Erreur création:', error);
      Alert.alert('Erreur', error.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>

        {/* Section Détails */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}> Détails du problème</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Titre *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Nid de poule dangereux"
              value={formData.titre}
              onChangeText={(text) => setFormData({...formData, titre: text})}
              maxLength={100}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Décrivez le problème en détail..."
              value={formData.description}
              onChangeText={(text) => setFormData({...formData, description: text})}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
          </View>
        </View>

        {/* Section Catégorie */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}> Catégorie</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.idCategorie}
              onValueChange={(value) => setFormData({...formData, idCategorie: value})}
            >
              {categories.map((cat) => (
                <Picker.Item
                  key={cat.idCategorie}
                  label={cat.nomCategorie}
                  value={String(cat.idCategorie)}
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Section Localisation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}> Localisation</Text>

          {!useManualLocation && (
            <TouchableOpacity
              style={styles.switchModeButton}
              onPress={() => setUseManualLocation(true)}
            >
              <Icon name="edit" size={20} color="#007AFF" />
              <Text style={styles.switchModeText}>Saisir l'adresse manuellement</Text>
            </TouchableOpacity>
          )}

          {useManualLocation ? (
            <View>
              <TouchableOpacity
                style={styles.useGpsButton}
                onPress={() => { setUseManualLocation(false); getLocation(); }}
              >
                <Icon name="gps-fixed" size={20} color="#007AFF" />
                <Text style={styles.useGpsText}>Utiliser le GPS automatique</Text>
              </TouchableOpacity>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Adresse *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Numéro et nom de rue"
                  value={formData.adresse}
                  onChangeText={(text) => setFormData({...formData, adresse: text})}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputContainer, { flex: 1, marginRight: 5 }]}>
                  <Text style={styles.label}>Ville *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ville"
                    value={formData.ville}
                    onChangeText={(text) => setFormData({...formData, ville: text})}
                  />
                </View>
                <View style={[styles.inputContainer, { flex: 1, marginLeft: 5 }]}>
                  <Text style={styles.label}>Quartier *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Quartier"
                    value={formData.quartier}
                    onChangeText={(text) => setFormData({...formData, quartier: text})}
                  />
                </View>
              </View>

              {/* ✅ Info geocoding */}
              <View style={{ 
                backgroundColor: '#e8f4fd', 
                padding: 10, 
                borderRadius: 8,
                marginTop: 5
              }}>
                <Text style={{ fontSize: 12, color: '#0066cc' }}>
                   Les coordonnées GPS seront calculées automatiquement à partir de votre adresse
                </Text>
              </View>
            </View>
          ) : (
            <>
              {locationLoading ? (
                <View style={styles.locationLoading}>
                  <ActivityIndicator size="small" color="#007AFF" />
                  <Text style={styles.locationLoadingText}>Obtention de la position...</Text>
                </View>
              ) : location ? (
                <View style={styles.locationInfo}>
                  <Icon name="location-on" size={20} color="#4CAF50" />
                  <View style={styles.locationTexts}>
                    <Text style={styles.locationAddress}>
                      {location.adresse || 'Adresse non spécifiée'}
                    </Text>
                    <Text style={styles.locationCoords}>
                      {location.latitude?.toFixed(6)}, {location.longitude?.toFixed(6)}
                    </Text>
                  </View>
                </View>
              ) : (
                <TouchableOpacity style={styles.locationButton} onPress={getLocation}>
                  <Icon name="gps-fixed" size={20} color="#007AFF" />
                  <Text style={styles.locationButtonText}>Obtenir ma position</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        {/* Section Photos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}> Photos</Text>
          <View style={styles.imageButtons}>
            <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
              <Icon name="camera-alt" size={24} color="#007AFF" />
              <Text style={styles.imageButtonText}>Prendre photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
              <Icon name="photo-library" size={24} color="#007AFF" />
              <Text style={styles.imageButtonText}>Choisir</Text>
            </TouchableOpacity>
          </View>
          {images.length > 0 && (
            <ScrollView horizontal style={styles.imagePreviewContainer}>
              {images.map((image, index) => (
                <View key={index} style={styles.imagePreviewWrapper}>
                  <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                  <TouchableOpacity
                    style={styles.removeImage}
                    onPress={() => removeImage(index)}
                  >
                    <Icon name="close" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Bouton Submit */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Icon name="send" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Envoyer la réclamation</Text>
            </>
          )}
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 20 },
  section: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 15 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 15 },
  inputContainer: { marginBottom: 15 },
  label: { fontSize: 14, color: '#666', marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#f9f9f9' },
  textArea: { height: 100, textAlignVertical: 'top' },
  row: { flexDirection: 'row' },
  pickerContainer: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, backgroundColor: '#f9f9f9' },
  switchModeButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 10, backgroundColor: '#f0f8ff', borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#007AFF' },
  switchModeText: { marginLeft: 8, color: '#007AFF', fontWeight: '500' },
  locationLoading: { alignItems: 'center', justifyContent: 'center', padding: 20 },
  locationLoadingText: { marginTop: 10, color: '#666' },
  locationInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f8ff', padding: 15, borderRadius: 8 },
  locationTexts: { flex: 1, marginLeft: 15 },
  locationAddress: { fontSize: 14, color: '#333', fontWeight: '500' },
  locationCoords: { fontSize: 12, color: '#666', marginTop: 2 },
  locationButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, backgroundColor: '#f0f8ff', borderRadius: 8, borderWidth: 1, borderColor: '#007AFF' },
  locationButtonText: { marginLeft: 8, color: '#007AFF', fontWeight: '500' },
  useGpsButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, backgroundColor: '#f0f8ff', borderRadius: 8, borderWidth: 1, borderColor: '#007AFF', marginBottom: 15 },
  useGpsText: { marginLeft: 8, color: '#007AFF', fontWeight: '500' },
  imageButtons: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 15 },
  imageButton: { alignItems: 'center', padding: 10 },
  imageButtonText: { marginTop: 5, color: '#007AFF', fontSize: 12 },
  imagePreviewContainer: { flexDirection: 'row', marginTop: 10 },
  imagePreviewWrapper: { position: 'relative', marginRight: 10 },
  imagePreview: { width: 80, height: 80, borderRadius: 8 },
  removeImage: { position: 'absolute', top: -5, right: -5, backgroundColor: '#FF3B30', borderRadius: 12, width: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
  submitButton: { backgroundColor: '#007AFF', borderRadius: 10, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 10 },
  submitButtonDisabled: { opacity: 0.7 },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default CreateReclamationScreen;