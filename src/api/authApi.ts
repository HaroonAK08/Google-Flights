import { auth } from './firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  updatePassword,
} from 'firebase/auth';

export const loginApi = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const signupApi = async (name: string, email: string, password: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  if (auth.currentUser) {
    await updateProfile(auth.currentUser, { displayName: name });
  }
  return userCredential.user;
};

export const logoutApi = async () => {
  await signOut(auth);
};

export const updateNameApi = async (name: string) => {
  if (!auth.currentUser) throw new Error('No user');
  await updateProfile(auth.currentUser, { displayName: name });
};

export const updatePasswordApi = async (password: string) => {
  if (!auth.currentUser) throw new Error('No user');
  await updatePassword(auth.currentUser, password);
}; 