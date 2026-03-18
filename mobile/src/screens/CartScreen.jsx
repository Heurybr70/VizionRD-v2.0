import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import AnimatedEntrance from '../components/common/AnimatedEntrance';
import AppHeader from '../components/common/AppHeader';
import ScreenState from '../components/common/ScreenState';
import COLORS from '@shared/constants/colors';
import { formatPrice } from '@shared/utils/formatters';

export default function CartScreen() {
  const navigation = useNavigation();
  const { isDark } = useTheme();
  const { items, itemCount, subtotal, itbis, total, updateQuantity, removeItem, clearCart } = useCart();
  const styles = useMemo(() => createStyles(isDark), [isDark]);

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('Tienda');
  };

  const handleCheckout = () => {
    navigation.navigate('Checkout');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader
        isDark={isDark}
        title="Mi carrito"
        subtitle={itemCount > 0 ? `${itemCount} item(s)` : 'Listo para tu pedido'}
        onLeftPress={handleBack}
        rightContent={itemCount > 0 ? (
          <TouchableOpacity style={styles.headerAction} onPress={clearCart} activeOpacity={0.9}>
            <Ionicons name="trash-outline" size={20} color={isDark ? COLORS.textLight : COLORS.textPrimary} />
          </TouchableOpacity>
        ) : null}
      />

      {items.length === 0 ? (
        <View style={styles.emptyWrap}>
          <AnimatedEntrance delay={70}>
            <ScreenState
              isDark={isDark}
              icon="cart-outline"
              title="Tu carrito esta vacio"
              description="Explora nuestros productos, agrega tus favoritos y arma un pedido en pocos toques."
              actionLabel="Ver productos"
              onAction={() => navigation.navigate('Tienda')}
            />
          </AnimatedEntrance>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <AnimatedEntrance delay={40} style={styles.summaryBanner}>
            <View style={styles.summaryBannerIcon}>
              <Ionicons name="bag-check-outline" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.summaryBannerCopy}>
              <Text style={styles.summaryBannerTitle}>Tu pedido va tomando forma</Text>
              <Text style={styles.summaryBannerText}>
                Ajusta cantidades y envia la solicitud cuando estes listo.
              </Text>
            </View>
          </AnimatedEntrance>

          <View style={styles.itemsList}>
            {items.map((item, index) => (
              <AnimatedEntrance key={item.id} delay={70 + index * 35}>
                <View style={styles.itemCard}>
                  <View style={styles.itemImageWrap}>
                    {item.thumbnail || item.image ? (
                      <Image source={{ uri: item.thumbnail || item.image }} style={styles.itemImage} />
                    ) : (
                      <View style={[styles.itemImage, styles.itemPlaceholder]} />
                    )}
                  </View>

                  <View style={styles.itemInfo}>
                    <View style={styles.itemTopRow}>
                      <View style={styles.itemCopy}>
                        <Text style={styles.itemCategory}>{item.category || 'general'}</Text>
                        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                      </View>

                      <TouchableOpacity style={styles.removeButton} onPress={() => removeItem(item.id)}>
                        <Ionicons name="close" size={18} color={COLORS.textMuted} />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.itemFooter}>
                      <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
                      <View style={styles.quantityWrap}>
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Ionicons name="remove" size={15} color={isDark ? COLORS.textLight : COLORS.textPrimary} />
                        </TouchableOpacity>
                        <Text style={styles.quantityValue}>{item.quantity}</Text>
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Ionicons name="add" size={15} color={isDark ? COLORS.textLight : COLORS.textPrimary} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              </AnimatedEntrance>
            ))}
          </View>

          <AnimatedEntrance delay={140} style={styles.summary}>
            <Text style={styles.summaryTitle}>Resumen del pedido</Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>ITBIS (18%)</Text>
              <Text style={styles.summaryValue}>{formatPrice(itbis)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Envio</Text>
              <Text style={[styles.summaryValue, styles.summarySuccess]}>A coordinar</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total estimado</Text>
              <Text style={styles.totalValue}>{formatPrice(total)}</Text>
            </View>

            <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout} activeOpacity={0.92}>
              <Text style={styles.checkoutText}>Enviar pedido</Text>
              <Ionicons name="chevron-forward" size={18} color="#fff" />
            </TouchableOpacity>
          </AnimatedEntrance>
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
    emptyWrap: {
      flex: 1,
      justifyContent: 'center',
      paddingBottom: 24,
    },
    content: {
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 36,
      gap: 14,
    },
    summaryBanner: {
      flexDirection: 'row',
      gap: 14,
      padding: 18,
      borderRadius: 26,
      borderWidth: 1,
      borderColor: isDark ? COLORS.borderDark : COLORS.border,
      backgroundColor: isDark ? 'rgba(26, 34, 53, 0.92)' : 'rgba(255,255,255,0.96)',
    },
    summaryBannerIcon: {
      width: 46,
      height: 46,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? 'rgba(37, 99, 235, 0.18)' : 'rgba(37, 99, 235, 0.1)',
    },
    summaryBannerCopy: {
      flex: 1,
      gap: 4,
    },
    summaryBannerTitle: {
      fontSize: 18,
      fontWeight: '900',
      color: isDark ? COLORS.textLight : COLORS.textPrimary,
    },
    summaryBannerText: {
      fontSize: 13,
      lineHeight: 20,
      color: isDark ? COLORS.textMuted : COLORS.textSecondary,
    },
    itemsList: {
      gap: 12,
    },
    itemCard: {
      flexDirection: 'row',
      gap: 14,
      padding: 16,
      borderRadius: 26,
      borderWidth: 1,
      borderColor: isDark ? COLORS.borderDark : COLORS.border,
      backgroundColor: isDark ? 'rgba(26, 34, 53, 0.94)' : 'rgba(255,255,255,0.98)',
    },
    itemImageWrap: {
      width: 90,
      height: 90,
      borderRadius: 20,
      overflow: 'hidden',
      backgroundColor: isDark ? '#0f172a' : '#eef2ff',
    },
    itemImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    itemPlaceholder: {
      backgroundColor: isDark ? '#1e293b' : '#e2e8f0',
    },
    itemInfo: {
      flex: 1,
      justifyContent: 'space-between',
      gap: 12,
    },
    itemTopRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },
    itemCopy: {
      flex: 1,
      gap: 6,
    },
    itemCategory: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      color: COLORS.primary,
    },
    itemName: {
      fontSize: 15,
      lineHeight: 21,
      fontWeight: '800',
      color: isDark ? COLORS.textLight : COLORS.textPrimary,
    },
    removeButton: {
      width: 32,
      height: 32,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? '#111827' : COLORS.backgroundLight,
    },
    itemFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    itemPrice: {
      fontSize: 16,
      fontWeight: '900',
      color: COLORS.primary,
    },
    quantityWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 8,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: isDark ? '#111827' : COLORS.backgroundLight,
    },
    quantityButton: {
      width: 28,
      height: 28,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#fff',
    },
    quantityValue: {
      minWidth: 22,
      textAlign: 'center',
      fontWeight: '900',
      color: isDark ? COLORS.textLight : COLORS.textPrimary,
    },
    summary: {
      padding: 22,
      gap: 12,
      borderRadius: 30,
      borderWidth: 1,
      borderColor: isDark ? COLORS.borderDark : COLORS.border,
      backgroundColor: isDark ? 'rgba(26, 34, 53, 0.94)' : 'rgba(255,255,255,0.98)',
    },
    summaryTitle: {
      fontSize: 21,
      fontWeight: '900',
      color: isDark ? COLORS.textLight : COLORS.textPrimary,
    },
    summaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    summaryLabel: {
      color: isDark ? COLORS.textMuted : COLORS.textSecondary,
    },
    summaryValue: {
      color: isDark ? COLORS.textLight : COLORS.textPrimary,
      fontWeight: '700',
    },
    summarySuccess: {
      color: COLORS.success,
    },
    divider: {
      height: 1,
      backgroundColor: isDark ? COLORS.borderDark : COLORS.border,
    },
    totalLabel: {
      fontSize: 18,
      fontWeight: '900',
      color: isDark ? COLORS.textLight : COLORS.textPrimary,
    },
    totalValue: {
      fontSize: 21,
      fontWeight: '900',
      color: COLORS.primary,
    },
    checkoutButton: {
      marginTop: 8,
      minHeight: 54,
      borderRadius: 18,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: COLORS.primary,
    },
    checkoutText: {
      color: '#fff',
      fontWeight: '800',
      fontSize: 15,
    },
  });
