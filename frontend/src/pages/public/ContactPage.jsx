/**
 * ContactPage - Contact Form & Info
 * Based on ContactUS.html design
 */

import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import ContactForm from '../../components/forms/ContactForm';
import { getSiteContent } from '../../services/firestore.service';

const ContactPage = () => {
  // Leer subject de la query string
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const subjectFromQuery = params.get('subject') || '';

  // Fetch contact info from Firestore
  const { data: contactData } = useQuery({
    queryKey: ['site_content', 'contact_info'],
    queryFn: () => getSiteContent('contact_info'),
  });

  const contactInfo = contactData?.data?.content || {};

  // Default contact info
  const info = {
    phone: contactInfo.phone || '+1 (849) 352-5315',
    email: contactInfo.email || 'info@vizionrd.com',
    address: contactInfo.address || 'Santo Domingo, República Dominicana',
    hours: contactInfo.hours || 'Lunes - Viernes: 9:00 AM - 6:00 PM',
    mapCoords: contactInfo.mapCoords || { lat: 18.4861, lng: -69.9312 },
    socials: contactInfo.socials || {
      instagram: 'https://instagram.com/vizionrd',
      facebook: 'https://facebook.com/vizionrd',
      whatsapp: 'https://wa.me/18493525315'
    }
  };

  // Animation variant
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 }
  };

  return (
    <>
      <Helmet>
        <title>Contacto | VizionRD - Cuidado Automotriz Premium</title>
        <meta 
          name="description" 
          content="Contáctanos para consultas sobre productos de cuidado automotriz. Estamos aquí para ayudarte." 
        />
      </Helmet>

      <div className="min-h-screen bg-background-light dark:bg-background-dark">
        <Navbar />

        {/* Hero Section */}
        <section className="pt-32 pb-20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-16"
            >
              <h1 className="text-5xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
                Hablemos<span className="text-primary">.</span>
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg lg:text-xl max-w-2xl">
                ¿Tienes preguntas sobre nuestros productos? ¿Necesitas asesoría para el cuidado de tu vehículo? 
                Estamos aquí para ayudarte.
              </p>
            </motion.div>

            {/* Main Grid */}
            <div className="grid lg:grid-cols-12 gap-16">
              {/* Left: Contact Info */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-12">
                <div className="space-y-8">
                  {/* Phone */}
                  <motion.div {...fadeInUp} className="group flex items-start gap-5">
                    <div className="w-14 h-14 bg-primary/10 group-hover:bg-primary/20 rounded-xl flex items-center justify-center transition-colors flex-shrink-0">
                      <span className="material-symbols-outlined text-primary text-2xl">call</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
                        Teléfono
                      </h4>
                      <a 
                        href={`tel:${info.phone.replace(/\D/g, '')}`}
                        className="text-xl font-bold text-slate-900 dark:text-white hover:text-primary transition-colors"
                      >
                        {info.phone}
                      </a>
                    </div>
                  </motion.div>

                  {/* Email */}
                  <motion.div {...fadeInUp} transition={{ delay: 0.1 }} className="group flex items-start gap-5">
                    <div className="w-14 h-14 bg-primary/10 group-hover:bg-primary/20 rounded-xl flex items-center justify-center transition-colors flex-shrink-0">
                      <span className="material-symbols-outlined text-primary text-2xl">mail</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
                        Email
                      </h4>
                      <a 
                        href={`mailto:${info.email}`}
                        className="text-xl font-bold text-slate-900 dark:text-white hover:text-primary transition-colors"
                      >
                        {info.email}
                      </a>
                    </div>
                  </motion.div>

                  {/* Address */}
                  <motion.div {...fadeInUp} transition={{ delay: 0.2 }} className="group flex items-start gap-5">
                    <div className="w-14 h-14 bg-primary/10 group-hover:bg-primary/20 rounded-xl flex items-center justify-center transition-colors flex-shrink-0">
                      <span className="material-symbols-outlined text-primary text-2xl">location_on</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
                        Ubicación
                      </h4>
                      <p className="text-xl font-bold text-slate-900 dark:text-white">
                        {info.address}
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        {info.hours}
                      </p>
                    </div>
                  </motion.div>
                </div>

                {/* Social Links */}
                <motion.div 
                  {...fadeInUp}
                  transition={{ delay: 0.3 }}
                  className="bg-white dark:bg-[#1a1d24] p-8 rounded-xl border border-slate-200 dark:border-white/10"
                >
                  <p className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-6">
                    Síguenos en Redes
                  </p>
                  <div className="flex gap-4">
                    {/* Instagram */}
                    <a
                      href={info.socials.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-primary/10 flex items-center justify-center text-slate-600 dark:text-white hover:text-primary transition-all border border-slate-200 dark:border-white/10"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </a>

                    {/* Facebook */}
                    <a
                      href={info.socials.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-primary/10 flex items-center justify-center text-slate-600 dark:text-white hover:text-primary transition-all border border-slate-200 dark:border-white/10"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>

                    {/* WhatsApp */}
                    <a
                      href={info.socials.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 flex items-center justify-center text-[#25D366] transition-all border border-[#25D366]/20"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                    </a>
                  </div>
                </motion.div>
              </div>

              {/* Right: Contact Form */}
              <div className="lg:col-span-7">
                <ContactForm subject={subjectFromQuery} />
              </div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="border-t border-slate-200 dark:border-white/10">
          <div className="relative h-[400px] w-full bg-slate-900 overflow-hidden">
            {/* Map placeholder with styling */}
            <div className="absolute inset-0 grayscale invert contrast-125 opacity-60">
              <iframe
                src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d121059.04711758856!2d${info.mapCoords.lng}!3d${info.mapCoords.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8eaf89f1107ea5ab%3A0xd6c587b82715c164!2sSanto%20Domingo!5e0!3m2!1sen!2sdo!4v1706540000000!5m2!1sen!2sdo`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="VizionRD Location"
              />
            </div>

            {/* Location marker overlay */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="relative">
                <div className="absolute -inset-4 bg-primary/20 rounded-full animate-ping" />
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/50">
                  <span className="material-symbols-outlined text-white text-xl">location_on</span>
                </div>
              </div>
            </div>

            {/* Zoom controls (decorative) */}
            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20">
              <button className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all text-white">
                <span className="material-symbols-outlined">add</span>
              </button>
              <button className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all text-white">
                <span className="material-symbols-outlined">remove</span>
              </button>
            </div>
          </div>
        </section>

        <Footer />
      </div>

      {/* WhatsApp Floating Button */}
      <a
        href={info.socials.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 w-16 h-16 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform z-50"
        aria-label="Contactar por WhatsApp"
      >
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      </a>
    </>
  );
};

export default ContactPage;
