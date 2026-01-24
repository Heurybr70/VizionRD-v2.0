import admin from 'firebase-admin';

/**
 * Rate limiter usando Firestore
 * 
 * @param {string} key - Identificador único (ej: 'whatsapp_+1234567890')
 * @param {number} maxRequests - Máximo de requests permitidos
 * @param {number} windowSeconds - Ventana de tiempo en segundos
 * @returns {boolean} - true si está permitido, false si excede el límite
 */
export async function checkRateLimit(key, maxRequests, windowSeconds) {
  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;

  const rateLimitRef = admin.firestore().collection('rate_limits').doc(key);

  try {
    await admin.firestore().runTransaction(async (transaction) => {
      const doc = await transaction.get(rateLimitRef);

      if (!doc.exists) {
        // Primera request, crear documento
        transaction.set(rateLimitRef, {
          count: 1,
          requests: [now],
          lastReset: now,
        });
        return true;
      }

      const data = doc.data();
      const requests = data.requests || [];

      // Filtrar requests dentro de la ventana de tiempo
      const recentRequests = requests.filter((timestamp) => timestamp > windowStart);

      if (recentRequests.length >= maxRequests) {
        // Límite excedido
        throw new Error('Rate limit exceeded');
      }

      // Agregar nueva request
      recentRequests.push(now);

      transaction.update(rateLimitRef, {
        count: recentRequests.length,
        requests: recentRequests,
        lastReset: now,
      });
    });

    return true;
  } catch (error) {
    if (error.message === 'Rate limit exceeded') {
      return false;
    }
    // Otro error, permitir la request pero loggear
    console.error('Error checking rate limit:', error);
    return true;
  }
}

/**
 * Limpiar rate limits antiguos (ejecutar periódicamente)
 */
export async function cleanupRateLimits(olderThanHours = 24) {
  const cutoff = Date.now() - olderThanHours * 60 * 60 * 1000;

  const snapshot = await admin
    .firestore()
    .collection('rate_limits')
    .where('lastReset', '<', cutoff)
    .get();

  const batch = admin.firestore().batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();
  console.log(`Cleaned up ${snapshot.size} old rate limit documents`);
}
