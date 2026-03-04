# VizionRD Mobile 📱

App móvil de VizionRD construida con **React Native + Expo**.  
Comparte lógica de negocio y servicios con la app web (React+Vite).

---

## Estructura del proyecto

```
mobile/
├── App.jsx                   # Entry point — providers globales
├── app.json                  # Config de Expo
├── babel.config.js           # Alias de paths (@shared, @screens, etc.)
├── .env.example              # Variables de entorno (copiar como .env)
│
└── src/
    ├── navigation/
    │   └── AppNavigator.jsx  # Bottom Tab + Stack Navigator
    │
    ├── screens/
    │   ├── HomeScreen.jsx        # Pantalla de inicio (diseño 1.html)
    │   ├── ProductsScreen.jsx    # Catálogo de productos (diseño 2.html)
    │   ├── AboutScreen.jsx       # Nosotros (diseño 3.html)
    │   ├── ProductDetailScreen.jsx # Detalle de producto (diseño 4.html)
    │   ├── CartScreen.jsx        # Carrito (diseño 5.html)
    │   ├── ServicesScreen.jsx    # Servicios (diseño 6.html)
    │   └── ProfileScreen.jsx     # Perfil de usuario
    │
    ├── context/
    │   ├── ThemeContext.jsx      # Dark/Light mode (persiste en AsyncStorage)
    │   ├── CartContext.jsx       # Estado del carrito (persiste en AsyncStorage)
    │   └── AuthContext.jsx       # Estado de autenticación Firebase
    │
    └── services/
        ├── firebase.js           # Inicialización Firebase (Expo/RN)
        ├── firestore.service.js  # CRUD Firestore (usa shared/)
        └── auth.service.js       # Login/Logout Firebase Auth
```

---

## Código compartido (`../shared/`)

```
shared/
├── constants/
│   ├── colors.js        # Paleta de colores VizionRD
│   └── categories.js    # Categorías de productos y servicios
├── services/
│   └── firestore.service.js  # Factory de servicios Firestore
└── utils/
    └── formatters.js    # formatPrice, ITBIS, truncate, etc.
```

---

## Instalación y uso

### 1. Instalar dependencias
```bash
cd mobile
npm install
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env
# Llenar .env con los datos de tu proyecto Firebase
```

### 3. Iniciar la app
```bash
npm start          # Expo DevTools
npm run android    # Android
npm run ios        # iOS (requiere macOS + Xcode)
```

---

## Navegación

| Tab | Pantalla principal | Pantalla secundaria |
|-----|--------------------|---------------------|
| Inicio | HomeScreen | — |
| Tienda | ProductsScreen | ProductDetailScreen, AboutScreen |
| Carrito | CartScreen | — |
| Servicios | ServicesScreen | — |
| Perfil | ProfileScreen | — |

---

## Consideraciones importantes

- **Variables de entorno**: El archivo `.env` **nunca** debe subirse a GitHub.  
  Cada variable comienza con `FIREBASE_` (sin el prefijo `VITE_` de la versión web).

- **Firebase Auth**: Usa persistencia con `AsyncStorage` para mantener la sesión.

- **Carrito**: Se persiste localmente en `AsyncStorage` entre sesiones.

- **Tema oscuro/claro**: Compatible con el sistema operativo y almacenado en `AsyncStorage`.
