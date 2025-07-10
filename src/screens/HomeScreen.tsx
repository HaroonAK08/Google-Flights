import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { logout } from '../store/authSlice';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme';

const HomeScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {user?.name || 'Traveler'}!</Text>
      <Text style={styles.subtitle}>Ready to search for flights and explore the world?</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Info' as never)}>
        <Text style={styles.buttonText}>Account Info</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => dispatch(logout())}>
        <Text style={styles.buttonText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: 32,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default HomeScreen; 