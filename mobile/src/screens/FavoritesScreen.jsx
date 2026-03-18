import React, { useMemo } from 'react';
import { SafeAreaView, View, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import COLORS from '@shared/constants/colors';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import AppHeader from '../components/common/AppHeader';
import AnimatedEntrance from '../components/common/AnimatedEntrance';
import ProductCard from '../components/common/ProductCard';
import ScreenState from '../components/common/ScreenState';

export default function FavoritesScreen() {
  const navigation = useNavigation();
  const { isDark } = useTheme();
  const { addItem } = useCart();
  const { favorites, toggleFavorite } = useFavorites();
  const styles = useMemo(() => createStyles(isDark), [isDark]);

  const handleToggleFavorite = async (product) => {
    const result = await toggleFavorite(product);
    Toast.show({
      type: result.added ? 'success' : 'info',
      text1: result.added ? 'Agregado a favoritos' : 'Eliminado de favoritos',
      text2: product.name,
    });
  };

  const handleAddToCart = (product) => {
    addItem(product);
    Toast.show({
      type: 'success',
      text1: 'Producto agregado',
      text2: product.name,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader
        isDark={isDark}
        title="Favoritos"
        subtitle="Tu seleccion personal"
        leftIcon="home-outline"
        onLeftPress={() => navigation.navigate('Inicio')}
        rightContent={(
          <TouchableOpacity
            style={styles.headerAction}
            onPress={() => navigation.navigate('Tienda')}
            activeOpacity={0.9}
          >
            <Ionicons name="search-outline" size={20} color={isDark ? COLORS.textLight : COLORS.textPrimary} />
          </TouchableOpacity>
        )}
      />

      {favorites.length === 0 ? (
        <View style={styles.emptyWrap}>
          <AnimatedEntrance delay={80}>
            <ScreenState
              isDark={isDark}
              icon="heart-outline"
              title="Aun no guardas favoritos"
              description="Marca productos con el corazon para tenerlos siempre a mano y revisarlos mas tarde."
              actionLabel="Explorar catalogo"
              onAction={() => navigation.navigate('Tienda')}
            />
          </AnimatedEntrance>
        </View>
      ) : (
        <FlatList
          data={favorites}
          numColumns={2}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <AnimatedEntrance delay={60 + index * 40} style={styles.cardWrap}>
              <ProductCard
                isDark={isDark}
                product={item}
                variant="grid"
                isFavorite
                onPress={() => navigation.navigate('Tienda', {
                  screen: 'ProductDetail',
                  params: { productId: item.id },
                })}
                onAddToCart={handleAddToCart}
                onToggleFavorite={handleToggleFavorite}
              />
            </AnimatedEntrance>
          )}
          ListHeaderComponent={(
            <AnimatedEntrance delay={40} style={styles.headerCard}>
              <View style={styles.summaryCard}>
                <View style={styles.summaryIcon}>
                  <Ionicons name="sparkles-outline" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.summaryCopy}>
                  <Text style={styles.summaryEyebrow}>Guardados</Text>
                  <Text style={styles.summaryTitle}>Tu coleccion vive en mobile</Text>
                  <Text style={styles.summaryText}>
                    Guarda tus productos preferidos, revisalos mas tarde y pasalos al carrito con un solo toque.
                  </Text>
                </View>
              </View>
            </AnimatedEntrance>
          )}
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
    emptyWrap: {
      flex: 1,
      justifyContent: 'center',
      paddingBottom: 24,
    },
    grid: {
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 36,
      gap: 14,
    },
    row: {
      gap: 14,
    },
    cardWrap: {
      flex: 1,
    },
    headerCard: {
      marginBottom: 4,
    },
    summaryCard: {
      flexDirection: 'row',
      gap: 14,
      padding: 20,
      borderRadius: 28,
      borderWidth: 1,
      borderColor: isDark ? COLORS.borderDark : COLORS.border,
      backgroundColor: isDark ? 'rgba(26, 34, 53, 0.92)' : 'rgba(255,255,255,0.96)',
    },
    summaryIcon: {
      width: 48,
      height: 48,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? 'rgba(37, 99, 235, 0.18)' : 'rgba(37, 99, 235, 0.1)',
    },
    summaryCopy: {
      flex: 1,
      gap: 5,
    },
    summaryEyebrow: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      color: COLORS.primary,
    },
    summaryTitle: {
      fontSize: 20,
      lineHeight: 26,
      fontWeight: '900',
      color: isDark ? COLORS.textLight : COLORS.textPrimary,
    },
    summaryText: {
      fontSize: 13,
      lineHeight: 21,
      color: isDark ? COLORS.textMuted : COLORS.textSecondary,
    },
  });
