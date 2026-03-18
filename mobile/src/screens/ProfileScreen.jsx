import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { logout } from '../services/auth.service';
import AnimatedEntrance from '../components/common/AnimatedEntrance';
import AppHeader from '../components/common/AppHeader';
import ScreenState from '../components/common/ScreenState';
import COLORS from '@shared/constants/colors';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { isDark, toggleTheme } = useTheme();
  const { user, isAuthenticated, loading } = useAuth();
  const { itemCount } = useCart();
  const { favoriteCount } = useFavorites();
  const styles = useMemo(() => createStyles(isDark), [isDark]);

  const handleLogout = async () => {
    const result = await logout();
    if (!result.success) {
      Toast.show({
        type: 'error',
        text1: 'No se pudo cerrar sesion',
        text2: result.error,
      });
      return;
    }

    Toast.show({ type: 'success', text1: 'Sesion cerrada' });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenState
          isDark={isDark}
          icon="time-outline"
          title="Cargando perfil"
          description="Estamos verificando tu sesion actual."
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader
        isDark={isDark}
        title="Perfil"
        subtitle={isAuthenticated ? 'Tu espacio personal' : 'Accede a tu cuenta'}
        leftIcon={isDark ? 'sunny-outline' : 'moon-outline'}
        onLeftPress={toggleTheme}
        rightContent={isAuthenticated ? (
          <TouchableOpacity
            style={styles.headerAction}
            onPress={() => navigation.navigate('Requests')}
            activeOpacity={0.9}
          >
            <Ionicons name="receipt-outline" size={20} color={isDark ? COLORS.textLight : COLORS.textPrimary} />
          </TouchableOpacity>
        ) : null}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <AnimatedEntrance delay={40} style={styles.heroCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={48} color={COLORS.primary} />
          </View>

          <Text style={styles.name}>
            {isAuthenticated ? (user?.displayName || user?.email) : 'Invitado'}
          </Text>
          <Text style={styles.subtitle}>
            {isAuthenticated ? user?.email : 'Inicia sesion para ver tu historial y gestionar tus pedidos.'}
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{favoriteCount}</Text>
              <Text style={styles.statLabel}>Favoritos</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{itemCount}</Text>
              <Text style={styles.statLabel}>Carrito</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{isDark ? 'Dark' : 'Light'}</Text>
              <Text style={styles.statLabel}>Tema</Text>
            </View>
          </View>
        </AnimatedEntrance>

        {!isAuthenticated ? (
          <AnimatedEntrance delay={90} style={styles.authCard}>
            <Text style={styles.cardTitle}>Todo tu seguimiento en un solo lugar</Text>
            <Text style={styles.cardText}>
              Crea una cuenta para consultar pedidos, enviar solicitudes y mantener tus datos listos para el proximo contacto.
            </Text>

            <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('Auth')} activeOpacity={0.92}>
              <Text style={styles.primaryButtonText}>Iniciar sesion / registrarse</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Contact')} activeOpacity={0.92}>
              <Text style={styles.secondaryButtonText}>Contactar sin cuenta</Text>
            </TouchableOpacity>
          </AnimatedEntrance>
        ) : (
          <AnimatedEntrance delay={90} style={styles.options}>
            <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('Requests')} activeOpacity={0.9}>
              <View style={styles.optionIcon}>
                <Ionicons name="receipt-outline" size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.optionText}>Mis pedidos y solicitudes</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('Favoritos')} activeOpacity={0.9}>
              <View style={styles.optionIcon}>
                <Ionicons name="heart-outline" size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.optionText}>Mis favoritos</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('Contact')} activeOpacity={0.9}>
              <View style={styles.optionIcon}>
                <Ionicons name="mail-outline" size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.optionText}>Contacto</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.option} onPress={toggleTheme} activeOpacity={0.9}>
              <View style={styles.optionIcon}>
                <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.optionText}>Tema: {isDark ? 'Oscuro' : 'Claro'}</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.option} onPress={handleLogout} activeOpacity={0.9}>
              <View style={[styles.optionIcon, styles.optionDangerIcon]}>
                <Ionicons name="log-out-outline" size={18} color={COLORS.error} />
              </View>
              <Text style={[styles.optionText, styles.optionDangerText]}>Cerrar sesion</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.error} />
            </TouchableOpacity>
          </AnimatedEntrance>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (isDark) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: isDark ? COLORS.backgroundDark : COLORS.backgroundLight,
    },
    headerAction: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : COLORS.backgroundLight,
    },
    content: {
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 36,
      gap: 14,
    },
    heroCard: {
      alignItems: 'center',
      padding: 24,
      gap: 10,
      borderRadius: 30,
      borderWidth: 1,
      borderColor: isDark ? COLORS.borderDark : COLORS.border,
      backgroundColor: isDark ? 'rgba(26, 34, 53, 0.94)' : 'rgba(255,255,255,0.98)',
    },
    avatar: {
      width: 108,
      height: 108,
      borderRadius: 54,
      backgroundColor: isDark ? 'rgba(37, 99, 235, 0.14)' : 'rgba(37, 99, 235, 0.1)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
    },
    name: {
      fontSize: 24,
      fontWeight: '900',
      color: isDark ? COLORS.textLight : COLORS.textPrimary,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 13,
      lineHeight: 20,
      textAlign: 'center',
      color: isDark ? COLORS.textMuted : COLORS.textSecondary,
    },
    statsRow: {
      flexDirection: 'row',
      width: '100%',
      gap: 10,
      marginTop: 6,
    },
    statCard: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      minHeight: 76,
      borderRadius: 20,
      backgroundColor: isDark ? '#111827' : COLORS.backgroundLight,
    },
    statValue: {
      fontSize: 18,
      fontWeight: '900',
      color: isDark ? COLORS.textLight : COLORS.textPrimary,
    },
    statLabel: {
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.7,
      color: isDark ? COLORS.textMuted : COLORS.textSecondary,
    },
    authCard: {
      padding: 22,
      gap: 14,
      borderRadius: 30,
      borderWidth: 1,
      borderColor: isDark ? COLORS.borderDark : COLORS.border,
      backgroundColor: isDark ? 'rgba(26, 34, 53, 0.94)' : 'rgba(255,255,255,0.98)',
    },
    cardTitle: {
      fontSize: 22,
      lineHeight: 28,
      fontWeight: '900',
      color: isDark ? COLORS.textLight : COLORS.textPrimary,
    },
    cardText: {
      fontSize: 14,
      lineHeight: 22,
      color: isDark ? COLORS.textMuted : COLORS.textSecondary,
    },
    primaryButton: {
      minHeight: 54,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: COLORS.primary,
    },
    primaryButtonText: {
      color: '#fff',
      fontWeight: '800',
      fontSize: 15,
    },
    secondaryButton: {
      minHeight: 52,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: isDark ? COLORS.borderDark : COLORS.border,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? '#111827' : COLORS.backgroundLight,
    },
    secondaryButtonText: {
      color: isDark ? COLORS.textLight : COLORS.textPrimary,
      fontWeight: '700',
      fontSize: 15,
    },
    options: {
      borderRadius: 30,
      borderWidth: 1,
      borderColor: isDark ? COLORS.borderDark : COLORS.border,
      backgroundColor: isDark ? 'rgba(26, 34, 53, 0.94)' : 'rgba(255,255,255,0.98)',
      overflow: 'hidden',
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      paddingHorizontal: 18,
      paddingVertical: 18,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? COLORS.borderDark : COLORS.border,
    },
    optionIcon: {
      width: 38,
      height: 38,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? '#111827' : COLORS.backgroundLight,
    },
    optionDangerIcon: {
      backgroundColor: isDark ? 'rgba(239, 68, 68, 0.14)' : 'rgba(239, 68, 68, 0.1)',
    },
    optionText: {
      flex: 1,
      fontSize: 14,
      color: isDark ? COLORS.textLight : COLORS.textPrimary,
      fontWeight: '700',
    },
    optionDangerText: {
      color: COLORS.error,
    },
  });
