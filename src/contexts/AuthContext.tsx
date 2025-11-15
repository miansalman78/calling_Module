import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus } from 'react-native';
import { onUserLogin, onUserLogout } from '../../index';
import { createOrUpdateUserProfile, setUserOnlineStatus, initializeUserPresence } from '../utils/usersService';

interface AuthContextType {
  user: FirebaseAuthTypes.User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = auth().onAuthStateChanged(async (authUser) => {
      setUser(authUser);
      setLoading(false);
      
      // Store user info locally and initialize services
      if (authUser) {
        await AsyncStorage.setItem('userId', authUser.uid);
        await AsyncStorage.setItem('userEmail', authUser.email || '');
        await AsyncStorage.setItem('userName', authUser.displayName || '');
        
        // Create/update user profile in Firestore
        try {
          const userName = authUser.displayName || authUser.email?.split('@')[0] || 'User';
          await createOrUpdateUserProfile(
            authUser.uid,
            userName,
            authUser.email || ''
          );
          console.log('User profile saved to Firestore');
        } catch (error) {
          console.error('Failed to save user profile:', error);
        }
        
        // Initialize user presence
        try {
          initializeUserPresence(authUser.uid);
          console.log('User presence initialized');
        } catch (error) {
          console.error('Failed to initialize presence:', error);
        }
        
        // Initialize Zego call service
        try {
          const userName = authUser.displayName || authUser.email?.split('@')[0] || 'User';
          await onUserLogin(authUser.uid, userName);
          console.log('Zego service initialized for user:', userName);
        } catch (error) {
          console.error('Failed to initialize Zego service:', error);
        }
      } else {
        await AsyncStorage.multiRemove(['userId', 'userEmail', 'userName']);
        
        // Uninitialize Zego call service
        try {
          await onUserLogout();
          console.log('Zego service uninitialized');
        } catch (error) {
          console.error('Failed to uninitialize Zego service:', error);
        }
      }
    });

    return unsubscribe;
  }, []);

  // Handle app state changes for user presence
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (user) {
        if (nextAppState === 'active') {
          // App came to foreground - set user online
          setUserOnlineStatus(user.uid, true);
        } else if (nextAppState === 'background' || nextAppState === 'inactive') {
          // App went to background - set user offline
          setUserOnlineStatus(user.uid, false);
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [user]);

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      await auth().signInWithEmailAndPassword(email, password);
    } catch (err: any) {
      let errorMessage = 'Failed to sign in';
      
      switch (err.code) {
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'Invalid email or password';
          break;
        default:
          errorMessage = err.message || 'Failed to sign in';
      }
      
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      setError(null);
      setLoading(true);
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      
      // Update display name
      if (userCredential.user && displayName) {
        await userCredential.user.updateProfile({
          displayName: displayName,
        });
      }
    } catch (err: any) {
      let errorMessage = 'Failed to create account';
      
      switch (err.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak (minimum 6 characters)';
          break;
        default:
          errorMessage = err.message || 'Failed to create account';
      }
      
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      setLoading(true);
      
      // Set user offline before signing out
      if (user) {
        await setUserOnlineStatus(user.uid, false);
      }
      
      await auth().signOut();
    } catch (err: any) {
      setError(err.message || 'Failed to sign out');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

