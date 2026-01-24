/**
 * WhatsApp Service - Frontend Integration
 * Calls Cloud Function to send WhatsApp messages via Meta Cloud API
 */

import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

// Rate limiting configuration
const RATE_LIMIT_KEY = 'vizionrd_whatsapp_rate_limit';
const MAX_MESSAGES_PER_HOUR = 2;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

/**
 * Check rate limit from localStorage
 * @returns {Object} Rate limit status
 */
const checkRateLimit = () => {
  try {
    const stored = localStorage.getItem(RATE_LIMIT_KEY);
    if (!stored) {
      return { allowed: true, remaining: MAX_MESSAGES_PER_HOUR };
    }

    const data = JSON.parse(stored);
    const now = Date.now();
    
    // Filter out old entries
    const recentAttempts = data.attempts.filter(
      timestamp => now - timestamp < RATE_LIMIT_WINDOW
    );

    const remaining = MAX_MESSAGES_PER_HOUR - recentAttempts.length;
    const allowed = remaining > 0;

    let retryAfter = null;
    if (!allowed && recentAttempts.length > 0) {
      const oldestAttempt = Math.min(...recentAttempts);
      retryAfter = Math.ceil((oldestAttempt + RATE_LIMIT_WINDOW - now) / 60000);
    }

    return { allowed, remaining: Math.max(0, remaining), retryAfter };
  } catch (error) {
    return { allowed: true, remaining: MAX_MESSAGES_PER_HOUR };
  }
};

/**
 * Record a rate limit attempt
 */
const recordAttempt = () => {
  try {
    const stored = localStorage.getItem(RATE_LIMIT_KEY);
    const data = stored ? JSON.parse(stored) : { attempts: [] };
    const now = Date.now();
    
    data.attempts = data.attempts.filter(
      timestamp => now - timestamp < RATE_LIMIT_WINDOW
    );
    data.attempts.push(now);
    
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error recording rate limit:', error);
  }
};

/**
 * Send WhatsApp message via Cloud Function
 * @param {Object} data - Message data
 * @param {string} data.leadId - Firestore lead document ID
 * @param {string} data.name - Contact name
 * @param {string} data.phone - Contact phone
 * @param {string} data.email - Contact email
 * @param {string} data.message - Contact message
 * @param {string} data.productInterest - Product of interest (optional)
 * @returns {Promise<Object>} Send result
 */
export const sendWhatsAppMessage = async (data) => {
  try {
    // Check local rate limit first
    const rateLimit = checkRateLimit();
    if (!rateLimit.allowed) {
      return {
        success: false,
        error: `Límite de mensajes excedido. Intenta en ${rateLimit.retryAfter} minutos.`,
        rateLimited: true,
        retryAfter: rateLimit.retryAfter
      };
    }

    // Validate required fields
    if (!data.leadId || !data.name || !data.phone || !data.message) {
      return {
        success: false,
        error: 'Faltan campos requeridos para enviar el mensaje'
      };
    }

    // Call the Cloud Function
    const sendWhatsApp = httpsCallable(functions, 'sendWhatsAppMessage');
    const result = await sendWhatsApp({
      leadId: data.leadId,
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email?.trim() || '',
      message: data.message.trim(),
      productInterest: data.productInterest || ''
    });

    // Record successful attempt
    recordAttempt();

    return {
      success: true,
      data: result.data,
      remaining: checkRateLimit().remaining
    };
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    
    // Parse Firebase Functions error
    let errorMessage = 'Error al enviar mensaje de WhatsApp';
    
    if (error.code === 'functions/resource-exhausted') {
      return {
        success: false,
        error: 'Has excedido el límite de mensajes. Intenta más tarde.',
        rateLimited: true
      };
    } else if (error.code === 'functions/failed-precondition') {
      errorMessage = 'El servicio de WhatsApp no está configurado';
    } else if (error.code === 'functions/invalid-argument') {
      errorMessage = 'Datos del formulario inválidos';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
      details: error
    };
  }
};

/**
 * Generate WhatsApp Web URL for manual messaging
 * @param {string} phone - Phone number
 * @param {string} message - Pre-filled message
 * @returns {string} WhatsApp Web URL
 */
export const generateWhatsAppUrl = (phone, message = '') => {
  // Clean phone number
  let cleanPhone = phone.replace(/\D/g, '');
  
  // Add country code if not present (Dominican Republic)
  if (cleanPhone.length === 10) {
    cleanPhone = '1' + cleanPhone;
  }
  
  // URL encode the message
  const encodedMessage = encodeURIComponent(message);
  
  return `https://wa.me/${cleanPhone}${message ? `?text=${encodedMessage}` : ''}`;
};

/**
 * Open WhatsApp Web with pre-filled message
 * @param {string} phone - Phone number
 * @param {string} message - Pre-filled message
 */
export const openWhatsApp = (phone, message = '') => {
  const url = generateWhatsAppUrl(phone, message);
  window.open(url, '_blank', 'noopener,noreferrer');
};

/**
 * Generate contact message template
 * @param {Object} contact - Contact info
 * @returns {string} Formatted message
 */
export const generateContactMessage = (contact) => {
  return `🚗 *Nuevo Contacto - VizionRD*

👤 *Nombre:* ${contact.name}
📧 *Email:* ${contact.email}
📱 *Teléfono:* ${contact.phone}
${contact.productInterest ? `🛒 *Producto:* ${contact.productInterest}\n` : ''}
💬 *Mensaje:*
${contact.message}

---
_Recibido desde el sitio web_`;
};

/**
 * Get rate limit info
 * @returns {Object} Rate limit status
 */
export const getRateLimitInfo = () => {
  return checkRateLimit();
};

/**
 * Reset rate limit (for testing/admin)
 */
export const resetRateLimit = () => {
  localStorage.removeItem(RATE_LIMIT_KEY);
};

/**
 * Format phone for WhatsApp
 * @param {string} phone - Raw phone number
 * @returns {string} Formatted phone
 */
export const formatPhoneForWhatsApp = (phone) => {
  let cleaned = phone.replace(/\D/g, '');
  
  // Add country code if needed (Dominican Republic = +1)
  if (cleaned.length === 10) {
    cleaned = '1' + cleaned;
  }
  
  return '+' + cleaned;
};

/**
 * Validate phone can receive WhatsApp
 * @param {string} phone - Phone number
 * @returns {boolean} Is valid WhatsApp number
 */
export const isValidWhatsAppNumber = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  // Valid if 10-15 digits (international standard)
  return cleaned.length >= 10 && cleaned.length <= 15;
};

export default {
  sendWhatsAppMessage,
  generateWhatsAppUrl,
  openWhatsApp,
  generateContactMessage,
  getRateLimitInfo,
  resetRateLimit,
  formatPhoneForWhatsApp,
  isValidWhatsAppNumber
};
