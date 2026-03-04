import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { logout } from '../services/auth.service';
import COLORS from '@shared/constants/colors';

export default function ProfileScreen() {
  const { isDark, toggleTheme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const s = styles(isDark);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Perfil</Text>
        <TouchableOpacity style={s.iconBtn} onPress={toggleTheme}>
          <Ionicons
            name={isDark ? 'sunny-outline' : 'moon-outline'}
            size={22}
            color={isDark ? COLORS.textLight : COLORS.textPrimary}
          />
        </TouchableOpacity>
      </View>

      <View style={s.content}>
        <View style={s.avatar}>
          <Ionicons name="person" size={48} color={COLORS.primary} />
        </View>
        <Text style={s.name}>
          {isAuthenticated ? user?.email : 'Invitado'}
        </Text>
        <Text style={s.subtitle}>
          {isAuthenticated ? 'Cuenta activa' : 'No has iniciado sesión'}
        </Text>

        <View style={s.options}>
          <TouchableOpacity style={s.option}>
            <Ionicons name="receipt-outline" size={20} color={isDark ? COLORS.textLight : COLORS.textSecondary} />
            <Text style={s.optionText}>Mis Pedidos</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={s.option} onPress={toggleTheme}>
            <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={20} color={isDark ? COLORS.textLight : COLORS.textSecondary} />
            <Text style={s.optionText}>Tema: {isDark ? 'Oscuro' : 'Claro'}</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
          {isAuthenticated && (
            <TouchableOpacity style={s.option} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
              <Text style={[s.optionText, { color: COLORS.error }]}>Cerrar sesión</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = (isDark) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: isDark ? COLORS.backgroundDark : COLORS.backgroundLight },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: isDark ? COLORS.backgroundDark : COLORS.surface,
    borderBottomWidth: 1, borderBottomColor: isDark ? COLORS.borderDark : COLORS.border,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: isDark ? COLORS.textLight : COLORS.textPrimary },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, alignItems: 'center', paddingTop: 40, gap: 8, paddingHorizontal: 20 },
  avatar: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: `${COLORS.primary}1A`,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  name: { fontSize: 20, fontWeight: 'bold', color: isDark ? COLORS.textLight : COLORS.textPrimary },
  subtitle: { fontSize: 13, color: COLORS.textMuted },
  options: {
    width: '100%', marginTop: 28,
    backgroundColor: isDark ? COLORS.surfaceDark : COLORS.surface,
    borderRadius: 14, overflow: 'hidden',
    borderWidth: 1, borderColor: isDark ? COLORS.borderDark : COLORS.border,
  },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16,
    borderBottomWidth: 1, borderBottomColor: isDark ? COLORS.borderDark : COLORS.border,
  },
  optionText: { flex: 1, fontSize: 14, color: isDark ? COLORS.textLight : COLORS.textPrimary },
  error: COLORS.error,
});
