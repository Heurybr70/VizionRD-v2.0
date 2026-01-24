/**
 * SettingsPage - Site Settings Management
 * Configure WhatsApp notifications, business hours, and other settings
 * Requires admin role
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  getSiteSettings, 
  updateSiteSettings 
} from '../../services/firestore.service';
import { useAuth } from '../../context/AuthContext';

// Validation schema
const settingsSchema = yup.object({
  // WhatsApp Settings
  whatsappEnabled: yup.boolean(),
  whatsappNumber: yup.string().when('whatsappEnabled', {
    is: true,
    then: (schema) => schema.required('El número es requerido cuando WhatsApp está habilitado'),
  }),
  whatsappNotifyOnLead: yup.boolean(),
  
  // Business Settings
  businessName: yup.string().required('El nombre del negocio es requerido'),
  currency: yup.string().required('La moneda es requerida'),
  timezone: yup.string().required('La zona horaria es requerida'),
  
  // Map Settings
  mapEnabled: yup.boolean(),
  mapLatitude: yup.number().nullable().transform((value) => (isNaN(value) ? null : value)),
  mapLongitude: yup.number().nullable().transform((value) => (isNaN(value) ? null : value)),
  mapZoom: yup.number().min(1).max(20).nullable().transform((value) => (isNaN(value) ? null : value)),
  
  // Email Settings
  emailNotificationsEnabled: yup.boolean(),
  notificationEmail: yup.string().email('Email inválido').when('emailNotificationsEnabled', {
    is: true,
    then: (schema) => schema.required('El email es requerido cuando las notificaciones están habilitadas'),
  }),
  
  // Features
  catalogEnabled: yup.boolean(),
  contactFormEnabled: yup.boolean(),
  darkModeDefault: yup.boolean(),
});

// Timezone options for Dominican Republic and common ones
const TIMEZONES = [
  { value: 'America/Santo_Domingo', label: 'República Dominicana (AST)' },
  { value: 'America/New_York', label: 'Nueva York (EST/EDT)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)' },
  { value: 'Europe/Madrid', label: 'España (CET/CEST)' },
];

// Currency options
const CURRENCIES = [
  { value: 'DOP', label: 'Peso Dominicano (RD$)' },
  { value: 'USD', label: 'Dólar Estadounidense ($)' },
  { value: 'EUR', label: 'Euro (€)' },
];

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('general');
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch settings
  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: () => getSiteSettings(),
  });

  const settings = settingsData?.data || {};

  // Form setup
  const { 
    register, 
    handleSubmit, 
    watch,
    reset,
    formState: { errors, isDirty } 
  } = useForm({
    resolver: yupResolver(settingsSchema),
    defaultValues: {
      // WhatsApp
      whatsappEnabled: settings.whatsappEnabled ?? true,
      whatsappNumber: settings.whatsappNumber || '',
      whatsappNotifyOnLead: settings.whatsappNotifyOnLead ?? true,
      
      // Business
      businessName: settings.businessName || 'VizionRD',
      currency: settings.currency || 'DOP',
      timezone: settings.timezone || 'America/Santo_Domingo',
      
      // Map
      mapEnabled: settings.mapEnabled ?? false,
      mapLatitude: settings.mapLatitude || 18.4861,
      mapLongitude: settings.mapLongitude || -69.9312,
      mapZoom: settings.mapZoom || 15,
      
      // Email
      emailNotificationsEnabled: settings.emailNotificationsEnabled ?? true,
      notificationEmail: settings.notificationEmail || '',
      
      // Features
      catalogEnabled: settings.catalogEnabled ?? true,
      contactFormEnabled: settings.contactFormEnabled ?? true,
      darkModeDefault: settings.darkModeDefault ?? false,
    }
  });

  // Watch values for conditional rendering
  const whatsappEnabled = watch('whatsappEnabled');
  const mapEnabled = watch('mapEnabled');
  const emailNotificationsEnabled = watch('emailNotificationsEnabled');

  // Update settings when data loads
  useState(() => {
    if (settings && Object.keys(settings).length > 0) {
      reset({
        whatsappEnabled: settings.whatsappEnabled ?? true,
        whatsappNumber: settings.whatsappNumber || '',
        whatsappNotifyOnLead: settings.whatsappNotifyOnLead ?? true,
        businessName: settings.businessName || 'VizionRD',
        currency: settings.currency || 'DOP',
        timezone: settings.timezone || 'America/Santo_Domingo',
        mapEnabled: settings.mapEnabled ?? false,
        mapLatitude: settings.mapLatitude || 18.4861,
        mapLongitude: settings.mapLongitude || -69.9312,
        mapZoom: settings.mapZoom || 15,
        emailNotificationsEnabled: settings.emailNotificationsEnabled ?? true,
        notificationEmail: settings.notificationEmail || '',
        catalogEnabled: settings.catalogEnabled ?? true,
        contactFormEnabled: settings.contactFormEnabled ?? true,
        darkModeDefault: settings.darkModeDefault ?? false,
      });
    }
  }, [settings]);

  // Update settings mutation
  const updateMutation = useMutation({
    mutationFn: (data) => updateSiteSettings({
      ...data,
      updatedAt: new Date(),
      updatedBy: user?.email || 'unknown'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'settings']);
      toast.success('Configuración guardada');
    },
    onError: (error) => {
      toast.error('Error al guardar: ' + error.message);
    }
  });

  // Handle form submit
  const onSubmit = (data) => {
    updateMutation.mutate(data);
  };

  // Tab configuration
  const tabs = [
    { id: 'general', label: 'General', icon: 'settings' },
    { id: 'notifications', label: 'Notificaciones', icon: 'notifications' },
    { id: 'integrations', label: 'Integraciones', icon: 'extension' },
    { id: 'features', label: 'Funcionalidades', icon: 'toggle_on' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Configuración del Sitio
          </h1>
          <p className="text-slate-500 dark:text-[#9aabbc]">
            Gestiona las configuraciones generales de VizionRD
          </p>
        </div>

        {settings?.updatedAt && (
          <p className="text-xs text-[#9aabbc]">
            Última actualización: {new Date(settings.updatedAt.toDate?.() || settings.updatedAt).toLocaleString('es-DO')}
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'bg-white dark:bg-[#27303a] text-slate-600 dark:text-[#9aabbc] border border-slate-200 dark:border-[#394756] hover:border-primary/50 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-lg">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white dark:bg-[#101418] rounded-2xl border border-slate-200 dark:border-[#394756] p-6">
          
          {/* General Tab */}
          {activeTab === 'general' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white pb-4 border-b border-slate-200 dark:border-slate-700">
                Configuración General
              </h2>

              {/* Business Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Nombre del Negocio <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('businessName')}
                  type="text"
                  className={`w-full max-w-md px-4 py-3 rounded-lg border bg-transparent
                            focus:ring-2 focus:ring-primary focus:border-primary dark:text-white
                            ${errors.businessName ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
                />
                {errors.businessName && (
                  <p className="mt-1 text-sm text-red-500">{errors.businessName.message}</p>
                )}
              </div>

              {/* Currency */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Moneda <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('currency')}
                  className="w-full max-w-md px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 
                           bg-transparent focus:ring-2 focus:ring-primary focus:border-primary dark:text-white"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Timezone */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Zona Horaria <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('timezone')}
                  className="w-full max-w-md px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 
                           bg-transparent focus:ring-2 focus:ring-primary focus:border-primary dark:text-white"
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                  ))}
                </select>
              </div>

              {/* Map Settings */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <label className="flex items-center gap-3 cursor-pointer mb-4">
                  <input
                    {...register('mapEnabled')}
                    type="checkbox"
                    className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Habilitar Mapa en Contacto
                    </span>
                    <p className="text-xs text-slate-500">
                      Muestra un mapa de ubicación en la página de contacto
                    </p>
                  </div>
                </label>

                {mapEnabled && (
                  <div className="grid grid-cols-3 gap-4 ml-8">
                    <div>
                      <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                        Latitud
                      </label>
                      <input
                        {...register('mapLatitude')}
                        type="number"
                        step="any"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 
                                 bg-transparent focus:ring-2 focus:ring-primary dark:text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                        Longitud
                      </label>
                      <input
                        {...register('mapLongitude')}
                        type="number"
                        step="any"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 
                                 bg-transparent focus:ring-2 focus:ring-primary dark:text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                        Zoom (1-20)
                      </label>
                      <input
                        {...register('mapZoom')}
                        type="number"
                        min="1"
                        max="20"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 
                                 bg-transparent focus:ring-2 focus:ring-primary dark:text-white text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white pb-4 border-b border-slate-200 dark:border-slate-700">
                Configuración de Notificaciones
              </h2>

              {/* WhatsApp Notifications */}
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <label className="flex items-center gap-3 cursor-pointer mb-4">
                  <input
                    {...register('whatsappEnabled')}
                    type="checkbox"
                    className="w-5 h-5 rounded border-slate-300 text-green-600 focus:ring-green-500"
                  />
                  <div>
                    <span className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="text-green-600">⬤</span> WhatsApp Habilitado
                    </span>
                    <p className="text-sm text-slate-500">
                      Recibe notificaciones de nuevos leads por WhatsApp
                    </p>
                  </div>
                </label>

                {whatsappEnabled && (
                  <div className="space-y-4 ml-8">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Número de WhatsApp <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register('whatsappNumber')}
                        type="tel"
                        placeholder="+1 809 123 4567"
                        className={`w-full max-w-sm px-4 py-3 rounded-lg border bg-transparent
                                  focus:ring-2 focus:ring-primary dark:text-white
                                  ${errors.whatsappNumber ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
                      />
                      {errors.whatsappNumber && (
                        <p className="mt-1 text-sm text-red-500">{errors.whatsappNumber.message}</p>
                      )}
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        {...register('whatsappNotifyOnLead')}
                        type="checkbox"
                        className="w-5 h-5 rounded border-slate-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        Notificar cuando se reciba un nuevo lead
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {/* Email Notifications */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <label className="flex items-center gap-3 cursor-pointer mb-4">
                  <input
                    {...register('emailNotificationsEnabled')}
                    type="checkbox"
                    className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="material-symbols-outlined text-blue-600">email</span>
                      Notificaciones por Email
                    </span>
                    <p className="text-sm text-slate-500">
                      Recibe notificaciones de nuevos leads por correo electrónico
                    </p>
                  </div>
                </label>

                {emailNotificationsEnabled && (
                  <div className="ml-8">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Email de Notificación <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('notificationEmail')}
                      type="email"
                      placeholder="admin@vizionrd.com"
                      className={`w-full max-w-sm px-4 py-3 rounded-lg border bg-transparent
                                focus:ring-2 focus:ring-primary dark:text-white
                                ${errors.notificationEmail ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
                    />
                    {errors.notificationEmail && (
                      <p className="mt-1 text-sm text-red-500">{errors.notificationEmail.message}</p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Integrations Tab */}
          {activeTab === 'integrations' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white pb-4 border-b border-slate-200 dark:border-slate-700">
                Integraciones
              </h2>

              {/* Firebase Status */}
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-amber-600">local_fire_department</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-white">Firebase</h3>
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Conectado
                    </p>
                  </div>
                </div>
                <p className="text-sm text-slate-500 ml-13">
                  Authentication, Firestore y Storage están configurados y funcionando.
                </p>
              </div>

              {/* EmailJS Status */}
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-slate-100 dark:bg-slate-600 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">email</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-white">EmailJS</h3>
                    <p className="text-sm text-slate-500">
                      Configurar en variables de entorno
                    </p>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-slate-100 dark:bg-slate-600 rounded-lg font-mono text-xs text-slate-600 dark:text-slate-300">
                  <p>VITE_EMAILJS_SERVICE_ID=your_service_id</p>
                  <p>VITE_EMAILJS_TEMPLATE_ID=your_template_id</p>
                  <p>VITE_EMAILJS_PUBLIC_KEY=your_public_key</p>
                </div>
              </div>

              {/* reCAPTCHA Status */}
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-slate-100 dark:bg-slate-600 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">security</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-white">reCAPTCHA v3</h3>
                    <p className="text-sm text-slate-500">
                      Protección del formulario de contacto
                    </p>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-slate-100 dark:bg-slate-600 rounded-lg font-mono text-xs text-slate-600 dark:text-slate-300">
                  <p>VITE_RECAPTCHA_SITE_KEY=your_site_key</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Features Tab */}
          {activeTab === 'features' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white pb-4 border-b border-slate-200 dark:border-slate-700">
                Funcionalidades del Sitio
              </h2>

              <div className="space-y-4">
                {/* Catalog Toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary">inventory_2</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white">Catálogo de Productos</h3>
                      <p className="text-sm text-slate-500">Mostrar la sección de productos en el sitio</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      {...register('catalogEnabled')}
                      type="checkbox"
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 
                                  peer-focus:ring-primary/20 rounded-full peer dark:bg-slate-600 
                                  peer-checked:after:translate-x-full peer-checked:after:border-white 
                                  after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                                  after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all 
                                  peer-checked:bg-primary"></div>
                  </label>
                </div>

                {/* Contact Form Toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-green-600">contact_mail</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white">Formulario de Contacto</h3>
                      <p className="text-sm text-slate-500">Permitir envío de mensajes desde el sitio</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      {...register('contactFormEnabled')}
                      type="checkbox"
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 
                                  peer-focus:ring-primary/20 rounded-full peer dark:bg-slate-600 
                                  peer-checked:after:translate-x-full peer-checked:after:border-white 
                                  after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                                  after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all 
                                  peer-checked:bg-primary"></div>
                  </label>
                </div>

                {/* Dark Mode Default */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-800 dark:bg-slate-300 rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-white dark:text-slate-800">dark_mode</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white">Modo Oscuro por Defecto</h3>
                      <p className="text-sm text-slate-500">Iniciar el sitio en modo oscuro</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      {...register('darkModeDefault')}
                      type="checkbox"
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 
                                  peer-focus:ring-primary/20 rounded-full peer dark:bg-slate-600 
                                  peer-checked:after:translate-x-full peer-checked:after:border-white 
                                  after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                                  after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all 
                                  peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </motion.div>
          )}

          {/* Save Button */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => reset()}
              disabled={!isDirty || updateMutation.isPending}
              className="px-6 py-3 border border-slate-300 dark:border-slate-600 
                       text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 
                       dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Descartar Cambios
            </button>
            <button
              type="submit"
              disabled={!isDirty || updateMutation.isPending}
              className="flex-1 sm:flex-none px-8 py-3 bg-primary text-white rounded-lg 
                       hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center justify-center gap-2"
            >
              {updateMutation.isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">save</span>
                  Guardar Configuración
                </>
              )}
            </button>
          </div>

          {isDirty && (
            <p className="mt-4 text-sm text-amber-500 flex items-center gap-2">
              <span className="material-symbols-outlined text-base">warning</span>
              Tienes cambios sin guardar
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
