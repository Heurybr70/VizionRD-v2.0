import React, { useMemo } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '@shared/constants/colors';
import { formatPrice } from '@shared/utils/formatters';

export default function ProductCard({
  isDark = false,
  product,
  variant = 'grid',
  isFavorite = false,
  onPress,
  onAddToCart,
  onToggleFavorite,
}) {
  const styles = useMemo(() => createStyles(isDark, variant), [isDark, variant]);

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.imageWrap}>
        {product.thumbnail || product.image ? (
          <Image source={{ uri: product.thumbnail || product.image }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]} />
        )}

        {!!onToggleFavorite && (
          <Pressable
            style={styles.favoriteButton}
            onPress={(event) => {
              event.stopPropagation?.();
              onToggleFavorite(product);
            }}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={18}
              color={isFavorite ? COLORS.error : isDark ? COLORS.textLight : COLORS.textPrimary}
            />
          </Pressable>
        )}
      </View>

      <View style={styles.body}>
        <Text style={styles.category} numberOfLines={1}>
          {product.category || 'general'}
        </Text>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.description} numberOfLines={variant === 'compact' ? 2 : 3}>
          {product.description || 'Producto premium para detailing automotriz.'}
        </Text>

        <View style={styles.footer}>
          <Text style={styles.price}>{formatPrice(product.price)}</Text>
          {!!onAddToCart && (
            <Pressable
              style={styles.addButton}
              onPress={(event) => {
                event.stopPropagation?.();
                onAddToCart(product);
              }}
            >
              <Ionicons name="bag-add-outline" size={16} color="#fff" />
            </Pressable>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const createStyles = (isDark, variant) =>
  StyleSheet.create({
    card: {
      flex: variant === 'grid' ? 1 : undefined,
      width: variant === 'compact' ? 192 : undefined,
      borderRadius: 24,
      overflow: 'hidden',
      backgroundColor: isDark ? 'rgba(26, 34, 53, 0.96)' : COLORS.surface,
      borderWidth: 1,
      borderColor: isDark ? COLORS.borderDark : COLORS.border,
    },
    imageWrap: {
      aspectRatio: variant === 'compact' ? 1.1 : 1,
      backgroundColor: isDark ? '#0f172a' : '#eef2ff',
      position: 'relative',
    },
    image: {
      width: '100%',
      height: '100%',
      resizeMode: variant === 'compact' ? 'contain' : 'cover',
    },
    imagePlaceholder: {
      backgroundColor: isDark ? '#162032' : '#e2e8f0',
    },
    favoriteButton: {
      position: 'absolute',
      top: 12,
      right: 12,
      width: 38,
      height: 38,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? 'rgba(16, 22, 34, 0.84)' : 'rgba(255,255,255,0.92)',
    },
    body: {
      padding: 14,
      gap: 8,
    },
    category: {
      fontSize: 10,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.9,
      color: COLORS.primary,
    },
    name: {
      fontSize: variant === 'compact' ? 14 : 15,
      lineHeight: variant === 'compact' ? 20 : 22,
      fontWeight: '800',
      color: isDark ? COLORS.textLight : COLORS.textPrimary,
    },
    description: {
      fontSize: 12,
      lineHeight: 19,
      color: isDark ? COLORS.textMuted : COLORS.textSecondary,
      minHeight: variant === 'compact' ? 38 : 56,
    },
    footer: {
      marginTop: 4,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
    },
    price: {
      flex: 1,
      fontSize: 16,
      fontWeight: '900',
      color: COLORS.primary,
    },
    addButton: {
      width: 38,
      height: 38,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: COLORS.primary,
    },
  });
