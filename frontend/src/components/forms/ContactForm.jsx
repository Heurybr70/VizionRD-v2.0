/**
 * ContactForm Component
 * Contact form with validation, reCAPTCHA, honeypot, and dual submission (Email + WhatsApp)
 */

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import { addContactLead } from '../../services/firestore.service';
import { sendContactEmail, getRateLimitInfo as getEmailRateLimit, initEmailJS, isEmailConfigured } from '../../services/email.service';
import { toast } from 'react-hot-toast';

// Validation schema
const contactSchema = yup.object({
  name: yup
    .string()
    .required('El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre es muy largo'),
  email: yup
    .string()
    .required('El email es requerido')
    .email('Ingresa un email válido'),
  phone: yup
    .string()
    .required('El teléfono es requerido')
    .matches(
      /^(?:\+?1[-.\s]?)?(?:\(\d{3}\)|\d{3})[-.\s]?\d{3}[-.\s]?\d{4}$/,
      'Ingresa un número de teléfono válido'
    ),
  subject: yup
    .string()
    .max(200, 'El asunto es muy largo'),
  message: yup
    .string()
    .required('El mensaje es requerido')
    .min(10, 'El mensaje debe tener al menos 10 caracteres')
    .max(2000, 'El mensaje es muy largo'),
  honeypot: yup.string().max(0) // Honeypot field should be empty
});

const formatPhoneInput = (value) => {
  let digits = value.replace(/\D/g, '');

  // El código +1 es opcional: el campo se muestra siempre en formato local.
  if (digits.length === 11 && digits.startsWith('1')) {
    digits = digits.slice(1);
  }

  digits = digits.slice(0, 10);

  if (digits.length === 0) return '';
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;

  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};

const ContactForm = ({ 
  productInterest = '', 
  subject = '',
  onSuccess = null,
  variant = 'default' // 'default' | 'compact' | 'inline'
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [emailConfigured, setEmailConfigured] = useState(true);
  const formRef = useRef(null);

  // Initialize EmailJS if available
  useEffect(() => {
    try {
      const ok = initEmailJS();
      setEmailConfigured(ok);
    } catch (err) {
      console.warn('Failed to initialize email service', err);
      setEmailConfigured(false);
    }
  }, []);


  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      subject: subject,
      message: '',
      honeypot: ''
    }
  });

  const phoneField = register('phone');

  const handlePhoneChange = (event) => {
    event.target.value = formatPhoneInput(event.target.value);
    phoneField.onChange(event);
  };

  // Watch message for character count
  const messageValue = watch('message', '');
  useEffect(() => {
    setCharCount(messageValue?.length || 0);
  }, [messageValue]);

  // Handle form submission
  const onSubmit = async (data) => {
    // Check honeypot (anti-spam)
    if (data.honeypot) {
      console.warn('Honeypot triggered');
      return;
    }

    // Check rate limit
    const rateLimit = getEmailRateLimit();
    if (!rateLimit.allowed) {
      toast.error(`Has enviado muchos mensajes. Intenta en ${rateLimit.retryAfter} minutos.`);
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Save lead to Firestore (this triggers auto WhatsApp via Cloud Function)
      const leadData = {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        subject: data.subject?.trim() || 'Consulta desde el sitio web',
        message: data.message.trim(),
        productInterest: productInterest || null,
        source: 'website_contact_form',
        userAgent: navigator.userAgent,
        language: navigator.language
      };

      const leadResult = await addContactLead(leadData);
      
      if (!leadResult.success) {
        throw new Error(leadResult.error || 'Error al guardar el mensaje');
      }

      // 2. Send email via EmailJS (if configured)
      let emailResult = { success: false };

      if (isEmailConfigured().configured) {
        emailResult = await sendContactEmail({
          ...data,
          productInterest
        });

        // Handle email result and show appropriate feedback
        if (emailResult.success) {
          // Email delivered
          setSubmitSuccess(true);
          reset();

          toast.success('¡Mensaje enviado! Te contactaremos pronto.', {
            duration: 5000,
            icon: '✅'
          });

          // Reset success state after animation
          setTimeout(() => setSubmitSuccess(false), 3000);

        } else if (emailResult.rateLimited) {
          // Rate limited by Email service
          toast.error(emailResult.error || 'Has excedido el límite de envíos. Intenta más tarde.');
        } else {
          // Email failed but lead was saved — inform the user
          console.warn('Email send failed:', emailResult.error || emailResult.details || 'Unknown');

          reset();

          toast.error('No se pudo enviar el correo, pero tu mensaje fue guardado. Te contactaremos por otros medios.', {
            duration: 7000,
            icon: '⚠️'
          });
        }
      } else {
        // Email service not configured
        reset();
        toast.error('El servicio de correo no está configurado. Tu mensaje fue guardado y será revisado por el equipo.', { duration: 8000, icon: '⚠️' });
      }

      if (onSuccess) {
        onSuccess(leadResult.data);
      }

      // Reset success state after animation
      setTimeout(() => setSubmitSuccess(false), 3000);

    } catch (error) {
      console.error('Form submission error:', error);
      toast.error(error.message || 'Error al enviar el mensaje. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onInvalid = (validationErrors) => {
    const fieldNames = {
      name: 'nombre completo',
      email: 'correo electrónico',
      phone: 'teléfono',
      subject: 'asunto',
      message: 'mensaje',
      honeypot: 'verificación antispam'
    };
    const invalidFields = Object.keys(validationErrors).map(
      (field) => fieldNames[field] || field
    );

    console.warn('Contact form validation failed:', {
      fields: invalidFields,
      errors: validationErrors
    });
    toast.error(`Revisa: ${invalidFields.join(', ')}.`);
  };

  // Input classes
  const inputBaseClass = `
    w-full px-4 py-3 rounded-xl
    bg-white/5 dark:bg-white/5
    border border-slate-200 dark:border-white/10
    text-slate-900 dark:text-white
    placeholder:text-slate-400 dark:placeholder:text-slate-500
    focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
    transition-all duration-200
  `;

  const inputErrorClass = 'border-red-500 focus:border-red-500 focus:ring-red-500/20';

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      className={`space-y-6 ${variant === 'compact' ? 'space-y-4' : ''}`}
      noValidate
    >
      {/* Honeypot: readOnly and new-password prevent browsers/password managers from autofilling it. */}
      <input
        type="text"
        {...register('honeypot')}
        className="absolute -left-[9999px] opacity-0 pointer-events-none"
        tabIndex={-1}
        autoComplete="new-password"
        readOnly
        aria-hidden="true"
      />

      {/* Name & Email Row */}
      <div className={`grid gap-6 ${variant === 'compact' ? 'gap-4' : ''} ${variant === 'inline' ? '' : 'md:grid-cols-2'}`}>
        {/* Name */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Nombre completo <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('name')}
            placeholder="Tu nombre"
            className={`${inputBaseClass} ${errors.name ? inputErrorClass : ''}`}
            disabled={isSubmitting}
          />
          <AnimatePresence>
            {errors.name && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-red-500 text-sm flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">error</span>
                {errors.name.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Correo electrónico <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            {...register('email')}
            placeholder="tu@email.com"
            className={`${inputBaseClass} ${errors.email ? inputErrorClass : ''}`}
            disabled={isSubmitting}
          />
          <AnimatePresence>
            {errors.email && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-red-500 text-sm flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">error</span>
                {errors.email.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Phone & Subject Row */}
      <div className={`grid gap-6 ${variant === 'compact' ? 'gap-4' : ''} ${variant === 'inline' ? '' : 'md:grid-cols-2'}`}>
        {/* Phone */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Teléfono <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            {...phoneField}
            onChange={handlePhoneChange}
            inputMode="numeric"
            placeholder="(829) 812-2612"
            className={`${inputBaseClass} ${errors.phone ? inputErrorClass : ''}`}
            disabled={isSubmitting}
          />
          <AnimatePresence>
            {errors.phone && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-red-500 text-sm flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">error</span>
                {errors.phone.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Subject */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Asunto
          </label>
          <input
            type="text"
            {...register('subject')}
            placeholder="¿En qué podemos ayudarte?"
            className={`${inputBaseClass} ${errors.subject ? inputErrorClass : ''}`}
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* Message */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Mensaje <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register('message')}
          rows={variant === 'compact' ? 3 : 5}
          placeholder="Cuéntanos más sobre tu consulta..."
          className={`${inputBaseClass} resize-none ${errors.message ? inputErrorClass : ''}`}
          disabled={isSubmitting}
        />
        <div className="flex justify-between items-center">
          <AnimatePresence>
            {errors.message && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-red-500 text-sm flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">error</span>
                {errors.message.message}
              </motion.p>
            )}
          </AnimatePresence>
          <span className={`text-xs ${charCount > 1800 ? 'text-orange-500' : 'text-slate-400'}`}>
            {charCount}/2000
          </span>
        </div>
      </div>

      {/* Product Interest Badge (if provided) */}
      {productInterest && (
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <span className="material-symbols-outlined text-primary text-lg">inventory_2</span>
          <span>Producto de interés: <strong className="text-primary">{productInterest}</strong></span>
        </div>
      )}

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={isSubmitting || submitSuccess}
        whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
        whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
        className={`
          w-full py-4 rounded-xl font-bold text-white
          flex items-center justify-center gap-2
          transition-all duration-300 shadow-lg
          ${submitSuccess 
            ? 'bg-green-500 shadow-green-500/30' 
            : 'bg-primary hover:bg-primary/90 shadow-primary/30'
          }
          disabled:opacity-70 disabled:cursor-not-allowed
        `}
      >
        {isSubmitting ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Enviando...</span>
          </>
        ) : submitSuccess ? (
          <>
            <span className="material-symbols-outlined">check_circle</span>
            <span>¡Enviado!</span>
          </>
        ) : (
          <>
            <span>Enviar Mensaje</span>
            <span className="material-symbols-outlined text-lg">send</span>
          </>
        )}
      </motion.button>

      {/* Privacy Note */}
      <p className="text-xs text-center text-slate-400 dark:text-slate-500">
        Al enviar este formulario, aceptas nuestra{' '}
        <a href="/privacidad" className="text-primary hover:underline">
          Política de Privacidad
        </a>
      </p>
    </form>
  );
};

export default ContactForm;
