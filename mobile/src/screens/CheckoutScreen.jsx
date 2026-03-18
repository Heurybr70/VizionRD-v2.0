import React, { useMemo } from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';

import COLORS from '@shared/constants/colors';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import LeadCaptureForm from '../components/forms/LeadCaptureForm';
import AppHeader from '../components/common/AppHeader';
import AnimatedEntrance from '../components/common/AnimatedEntrance';
import ScreenState from '../components/common/ScreenState';
import { createLeadRequest, REQUEST_TYPES, buildCartMessage } from '../services/lead.service';
import { formatPrice } from '@shared/utils/formatters';

export default function CheckoutScreen() {
  const navigation = useNavigation();
  const { isDark } = useTheme();
  const { user } = useAuth();
  const { items, total, clearCart } = useCart();
  const styles = useMemo(() => createStyles(isDark), [isDark]);

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenState
          isDark={isDark}
          icon="bag-handle-outline"
          title="No hay productos para procesar"
          description="Agrega productos al carrito antes de finalizar tu solicitud."
          actionLabel="Volver al carrito"
          onAction={() => navigation.goBack()}
        />
      </SafeAreaView>
    );
  }

  const handleSubmit = async (values) => {
    const result = await createLeadRequest({
      ...values,
      subject: values.subject || 'Solicitud de compra desde mobile',
      message: values.message || buildCartMessage(items, total),
      source: 'mobile_checkout',
      requestType: REQUEST_TYPES.CHECKOUT,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      total,
      userId: user?.uid || null,
    });

    if (!result.success) {
      throw new Error(result.error || 'No se pudo enviar tu pedido.');
    }

    clearCart();
    Toast.show({
      type: 'success',
      text1: 'Pedido enviado',
      text2: 'Te contactaremos para confirmar disponibilidad.',
    });

    navigation.navigate('MainTabs', { screen: 'Perfil' });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader
        isDark={isDark}
        title="Finalizar solicitud"
        subtitle="Confirmacion de compra"
        onLeftPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AnimatedEntrance delay={35} style={styles.summary}>
          <Text style={styles.summaryTitle}>Resumen del pedido</Text>
          <Text style={styles.summaryText}>
            Revisaremos esta solicitud y te contactaremos para confirmar disponibilidad, entrega y pago.
          </Text>

          {items.map((item) => (
            <View key={item.id} style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{item.name} x{item.quantity}</Text>
              <Text style={styles.summaryValue}>{formatPrice((item.price || 0) * item.quantity)}</Text>
            </View>
          ))}

          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total estimado</Text>
            <Text style={styles.totalValue}>{formatPrice(total)}</Text>
          </View>
        </AnimatedEntrance>

        <AnimatedEntrance delay={85}>
          <LeadCaptureForm
            isDark={isDark}
            initialValues={{
              name: user?.displayName || '',
              email: user?.email || '',
              subject: 'Solicitud de compra desde mobile',
              message: buildCartMessage(items, total),
            }}
            formTitle="Confirma tus datos"
            helperText="Esta solicitud se guardara como lead para seguimiento desde el admin."
            submitLabel="Enviar pedido"
            onSubmit={handleSubmit}
          />
        </AnimatedEntrance>
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
    content: {
      padding: 16,
      gap: 14,
      paddingBottom: 36,
    },
    summary: {
      padding: 22,
      gap: 10,
      borderRadius: 30,
      borderWidth: 1,
      borderColor: isDark ? COLORS.borderDark : COLORS.border,
      backgroundColor: isDark ? 'rgba(26, 34, 53, 0.94)' : 'rgba(255,255,255,0.98)',
    },
    summaryTitle: {
      fontSize: 22,
      fontWeight: '900',
      color: isDark ? COLORS.textLight : COLORS.textPrimary,
    },
    summaryText: {
      fontSize: 13,
      lineHeight: 20,
      color: isDark ? COLORS.textMuted : COLORS.textSecondary,
      marginBottom: 6,
    },
    summaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    summaryLabel: {
      flex: 1,
      color: isDark ? COLORS.textMuted : COLORS.textSecondary,
    },
    summaryValue: {
      color: isDark ? COLORS.textLight : COLORS.textPrimary,
      fontWeight: '700',
    },
    totalRow: {
      marginTop: 10,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: isDark ? COLORS.borderDark : COLORS.border,
    },
    totalLabel: {
      fontSize: 17,
      fontWeight: '900',
      color: isDark ? COLORS.textLight : COLORS.textPrimary,
    },
    totalValue: {
      fontSize: 19,
      fontWeight: '900',
      color: COLORS.primary,
    },
  });
