import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';

import COLORS from '@shared/constants/colors';
import { useTheme } from '../context/ThemeContext';
import { loginWithEmail, registerWithEmail, resetPassword } from '../services/auth.service';
import AppHeader from '../components/common/AppHeader';
import AnimatedEntrance from '../components/common/AnimatedEntrance';

const MODES = {
  login: 'login',
  register: 'register',
  reset: 'reset',
};

export default function AuthScreen() {
  const navigation = useNavigation();
  const { isDark } = useTheme();
  const styles = useMemo(() => createStyles(isDark), [isDark]);

  const [mode, setMode] = useState(MODES.login);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.email.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Correo requerido',
        text2: 'Introduce tu correo para continuar.',
      });
      return;
    }

    if (mode !== MODES.reset && !form.password.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Contrasena requerida',
        text2: 'Introduce tu contrasena para continuar.',
      });
      return;
    }

    if (mode === MODES.register && !form.name.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Nombre requerido',
        text2: 'Introduce tu nombre para crear la cuenta.',
      });
      return;
    }

    setLoading(true);

    try {
      if (mode === MODES.login) {
        const result = await loginWithEmail(form.email, form.password);
        if (!result.success) throw new Error(result.error);
        Toast.show({ type: 'success', text1: 'Sesion iniciada correctamente' });
        navigation.goBack();
        return;
      }

      if (mode === MODES.register) {
        const result = await registerWithEmail(form);
        if (!result.success) throw new Error(result.error);
        Toast.show({ type: 'success', text1: 'Cuenta creada correctamente' });
        navigation.goBack();
        return;
      }

      const result = await resetPassword(form.email);
      if (!result.success) throw new Error(result.error);
      Toast.show({
        type: 'success',
        text1: 'Correo enviado',
        text2: 'Revisa tu bandeja para restablecer la contrasena.',
      });
      setMode(MODES.login);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'No se pudo completar la accion',
        text2: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const title = {
    login: 'Iniciar sesion',
    register: 'Crear cuenta',
    reset: 'Restablecer contrasena',
  }[mode];

  const helper = {
    login: 'Accede para guardar tus solicitudes, ver tu historial y mantener tus datos listos.',
    register: 'Crea tu cuenta para dar seguimiento a tus pedidos y consultas.',
    reset: 'Te enviaremos un correo con los pasos para recuperar el acceso.',
  }[mode];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <AppHeader
          isDark={isDark}
          title="Acceso"
          subtitle="Cuenta mobile"
          onLeftPress={() => navigation.goBack()}
        />

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <AnimatedEntrance delay={35} style={styles.heroCard}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.helper}>{helper}</Text>

            <View style={styles.tabs}>
              <TouchableOpacity
                style={[styles.tab, mode === MODES.login && styles.tabActive]}
                onPress={() => setMode(MODES.login)}
                activeOpacity={0.92}
              >
                <Text style={[styles.tabText, mode === MODES.login && styles.tabTextActive]}>Entrar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, mode === MODES.register && styles.tabActive]}
                onPress={() => setMode(MODES.register)}
                activeOpacity={0.92}
              >
                <Text style={[styles.tabText, mode === MODES.register && styles.tabTextActive]}>Registro</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, mode === MODES.reset && styles.tabActive]}
                onPress={() => setMode(MODES.reset)}
                activeOpacity={0.92}
              >
                <Text style={[styles.tabText, mode === MODES.reset && styles.tabTextActive]}>Recuperar</Text>
              </TouchableOpacity>
            </View>
          </AnimatedEntrance>

          <AnimatedEntrance delay={85} style={styles.formCard}>
            {mode === MODES.register && (
              <TextInput
                style={styles.input}
                placeholder="Tu nombre"
                placeholderTextColor={COLORS.textMuted}
                value={form.name}
                onChangeText={(text) => setField('name', text)}
              />
            )}

            <TextInput
              style={styles.input}
              placeholder="Correo electronico"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="none"
              keyboardType="email-address"
              value={form.email}
              onChangeText={(text) => setField('email', text)}
            />

            {mode !== MODES.reset && (
              <TextInput
                style={styles.input}
                placeholder="Contrasena"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry
                value={form.password}
                onChangeText={(text) => setField('password', text)}
              />
            )}

            <TouchableOpacity
              style={[styles.submit, loading && styles.submitDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.92}
            >
              <Text style={styles.submitText}>
                {loading ? 'Procesando...' : mode === MODES.login ? 'Entrar' : mode === MODES.register ? 'Crear cuenta' : 'Enviar correo'}
              </Text>
            </TouchableOpacity>
          </AnimatedEntrance>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (isDark) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: isDark ? COLORS.backgroundDark : COLORS.backgroundLight,
    },
    keyboard: {
      flex: 1,
    },
    content: {
      padding: 16,
      gap: 14,
      paddingBottom: 36,
    },
    heroCard: {
      padding: 22,
      gap: 14,
      borderRadius: 30,
      borderWidth: 1,
      borderColor: isDark ? COLORS.borderDark : COLORS.border,
      backgroundColor: isDark ? 'rgba(26, 34, 53, 0.94)' : 'rgba(255,255,255,0.98)',
    },
    title: {
      fontSize: 30,
      lineHeight: 36,
      fontWeight: '900',
      color: isDark ? COLORS.textLight : COLORS.textPrimary,
    },
    helper: {
      fontSize: 14,
      lineHeight: 22,
      color: isDark ? COLORS.textMuted : COLORS.textSecondary,
    },
    tabs: {
      flexDirection: 'row',
      gap: 8,
    },
    tab: {
      flex: 1,
      minHeight: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 14,
      borderWidth: 1,
      borderColor: isDark ? COLORS.borderDark : COLORS.border,
      backgroundColor: isDark ? '#111827' : COLORS.backgroundLight,
    },
    tabActive: {
      borderColor: COLORS.primary,
      backgroundColor: COLORS.primary,
    },
    tabText: {
      fontWeight: '700',
      color: isDark ? COLORS.textMuted : COLORS.textSecondary,
    },
    tabTextActive: {
      color: '#fff',
    },
    formCard: {
      padding: 22,
      gap: 12,
      borderRadius: 30,
      borderWidth: 1,
      borderColor: isDark ? COLORS.borderDark : COLORS.border,
      backgroundColor: isDark ? 'rgba(26, 34, 53, 0.94)' : 'rgba(255,255,255,0.98)',
    },
    input: {
      minHeight: 54,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: isDark ? COLORS.borderDark : COLORS.border,
      backgroundColor: isDark ? '#111827' : COLORS.backgroundLight,
      paddingHorizontal: 16,
      color: isDark ? COLORS.textLight : COLORS.textPrimary,
    },
    submit: {
      marginTop: 6,
      minHeight: 54,
      borderRadius: 18,
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
