/**
 * Shared Firestore Service
 * Compatible con Web (Vite) y Mobile (React Native/Expo)
 * Importar `db` desde el firebase.js de cada plataforma.
 */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';

/**
 * CRUD genérico
 * Requiere que se pase la instancia `db` de Firebase
 */

export const createFirestoreService = (db) => {
  const getDocument = async (collectionName, docId) => {
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
      }
      return { success: false, error: 'Document not found' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const getCollection = async (collectionName, constraints = []) => {
    try {
      const ref = collection(db, collectionName);
      const q = constraints.length > 0 ? query(ref, ...constraints) : ref;
      const snap = await getDocs(q);
      const documents = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      return { success: true, data: documents };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const addDocument = async (collectionName, data) => {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateDocument = async (collectionName, docId, data) => {
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const deleteDocument = async (collectionName, docId) => {
    try {
      await deleteDoc(doc(db, collectionName, docId));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // ---- Products ----
  const getProducts = async (activeOnly = true) => {
    const result = await getCollection('products', []);
    if (result.success && result.data) {
      if (activeOnly) {
        result.data = result.data.filter(p => p.active === true);
      }
      result.data.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || a.createdAt || new Date(0);
        const dateB = b.createdAt?.toDate?.() || b.createdAt || new Date(0);
        return dateB - dateA;
      });
    }
    return result;
  };

  const getProduct = (productId) => getDocument('products', productId);
  const addProduct = (data) => addDocument('products', data);
  const updateProduct = (id, data) => updateDocument('products', id, data);
  const deleteProduct = (id) => deleteDocument('products', id);

  // ---- Contact Leads ----
  const addContactLead = (data) =>
    addDocument('contact_leads', {
      ...data,
      status: 'new',
      emailSent: false,
      whatsappSent: false,
      source: data.source || 'contact_form',
    });

  // ---- Site Settings ----
  const getSiteSettings = () => getDocument('site_settings', 'main');
  const getSiteContent = (contentId) => getDocument('site_content', contentId);

  // ---- Carousel ----
  const getCarouselSlides = async (activeOnly = true) => {
    const result = await getCollection('carousel_slides', [orderBy('order', 'asc')]);
    if (activeOnly && result.success && result.data) {
      result.data = result.data.filter(s => s.active === true);
    }
    return result;
  };

  return {
    getDocument, getCollection, addDocument, updateDocument, deleteDocument,
    getProducts, getProduct, addProduct, updateProduct, deleteProduct,
    addContactLead, getSiteSettings, getSiteContent, getCarouselSlides,
  };
};
