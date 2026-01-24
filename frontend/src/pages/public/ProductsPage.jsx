/**
 * ProductsPage - Public Products Catalog
 * Displays all products with filtering and search
 */

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import ProductCard, { ProductCardSkeleton } from '../../components/products/ProductCard';
import { getProducts } from '../../services/firestore.service';

const ProductsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Fetch products
  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ['products', 'active'],
    queryFn: () => getProducts(true),
  });

  const products = productsData?.data || [];

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set();
    products.forEach(p => {
      if (p.category) cats.add(p.category);
    });
    return ['all', ...Array.from(cats)];
  }, [products]);

  // Filter products
  // Mapear image a imageUrl para compatibilidad con ProductCard
  const mappedProducts = products.map(p => ({ ...p, imageUrl: p.image || p.imageUrl }));

  const filteredProducts = useMemo(() => {
    return mappedProducts.filter(product => {
      const matchesSearch = 
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = 
        selectedCategory === 'all' || product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [mappedProducts, searchTerm, selectedCategory]);

  return (
    <>
      <Helmet>
        <title>Productos | VizionRD - Cuidado Automotriz Premium</title>
        <meta 
          name="description" 
          content="Explora nuestra línea completa de productos premium para el cuidado automotriz. Selladores, ceras, limpiadores y más." 
        />
      </Helmet>

      <div className="min-h-screen bg-background-light dark:bg-background-dark">
        <Navbar />

        {/* Hero Section */}
        <section className="pt-32 pb-16 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] translate-x-1/2" />

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-medium mb-4">
                <span className="material-symbols-outlined text-sm">inventory_2</span>
                Catálogo Completo
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white mb-4">
                Nuestros <span className="text-primary">Productos</span>
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
                Soluciones profesionales de cuidado automotriz para mantener tu vehículo en perfectas condiciones
              </p>
            </motion.div>

            {/* Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-col md:flex-row gap-4 mb-12"
            >
              {/* Search */}
              <div className="relative flex-1 max-w-md mx-auto md:mx-0">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap justify-center gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedCategory === category
                        ? 'bg-primary text-white'
                        : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10'
                    }`}
                  >
                    {category === 'all' ? 'Todos' : category}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Results count */}
            <div className="flex items-center justify-between mb-8">
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="pb-24">
          <div className="max-w-7xl mx-auto px-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <span className="material-symbols-outlined text-5xl text-red-500 mb-4 block">error</span>
                <p className="text-slate-600 dark:text-slate-400">Error al cargar los productos</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <span className="material-symbols-outlined text-5xl text-slate-400 mb-4 block">
                  search_off
                </span>
                <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">
                  No se encontraron productos
                </h3>
                <p className="text-slate-500 dark:text-slate-400">
                  Intenta con otros términos de búsqueda
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                  className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Limpiar filtros
                </button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {filteredProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={index}
                  />
                ))}
              </motion.div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="pb-16">
          <div className="max-w-4xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-primary to-primary/80 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
              <div className="relative z-10">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  ¿No encuentras lo que buscas?
                </h2>
                <p className="text-white/80 mb-6">
                  Contáctanos y te ayudamos a encontrar el producto perfecto para tu vehículo
                </p>
                <a
                  href="/contacto"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary font-bold rounded-full hover:bg-white/90 transition-all"
                >
                  <span>Contáctanos</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default ProductsPage;
