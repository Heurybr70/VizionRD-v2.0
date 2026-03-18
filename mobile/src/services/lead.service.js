import { addContactLead, getUserContactLeads } from './firestore.service';

export const REQUEST_TYPES = {
  CONTACT: 'contact',
  PRODUCT: 'product',
  SERVICE: 'service',
  CHECKOUT: 'checkout',
};

export const buildCartMessage = (items = [], total = 0) => {
  const lines = items.map((item) => `- ${item.name} x${item.quantity} (RD$ ${item.price || 0})`);
  return [
    'Solicitud de compra desde la app mobile.',
    '',
    'Resumen:',
    ...lines,
    '',
    `Total estimado: RD$ ${total}`,
  ].join('\n');
};

export const createLeadRequest = async ({
  name,
  email,
  phone,
  subject,
  message,
  source,
  requestType = REQUEST_TYPES.CONTACT,
  productId = null,
  referenceName = null,
  itemCount = null,
  total = null,
  userId = null,
}) => {
  const leadPayload = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    subject: subject?.trim() || 'Consulta desde la app mobile',
    message: message.trim(),
    source: source || 'mobile_contact',
    requestType,
    ...(productId ? { productId } : {}),
    ...(referenceName ? { referenceName } : {}),
    ...(typeof itemCount === 'number' ? { itemCount } : {}),
    ...(typeof total === 'number' ? { total } : {}),
    ...(userId ? { userId } : {}),
  };

  const leadResult = await addContactLead(leadPayload);
  if (!leadResult.success) {
    return leadResult;
  }

  return {
    success: true,
    id: leadResult.id,
  };
};

export const getMyRequests = async (userId) => {
  if (!userId) {
    return { success: true, data: [] };
  }

  return getUserContactLeads(userId);
};
