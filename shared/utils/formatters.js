/**
 * Utilidades compartidas Web <-> Mobile
 */

/**
 * Formatea un precio en DOP (Pesos Dominicanos)
 * @param {number} price
 * @returns {string}
 */
export const formatPrice = (price) => {
  if (price === null || price === undefined) return 'RD$ 0.00';
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
  }).format(price);
};

/**
 * Calcula el subtotal de los ítems del carrito
 * @param {Array} items - [{price, quantity}]
 * @returns {number}
 */
export const getCartSubtotal = (items) =>
  items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

/**
 * Calcula el ITBIS (18%)
 * @param {number} subtotal
 * @returns {number}
 */
export const getITBIS = (subtotal) => subtotal * 0.18;

/**
 * Total final
 * @param {number} subtotal
 * @returns {number}
 */
export const getCartTotal = (subtotal) => subtotal + getITBIS(subtotal);

/**
 * Trunca un texto a N caracteres
 */
export const truncate = (text = '', maxLength = 50) =>
  text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
