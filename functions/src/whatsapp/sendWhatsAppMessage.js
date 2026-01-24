import { onCall, HttpsError } from 'firebase-functions/v2/https';
import axios from 'axios';
import admin from 'firebase-admin';
import { logger } from '../utils/logger.js';
import { checkRateLimit } from '../utils/rateLimiter.js';

const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0';

/**
 * Cloud Function para enviar mensajes por WhatsApp
 * Llamada HTTPS Callable desde el frontend
 */
export const sendWhatsAppMessage = onCall(async (request) => {
  const { data, auth } = request;

  try {
    // Validar datos requeridos
    if (!data.leadId || !data.name || !data.phone || !data.message) {
      throw new HttpsError(
        'invalid-argument',
        'Faltan datos requeridos: leadId, name, phone, message'
      );
    }

    // Verificar rate limiting (máximo 10 mensajes por hora)
    const rateLimitKey = `whatsapp_${data.phone}`;
    const isAllowed = await checkRateLimit(rateLimitKey, 10, 3600); // 10 per hour

    if (!isAllowed) {
      logger.warn(`Rate limit exceeded for phone: ${data.phone}`);
      throw new HttpsError(
        'resource-exhausted',
        'Límite de mensajes excedido. Por favor intenta más tarde.'
      );
    }

    // Obtener configuración de WhatsApp
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const recipientNumber = process.env.WHATSAPP_RECIPIENT_NUMBER;

    if (!phoneNumberId || !accessToken || !recipientNumber) {
      logger.error('WhatsApp configuration missing');
      throw new HttpsError(
        'failed-precondition',
        'Configuración de WhatsApp incompleta'
      );
    }

    // Construir mensaje formateado
    const formattedMessage = buildWhatsAppMessage(data);

    // Enviar mensaje vía WhatsApp Cloud API
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        to: recipientNumber,
        type: 'text',
        text: {
          body: formattedMessage,
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Actualizar lead en Firestore
    await admin.firestore().collection('contact_leads').doc(data.leadId).update({
      whatsappSent: true,
      whatsappSentAt: admin.firestore.FieldValue.serverTimestamp(),
      whatsappMessageId: response.data.messages[0].id,
    });

    // Log de éxito
    logger.info('WhatsApp message sent successfully', {
      leadId: data.leadId,
      phone: data.phone,
      messageId: response.data.messages[0].id,
    });

    return {
      success: true,
      messageId: response.data.messages[0].id,
    };
  } catch (error) {
    // Log de error
    logger.error('Error sending WhatsApp message', {
      error: error.message,
      leadId: data?.leadId,
      phone: data?.phone,
    });

    // Manejar errores específicos de WhatsApp API
    if (error.response?.data) {
      const errorData = error.response.data;
      logger.error('WhatsApp API error details', errorData);

      throw new HttpsError(
        'internal',
        `Error de WhatsApp: ${errorData.error?.message || 'Error desconocido'}`
      );
    }

    // Re-throw HttpsErrors
    if (error instanceof HttpsError) {
      throw error;
    }

    // Error genérico
    throw new HttpsError(
      'internal',
      'Error al enviar mensaje por WhatsApp'
    );
  }
});

/**
 * Construir mensaje formateado para WhatsApp
 */
function buildWhatsAppMessage(data) {
  const { name, email, phone, message, subject, productId } = data;

  let formattedMessage = `🚗 *NUEVO LEAD - VizionRD*\n\n`;
  formattedMessage += `👤 *Nombre:* ${name}\n`;
  formattedMessage += `📧 *Email:* ${email}\n`;
  formattedMessage += `📱 *Teléfono:* ${phone}\n`;

  if (subject) {
    formattedMessage += `📌 *Asunto:* ${subject}\n`;
  }

  if (productId) {
    formattedMessage += `🛒 *Producto:* ${productId}\n`;
  }

  formattedMessage += `\n💬 *Mensaje:*\n${message}\n`;
  formattedMessage += `\n⏰ ${new Date().toLocaleString('es-DO')}`;

  return formattedMessage;
}
