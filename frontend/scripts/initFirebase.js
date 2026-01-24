/**
 * Firebase Initialization Script
 * 
 * Este script inicializa la base de datos de Firebase con datos de ejemplo
 * y crea un usuario administrador.
 * 
 * Para ejecutar:
 * 1. Asegúrate de tener las reglas de Firestore en modo "test" temporalmente
 * 2. Ejecuta: node scripts/initFirebase.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

// Carga manual de variables de entorno para Node.js
const firebaseConfig = {
  apiKey: "AIzaSyBsaIeCirQToipVUwEPunicDsp0n7CCBqo",
  authDomain: "vizionrd-7ff80.firebaseapp.com",
  projectId: "vizionrd-7ff80",
  storageBucket: "vizionrd-7ff80.firebasestorage.app",
  messagingSenderId: "902882320681",
  appId: "1:902882320681:web:a5041c3347c3ba6e36d738",
  measurementId: "G-K83WVNS2PL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ===========================================
// DATOS INICIALES
// ===========================================

const siteSettings = {
  general: {
    siteName: "VizionRD",
    tagline: "Innovación que transforma tu negocio",
    logo: "/assets/logo.svg",
    favicon: "/favicon.ico",
    email: "contacto@vizionrd.com",
    phone: "+1 (849) 352-5315",
    address: "Santo Domingo, República Dominicana",
  },
  social: {
    facebook: "https://facebook.com/vizionrd",
    instagram: "https://instagram.com/vizionrd",
    twitter: "https://twitter.com/vizionrd",
    linkedin: "https://linkedin.com/company/vizionrd",
    youtube: "",
  },
  seo: {
    metaTitle: "VizionRD - Soluciones Tecnológicas Innovadoras",
    metaDescription: "Transformamos tu negocio con soluciones tecnológicas de vanguardia. Software a medida, aplicaciones móviles, consultoría IT.",
    keywords: ["tecnología", "software", "apps", "desarrollo", "innovación", "República Dominicana"],
  },
  appearance: {
    primaryColor: "#007fff",
    darkMode: true,
  }
};

const carouselSlides = [
  {
    title: "Innovación Tecnológica",
    subtitle: "Soluciones que transforman tu negocio",
    description: "Desarrollamos software a medida que impulsa el crecimiento de tu empresa",
    image: "/assets/slides/slide1.jpg",
    buttonText: "Conoce más",
    buttonLink: "/productos",
    order: 0,
    isActive: true,
  },
  {
    title: "Aplicaciones Móviles",
    subtitle: "Tu negocio en la palma de la mano",
    description: "Apps nativas e híbridas para iOS y Android",
    image: "/assets/slides/slide2.jpg",
    buttonText: "Ver proyectos",
    buttonLink: "/productos",
    order: 1,
    isActive: true,
  },
  {
    title: "Consultoría IT",
    subtitle: "Expertos a tu servicio",
    description: "Asesoría especializada para optimizar tus procesos tecnológicos",
    image: "/assets/slides/slide3.jpg",
    buttonText: "Contáctanos",
    buttonLink: "/contacto",
    order: 2,
    isActive: true,
  }
];

const sampleProducts = [
  {
    name: "Sistema de Gestión Empresarial",
    slug: "sistema-gestion-empresarial",
    shortDescription: "ERP completo para la gestión integral de tu negocio",
    description: "Sistema empresarial modular que incluye gestión de inventario, facturación, contabilidad, recursos humanos y CRM. Diseñado para optimizar todos los procesos de tu empresa.",
    category: "software",
    subcategory: "erp",
    price: 2500,
    currency: "USD",
    priceType: "starting",
    images: ["/assets/products/erp-main.jpg"],
    features: [
      "Módulo de inventario en tiempo real",
      "Facturación electrónica",
      "Reportes personalizados",
      "Multi-sucursal",
      "API para integraciones"
    ],
    specifications: {
      "Plataforma": "Web + Mobile",
      "Base de datos": "Cloud",
      "Usuarios": "Ilimitados",
      "Soporte": "24/7"
    },
    tags: ["erp", "gestión", "empresarial", "inventario"],
    isFeatured: true,
    isActive: true,
    order: 0,
  },
  {
    name: "App de Delivery",
    slug: "app-delivery",
    shortDescription: "Aplicación completa para servicios de entrega",
    description: "Solución integral para negocios de delivery que incluye app para clientes, app para repartidores y panel administrativo.",
    category: "mobile",
    subcategory: "apps",
    price: 3500,
    currency: "USD",
    priceType: "starting",
    images: ["/assets/products/delivery-app.jpg"],
    features: [
      "App para clientes iOS/Android",
      "App para repartidores",
      "Tracking en tiempo real",
      "Pasarela de pagos integrada",
      "Panel de administración"
    ],
    specifications: {
      "Plataforma": "iOS + Android",
      "Backend": "Node.js + Firebase",
      "Tiempo de desarrollo": "8-12 semanas"
    },
    tags: ["delivery", "app", "móvil", "ecommerce"],
    isFeatured: true,
    isActive: true,
    order: 1,
  },
  {
    name: "E-commerce Personalizado",
    slug: "ecommerce-personalizado",
    shortDescription: "Tienda online a medida para tu negocio",
    description: "Desarrollo de tiendas virtuales personalizadas con diseño único, carrito de compras, gestión de inventario y múltiples métodos de pago.",
    category: "web",
    subcategory: "ecommerce",
    price: 1800,
    currency: "USD",
    priceType: "starting",
    images: ["/assets/products/ecommerce.jpg"],
    features: [
      "Diseño responsive personalizado",
      "Carrito de compras",
      "Múltiples métodos de pago",
      "Gestión de inventario",
      "SEO optimizado"
    ],
    specifications: {
      "Plataforma": "Web",
      "CMS": "Headless",
      "Hosting": "Incluido primer año"
    },
    tags: ["ecommerce", "tienda", "web", "ventas"],
    isFeatured: false,
    isActive: true,
    order: 2,
  }
];

const categories = [
  { id: "software", name: "Software", description: "Soluciones de software empresarial", icon: "code", order: 0 },
  { id: "mobile", name: "Aplicaciones Móviles", description: "Apps para iOS y Android", icon: "smartphone", order: 1 },
  { id: "web", name: "Desarrollo Web", description: "Sitios y aplicaciones web", icon: "language", order: 2 },
  { id: "consulting", name: "Consultoría", description: "Asesoría tecnológica especializada", icon: "support_agent", order: 3 },
];

// ===========================================
// FUNCIONES DE INICIALIZACIÓN
// ===========================================

async function createAdminUser(email, password) {
  try {
    console.log('📧 Creando usuario administrador...');
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Crear documento del usuario en Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      displayName: 'Administrador',
      role: 'admin',
      permissions: {
        manageProducts: true,
        manageCarousel: true,
        manageLeads: true,
        manageContent: true,
        manageSettings: true,
      },
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    });

    console.log(`✅ Usuario admin creado: ${email}`);
    console.log(`   UID: ${user.uid}`);
    return user;
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('ℹ️  El usuario admin ya existe');
    } else {
      console.error('❌ Error creando usuario:', error.message);
    }
    return null;
  }
}

async function initializeSettings() {
  try {
    console.log('⚙️  Inicializando configuración del sitio...');
    await setDoc(doc(db, 'settings', 'site'), {
      ...siteSettings,
      updatedAt: serverTimestamp(),
    });
    console.log('✅ Configuración guardada');
  } catch (error) {
    console.error('❌ Error guardando configuración:', error.message);
  }
}

async function initializeCategories() {
  try {
    console.log('📁 Inicializando categorías...');
    for (const category of categories) {
      await setDoc(doc(db, 'categories', category.id), {
        ...category,
        createdAt: serverTimestamp(),
      });
    }
    console.log(`✅ ${categories.length} categorías creadas`);
  } catch (error) {
    console.error('❌ Error creando categorías:', error.message);
  }
}

async function initializeCarousel() {
  try {
    console.log('🎠 Inicializando carousel...');
    for (let i = 0; i < carouselSlides.length; i++) {
      await setDoc(doc(db, 'carousel_slides', `slide-${i}`), {
        ...carouselSlides[i],
        createdAt: serverTimestamp(),
      });
    }
    console.log(`✅ ${carouselSlides.length} slides creados`);
  } catch (error) {
    console.error('❌ Error creando carousel:', error.message);
  }
}

async function initializeProducts() {
  try {
    console.log('📦 Inicializando productos de ejemplo...');
    for (const product of sampleProducts) {
      await setDoc(doc(db, 'products', product.slug), {
        ...product,
        createdAt: serverTimestamp(),
        views: 0,
        inquiries: 0,
      });
    }
    console.log(`✅ ${sampleProducts.length} productos creados`);
  } catch (error) {
    console.error('❌ Error creando productos:', error.message);
  }
}

// ===========================================
// EJECUCIÓN PRINCIPAL
// ===========================================

async function main() {
  console.log('');
  console.log('🔥 INICIALIZACIÓN DE FIREBASE PARA VIZIONRD');
  console.log('============================================');
  console.log('');

  // 1. Crear usuario admin
  const adminEmail = 'admin@vizionrd.com';
  const adminPassword = 'VizionRD2024!';
  
  console.log('📝 Credenciales del administrador:');
  console.log(`   Email: ${adminEmail}`);
  console.log(`   Password: ${adminPassword}`);
  console.log('   (Cambia la contraseña después de iniciar sesión)');
  console.log('');

  await createAdminUser(adminEmail, adminPassword);
  
  console.log('');

  // 2. Inicializar colecciones
  await initializeSettings();
  await initializeCategories();
  await initializeCarousel();
  await initializeProducts();

  console.log('');
  console.log('============================================');
  console.log('✅ INICIALIZACIÓN COMPLETADA');
  console.log('');
  console.log('Próximos pasos:');
  console.log('1. Ve a http://localhost:5174/login');
  console.log('2. Inicia sesión con las credenciales del admin');
  console.log('3. Cambia la contraseña en Configuración');
  console.log('4. ¡Comienza a administrar tu sitio!');
  console.log('');

  process.exit(0);
}

main().catch((error) => {
  console.error('Error fatal:', error);
  process.exit(1);
});
