import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import SignUpScreen from '../screens/SignUpScreen';
import LoginScreen from '../screens/LoginScreen';
import InfoScreen from '../screens/InfoScreen';
import AirportsScreen from '../screens/AirportsScreen';
import FlightsScreen from '../screens/FlightsScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';

export type RootTabParamList = {
  Airports: undefined;
  Flights: undefined;
  Info: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const AuthStack = createBottomTabNavigator();

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="SignUp" component={SignUpScreen} />
    <AuthStack.Screen name="Login" component={LoginScreen} />
  </AuthStack.Navigator>
);

const MainNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ color, size }) => {
        let iconName = 'airplane-outline';
        if (route.name === 'Info') iconName = 'person-circle-outline';
        if (route.name === 'Flights') iconName = 'search-outline';
        return <Ionicons name={iconName} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Airports" component={AirportsScreen} />
    <Tab.Screen name="Flights" component={FlightsScreen} />
    <Tab.Screen name="Info" component={InfoScreen} />
  </Tab.Navigator>
);

const RootNavigator = () => {
  const { user, loading } = useSelector((state: RootState) => state.auth);
  if (loading) return null;
  return <MainNavigator />
};

export default RootNavigator; 