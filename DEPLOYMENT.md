# 🚀 Guía de Despliegue - VizionRD

## Prerequisitos

- Node.js 18+ instalado
- npm o yarn
- Firebase CLI instalado globalmente: `npm install -g firebase-tools`
- Cuenta Firebase activa (ya configurada: vizionrd-7ff80)
- Credenciales de APIs externas:
  - EmailJS (servicio + plantilla)
  - WhatsApp Cloud API (Meta Business)
  - reCAPTCHA v3 (Google)

---

## 📋 Checklist Pre-Despliegue

### 1. Verificar Configuración Local

```bash
# Verificar Firebase CLI
firebase --version

# Login a Firebase
firebase login

# Verificar proyecto activo
firebase projects:list
firebase use vizionrd-7ff80
```

### 2. Configurar Variables de Entorno

**Frontend** (`frontend/.env.local`)
```env
# Ya configuradas - verificar que existan
VITE_FIREBASE_API_KEY=AIzaSyBsaIeCirQToipVUwEPunicDsp0n7CCBqo
VITE_FIREBASE_AUTH_DOMAIN=vizionrd-7ff80.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=vizionrd-7ff80
VITE_FIREBASE_STORAGE_BUCKET=vizionrd-7ff80.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=902882320681
VITE_FIREBASE_APP_ID=1:902882320681:web:a5041c3347c3ba6e36d738
VITE_FIREBASE_MEASUREMENT_ID=G-K83WVNS2PL

# Configurar estas:
VITE_EMAILJS_SERVICE_ID=tu_service_id
VITE_EMAILJS_TEMPLATE_ID=tu_template_id
VITE_EMAILJS_PUBLIC_KEY=tu_public_key
VITE_RECAPTCHA_SITE_KEY=tu_recaptcha_site_key
```

**Functions** (`functions/.env`) - ⚠️ NUNCA COMMITEAR
```env
WHATSAPP_PHONE_NUMBER_ID=tu_phone_number_id
WHATSAPP_ACCESS_TOKEN=tu_access_token
WHATSAPP_WABA_ID=tu_waba_id
WHATSAPP_RECIPIENT_NUMBER=+1809XXXXXXX
RECAPTCHA_SECRET_KEY=tu_recaptcha_secret_key
```

### 3. Instalar Dependencias

```bash
# Frontend
cd frontend
npm install

# Functions
cd ../functions
npm install

# Volver a raíz
cd ..
```

---

## 🧪 Testing Local con Emulators

```bash
# Iniciar emulators (desde raíz)
firebase emulators:start

# En otra terminal, iniciar frontend
cd frontend
npm run dev
```

Verificar:
- ✅ Frontend: http://localhost:5173
- ✅ Emulator UI: http://localhost:4000
- ✅ Firestore: localhost:8080
- ✅ Auth: localhost:9099
- ✅ Functions: localhost:5001
- ✅ Storage: localhost:9199

---

## 🏗️ Build de Producción

### 1. Build del Frontend

```bash
cd frontend
npm run build
```

Esto genera la carpeta `frontend/dist/` que se desplegará en Firebase Hosting.

### 2. Verificar Build Localmente

```bash
npm run preview
```

Acceder a http://localhost:4173 y verificar que todo funciona.

---

## 🔥 Deploy a Firebase

### Opción 1: Deploy Completo (Recomendado primera vez)

```bash
# Desde la raíz del proyecto
firebase deploy
```

Esto despliega:
- ✅ Hosting (frontend)
- ✅ Functions (backend)
- ✅ Firestore Rules
- ✅ Storage Rules
- ✅ Firestore Indexes

### Opción 2: Deploy Selectivo

```bash
# Solo hosting
firebase deploy --only hosting

# Solo functions
firebase deploy --only functions

# Solo rules
firebase deploy --only firestore:rules,storage:rules

# Solo indexes
firebase deploy --only firestore:indexes
```

### Verificar Deploy

Después del deploy, Firebase CLI mostrará:
```
✔ Deploy complete!

Project Console: https://console.firebase.google.com/project/vizionrd-7ff80/overview
Hosting URL: https://vizionrd.web.app
```

---

## 👤 Crear Usuario Admin Inicial

### Método 1: Firebase Console (Manual)

1. **Crear usuario en Authentication**
   - Ir a Firebase Console → Authentication → Users
   - Clic en "Add User"
   - Email: `admin@vizionrd.com`
   - Password: `[tu-contraseña-segura]`
   - Copiar el UID del usuario

2. **Crear documento en Firestore**
   - Ir a Firestore Database
   - Ir a colección `users` (o créala si no existe)
   - Clic en "Add Document"
   - Document ID: `[el UID copiado anteriormente]`
   - Campos:
     ```json
     {
       "email": "admin@vizionrd.com",
       "displayName": "Admin VizionRD",
       "role": "admin",
       "permissions": {
         "manageCarousel": true,
         "manageProducts": true,
         "manageLeads": true,
         "manageSiteContent": true,
         "manageUsers": true
       },
       "createdAt": "[timestamp actual]"
     }
     ```

### Método 2: Script Automatizado

Crear archivo `functions/src/scripts/createAdmin.js`:

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('../../vizionrd-7ff80-serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const createAdmin = async () => {
  const email = 'admin@vizionrd.com';
  const password = 'admin123456'; // Cambiar después del primer login

  try {
    // Crear usuario en Auth
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: 'Admin VizionRD',
    });

    console.log('✅ Usuario creado en Auth:', userRecord.uid);

    // Crear documento en Firestore
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      email: email,
      displayName: 'Admin VizionRD',
      role: 'admin',
      permissions: {
        manageCarousel: true,
        manageProducts: true,
        manageLeads: true,
        manageSiteContent: true,
        manageUsers: true,
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log('✅ Documento creado en Firestore');
    console.log('🎉 Admin creado exitosamente!');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('⚠️  CAMBIA LA CONTRASEÑA DESPUÉS DEL PRIMER LOGIN');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

createAdmin();
```

Ejecutar:
```bash
cd functions
node src/scripts/createAdmin.js
```

---

## 🔧 Configurar Environment Variables en Firebase

### Para Cloud Functions

```bash
# Configurar variables una por una
firebase functions:config:set whatsapp.phone_number_id="tu_phone_number_id"
firebase functions:config:set whatsapp.access_token="tu_access_token"
firebase functions:config:set whatsapp.waba_id="tu_waba_id"
firebase functions:config:set whatsapp.recipient_number="+1809XXXXXXX"
firebase functions:config:set recaptcha.secret_key="tu_recaptcha_secret_key"

# Ver configuración actual
firebase functions:config:get

# Re-deploy functions para aplicar cambios
firebase deploy --only functions
```

### Alternativa: Usar .env con dotenv (Recomendado)

En `functions/package.json`, agregar en `engines`:
```json
"engines": {
  "node": "18"
}
```

En `functions/src/index.js`:
```javascript
import dotenv from 'dotenv';
dotenv.config();

// Acceder a variables
const whatsappToken = process.env.WHATSAPP_ACCESS_TOKEN;
```

---

## 📧 Configurar EmailJS

1. Ir a https://www.emailjs.com/
2. Crear cuenta y verificar email
3. Crear servicio de email:
   - Services → Add Service
   - Seleccionar proveedor (Gmail, Outlook, etc.)
   - Seguir configuración
4. Crear plantilla:
   - Email Templates → Create New Template
   - Variables disponibles: `{{from_name}}`, `{{from_email}}`, `{{message}}`, etc.
5. Obtener credenciales:
   - Public Key: Account → API Keys
   - Service ID: Services (ID del servicio creado)
   - Template ID: Email Templates (ID de la plantilla)

---

## 💬 Configurar WhatsApp Cloud API

### Prerequisitos
- Cuenta de Facebook Business
- WhatsApp Business Account (WABA)
- Meta for Developers app

### Pasos

1. **Crear App en Meta for Developers**
   - Ir a https://developers.facebook.com/
   - Apps → Create App → Business
   - Agregar producto "WhatsApp"

2. **Configurar WhatsApp Business API**
   - En WhatsApp → Getting Started
   - Seleccionar número de teléfono de prueba (o agregar propio)
   - Obtener:
     - `Phone Number ID`
     - `WABA ID`
     - `Access Token` (temporal, reemplazar con permanente)

3. **Generar Access Token Permanente**
   - System Users → Add System User
   - Asignar permisos: `whatsapp_business_management`, `whatsapp_business_messaging`
   - Generate Token → Never Expires
   - ⚠️ Guardar en lugar seguro

4. **Verificar el número de destino**
   - En la consola de WhatsApp Cloud API
   - Agregar número de destino (tu número de WhatsApp)
   - Verificar con código OTP

5. **Configurar Webhook (opcional)**
   - Para recibir respuestas de usuarios
   - URL: `https://us-central1-vizionrd-7ff80.cloudfunctions.net/whatsappWebhook`
   - Verify Token: `tu_token_secreto`

---

## 🔐 Configurar reCAPTCHA v3

1. Ir a https://www.google.com/recaptcha/admin
2. Registrar nuevo sitio:
   - Label: VizionRD
   - Tipo: reCAPTCHA v3
   - Dominios: `vizionrd.web.app`, `vizionrd.com`, `localhost`
3. Obtener:
   - Site Key (pública) → `.env.local` frontend
   - Secret Key (privada) → `.env` functions

---

## 🔒 Configurar Security Rules

Las rules ya están en los archivos `firestore.rules` y `storage.rules`, pero verifica que estén deployadas:

```bash
firebase deploy --only firestore:rules,storage:rules
```

Verificar en Firebase Console:
- Firestore Database → Rules
- Storage → Rules

---

## 🗂️ Inicializar Datos de Ejemplo

### Carousel Config

En Firestore, crear documento manualmente:
- Colección: `carousel_config`
- Document ID: `main_carousel`
- Datos:
```json
{
  "autoplayDuration": 5000,
  "transitionDuration": 800,
  "showDots": true,
  "showArrows": true,
  "loop": true
}
```

### Site Content

Colección: `site_content`

**Documento 1: hero_section**
```json
{
  "id": "hero_section",
  "type": "hero",
  "content": {
    "title": "Pasión por la <span class='text-primary'>Perfección</span>",
    "subtitle": "VizionRD: Elevando el estándar del detallado automotriz",
    "ctaPrimary": "Nuestra Historia",
    "ctaSecondary": "Ver Servicios"
  },
  "updatedAt": "[timestamp]"
}
```

**Documento 2: contact_info**
```json
{
  "id": "contact_info",
  "type": "contact",
  "content": {
    "address": "Santo Domingo, República Dominicana",
    "phone": "+1-809-555-XXXX",
    "email": "info@vizionrd.com",
    "whatsapp": "+1-809-555-XXXX",
    "mapLatitude": 18.4861,
    "mapLongitude": -69.9312,
    "socialLinks": {
      "facebook": "https://facebook.com/vizionrd",
      "instagram": "https://instagram.com/vizionrd"
    }
  },
  "updatedAt": "[timestamp]"
}
```

---

## 🧪 Testing Post-Deploy

### Checklist de Verificación

- [ ] **Frontend accesible**: https://vizionrd.web.app
- [ ] **Login admin funciona**: /admin/login
- [ ] **Carousel se visualiza** (aunque esté vacío)
- [ ] **Productos se listan** (aunque esté vacío)
- [ ] **Formulario de contacto envía**:
  - [ ] Email llega a EmailJS
  - [ ] WhatsApp se envía (verificar logs de Functions)
  - [ ] Lead se guarda en Firestore
- [ ] **Dark/Light mode funciona**
- [ ] **Responsive en móvil**
- [ ] **Security Rules activas** (intentar escribir sin auth → debe fallar)

### Ver Logs de Functions

```bash
# En tiempo real
firebase functions:log --only sendWhatsAppMessage

# Todos los logs
firebase functions:log
```

### Verificar Performance

- Lighthouse en Chrome DevTools
- Objetivo: >90 en todas las métricas

---

## 🐛 Troubleshooting Común

### Error: "Permission denied" en Firestore
**Solución**: Verificar que las Security Rules estén deployadas
```bash
firebase deploy --only firestore:rules
```

### Error: Functions no responden
**Solución**: Ver logs y verificar variables de entorno
```bash
firebase functions:log
firebase functions:config:get
```

### Error: Images no cargan
**Solución**: Verificar Storage Rules y permisos
```bash
firebase deploy --only storage:rules
```

### Error: Build de Vite falla
**Solución**: Limpiar cache y reinstalar
```bash
cd frontend
rm -rf node_modules dist .vite
npm install
npm run build
```

### Error: WhatsApp no envía
**Posibles causas**:
1. Access Token expirado → Generar nuevo permanente
2. Número destino no verificado → Verificar en consola Meta
3. Plantilla de mensaje rechazada → Usar plantilla aprobada
4. Rate limit excedido → Esperar y reintentar

---

## 📊 Monitoreo Post-Deploy

### Firebase Console
- **Analytics**: Ver tráfico y uso
- **Performance**: Métricas de carga
- **Crashlytics**: Errores en producción
- **Functions Logs**: Logs de backend

### Google Search Console
- Registrar sitio: https://search.google.com/search-console
- Verificar propiedad con Firebase
- Enviar sitemap: `https://vizionrd.web.app/sitemap.xml`

---

## 🔄 CI/CD Automatizado (Opcional)

### GitHub Actions

Crear `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd frontend && npm ci
          cd ../functions && npm ci
      
      - name: Build frontend
        run: cd frontend && npm run build
      
      - name: Deploy to Firebase
        uses: w9jds/firebase-action@master
        with:
          args: deploy
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

Generar token:
```bash
firebase login:ci
```

Agregar el token a GitHub Secrets:
- Repo → Settings → Secrets → New secret
- Name: `FIREBASE_TOKEN`
- Value: [token generado]

---

## 📝 Checklist Final

- [ ] Frontend desplegado y accesible
- [ ] Functions desplegadas y funcionando
- [ ] Security Rules activas
- [ ] Usuario admin creado y verificado
- [ ] EmailJS configurado y probado
- [ ] WhatsApp API configurada y probada
- [ ] reCAPTCHA funcionando
- [ ] Performance >90 en Lighthouse
- [ ] Responsive verificado (móvil/tablet/desktop)
- [ ] SEO básico implementado (meta tags, sitemap)
- [ ] Analytics activo
- [ ] Monitoreo configurado
- [ ] Backups programados (manual o automático)
- [ ] Documentación actualizada

---

## 🆘 Soporte

Para problemas técnicos:
1. Revisar logs: `firebase functions:log`
2. Verificar configuración: `firebase functions:config:get`
3. Consultar docs: https://firebase.google.com/docs
4. Stack Overflow: tag `firebase`

---

**Última actualización**: Enero 2026  
**Autor**: Arquitecto Full-Stack Senior
