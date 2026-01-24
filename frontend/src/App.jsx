import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoadingSpinner from './components/common/LoadingSpinner';

// Public pages (lazy loaded)
import { lazy, Suspense } from 'react';

const HomePage = lazy(() => import('./pages/public/HomePage'));
const ProductsPage = lazy(() => import('./pages/public/ProductsPage'));
const AboutPage = lazy(() => import('./pages/public/AboutPage'));
const ContactPage = lazy(() => import('./pages/public/ContactPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const ProductDetailPage = lazy(() => import('./pages/public/ProductDetailPage'));

// Admin Layout
const AdminLayout = lazy(() => import('./components/layout/AdminLayout'));

// Admin pages (lazy loaded)
const LoginPage = lazy(() => import('./pages/admin/LoginPage'));
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
const CarouselManagementPage = lazy(() => import('./pages/admin/CarouselManagementPage'));
const ProductsManagementPage = lazy(() => import('./pages/admin/ProductsManagementPage'));
const LeadsManagementPage = lazy(() => import('./pages/admin/LeadsManagementPage'));
const ContentEditorPage = lazy(() => import('./pages/admin/ContentEditorPage'));
const SettingsPage = lazy(() => import('./pages/admin/SettingsPage'));

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-dark">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

// Public Route (redirect if logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-dark">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background-dark">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/productos" element={<ProductsPage />} />
        <Route path="/productos/:id" element={<ProductDetailPage />} />
        <Route path="/nosotros" element={<AboutPage />} />
        <Route path="/contacto" element={<ContactPage />} />

        {/* Admin Login (sin layout) */}
        <Route
          path="/admin/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        {/* Protected Admin Routes (con AdminLayout) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="carousel" element={<CarouselManagementPage />} />
          <Route path="products" element={<ProductsManagementPage />} />
          <Route path="leads" element={<LeadsManagementPage />} />
          <Route path="content" element={<ContentEditorPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* 404 Not Found */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default App;
