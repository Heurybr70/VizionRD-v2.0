# 🔥 Guía Completa: Configuración de Firebase para VizionRD

Esta guía te llevará paso a paso para crear y configurar tu proyecto Firebase.

---

## 📋 Índice

1. [Crear Proyecto Firebase](#1-crear-proyecto-firebase)
2. [Configurar Authentication](#2-configurar-authentication)
3. [Configurar Cloud Firestore](#3-configurar-cloud-firestore)
4. [Configurar Firebase Storage](#4-configurar-firebase-storage)
5. [Obtener Credenciales](#5-obtener-credenciales)
6. [Configurar Variables de Entorno](#6-configurar-variables-de-entorno)
7. [Inicializar Datos](#7-inicializar-datos)
8. [Crear Usuario Admin](#8-crear-usuario-admin)
9. [Desplegar Reglas de Seguridad](#9-desplegar-reglas-de-seguridad)

---

## 1. Crear Proyecto Firebase

### Paso 1: Ir a Firebase Console
1. Abre tu navegador y ve a: **https://console.firebase.google.com/**
2. Inicia sesión con tu cuenta de Google

### Paso 2: Crear Nuevo Proyecto
1. Clic en **"Agregar proyecto"** o **"Create a project"**
2. **Nombre del proyecto**: `VizionRD` (o el nombre que prefieras)
3. **Google Analytics**: Puedes habilitarlo o deshabilitarlo (recomendado habilitarlo para métricas)
4. Si habilitaste Analytics, selecciona o crea una cuenta de Analytics
5. Clic en **"Crear proyecto"** y espera a que se complete

---

## 2. Configurar Authentication

### Paso 1: Ir a Authentication
1. En el panel lateral izquierdo, clic en **"Authentication"**
2. Clic en **"Comenzar"** o **"Get started"**

### Paso 2: Habilitar Email/Password
1. Ir a la pestaña **"Sign-in method"**
2. Clic en **"Correo electrónico/contraseña"**
3. Habilitar el primer toggle **"Correo electrónico/contraseña"**
4. **NO habilitar** "Vínculo en correo electrónico (sin contraseña)" por ahora
5. Clic en **"Guardar"**

### Paso 3: Habilitar Google Sign-In (Opcional)
1. Clic en **"Google"**
2. Habilitar el toggle
3. Configurar el correo de asistencia del proyecto
4. Clic en **"Guardar"**

---

## 3. Configurar Cloud Firestore

### Paso 1: Crear Base de Datos
1. En el panel lateral, clic en **"Firestore Database"**
2. Clic en **"Crear base de datos"**
3. **Modo de producción** o **Modo de prueba**:
   - Para desarrollo, selecciona **"Modo de prueba"** (permite lectura/escritura por 30 días)
   - Para producción, selecciona **"Modo de producción"** y luego configura reglas
4. **Ubicación**: Selecciona la más cercana a tus usuarios
   - Para República Dominicana: `us-east1` (South Carolina) o `us-east4` (Northern Virginia)
5. Clic en **"Habilitar"**

### Paso 2: Estructura de Colecciones
Firebase creará automáticamente las colecciones cuando se agreguen datos. Las colecciones que usará VizionRD son:

```
firestore/
├── products/           # Productos del catálogo
├── carousel_slides/    # Slides del carrusel hero
├── leads/              # Leads de contacto
├── site_content/       # Contenido editable del sitio
├── site_settings/      # Configuraciones generales
└── users/              # Información de usuarios admin
```

---

## 4. Configurar Firebase Storage

### Paso 1: Crear Bucket de Storage
1. En el panel lateral, clic en **"Storage"**
2. Clic en **"Comenzar"**
3. Acepta las reglas de seguridad por defecto (las cambiaremos después)
4. Selecciona la misma ubicación que Firestore
5. Clic en **"Listo"**

### Paso 2: Estructura de Carpetas
Storage se organizará automáticamente así:
```
storage/
├── carousel/           # Imágenes del carrusel
│   └── thumbnails/     # Miniaturas
├── products/           # Imágenes de productos
│   └── thumbnails/     # Miniaturas
└── content/            # Imágenes de contenido
```

---

## 5. Obtener Credenciales

### Paso 1: Ir a Configuración del Proyecto
1. Clic en el ícono de engranaje ⚙️ junto a "Project Overview"
2. Selecciona **"Configuración del proyecto"**

### Paso 2: Registrar App Web
1. Ve a la pestaña **"General"**
2. En la sección "Tus apps", clic en el ícono de **"</>"** (Web)
3. **Nombre de la app**: `VizionRD Web`
4. **Opcional**: Habilitar Firebase Hosting (no necesario por ahora)
5. Clic en **"Registrar app"**

### Paso 3: Copiar Configuración
Firebase te mostrará algo como esto:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD...",
  authDomain: "vizionrd.firebaseapp.com",
  projectId: "vizionrd",
  storageBucket: "vizionrd.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};
```

**¡GUARDA ESTOS VALORES!** Los necesitarás para el siguiente paso.

---

## 6. Configurar Variables de Entorno

### Paso 1: Editar archivo .env
Abre el archivo `.env` en la carpeta `frontend/` y reemplaza los valores placeholder:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyD...  # Tu apiKey
VITE_FIREBASE_AUTH_DOMAIN=vizionrd.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=vizionrd
VITE_FIREBASE_STORAGE_BUCKET=vizionrd.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123def456

# EmailJS (para formulario de contacto)
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key

# reCAPTCHA (opcional, para proteger formularios)
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key

# WhatsApp (número de contacto)
VITE_WHATSAPP_NUMBER=18091234567
```

### Paso 2: Reiniciar Servidor
Después de modificar `.env`, reinicia el servidor de desarrollo:
```bash
# Ctrl+C para detener
npm run dev
```

---

## 7. Inicializar Datos

### Paso 1: Crear Documento de Configuración
Ve a **Firestore Database** en la consola de Firebase y crea manualmente:

**Colección:** `site_settings`
**Documento ID:** `main`
**Campos:**
```json
{
  "businessName": "VizionRD",
  "currency": "DOP",
  "timezone": "America/Santo_Domingo",
  "whatsappEnabled": true,
  "whatsappNumber": "18091234567",
  "catalogEnabled": true,
  "contactFormEnabled": true,
  "emailNotificationsEnabled": true,
  "darkModeDefault": true,
  "createdAt": [Timestamp now],
  "updatedAt": [Timestamp now]
}
```

**Colección:** `site_content`
**Documento ID:** `hero_section`
**Campos:**
```json
{
  "title": "Premium Auto Parts & Accessories",
  "subtitle": "Quality automotive products for your vehicle",
  "ctaText": "View Catalog",
  "ctaLink": "/productos"
}
```

---

## 8. Crear Usuario Admin

### Opción A: Desde Firebase Console (Recomendado)

1. Ve a **Authentication** > **Users**
2. Clic en **"Agregar usuario"**
3. Ingresa:
   - **Email**: tu-email@ejemplo.com
   - **Contraseña**: Una contraseña segura (mínimo 8 caracteres)
4. Clic en **"Agregar usuario"**
5. Copia el **User UID** que aparece

### Opción B: Marcar como Admin en Firestore
1. Ve a **Firestore Database**
2. Crea la colección **`users`** si no existe
3. Crea un documento con **ID = el User UID copiado**
4. Agrega estos campos:
```json
{
  "email": "tu-email@ejemplo.com",
  "role": "admin",
  "displayName": "Admin VizionRD",
  "createdAt": [Timestamp now]
}
```

Ahora puedes iniciar sesión en `/admin/login` con ese email y contraseña.

---

## 9. Desplegar Reglas de Seguridad

### Firestore Rules
Ve a **Firestore Database** > **Rules** y pega:

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Products - public read, admin write
    match /products/{productId} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }
    
    // Carousel - public read, admin write
    match /carousel_slides/{slideId} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }
    
    // Leads - authenticated read/write
    match /leads/{leadId} {
      allow create: if true;
      allow read, update, delete: if isAdmin();
    }
    
    // Site content - public read, admin write
    match /site_content/{documentId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Site settings - authenticated read, admin write
    match /site_settings/{documentId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // Users - own document read, admin full access
    match /users/{userId} {
      allow read: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
      allow write: if isAdmin();
    }
  }
}
```

Clic en **"Publicar"**.

### Storage Rules
Ve a **Storage** > **Rules** y pega:

```rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isImage() {
      return request.resource.contentType.matches('image/.*');
    }
    
    function isUnder5MB() {
      return request.resource.size < 5 * 1024 * 1024;
    }
    
    // Public read for all images
    match /{allPaths=**} {
      allow read: if true;
    }
    
    // Carousel images
    match /carousel/{imageId} {
      allow write: if isAuthenticated() && isImage() && isUnder5MB();
    }
    
    // Product images
    match /products/{imageId} {
      allow write: if isAuthenticated() && isImage() && isUnder5MB();
    }
    
    // Content images
    match /content/{imageId} {
      allow write: if isAuthenticated() && isImage() && isUnder5MB();
    }
  }
}
```

Clic en **"Publicar"**.

---

## ✅ Verificación Final

1. **Abre** http://localhost:5173/
2. **Verifica** que la página carga sin errores en la consola
3. **Ve a** http://localhost:5173/admin/login
4. **Inicia sesión** con el usuario admin creado
5. **Verifica** que puedes acceder al dashboard

### Problemas Comunes

| Error | Solución |
|-------|----------|
| "Firebase: Error (auth/invalid-api-key)" | Verifica que `VITE_FIREBASE_API_KEY` está correcto en `.env` |
| "Permission denied" en Firestore | Verifica que las reglas están publicadas y el usuario tiene rol admin |
| Imágenes no cargan | Verifica las reglas de Storage y la URL del bucket |
| "Module not found" | Ejecuta `npm install` nuevamente |

---

## 🚀 ¡Listo!

Tu proyecto Firebase está configurado. Ahora puedes:

- ✅ Iniciar sesión en el panel admin
- ✅ Gestionar productos
- ✅ Editar el carrusel
- ✅ Ver leads de contacto
- ✅ Editar contenido del sitio

---

## 📞 Soporte

Si tienes problemas, verifica:
1. La consola del navegador (F12 > Console)
2. Que todas las variables en `.env` estén correctas
3. Que las reglas de Firestore y Storage estén publicadas
4. Que el usuario tenga rol "admin" en la colección `users`
