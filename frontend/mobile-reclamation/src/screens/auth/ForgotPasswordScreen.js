import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,  // ✅ Added
} from 'react-native';
import { authAPI } from '../../api/auth';  // ✅ Use API directly
import Input from '../../components/Input';
import Button from '../../components/Button';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      Alert.alert('Erreur', 'Veuillez saisir votre email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Erreur', 'Veuillez saisir un email valide');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.forgotPassword(email);
      if (response.success) {
        setEmailSent(true);
      } else {
        Alert.alert('Erreur', response.message || 'Email non trouvé');
      }
    } catch (error) {
      Alert.alert('Erreur', error.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Icon name="check-circle" size={70} color="#4CAF50" />
          </View>
          <Text style={styles.successTitle}>Email envoyé !</Text>
          <Text style={styles.successText}>
            Un email de réinitialisation a été envoyé à{'\n'}
            <Text style={styles.emailHighlight}>{email}</Text>
          </Text>
          <Text style={styles.successHint}>
            Vérifiez votre boîte de réception et vos spams
          </Text>
          <Button
            title="Retour à la connexion"
            onPress={() => navigation.navigate('Login')}
            style={styles.button}
          />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>

        {/* ✅ Back button */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Icon name="lock-reset" size={40} color="#007AFF" />
          </View>
          <Text style={styles.title}>Mot de passe oublié ?</Text>
          <Text style={styles.subtitle}>
            Saisissez votre email pour recevoir un lien de réinitialisation
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="votre@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            icon="email"
          />

          <Button
            title={loading ? 'Envoi en cours...' : 'Envoyer'}
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            style={styles.button}
          />

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backToLogin}
          >
            <Text style={styles.backToLoginText}>
              Retour à la connexion
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#fff' },
  content:          { flex: 1, paddingHorizontal: 24, paddingTop: 40 },
  backButton:       { marginBottom: 20, alignSelf: 'flex-start', padding: 4 },
  header:           { alignItems: 'center', marginBottom: 40 },
  iconContainer:    { width: 80, height: 80, borderRadius: 40, backgroundColor: '#007AFF15', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title:            { fontSize: 24, fontWeight: 'bold', color: '#333', textAlign: 'center' },
  subtitle:         { fontSize: 15, color: '#666', textAlign: 'center', marginTop: 10, paddingHorizontal: 20, lineHeight: 22 },
  form:             { width: '100%' },
  button:           { marginTop: 24 },
  backToLogin:      { alignItems: 'center', marginTop: 16 },
  backToLoginText:  { color: '#007AFF', fontSize: 14 },
  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  successIcon:      { marginBottom: 20 },
  successTitle:     { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  successText:      { fontSize: 15, color: '#666', textAlign: 'center', marginBottom: 8, lineHeight: 22 },
  emailHighlight:   { color: '#007AFF', fontWeight: '600' },
  successHint:      { fontSize: 13, color: '#999', textAlign: 'center', marginBottom: 30 },
});

export default ForgotPasswordScreen;