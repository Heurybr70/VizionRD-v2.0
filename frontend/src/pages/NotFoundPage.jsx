import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const NotFoundPage = () => {
  return (
    <>
      <Helmet>
        <title>404 - Página no encontrada | VizionRD</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background-dark flex items-center justify-center px-4">
        <div className="text-center max-w-2xl mx-auto">
          {/* 404 Number */}
          <div className="mb-8">
            <h1 className="text-[180px] md:text-[240px] font-black leading-none text-transparent bg-gradient-to-br from-primary-400 to-primary-600 bg-clip-text">
              404
            </h1>
          </div>

          {/* Message */}
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Página no encontrada
          </h2>
          <p className="text-slate-400 text-lg mb-8">
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-600 text-white font-bold px-8 py-4 rounded-xl transition-all"
            >
              <HomeIcon className="w-5 h-5" />
              Ir al Inicio
            </Link>

            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-bold px-8 py-4 rounded-xl transition-all"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Volver Atrás
            </button>
          </div>

          {/* Links útiles */}
          <div className="mt-16 pt-8 border-t border-white/10">
            <p className="text-slate-500 text-sm mb-4">Enlaces útiles:</p>
            <div className="flex flex-wrap gap-6 justify-center text-sm">
              <Link to="/productos" className="text-primary hover:text-primary-400 transition-colors">
                Productos
              </Link>
              <Link to="/nosotros" className="text-primary hover:text-primary-400 transition-colors">
                Sobre Nosotros
              </Link>
              <Link to="/contacto" className="text-primary hover:text-primary-400 transition-colors">
                Contacto
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFoundPage;
