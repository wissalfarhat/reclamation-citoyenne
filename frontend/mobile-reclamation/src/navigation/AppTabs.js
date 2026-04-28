import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Écrans
import HomeScreen from '../screens/home/HomeScreen';
import ReclamationsListScreen from '../screens/reclamations/ReclamationsListScreen';
import CreateReclamationScreen from '../screens/reclamations/CreateReclamationScreen';
import ReclamationDetailScreen from '../screens/reclamations/ReclamationDetailScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="HomeMain" 
      component={HomeScreen} 
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="Notifications" 
      component={NotificationsScreen} 
      options={{ title: 'Notifications' }}
    />
    <Stack.Screen 
      name="ReclamationDetail" 
      component={ReclamationDetailScreen} 
      options={{ title: 'Détail' }}
    />
  </Stack.Navigator>
);

const ReclamationsStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="ReclamationsList" 
      component={ReclamationsListScreen} 
      options={{ title: 'Mes réclamations' }}
    />
    <Stack.Screen 
      name="ReclamationDetail" 
      component={ReclamationDetailScreen} 
      options={{ title: 'Détail' }}
    />
  </Stack.Navigator>
);

const AppTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Accueil') {
            iconName = focused ? 'home' : 'home';
          } else if (route.name === 'Mes réclamations') {
            iconName = focused ? 'list' : 'list';
          } else if (route.name === 'Nouvelle') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Profil') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Accueil" component={HomeStack} />
      <Tab.Screen name="Mes réclamations" component={ReclamationsStack} />
      <Tab.Screen name="Nouvelle" component={CreateReclamationScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default AppTabs;