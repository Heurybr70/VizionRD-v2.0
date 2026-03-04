/**
 * CartScreen — basado en 5.html
 * Lista de ítems + Resumen del pedido
 */
import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Image, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import COLORS from '@shared/constants/colors';
import { formatPrice } from '@shared/utils/formatters';

export default function CartScreen() {
  const { isDark } = useTheme();
  const navigation = useNavigation();
  const { items, itemCount, subtotal, itbis, total, updateQuantity, removeItem, clearCart } = useCart();
  const s = styles(isDark);

  const handleCheckout = () => {
    Toast.show({ type: 'info', text1: 'Próximamente', text2: 'La pasarela de pago está en desarrollo.' });
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={isDark ? COLORS.textLight : COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Mi Carrito</Text>
        {itemCount > 0 ? (
          <TouchableOpacity style={s.iconBtn} onPress={clearCart}>
            <Ionicons name="trash-outline" size={22} color={isDark ? COLORS.textLight : COLORS.textPrimary} />
          </TouchableOpacity>
        ) : <View style={s.iconBtn} />}
      </View>

      {items.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="cart-outline" size={64} color={COLORS.textMuted} />
          <Text style={s.emptyTitle}>Tu carrito está vacío</Text>
          <Text style={s.emptySubtitle}>Explora nuestros productos</Text>
          <TouchableOpacity style={s.shopBtn} onPress={() => navigation.navigate('Tienda')}>
            <Text style={s.shopBtnText}>Ver Productos</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Items */}
          <View style={s.itemsList}>
            {items.map(item => (
              <View key={item.id} style={s.cartItem}>
                <View style={s.itemImageWrap}>
                  {item.thumbnail || item.image ? (
                    <Image source={{ uri: item.thumbnail || item.image }} style={s.itemImage} />
                  ) : (
                    <View style={[s.itemImage, { backgroundColor: isDark ? '#1e293b' : '#e2e8f0' }]} />
                  )}
                </View>
                <View style={s.itemInfo}>
                  <Text style={s.itemName} numberOfLines={2}>{item.name}</Text>
                  <Text style={s.itemCategory}>{item.category || ''}</Text>
                  <View style={s.itemBottom}>
                    <Text style={s.itemPrice}>{formatPrice(item.price)}</Text>
                    <View style={s.qtyRow}>
                      <TouchableOpacity
                        style={s.qtyBtn}
                        onPress={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Text style={s.qtyBtnText}>-</Text>
                      </TouchableOpacity>
                      <Text style={s.qtyValue}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={s.qtyBtn}
                        onPress={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Text style={s.qtyBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
                <TouchableOpacity onPress={() => removeItem(item.id)} style={{ padding: 4 }}>
                  <Ionicons name="close" size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Order Summary */}
          <View style={s.summary}>
            <Text style={s.summaryTitle}>Resumen del Pedido</Text>

            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Subtotal</Text>
              <Text style={s.summaryValue}>{formatPrice(subtotal)}</Text>
            </View>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Envío</Text>
              <Text style={[s.summaryValue, { color: COLORS.success, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }]}>Gratis</Text>
            </View>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Impuestos (ITBIS 18%)</Text>
              <Text style={s.summaryValue}>{formatPrice(itbis)}</Text>
            </View>

            <View style={s.divider} />

            <View style={s.summaryRow}>
              <Text style={s.totalLabel}>Total</Text>
              <Text style={s.totalValue}>{formatPrice(total)}</Text>
            </View>

            <TouchableOpacity style={s.checkoutBtn} onPress={handleCheckout}>
              <Text style={s.checkoutText}>Finalizar Compra</Text>
              <Ionicons name="chevron-forward" size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = (isDark) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: isDark ? COLORS.backgroundDark : COLORS.backgroundLight },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: isDark ? COLORS.backgroundDark : COLORS.surface,
    borderBottomWidth: 1, borderBottomColor: isDark ? COLORS.borderDark : COLORS.border,
  },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: 'bold', color: isDark ? COLORS.textLight : COLORS.textPrimary },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: isDark ? COLORS.textLight : COLORS.textPrimary },
  emptySubtitle: { fontSize: 13, color: COLORS.textMuted },
  shopBtn: { marginTop: 8, backgroundColor: COLORS.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
  shopBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  itemsList: { padding: 16, gap: 4 },
  cartItem: {
    flexDirection: 'row', gap: 12, padding: 12,
    backgroundColor: isDark ? '#1a2235' : COLORS.surface,
    borderRadius: 14, borderWidth: 1,
    borderColor: isDark ? COLORS.borderDark : COLORS.border,
    marginBottom: 8, alignItems: 'flex-start',
  },
  itemImageWrap: { width: 76, height: 76, borderRadius: 10, overflow: 'hidden' },
  itemImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  itemInfo: { flex: 1, gap: 3 },
  itemName: { fontSize: 14, fontWeight: '600', color: isDark ? COLORS.textLight : COLORS.textPrimary, lineHeight: 19 },
  itemCategory: { fontSize: 11, color: COLORS.textMuted },
  itemBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  itemPrice: { fontSize: 15, fontWeight: 'bold', color: COLORS.primary },
  qtyRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: isDark ? '#0d1525' : '#f1f5f9',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
  },
  qtyBtn: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center', borderRadius: 6, backgroundColor: isDark ? '#1e293b' : '#fff' },
  qtyBtnText: { fontWeight: 'bold', color: isDark ? COLORS.textLight : COLORS.textSecondary, fontSize: 14 },
  qtyValue: { fontWeight: 'bold', fontSize: 13, minWidth: 16, textAlign: 'center', color: isDark ? COLORS.textLight : COLORS.textPrimary },
  summary: {
    margin: 16, padding: 20,
    backgroundColor: isDark ? '#0d1525' : '#f8fafc',
    borderRadius: 16, borderTopWidth: 1, borderTopColor: isDark ? COLORS.borderDark : COLORS.border,
    gap: 12,
  },
  summaryTitle: { fontSize: 17, fontWeight: 'bold', color: isDark ? COLORS.textLight : COLORS.textPrimary },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 13, color: isDark ? COLORS.textMuted : COLORS.textSecondary },
  summaryValue: { fontSize: 14, fontWeight: '500', color: isDark ? COLORS.textLight : COLORS.textPrimary },
  divider: { height: 1, backgroundColor: isDark ? COLORS.borderDark : COLORS.border },
  totalLabel: { fontSize: 17, fontWeight: 'bold', color: isDark ? COLORS.textLight : COLORS.textPrimary },
  totalValue: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary },
  checkoutBtn: {
    marginTop: 8, backgroundColor: COLORS.primary, padding: 16, borderRadius: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    shadowColor: COLORS.primary, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  checkoutText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});
