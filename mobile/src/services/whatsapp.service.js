import { Linking } from 'react-native';
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

export const formatPhoneForWhatsApp = (phone = '') => {
  let cleanPhone = `${phone}`.replace(/\D/g, '');
  if (cleanPhone.length === 10) {
    cleanPhone = `1${cleanPhone}`;
  }
  return cleanPhone;
};

export const generateWhatsAppUrl = (phone, message = '') => {
  const cleanPhone = formatPhoneForWhatsApp(phone);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}${message ? `?text=${encodedMessage}` : ''}`;
};

export const openWhatsApp = async (phone, message = '') => {
  const url = generateWhatsAppUrl(phone, message);
  const canOpen = await Linking.canOpenURL(url);
  if (!canOpen) {
    return {
      success: false,
      error: 'No fue posible abrir WhatsApp en este dispositivo.',
    };
  }

  await Linking.openURL(url);
  return { success: true };
};

export const sendLeadWhatsAppMessage = async (data) => {
  try {
    const callable = httpsCallable(functions, 'sendWhatsAppMessage');
    const result = await callable(data);
    return { success: true, data: result.data };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'No se pudo notificar por WhatsApp.',
    };
  }
};
