import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthContextType, User } from '../types/auth';
import { saveUser, loadUser, removeUser } from '../storage/userStorage';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const storedUser = await loadUser();
      setUser(storedUser);
      setLoading(false);
    })();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    // For demo: accept any email/password, create a fake user
    const fakeUser: User = { id: Date.now().toString(), email, name: email.split('@')[0] };
    await saveUser(fakeUser);
    setUser(fakeUser);
    setLoading(false);
  };

  const signup = async (name: string, email: string, password: string) => {
    setLoading(true);
    // For demo: accept any signup, create a fake user
    const fakeUser: User = { id: Date.now().toString(), email, name };
    await saveUser(fakeUser);
    setUser(fakeUser);
    setLoading(false);
  };

  const logout = async () => {
    setLoading(true);
    await removeUser();
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}; 