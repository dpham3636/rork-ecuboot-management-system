import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AUTH_STORAGE_KEY = '@auth_user';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Load user from storage on app start
  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      console.error('Error loading stored user:', error);
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('useAuth login called with:', { email, password: '***' });
    try {
      // Simulate API call - replace with your actual authentication logic
      if (email && password.length >= 6) {
        console.log('Login validation passed, creating user');
        const user: User = {
          id: Date.now().toString(),
          email,
          name: email.split('@')[0],
        };

        console.log('Saving user to AsyncStorage');
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
        
        console.log('Updating auth state');
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true,
        });
        console.log('Login completed successfully');
        
        // Navigate to dashboard after successful login
        setTimeout(() => {
          router.replace('/(tabs)/dashboard');
        }, 100);
        
        return true;
      }
      console.log('Login validation failed');
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    console.log('useAuth signup called with:', { email, password: '***', name });
    try {
      // Simulate API call - replace with your actual registration logic
      if (email && password.length >= 6 && name) {
        console.log('Creating user object');
        const user: User = {
          id: Date.now().toString(),
          email,
          name,
        };

        console.log('Saving user to AsyncStorage');
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
        
        console.log('Updating auth state');
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true,
        });
        console.log('Signup completed successfully');
        
        // Navigate to dashboard after successful signup
        setTimeout(() => {
          router.replace('/(tabs)/dashboard');
        }, 100);
        
        return true;
      }
      console.log('Signup validation failed');
      return false;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log('Logging out user...');
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
      console.log('User logged out successfully');
      
      // Navigate to login screen after logout
      setTimeout(() => {
        router.replace('/login');
      }, 100);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const actions: AuthActions = {
    login,
    signup,
    logout,
  };

  return {
    ...authState,
    ...actions,
  };
});