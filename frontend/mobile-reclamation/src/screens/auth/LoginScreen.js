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

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    // 🔍 LOG DE DÉBOGAGE
    console.log('🔵 LoginScreen - Email:', email);
    console.log('🔵 LoginScreen - Password:', password ? 'Présent' : 'MANQUANT');
    console.log('🔵 LoginScreen - Longueur password:', password.length);

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Erreur de connexion', result.error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Icon name="assignment" size={80} color="#007AFF" />
            <Text style={styles.appName}>Gestion Réclamations</Text>
            <Text style={styles.subtitle}>Connectez-vous à votre compte</Text>
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

            <Input
              label="Mot de passe"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              icon="lock"
            />

            <Button
              title="Se connecter"
              onPress={handleLogin}
              loading={loading}
              style={styles.button}
            />

            <View style={styles.linksContainer}>
              <Text style={styles.linkText} onPress={() => navigation.navigate('ForgotPassword')}>
                Mot de passe oublié ?
              </Text>
            </View>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Pas encore de compte ? </Text>
              <Text 
                style={styles.registerLink}
                onPress={() => navigation.navigate('Register')}
              >
                S'inscrire
              </Text>
            </View>
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
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  form: {
    width: '100%',
  },
  button: {
    marginTop: 24,
  },
  linksContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  linkText: {
    color: '#007AFF',
    fontSize: 14,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  registerText: {
    color: '#666',
    fontSize: 14,
  },
  registerLink: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default LoginScreen;