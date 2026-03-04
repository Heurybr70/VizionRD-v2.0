/**
 * Firestore service mobile — usa el servicio compartido con la instancia `db` de esta plataforma
 */
import { db } from './firebase';
import { createFirestoreService } from '@shared/services/firestore.service';

const firestoreService = createFirestoreService(db);

export const {
  getDocument,
  getCollection,
  addDocument,
  updateDocument,
  deleteDocument,
  getProducts,
  getProduct,
  addProduct,
  updateProduct,
  deleteProduct,
  addContactLead,
  getSiteSettings,
  getSiteContent,
  getCarouselSlides,
} = firestoreService;
