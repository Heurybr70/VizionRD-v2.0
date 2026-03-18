import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  FlatList,
  Dimensions,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { getProduct, getProducts, getSiteContent } from '../services/firestore.service';
import { buildProductWhatsAppMessage, normalizeContactInfo } from '../services/content.service';
import { openWhatsApp } from '../services/whatsapp.service';
import ScreenState from '../components/common/ScreenState';
import AnimatedEntrance from '../components/common/AnimatedEntrance';
import AppHeader from '../components/common/AppHeader';
import ProductCard from '../components/common/ProductCard';
import COLORS from '@shared/constants/colors';
import { formatPrice } from '@shared/utils/formatters';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { isDark } = useTheme();
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite, loaded: favoritesLoaded } = useFavorites();
  const styles = useMemo(() => createStyles(isDark), [isDark]);
  const [quantity, setQuantity] = useState(1);

  const { productId } = route.params || {};

  const { data: productResult, refetch } = useQuery({
    queryKey: ['product', productId, 'mobile-detail'],
    queryFn: () => getProduct(productId),
    enabled: !!productId,
  });

  const product = productResult?.success ? productResult.data : null;

  const { data: relatedResult } = useQuery({
    queryKey: ['related-products', product?.category, productId],
    queryFn: () => getProducts(true),
    enabled: !!product?.category,
  });

  const { data: contactDoc } = useQuery({
    queryKey: ['site_content', 'contact_info', 'mobile-product-detail'],
    queryFn: () => getSiteContent('contact_info'),
  });

  const relatedProducts = useMemo(() => {
    if (!relatedResult?.success) return [];
    return (relatedResult.data || [])
      .filter((item) => item.category === product?.category && item.id !== productId)
      .slice(0, 5);
  }, [product?.category, productId, relatedResult]);

  const contactInfo = normalizeContactInfo(contactDoc?.data);

  const images = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.gallery) && product.gallery.length > 0) return product.gallery;
    if (product.image) return [product.image];
    if (product.thumbnail) return [product.thumbnail];
    return [];
  }, [product]);

  const handleShare = async () => {
    if (!product) return;

    try {
      await Share.share({
        message: `Mira este producto de VizionRD: ${product.name}${product.description ? ` - ${product.description}` : ''}`,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'No se pudo compartir',
        text2: error.message,
      });
    }
  };

  const handleToggleFavorite = async () => {
    if (!product) return;

    const result = await toggleFavorite(product);
    Toast.show({
      type: result.added ? 'success' : 'info',
      text1: result.added ? 'Guardado en favoritos' : 'Eliminado de favoritos',
      text2: product.name,
    });
  };

  const handleAddToCart = () => {
    if (!product) return;

    for (let index = 0; index < quantity; index += 1) {
      addItem(product);
    }

    Toast.show({
      type: 'success',
      text1: 'Producto agregado',
      text2: `${quantity} unidad(es) de ${product.name}`,
    });
  };

  const handleAddRelatedToCart = (relatedProduct) => {
    addItem(relatedProduct);
    Toast.show({
      type: 'success',
      text1: 'Producto agregado',
      text2: relatedProduct.name,
    });
  };

  const handleRelatedToggleFavorite = async (relatedProduct) => {
    const result = await toggleFavorite(relatedProduct);
    Toast.show({
      type: result.added ? 'success' : 'info',
      text1: result.added ? 'Guardado en favoritos' : 'Eliminado de favoritos',
      text2: relatedProduct.name,
    });
  };

  const handleWhatsApp = async () => {
    if (!product) return;
    await openWhatsApp(contactInfo.whatsapp, buildProductWhatsAppMessage(product));
  };

  if (!productResult) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenState
          isDark={isDark}
          icon="time-outline"
          title="Cargando producto"
          description="Estamos consultando la informacion del producto."
        />
      </SafeAreaView>
    );
  }

  if (!productResult.success || !product) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenState
          isDark={isDark}
          icon="alert-circle-outline"
          title="Producto no disponible"
          description={productResult.error || 'No encontramos este producto o ya no esta disponible.'}
          actionLabel="Reintentar"
          onAction={refetch}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader
        isDark={isDark}
        title="Detalle"
        subtitle={product.category || 'Producto'}
        onLeftPress={() => navigation.goBack()}
        rightContent={(
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerAction} onPress={handleToggleFavorite} activeOpacity={0.9}>
              <Ionicons
                name={favoritesLoaded && isFavorite(product.id) ? 'heart' : 'heart-outline'}
                size={20}
                color={favoritesLoaded && isFavorite(product.id) ? COLORS.error : isDark ? COLORS.textLight : COLORS.textPrimary}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerAction} onPress={handleShare} activeOpacity={0.9}>
              <Ionicons name="share-outline" size={20} color={isDark ? COLORS.textLight : COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
        )}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <AnimatedEntrance delay={35}>
          <View style={styles.imageWrap}>
            {images.length > 0 ? (
              <Image source={{ uri: images[0] }} style={styles.heroImage} />
            ) : (
              <View style={[styles.heroImage, styles.imagePlaceholder]} />
            )}

            <View style={styles.imageOverlayCard}>
              <Text style={styles.overlayLabel}>Precio</Text>
              <Text style={styles.overlayValue}>{formatPrice(product.price)}</Text>
            </View>
          </View>
        </AnimatedEntrance>

        <AnimatedEntrance delay={80} style={styles.body}>
          <View style={styles.identityCard}>
            <Text style={styles.category}>{product.category || 'Producto'}</Text>
            <Text style={styles.name}>{product.name}</Text>
            {!!product.sku && <Text style={styles.meta}>SKU: {product.sku}</Text>}
            <Text style={styles.description}>
              {product.description || 'Producto premium para detailing automotriz.'}
            </Text>

            <View style={styles.chipRow}>
              <View style={styles.metaChip}>
                <Ionicons name="shield-checkmark-outline" size={16} color={COLORS.primary} />
                <Text style={styles.metaChipText}>Calidad premium</Text>
              </View>
              <View style={styles.metaChip}>
                <Ionicons name="flash-outline" size={16} color={COLORS.primary} />
                <Text style={styles.metaChipText}>Listo para ordenar</Text>
              </View>
            </View>
          </View>

          <View style={styles.purchaseCard}>
            <View style={styles.purchaseHeader}>
              <View>
                <Text style={styles.purchaseLabel}>Cantidad</Text>
                <Text style={styles.purchaseCaption}>Ajusta el pedido antes de enviarlo</Text>
              </View>

              <View style={styles.quantityWrap}>
                <TouchableOpacity
                  style={styles.qtyButton}
                  onPress={() => setQuantity((current) => Math.max(1, current - 1))}
                >
                  <Ionicons name="remove" size={18} color={isDark ? COLORS.textLight : COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.qtyValue}>{quantity}</Text>
                <TouchableOpacity
                  style={styles.qtyButton}
                  onPress={() => setQuantity((current) => current + 1)}
                >
                  <Ionicons name="add" size={18} color={isDark ? COLORS.textLight : COLORS.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={handleAddToCart} activeOpacity={0.92}>
              <Ionicons name="bag-add-outline" size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>Anadir al carrito</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.whatsAppButton} onPress={handleWhatsApp} activeOpacity={0.92}>
              <Ionicons name="logo-whatsapp" size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>Consultar por WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('Contact', {
                title: 'Consulta de producto',
                formTitle: 'Solicita informacion',
                helperText: 'Tu consulta quedara registrada en el backend para seguimiento.',
                submitLabel: 'Enviar consulta',
                subject: `Consulta sobre ${product.name}`,
                message: `Me interesa recibir mas informacion sobre ${product.name}.`,
                productId: product.id,
                requestType: 'product',
                referenceName: product.name,
                source: 'mobile_product_detail',
              })}
              activeOpacity={0.92}
            >
              <Text style={styles.secondaryButtonText}>Solicitar informacion</Text>
            </TouchableOpacity>
          </View>

          {Array.isArray(product.dynamicFields) && product.dynamicFields.length > 0 && (
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Ficha tecnica</Text>
              {product.dynamicFields.map((field, index) => (
                <View key={`${field.label}-${index}`} style={styles.specRow}>
                  <Text style={styles.specLabel}>{field.label}</Text>
                  <Text style={styles.specValue}>{field.value}</Text>
                </View>
              ))}
            </View>
          )}

          {Array.isArray(product.features) && product.features.length > 0 && (
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Caracteristicas</Text>
              {product.features.map((feature, index) => (
                <View key={`${feature}-${index}`} style={styles.featureRow}>
                  <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          )}
        </AnimatedEntrance>

        {relatedProducts.length > 0 && (
          <AnimatedEntrance delay={130} style={styles.relatedSection}>
            <View style={styles.relatedHeader}>
              <Text style={styles.relatedTitle}>Relacionados</Text>
              <Text style={styles.relatedSubtitle}>Misma categoria, misma linea de cuidado</Text>
            </View>

            <FlatList
              data={relatedProducts}
              horizontal
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.relatedList}
              renderItem={({ item, index }) => (
                <AnimatedEntrance delay={40 + index * 30} style={styles.relatedCardWrap}>
                  <ProductCard
                    isDark={isDark}
                    product={item}
                    variant="compact"
                    isFavorite={favoritesLoaded && isFavorite(item.id)}
                    onPress={() => navigation.push('ProductDetail', { productId: item.id })}
                    onAddToCart={handleAddRelatedToCart}
                    onToggleFavorite={handleRelatedToggleFavorite}
                  />
                </AnimatedEntrance>
              )}
            />
          </AnimatedEntrance>
        )}
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
      paddingBottom: 34,
      gap: 14,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    headerAction: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : COLORS.backgroundLight,
    },
    imageWrap: {
      marginHorizontal: 16,
      height: (width - 32) * 0.92,
      borderRadius: 30,
      overflow: 'hidden',
      backgroundColor: isDark ? 'rgba(26, 34, 53, 0.92)' : COLORS.surface,
      position: 'relative',
    },
    heroImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    imagePlaceholder: {
      backgroundColor: isDark ? '#1e293b' : '#e2e8f0',
    },
    imageOverlayCard: {
      position: 'absolute',
      left: 16,
      bottom: 16,
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 3,
      borderRadius: 18,
      backgroundColor: 'rgba(15, 23, 42, 0.76)',
    },
    overlayLabel: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      color: '#cbd5e1',
    },
    overlayValue: {
      fontSize: 22,
      fontWeight: '900',
      color: '#fff',
    },
    body: {
      paddingHorizontal: 16,
      gap: 14,
    },
    identityCard: {
      padding: 22,
      gap: 10,
      borderRadius: 28,
      borderWidth: 1,
      borderColor: isDark ? COLORS.borderDark : COLORS.border,
      backgroundColor: isDark ? 'rgba(26, 34, 53, 0.94)' : 'rgba(255,255,255,0.98)',
    },
    category: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.8,
      color: COLORS.primary,
      textTransform: 'uppercase',
    },
    name: {
      fontSize: 30,
      lineHeight: 36,
      fontWeight: '900',
      color: isDark ? COLORS.textLight : COLORS.textPrimary,
    },
    meta: {
      fontSize: 12,
      color: isDark ? COLORS.textMuted : COLORS.textSecondary,
    },
    description: {
      fontSize: 14,
      lineHeight: 23,
      color: isDark ? COLORS.textMuted : COLORS.textSecondary,
    },
    chipRow: {
      flexDirection: 'row',
      gap: 10,
      flexWrap: 'wrap',
      marginTop: 4,
    },
    metaChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 999,
      backgroundColor: isDark ? '#111827' : COLORS.backgroundLight,
    },
    metaChipText: {
      fontSize: 12,
      fontWeight: '700',
      color: isDark ? COLORS.textLight : COLORS.textPrimary,
    },
    purchaseCard: {
      padding: 22,
      gap: 12,
      borderRadius: 28,
      borderWidth: 1,
      borderColor: isDark ? COLORS.borderDark : COLORS.border,
      backgroundColor: isDark ? 'rgba(26, 34, 53, 0.94)' : 'rgba(255,255,255,0.98)',
    },
    purchaseHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    purchaseLabel: {
      fontSize: 16,
      fontWeight: '800',
      color: isDark ? COLORS.textLight : COLORS.textPrimary,
    },
    purchaseCaption: {
      marginTop: 4,
      fontSize: 12,
      lineHeight: 18,
      color: isDark ? COLORS.textMuted : COLORS.textSecondary,
    },
    quantityWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 18,
      borderWidth: 1,
      borderColor: isDark ? COLORS.borderDark : COLORS.border,
      overflow: 'hidden',
      backgroundColor: isDark ? '#111827' : COLORS.backgroundLight,
    },
    qtyButton: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    qtyValue: {
      minWidth: 40,
      textAlign: 'center',
      fontSize: 16,
      fontWeight: '900',
      color: isDark ? COLORS.textLight : COLORS.textPrimary,
    },
    primaryButton: {
      minHeight: 54,
      borderRadius: 18,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: COLORS.primary,
    },
    whatsAppButton: {
      minHeight: 54,
      borderRadius: 18,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: COLORS.whatsapp,
    },
    primaryButtonText: {
      color: '#fff',
      fontWeight: '800',
      fontSize: 15,
    },
    secondaryButton: {
      minHeight: 52,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: isDark ? COLORS.borderDark : COLORS.border,
      backgroundColor: isDark ? '#111827' : COLORS.backgroundLight,
    },
    secondaryButtonText: {
      color: isDark ? COLORS.textLight : COLORS.textPrimary,
      fontWeight: '700',
      fontSize: 15,
    },
    infoCard: {
      padding: 22,
      gap: 12,
      borderRadius: 28,
      borderWidth: 1,
      borderColor: isDark ? COLORS.borderDark : COLORS.border,
      backgroundColor: isDark ? 'rgba(26, 34, 53, 0.94)' : 'rgba(255,255,255,0.98)',
    },
    infoTitle: {
      fontSize: 20,
      fontWeight: '900',
      color: isDark ? COLORS.textLight : COLORS.textPrimary,
    },
    specRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 16,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? COLORS.borderDark : COLORS.border,
    },
    specLabel: {
      flex: 1,
      fontSize: 13,
      lineHeight: 20,
      color: isDark ? COLORS.textMuted : COLORS.textSecondary,
    },
    specValue: {
      flex: 1,
      textAlign: 'right',
      fontSize: 13,
      lineHeight: 20,
      color: isDark ? COLORS.textLight : COLORS.textPrimary,
      fontWeight: '800',
    },
    featureRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
    },
    featureText: {
      flex: 1,
      fontSize: 14,
      lineHeight: 22,
      color: isDark ? COLORS.textLight : COLORS.textPrimary,
    },
    relatedSection: {
      gap: 12,
    },
    relatedHeader: {
      paddingHorizontal: 16,
      gap: 4,
    },
    relatedTitle: {
      fontSize: 23,
      fontWeight: '900',
      color: isDark ? COLORS.textLight : COLORS.textPrimary,
    },
    relatedSubtitle: {
      fontSize: 13,
      color: isDark ? COLORS.textMuted : COLORS.textSecondary,
    },
    relatedList: {
      paddingHorizontal: 16,
      gap: 14,
    },
    relatedCardWrap: {
      width: 192,
    },
  });
