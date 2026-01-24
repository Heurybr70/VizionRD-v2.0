/**
 * ProductDetailModal - Product Detail Popup
 * Shows full product information in a modal
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { openWhatsApp } from '../../services/whatsapp.service';

const ProductDetailModal = ({ product, isOpen, onClose }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!product) return null;

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(price || 0);
  };

  // Get category label
  const getCategoryLabel = (category) => {
    const categories = {
      exterior: 'Cuidado Exterior',
      interior: 'Cuidado Interior',
      engine: 'Motor',
      tires: 'Neumáticos y Llantas',
      accessories: 'Accesorios',
      kits: 'Kits Completos',
    };
    return categories[category] || category;
  };

  // Handle WhatsApp contact
  const handleWhatsAppContact = () => {
    const message = `Hola VizionRD! Me interesa el producto: ${product.name}${product.sku ? ` (SKU: ${product.sku})` : ''} - ${formatPrice(product.price)}. ¿Tienen disponibilidad?`;
    openWhatsApp('+18493525315', message);
  };

  // Product images (use main image if no gallery)
  const images = product.gallery?.length > 0 
    ? product.gallery 
    : product.image 
      ? [product.image] 
      : [];

  // Calculate discount percentage
  const discountPercentage = product.comparePrice && product.comparePrice > product.price
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-800 rounded-2xl 
                     shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 
                       text-white rounded-full transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="flex flex-col lg:flex-row max-h-[90vh] overflow-auto">
              {/* Image Gallery */}
              <div className="lg:w-1/2 bg-slate-100 dark:bg-slate-900">
                {/* Main Image */}
                <div className="relative aspect-square">
                  {images.length > 0 ? (
                    <img
                      src={images[selectedImageIndex]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-6xl text-slate-400">
                        image
                      </span>
                    </div>
                  )}

                  {/* Discount Badge */}
                  {discountPercentage && (
                    <div className="absolute top-4 left-4 px-3 py-1 bg-red-500 text-white 
                                  text-sm font-bold rounded-full">
                      -{discountPercentage}%
                    </div>
                  )}
                </div>

                {/* Thumbnail Gallery */}
                {images.length > 1 && (
                  <div className="flex gap-2 p-4 overflow-x-auto">
                    {images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 
                                  border-2 transition-colors ${
                                    selectedImageIndex === index 
                                      ? 'border-primary' 
                                      : 'border-transparent'
                                  }`}
                      >
                        <img 
                          src={img} 
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="lg:w-1/2 p-6 lg:p-8 overflow-y-auto">
                {/* Category */}
                <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm 
                              font-medium rounded-full mb-4">
                  {getCategoryLabel(product.category)}
                </span>

                {/* Name */}
                <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  {product.name}
                </h2>

                {/* SKU */}
                {product.sku && (
                  <p className="text-sm text-slate-400 mb-4">SKU: {product.sku}</p>
                )}

                {/* Price */}
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">
                    {formatPrice(product.price)}
                  </span>
                  {product.comparePrice && product.comparePrice > product.price && (
                    <span className="text-lg text-slate-400 line-through">
                      {formatPrice(product.comparePrice)}
                    </span>
                  )}
                </div>

                {/* Description */}
                <div className="prose prose-slate dark:prose-invert max-w-none mb-6">
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Features/Specs */}
                {product.features && product.features.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
                      Características
                    </h3>
                    <ul className="space-y-2">
                      {product.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                          <span className="material-symbols-outlined text-primary text-lg mt-0.5">
                            check_circle
                          </span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Stock Status */}
                <div className="flex items-center gap-2 mb-6">
                  {product.stock > 0 ? (
                    <>
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        En stock ({product.stock} disponibles)
                      </span>
                    </>
                  ) : product.stock === 0 ? (
                    <>
                      <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                      <span className="text-red-600 dark:text-red-400 font-medium">
                        Agotado
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                      <span className="text-blue-600 dark:text-blue-400 font-medium">
                        Consultar disponibilidad
                      </span>
                    </>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleWhatsAppContact}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 
                             bg-green-500 hover:bg-green-600 text-white font-semibold 
                             rounded-xl transition-colors"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Consultar por WhatsApp
                  </button>

                  <button
                    onClick={onClose}
                    className="w-full px-6 py-3 border border-slate-300 dark:border-slate-600 
                             text-slate-700 dark:text-slate-300 font-medium rounded-xl 
                             hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Seguir Viendo Productos
                  </button>
                </div>

                {/* Extra Info */}
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <span className="material-symbols-outlined text-lg">local_shipping</span>
                      Envío disponible
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <span className="material-symbols-outlined text-lg">verified</span>
                      Producto original
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <span className="material-symbols-outlined text-lg">support_agent</span>
                      Asesoría incluida
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <span className="material-symbols-outlined text-lg">payments</span>
                      Múltiples pagos
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProductDetailModal;
