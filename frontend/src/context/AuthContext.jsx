import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthChange } from '../services/auth.service';

const AuthContext = createContext();

// DEV MODE: Set to false to use real Firebase authentication
// Set to true only for testing UI without Firebase
const DEV_MODE_BYPASS_AUTH = false;

// Mock user for development
const DEV_USER = {
  uid: 'dev-admin-user',
  email: 'admin@vizionrd.com',
  displayName: 'Admin VizionRD',
  role: 'admin',
  permissions: {
    manageProducts: true,
    manageCarousel: true,
    manageLeads: true,
    manageContent: true,
    manageSettings: true,
  }
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(DEV_MODE_BYPASS_AUTH ? DEV_USER : null);
  const [loading, setLoading] = useState(!DEV_MODE_BYPASS_AUTH);

  useEffect(() => {
    // Skip Firebase auth listener in dev mode
    if (DEV_MODE_BYPASS_AUTH) {
      console.log('🔓 DEV MODE: Authentication bypassed. Using mock admin user.');
      return;
    }

    const unsubscribe = onAuthChange((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const isEditor = () => {
    return user?.role === 'admin' || user?.role === 'editor';
  };

  const hasPermission = (permission) => {
    return user?.permissions?.[permission] === true;
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin,
    isEditor,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
