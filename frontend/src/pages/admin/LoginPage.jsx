/**
 * LoginPage - Admin Login
 * Based on LoginAdmin.html design
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { signInWithEmail, signInWithGoogle, resetPassword } from '../../services/auth.service';
import { toast } from 'react-hot-toast';

// Validation schema
const loginSchema = yup.object({
  email: yup
    .string()
    .required('El correo es requerido')
    .email('Ingresa un correo válido'),
  password: yup
    .string()
    .required('La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
});

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(loginSchema)
  });

  // Handle email/password login
  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const result = await signInWithEmail(data.email, data.password);
      
      if (result.success) {
        toast.success('¡Bienvenido!');
        navigate('/admin/dashboard');
      } else {
        toast.error(result.error || 'Error al iniciar sesión');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google login
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithGoogle();
      
      if (result.success) {
        toast.success('¡Bienvenido!');
        navigate('/admin/dashboard');
      } else {
        toast.error(result.error || 'Error al iniciar sesión con Google');
      }
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Error al iniciar sesión con Google');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password reset
  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      toast.error('Ingresa tu correo electrónico');
      return;
    }

    try {
      const result = await resetPassword(forgotEmail);
      if (result.success) {
        toast.success('Se ha enviado un correo para restablecer tu contraseña');
        setShowForgotModal(false);
        setForgotEmail('');
      } else {
        toast.error(result.error || 'Error al enviar el correo');
      }
    } catch (error) {
      toast.error('Error al enviar el correo');
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Login | VizionRD</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center p-6 bg-[#0f1923] relative overflow-hidden">
        {/* Background mesh gradient */}
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(at 0% 0%, hsla(210, 100%, 15%, 1) 0px, transparent 50%),
              radial-gradient(at 100% 100%, hsla(210, 100%, 10%, 1) 0px, transparent 50%),
              radial-gradient(at 50% 50%, hsla(210, 100%, 5%, 1) 0px, transparent 50%)
            `
          }}
        />

        {/* Decorative elements */}
        <div className="fixed top-20 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-[120px]" />
        <div className="fixed bottom-20 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-[120px]" />
        <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-30" />

        {/* Top navigation */}
        <div className="fixed top-0 left-0 w-full z-50">
          <div className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
            <Link to="/" className="flex items-center gap-3 text-white">
              <div className="w-8 h-8 text-primary">
                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M13.8261 30.5736C16.7203 29.8826 20.2244 29.4783 24 29.4783C27.7756 29.4783 31.2797 29.8826 34.1739 30.5736C36.9144 31.2278 39.9967 32.7669 41.3563 33.8352L24.8486 7.36089C24.4571 6.73303 23.5429 6.73303 23.1514 7.36089L6.64374 33.8352C8.00331 32.7669 11.0856 31.2278 13.8261 30.5736Z"
                    fill="currentColor"
                  />
                  <path
                    clipRule="evenodd"
                    d="M39.4 32.9204C37.8778 31.8937 35.1463 30.5109 32.6917 29.9006C30.0734 29.2495 27.1634 28.8517 24 28.8517C20.8366 28.8517 17.9266 29.2495 15.3083 29.9006C12.8537 30.5109 10.1222 31.8937 8.6 32.9204L24 6.21432L39.4 32.9204Z"
                    fill="currentColor"
                    fillRule="evenodd"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold tracking-tight">VizionRD</h2>
            </Link>
            <Link
              to="/"
              className="text-primary/80 hover:text-primary text-sm font-medium transition-colors"
            >
              Volver al sitio
            </Link>
          </div>
        </div>

        {/* Login Container */}
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[480px] z-10"
        >
          <div className="backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-xl p-8 md:p-12 relative overflow-hidden shadow-2xl">
            {/* Subtle accent glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />

            {/* Header */}
            <div className="text-center mb-10 relative z-10">
              <h1 className="text-white text-3xl font-bold tracking-tight mb-2">
                Panel de Administración
              </h1>
              <p className="text-primary/60 text-sm font-medium uppercase tracking-widest">
                Acceso Seguro
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="block text-white/80 text-sm font-medium ml-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <input
                    type="email"
                    {...register('email')}
                    placeholder="admin@vizionrd.com"
                    className={`w-full px-4 py-3 pl-12 rounded-lg bg-white/5 border text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
                      errors.email ? 'border-red-500' : 'border-white/10 focus:border-primary'
                    }`}
                    disabled={isLoading}
                  />
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-lg">
                    mail
                  </span>
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm ml-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-white/80 text-sm font-medium">
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-primary/80 hover:text-primary text-xs font-medium transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 pl-12 pr-12 rounded-lg bg-white/5 border text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
                      errors.password ? 'border-red-500' : 'border-white/10 focus:border-primary'
                    }`}
                    disabled={isLoading}
                  />
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-lg">
                    lock
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm ml-1">{errors.password.message}</p>
                )}
              </div>

              {/* Primary Login Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-14 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-70"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Iniciar Sesión</span>
                    <span className="material-symbols-outlined text-xl">login</span>
                  </>
                )}
              </motion.button>

              {/* Divider */}
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-transparent px-4 text-white/30 tracking-widest">
                    O continuar con
                  </span>
                </div>
              </div>

              {/* Google Button */}
              <motion.button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                className="w-full bg-transparent border border-white/10 hover:bg-white/5 text-white font-medium h-14 rounded-lg transition-all flex items-center justify-center gap-3 disabled:opacity-70"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span>Google Workspace</span>
              </motion.button>
            </form>
          </div>

          {/* Footer */}
          <footer className="mt-8 text-center">
            <p className="text-white/20 text-[10px] uppercase tracking-[0.2em]">
              © {new Date().getFullYear()} VizionRD. Todos los derechos reservados.
            </p>
          </footer>
        </motion.main>

        {/* Forgot Password Modal */}
        {showForgotModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#1a1d24] border border-white/10 rounded-xl p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-bold text-white mb-2">Restablecer contraseña</h3>
              <p className="text-white/60 text-sm mb-6">
                Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
              </p>
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-primary mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowForgotModal(false)}
                  className="flex-1 py-3 rounded-lg border border-white/10 text-white hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleForgotPassword}
                  className="flex-1 py-3 rounded-lg bg-primary text-white font-bold hover:bg-primary/90 transition-colors"
                >
                  Enviar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </>
  );
};

export default LoginPage;
