# VizionRD - Arquitectura Full-Stack

## 📐 Visión General

Sistema web completo para VizionRD con sitio público tipo landing + catálogo de productos + panel administrativo, implementado con React, Firebase y Node.js.

## 🏗️ Stack Tecnológico

### Frontend
- **React 18** con React Router v6
- **TailwindCSS** + HeadlessUI (componentes accesibles)
- **Framer Motion** (animaciones suaves)
- **React Hook Form** + Yup (validación de formularios)
- **React DnD** (drag & drop para reordenar)
- **Swiper.js** (carousel táctil responsive)
- **React Hot Toast** (notificaciones)

### Backend & Servicios
- **Firebase Cloud Functions** (Node.js 18+)
- **Firebase Firestore** (base de datos)
- **Firebase Authentication** (Email/Password + Google)
- **Firebase Storage** (imágenes)
- **Firebase Hosting** (despliegue)
- **EmailJS** (envío de correos desde frontend - con rate limiting)
- **WhatsApp Cloud API** (integración desde backend)
- **Express.js** (para Functions)

### Seguridad & Performance
- **reCAPTCHA v3** (anti-spam invisible)
- **Rate Limiting** (limitación de peticiones)
- **Honeypot** (trampa para bots)
- **Image Optimization** (compresión automática)
- **Lazy Loading** (carga diferida de imágenes)
- **Security Rules** (Firestore + Storage)

### DevOps
- **Vite** (build tool ultra-rápido)
- **ESLint + Prettier** (calidad de código)
- **Husky + Lint-Staged** (pre-commit hooks)
- **.env** (variables de entorno)
- **Firebase Emulators** (desarrollo local)

---

## 📊 Modelo de Datos (Firestore)

### Colección: `carousel_slides`
```javascript
{
  id: "auto-generated",
  order: 0, // número para ordenar
  imageUrl: "https://...",
  imageStoragePath: "carousel/image-123.jpg",
  title: "Título del slide (opcional)",
  subtitle: "Subtítulo (opcional)",
  buttonText: "Texto del botón (opcional)",
  buttonLink: "#productos",
  active: true,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Colección: `carousel_config`
```javascript
{
  id: "main_carousel",
  autoplayDuration: 5000, // ms
  transitionDuration: 800,
  showDots: true,
  showArrows: true,
  loop: true
}
```

### Colección: `products`
```javascript
{
  id: "auto-generated",
  order: 0,
  active: true,
  name: "Sellador Uretano Vizion",
  imageUrl: "https://...",
  imageStoragePath: "products/product-456.jpg",
  
  // Campos base estructurados
  baseDetails: {
    volume: "1 galón",
    productType: "Sellador Premium",
    specialFeature: "Protección UV avanzada"
  },
  
  // Descripción principal
  mainDescription: "Descripción larga del producto...",
  
  // Detalles dinámicos (campos adicionales editables)
  dynamicFields: [
    {
      id: "field-1",
      label: "Modo de uso",
      content: "Aplicar con pistola neumática...",
      order: 0
    },
    {
      id: "field-2",
      label: "Precauciones",
      content: "Usar en área ventilada...",
      order: 1
    }
  ],
  
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Colección: `contact_leads`
```javascript
{
  id: "auto-generated",
  name: "Juan Pérez",
  email: "juan@example.com",
  phone: "+1-809-555-1234",
  subject: "Consulta sobre Sellador Uretano",
  message: "Me interesa conocer más...",
  productId: "product-123" // si viene de un producto específico (opcional),
  
  // Status del lead
  status: "new", // new | contacted | qualified | closed
  
  // Tracking de envíos
  emailSent: true,
  emailSentAt: Timestamp,
  whatsappSent: true,
  whatsappSentAt: Timestamp,
  
  // Metadatos
  source: "contact_form", // contact_form | product_detail
  userAgent: "Mozilla/5.0...",
  ipAddress: "192.168.1.1" (opcional para auditoría),
  
  createdAt: Timestamp,
  updatedAt: Timestamp,
  
  // Notas del admin
  adminNotes: "Cliente interesado en compra al mayor"
}
```

### Colección: `site_content` (contenido editable)
```javascript
{
  id: "hero_section",
  type: "hero",
  content: {
    title: "Pasión por la <span>Perfección</span>",
    subtitle: "VizionRD: Elevando el estándar...",
    ctaPrimary: "Nuestra Historia",
    ctaSecondary: "Ver Servicios"
  },
  updatedAt: Timestamp,
  updatedBy: "admin-uid"
}

{
  id: "about_us",
  type: "about",
  content: {
    mission: "Texto de la misión...",
    vision: "Texto de la visión...",
    values: "Texto de los valores...",
    story: "Historia de la empresa..."
  },
  updatedAt: Timestamp
}

{
  id: "contact_info",
  type: "contact",
  content: {
    address: "Santo Domingo, República Dominicana",
    phone: "+1-809-555-XXXX",
    email: "info@vizionrd.com",
    whatsapp: "+1-809-555-XXXX",
    mapLatitude: 18.4861,
    mapLongitude: -69.9312,
    socialLinks: {
      facebook: "https://facebook.com/vizionrd",
      instagram: "https://instagram.com/vizionrd",
      twitter: "https://twitter.com/vizionrd"
    }
  },
  updatedAt: Timestamp
}

{
  id: "site_settings",
  type: "settings",
  content: {
    siteName: "VizionRD",
    tagline: "Elite Car Care",
    logoUrl: "https://...",
    favicon: "https://...",
    primaryColor: "#007fff",
    whatsappEnabled: true,
    whatsappNumber: "+1809XXXXXXX"
  },
  updatedAt: Timestamp
}
```

### Colección: `users` (roles y permisos)
```javascript
{
  id: "user-uid", // mismo ID que Firebase Auth
  email: "admin@vizionrd.com",
  displayName: "Admin VizionRD",
  role: "admin", // admin | editor | viewer
  permissions: {
    manageCarousel: true,
    manageProducts: true,
    manageLeads: true,
    manageSiteContent: true,
    manageUsers: false // solo super-admin
  },
  createdAt: Timestamp,
  lastLogin: Timestamp
}
```

### Colección: `audit_logs` (auditoría de cambios)
```javascript
{
  id: "auto-generated",
  userId: "user-uid",
  userEmail: "admin@vizionrd.com",
  action: "update_product", // create | update | delete
  resource: "products",
  resourceId: "product-123",
  changes: {
    before: { name: "Nombre anterior" },
    after: { name: "Nombre nuevo" }
  },
  timestamp: Timestamp,
  ipAddress: "192.168.1.1"
}
```

---

## 🔒 Reglas de Seguridad

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isSignedIn() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isEditor() {
      return isSignedIn() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'editor'];
    }
    
    // Carousel - público lectura, admin escritura
    match /carousel_slides/{slideId} {
      allow read: if true;
      allow create, update, delete: if isEditor();
    }
    
    match /carousel_config/{configId} {
      allow read: if true;
      allow write: if isEditor();
    }
    
    // Products - público lectura, admin escritura
    match /products/{productId} {
      allow read: if true;
      allow create, update, delete: if isEditor();
    }
    
    // Contact leads - crear público (con validación), leer/editar solo admin
    match /contact_leads/{leadId} {
      allow read: if isAdmin();
      allow create: if request.resource.data.keys().hasAll(['name', 'email', 'message']) &&
                       request.resource.data.name is string &&
                       request.resource.data.email is string &&
                       request.resource.data.message is string &&
                       request.resource.data.createdAt == request.time;
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }
    
    // Site content - público lectura, admin escritura
    match /site_content/{contentId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Users - solo admin puede leer/escribir
    match /users/{userId} {
      allow read: if isAdmin() || (isSignedIn() && request.auth.uid == userId);
      allow write: if isAdmin();
    }
    
    // Audit logs - solo crear desde backend, leer por admin
    match /audit_logs/{logId} {
      allow read: if isAdmin();
      allow create: if isAdmin(); // En realidad, solo desde Cloud Functions
      allow update, delete: if false;
    }
  }
}
```

### Storage Security Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isSignedIn() && 
             firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isEditor() {
      return isSignedIn() && 
             firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role in ['admin', 'editor'];
    }
    
    function isValidImageSize() {
      return request.resource.size < 5 * 1024 * 1024; // 5MB max
    }
    
    function isValidImageType() {
      return request.resource.contentType.matches('image/.*');
    }
    
    // Carousel images
    match /carousel/{imageId} {
      allow read: if true;
      allow write: if isEditor() && isValidImageSize() && isValidImageType();
      allow delete: if isEditor();
    }
    
    // Product images
    match /products/{imageId} {
      allow read: if true;
      allow write: if isEditor() && isValidImageSize() && isValidImageType();
      allow delete: if isEditor();
    }
    
    // Site assets (logo, favicon, etc.)
    match /site/{assetId} {
      allow read: if true;
      allow write: if isAdmin() && isValidImageSize() && isValidImageType();
      allow delete: if isAdmin();
    }
  }
}
```

---

## 🎯 Flujo de Arquitectura

### 1. Flujo del Sitio Público

```
Usuario → Landing Page (/) 
  ├─ Navbar (sticky)
  ├─ Hero con Carousel dinámico (desde Firestore)
  ├─ Sección Productos (grid cards → modal detalle)
  ├─ Sección Sobre Nosotros (misión/visión/valores editables)
  ├─ Sección Contacto (formulario)
  └─ Footer (redes sociales editables)

Al enviar formulario contacto:
  1. Validación frontend (React Hook Form + Yup)
  2. Verificación reCAPTCHA v3
  3. Honeypot check
  4. Rate limiting (max 3 envíos por IP por hora)
  5. Guardar en Firestore (contact_leads)
  6. Enviar email (EmailJS desde frontend con claves públicas)
  7. Llamar Cloud Function → enviar WhatsApp (backend seguro)
  8. Mostrar confirmación al usuario
```

### 2. Flujo del Panel Admin

```
Admin → /admin/login
  ├─ Firebase Auth (Email/Password + Google)
  └─ Verificación de rol en Firestore

Admin autenticado → /admin/dashboard
  ├─ Sidebar navigation
  │   ├─ Dashboard (stats + leads recientes)
  │   ├─ Carousel Manager
  │   ├─ Products Manager
  │   ├─ Leads Manager
  │   ├─ Site Content Editor
  │   └─ Settings
  │
  ├─ Carousel Manager (/admin/carousel)
  │   ├─ Drag & drop para reordenar slides
  │   ├─ Upload imagen → Firebase Storage → URL → Firestore
  │   ├─ Editar configuración (duración, controles)
  │   └─ Activar/desactivar slides
  │
  ├─ Products Manager (/admin/products)
  │   ├─ Lista con búsqueda/filtros
  │   ├─ Crear producto (modal o página)
  │   │   ├─ Upload imagen
  │   │   ├─ Campos base (nombre, volumen, tipo, etc.)
  │   │   └─ Campos dinámicos (add/remove/reorder)
  │   ├─ Editar producto (mismo flow)
  │   ├─ Drag & drop para reordenar productos
  │   └─ Eliminar (con confirmación)
  │
  ├─ Leads Manager (/admin/leads)
  │   ├─ Tabla con filtros por status
  │   ├─ Ver detalle del lead
  │   ├─ Cambiar status (nuevo → contactado → cualificado → cerrado)
  │   ├─ Agregar notas internas
  │   └─ Exportar CSV
  │
  ├─ Site Content Editor (/admin/content)
  │   ├─ Editor WYSIWYG para secciones de texto
  │   ├─ Hero section (título, subtítulo, CTAs)
  │   ├─ Sobre Nosotros (misión, visión, valores)
  │   ├─ Contacto (dirección, teléfono, mapa coords)
  │   └─ Redes sociales (links editables)
  │
  └─ Settings (/admin/settings)
      ├─ Site settings (nombre, logo, colores)
      ├─ WhatsApp config (activar/desactivar, número)
      └─ Email config (plantilla, destinatarios)

Todas las operaciones admin:
  → Protegidas por Security Rules
  → Registradas en audit_logs
  → Confirmaciones antes de eliminaciones
```

### 3. Flujo Backend (Cloud Functions)

```
Cloud Functions (Node.js):

1. sendWhatsAppMessage (HTTPS callable)
   Input: { leadId, name, email, phone, message }
   Process:
     - Verificar que el request viene de usuario autenticado o tiene valid token
     - Rate limiting (max 10 mensajes por hora)
     - Construir mensaje formateado
     - Llamar WhatsApp Cloud API con ACCESS_TOKEN (env var)
     - Actualizar lead en Firestore (whatsappSent: true)
     - Registrar en audit_logs
   Output: { success: true, messageId: "wamid.xxx" }

2. onLeadCreated (Firestore trigger)
   Trigger: onCreate en contact_leads
   Process:
     - Auto-enviar WhatsApp (si está habilitado en settings)
     - Notificar a admin por email (opcional)
     - Registrar en audit_logs

3. compressAndUploadImage (HTTPS callable - opcional)
   Input: { imageBase64, folder }
   Process:
     - Validar tamaño y tipo
     - Comprimir con Sharp
     - Subir a Storage
     - Retornar URL pública
   Output: { url, storagePath }

4. exportLeadsToCSV (HTTPS callable)
   Input: { filters }
   Process:
     - Verificar que usuario es admin
     - Consultar Firestore con filtros
     - Generar CSV
     - Retornar stream o URL temporal
   Output: { csvUrl }
```

---

## 📁 Estructura del Proyecto

```
vizionrd/
│
├── frontend/                          # React App
│   ├── public/
│   │   ├── favicon.ico
│   │   ├── logo.svg
│   │   └── robots.txt
│   │
│   ├── src/
│   │   ├── assets/                    # Imágenes estáticas
│   │   │   └── icons/
│   │   │
│   │   ├── components/                # Componentes reutilizables
│   │   │   ├── common/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── LoadingSpinner.jsx
│   │   │   │   └── SEO.jsx
│   │   │   │
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   └── AdminLayout.jsx
│   │   │   │
│   │   │   ├── carousel/
│   │   │   │   ├── CarouselSlider.jsx (public view)
│   │   │   │   └── CarouselManager.jsx (admin)
│   │   │   │
│   │   │   ├── products/
│   │   │   │   ├── ProductCard.jsx
│   │   │   │   ├── ProductDetailModal.jsx
│   │   │   │   └── ProductEditor.jsx (admin)
│   │   │   │
│   │   │   └── forms/
│   │   │       ├── ContactForm.jsx
│   │   │       └── DynamicFieldEditor.jsx
│   │   │
│   │   ├── pages/                     # Páginas principales
│   │   │   ├── public/
│   │   │   │   ├── HomePage.jsx
│   │   │   │   ├── ProductsPage.jsx
│   │   │   │   ├── AboutPage.jsx
│   │   │   │   └── ContactPage.jsx
│   │   │   │
│   │   │   ├── admin/
│   │   │   │   ├── LoginPage.jsx
│   │   │   │   ├── DashboardPage.jsx
│   │   │   │   ├── CarouselManagementPage.jsx
│   │   │   │   ├── ProductsManagementPage.jsx
│   │   │   │   ├── LeadsManagementPage.jsx
│   │   │   │   ├── ContentEditorPage.jsx
│   │   │   │   └── SettingsPage.jsx
│   │   │   │
│   │   │   └── NotFoundPage.jsx
│   │   │
│   │   ├── hooks/                     # Custom hooks
│   │   │   ├── useAuth.js
│   │   │   ├── useFirestore.js
│   │   │   ├── useStorage.js
│   │   │   ├── useTheme.js
│   │   │   └── useRateLimiter.js
│   │   │
│   │   ├── services/                  # Servicios Firebase
│   │   │   ├── firebase.js            # Config + init
│   │   │   ├── auth.service.js
│   │   │   ├── firestore.service.js
│   │   │   ├── storage.service.js
│   │   │   ├── email.service.js       # EmailJS
│   │   │   └── whatsapp.service.js    # Llamada a Cloud Function
│   │   │
│   │   ├── context/                   # Context API
│   │   │   ├── AuthContext.jsx
│   │   │   ├── ThemeContext.jsx
│   │   │   └── SiteContentContext.jsx
│   │   │
│   │   ├── utils/                     # Utilidades
│   │   │   ├── validation.js          # Esquemas Yup
│   │   │   ├── formatting.js
│   │   │   ├── imageOptimizer.js
│   │   │   └── constants.js
│   │   │
│   │   ├── styles/                    # Estilos globales
│   │   │   ├── index.css              # Tailwind imports
│   │   │   └── animations.css
│   │   │
│   │   ├── App.jsx                    # Router principal
│   │   ├── main.jsx                   # Entry point
│   │   └── ProtectedRoute.jsx         # HOC para rutas admin
│   │
│   ├── .env.example
│   ├── .env.local
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── README.md
│
├── functions/                         # Cloud Functions
│   ├── src/
│   │   ├── index.js                   # Export de functions
│   │   ├── whatsapp/
│   │   │   └── sendWhatsAppMessage.js
│   │   ├── email/
│   │   │   └── sendEmail.js (opcional)
│   │   ├── images/
│   │   │   └── compressImage.js
│   │   ├── exports/
│   │   │   └── exportLeads.js
│   │   ├── triggers/
│   │   │   └── onLeadCreated.js
│   │   └── utils/
│   │       ├── rateLimiter.js
│   │       └── logger.js
│   │
│   ├── .env.example
│   ├── .env.local
│   ├── package.json
│   └── README.md
│
├── firestore.rules                    # Security Rules Firestore
├── storage.rules                      # Security Rules Storage
├── firebase.json                      # Firebase config
├── .firebaserc                        # Firebase projects
├── .gitignore
├── ARCHITECTURE.md                    # Este archivo
├── DEPLOYMENT.md                      # Guía de despliegue
└── README.md                          # Documentación general
```

---

## 🚀 Flujo de Desarrollo

### 1. Setup Inicial
```bash
# Clonar repo
git clone <repo-url>
cd vizionrd

# Instalar dependencias frontend
cd frontend
npm install

# Instalar dependencias functions
cd ../functions
npm install

# Configurar Firebase CLI
npm install -g firebase-tools
firebase login
firebase use vizionrd-7ff80

# Iniciar emulators (dev local)
cd ..
firebase emulators:start
```

### 2. Variables de Entorno

**frontend/.env.local**
```env
VITE_FIREBASE_API_KEY=AIzaSyBsaIeCirQToipVUwEPunicDsp0n7CCBqo
VITE_FIREBASE_AUTH_DOMAIN=vizionrd-7ff80.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=vizionrd-7ff80
VITE_FIREBASE_STORAGE_BUCKET=vizionrd-7ff80.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=902882320681
VITE_FIREBASE_APP_ID=1:902882320681:web:a5041c3347c3ba6e36d738
VITE_FIREBASE_MEASUREMENT_ID=G-K83WVNS2PL

# EmailJS (claves públicas - OK en frontend)
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key

# reCAPTCHA v3 (clave pública)
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
```

**functions/.env.local** (NUNCA commitear)
```env
# WhatsApp Cloud API (META)
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token
WHATSAPP_WABA_ID=your_waba_id
WHATSAPP_RECIPIENT_NUMBER=+1809XXXXXXX

# reCAPTCHA v3 (clave secreta)
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key

# EmailJS (si se usa desde backend)
EMAILJS_PRIVATE_KEY=your_emailjs_private_key
```

### 3. Desarrollo Local
```bash
# Terminal 1: Frontend (Vite dev server)
cd frontend
npm run dev
# → http://localhost:5173

# Terminal 2: Firebase Emulators
cd ..
firebase emulators:start
# → Firestore: localhost:8080
# → Functions: localhost:5001
# → Auth: localhost:9099
# → UI: localhost:4000
```

### 4. Build & Deploy
```bash
# Build frontend
cd frontend
npm run build
# → dist/ folder

# Deploy a Firebase Hosting + Functions
cd ..
firebase deploy --only hosting,functions,firestore:rules,storage:rules
```

---

## 🔐 Seguridad Implementada

### Frontend
1. **Rate Limiting Local**: Max 3 intentos de formulario por IP por hora (localStorage)
2. **Honeypot**: Campo invisible para detectar bots
3. **reCAPTCHA v3**: Verificación invisible en todos los formularios
4. **Validación**: React Hook Form + Yup (sanitización de inputs)
5. **HTTPS Only**: Forzado en Firebase Hosting
6. **CSP Headers**: Content Security Policy (firebase.json)

### Backend (Cloud Functions)
1. **Rate Limiting**: Max 10 WhatsApp por hora (Firestore-based)
2. **Token Verification**: Verificar Firebase Auth tokens
3. **Input Sanitization**: Validar todos los inputs
4. **Environment Variables**: Secretos nunca expuestos
5. **CORS**: Configurado solo para dominios autorizados
6. **Logging**: Winston para auditoría completa

### Firebase
1. **Security Rules**: Firestore + Storage (ver arriba)
2. **Auth**: Solo Email/Password + Google (sin anonymous)
3. **Role-Based Access**: Admin/Editor/Viewer en Firestore
4. **Audit Logs**: Registro de todas las operaciones críticas

---

## 📱 Responsive & Accesibilidad

### Breakpoints (Tailwind)
```javascript
{
  'sm': '640px',   // Mobile landscape
  'md': '768px',   // Tablet
  'lg': '1024px',  // Desktop
  'xl': '1280px',  // Large desktop
  '2xl': '1536px'  // Extra large
}
```

### Mobile-First Approach
- Diseño base para móvil
- Progressive enhancement para tablets/desktop
- Touch-friendly (botones min 44x44px)
- Swipe gestures en carousel

### Accesibilidad (WCAG 2.1 AA)
- Semantic HTML (header, nav, main, footer, article)
- ARIA labels en iconos y controles
- Focus visible (outline customizado)
- Contraste mínimo 4.5:1 (texto) y 3:1 (UI)
- Navegación por teclado completa
- Alt text en todas las imágenes
- Screen reader friendly

---

## ⚡ Performance

### Optimizaciones Frontend
1. **Code Splitting**: React.lazy() para rutas
2. **Image Lazy Loading**: Native lazy loading + Intersection Observer
3. **Image Optimization**: WebP con fallback a JPG
4. **Tree Shaking**: Vite automático
5. **Minification**: CSS + JS en build
6. **Caching**: Service Worker (opcional, via Workbox)
7. **CDN**: Firebase Hosting global CDN

### Optimizaciones Backend
1. **Indexes**: Firestore indexes para queries complejas
2. **Pagination**: Limit queries (20 items por página)
3. **Caching**: Cache de site_content (5 min) con React Query
4. **Compression**: Gzip/Brotli en responses

### Métricas Objetivo (Lighthouse)
- Performance: >90
- Accessibility: >95
- Best Practices: >90
- SEO: >90

---

## 🧪 Testing (Opcional pero Recomendado)

### Frontend
- **Unit Tests**: Vitest + React Testing Library
- **E2E Tests**: Playwright (flujos críticos)
- **Visual Regression**: Percy (opcional)

### Backend
- **Unit Tests**: Jest (functions)
- **Integration Tests**: Firebase Emulators

```bash
# Ejecutar tests
cd frontend
npm test

cd ../functions
npm test
```

---

## 📦 Dependencias Principales

### Frontend
```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.22.0",
    "firebase": "^10.8.0",
    "@tanstack/react-query": "^5.20.0",
    "react-hook-form": "^7.50.0",
    "yup": "^1.3.3",
    "@headlessui/react": "^1.7.18",
    "@heroicons/react": "^2.1.1",
    "framer-motion": "^11.0.5",
    "swiper": "^11.0.6",
    "react-hot-toast": "^2.4.1",
    "@emailjs/browser": "^3.11.0",
    "react-beautiful-dnd": "^13.1.1"
  },
  "devDependencies": {
    "vite": "^5.1.0",
    "tailwindcss": "^3.4.1",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.35",
    "eslint": "^8.56.0",
    "prettier": "^3.2.5"
  }
}
```

### Backend (Functions)
```json
{
  "dependencies": {
    "firebase-admin": "^12.0.0",
    "firebase-functions": "^4.6.0",
    "express": "^4.18.2",
    "axios": "^1.6.5",
    "winston": "^3.11.0",
    "sharp": "^0.33.2",
    "csv-writer": "^1.6.0"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "firebase-functions-test": "^3.1.1"
  }
}
```

---

## 🎨 Tema Dark/Light

### Implementación
```javascript
// ThemeContext.jsx
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // 1. Check localStorage
    const stored = localStorage.getItem('theme');
    if (stored) return stored;
    
    // 2. Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  });
  
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

### Tailwind Config
```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#007fff',
        'background-light': '#fafafa',
        'background-dark': '#16181d',
      }
    }
  }
}
```

---

## 🌐 SEO & Meta Tags

### Componente SEO
```jsx
// components/common/SEO.jsx
import { Helmet } from 'react-helmet-async';

export const SEO = ({ 
  title = 'VizionRD - Elite Car Care',
  description = 'Servicios profesionales de detallado automotriz en República Dominicana',
  image = 'https://vizionrd.com/og-image.jpg',
  url = 'https://vizionrd.com'
}) => (
  <Helmet>
    <title>{title}</title>
    <meta name="description" content={description} />
    
    {/* OpenGraph */}
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={image} />
    <meta property="og:url" content={url} />
    <meta property="og:type" content="website" />
    
    {/* Twitter Card */}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={image} />
    
    {/* Canonical */}
    <link rel="canonical" href={url} />
  </Helmet>
);
```

---

## ✅ Checklist de Validación

### Funcional
- [ ] Carousel dinámico funciona (auto-play, controles, táctil)
- [ ] Productos se muestran y filtran correctamente
- [ ] Detalle de producto abre modal/página con toda la info
- [ ] Formulario contacto envía email (EmailJS)
- [ ] Formulario contacto envía WhatsApp (Cloud Function)
- [ ] Leads se guardan en Firestore con timestamp
- [ ] Admin puede login con Email/Password
- [ ] Admin puede login con Google
- [ ] Admin puede crear/editar/eliminar carousel slides
- [ ] Admin puede reordenar slides (drag & drop)
- [ ] Admin puede crear/editar/eliminar productos
- [ ] Admin puede agregar campos dinámicos a productos
- [ ] Admin puede cambiar status de leads
- [ ] Admin puede editar contenido de secciones (hero, about, contact)
- [ ] Admin puede editar configuración del sitio (logo, colores, WhatsApp)
- [ ] Dark/light mode funciona y persiste
- [ ] Navegación smooth entre secciones
- [ ] Todas las imágenes cargan con lazy loading

### Seguridad
- [ ] Firestore rules bloquean escrituras públicas
- [ ] Storage rules bloquean uploads públicos
- [ ] Solo admins pueden acceder a /admin/*
- [ ] reCAPTCHA v3 funciona en formularios
- [ ] Honeypot detecta bots
- [ ] Rate limiting previene spam
- [ ] Tokens de WhatsApp no expuestos en frontend
- [ ] Audit logs registran operaciones admin

### Performance
- [ ] Lighthouse Performance >90
- [ ] Imágenes optimizadas (<500KB cada una)
- [ ] Lazy loading funciona
- [ ] Code splitting implementado
- [ ] Firebase Hosting CDN activo

### Responsive
- [ ] Sitio funciona en móvil (375px)
- [ ] Sitio funciona en tablet (768px)
- [ ] Sitio funciona en desktop (1920px)
- [ ] Carousel táctil en móvil
- [ ] Navbar responsive (hamburger menu)
- [ ] Admin panel responsive

### Accesibilidad
- [ ] Navegación por teclado funciona
- [ ] Focus visible en todos los elementos interactivos
- [ ] Alt text en todas las imágenes
- [ ] Contraste >4.5:1 en textos
- [ ] ARIA labels en iconos

### SEO
- [ ] Meta tags presentes (title, description)
- [ ] OpenGraph tags configurados
- [ ] Canonical URLs configurados
- [ ] Sitemap.xml generado
- [ ] Robots.txt configurado

---

## 📞 Soporte & Mantenimiento

### Monitoreo
- **Firebase Console**: Analytics, Crashlytics
- **Cloud Functions Logs**: Console.cloud.google.com
- **Uptime Monitoring**: UptimeRobot o similar

### Backups
- **Firestore**: Export automático semanal (Cloud Scheduler)
- **Storage**: Backup manual mensual

### Actualizaciones
- **Dependencias**: Renovate Bot (automated PRs)
- **Security Patches**: Dependabot alerts

---

## 🎯 Roadmap Futuro (Post-MVP)

1. **E-commerce**: Carrito + checkout + Stripe
2. **Multi-idioma**: i18n (ES/EN)
3. **Blog**: Sistema de noticias/artículos
4. **Reservas**: Sistema de citas online
5. **Chat en vivo**: Intercom o similar
6. **App Móvil**: React Native
7. **Analytics Avanzado**: Mixpanel/Amplitude
8. **A/B Testing**: Optimizely

---

## 📚 Referencias

- [Firebase Docs](https://firebase.google.com/docs)
- [React Router](https://reactrouter.com)
- [TailwindCSS](https://tailwindcss.com)
- [WhatsApp Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [EmailJS](https://www.emailjs.com/docs/)
- [Swiper.js](https://swiperjs.com/)

---

**Última actualización**: Enero 2026  
**Versión**: 1.0.0  
**Autor**: Arquitecto Full-Stack Senior
