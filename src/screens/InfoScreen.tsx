import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { updateName, updatePassword, logout } from '../store/authSlice';
import { colors } from '../theme';

const InfoScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading } = useSelector((state: RootState) => state.auth);
  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleNameChange = async () => {
    setError('');
    if (!name) {
      setError('Name cannot be empty');
      return;
    }
    try {
      await dispatch(updateName(name)).unwrap();
      Alert.alert('Success', 'Name updated');
    } catch (e: any) {
      setError(e.message || 'Failed to update name');
    }
  };

  const handlePasswordChange = async () => {
    setError('');
    if (!password) {
      setError('Password cannot be empty');
      return;
    }
    try {
      await dispatch(updatePassword(password)).unwrap();
      Alert.alert('Password Changed', 'You have been logged out. Please log in again.');
    } catch (e: any) {
      setError(e.message || 'Failed to update password');
    }
  };

  if (!user) {
    return (
      <View style={styles.centered}><Text>No user info available.</Text></View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account Info</Text>
      <Text style={styles.label}>Email</Text>
      <Text style={styles.value}>{user.email}</Text>
      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Name"
      />
      <TouchableOpacity style={styles.button} onPress={handleNameChange} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Update Name</Text>}
      </TouchableOpacity>
      <Text style={styles.label}>Change Password</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="New Password"
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handlePasswordChange} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Update Password</Text>}
      </TouchableOpacity>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.logoutButton} onPress={() => dispatch(logout())}>
        <Text style={styles.logoutText}>Log Out</Text>
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
    marginBottom: 24,
  },
  label: {
    alignSelf: 'flex-start',
    color: colors.primary,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
    fontSize: 16,
  },
  value: {
    alignSelf: 'flex-start',
    fontSize: 16,
    marginBottom: 8,
    color: colors.text,
  },
  input: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 14,
  },
  button: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  error: {
    color: colors.error,
    marginBottom: 8,
    fontSize: 15,
  },
  logoutButton: {
    marginTop: 24,
    padding: 12,
  },
  logoutText: {
    color: colors.error,
    fontWeight: 'bold',
    fontSize: 16,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default InfoScreen; 