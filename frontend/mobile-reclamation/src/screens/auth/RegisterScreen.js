import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Icon from 'react-native-vector-icons/MaterialIcons';

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    motDePasse: '',
    confirmPassword: '',
    telephone: '',
    adresse: '',
  });
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();

  const validateForm = () => {
    if (!formData.nom || !formData.prenom || !formData.email || !formData.motDePasse) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return false;
    }
    if (!formData.email.includes('@')) {
      Alert.alert('Erreur', 'Email invalide');
      return false;
    }
    if (formData.motDePasse.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }
    if (formData.motDePasse !== formData.confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    const userData = {
      nom: formData.nom,
      prenom: formData.prenom,
      email: formData.email,
      motDePasse: formData.motDePasse,
      typeUtilisateur: 'Citoyen',
      telephone: formData.telephone,
      adresse: formData.adresse,
    };

    const result = await register(userData);
    setLoading(false);

    if (result.success) {
      Alert.alert(
        'Succès',
        'Compte créé avec succès !',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } else {
      Alert.alert('Erreur', result.error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>

          <Text style={styles.title}>Créer un compte</Text>

          <View style={styles.form}>
            <Input
              label="Nom *"
              value={formData.nom}
              onChangeText={(text) => setFormData({...formData, nom: text})}
              placeholder="Votre nom"
              icon="person"
            />

            <Input
              label="Prénom *"
              value={formData.prenom}
              onChangeText={(text) => setFormData({...formData, prenom: text})}
              placeholder="Votre prénom"
              icon="person"
            />

            <Input
              label="Email *"
              value={formData.email}
              onChangeText={(text) => setFormData({...formData, email: text})}
              placeholder="votre@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              icon="email"
            />

            <Input
              label="Mot de passe *"
              value={formData.motDePasse}
              onChangeText={(text) => setFormData({...formData, motDePasse: text})}
              placeholder="••••••••"
              secureTextEntry
              icon="lock"
            />

            <Input
              label="Confirmer mot de passe *"
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData({...formData, confirmPassword: text})}
              placeholder="••••••••"
              secureTextEntry
              icon="lock"
            />

            <Input
              label="Téléphone"
              value={formData.telephone}
              onChangeText={(text) => setFormData({...formData, telephone: text})}
              placeholder="+216 XX XXX XXX"
              keyboardType="phone-pad"
              icon="phone"
            />

            <Input
              label="Adresse"
              value={formData.adresse}
              onChangeText={(text) => setFormData({...formData, adresse: text})}
              placeholder="Votre adresse"
              icon="location-on"
            />

            <Button
              title="S'inscrire"
              onPress={handleRegister}
              loading={loading}
              style={styles.button}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  backButton: {
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  button: {
    marginTop: 20,
  },
});

export default RegisterScreen;