/**
 * ProductsManagementPage - Manage Product Catalog
 * CRUD operations for products with image upload and categories
 */

import { useState, useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-hot-toast';
import { 
  getProducts, 
  addProduct, 
  updateProduct, 
  deleteProduct 
} from '../../services/firestore.service';
import { uploadImage, uploadThumbnail, deleteImage } from '../../services/storage.service';

// Product categories
const CATEGORIES = [
  { value: 'exterior', label: 'Cuidado Exterior' },
  { value: 'interior', label: 'Cuidado Interior' },
  { value: 'engine', label: 'Motor' },
  { value: 'tires', label: 'Neumáticos y Llantas' },
  { value: 'accessories', label: 'Accesorios' },
  { value: 'kits', label: 'Kits Completos' },
];

// Validation schema
const productSchema = yup.object({
  name: yup.string().required('El nombre es requerido').max(100, 'Máximo 100 caracteres'),
  description: yup.string().required('La descripción es requerida').max(500, 'Máximo 500 caracteres'),
  category: yup.string().required('La categoría es requerida'),
  price: yup.number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .required('El precio es requerido')
    .min(0, 'El precio debe ser positivo'),
  comparePrice: yup.number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .nullable()
    .min(0, 'El precio debe ser positivo'),
  sku: yup.string().max(50, 'Máximo 50 caracteres'),
  stock: yup.number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .min(0, 'El stock debe ser positivo'),
  featured: yup.boolean(),
  active: yup.boolean(),
});

const ProductsManagementPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // grid or table
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Fetch products - false para mostrar todos (activos e inactivos) en admin
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: () => getProducts(false),
  });

  const products = productsData?.data || [];

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      const matchesSearch = 
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, categoryFilter, searchTerm]);

  // Form setup
  const { 
    register, 
    handleSubmit, 
    reset, 
    watch,
    control,
    formState: { errors } 
  } = useForm({
    resolver: yupResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      category: '',
      price: '',
      comparePrice: '',
      sku: '',
      stock: 0,
      featured: false,
      active: true,
      dynamicFields: [],
    }
  });

  // Campos dinámicos
  const { fields: dynamicFields, append, remove } = useFieldArray({
    control,
    name: 'dynamicFields',
  });

  const watchPrice = watch('price');
  const watchComparePrice = watch('comparePrice');

  // Add product mutation
  const addMutation = useMutation({
    mutationFn: async (data) => {
      let imageUrl = '';
      let thumbnailUrl = '';
      
      if (selectedFile) {
        setIsUploading(true);
        const uploadResult = await uploadImage(
          selectedFile, 
          'products', 
          (progress) => setUploadProgress(progress)
        );
        
        if (!uploadResult.success || !uploadResult.data?.url) {
          throw new Error(uploadResult.error || 'Error al subir la imagen');
        }
        
        imageUrl = uploadResult.data.url;
        
        // Create thumbnail
        const thumbResult = await uploadThumbnail(selectedFile, 'products');
        thumbnailUrl = thumbResult.data?.url || '';
        setIsUploading(false);
      }
      
      return addProduct({ 
        ...data, 
        image: imageUrl,
        thumbnail: thumbnailUrl,
        createdAt: new Date(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'products']);
      toast.success('Producto creado');
      closeModal();
    },
    onError: (error) => {
      toast.error('Error al crear: ' + error.message);
      setIsUploading(false);
    }
  });

  // Update product mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      let imageUrl = editingProduct?.image || '';
      let thumbnailUrl = editingProduct?.thumbnail || '';
      
      if (selectedFile) {
        setIsUploading(true);
        // Delete old images if exist
        if (editingProduct?.image) {
          await deleteImage(editingProduct.image).catch(() => {});
          if (editingProduct?.thumbnail) {
            await deleteImage(editingProduct.thumbnail).catch(() => {});
          }
        }
        
        const uploadResult = await uploadImage(
          selectedFile, 
          'products', 
          (progress) => setUploadProgress(progress)
        );
        
        if (!uploadResult.success || !uploadResult.data?.url) {
          throw new Error(uploadResult.error || 'Error al subir la imagen');
        }
        
        imageUrl = uploadResult.data.url;
        
        const thumbResult = await uploadThumbnail(selectedFile, 'products');
        thumbnailUrl = thumbResult.data?.url || '';
        setIsUploading(false);
      }
      
      return updateProduct(id, { 
        ...data, 
        image: imageUrl,
        thumbnail: thumbnailUrl,
        updatedAt: new Date(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'products']);
      toast.success('Producto actualizado');
      closeModal();
    },
    onError: (error) => {
      toast.error('Error al actualizar: ' + error.message);
      setIsUploading(false);
    }
  });

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: async (product) => {
      if (product.image) {
        await deleteImage(product.image).catch(() => {});
        if (product.thumbnail) {
          await deleteImage(product.thumbnail).catch(() => {});
        }
      }
      return deleteProduct(product.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'products']);
      toast.success('Producto eliminado');
      setDeleteConfirm(null);
    },
    onError: (error) => {
      toast.error('Error al eliminar: ' + error.message);
    }
  });

  // Toggle featured mutation
  const toggleFeaturedMutation = useMutation({
    mutationFn: ({ id, featured }) => updateProduct(id, { featured }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'products']);
    },
  });

  // Toggle active mutation
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, active }) => updateProduct(id, { active }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'products']);
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
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data });
    } else {
      if (!selectedFile) {
        toast.error('La imagen es requerida');
        return;
      }
      addMutation.mutate(data);
    }
  };

  // Open modal for new product
  const openNewModal = () => {
    setEditingProduct(null);
    setPreviewImage(null);
    setSelectedFile(null);
    reset({
      name: '',
      description: '',
      category: '',
      price: '',
      comparePrice: '',
      sku: '',
      stock: 0,
      featured: false,
      active: true,
    });
    setIsModalOpen(true);
  };

  // Open modal for editing
  const openEditModal = (product) => {
    setEditingProduct(product);
    setPreviewImage(product.image);
    setSelectedFile(null);
    reset({
      name: product.name || '',
      description: product.description || '',
      category: product.category || '',
      price: product.price || '',
      comparePrice: product.comparePrice || '',
      sku: product.sku || '',
      stock: product.stock || 0,
      featured: product.featured ?? false,
      active: product.active ?? true,
      dynamicFields: Array.isArray(product.dynamicFields) ? product.dynamicFields : [],
    });
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setPreviewImage(null);
    setSelectedFile(null);
    setUploadProgress(0);
    reset();
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(price || 0);
  };

  // Get category label
  const getCategoryLabel = (value) => {
    return CATEGORIES.find(c => c.value === value)?.label || value;
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
            Gestión de Productos
          </h1>
          <p className="text-slate-500 dark:text-[#9aabbc]">
            {products.length} productos en el catálogo
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm
                   hover:shadow-lg hover:shadow-primary/20 transition-all"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Nuevo Producto
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between 
                    bg-white dark:bg-[#101418] p-4 rounded-2xl border border-slate-200 dark:border-[#394756]">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md group">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
              search
            </span>
            <input
              type="text"
              placeholder="Buscar por nombre o SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-[#27303a] border-none
                       text-sm focus:ring-2 focus:ring-primary transition-all text-slate-900 dark:text-white placeholder:text-slate-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-[#27303a] border-none
                     text-sm focus:ring-2 focus:ring-primary transition-all
                     text-slate-900 dark:text-white min-w-[180px]"
          >
                        <option value="all">Todas las Categorías</option>
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-[#27303a] rounded-xl">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid' 
                ? 'bg-white dark:bg-[#394756] shadow-sm text-primary' 
                : 'text-slate-500 hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined">grid_view</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'table' 
                ? 'bg-white dark:bg-[#394756] shadow-sm text-primary' 
                : 'text-slate-500 hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined">list</span>
          </button>
        </div>
      </div>

      {/* Products Grid/Table */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#101418] rounded-2xl border border-slate-200 dark:border-[#394756]">
          <span className="material-symbols-outlined text-5xl text-slate-400 mb-4 block">
            inventory_2
          </span>
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">
            {searchTerm || categoryFilter !== 'all' 
              ? 'No products found'
              : 'No products yet'}
          </h3>
          <p className="text-slate-500 dark:text-[#9aabbc] mb-4">
            {searchTerm || categoryFilter !== 'all' 
              ? 'Try different search terms or filters'
              : 'Add your first product to the catalog'}
          </p>
          {!searchTerm && categoryFilter === 'all' && (
            <button
              onClick={openNewModal}
              className="text-primary hover:underline font-bold"
            >
              Add First Product
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-[#101418] rounded-2xl border border-slate-200 
                       dark:border-[#394756] overflow-hidden group hover:border-primary/50 transition-all"
            >
              {/* Image */}
              <div className="relative h-48 bg-slate-100 dark:bg-[#1b2128]">
                {product.image ? (
                  <img 
                    src={product.thumbnail || product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-4xl text-slate-400">image</span>
                  </div>
                )}
                
                {/* Badges */}
                <div className="absolute top-2 left-2 flex gap-2">
                  {product.featured && (
                    <span className="px-2 py-1 bg-yellow-500 text-white text-xs rounded-full">
                      Destacado
                    </span>
                  )}
                  {!product.active && (
                    <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                      Inactivo
                    </span>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEditModal(product)}
                      className="p-2 bg-white/90 dark:bg-slate-800/90 rounded-lg hover:bg-primary 
                               hover:text-white transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(product)}
                      className="p-2 bg-white/90 dark:bg-slate-800/90 rounded-lg hover:bg-red-500 
                               hover:text-white transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <span className="text-xs text-primary font-medium uppercase">
                  {getCategoryLabel(product.category)}
                </span>
                <h3 className="font-semibold text-slate-900 dark:text-white mt-1 line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                  {product.description}
                </p>
                
                <div className="flex items-center justify-between mt-3">
                  <div>
                    <span className="font-bold text-lg text-slate-900 dark:text-white">
                      {formatPrice(product.price)}
                    </span>
                    {product.comparePrice > product.price && (
                      <span className="ml-2 text-sm text-slate-400 line-through">
                        {formatPrice(product.comparePrice)}
                      </span>
                    )}
                  </div>
                  {product.sku && (
                    <span className="text-xs text-slate-400">SKU: {product.sku}</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                    Producto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                    Categoría
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                    Precio
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                    Stock
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-700 flex-shrink-0 overflow-hidden">
                          {product.thumbnail ? (
                            <img 
                              src={product.thumbnail} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="material-symbols-outlined text-slate-400">image</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white line-clamp-1">
                            {product.name}
                          </p>
                          {product.sku && (
                            <p className="text-xs text-slate-400">SKU: {product.sku}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        {getCategoryLabel(product.category)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-900 dark:text-white">
                        {formatPrice(product.price)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm ${
                        product.stock <= 0 
                          ? 'text-red-500' 
                          : product.stock <= 5 
                            ? 'text-yellow-500' 
                            : 'text-slate-600 dark:text-slate-300'
                      }`}>
                        {product.stock ?? '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleActiveMutation.mutate({ 
                            id: product.id, 
                            active: !product.active 
                          })}
                          className={`px-2 py-1 text-xs rounded-full ${
                            product.active 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}
                        >
                          {product.active ? 'Activo' : 'Inactivo'}
                        </button>
                        {product.featured && (
                          <span className="material-symbols-outlined text-yellow-500 text-sm">star</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => toggleFeaturedMutation.mutate({ 
                            id: product.id, 
                            featured: !product.featured 
                          })}
                          className={`p-2 rounded-lg transition-colors ${
                            product.featured 
                              ? 'text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20' 
                              : 'text-slate-400 hover:text-yellow-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                          title={product.featured ? 'Quitar destacado' : 'Destacar'}
                        >
                          <span className="material-symbols-outlined">
                            {product.featured ? 'star' : 'star_outline'}
                          </span>
                        </button>
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-2 text-slate-500 hover:text-primary hover:bg-slate-100 
                                   dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(product)}
                          className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 
                                   dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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
              className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white dark:bg-slate-800 p-6 border-b border-slate-200 dark:border-slate-700 z-10">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                </h2>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Imagen del Producto {!editingProduct && <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    {previewImage ? (
                      <div className="relative rounded-lg overflow-hidden h-48">
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
                      <label className="flex flex-col items-center justify-center h-48 border-2 
                                      border-dashed border-slate-300 dark:border-slate-600 rounded-lg 
                                      cursor-pointer hover:border-primary transition-colors">
                        <span className="material-symbols-outlined text-4xl text-slate-400">
                          cloud_upload
                        </span>
                        <span className="text-sm text-slate-500 mt-2">
                          Haz clic para subir una imagen
                        </span>
                        <span className="text-xs text-slate-400 mt-1">
                          PNG, JPG hasta 5MB • 800x800 recomendado
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

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Nombre del Producto <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('name')}
                    type="text"
                    placeholder="Ej: Cera Carnauba Premium"
                    className={`w-full px-4 py-3 rounded-lg border bg-transparent
                              focus:ring-2 focus:ring-primary focus:border-primary
                              dark:text-white ${errors.name ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Descripción <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    placeholder="Descripción del producto..."
                    className={`w-full px-4 py-3 rounded-lg border bg-transparent resize-none
                              focus:ring-2 focus:ring-primary focus:border-primary
                              dark:text-white ${errors.description ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
                  )}
                </div>

                {/* Dynamic Fields */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Características adicionales
                  </label>
                  <div className="space-y-3">
                    {dynamicFields.map((field, idx) => (
                      <div key={field.id} className="flex gap-2 items-center">
                        <input
                          {...register(`dynamicFields.${idx}.label`)}
                          type="text"
                          placeholder="Ej: Volumen"
                          className="w-1/3 px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-transparent dark:text-white"
                        />
                        <input
                          {...register(`dynamicFields.${idx}.value`)}
                          type="text"
                          placeholder="Ej: 5L"
                          className="w-1/2 px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-transparent dark:text-white"
                        />
                        <button type="button" onClick={() => remove(idx)} className="text-red-500 hover:text-red-700">
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => append({ label: '', value: '' })}
                    className="mt-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-all"
                  >
                    Añadir característica
                  </button>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Categoría <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('category')}
                    className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary focus:border-primary
                      ${isDark ? 'bg-slate-800 text-white border-slate-600' : 'bg-white text-slate-900 border-slate-300'}
                      ${errors.category ? 'border-red-500' : ''}`}
                  >
                    <option value="" className={isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'}>Seleccionar categoría</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value} className={isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'}>{cat.label}</option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>
                  )}
                </div>

                {/* Price Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Precio <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">RD$</span>
                      <input
                        {...register('price')}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className={`w-full pl-14 pr-4 py-3 rounded-lg border bg-transparent
                                  focus:ring-2 focus:ring-primary focus:border-primary
                                  dark:text-white ${errors.price ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
                      />
                    </div>
                    {errors.price && (
                      <p className="mt-1 text-sm text-red-500">{errors.price.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Precio Comparativo
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">RD$</span>
                      <input
                        {...register('comparePrice')}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full pl-14 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 
                                 bg-transparent focus:ring-2 focus:ring-primary focus:border-primary dark:text-white"
                      />
                    </div>
                    {watchComparePrice && watchPrice && Number(watchComparePrice) > Number(watchPrice) && (
                      <p className="mt-1 text-xs text-green-500">
                        Ahorro: {formatPrice(Number(watchComparePrice) - Number(watchPrice))}
                      </p>
                    )}
                  </div>
                </div>

                {/* SKU and Stock */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      SKU
                    </label>
                    <input
                      {...register('sku')}
                      type="text"
                      placeholder="VIZ-001"
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 
                               bg-transparent focus:ring-2 focus:ring-primary focus:border-primary dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Stock
                    </label>
                    <input
                      {...register('stock')}
                      type="number"
                      min="0"
                      placeholder="0"
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 
                               bg-transparent focus:ring-2 focus:ring-primary focus:border-primary dark:text-white"
                    />
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      {...register('featured')}
                      type="checkbox"
                      className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      Producto Destacado
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      {...register('active')}
                      type="checkbox"
                      className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      Activo (visible en la web)
                    </span>
                  </label>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
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
                      editingProduct ? 'Actualizar Producto' : 'Crear Producto'
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
                  ¿Eliminar producto?
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-2">
                  <strong>{deleteConfirm.name}</strong>
                </p>
                <p className="text-sm text-slate-400 mb-6">
                  Esta acción no se puede deshacer.
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

export default ProductsManagementPage;
