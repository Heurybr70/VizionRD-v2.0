import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ArrowRightIcon, SparklesIcon } from '@heroicons/react/24/outline';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import CarouselSlider from '../../components/carousel/CarouselSlider';
import ProductCard from '../../components/products/ProductCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getProducts, getSiteContent, getCarouselSlides } from '../../services/firestore.service';

const HomePage = () => {
  // Fetch carousel slides
  const { data: carouselData, isLoading: carouselLoading } = useQuery({
    queryKey: ['carousel', 'active'],
    queryFn: () => getCarouselSlides(true),
  });

  // Fetch products
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products', 'active'],
    queryFn: () => getProducts(true),
  });

  // Fetch hero content
  const { data: heroData } = useQuery({
    queryKey: ['site_content', 'hero_section'],
    queryFn: () => getSiteContent('hero_section'),
  });

  // Fetch about content (para sección resumen)
  const { data: aboutData } = useQuery({
    queryKey: ['site_content', 'about_us'],
    queryFn: () => getSiteContent('about_us'),
  });

  const products = productsData?.data || [];
  const carouselSlides = (carouselData?.data || []).map(slide => ({
    ...slide,
    imageUrl: slide.image || slide.imageUrl, // Compatibilidad con ambos campos
  }));
  const heroContent = heroData?.data?.content || {};
  const aboutContent = aboutData?.data?.content || {};

  // Productos destacados: solo los que tengan 'featured' activado
  const featuredProducts = products
    .filter(p => p.featured === true)
    .slice(0, 6)
    .map(p => ({ ...p, imageUrl: p.image || p.imageUrl }));

  return (
    <>
      <Helmet>
        <title>VizionRD - Elite Car Care | Detallado Automotriz Profesional</title>
        <meta
          name="description"
          content="Servicios y productos profesionales de detallado automotriz en República Dominicana. Calidad premium para el cuidado de tu vehículo."
        />
      </Helmet>

      <div className="min-h-screen bg-background-light dark:bg-background-dark">
        <Navbar />

        {/* Hero Section con Carousel */}
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden">
          {/* Carousel de fondo */}
          <div className="absolute inset-0 z-0">
            <CarouselSlider slides={carouselSlides} />
            {/* Overlay oscuro para mejorar legibilidad */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background-dark" />
          </div>

          {/* Contenido Hero */}
          <div className="relative z-10 container-custom text-center text-white px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Badge */}
              <span className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-primary/20 backdrop-blur-sm border border-primary/30 rounded-full text-sm font-bold tracking-wider uppercase">
                <SparklesIcon className="w-4 h-4" />
                Elite Car Care
              </span>

              {/* Título */}
              <h1
                className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tight leading-tight"
                dangerouslySetInnerHTML={{
                  __html:
                    heroContent.title ||
                    'Pasión por la <span class="text-primary">Perfección</span>',
                }}
              />

              {/* Subtítulo */}
              <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-10 text-slate-300 font-semibold leading-relaxed">
                {heroContent.subtitle ||
                  'VizionRD: Elevando el estándar del detallado automotriz. No limpiamos coches, preservamos obras de ingeniería.'}
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.a
                  href="#productos"
                  className="btn-primary inline-flex items-center gap-2 group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {heroContent.ctaPrimary || 'Ver Productos'}
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.a>

                <motion.a
                  href="/nosotros"
                  className="btn-secondary inline-flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {heroContent.ctaSecondary || 'Nuestra Historia'}
                </motion.a>
              </div>
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10">
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2"
            >
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1 h-3 bg-white rounded-full"
              />
            </motion.div>
          </div>
        </section>

        {/* Sección de Productos Destacados */}
        <section id="productos" className="section-padding bg-background-light dark:bg-background-dark">
          <div className="container-custom">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <span className="text-primary text-sm font-bold uppercase tracking-widest mb-4 block">
                Catálogo Premium
              </span>
              <h2 className="text-4xl md:text-5xl font-black mb-4 text-slate-900 dark:text-white">
                Productos Destacados
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
                Descubre nuestra selección de productos profesionales para el cuidado automotriz
              </p>
            </motion.div>

            {/* Products Grid */}
            {productsLoading ? (
              <div className="flex justify-center py-20">
                <LoadingSpinner size="lg" />
              </div>
            ) : featuredProducts.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {featuredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-20">
                <p className="text-slate-500 dark:text-slate-400">
                  No hay productos disponibles en este momento
                </p>
              </div>
            )}

            {/* Ver Todos CTA */}
            {products.length > 6 && (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-center mt-12"
              >
                <a href="/productos" className="btn-outline">
                  Ver Todos los Productos
                </a>
              </motion.div>
            )}
          </div>
        </section>

        {/* Sección Sobre Nosotros (Resumen) */}
        <section className="section-padding bg-slate-50 dark:bg-[#0f1215]">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Imagen */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&q=80"
                    alt="VizionRD Car Detailing"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Decorative element */}
                <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
              </motion.div>

              {/* Contenido */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <span className="text-primary text-sm font-bold uppercase tracking-widest mb-4 block">
                  Sobre Nosotros
                </span>
                <h2 className="text-4xl md:text-5xl font-black mb-6 text-slate-900 dark:text-white">
                  Excelencia en Cada Detalle
                </h2>

                {/* Misión */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                    Nuestra Misión
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {aboutContent.mission ||
                      'Proporcionar servicios de detallado automotriz de clase mundial que superen las expectativas de nuestros clientes.'}
                  </p>
                </div>

                {/* Visión */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                    Nuestra Visión
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {aboutContent.vision ||
                      'Ser reconocidos como el referente en cuidado automotriz premium en República Dominicana.'}
                  </p>
                </div>

                <a href="/nosotros" className="btn-primary inline-flex items-center gap-2">
                  Conoce Más Sobre Nosotros
                  <ArrowRightIcon className="w-5 h-5" />
                </a>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Final - Contacto */}
        <section className="section-padding bg-gradient-to-br from-primary-600 to-primary-800 text-white">
          <div className="container-custom text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl mx-auto"
            >
              <h2 className="text-4xl md:text-5xl font-black mb-6">
                ¿Listo para Transformar tu Vehículo?
              </h2>
              <p className="text-xl mb-10 text-white/90">
                Contáctanos hoy y descubre por qué VizionRD es la elección de los conductores más exigentes
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/contacto"
                  className="bg-white text-primary hover:bg-slate-100 font-bold px-8 py-4 rounded-xl transition-all inline-flex items-center gap-2 justify-center"
                >
                  Solicitar Cotización
                  <ArrowRightIcon className="w-5 h-5" />
                </a>
                <a
                  href="/productos"
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-bold px-8 py-4 rounded-xl transition-all"
                >
                  Ver Catálogo
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

export default HomePage;
