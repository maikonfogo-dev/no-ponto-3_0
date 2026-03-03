import React, { createContext, useState, useContext, useEffect } from 'react';
import { api, setAuthToken } from '../services/api';
import { useRouter, useSegments } from 'expo-router';

interface AuthContextData {
  signIn: (email: string, pass: string) => Promise<void>;
  signOut: () => void;
  user: any | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  // Load token from storage on mount (Mock for now, should use AsyncStorage)
  useEffect(() => {
     // TODO: Load token from AsyncStorage
     setLoading(false);
  }, []);


  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // Redirect based on role
      if (user.role === 'manager') {
        router.replace('/(app)/manager');
      } else {
        router.replace('/(app)/home');
      }
    }
  }, [user, loading, segments]);

  const signIn = async (email: string, pass: string) => {
    try {
      const response = await api.post('/auth/login', { email, password: pass });
      const { access_token, user } = response.data;
      
      setAuthToken(access_token);
      setUser(user);
    } catch (error) {
      console.error(error);
      throw new Error('Falha no login');
    }
  };

  const signOut = () => {
    setAuthToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ signIn, signOut, user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
