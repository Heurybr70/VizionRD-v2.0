/**
 * ProductsScreen — basado en 2.html
 * Catálogo en grid, filtro por categoría, buscador
 */
import React, { useState, useMemo } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  Image, StyleSheet, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';

import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { getProducts } from '../services/firestore.service';
import COLORS from '@shared/constants/colors';
import { PRODUCT_CATEGORIES } from '@shared/constants/categories';
import { formatPrice } from '@shared/utils/formatters';

const ALL_CATEGORIES = [{ value: 'all', label: 'Todos' }, ...PRODUCT_CATEGORIES];

export default function ProductsScreen() {
  const { isDark } = useTheme();
  const { addItem, itemCount } = useCart();
  const navigation = useNavigation();
  const s = styles(isDark);

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => getProducts(true),
    select: (res) => res.data || [],
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter(p => {
      const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
      const matchesSearch =
        !search ||
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.sku?.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [data, activeCategory, search]);

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={s.card}
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
      activeOpacity={0.8}
    >
      <View style={s.imageWrap}>
        {item.thumbnail || item.image ? (
          <Image source={{ uri: item.thumbnail || item.image }} style={s.productImage} />
        ) : (
          <View style={[s.productImage, { backgroundColor: isDark ? '#1e293b' : '#e2e8f0' }]} />
        )}
      </View>
      <View style={s.cardBody}>
        <Text style={s.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={s.productPrice}>{formatPrice(item.price)}</Text>
        <TouchableOpacity
          style={s.addBtn}
          onPress={(e) => {
            e.stopPropagation();
            addItem(item);
          }}
        >
          <Text style={s.addBtnText}>Añadir</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <TouchableOpacity style={s.iconBtn}>
            <Ionicons name="menu" size={24} color={isDark ? COLORS.textLight : COLORS.textSecondary} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Vizion RD</Text>
        </View>
        <TouchableOpacity
          style={s.iconBtn}
          onPress={() => navigation.navigate('Carrito')}
        >
          <View>
            <Ionicons name="cart-outline" size={24} color={isDark ? COLORS.textLight : COLORS.textSecondary} />
            {itemCount > 0 && (
              <View style={s.badge}>
                <Text style={s.badgeText}>{itemCount}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Searchbar */}
      <View style={s.searchWrap}>
        <Ionicons name="search" size={18} color={COLORS.textMuted} style={{ marginLeft: 12 }} />
        <TextInput
          style={s.searchInput}
          placeholder="Buscar productos premium..."
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Category tabs */}
      <View style={{ maxHeight: 52 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.categoryRow}
        >
          {ALL_CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.value}
              onPress={() => setActiveCategory(cat.value)}
              style={[s.categoryTab, activeCategory === cat.value && s.categoryTabActive]}
            >
              <Text style={[s.categoryLabel, activeCategory === cat.value && s.categoryLabelActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Grid */}
      {isLoading ? (
        <View style={s.loading}>
          <Text style={{ color: COLORS.textMuted }}>Cargando...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderProduct}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={s.grid}
          columnWrapperStyle={{ gap: 12 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={s.loading}>
              <Text style={{ color: COLORS.textMuted }}>No hay productos disponibles.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = (isDark) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: isDark ? COLORS.backgroundDark : COLORS.backgroundLight },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: isDark ? `${COLORS.backgroundDark}CC` : `${COLORS.surface}CC`,
    borderBottomWidth: 1, borderBottomColor: isDark ? COLORS.borderDark : COLORS.border,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute', top: -3, right: -5,
    backgroundColor: COLORS.primary, borderRadius: 8,
    minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 2,
  },
  badgeText: { color: '#fff', fontSize: 8, fontWeight: 'bold' },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    margin: 12, backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
    borderRadius: 12, overflow: 'hidden',
  },
  searchInput: {
    flex: 1, paddingVertical: 10, paddingHorizontal: 10,
    color: isDark ? COLORS.textLight : COLORS.textPrimary, fontSize: 13,
  },
  categoryRow: { paddingHorizontal: 12, gap: 6, paddingBottom: 8 },
  categoryTab: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1,
    borderColor: isDark ? COLORS.borderDark : COLORS.border,
    backgroundColor: isDark ? COLORS.surfaceDark : COLORS.surface,
  },
  categoryTabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  categoryLabel: { fontSize: 12, fontWeight: '600', color: isDark ? COLORS.textMuted : COLORS.textSecondary },
  categoryLabelActive: { color: '#fff' },
  grid: { padding: 12, paddingBottom: 24 },
  card: {
    flex: 1, backgroundColor: isDark ? COLORS.surfaceDark : COLORS.surface,
    borderRadius: 12, overflow: 'hidden',
    borderWidth: 1, borderColor: isDark ? COLORS.borderDark : COLORS.border,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  imageWrap: { aspectRatio: 1, backgroundColor: isDark ? '#1e293b' : '#e2e8f0' },
  productImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  cardBody: { padding: 10, gap: 4 },
  productName: { fontSize: 12, fontWeight: 'bold', color: isDark ? COLORS.textLight : COLORS.textPrimary },
  productPrice: { fontSize: 15, fontWeight: 'bold', color: COLORS.primary },
  addBtn: {
    marginTop: 6, backgroundColor: `${COLORS.primary}1A`,
    padding: 8, borderRadius: 8, alignItems: 'center',
  },
  addBtnText: { fontSize: 11, fontWeight: 'bold', color: COLORS.primary },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 48 },
});
