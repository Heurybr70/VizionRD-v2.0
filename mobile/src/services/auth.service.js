import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth } from './firebase';

const getAuthErrorMessage = (code) => {
  const messages = {
    'auth/email-already-in-use': 'Este correo ya estÃ¡ en uso.',
    'auth/invalid-credential': 'Credenciales invÃ¡lidas.',
    'auth/invalid-email': 'Correo electrÃ³nico invÃ¡lido.',
    'auth/missing-password': 'Debes introducir una contraseÃ±a.',
    'auth/network-request-failed': 'Error de conexiÃ³n. Verifica tu internet.',
    'auth/too-many-requests': 'Demasiados intentos. Intenta mÃ¡s tarde.',
    'auth/user-disabled': 'Esta cuenta fue deshabilitada.',
    'auth/user-not-found': 'No se encontrÃ³ una cuenta con este correo.',
    'auth/weak-password': 'La contraseÃ±a debe tener al menos 6 caracteres.',
    'auth/wrong-password': 'ContraseÃ±a incorrecta.',
  };

  return messages[code] || 'OcurriÃ³ un error de autenticaciÃ³n.';
};

export const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: getAuthErrorMessage(error.code) };
  }
};

export const registerWithEmail = async ({ name, email, password }) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    if (name?.trim()) {
      await updateProfile(userCredential.user, { displayName: name.trim() });
    }

    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: getAuthErrorMessage(error.code) };
  }
};

export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    return { success: false, error: getAuthErrorMessage(error.code) };
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message || 'No se pudo cerrar sesiÃ³n.' };
  }
};

export const onAuthChange = (callback) => onAuthStateChanged(auth, callback);

export const getCurrentUser = () => auth.currentUser;
