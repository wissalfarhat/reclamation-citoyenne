import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import AuthStack from './AuthStack';
import AppTabs from './AppTabs';
import Loading from '../components/Loading';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="AppTabs" component={AppTabs} />
      ) : (
        <Stack.Screen name="AuthStack" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;