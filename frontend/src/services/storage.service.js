/**
 * Storage Service - Firebase Cloud Storage Operations
 * Handles image uploads, deletions, and URL retrieval
 */

import { 
  ref, 
  uploadBytes, 
  uploadBytesResumable,
  getDownloadURL, 
  deleteObject,
  listAll 
} from 'firebase/storage';
import { storage } from './firebase';

// Allowed image types
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Validate file before upload
 * @param {File} file - File to validate
 * @returns {Object} Validation result
 */
const validateFile = (file) => {
  if (!file) {
    return { valid: false, error: 'No se ha seleccionado ningún archivo' };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { 
      valid: false, 
      error: 'Tipo de archivo no permitido. Use: JPG, PNG, WebP o GIF' 
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { 
      valid: false, 
      error: `El archivo excede el tamaño máximo de ${MAX_FILE_SIZE / 1024 / 1024}MB` 
    };
  }

  return { valid: true };
};

/**
 * Generate unique filename with timestamp
 * @param {string} originalName - Original file name
 * @returns {string} Unique filename
 */
const generateFileName = (originalName) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop().toLowerCase();
  const baseName = originalName.split('.').slice(0, -1).join('.').replace(/[^a-zA-Z0-9]/g, '-');
  return `${baseName}-${timestamp}-${randomString}.${extension}`;
};

/**
 * Upload image to Firebase Storage
 * @param {File} file - File to upload
 * @param {string} folder - Destination folder (carousel, products, site)
 * @param {Function} onProgress - Progress callback (optional)
 * @returns {Promise<Object>} Upload result with URL
 */
export const uploadImage = async (file, folder = 'products', onProgress = null) => {
  try {
    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Generate unique filename
    const fileName = generateFileName(file.name);
    const filePath = `${folder}/${fileName}`;
    const storageRef = ref(storage, filePath);

    // Set metadata
    const metadata = {
      contentType: file.type,
      customMetadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString()
      }
    };

    // Upload with progress tracking
    if (onProgress) {
      return new Promise((resolve, reject) => {
        const uploadTask = uploadBytesResumable(storageRef, file, metadata);
        
        uploadTask.on('state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(progress);
          },
          (error) => {
            console.error('Upload error:', error);
            resolve({ success: false, error: getStorageErrorMessage(error) });
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({
              success: true,
              data: {
                url: downloadURL,
                path: filePath,
                fileName,
                size: file.size,
                type: file.type
              }
            });
          }
        );
      });
    } else {
      // Simple upload without progress
      const snapshot = await uploadBytes(storageRef, file, metadata);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return {
        success: true,
        data: {
          url: downloadURL,
          path: filePath,
          fileName,
          size: file.size,
          type: file.type
        }
      };
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    return { success: false, error: getStorageErrorMessage(error) };
  }
};

/**
 * Upload multiple images
 * @param {FileList|Array} files - Files to upload
 * @param {string} folder - Destination folder
 * @param {Function} onProgress - Progress callback (receives {current, total, progress})
 * @returns {Promise<Object>} Upload results
 */
export const uploadMultipleImages = async (files, folder = 'products', onProgress = null) => {
  try {
    const fileArray = Array.from(files);
    const results = [];
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      
      const result = await uploadImage(file, folder, (progress) => {
        if (onProgress) {
          onProgress({
            current: i + 1,
            total: fileArray.length,
            progress,
            fileName: file.name
          });
        }
      });

      if (result.success) {
        successCount++;
        results.push({ ...result.data, originalFile: file.name });
      } else {
        failCount++;
        results.push({ error: result.error, originalFile: file.name });
      }
    }

    return {
      success: failCount === 0,
      data: {
        results,
        successCount,
        failCount,
        total: fileArray.length
      }
    };
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete image from Firebase Storage
 * @param {string} pathOrUrl - File path or full URL
 * @returns {Promise<Object>} Deletion result
 */
export const deleteImage = async (pathOrUrl) => {
  try {
    let path = pathOrUrl;
    
    // If it's a full URL, extract the path
    if (pathOrUrl.includes('firebasestorage.googleapis.com')) {
      const url = new URL(pathOrUrl);
      // Extract path from URL: /v0/b/bucket/o/path%2Ffile.jpg
      const pathMatch = url.pathname.match(/\/o\/(.+)/);
      if (pathMatch) {
        path = decodeURIComponent(pathMatch[1].split('?')[0]);
      }
    }

    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting image:', error);
    // Don't fail if file doesn't exist
    if (error.code === 'storage/object-not-found') {
      return { success: true, warning: 'El archivo ya no existe' };
    }
    return { success: false, error: getStorageErrorMessage(error) };
  }
};

/**
 * Get download URL for a file
 * @param {string} path - File path in storage
 * @returns {Promise<Object>} Result with URL
 */
export const getImageUrl = async (path) => {
  try {
    const storageRef = ref(storage, path);
    const url = await getDownloadURL(storageRef);
    return { success: true, url };
  } catch (error) {
    console.error('Error getting image URL:', error);
    return { success: false, error: getStorageErrorMessage(error) };
  }
};

/**
 * List all files in a folder
 * @param {string} folder - Folder path
 * @returns {Promise<Object>} List of files with URLs
 */
export const listImages = async (folder) => {
  try {
    const folderRef = ref(storage, folder);
    const result = await listAll(folderRef);
    
    const files = await Promise.all(
      result.items.map(async (item) => {
        const url = await getDownloadURL(item);
        return {
          name: item.name,
          path: item.fullPath,
          url
        };
      })
    );

    return { success: true, data: files };
  } catch (error) {
    console.error('Error listing images:', error);
    return { success: false, error: getStorageErrorMessage(error) };
  }
};

/**
 * Compress image before upload (client-side)
 * @param {File} file - Image file
 * @param {Object} options - Compression options
 * @returns {Promise<Blob>} Compressed image blob
 */
export const compressImage = async (file, options = {}) => {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.85,
    type = 'image/jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      let { width, height } = img;

      // Calculate new dimensions
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        type,
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Upload with automatic compression
 * @param {File} file - File to upload
 * @param {string} folder - Destination folder
 * @param {Object} compressionOptions - Compression settings
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Object>} Upload result
 */
export const uploadCompressedImage = async (
  file, 
  folder = 'products', 
  compressionOptions = {},
  onProgress = null
) => {
  try {
    // Skip compression for small files or non-compressible types
    if (file.size < 500 * 1024 || file.type === 'image/gif') {
      return uploadImage(file, folder, onProgress);
    }

    const compressedBlob = await compressImage(file, compressionOptions);
    
    // Create a new File from the compressed blob
    const compressedFile = new File(
      [compressedBlob], 
      file.name, 
      { type: compressionOptions.type || 'image/jpeg' }
    );

    return uploadImage(compressedFile, folder, onProgress);
  } catch (error) {
    console.error('Error compressing image:', error);
    // Fallback to original upload if compression fails
    return uploadImage(file, folder, onProgress);
  }
};

/**
 * Get user-friendly error messages
 * @param {Error} error - Firebase Storage error
 * @returns {string} User-friendly message
 */
const getStorageErrorMessage = (error) => {
  const errorMessages = {
    'storage/unauthorized': 'No tienes permiso para realizar esta acción',
    'storage/canceled': 'La subida fue cancelada',
    'storage/unknown': 'Ocurrió un error desconocido',
    'storage/object-not-found': 'El archivo no existe',
    'storage/bucket-not-found': 'El bucket de almacenamiento no existe',
    'storage/project-not-found': 'El proyecto no existe',
    'storage/quota-exceeded': 'Se ha excedido la cuota de almacenamiento',
    'storage/unauthenticated': 'Debes iniciar sesión para subir archivos',
    'storage/retry-limit-exceeded': 'Tiempo máximo de reintento excedido',
    'storage/invalid-checksum': 'El archivo está corrupto',
    'storage/server-file-wrong-size': 'Error de tamaño de archivo en el servidor'
  };

  return errorMessages[error.code] || error.message || 'Error al procesar el archivo';
};

/**
 * Upload thumbnail version of an image
 * @param {File} file - Image file to create thumbnail from
 * @param {string} folder - Destination folder
 * @param {number} maxSize - Max dimension for thumbnail (default 200px)
 * @returns {Promise<Object>} Upload result with URL
 */
export const uploadThumbnail = async (file, folder = 'products', maxSize = 200) => {
  try {
    // Compress/resize image for thumbnail
    const compressedBlob = await compressImage(file, {
      maxWidth: maxSize,
      maxHeight: maxSize,
      quality: 0.7
    });

    // Convertir Blob a File con nombre original
    const thumbnailFile = new File(
      [compressedBlob], 
      `thumb_${file.name}`, 
      { type: compressedBlob.type || 'image/jpeg' }
    );

    // Upload to thumbnails subfolder
    const thumbnailFolder = `${folder}/thumbnails`;
    return await uploadImage(thumbnailFile, thumbnailFolder);
  } catch (error) {
    console.error('Error creating thumbnail:', error);
    return { success: false, error: error.message };
  }
};

export default {
  uploadImage,
  uploadMultipleImages,
  uploadCompressedImage,
  uploadThumbnail,
  deleteImage,
  getImageUrl,
  listImages,
  compressImage
};
