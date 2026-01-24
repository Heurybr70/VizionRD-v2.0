/**
 * DashboardPage - Admin Dashboard
 * Overview with stats, recent leads, quick actions
 * Based on AdminDashboard.html design - Pixel Perfect
 */

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getProducts, getContactLeads, getCarouselSlides } from '../../services/firestore.service';

const DashboardPage = () => {
  // Fetch data for stats
  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: () => getProducts(false),
  });

  const { data: leadsData, isLoading: loadingLeads } = useQuery({
    queryKey: ['admin', 'leads'],
    queryFn: () => getContactLeads(),
  });

  const { data: carouselData, isLoading: loadingCarousel } = useQuery({
    queryKey: ['admin', 'carousel'],
    queryFn: () => getCarouselSlides(false),
  });

  const products = productsData?.data || [];
  const leads = leadsData?.data || [];
  const slides = carouselData?.data || [];

  const isLoading = loadingProducts || loadingLeads || loadingCarousel;

  // Calculate stats based on AdminDashboard.html
  const stats = [
    {
      label: 'Total Productos',
      value: products.length,
      icon: 'inventory',
      trend: '+12.5%',
      trendUp: true,
      color: 'primary',
      link: '/admin/products'
    },
    {
      label: 'Slides Activos',
      value: slides.filter(s => s.active !== false).length,
      icon: 'gallery_thumbnail',
      trend: 'Sin cambios',
      trendUp: null,
      color: 'orange',
      link: '/admin/carousel'
    },
    {
      label: 'Nuevas Consultas',
      value: leads.filter(l => l.status === 'new').length,
      icon: 'contact_page',
      trend: '-5.2%',
      trendUp: false,
      color: 'emerald',
      link: '/admin/leads'
    }
  ];

  // Recent leads (last 4 as shown in HTML)
  const recentLeads = leads
    .sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
      const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
      return dateB - dateA;
    })
    .slice(0, 4);

  // Status badge
  const getStatusBadge = (status) => {
    const badges = {
      new: { label: 'Nuevo', class: 'bg-primary/10 text-primary' },
      contacted: { label: 'En Proceso', class: 'bg-amber-500/10 text-amber-500' },
      completed: { label: 'Completado', class: 'bg-emerald-500/10 text-emerald-500' },
      cancelled: { label: 'Cancelado', class: 'bg-red-500/10 text-red-500' },
    };
    return badges[status] || badges.new;
  };

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate?.() || new Date(timestamp);
    return new Intl.DateTimeFormat('es-DO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  // Get initials
  const getInitials = (name) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Skeleton loader
  const StatSkeleton = () => (
    <div className="p-6 rounded-2xl bg-white dark:bg-[#101418] border border-slate-200 dark:border-[#394756] animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700" />
        <div className="w-16 h-6 rounded-full bg-slate-200 dark:bg-slate-700" />
      </div>
      <div className="w-24 h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
      <div className="w-16 h-8 bg-slate-200 dark:bg-slate-700 rounded" />
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading ? (
          <>
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </>
        ) : (
          stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={stat.link}
                className="block p-6 rounded-2xl bg-white dark:bg-[#101418] border border-slate-200 dark:border-[#394756] hover:border-primary/50 transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl group-hover:scale-110 transition-transform ${
                    stat.color === 'primary' ? 'bg-primary/10 text-primary' :
                    stat.color === 'orange' ? 'bg-orange-500/10 text-orange-500' :
                    'bg-emerald-500/10 text-emerald-500'
                  }`}>
                    <span className="material-symbols-outlined">{stat.icon}</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    stat.trendUp === true ? 'text-emerald-500 bg-emerald-500/10' :
                    stat.trendUp === false ? 'text-rose-500 bg-rose-500/10' :
                    'text-slate-400 bg-slate-100 dark:bg-slate-800'
                  }`}>
                    {stat.trend}
                  </span>
                </div>
                <p className="text-slate-500 dark:text-[#9aabbc] text-sm font-medium mb-1">
                  {stat.label}
                </p>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                  {stat.value.toLocaleString()}
                </h3>
              </Link>
            </motion.div>
          ))
        )}
      </div>

      {/* Recent Customer Inquiries Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-[#101418] rounded-2xl border border-slate-200 dark:border-[#394756] overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-slate-200 dark:border-[#394756] flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Consultas Recientes
          </h2>
          <Link 
            to="/admin/leads"
            className="text-sm font-bold text-primary hover:underline"
          >
            Ver Todas
          </Link>
        </div>

        {recentLeads.length === 0 ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-slate-400 mb-2 block">inbox</span>
            <p className="text-slate-500 dark:text-[#9aabbc]">No hay consultas aún</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#1b2128]">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#9aabbc]">
                    Nombre
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#9aabbc]">
                    Servicio
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#9aabbc]">
                    Fecha
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#9aabbc]">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#9aabbc] text-right">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#394756]">
                {recentLeads.map((lead) => {
                  const badge = getStatusBadge(lead.status);
                  return (
                    <tr 
                      key={lead.id}
                      className="hover:bg-slate-50 dark:hover:bg-[#1b2128] transition-colors group"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-sm text-slate-600 dark:text-slate-300">
                            {getInitials(lead.name)}
                          </div>
                          <span className="font-medium text-slate-900 dark:text-white">
                            {lead.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-slate-600 dark:text-[#9aabbc]">
                        {lead.service || lead.subject || 'Consulta General'}
                      </td>
                      <td className="px-6 py-5 text-slate-600 dark:text-[#9aabbc]">
                        {formatDate(lead.createdAt)}
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${badge.class}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            to={`/admin/leads?id=${lead.id}`}
                            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400"
                          >
                            <span className="material-symbols-outlined text-lg">visibility</span>
                          </Link>
                          <Link
                            to={`/admin/leads?id=${lead.id}&edit=true`}
                            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400"
                          >
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {recentLeads.length > 0 && (
          <div className="px-6 py-4 bg-slate-50 dark:bg-[#1b2128] border-t border-slate-100 dark:border-[#394756] flex items-center justify-between">
            <p className="text-xs text-slate-500 dark:text-[#9aabbc]">
              Mostrando {recentLeads.length} de {leads.length} consultas
            </p>
            <div className="flex items-center gap-2">
              <button className="size-8 flex items-center justify-center rounded-lg bg-white dark:bg-[#27303a] border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <button className="size-8 flex items-center justify-center rounded-lg bg-white dark:bg-[#27303a] border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Footer Context */}
      <div className="flex items-center justify-between text-[#9aabbc] text-xs font-medium">
        <p>© {new Date().getFullYear()} VizionRD. Todos los derechos reservados.</p>
        <div className="flex items-center gap-6">
          <a className="hover:text-primary transition-colors" href="#">Documentación</a>
          <a className="hover:text-primary transition-colors" href="#">Soporte</a>
          <a className="hover:text-primary transition-colors" href="#">Seguridad</a>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
