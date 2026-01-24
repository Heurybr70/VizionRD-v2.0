import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import admin from 'firebase-admin';
import axios from 'axios';
import { logger } from '../utils/logger.js';

const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0';

/**
 * Firestore Trigger: Se ejecuta cuando se crea un nuevo lead
 * Auto-envía WhatsApp si está habilitado en settings
 */
export const onLeadCreated = onDocumentCreated(
  'contact_leads/{leadId}',
  async (event) => {
    const leadData = event.data.data();
    const leadId = event.params.leadId;

    try {
      logger.info(`New lead created: ${leadId}`, {
        email: leadData.email,
        name: leadData.name,
      });

      // Obtener configuración del sitio
      const settingsDoc = await admin
        .firestore()
        .collection('site_content')
        .doc('site_settings')
        .get();

      const settings = settingsDoc.data();

      // Verificar si WhatsApp está habilitado
      if (!settings?.content?.whatsappEnabled) {
        logger.info('WhatsApp auto-send disabled, skipping');
        return;
      }

      // Enviar WhatsApp automáticamente
      await sendAutoWhatsApp(leadId, leadData);

      logger.info(`Auto WhatsApp sent for lead: ${leadId}`);
    } catch (error) {
      logger.error('Error in onLeadCreated trigger', {
        leadId,
        error: error.message,
      });
      // No re-throw - no queremos que falle la creación del lead
    }
  }
);

/**
 * Enviar WhatsApp automáticamente
 */
async function sendAutoWhatsApp(leadId, leadData) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const recipientNumber = process.env.WHATSAPP_RECIPIENT_NUMBER;

  if (!phoneNumberId || !accessToken || !recipientNumber) {
    logger.warn('WhatsApp configuration missing, cannot auto-send');
    return;
  }

  // Construir mensaje
  const message = buildAutoWhatsAppMessage(leadData);

  try {
    // Enviar mensaje
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        to: recipientNumber,
        type: 'text',
        text: {
          body: message,
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Actualizar lead
    await admin.firestore().collection('contact_leads').doc(leadId).update({
      whatsappSent: true,
      whatsappSentAt: admin.firestore.FieldValue.serverTimestamp(),
      whatsappMessageId: response.data.messages[0].id,
    });

    logger.info('Auto WhatsApp sent successfully', {
      leadId,
      messageId: response.data.messages[0].id,
    });
  } catch (error) {
    logger.error('Error sending auto WhatsApp', {
      leadId,
      error: error.message,
      details: error.response?.data,
    });

    // Registrar el fallo en el lead
    await admin.firestore().collection('contact_leads').doc(leadId).update({
      whatsappSent: false,
      whatsappError: error.message,
    });
  }
}

/**
 * Construir mensaje para WhatsApp
 */
function buildAutoWhatsAppMessage(leadData) {
  const { name, email, phone, message, subject } = leadData;

  let msg = `🚗 *NUEVO CONTACTO - VizionRD*\n\n`;
  msg += `👤 *Nombre:* ${name}\n`;
  msg += `📧 *Email:* ${email}\n`;
  msg += `📱 *Teléfono:* ${phone}\n`;

  if (subject) {
    msg += `📌 *Asunto:* ${subject}\n`;
  }

  msg += `\n💬 *Mensaje:*\n${message}\n`;
  msg += `\n⏰ ${new Date().toLocaleString('es-DO')}`;

  return msg;
}
