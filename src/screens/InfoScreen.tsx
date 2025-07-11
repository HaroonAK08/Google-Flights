import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Pressable,
  Image,
} from 'react-native';
import { MotiView, MotiText, AnimatePresence } from 'moti';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { updateName, updatePassword, logout } from '../store/authSlice';
import { colors } from '../theme';

const AVATAR_URL =
  'https://api.dicebear.com/7.x/initials/svg?seed=User&backgroundColor=1967D2,FFB300&radius=50';

const InfoScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading } = useSelector((state: RootState) => state.auth);
  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleNameChange = async () => {
    setError('');
    setSuccess('');
    if (!name) {
      setError('Name cannot be empty');
      return;
    }
    try {
      await dispatch(updateName(name)).unwrap();
      setSuccess('Name updated!');
    } catch (e: any) {
      setError(e.message || 'Failed to update name');
    }
  };

  const handlePasswordChange = async () => {
    setError('');
    setSuccess('');
    if (!password) {
      setError('Password cannot be empty');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      await dispatch(updatePassword(password)).unwrap();
      setSuccess('Password changed! You have been logged out.');
    } catch (e: any) {
      setError(e.message || 'Failed to update password');
    }
  };

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text>No user info available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MotiView
        from={{ opacity: 0, translateY: 40 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 600 }}
        style={styles.card}
      >
        <MotiView
          from={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', delay: 200 }}
          style={styles.avatarWrap}
        >
          <Image source={{ uri: AVATAR_URL }} style={styles.avatar} />
        </MotiView>
        <MotiText
          style={styles.title}
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 300 }}
        >
          Account Info
        </MotiText>
        <View style={styles.section}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user.email}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Name"
            autoCapitalize="words"
            editable={!loading}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={handleNameChange}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Update Name</Text>
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Change Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="New Password"
            secureTextEntry
            editable={!loading}
          />
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm New Password"
            secureTextEntry
            editable={!loading}
          />
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.accent }]}
            onPress={handlePasswordChange}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Update Password</Text>
            )}
          </TouchableOpacity>
        </View>
        <AnimatePresence>
          {error ? (
            <MotiText
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, translateY: 10 }}
              style={styles.error}
              key="error"
            >
              {error}
            </MotiText>
          ) : null}
          {success ? (
            <MotiText
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, translateY: 10 }}
              style={styles.success}
              key="success"
            >
              {success}
            </MotiText>
          ) : null}
        </AnimatePresence>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => setShowLogoutModal(true)}
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </MotiView>
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Log Out?</Text>
            <Text style={styles.modalText}>
              Are you sure you want to log out?
            </Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 16,
              }}
            >
              <Pressable
                style={[
                  styles.modalBtn,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderWidth: 1,
                  },
                ]}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={{ color: colors.text, fontWeight: 'bold' }}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                style={[styles.modalBtn, { backgroundColor: colors.error }]}
                onPress={() => {
                  setShowLogoutModal(false);
                  dispatch(logout());
                }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                  Log Out
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  avatarWrap: {
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
    borderRadius: 60,
    backgroundColor: colors.background,
    padding: 4,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 18,
    textAlign: 'center',
  },
  section: {
    width: '100%',
    marginBottom: 18,
  },
  label: {
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: 4,
    fontSize: 15,
  },
  value: {
    fontSize: 16,
    marginBottom: 8,
    color: colors.text,
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  input: {
    width: '100%',
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 6,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },
  error: {
    color: colors.error,
    marginBottom: 8,
    fontSize: 15,
    textAlign: 'center',
  },
  success: {
    color: colors.success,
    marginBottom: 8,
    fontSize: 15,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  logoutButton: {
    marginTop: 18,
    padding: 12,
  },
  logoutText: {
    color: colors.error,
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 28,
    width: 300,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default InfoScreen;
