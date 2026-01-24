/**
 * ContentEditorPage - Edit Site Content Sections
 * Edit hero, about, footer, and other content sections
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { 
  getSiteContent, 
  updateSiteContent 
} from '../../services/firestore.service';
import { uploadImage, deleteImage } from '../../services/storage.service';
import { useAuth } from '../../context/AuthContext';

// Content sections configuration
const CONTENT_SECTIONS = [
  { 
    id: 'hero_section', 
    label: 'Sección Hero', 
    icon: 'view_carousel',
    description: 'Título principal y descripción de la página de inicio',
    fields: [
      { name: 'title', label: 'Título Principal', type: 'text', required: true },
      { name: 'subtitle', label: 'Subtítulo', type: 'textarea' },
      { name: 'ctaText', label: 'Texto del Botón', type: 'text' },
      { name: 'ctaLink', label: 'Enlace del Botón', type: 'text' },
    ]
  },
  { 
    id: 'about_us', 
    label: 'Nosotros', 
    icon: 'info',
    description: 'Información de la empresa, misión y visión',
    fields: [
      { name: 'title', label: 'Título', type: 'text', required: true },
      { name: 'description', label: 'Descripción', type: 'textarea', required: true },
      { name: 'mission', label: 'Misión', type: 'textarea' },
      { name: 'vision', label: 'Visión', type: 'textarea' },
      { name: 'history', label: 'Historia', type: 'textarea' },
    ]
  },
  { 
    id: 'contact_info', 
    label: 'Información de Contacto', 
    icon: 'contact_page',
    description: 'Datos de contacto mostrados en el sitio',
    fields: [
      { name: 'address', label: 'Dirección', type: 'text' },
      { name: 'phone', label: 'Teléfono', type: 'text' },
      { name: 'whatsapp', label: 'WhatsApp', type: 'text' },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'hours', label: 'Horario de Atención', type: 'textarea' },
    ]
  },
  { 
    id: 'social_links', 
    label: 'Redes Sociales', 
    icon: 'share',
    description: 'Enlaces a redes sociales',
    fields: [
      { name: 'facebook', label: 'Facebook URL', type: 'url' },
      { name: 'instagram', label: 'Instagram URL', type: 'url' },
      { name: 'twitter', label: 'Twitter/X URL', type: 'url' },
      { name: 'youtube', label: 'YouTube URL', type: 'url' },
      { name: 'tiktok', label: 'TikTok URL', type: 'url' },
    ]
  },
  { 
    id: 'footer', 
    label: 'Pie de Página', 
    icon: 'bottom_navigation',
    description: 'Contenido del footer y textos legales',
    fields: [
      { name: 'companyDescription', label: 'Descripción de la Empresa', type: 'textarea' },
      { name: 'copyright', label: 'Texto de Copyright', type: 'text' },
      { name: 'privacyPolicyUrl', label: 'URL Política de Privacidad', type: 'url' },
      { name: 'termsUrl', label: 'URL Términos y Condiciones', type: 'url' },
    ]
  },
  { 
    id: 'seo', 
    label: 'SEO y Meta Tags', 
    icon: 'search',
    description: 'Configuración para motores de búsqueda',
    fields: [
      { name: 'siteTitle', label: 'Título del Sitio', type: 'text', required: true },
      { name: 'siteDescription', label: 'Descripción del Sitio', type: 'textarea', required: true },
      { name: 'keywords', label: 'Palabras Clave (separadas por coma)', type: 'text' },
      { name: 'ogImage', label: 'Imagen Open Graph (URL)', type: 'url' },
    ]
  },
];

const ContentEditorPage = () => {
  const [activeSection, setActiveSection] = useState(CONTENT_SECTIONS[0].id);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get active section config
  const sectionConfig = CONTENT_SECTIONS.find(s => s.id === activeSection);

  // Fetch content for active section
  const { data: contentData, isLoading } = useQuery({
    queryKey: ['admin', 'content', activeSection],
    queryFn: () => getSiteContent(activeSection),
  });

  const content = contentData?.data || {};

  // Form setup
  const { 
    register, 
    handleSubmit, 
    reset,
    setValue,
    watch,
    formState: { errors, isDirty } 
  } = useForm();

  // Update form when content changes
  useState(() => {
    if (content && sectionConfig) {
      sectionConfig.fields.forEach(field => {
        setValue(field.name, content[field.name] || '');
      });
    }
  }, [content, sectionConfig]);

  // Update content mutation
  const updateMutation = useMutation({
    mutationFn: (data) => updateSiteContent(activeSection, {
      ...data,
      updatedAt: new Date(),
      updatedBy: user?.email || 'unknown'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'content', activeSection]);
      toast.success('Contenido actualizado');
    },
    onError: (error) => {
      toast.error('Error al guardar: ' + error.message);
    }
  });

  // Handle form submit
  const onSubmit = (data) => {
    updateMutation.mutate(data);
  };

  // Handle image upload for specific field
  const handleImageUpload = async (fieldName, file) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten imágenes');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe superar 5MB');
      return;
    }

    setIsUploading(true);
    try {
      // Delete old image if exists
      const currentUrl = watch(fieldName);
      if (currentUrl && currentUrl.includes('firebase')) {
        await deleteImage(currentUrl).catch(() => {});
      }

      const result = await uploadImage(
        file, 
        'content', 
        (progress) => setUploadProgress(progress)
      );
      
      if (!result.success || !result.data?.url) {
        throw new Error(result.error || 'Error al subir la imagen');
      }
      
      setValue(fieldName, result.data.url, { shouldDirty: true });
      toast.success('Imagen subida');
    } catch (error) {
      toast.error('Error al subir imagen: ' + error.message);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Reset form to original values
  const handleReset = () => {
    if (content && sectionConfig) {
      const values = {};
      sectionConfig.fields.forEach(field => {
        values[field.name] = content[field.name] || '';
      });
      reset(values);
    }
  };

  // Render field based on type
  const renderField = (field) => {
    const baseClasses = `w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-[#27303a] border-none
                        focus:ring-2 focus:ring-primary transition-all
                        text-slate-900 dark:text-white placeholder:text-slate-500 ${errors[field.name] ? 'ring-2 ring-red-500' : ''}`;

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            {...register(field.name, { required: field.required && 'This field is required' })}
            rows={4}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            className={`${baseClasses} resize-none`}
          />
        );
      
      case 'image':
        return (
          <div className="space-y-2">
            {watch(field.name) && (
              <div className="relative w-full h-32 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700">
                <img 
                  src={watch(field.name)} 
                  alt={field.label}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setValue(field.name, '', { shouldDirty: true })}
                  className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full 
                           hover:bg-black/70 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            )}
            <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed 
                            border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer 
                            hover:border-primary transition-colors">
              <span className="material-symbols-outlined text-slate-400">cloud_upload</span>
              <span className="text-sm text-slate-500">Subir imagen</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(field.name, file);
                }}
                className="hidden"
              />
            </label>
            {isUploading && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                <span>Subiendo... {uploadProgress}%</span>
              </div>
            )}
          </div>
        );

      case 'url':
        return (
          <input
            {...register(field.name, { 
              required: field.required && 'Este campo es requerido',
              pattern: field.required ? {
                value: /^https?:\/\/.+/,
                message: 'Debe ser una URL válida (https://...)'
              } : undefined
            })}
            type="url"
            placeholder="https://..."
            className={baseClasses}
          />
        );

      case 'email':
        return (
          <input
            {...register(field.name, { 
              required: field.required && 'Este campo es requerido',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Email inválido'
              }
            })}
            type="email"
            placeholder="ejemplo@correo.com"
            className={baseClasses}
          />
        );

      default:
        return (
          <input
            {...register(field.name, { required: field.required && 'Este campo es requerido' })}
            type="text"
            placeholder={field.placeholder || `Ingresa ${field.label.toLowerCase()}`}
            className={baseClasses}
          />
        );
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-8rem)]">
      {/* Sidebar - Section Navigation */}
      <div className="lg:w-72 flex-shrink-0">
        <div className="bg-white dark:bg-[#101418] rounded-2xl border border-slate-200 dark:border-[#394756] 
                      overflow-hidden sticky top-6">
          <div className="p-4 border-b border-slate-200 dark:border-[#394756]">
            <h2 className="font-bold text-slate-900 dark:text-white">
              Content Sections
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#9aabbc] mt-1">
              Select a section to edit
            </p>
          </div>
          <nav className="p-2">
            {CONTENT_SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => {
                  if (isDirty) {
                    if (!confirm('You have unsaved changes. Continue anyway?')) {
                      return;
                    }
                  }
                  setActiveSection(section.id);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                  activeSection === section.id
                    ? 'sidebar-item-active text-primary'
                    : 'hover:bg-slate-100 dark:hover:bg-[#27303a] text-slate-600 dark:text-[#9aabbc] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined">{section.icon}</span>
                <span className="text-sm font-semibold">{section.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content - Editor */}
      <div className="flex-1">
        <div className="bg-white dark:bg-[#101418] rounded-2xl border border-slate-200 dark:border-[#394756]">
          {/* Section Header */}
          <div className="p-6 border-b border-slate-200 dark:border-[#394756]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">{sectionConfig?.icon}</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  {sectionConfig?.label}
                </h1>
                <p className="text-sm text-slate-500 dark:text-[#9aabbc]">
                  {sectionConfig?.description}
                </p>
              </div>
            </div>
            
            {content?.updatedAt && (
              <p className="text-xs text-[#9aabbc] mt-2">
                Last updated: {new Date(content.updatedAt.toDate?.() || content.updatedAt).toLocaleString('en-US')}
                {content.updatedBy && ` by ${content.updatedBy}`}
              </p>
            )}
          </div>

          {/* Form */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="p-6">
              <div className="space-y-6">
                {sectionConfig?.fields.map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {renderField(field)}
                    {errors[field.name] && (
                      <p className="mt-1 text-sm text-red-500">{errors[field.name].message}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={handleReset}
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
                      Guardar Cambios
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
            </form>
          )}
        </div>

        {/* Preview Section */}
        <div className="mt-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined">visibility</span>
            Vista Previa
          </h3>
          
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
            {activeSection === 'hero_section' && (
              <div className="text-center py-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  {watch('title') || 'Título Principal'}
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
                  {watch('subtitle') || 'Subtítulo descriptivo'}
                </p>
                {watch('ctaText') && (
                  <button className="px-6 py-2 bg-primary text-white rounded-lg">
                    {watch('ctaText')}
                  </button>
                )}
              </div>
            )}

            {activeSection === 'about_us' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {watch('title') || 'Sobre Nosotros'}
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  {watch('description') || 'Descripción de la empresa...'}
                </p>
                {watch('mission') && (
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200">Misión</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{watch('mission')}</p>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'contact_info' && (
              <div className="grid grid-cols-2 gap-4">
                {watch('phone') && (
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">phone</span>
                    <span className="text-slate-700 dark:text-slate-300">{watch('phone')}</span>
                  </div>
                )}
                {watch('email') && (
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">email</span>
                    <span className="text-slate-700 dark:text-slate-300">{watch('email')}</span>
                  </div>
                )}
                {watch('address') && (
                  <div className="flex items-center gap-2 col-span-2">
                    <span className="material-symbols-outlined text-primary">location_on</span>
                    <span className="text-slate-700 dark:text-slate-300">{watch('address')}</span>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'social_links' && (
              <div className="flex gap-4 justify-center">
                {watch('facebook') && (
                  <a href="#" className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center">
                    <span className="text-lg">f</span>
                  </a>
                )}
                {watch('instagram') && (
                  <a href="#" className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-500 text-white rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined">photo_camera</span>
                  </a>
                )}
                {watch('youtube') && (
                  <a href="#" className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined">play_arrow</span>
                  </a>
                )}
              </div>
            )}

            {activeSection === 'footer' && (
              <div className="text-center text-sm text-slate-500 dark:text-slate-400">
                <p>{watch('companyDescription') || 'Descripción de la empresa'}</p>
                <p className="mt-2">{watch('copyright') || '© 2024 VizionRD. Todos los derechos reservados.'}</p>
              </div>
            )}

            {activeSection === 'seo' && (
              <div className="space-y-2">
                <div className="text-blue-600 text-lg">{watch('siteTitle') || 'Título del Sitio'}</div>
                <div className="text-green-600 text-sm">www.vizionrd.com</div>
                <div className="text-slate-600 dark:text-slate-400 text-sm">
                  {watch('siteDescription') || 'Descripción del sitio para motores de búsqueda...'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentEditorPage;
