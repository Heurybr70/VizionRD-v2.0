/**
 * CarouselManagementPage - Manage Hero Carousel Slides
 * CRUD operations for carousel slides with drag-drop reorder
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-hot-toast';
import { 
  getCarouselSlides, 
  addCarouselSlide, 
  updateCarouselSlide, 
  deleteCarouselSlide,
  reorderCarouselSlides 
} from '../../services/firestore.service';
import { uploadImage, deleteImage } from '../../services/storage.service';

// Validation schema
const slideSchema = yup.object({
  title: yup.string().max(100, 'Máximo 100 caracteres'),
  subtitle: yup.string().max(200, 'Máximo 200 caracteres'),
  ctaText: yup.string().max(30, 'Máximo 30 caracteres'),
  ctaLink: yup.string().url('Debe ser una URL válida').nullable(),
  active: yup.boolean(),
});

const CarouselManagementPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  const queryClient = useQueryClient();

  // Fetch slides - false para mostrar todos (activos e inactivos) en admin
  const { data: slidesData, isLoading } = useQuery({
    queryKey: ['admin', 'carousel'],
    queryFn: () => getCarouselSlides(false),
  });

  const slides = slidesData?.data || [];

  // Form setup
  const { 
    register, 
    handleSubmit, 
    reset, 
    formState: { errors } 
  } = useForm({
    resolver: yupResolver(slideSchema),
    defaultValues: {
      title: '',
      subtitle: '',
      ctaText: '',
      ctaLink: '',
      active: true,
    }
  });

  // Add slide mutation
  const addMutation = useMutation({
    mutationFn: async (data) => {
      let imageUrl = editingSlide?.image || '';
      
      if (selectedFile) {
        setIsUploading(true);
        const uploadResult = await uploadImage(
          selectedFile, 
          'carousel', 
          (progress) => setUploadProgress(progress)
        );
        
        if (!uploadResult.success || !uploadResult.data?.url) {
          throw new Error(uploadResult.error || 'Error al subir la imagen');
        }
        
        imageUrl = uploadResult.data.url;
        setIsUploading(false);
      }
      
      const result = await addCarouselSlide({ 
        ...data, 
        image: imageUrl,
        order: slides.length 
      });
      
      // Check if the operation was successful
      if (!result.success) {
        throw new Error(result.error || 'Error al guardar en la base de datos');
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'carousel']);
      toast.success('Diapositiva creada');
      closeModal();
    },
    onError: (error) => {
      console.error('Error creating slide:', error);
      toast.error('Error al crear: ' + error.message);
      setIsUploading(false);
    }
  });

  // Update slide mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      let imageUrl = data.image || editingSlide?.image || '';
      
      if (selectedFile) {
        setIsUploading(true);
        // Delete old image if exists
        if (editingSlide?.image) {
          await deleteImage(editingSlide.image).catch(() => {});
        }
        const uploadResult = await uploadImage(
          selectedFile, 
          'carousel', 
          (progress) => setUploadProgress(progress)
        );
        
        if (!uploadResult.success || !uploadResult.data?.url) {
          throw new Error(uploadResult.error || 'Error al subir la imagen');
        }
        
        imageUrl = uploadResult.data.url;
        setIsUploading(false);
      }
      
      return updateCarouselSlide(id, { ...data, image: imageUrl });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'carousel']);
      toast.success('Diapositiva actualizada');
      closeModal();
    },
    onError: (error) => {
      toast.error('Error al actualizar: ' + error.message);
      setIsUploading(false);
    }
  });

  // Delete slide mutation
  const deleteMutation = useMutation({
    mutationFn: async (slide) => {
      if (slide.image) {
        await deleteImage(slide.image).catch(() => {});
      }
      return deleteCarouselSlide(slide.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'carousel']);
      toast.success('Diapositiva eliminada');
      setDeleteConfirm(null);
    },
    onError: (error) => {
      toast.error('Error al eliminar: ' + error.message);
    }
  });

  // Reorder mutation
  const reorderMutation = useMutation({
    mutationFn: (newOrder) => reorderCarouselSlides(newOrder),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'carousel']);
      toast.success('Orden actualizado');
    },
    onError: (error) => {
      toast.error('Error al reordenar: ' + error.message);
    }
  });

  // Toggle active mutation
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, active }) => updateCarouselSlide(id, { active }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'carousel']);
    },
  });

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Solo se permiten imágenes');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen no debe superar 5MB');
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target?.result);
      reader.readAsDataURL(file);
    }
  };

  // Handle form submit
  const onSubmit = (data) => {
    if (editingSlide) {
      updateMutation.mutate({ id: editingSlide.id, data });
    } else {
      if (!selectedFile && !previewImage) {
        toast.error('La imagen es requerida');
        return;
      }
      addMutation.mutate(data);
    }
  };

  // Open modal for new slide
  const openNewModal = () => {
    setEditingSlide(null);
    setPreviewImage(null);
    setSelectedFile(null);
    reset({
      title: '',
      subtitle: '',
      ctaText: '',
      ctaLink: '',
      active: true,
    });
    setIsModalOpen(true);
  };

  // Open modal for editing
  const openEditModal = (slide) => {
    setEditingSlide(slide);
    setPreviewImage(slide.image);
    setSelectedFile(null);
    reset({
      title: slide.title || '',
      subtitle: slide.subtitle || '',
      ctaText: slide.ctaText || '',
      ctaLink: slide.ctaLink || '',
      active: slide.active ?? true,
    });
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSlide(null);
    setPreviewImage(null);
    setSelectedFile(null);
    setUploadProgress(0);
    reset();
  };

  // Handle reorder
  const handleReorder = (newOrder) => {
    const orderMap = newOrder.map((slide, index) => ({
      id: slide.id,
      order: index
    }));
    reorderMutation.mutate(orderMap);
  };

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
            Gestión del Carrusel
          </h1>
          <p className="text-slate-500 dark:text-[#9aabbc]">
            {slides.length} diapositivas • Arrastra para reordenar
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm
                   hover:shadow-lg hover:shadow-primary/20 transition-all"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Nueva Diapositiva
        </button>
      </div>

      {/* Slides List */}
      {slides.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#101418] rounded-2xl border border-slate-200 dark:border-[#394756]">
          <span className="material-symbols-outlined text-5xl text-slate-400 mb-4 block">
            view_carousel
          </span>
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">
            No hay diapositivas configuradas
          </h3>
          <p className="text-slate-500 dark:text-[#9aabbc] mb-4">
            Crea tu primera diapositiva del carrusel
          </p>
          <button
            onClick={openNewModal}
            className="text-primary hover:underline font-bold"
          >
            Crear Primera Diapositiva
          </button>
        </div>
      ) : (
        <Reorder.Group 
          axis="y" 
          values={slides} 
          onReorder={handleReorder}
          className="space-y-4"
        >
          {slides.map((slide) => (
            <Reorder.Item 
              key={slide.id} 
              value={slide}
              className="bg-white dark:bg-[#101418] rounded-2xl border border-slate-200 
                       dark:border-[#394756] overflow-hidden cursor-grab active:cursor-grabbing hover:border-primary/30 transition-all"
            >
              <div className="flex flex-col md:flex-row">
                {/* Image Preview */}
                <div className="w-full md:w-48 h-32 bg-slate-100 dark:bg-slate-700 flex-shrink-0">
                  {slide.image ? (
                    <img 
                      src={slide.image} 
                      alt={slide.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-3xl text-slate-400">image</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {slide.title || 'Sin título'}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">
                        {slide.subtitle || 'Sin subtítulo'}
                      </p>
                      {slide.ctaText && (
                        <span className="inline-block mt-2 text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                          {slide.ctaText}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {/* Active Toggle */}
                      <button
                        onClick={() => toggleActiveMutation.mutate({ 
                          id: slide.id, 
                          active: !slide.active 
                        })}
                        className={`w-10 h-6 rounded-full transition-colors relative ${
                          slide.active ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                        title={slide.active ? 'Activa' : 'Inactiva'}
                      >
                        <span 
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            slide.active ? 'left-5' : 'left-1'
                          }`}
                        />
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => openEditModal(slide)}
                        className="p-2 text-slate-500 hover:text-primary hover:bg-slate-100 
                                 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <span className="material-symbols-outlined">edit</span>
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => setDeleteConfirm(slide)}
                        className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 
                                 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>

                      {/* Drag Handle */}
                      <span className="material-symbols-outlined text-slate-400 cursor-grab">
                        drag_indicator
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {editingSlide ? 'Editar Diapositiva' : 'Nueva Diapositiva'}
                </h2>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Imagen {!editingSlide && <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    {previewImage ? (
                      <div className="relative rounded-lg overflow-hidden h-40">
                        <img 
                          src={previewImage} 
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewImage(null);
                            setSelectedFile(null);
                          }}
                          className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full 
                                   hover:bg-black/70 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center h-40 border-2 
                                      border-dashed border-slate-300 dark:border-slate-600 rounded-lg 
                                      cursor-pointer hover:border-primary transition-colors">
                        <span className="material-symbols-outlined text-4xl text-slate-400">
                          cloud_upload
                        </span>
                        <span className="text-sm text-slate-500 mt-2">
                          Haz clic para subir una imagen
                        </span>
                        <span className="text-xs text-slate-400 mt-1">
                          PNG, JPG hasta 5MB • 1920x1080 recomendado
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    )}
                    
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                        <div className="text-center text-white">
                          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mb-2" />
                          <span>{uploadProgress}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Título
                  </label>
                  <input
                    {...register('title')}
                    type="text"
                    placeholder="Título principal"
                    className={`w-full px-4 py-3 rounded-lg border bg-transparent
                              focus:ring-2 focus:ring-primary focus:border-primary
                              dark:text-white ${errors.title ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
                  )}
                </div>

                {/* Subtitle */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Subtítulo
                  </label>
                  <textarea
                    {...register('subtitle')}
                    rows={2}
                    placeholder="Descripción breve"
                    className={`w-full px-4 py-3 rounded-lg border bg-transparent resize-none
                              focus:ring-2 focus:ring-primary focus:border-primary
                              dark:text-white ${errors.subtitle ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
                  />
                  {errors.subtitle && (
                    <p className="mt-1 text-sm text-red-500">{errors.subtitle.message}</p>
                  )}
                </div>

                {/* CTA Button */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Texto del Botón
                    </label>
                    <input
                      {...register('ctaText')}
                      type="text"
                      placeholder="Ver Más"
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 
                               bg-transparent focus:ring-2 focus:ring-primary focus:border-primary dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Enlace del Botón
                    </label>
                    <input
                      {...register('ctaLink')}
                      type="url"
                      placeholder="https://..."
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 
                               bg-transparent focus:ring-2 focus:ring-primary focus:border-primary dark:text-white"
                    />
                  </div>
                </div>

                {/* Active Toggle */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    {...register('active')}
                    type="checkbox"
                    className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    Diapositiva activa (visible en la web)
                  </span>
                </label>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 
                             text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 
                             dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={addMutation.isPending || updateMutation.isPending || isUploading}
                    className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark 
                             transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {(addMutation.isPending || updateMutation.isPending || isUploading) ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Guardando...
                      </span>
                    ) : (
                      editingSlide ? 'Actualizar' : 'Crear'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full 
                              flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl text-red-500">warning</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  ¿Eliminar diapositiva?
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                  Esta acción no se puede deshacer. La imagen también será eliminada.
                </p>
                
                <div className="flex gap-4">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 
                             text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 
                             dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(deleteConfirm)}
                    disabled={deleteMutation.isPending}
                    className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 
                             transition-colors disabled:opacity-50"
                  >
                    {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CarouselManagementPage;
