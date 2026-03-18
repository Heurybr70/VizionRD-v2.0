import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import COLORS from '@shared/constants/colors';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^(\+?1)?[-.\s]?(\d{3})[-.\s]?(\d{3})[-.\s]?(\d{4})$/;

export default function LeadCaptureForm({
  isDark = false,
  initialValues,
  submitLabel = 'Enviar solicitud',
  formTitle,
  helperText,
  children,
  onSubmit,
}) {
  const [values, setValues] = useState({
    name: initialValues?.name || '',
    email: initialValues?.email || '',
    phone: initialValues?.phone || '',
    subject: initialValues?.subject || '',
    message: initialValues?.message || '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const styles = useMemo(() => createStyles(isDark), [isDark]);

  const setField = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!values.name.trim() || values.name.trim().length < 2) {
      nextErrors.name = 'Introduce un nombre valido.';
    }
    if (!emailRegex.test(values.email.trim().toLowerCase())) {
      nextErrors.email = 'Introduce un correo electronico valido.';
    }
    if (!phoneRegex.test(values.phone.trim())) {
      nextErrors.phone = 'Introduce un telefono valido.';
    }
    if (!values.message.trim() || values.message.trim().length < 10) {
      nextErrors.message = 'El mensaje debe tener al menos 10 caracteres.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);

    try {
      await onSubmit({
        ...values,
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        phone: values.phone.trim(),
        subject: values.subject.trim(),
        message: values.message.trim(),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderInput = (field, label, props = {}) => (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={values[field]}
        onChangeText={(text) => setField(field, text)}
        placeholderTextColor={COLORS.textMuted}
        style={[styles.input, props.multiline && styles.multiline]}
        {...props}
      />
      {!!errors[field] && <Text style={styles.error}>{errors[field]}</Text>}
    </View>
  );

  return (
    <View style={styles.shell}>
      <View style={styles.wrapper}>
        {!!formTitle && <Text style={styles.title}>{formTitle}</Text>}
        {!!helperText && <Text style={styles.helper}>{helperText}</Text>}

        {renderInput('name', 'Nombre', { placeholder: 'Tu nombre completo' })}
        {renderInput('email', 'Correo', {
          placeholder: 'tu@email.com',
          keyboardType: 'email-address',
          autoCapitalize: 'none',
        })}
        {renderInput('phone', 'Telefono', {
          placeholder: '+1 809 123 4567',
          keyboardType: 'phone-pad',
        })}
        {renderInput('subject', 'Asunto', { placeholder: 'Asunto de la solicitud' })}
        {renderInput('message', 'Mensaje', {
          placeholder: 'Cuentanos en que podemos ayudarte',
          multiline: true,
          numberOfLines: 5,
          textAlignVertical: 'top',
        })}

        {children}

        <TouchableOpacity
          style={[styles.submit, submitting && styles.submitDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.92}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>{submitLabel}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (isDark) =>
  StyleSheet.create({
    shell: {
      borderRadius: 28,
      borderWidth: 1,
      borderColor: isDark ? COLORS.borderDark : COLORS.border,
      backgroundColor: isDark ? 'rgba(26, 34, 53, 0.92)' : 'rgba(255,255,255,0.97)',
      overflow: 'hidden',
    },
    wrapper: {
      gap: 16,
      padding: 20,
    },
    title: {
      fontSize: 22,
      lineHeight: 28,
      fontWeight: '800',
      color: isDark ? COLORS.textLight : COLORS.textPrimary,
    },
    helper: {
      fontSize: 13,
      lineHeight: 21,
      color: isDark ? COLORS.textMuted : COLORS.textSecondary,
    },
    field: {
      gap: 7,
    },
    label: {
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 0.7,
      textTransform: 'uppercase',
      color: isDark ? COLORS.textMuted : COLORS.textSecondary,
    },
    input: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: isDark ? COLORS.borderDark : COLORS.border,
      backgroundColor: isDark ? '#111827' : COLORS.backgroundLight,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 14,
      color: isDark ? COLORS.textLight : COLORS.textPrimary,
    },
    multiline: {
      minHeight: 128,
    },
    error: {
      fontSize: 12,
      color: COLORS.error,
    },
    submit: {
      marginTop: 4,
      minHeight: 54,
      borderRadius: 18,
      paddingVertical: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: COLORS.primary,
    },
    submitDisabled: {
      opacity: 0.75,
    },
    submitText: {
      color: '#fff',
      fontWeight: '800',
      fontSize: 15,
    },
  });
