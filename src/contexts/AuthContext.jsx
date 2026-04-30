import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut 
} from 'firebase/auth';
import { auth, googleProvider } from '../utils/firebase';
import { syncUserData, saveToCloud } from '../utils/dataSync';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Sync data when user is detected (on page reload, etc.)
        try {
          setSyncing(true);
          await syncUserData(firebaseUser.uid);
        } catch (error) {
          console.error('Sync error on auth state change:', error);
        } finally {
          setSyncing(false);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Auto-save to cloud periodically (every 60 seconds) when user is logged in
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      try {
        await saveToCloud(user.uid);
      } catch (error) {
        console.error('Auto-save error:', error);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [user]);

  // Save to cloud before page unload
  useEffect(() => {
    if (!user) return;

    const handleBeforeUnload = () => {
      // Use sendBeacon for reliable save on page close
      saveToCloud(user.uid).catch(() => {});
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [user]);

  const loginWithGoogle = async () => {
    try {
      setSyncing(true);
      const result = await signInWithPopup(auth, googleProvider);
      // After login, sync data (merge local + cloud)
      await syncUserData(result.user.uid);
      return result.user;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    } finally {
      setSyncing(false);
    }
  };

  const logout = async () => {
    try {
      // Save current data to cloud before logging out
      if (user) {
        await saveToCloud(user.uid);
      }
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    syncing,
    loginWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
