/**
 * ProductDetailScreen — basado en 4.html
 */
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Image, StyleSheet, FlatList, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { getProduct, getProducts } from '../services/firestore.service';
import COLORS from '@shared/constants/colors';
import { formatPrice } from '@shared/utils/formatters';

const { width } = Dimensions.get('window');

const FEATURE_ICONS = [
  { icon: 'shield-checkmark', label: 'PROTECCIÓN 6M' },
  { icon: 'water', label: 'HIDROFÓBICO' },
  { icon: 'sparkles', label: 'EFECTO ESPEJO' },
];

export default function ProductDetailScreen() {
  const { isDark } = useTheme();
  const { addItem } = useCart();
  const navigation = useNavigation();
  const route = useRoute();
  const s = styles(isDark);

  const { productId } = route.params || {};
  const [quantity, setQuantity] = useState(1);

  const { data: productData } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => getProduct(productId),
    enabled: !!productId,
    select: (res) => res.data,
  });

  const { data: related } = useQuery({
    queryKey: ['products', 'related', productData?.category],
    queryFn: () => getProducts(true),
    enabled: !!productData?.category,
    select: (res) =>
      (res.data || [])
        .filter(p => p.category === productData?.category && p.id !== productId)
        .slice(0, 5),
  });

  if (!productData) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <View style={s.loading}>
          <Text style={{ color: COLORS.textMuted }}>Cargando producto...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) addItem(productData);
    Toast.show({ type: 'success', text1: 'Añadido al carrito', text2: productData.name });
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Top Nav */}
      <View style={s.topNav}>
        <TouchableOpacity style={s.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={isDark ? COLORS.textLight : COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={s.navTitle}>Detalle de Producto</Text>
        <TouchableOpacity style={s.iconBtn}>
          <Ionicons name="share-outline" size={24} color={isDark ? COLORS.textLight : COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Image Hero */}
        <View style={s.imageHero}>
          {productData.image ? (
            <Image source={{ uri: productData.image }} style={s.heroImage} />
          ) : (
            <View style={[s.heroImage, { backgroundColor: isDark ? '#1e293b' : '#e2e8f0' }]} />
          )}
          <View style={s.imageDots}>
            {[0, 1, 2].map(i => (
              <View key={i} style={[s.dot, i === 0 && s.dotActive]} />
            ))}
          </View>
        </View>

        {/* Info */}
        <View style={s.infoSection}>
          <Text style={s.productCategory}>
            {productData.category?.toUpperCase() || 'PRODUCTO'}
          </Text>
          <View style={s.infoRow}>
            <Text style={s.productName}>{productData.name}</Text>
            {productData.rating && (
              <View style={s.ratingBadge}>
                <Ionicons name="star" size={12} color={COLORS.primary} />
                <Text style={s.ratingText}>{productData.rating}</Text>
              </View>
            )}
          </View>
          <Text style={s.description}>{productData.description}</Text>

          {/* Price + Qty */}
          <View style={s.priceRow}>
            <View>
              <Text style={s.priceLabel}>Precio</Text>
              <Text style={s.price}>{formatPrice(productData.price)}</Text>
            </View>
            <View style={s.qtyControl}>
              <TouchableOpacity
                style={s.qtyBtn}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Ionicons name="remove" size={16} color={isDark ? COLORS.textLight : COLORS.textSecondary} />
              </TouchableOpacity>
              <Text style={s.qtyText}>{quantity}</Text>
              <TouchableOpacity style={s.qtyBtn} onPress={() => setQuantity(quantity + 1)}>
                <Ionicons name="add" size={16} color={isDark ? COLORS.textLight : COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Features */}
        <View style={s.features}>
          {FEATURE_ICONS.map(feat => (
            <View key={feat.label} style={s.featureItem}>
              <View style={s.featureIcon}>
                <Ionicons name={feat.icon} size={22} color={COLORS.primary} />
              </View>
              <Text style={s.featureLabel}>{feat.label}</Text>
            </View>
          ))}
        </View>

        {/* Add to Cart */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
          <TouchableOpacity style={s.addBtn} onPress={handleAddToCart}>
            <Ionicons name="bag-outline" size={20} color="#fff" />
            <Text style={s.addBtnText}>Añadir al carrito</Text>
          </TouchableOpacity>
        </View>

        {/* Related Products */}
        {related && related.length > 0 && (
          <View style={s.relatedSection}>
            <Text style={s.relatedTitle}>Productos Relacionados</Text>
            <FlatList
              data={related}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={s.relatedCard}
                  onPress={() => navigation.push('ProductDetail', { productId: item.id })}
                >
                  <View style={s.relatedImage}>
                    {item.thumbnail || item.image ? (
                      <Image source={{ uri: item.thumbnail || item.image }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
                    ) : (
                      <View style={{ flex: 1, backgroundColor: isDark ? '#1e293b' : '#e2e8f0' }} />
                    )}
                  </View>
                  <View style={{ padding: 10 }}>
                    <Text style={s.relatedName} numberOfLines={1}>{item.name}</Text>
                    <Text style={s.relatedPrice}>{formatPrice(item.price)}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = (isDark) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: isDark ? COLORS.backgroundDark : COLORS.surface },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: isDark ? COLORS.backgroundDark : COLORS.surface,
    borderBottomWidth: 1, borderBottomColor: isDark ? COLORS.borderDark : COLORS.border,
  },
  navTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: 'bold', color: isDark ? COLORS.textLight : COLORS.textPrimary },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  imageHero: { margin: 16, borderRadius: 16, overflow: 'hidden', height: (width - 32) * 0.85, position: 'relative' },
  heroImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  imageDots: { position: 'absolute', bottom: 16, width: '100%', flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive: { backgroundColor: '#fff' },
  infoSection: { paddingHorizontal: 16, paddingTop: 4, gap: 8 },
  productCategory: { fontSize: 11, fontWeight: 'bold', color: COLORS.primary, letterSpacing: 1 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  productName: { flex: 1, fontSize: 26, fontWeight: '900', color: isDark ? COLORS.textLight : COLORS.textPrimary, lineHeight: 32 },
  ratingBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: `${COLORS.primary}1A`, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6,
  },
  ratingText: { fontSize: 12, fontWeight: 'bold', color: COLORS.primary },
  description: { fontSize: 13, color: isDark ? COLORS.textMuted : COLORS.textSecondary, lineHeight: 20 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  priceLabel: { fontSize: 10, fontWeight: '600', color: COLORS.textMuted, textTransform: 'uppercase' },
  price: { fontSize: 30, fontWeight: 'bold', color: isDark ? COLORS.textLight : COLORS.textPrimary },
  qtyControl: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: isDark ? COLORS.borderDark : COLORS.border,
    borderRadius: 10, overflow: 'hidden',
  },
  qtyBtn: { paddingHorizontal: 12, paddingVertical: 10, backgroundColor: isDark ? '#1e293b' : '#f8fafc' },
  qtyText: { paddingHorizontal: 12, fontWeight: 'bold', fontSize: 15, color: isDark ? COLORS.textLight : COLORS.textPrimary },
  features: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 20, paddingHorizontal: 16, borderTopWidth: 1, borderTopColor: isDark ? COLORS.borderDark : COLORS.border, marginTop: 12 },
  featureItem: { alignItems: 'center', gap: 6 },
  featureIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: `${COLORS.primary}1A`, alignItems: 'center', justifyContent: 'center',
  },
  featureLabel: { fontSize: 9, fontWeight: '600', color: COLORS.textMuted, textTransform: 'uppercase' },
  addBtn: {
    backgroundColor: COLORS.primary, padding: 16, borderRadius: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: COLORS.primary, shadowOpacity: 0.35, shadowRadius: 8, elevation: 4,
  },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  relatedSection: { marginTop: 16, backgroundColor: isDark ? '#0d1525' : '#f8fafc', paddingVertical: 20 },
  relatedTitle: { fontSize: 16, fontWeight: 'bold', color: isDark ? COLORS.textLight : COLORS.textPrimary, paddingHorizontal: 16, marginBottom: 12 },
  relatedCard: {
    width: 160, backgroundColor: isDark ? COLORS.surfaceDark : COLORS.surface,
    borderRadius: 12, overflow: 'hidden',
    borderWidth: 1, borderColor: isDark ? COLORS.borderDark : COLORS.border,
  },
  relatedImage: { height: 110, backgroundColor: isDark ? '#1e293b' : '#e2e8f0' },
  relatedName: { fontSize: 12, fontWeight: 'bold', color: isDark ? COLORS.textLight : COLORS.textPrimary },
  relatedPrice: { fontSize: 12, fontWeight: 'bold', color: COLORS.primary, marginTop: 2 },
});
