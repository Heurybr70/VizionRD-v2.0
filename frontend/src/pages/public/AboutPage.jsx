/**
 * AboutPage - About Us / Sobre Nosotros
 * Company information, mission, vision, values
 */

import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { getSiteContent } from '../../services/firestore.service';

const AboutPage = () => {
  // Fetch about content from Firestore
  const { data: aboutData, isLoading } = useQuery({
    queryKey: ['site_content', 'about_us'],
    queryFn: () => getSiteContent('about_us'),
  });

  const content = aboutData?.data?.content || {};

  // Default content fallbacks
  const aboutContent = {
    title: content.title || 'Sobre Nosotros',
    subtitle: content.subtitle || 'Pasión por la Perfección Automotriz',
    description: content.description || 'VizionRD nace de la pasión por el cuidado automotriz de alta calidad. Somos una empresa dominicana dedicada a ofrecer productos y soluciones premium para el detallado de vehículos.',
    mission: {
      title: content.mission?.title || 'Nuestra Misión',
      text: content.mission?.text || 'Proporcionar productos de cuidado automotriz de la más alta calidad, brindando soluciones profesionales que superen las expectativas de nuestros clientes.'
    },
    vision: {
      title: content.vision?.title || 'Nuestra Visión',
      text: content.vision?.text || 'Ser la marca líder en cuidado automotriz en República Dominicana y el Caribe, reconocidos por nuestra excelencia, innovación y compromiso con la calidad.'
    },
    values: content.values || [
      { icon: 'verified', title: 'Calidad Premium', description: 'Solo trabajamos con los mejores ingredientes y fórmulas' },
      { icon: 'handshake', title: 'Compromiso', description: 'Dedicación total a la satisfacción del cliente' },
      { icon: 'lightbulb', title: 'Innovación', description: 'Constantemente mejorando nuestros productos' },
      { icon: 'eco', title: 'Responsabilidad', description: 'Comprometidos con el medio ambiente' }
    ],
    teamImage: content.teamImage || 'https://images.unsplash.com/photo-1552960562-daf630e9278b?w=800',
    stats: content.stats || [
      { number: '5+', label: 'Años de experiencia' },
      { number: '1000+', label: 'Clientes satisfechos' },
      { number: '50+', label: 'Productos premium' },
      { number: '100%', label: 'Compromiso' }
    ]
  };

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <>
      <Helmet>
        <title>Sobre Nosotros | VizionRD - Cuidado Automotriz Premium</title>
        <meta 
          name="description" 
          content="Conoce la historia, misión y visión de VizionRD. Empresa dominicana líder en productos de cuidado automotriz profesional." 
        />
      </Helmet>

      <div className="min-h-screen bg-background-light dark:bg-background-dark">
        <Navbar />

        {/* Hero Section */}
        <section className="pt-32 pb-20 relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] -translate-x-1/2 translate-y-1/2" />

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-medium mb-4">
                <span className="material-symbols-outlined text-sm">info</span>
                Conócenos
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white mb-6">
                {aboutContent.title.split(' ').map((word, i) => (
                  <span key={i} className={i === 1 ? 'text-primary' : ''}>
                    {word}{' '}
                  </span>
                ))}
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                {aboutContent.subtitle}
              </p>
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-24">
              {/* Image */}
              <motion.div
                {...fadeInUp}
                className="relative"
              >
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-primary/5 rounded-3xl blur-2xl" />
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                  <img
                    src={aboutContent.teamImage}
                    alt="VizionRD Team"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
              </motion.div>

              {/* Text Content */}
              <motion.div
                {...fadeInUp}
                transition={{ delay: 0.2 }}
                className="space-y-6"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                  Expertos en <span className="text-primary">Detallado Automotriz</span>
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                  {aboutContent.description}
                </p>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Nuestro equipo está formado por profesionales apasionados que entienden las necesidades 
                  de los entusiastas del automóvil. Desde limpiadores especializados hasta selladores de 
                  grado profesional, cada producto en nuestro catálogo ha sido cuidadosamente seleccionado.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20 bg-slate-50 dark:bg-[#0c0e12]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Mission */}
              <motion.div
                {...fadeInUp}
                className="p-8 md:p-10 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-lg"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-primary text-3xl">flag</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                  {aboutContent.mission.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {aboutContent.mission.text}
                </p>
              </motion.div>

              {/* Vision */}
              <motion.div
                {...fadeInUp}
                transition={{ delay: 0.1 }}
                className="p-8 md:p-10 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-lg"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-primary text-3xl">visibility</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                  {aboutContent.vision.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {aboutContent.vision.text}
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              {...fadeInUp}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Nuestros <span className="text-primary">Valores</span>
              </h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Los principios que guían cada aspecto de nuestro trabajo
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {aboutContent.values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-primary/50 transition-all text-center"
                >
                  <div className="w-14 h-14 bg-primary/10 group-hover:bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4 transition-colors">
                    <span className="material-symbols-outlined text-primary text-2xl">
                      {value.icon}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    {value.title}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {value.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-20 bg-primary relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -translate-x-1/3 translate-y-1/3" />

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {aboutContent.stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-4xl md:text-5xl font-black text-white mb-2">
                    {stat.number}
                  </div>
                  <div className="text-white/70 font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <motion.div
              {...fadeInUp}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                ¿Listo para transformar tu vehículo?
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-xl mx-auto">
                Explora nuestro catálogo de productos premium o contáctanos para recibir asesoría personalizada.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="/productos"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-full transition-all shadow-lg shadow-primary/30"
                >
                  <span>Ver Productos</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </a>
                <a
                  href="/contacto"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-white/5 text-slate-700 dark:text-white font-medium rounded-full border border-slate-200 dark:border-white/10 hover:border-primary/50 transition-all"
                >
                  <span>Contactar</span>
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

export default AboutPage;
