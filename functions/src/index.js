import { onRequest, onCall } from 'firebase-functions/v2/https';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { setGlobalOptions } from 'firebase-functions/v2';
import admin from 'firebase-admin';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Firebase Admin
admin.initializeApp();

// Set global options for all functions
setGlobalOptions({
  region: 'us-central1',
  maxInstances: 10,
});

// Import function handlers
import { sendWhatsAppMessage } from './whatsapp/sendWhatsAppMessage.js';
import { onLeadCreated } from './triggers/onLeadCreated.js';

// Export functions
export { sendWhatsAppMessage, onLeadCreated };

// Health check endpoint
export const healthCheck = onRequest(async (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'VizionRD Cloud Functions',
  });
});
