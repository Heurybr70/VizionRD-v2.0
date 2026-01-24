/**
 * AdminLayout Component
 * Layout wrapper for admin panel with sidebar navigation
 * Based on AdminDashboard.html design - Pixel Perfect
 */

import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { signOut } from '../../services/auth.service';
import { getContactLeads } from '../../services/firestore.service';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Fetch leads count for badge
  const { data: leadsData } = useQuery({
    queryKey: ['admin', 'leads-count'],
    queryFn: () => getContactLeads(),
    staleTime: 30000, // 30 seconds
  });

  const newLeadsCount = leadsData?.data?.filter(l => l.status === 'new').length || 0;

  // Navigation items
  const navItems = [
    { 
      name: 'Panel', 
      path: '/admin/dashboard', 
      icon: 'dashboard',
      iconFilled: true,
      badge: null
    },
    { 
      name: 'Carrusel', 
      path: '/admin/carousel', 
      icon: 'view_carousel',
      badge: null
    },
    { 
      name: 'Productos', 
      path: '/admin/products', 
      icon: 'inventory_2',
      badge: null
    },
    { 
      name: 'Consultas', 
      path: '/admin/leads', 
      icon: 'group',
      badge: newLeadsCount > 0 ? String(newLeadsCount) : null
    },
    { 
      name: 'Contenido', 
      path: '/admin/content', 
      icon: 'edit_note',
      badge: null
    },
    { 
      name: 'Configuración', 
      path: '/admin/settings', 
      icon: 'settings',
      badge: null
    },
  ];

  // All nav items are available to logged-in users
  const filteredNavItems = navItems;

  // Handle logout
  const handleLogout = async () => {
    try {
      setMobileMenuOpen(false);
      await signOut();
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Handle mobile navigation
  const handleMobileNavClick = (path) => {
    // Close menu immediately
    setMobileMenuOpen(false);
    // Small delay to allow animation to complete before navigation
    setTimeout(() => {
      navigate(path);
    }, 50);
  };

  // Close mobile menu
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Get current page title
  const getCurrentPageTitle = () => {
    const current = navItems.find(item => location.pathname.startsWith(item.path));
    return current?.name || 'Admin';
  };

  return (
    <div className="flex h-screen w-full bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside
        className={`hidden md:flex flex-col flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101418] transition-all duration-300 relative ${
          sidebarOpen ? 'w-72' : 'w-20'
        }`}
      >
        {/* Logo */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-primary/20 flex-shrink-0">
            <img 
              src="https://res.cloudinary.com/dq2vyj2nq/image/upload/v1768621848/logVizion_lbcpvy.png" 
              alt="VizionRD Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden"
              >
                <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-tight whitespace-nowrap">
                  VizionRD
                </h1>
                <p className="text-xs font-medium text-slate-500 dark:text-[#9aabbc] uppercase tracking-widest">
                  Admin Portal
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative group ${
                  isActive
                    ? 'sidebar-item-active text-primary'
                    : 'text-slate-600 dark:text-[#9aabbc] hover:bg-slate-100 dark:hover:bg-[#27303a] hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              <span className={`material-symbols-outlined ${item.iconFilled ? 'fill-1' : ''}`}>{item.icon}</span>
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm font-semibold whitespace-nowrap"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
              {item.badge && sidebarOpen && (
                <span className="absolute right-4 bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className={`flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-[#1b2128] ${!sidebarOpen ? 'justify-center' : ''}`}>
            <div
              className="size-10 rounded-full bg-cover bg-center ring-2 ring-primary/20 flex-shrink-0 bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-bold text-sm"
            >
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {user?.displayName || 'Admin User'}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-[#9aabbc] uppercase truncate">
                    {isAdmin() ? 'Super Admin' : 'Editor'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            {sidebarOpen && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => navigate('/admin/settings')}
                  className="material-symbols-outlined text-slate-400 hover:text-primary transition-colors p-1"
                  title="Configuración"
                >
                  settings
                </button>
                <button
                  onClick={handleLogout}
                  className="material-symbols-outlined text-slate-400 hover:text-red-500 transition-colors p-1"
                  title="Cerrar Sesión"
                >
                  logout
                </button>
              </div>
            )}
            {!sidebarOpen && (
              <button
                onClick={handleLogout}
                className="material-symbols-outlined text-slate-400 hover:text-red-500 transition-colors p-1 absolute bottom-4 left-1/2 -translate-x-1/2"
                title="Cerrar Sesión"
              >
                logout
              </button>
            )}
          </div>
        </div>

        {/* Collapse Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden md:flex absolute top-6 -right-3 w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 items-center justify-center text-slate-400 hover:text-primary transition-colors shadow-sm z-10"
        >
          <span className={`material-symbols-outlined text-sm transition-transform ${sidebarOpen ? '' : 'rotate-180'}`}>
            chevron_left
          </span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-20 flex items-center justify-between px-6 md:px-8 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#16181d]/80 backdrop-blur-md sticky top-0 z-10">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#27303a]"
          >
            <span className="material-symbols-outlined text-slate-700 dark:text-white">menu</span>
          </button>

          {/* Search Bar */}
          <div className="hidden md:block flex-1 max-w-md">
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 dark:bg-[#27303a] border-none rounded-xl pl-11 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary transition-all text-slate-900 dark:text-white placeholder:text-slate-500"
                placeholder="Buscar consultas, productos..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="size-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-[#27303a] hover:bg-primary/10 hover:text-primary transition-all text-slate-600 dark:text-white relative">
              <span className="material-symbols-outlined">notifications</span>
              {newLeadsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {newLeadsCount}
                </span>
              )}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="size-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-[#27303a] hover:bg-primary/10 hover:text-primary transition-all text-slate-600 dark:text-white"
            >
              <span className="material-symbols-outlined">
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

            <div className="hidden md:block h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2" />

            {/* New Product Button */}
            <button
              onClick={() => navigate('/admin/products')}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-primary/20 transition-all"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Nuevo Producto
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50 dark:bg-background-dark">
          <Outlet />
        </div>
      </main>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobileMenu}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-white dark:bg-[#101418] z-50 md:hidden shadow-2xl"
            >
              {/* Mobile sidebar content - same as desktop */}
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-primary/20">
                    <img 
                      src="https://res.cloudinary.com/dq2vyj2nq/image/upload/v1768621848/logVizion_lbcpvy.png" 
                      alt="VizionRD Logo" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">VizionRD</h1>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest">Admin</p>
                  </div>
                </div>
                <button
                  onClick={closeMobileMenu}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  <span className="material-symbols-outlined text-slate-600 dark:text-white">close</span>
                </button>
              </div>

              <nav className="px-4 py-4 space-y-2">
                {filteredNavItems.map((item) => {
                  const isActive = location.pathname.startsWith(item.path);
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleMobileNavClick(item.path)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full text-left ${
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                      }`}
                    >
                      <span className="material-symbols-outlined">{item.icon}</span>
                      <span className="text-sm font-semibold">{item.name}</span>
                      {item.badge && (
                        <span className="ml-auto px-2 py-0.5 bg-primary/20 text-primary text-xs font-bold rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                >
                  <span className="material-symbols-outlined">logout</span>
                  <span className="text-sm font-semibold">Cerrar Sesión</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminLayout;
