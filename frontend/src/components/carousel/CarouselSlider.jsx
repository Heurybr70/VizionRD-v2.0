/**
 * CarouselSlider Component
 * Public hero carousel using Swiper.js
 */

import { useState, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade, Navigation } from 'swiper/modules';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';

const CarouselSlider = ({ 
  slides = [], 
  config = {},
  overlay = true,
  showContent = true,
  className = ''
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const swiperRef = useRef(null);

  // Default config
  const {
    autoplayDuration = 5000,
    transitionDuration = 800,
    showDots = true,
    showArrows = true,
    pauseOnHover = true
  } = config;

  // Preload images
  useEffect(() => {
    if (slides.length > 0) {
      const imagePromises = slides.map((slide) => {
        return new Promise((resolve) => {
          if (slide.imageUrl) {
            const img = new Image();
            img.src = slide.imageUrl;
            img.onload = resolve;
            img.onerror = resolve;
          } else {
            resolve();
          }
        });
      });

      Promise.all(imagePromises).then(() => setIsLoaded(true));
    } else {
      setIsLoaded(true);
    }
  }, [slides]);

  // Empty state
  if (!slides || slides.length === 0) {
    return (
      <div className={`relative w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-primary/20 ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white/50">
            <span className="material-symbols-outlined text-6xl mb-4">view_carousel</span>
            <p className="text-lg">No hay slides disponibles</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* Loading state */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-slate-900 flex items-center justify-center"
          >
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Swiper Carousel */}
      <Swiper
        ref={swiperRef}
        modules={[Autoplay, Pagination, EffectFade, Navigation]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={transitionDuration}
        autoplay={{
          delay: autoplayDuration,
          disableOnInteraction: false,
          pauseOnMouseEnter: pauseOnHover
        }}
        pagination={showDots ? {
          clickable: true,
          bulletClass: 'swiper-pagination-bullet !w-3 !h-3 !bg-white/30 !opacity-100',
          bulletActiveClass: '!bg-primary !w-8 !rounded-full'
        } : false}
        navigation={showArrows ? {
          nextEl: '.carousel-next',
          prevEl: '.carousel-prev'
        } : false}
        loop={slides.length > 1}
        className="w-full h-full"
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={slide.id || index} className="relative">
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-[3000ms]"
              style={{
                backgroundImage: `url(${slide.imageUrl})`,
                transform: activeIndex === index ? 'scale(1.05)' : 'scale(1)'
              }}
            />

            {/* Overlay */}
            {overlay && (
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
            )}

            {/* Content */}
            {showContent && (slide.title || slide.subtitle) && (
              <div className="absolute inset-0 flex items-center">
                <div className="max-w-7xl mx-auto px-6 w-full">
                  <AnimatePresence mode="wait">
                    {activeIndex === index && (
                      <motion.div
                        key={`content-${index}`}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="max-w-xl"
                      >
                        {/* Badge */}
                        {slide.badge && (
                          <motion.span
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/20 border border-primary/30 rounded-full text-primary text-sm font-medium mb-4"
                          >
                            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                            {slide.badge}
                          </motion.span>
                        )}

                        {/* Title */}
                        {slide.title && (
                          <h2
                            className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-4"
                            dangerouslySetInnerHTML={{ __html: slide.title }}
                          />
                        )}

                        {/* Subtitle */}
                        {slide.subtitle && (
                          <p className="text-lg md:text-xl text-white/80 mb-6 leading-relaxed">
                            {slide.subtitle}
                          </p>
                        )}

                        {/* CTA Buttons */}
                        {(slide.primaryButton || slide.secondaryButton) && (
                          <div className="flex flex-wrap gap-4">
                            {slide.primaryButton && (
                              <Link
                                to={slide.primaryButton.link || '/productos'}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-full transition-all shadow-lg shadow-primary/30"
                              >
                                {slide.primaryButton.text || 'Ver Más'}
                                <span className="material-symbols-outlined text-lg">arrow_forward</span>
                              </Link>
                            )}
                            {slide.secondaryButton && (
                              <Link
                                to={slide.secondaryButton.link || '/contacto'}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-full border border-white/20 transition-all backdrop-blur-sm"
                              >
                                {slide.secondaryButton.text || 'Contactar'}
                              </Link>
                            )}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation Arrows */}
      {showArrows && slides.length > 1 && (
        <>
          <button
            className="carousel-prev absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-all border border-white/20 opacity-0 group-hover:opacity-100"
            aria-label="Previous slide"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button
            className="carousel-next absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-all border border-white/20 opacity-0 group-hover:opacity-100"
            aria-label="Next slide"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </>
      )}

      {/* Slide Counter */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 right-6 z-20 px-3 py-1.5 bg-black/30 backdrop-blur-sm rounded-full text-white text-sm font-medium">
          {String(activeIndex + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
        </div>
      )}
    </div>
  );
};

export default CarouselSlider;
