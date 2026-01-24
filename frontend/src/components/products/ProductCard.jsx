/**
 * ProductCard Component
 * Display product in a glass-morphism card
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const ProductCard = ({ 
  product, 
  index = 0, 
  onQuickView = null,
  variant = 'default' // 'default' | 'compact' | 'featured'
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (!product) return null;

  const {
    id,
    name,
    imageUrl,
    baseDetails = {},
    dynamicFields = [],
    category,
    badge
  } = product;

  // Get primary detail to show (e.g., size, volume)
  // Determinar si primaryDetail viene de baseDetails o del último campo dinámico
  let primaryDetail = null;
  let dynamicFieldsToShow = dynamicFields;
  if (baseDetails.size) {
    primaryDetail = baseDetails.size;
  } else if (baseDetails.volume) {
    primaryDetail = baseDetails.volume;
  } else if (dynamicFields.length > 0) {
    const lastIdx = dynamicFields.length - 1;
    primaryDetail = `${dynamicFields[lastIdx].label}: ${dynamicFields[lastIdx].value}`;
    dynamicFieldsToShow = dynamicFields.slice(0, lastIdx); // Omitir el último si ya se muestra arriba
  }

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: 'easeOut'
      }
    })
  };

  // Staggered grid offset for visual interest
  const offsetClass = variant === 'default' && index % 2 === 1 ? 'lg:mt-8' : '';

  return (
    <motion.div
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={cardVariants}
      className={`group ${offsetClass}`}
    >
      <div className="relative p-2 rounded-2xl bg-white/90 dark:bg-white/[0.03] backdrop-blur-xl border border-slate-200 dark:border-white/[0.08] hover:border-primary/50 hover:bg-primary/[0.05] transition-all duration-300 shadow-md">
        {/* Badge */}
        {badge && (
          <div className="absolute top-4 left-4 z-10">
            <span className="px-3 py-1 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg">
              {badge}
            </span>
          </div>
        )}

        {/* Quick View Button */}
        {onQuickView && (
          <button
            onClick={() => onQuickView(product)}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-primary"
            aria-label="Vista rápida"
          >
            <span className="material-symbols-outlined text-lg">visibility</span>
          </button>
        )}

        {/* Image Container */}
        <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800/50 mb-4">
          {/* Loading skeleton */}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-800 animate-pulse" />
          )}

          {/* Error fallback */}
          {imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
              <span className="material-symbols-outlined text-4xl text-slate-600">image</span>
            </div>
          )}

          {/* Product Image */}
          <img
            src={imageUrl || '/placeholder-product.jpg'}
            alt={name}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            loading="lazy"
          />

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Content */}
        <div className="px-2 pb-2">
          {/* Category */}
          {category && (
            <span className="text-primary text-xs font-bold uppercase tracking-widest mb-1 block">
              {category}
            </span>
          )}


          {/* Product Name */}
          <h3 className="font-bold text-lg leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2 text-slate-900 dark:text-white">
            {name}
          </h3>

          {/* Dynamic Fields */}
          {Array.isArray(dynamicFieldsToShow) && dynamicFieldsToShow.length > 0 && (
            <dl className="mb-2 grid grid-cols-1 gap-x-4 gap-y-1">
              {dynamicFieldsToShow.map((field, idx) => (
                <div key={idx} className="flex flex-row gap-2">
                  <dt className="text-xs font-semibold text-primary whitespace-nowrap">{field.label}:</dt>
                  <dd className="text-xs text-slate-700 dark:text-slate-300 truncate">{field.value}</dd>
                </div>
              ))}
            </dl>
          )}

          {/* Primary Detail */}
          {primaryDetail && (
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">
              {primaryDetail}
            </p>
          )}

          {/* Action Button */}
          <Link
            to={`/productos/${id}`}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary/90 hover:bg-primary text-white text-sm font-medium rounded-lg transition-all border border-primary/80 hover:border-primary"
          >
            <span>Ver Detalles</span>
            <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * ProductCardSkeleton Component
 * Loading placeholder for product cards
 */
export const ProductCardSkeleton = () => (
  <div className="p-2 rounded-2xl bg-white/[0.03] border border-white/[0.08] animate-pulse">
    <div className="aspect-square rounded-xl bg-slate-800/50 mb-4" />
    <div className="px-2 pb-2 space-y-3">
      <div className="h-3 w-16 bg-slate-700 rounded" />
      <div className="h-5 w-3/4 bg-slate-700 rounded" />
      <div className="h-3 w-1/2 bg-slate-700 rounded" />
      <div className="h-10 w-full bg-slate-700 rounded-lg" />
    </div>
  </div>
);

/**
 * ProductGrid Component
 * Grid layout for product cards
 */
export const ProductGrid = ({ 
  products = [], 
  loading = false, 
  emptyMessage = 'No hay productos disponibles',
  columns = 4,
  onQuickView = null
}) => {
  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(columns, 4)} gap-6`}>
        {[...Array(columns)].map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-16">
        <span className="material-symbols-outlined text-5xl text-slate-600 mb-4 block">
          inventory_2
        </span>
        <p className="text-slate-400 text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          index={index}
          onQuickView={onQuickView}
        />
      ))}
    </div>
  );
};

export default ProductCard;
