import React, { useMemo } from 'react';
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';

import COLORS from '@shared/constants/colors';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import AppHeader from '../components/common/AppHeader';
import AnimatedEntrance from '../components/common/AnimatedEntrance';
import ScreenState from '../components/common/ScreenState';
import { getMyRequests } from '../services/lead.service';
import { formatPrice } from '@shared/utils/formatters';

const requestTypeLabels = {
  contact: 'Contacto',
  product: 'Producto',
  service: 'Servicio',
  checkout: 'Pedido',
};

export default function RequestsScreen() {
  const navigation = useNavigation();
  const { isDark } = useTheme();
  const { user } = useAuth();
  const styles = useMemo(() => createStyles(isDark), [isDark]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['my-requests', user?.uid],
    queryFn: () => getMyRequests(user?.uid),
    enabled: !!user?.uid,
  });

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenState
          isDark={isDark}
          icon="lock-closed-outline"
          title="Necesitas iniciar sesion"
          description="Accede con tu cuenta para consultar tu historial de solicitudes."
          actionLabel="Iniciar sesion"
          onAction={() => navigation.navigate('Auth')}
        />
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenState
          isDark={isDark}
          icon="time-outline"
          title="Cargando solicitudes"
          description="Estamos consultando tu historial."
        />
      </SafeAreaView>
    );
  }

  if (data && !data.success) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenState
          isDark={isDark}
          icon="cloud-offline-outline"
          title="No pudimos cargar tu historial"
          description={data.error || 'Intenta de nuevo en unos segundos.'}
          actionLabel="Reintentar"
          onAction={refetch}
        />
      </SafeAreaView>
    );
  }

  const requests = data?.data || [];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader
        isDark={isDark}
        title="Mis solicitudes"
        subtitle="Historial de actividad"
        onLeftPress={() => navigation.goBack()}
        rightContent={(
          <TouchableOpacity style={styles.headerAction} onPress={refetch} activeOpacity={0.9}>
            <Ionicons name="refresh-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      />

      {requests.length === 0 ? (
        <ScreenState
          isDark={isDark}
          icon="file-tray-outline"
          title="Aun no tienes solicitudes"
          description="Cuando envies una consulta o pedido desde la app, aparecera aqui."
          actionLabel="Ir a contacto"
          onAction={() => navigation.navigate('Contact')}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {requests.map((request, index) => (
            <AnimatedEntrance key={request.id} delay={50 + index * 35}>
              <View style={styles.card}>
                <View style={styles.row}>
                  <Text style={styles.type}>{requestTypeLabels[request.requestType] || 'Solicitud'}</Text>
                  <Text style={styles.status}>{request.status || 'new'}</Text>
                </View>

                <Text style={styles.subject}>
                  {request.subject || request.referenceName || 'Solicitud mobile'}
                </Text>

                <Text style={styles.message} numberOfLines={4}>{request.message}</Text>

                <View style={styles.row}>
                  <Text style={styles.meta}>
                    {request.createdAt?.toDate?.()?.toLocaleDateString?.('es-DO') || 'Fecha pendiente'}
                  </Text>
                  {typeof request.total === 'number' && (
                    <Text style={styles.total}>{formatPrice(request.total)}</Text>
                  )}
                </View>
              </View>
            </AnimatedEntrance>
          ))}
        </ScrollView>
      )}
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
      padding: 16,
      gap: 12,
      paddingBottom: 36,
    },
    card: {
      padding: 18,
      gap: 10,
      borderRadius: 28,
      borderWidth: 1,
      borderColor: isDark ? COLORS.borderDark : COLORS.border,
      backgroundColor: isDark ? 'rgba(26, 34, 53, 0.94)' : 'rgba(255,255,255,0.98)',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    type: {
      fontSize: 11,
      fontWeight: '800',
      color: COLORS.primary,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    status: {
      fontSize: 11,
      fontWeight: '700',
      color: isDark ? COLORS.textMuted : COLORS.textSecondary,
      textTransform: 'uppercase',
    },
    subject: {
      fontSize: 18,
      lineHeight: 24,
      fontWeight: '900',
      color: isDark ? COLORS.textLight : COLORS.textPrimary,
    },
    message: {
      fontSize: 13,
      lineHeight: 21,
      color: isDark ? COLORS.textMuted : COLORS.textSecondary,
    },
    meta: {
      fontSize: 12,
      color: isDark ? COLORS.textMuted : COLORS.textSecondary,
    },
    total: {
      fontSize: 15,
      fontWeight: '900',
      color: COLORS.primary,
    },
  });
