import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

const googleProvider = new GoogleAuthProvider();

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update last login
    await updateUserLastLogin(user.uid);

    return { success: true, user };
  } catch (error) {
    console.error('Error signing in:', error);
    return { success: false, error: getAuthErrorMessage(error.code) };
  }
};

/**
 * Sign in with Google
 */
export const signInWithGoogle = async () => {
  try {
    const userCredential = await signInWithPopup(auth, googleProvider);
    const user = userCredential.user;

    // Check if user document exists, if not create it
    await ensureUserDocument(user);

    // Update last login
    await updateUserLastLogin(user.uid);

    return { success: true, user };
  } catch (error) {
    console.error('Error signing in with Google:', error);
    
    // Handle specific popup errors
    if (error.code === 'auth/popup-closed-by-user') {
      return { success: false, error: 'Ventana de inicio de sesión cerrada' };
    }
    
    return { success: false, error: getAuthErrorMessage(error.code) };
  }
};

/**
 * Sign out
 */
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Error signing out:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send password reset email
 */
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    console.error('Error sending password reset:', error);
    return { success: false, error: getAuthErrorMessage(error.code) };
  }
};

/**
 * Get current user with role
 */
export const getCurrentUserWithRole = async () => {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      console.warn('User document not found in Firestore');
      return {
        ...user,
        role: null,
        permissions: {},
      };
    }

    return {
      ...user,
      ...userDoc.data(),
    };
  } catch (error) {
    console.error('Error getting user role:', error);
    return {
      ...user,
      role: null,
      permissions: {},
    };
  }
};

/**
 * Check if user is admin
 */
export const isUserAdmin = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) return false;
    
    const userData = userDoc.data();
    return userData.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

/**
 * Check if user is editor or admin
 */
export const isUserEditor = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) return false;
    
    const userData = userDoc.data();
    return ['admin', 'editor'].includes(userData.role);
  } catch (error) {
    console.error('Error checking editor status:', error);
    return false;
  }
};

/**
 * Listen to auth state changes
 */
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userWithRole = await getCurrentUserWithRole();
      callback(userWithRole);
    } else {
      callback(null);
    }
  });
};

/**
 * Ensure user document exists in Firestore
 */
const ensureUserDocument = async (user) => {
  const userRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    // Create user document with default values
    await setDoc(userRef, {
      email: user.email,
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      role: 'viewer', // Default role
      permissions: {
        manageCarousel: false,
        manageProducts: false,
        manageLeads: false,
        manageSiteContent: false,
        manageUsers: false,
      },
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    });
  }
};

/**
 * Update user last login timestamp
 */
const updateUserLastLogin = async (uid) => {
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(
      userRef,
      {
        lastLogin: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error updating last login:', error);
  }
};

/**
 * Get user-friendly error messages
 */
const getAuthErrorMessage = (errorCode) => {
  const errorMessages = {
    'auth/invalid-email': 'Correo electrónico inválido',
    'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
    'auth/user-not-found': 'Usuario no encontrado',
    'auth/wrong-password': 'Contraseña incorrecta',
    'auth/email-already-in-use': 'Este correo ya está en uso',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
    'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
    'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
    'auth/popup-blocked': 'Popup bloqueado. Permite popups para este sitio',
    'auth/cancelled-popup-request': 'Popup cancelado',
    'auth/popup-closed-by-user': 'Ventana cerrada antes de completar',
  };

  return errorMessages[errorCode] || 'Error al iniciar sesión';
};

/**
 * Update user profile
 */
export const updateUserProfile = async (displayName, photoURL) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');

    await updateProfile(user, {
      displayName,
      photoURL,
    });

    // Also update in Firestore
    const userRef = doc(db, 'users', user.uid);
    await setDoc(
      userRef,
      {
        displayName,
        photoURL,
      },
      { merge: true }
    );

    return { success: true };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { success: false, error: error.message };
  }
};
