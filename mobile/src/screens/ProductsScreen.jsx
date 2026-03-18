import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { getProducts, getSiteSettings } from '../services/firestore.service';
import { normalizeSiteSettings } from '../services/content.service';
import ScreenState from '../components/common/ScreenState';
import AnimatedEntrance from '../components/common/AnimatedEntrance';
import AppHeader from '../components/common/AppHeader';
import ProductCard from '../components/common/ProductCard';
import COLORS from '@shared/constants/colors';

export default function ProductsScreen() {
  const navigation = useNavigation();
  const { isDark } = useTheme();
  const { addItem, itemCount } = useCart();
  const { isFavorite, toggleFavorite, loaded: favoritesLoaded } = useFavorites();
  const styles = useMemo(() => createStyles(isDark), [isDark]);

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const { data: productsResult, refetch } = useQuery({
    queryKey: ['products', 'mobile-catalog'],
    queryFn: () => getProducts(true),
  });

  const { data: settingsDoc } = useQuery({
    queryKey: ['site_settings', 'mobile-catalog'],
    queryFn: () => getSiteSettings(),
  });

  const products = productsResult?.success ? productsResult.data || [] : [];
  const settings = normalizeSiteSettings(settingsDoc?.data);
  const categories = ['all', ...new Set(products.map((product) => product.category).filter(Boolean))];

  const filteredProducts = useMemo(() => (
    products.filter((product) => {
      const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
      const term = search.trim().toLowerCase();
      const matchesSearch = !term
        || product.name?.toLowerCase().includes(term)
        || product.description?.toLowerCase().includes(term)
        || product.sku?.toLowerCase().includes(term);

      return matchesCategory && matchesSearch;
    })
  ), [activeCategory, products, search]);

  const handleAddToCart = (product) => {
    addItem(product);
    Toast.show({
      type: 'success',
      text1: 'Producto agregado',
      text2: product.name,
    });
  };

  const handleToggleFavorite = async (product) => {
    const result = await toggleFavorite(product);
    Toast.show({
      type: result.added ? 'success' : 'info',
      text1: result.added ? 'Guardado en favoritos' : 'Eliminado de favoritos',
      text2: product.name,
    });
  };

  const renderProduct = ({ item, index }) => (
    <AnimatedEntrance delay={50 + (index % 6) * 35} style={styles.cardWrap}>
      <ProductCard
        isDark={isDark}
        product={item}
        variant="grid"
        isFavorite={favoritesLoaded && isFavorite(item.id)}
        onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
        onAddToCart={handleAddToCart}
        onToggleFavorite={handleToggleFavorite}
      />
    </AnimatedEntrance>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader
        isDark={isDark}
        title="Catalogo"
        subtitle={`${filteredProducts.length || products.length || 0} productos`}
        leftIcon="chatbubble-ellipses-outline"
        onLeftPress={() => navigation.navigate('Contact')}
        rightContent={(
          <TouchableOpacity
            style={styles.headerAction}
            onPress={() => navigation.navigate('Carrito')}
            activeOpacity={0.9}
          >
            <Ionicons name="bag-handle-outline" size={20} color={COLORS.primary} />
            {itemCount > 0 && (
              <View style={styles.headerBadge}>
                <Text style={styles.headerBadgeText}>{itemCount > 9 ? '9+' : itemCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      />

      <AnimatedEntrance delay={30} style={styles.controls}>
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar productos, SKU o descripcion"
            placeholderTextColor={COLORS.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {!!search && (
            <TouchableOpacity onPress={() => setSearch('')} activeOpacity={0.85}>
              <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categories}
        >
          {categories.map((category) => {
            const isActive = activeCategory === category;
            return (
              <TouchableOpacity
                key={category}
                style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                onPress={() => setActiveCategory(category)}
                activeOpacity={0.9}
              >
                <Text style={[styles.categoryChipText, isActive && styles.categoryChipTextActive]}>
                  {category === 'all' ? 'Todos' : category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </AnimatedEntrance>

      {!settings.catalogEnabled ? (
        <ScreenState
          isDark={isDark}
          icon="eye-off-outline"
          title="Catalogo deshabilitado"
          description="El administrador ha ocultado temporalmente los productos."
        />
      ) : !productsResult ? (
        <ScreenState
          isDark={isDark}
          icon="time-outline"
          title="Cargando catalogo"
          description="Estamos consultando los productos disponibles."
        />
      ) : !productsResult.success ? (
        <ScreenState
          isDark={isDark}
          icon="cloud-offline-outline"
          title="No pudimos cargar el catalogo"
          description={productsResult.error || 'Intenta de nuevo en unos segundos.'}
          actionLabel="Reintentar"
          onAction={refetch}
        />
      ) : filteredProducts.length === 0 ? (
        <ScreenState
          isDark={isDark}
          icon="search-outline"
          title="No encontramos resultados"
          description="Prueba con otra busqueda o limpia los filtros actuales."
          actionLabel="Limpiar filtros"
          onAction={() => {
            setSearch('');
            setActiveCategory('all');
          }}
        />
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
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
    headerBadge: {
      position: 'absolute',
      top: 6,
      right: 4,
      minWidth: 16,
      height: 16,
      borderRadius: 8,
      paddingHorizontal: 3,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: COLORS.error,
    },
    headerBadgeText: {
      color: '#fff',
      fontSize: 8,
      fontWeight: '800',
    },
    controls: {
      gap: 12,
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 4,
    },
    searchWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      minHeight: 56,
      paddingHorizontal: 16,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: isDark ? COLORS.borderDark : COLORS.border,
      backgroundColor: isDark ? 'rgba(26, 34, 53, 0.92)' : 'rgba(255,255,255,0.97)',
    },
    searchInput: {
      flex: 1,
      paddingVertical: 12,
      color: isDark ? COLORS.textLight : COLORS.textPrimary,
    },
    categories: {
      paddingRight: 8,
      gap: 10,
    },
    categoryChip: {
      paddingHorizontal: 16,
      paddingVertical: 11,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: isDark ? COLORS.borderDark : COLORS.border,
      backgroundColor: isDark ? 'rgba(26, 34, 53, 0.92)' : 'rgba(255,255,255,0.97)',
    },
    categoryChipActive: {
      borderColor: COLORS.primary,
      backgroundColor: COLORS.primary,
    },
    categoryChipText: {
      color: isDark ? COLORS.textMuted : COLORS.textSecondary,
      fontWeight: '700',
      textTransform: 'capitalize',
    },
    categoryChipTextActive: {
      color: '#fff',
    },
    grid: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 36,
      gap: 14,
    },
    row: {
      gap: 14,
    },
    cardWrap: {
      flex: 1,
    },
  });
