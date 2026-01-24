/**
 * Email Service - EmailJS Integration
 * Handles sending contact form emails
 */

import emailjs from '@emailjs/browser';

// EmailJS Configuration (from environment variables)
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

// Rate limiting configuration
const RATE_LIMIT_KEY = 'vizionrd_email_rate_limit';
const MAX_EMAILS_PER_HOUR = 3;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Initialize EmailJS with public key
 */
export const initEmailJS = () => {
  if (PUBLIC_KEY) {
    emailjs.init(PUBLIC_KEY);
    return true;
  }
  console.warn('EmailJS public key not configured');
  return false;
};

/**
 * Check rate limit from localStorage
 * @returns {Object} Rate limit status
 */
const checkRateLimit = () => {
  try {
    const stored = localStorage.getItem(RATE_LIMIT_KEY);
    if (!stored) {
      return { allowed: true, remaining: MAX_EMAILS_PER_HOUR };
    }

    const data = JSON.parse(stored);
    const now = Date.now();
    
    // Filter out old entries (outside the rate limit window)
    const recentAttempts = data.attempts.filter(
      timestamp => now - timestamp < RATE_LIMIT_WINDOW
    );

    const remaining = MAX_EMAILS_PER_HOUR - recentAttempts.length;
    const allowed = remaining > 0;

    // Calculate time until next available slot
    let retryAfter = null;
    if (!allowed && recentAttempts.length > 0) {
      const oldestAttempt = Math.min(...recentAttempts);
      retryAfter = Math.ceil((oldestAttempt + RATE_LIMIT_WINDOW - now) / 60000); // minutes
    }

    return { 
      allowed, 
      remaining: Math.max(0, remaining),
      retryAfter 
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    return { allowed: true, remaining: MAX_EMAILS_PER_HOUR };
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
    
    // Clean old attempts and add new one
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
 * Send contact form email via EmailJS
 * @param {Object} formData - Form data
 * @param {string} formData.name - Sender name
 * @param {string} formData.email - Sender email
 * @param {string} formData.phone - Sender phone (optional)
 * @param {string} formData.subject - Email subject (optional)
 * @param {string} formData.message - Message content
 * @param {string} formData.productInterest - Product of interest (optional)
 * @returns {Promise<Object>} Send result
 */
export const sendContactEmail = async (formData) => {
  try {
    // Validate configuration
    if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
      console.error('EmailJS not configured properly');
      return { 
        success: false, 
        error: 'El servicio de email no está configurado correctamente' 
      };
    }

    // Check rate limit
    const rateLimit = checkRateLimit();
    if (!rateLimit.allowed) {
      return { 
        success: false, 
        error: `Has excedido el límite de envíos. Intenta de nuevo en ${rateLimit.retryAfter} minutos.`,
        rateLimited: true,
        retryAfter: rateLimit.retryAfter
      };
    }

    // Validate required fields
    if (!formData.name || !formData.email || !formData.message) {
      return { 
        success: false, 
        error: 'Por favor completa todos los campos requeridos' 
      };
    }

    // Prepare template parameters
    const templateParams = {
      from_name: formData.name.trim(),
      from_email: formData.email.trim().toLowerCase(),
      from_phone: formData.phone?.trim() || 'No proporcionado',
      subject: formData.subject?.trim() || 'Nuevo mensaje de contacto',
      message: formData.message.trim(),
      product_interest: formData.productInterest || 'No especificado',
      sent_at: new Date().toLocaleString('es-DO', { 
        timeZone: 'America/Santo_Domingo',
        dateStyle: 'full',
        timeStyle: 'short'
      }),
      // For reply-to functionality
      reply_to: formData.email.trim().toLowerCase()
    };

    // Send email via EmailJS
    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      templateParams,
      PUBLIC_KEY
    );

    // Record successful attempt for rate limiting
    recordAttempt();

    console.log('Email sent successfully:', response.status);
    
    return { 
      success: true, 
      data: {
        status: response.status,
        text: response.text,
        remaining: checkRateLimit().remaining
      }
    };
  } catch (error) {
    console.error('Error sending email:', error);
    
    // Map EmailJS errors to user-friendly messages
    let errorMessage = 'Error al enviar el mensaje. Por favor intenta de nuevo.';
    
    if (error.status === 400) {
      errorMessage = 'Los datos del formulario son inválidos';
    } else if (error.status === 401 || error.status === 403) {
      errorMessage = 'Error de autenticación con el servicio de email';
    } else if (error.status === 422) {
      errorMessage = 'La plantilla de email no está configurada correctamente';
    } else if (error.text) {
      errorMessage = error.text;
    }

    return { 
      success: false, 
      error: errorMessage,
      details: error
    };
  }
};

/**
 * Send email with reCAPTCHA verification
 * @param {Object} formData - Form data
 * @param {string} recaptchaToken - reCAPTCHA v3 token
 * @returns {Promise<Object>} Send result
 */
export const sendContactEmailWithCaptcha = async (formData, recaptchaToken) => {
  try {
    // In production, you would verify the token server-side
    // For now, we just include it in case needed
    if (!recaptchaToken) {
      console.warn('No reCAPTCHA token provided');
    }

    // Add reCAPTCHA token to form data for potential server-side verification
    const enrichedFormData = {
      ...formData,
      recaptchaToken
    };

    return sendContactEmail(enrichedFormData);
  } catch (error) {
    console.error('Error with captcha email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone format (Dominican Republic)
 * @param {string} phone - Phone to validate
 * @returns {boolean} Is valid phone
 */
export const isValidPhone = (phone) => {
  // Accepts formats: 809-555-5555, 8095555555, +1809-555-5555
  const phoneRegex = /^(\+?1)?[-.\s]?(\d{3})[-.\s]?(\d{3})[-.\s]?(\d{4})$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Format phone number for display
 * @param {string} phone - Raw phone number
 * @returns {string} Formatted phone
 */
export const formatPhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  return phone;
};

/**
 * Get remaining email sends
 * @returns {Object} Rate limit info
 */
export const getRateLimitInfo = () => {
  return checkRateLimit();
};

/**
 * Reset rate limit (for testing/admin purposes)
 */
export const resetRateLimit = () => {
  localStorage.removeItem(RATE_LIMIT_KEY);
};

export default {
  initEmailJS,
  sendContactEmail,
  sendContactEmailWithCaptcha,
  isValidEmail,
  isValidPhone,
  formatPhone,
  getRateLimitInfo,
  resetRateLimit
};
