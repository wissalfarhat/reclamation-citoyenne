import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'react-native';
import Toast from 'react-native-toast-message';

export default function App() {
  return (
    <AuthProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
      <Toast />
    </AuthProvider>
  );
}