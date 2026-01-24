/**
 * LeadsManagementPage - Manage Contact Leads
 * View, filter, update status of contact form submissions
 */

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { getContactLeads, updateLeadStatus } from '../../services/firestore.service';
import { openWhatsApp, generateContactMessage } from '../../services/whatsapp.service';
import { toast } from 'react-hot-toast';

const LeadsManagementPage = () => {
  const [selectedLead, setSelectedLead] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  // Fetch leads
  const { data: leadsData, isLoading, error } = useQuery({
    queryKey: ['admin', 'leads'],
    queryFn: () => getContactLeads(),
  });

  // Update lead mutation
  const updateMutation = useMutation({
    mutationFn: ({ leadId, status, notes }) => updateLeadStatus(leadId, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'leads']);
      toast.success('Estado actualizado');
    },
    onError: (error) => {
      toast.error('Error al actualizar: ' + error.message);
    }
  });

  const leads = leadsData?.data || [];

  // Filter leads
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      const matchesSearch = 
        lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone?.includes(searchTerm);
      return matchesStatus && matchesSearch;
    }).sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
      const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
      return dateB - dateA;
    });
  }, [leads, statusFilter, searchTerm]);

  // Status options
  const statusOptions = [
    { value: 'all', label: 'Todos', count: leads.length },
    { value: 'new', label: 'Nuevos', count: leads.filter(l => l.status === 'new').length },
    { value: 'contacted', label: 'Contactados', count: leads.filter(l => l.status === 'contacted').length },
    { value: 'completed', label: 'Completados', count: leads.filter(l => l.status === 'completed').length },
    { value: 'cancelled', label: 'Cancelados', count: leads.filter(l => l.status === 'cancelled').length },
  ];

  // Status colors
  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-blue-500',
      contacted: 'bg-yellow-500',
      completed: 'bg-green-500',
      cancelled: 'bg-red-500',
    };
    return colors[status] || 'bg-slate-500';
  };

  const getStatusBgColor = (status) => {
    const colors = {
      new: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      contacted: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      completed: 'bg-green-500/20 text-green-400 border-green-500/30',
      cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return colors[status] || 'bg-slate-500/20 text-slate-400';
  };

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate?.() || new Date(timestamp);
    return new Intl.DateTimeFormat('es-DO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Handle status change
  const handleStatusChange = async (leadId, newStatus, notes = '') => {
    updateMutation.mutate({ leadId, status: newStatus, notes });
  };

  // Handle WhatsApp contact
  const handleWhatsApp = (lead) => {
    const message = generateContactMessage(lead);
    openWhatsApp(lead.phone, `Hola ${lead.name}, gracias por contactar a VizionRD. Recibimos tu mensaje y estamos aquí para ayudarte.`);
    // Mark as contacted
    if (lead.status === 'new') {
      handleStatusChange(lead.id, 'contacted');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <span className="material-symbols-outlined text-5xl text-red-500 mb-4 block">error</span>
        <p className="text-slate-600 dark:text-slate-400">Error al cargar los leads</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Consultas de Clientes
          </h1>
          <p className="text-slate-500 dark:text-[#9aabbc]">
            {leads.length} contactos en total
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            search
          </span>
          <input
            type="text"
            placeholder="Buscar por nombre, email o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-[#27303a] border-none text-sm text-slate-900 dark:text-white placeholder:text-slate-500 focus:ring-2 focus:ring-primary transition-all"
          />
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2">
        {statusOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setStatusFilter(option.value)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              statusFilter === option.value
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'bg-white dark:bg-[#27303a] text-slate-600 dark:text-[#9aabbc] border border-slate-200 dark:border-[#394756] hover:border-primary/50 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {option.label}
            <span className={`px-1.5 py-0.5 rounded-full text-xs ${
              statusFilter === option.value
                ? 'bg-white/20'
                : 'bg-slate-100 dark:bg-white/10'
            }`}>
              {option.count}
            </span>
          </button>
        ))}
      </div>

      {/* Leads Grid */}
      {filteredLeads.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#101418] rounded-2xl border border-slate-200 dark:border-[#394756]">
          <span className="material-symbols-outlined text-5xl text-slate-400 mb-4 block">
            {searchTerm ? 'search_off' : 'inbox'}
          </span>
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">
            {searchTerm ? 'Sin resultados' : 'No hay leads'}
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Los nuevos contactos aparecerán aquí'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredLeads.map((lead, index) => (
            <motion.div
              key={lead.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-[#101418] rounded-xl border border-slate-200 dark:border-[#394756] p-4 md:p-6 hover:border-primary/30 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Avatar & Info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0 ${getStatusColor(lead.status)}`}>
                    {lead.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-900 dark:text-white">
                        {lead.name}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getStatusBgColor(lead.status)}`}>
                        {statusOptions.find(s => s.value === lead.status)?.label || lead.status}
                      </span>
                      {lead.whatsappSent && (
                        <span className="flex items-center gap-1 text-xs text-green-500">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                          </svg>
                          Enviado
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-slate-500 dark:text-slate-400">
                      <a href={`mailto:${lead.email}`} className="hover:text-primary flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">mail</span>
                        {lead.email}
                      </a>
                      <a href={`tel:${lead.phone}`} className="hover:text-primary flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">call</span>
                        {lead.phone}
                      </a>
                    </div>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                      {lead.message}
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                      {formatDate(lead.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleWhatsApp(lead)}
                    className="flex items-center gap-2 px-3 py-2 bg-[#25D366]/10 text-[#25D366] rounded-lg hover:bg-[#25D366]/20 transition-colors text-sm font-medium"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    WhatsApp
                  </button>
                  <button
                    onClick={() => setSelectedLead(lead)}
                    className="flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium"
                  >
                    <span className="material-symbols-outlined text-lg">visibility</span>
                    Ver
                  </button>
                  <select
                    value={lead.status}
                    onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                    className="px-3 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-primary"
                  >
                    <option value="new">Nuevo</option>
                    <option value="contacted">Contactado</option>
                    <option value="completed">Completado</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Lead Detail Modal */}
      <AnimatePresence>
        {selectedLead && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLead(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-white dark:bg-[#101418] rounded-2xl z-50 overflow-hidden shadow-2xl"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Detalles del Lead
                </h3>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-slate-500">close</span>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl ${getStatusColor(selectedLead.status)}`}>
                    {selectedLead.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-lg">
                      {selectedLead.name}
                    </h4>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${getStatusBgColor(selectedLead.status)}`}>
                      {statusOptions.find(s => s.value === selectedLead.status)?.label}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/5 rounded-lg">
                    <span className="material-symbols-outlined text-primary">mail</span>
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-medium">Email</p>
                      <a href={`mailto:${selectedLead.email}`} className="text-slate-900 dark:text-white hover:text-primary">
                        {selectedLead.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/5 rounded-lg">
                    <span className="material-symbols-outlined text-primary">call</span>
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-medium">Teléfono</p>
                      <a href={`tel:${selectedLead.phone}`} className="text-slate-900 dark:text-white hover:text-primary">
                        {selectedLead.phone}
                      </a>
                    </div>
                  </div>

                  {selectedLead.productInterest && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/5 rounded-lg">
                      <span className="material-symbols-outlined text-primary">inventory_2</span>
                      <div>
                        <p className="text-xs text-slate-500 uppercase font-medium">Producto de Interés</p>
                        <p className="text-slate-900 dark:text-white">{selectedLead.productInterest}</p>
                      </div>
                    </div>
                  )}

                  <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-lg">
                    <p className="text-xs text-slate-500 uppercase font-medium mb-2">Mensaje</p>
                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                      {selectedLead.message}
                    </p>
                  </div>

                  <div className="text-xs text-slate-500 pt-2">
                    <p>Recibido: {formatDate(selectedLead.createdAt)}</p>
                    {selectedLead.whatsappSent && (
                      <p className="text-green-500">✓ WhatsApp enviado: {formatDate(selectedLead.whatsappSentAt)}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex gap-3">
                <button
                  onClick={() => handleWhatsApp(selectedLead)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#25D366] text-white rounded-xl font-bold hover:bg-[#25D366]/90 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  WhatsApp
                </button>
                <a
                  href={`mailto:${selectedLead.email}`}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
                >
                  <span className="material-symbols-outlined">mail</span>
                  Email
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LeadsManagementPage;
