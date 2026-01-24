import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Generic CRUD operations
 */

// Get single document
export const getDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
    } else {
      return { success: false, error: 'Document not found' };
    }
  } catch (error) {
    console.error(`Error getting document from ${collectionName}:`, error);
    return { success: false, error: error.message };
  }
};

// Get all documents from a collection
export const getCollection = async (collectionName, constraints = []) => {
  try {
    const collectionRef = collection(db, collectionName);
    const q = constraints.length > 0 ? query(collectionRef, ...constraints) : collectionRef;
    
    const querySnapshot = await getDocs(q);
    const documents = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    return { success: true, data: documents };
  } catch (error) {
    console.error(`Error getting collection ${collectionName}:`, error);
    return { success: false, error: error.message };
  }
};

// Add document
export const addDocument = async (collectionName, data) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
    });
    
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error(`Error adding document to ${collectionName}:`, error);
    return { success: false, error: error.message };
  }
};

// Update document
export const updateDocument = async (collectionName, docId, data) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
    
    return { success: true };
  } catch (error) {
    console.error(`Error updating document in ${collectionName}:`, error);
    return { success: false, error: error.message };
  }
};

// Delete document
export const deleteDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    
    return { success: true };
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Carousel operations
 */

export const getCarouselSlides = async (activeOnly = true) => {
  // Ordenar por 'order' - si activeOnly, filtramos en cliente para evitar índice compuesto
  const constraints = [orderBy('order', 'asc')];
  
  const result = await getCollection('carousel_slides', constraints);
  
  // Filtrar en cliente si activeOnly
  if (activeOnly && result.success && result.data) {
    result.data = result.data.filter(slide => slide.active === true);
  }
  
  return result;
};

export const addCarouselSlide = async (slideData) => {
  return await addDocument('carousel_slides', slideData);
};

export const updateCarouselSlide = async (slideId, slideData) => {
  return await updateDocument('carousel_slides', slideId, slideData);
};

export const deleteCarouselSlide = async (slideId) => {
  return await deleteDocument('carousel_slides', slideId);
};

export const reorderCarouselSlides = async (orderMap) => {
  try {
    const batch = writeBatch(db);
    
    orderMap.forEach(({ id, order }) => {
      const docRef = doc(db, 'carousel_slides', id);
      batch.update(docRef, { order });
    });
    
    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error('Error reordering carousel slides:', error);
    return { success: false, error: error.message };
  }
};

export const getCarouselConfig = async () => {
  return await getDocument('carousel_config', 'main_carousel');
};

export const updateCarouselConfig = async (config) => {
  return await updateDocument('carousel_config', 'main_carousel', config);
};

/**
 * Products operations
 */

export const getProducts = async (activeOnly = true) => {
  // Obtener todos los productos sin ordenar en servidor
  // El ordenamiento puede fallar si el campo no existe en todos los docs
  const result = await getCollection('products', []);
  
  // Filtrar en cliente si activeOnly
  if (result.success && result.data) {
    if (activeOnly) {
      result.data = result.data.filter(product => product.active === true);
    }
    // Ordenar por createdAt en cliente (más reciente primero)
    result.data.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || a.createdAt || new Date(0);
      const dateB = b.createdAt?.toDate?.() || b.createdAt || new Date(0);
      return dateB - dateA;
    });
  }
  
  return result;
};

export const getProduct = async (productId) => {
  return await getDocument('products', productId);
};

export const addProduct = async (productData) => {
  return await addDocument('products', productData);
};

export const updateProduct = async (productId, productData) => {
  return await updateDocument('products', productId, productData);
};

export const deleteProduct = async (productId) => {
  return await deleteDocument('products', productId);
};

/**
 * Contact leads operations
 */

export const addContactLead = async (leadData) => {
  return await addDocument('contact_leads', {
    ...leadData,
    status: 'new',
    emailSent: false,
    whatsappSent: false,
    source: leadData.source || 'contact_form',
  });
};

export const getContactLeads = async (statusFilter = null) => {
  const constraints = [orderBy('createdAt', 'desc')];
  
  if (statusFilter) {
    constraints.unshift(where('status', '==', statusFilter));
  }
  
  return await getCollection('contact_leads', constraints);
};

export const updateLeadStatus = async (leadId, status, adminNotes = null) => {
  const updateData = { status };
  
  if (adminNotes !== null) {
    updateData.adminNotes = adminNotes;
  }
  
  return await updateDocument('contact_leads', leadId, updateData);
};

/**
 * Site content operations
 */

export const getSiteContent = async (contentId) => {
  return await getDocument('site_content', contentId);
};

export const updateSiteContent = async (contentId, content) => {
  return await updateDocument('site_content', contentId, content);
};

/**
 * Site settings operations
 */

export const getSiteSettings = async () => {
  return await getDocument('site_settings', 'main');
};

export const updateSiteSettings = async (settings) => {
  return await updateDocument('site_settings', 'main', settings);
};

/**
 * Batch operations
 */

export const batchUpdateOrder = async (collectionName, items) => {
  try {
    const batch = writeBatch(db);
    
    items.forEach((item, index) => {
      const docRef = doc(db, collectionName, item.id);
      batch.update(docRef, { order: index });
    });
    
    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error('Error in batch update:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Audit log
 */

export const createAuditLog = async (userId, action, resource, resourceId, changes = null) => {
  try {
    await addDoc(collection(db, 'audit_logs'), {
      userId,
      action,
      resource,
      resourceId,
      changes,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error creating audit log:', error);
  }
};
