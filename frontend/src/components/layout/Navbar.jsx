/**
 * Navbar Component
 * Responsive navigation bar with mobile menu and theme toggle
 */

import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  // Navigation links
  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Productos', path: '/productos' },
    { name: 'Sobre Nosotros', path: '/nosotros' },
    { name: 'Contacto', path: '/contacto' },
  ];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/90 dark:bg-[#14161a]/90 backdrop-blur-xl shadow-lg'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-all">
                <img 
                  src="https://res.cloudinary.com/dq2vyj2nq/image/upload/v1768621848/logVizion_lbcpvy.png" 
                  alt="VizionRD Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h1
                className={`text-xl sm:text-2xl font-bold tracking-tight uppercase italic transition-colors
                  ${
                    !isScrolled && theme === 'light'
                      ? location.pathname !== '/'
                        ? 'text-[#0f172a]'
                        : 'text-white'
                      : 'text-slate-900 dark:text-white'
                  }`}
              >
                VizionRD
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8 lg:gap-10">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors relative ${
                      isActive
                        ? 'text-primary'
                        : 'text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {link.name}
                      {isActive && (
                        <motion.div
                          layoutId="navbar-indicator"
                          className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
                          initial={false}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-primary/10 dark:hover:bg-primary/20 flex items-center justify-center transition-all border border-slate-200 dark:border-white/10"
                aria-label="Toggle theme"
              >
                <span className="material-symbols-outlined text-slate-600 dark:text-white text-xl">
                  {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                </span>
              </button>

              {/* Admin Link (if authenticated) */}
              {isAuthenticated && isAdmin() && (
                <Link
                  to="/admin/dashboard"
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-primary/10 text-slate-700 dark:text-white text-sm font-medium transition-all border border-slate-200 dark:border-white/10"
                >
                  <span className="material-symbols-outlined text-lg">dashboard</span>
                  <span>Admin</span>
                </Link>
              )}

              {/* CTA Button */}
              <Link
                to="/productos"
                className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-full font-bold text-sm transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40"
              >
                <span>CATÁLOGO</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center border border-slate-200 dark:border-white/10"
                aria-label="Toggle menu"
              >
                <span className="material-symbols-outlined text-slate-700 dark:text-white">
                  {isMobileMenuOpen ? 'close' : 'menu'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            />

            {/* Mobile Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-[#101418] z-50 md:hidden shadow-2xl"
            >
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
                <span className="text-lg font-bold text-slate-900 dark:text-white">Menú</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-slate-700 dark:text-white">close</span>
                </button>
              </div>

              {/* Mobile Nav Links */}
              <nav className="p-6 space-y-2">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <NavLink
                      to={link.path}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                        }`
                      }
                    >
                      {link.name}
                    </NavLink>
                  </motion.div>
                ))}

                {/* Admin Link in Mobile */}
                {isAuthenticated && isAdmin() && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Link
                      to="/admin/dashboard"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                    >
                      <span className="material-symbols-outlined">dashboard</span>
                      Panel Admin
                    </Link>
                  </motion.div>
                )}
              </nav>

              {/* Mobile CTA */}
              <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101418]">
                <Link
                  to="/productos"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-all"
                >
                  <span>Ver Catálogo</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
