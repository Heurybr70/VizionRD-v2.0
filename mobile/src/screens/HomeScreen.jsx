import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import {
  getProducts,
  getSiteContent,
  getCarouselSlides,
  getSiteSettings,
} from '../services/firestore.service';
import {
  DEFAULT_HERO_CONTENT,
  normalizeAboutContent,
  normalizeCarouselSlides,
  normalizeHeroContent,
  normalizeSiteSettings,
} from '../services/content.service';
import ScreenState from '../components/common/ScreenState';
import AnimatedEntrance from '../components/common/AnimatedEntrance';
import AppHeader from '../components/common/AppHeader';
import ProductCard from '../components/common/ProductCard';
import COLORS from '@shared/constants/colors';

const { width } = Dimensions.get('window');

const FALLBACK_HERO_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCK1CLUIT-8jrFn_BuGLjyxOwDa2ICtZ-PjNs9mjcNqj-qh-gqgOXvAZDPn35PwedSo27KHqEz34YYSSMkTp1BO2PyV_3YYq-en49lLaqSLqG_980NI12hnUUEWfIfOMiQkfAIugbYphK7ti3sYgMA8VhteBMHeDaVdv5Bz9kbVmG7UNbm3_7nyRFaCbYdFBSRhgpbQmzmKdkMNCe-wzNwITZuqCzIxTnydzozhI0VZjO6ZGenDpVDJmIJIB1ImbtMAOzt6iD6sWsvz';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { isDark } = useTheme();
  const { addItem, itemCount } = useCart();
  const { isFavorite, toggleFavorite, loaded: favoritesLoaded } = useFavorites();
  const styles = useMemo(() => createStyles(isDark), [isDark]);
  const carouselRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const { data: productsResult, refetch: refetchProducts } = useQuery({
    queryKey: ['products', 'mobile-home'],
    queryFn: () => getProducts(true),
  });

  const { data: heroDoc } = useQuery({
    queryKey: ['site_content', 'hero_section', 'mobile-home'],
    queryFn: () => getSiteContent('hero_section'),
  });

  const { data: aboutDoc } = useQuery({
    queryKey: ['site_content', 'about_us', 'mobile-home'],
    queryFn: () => getSiteContent('about_us'),
  });

  const { data: carouselResult } = useQuery({
    queryKey: ['carousel', 'mobile-home'],
    queryFn: () => getCarouselSlides(true),
  });

  const { data: settingsDoc } = useQuery({
    queryKey: ['site_settings', 'mobile-home'],
    queryFn: () => getSiteSettings(),
  });

  const heroContent = normalizeHeroContent(heroDoc?.data);
  const aboutContent = normalizeAboutContent(aboutDoc?.data);
  const settings = normalizeSiteSettings(settingsDoc?.data);
  const products = productsResult?.success ? productsResult.data || [] : [];
  const featuredProducts = products.filter((product) => product.featured === true).slice(0, 6);
  const slides = normalizeCarouselSlides(carouselResult?.data || []);
  const heroSlides = slides.length > 0
    ? slides
    : [{
        id: 'hero-fallback',
        title: heroContent.title || DEFAULT_HERO_CONTENT.title,
        subtitle: heroContent.subtitle || DEFAULT_HERO_CONTENT.subtitle,
        image: FALLBACK_HERO_IMAGE,
        buttonText: heroContent.ctaText || DEFAULT_HERO_CONTENT.ctaText,
      }];

  useEffect(() => {
    if (heroSlides.length <= 1) return undefined;

    const intervalId = setInterval(() => {
      setActiveSlide((current) => {
        const next = (current + 1) % heroSlides.length;
        carouselRef.current?.scrollToIndex?.({ index: next, animated: true });
        return next;
      });
    }, 5000);

    return () => clearInterval(intervalId);
  }, [heroSlides.length]);

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
    <AnimatedEntrance delay={90 + index * 45} style={styles.productCardWrap}>
      <ProductCard
        isDark={isDark}
        product={item}
        variant="compact"
        isFavorite={favoritesLoaded && isFavorite(item.id)}
        onPress={() => navigation.navigate('Tienda', {
          screen: 'ProductDetail',
          params: { productId: item.id },
        })}
        onAddToCart={handleAddToCart}
        onToggleFavorite={handleToggleFavorite}
      />
    </AnimatedEntrance>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader
        isDark={isDark}
        title={settings.businessName || 'Vizion RD'}
        subtitle="Auto care premium"
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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <AnimatedEntrance delay={30}>
          <View style={styles.heroWrap}>
            <FlatList
              ref={carouselRef}
              data={heroSlides}
              keyExtractor={(item) => item.id}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const index = Math.round(event.nativeEvent.contentOffset.x / (width - 32));
                setActiveSlide(index);
              }}
              renderItem={({ item }) => (
                <View style={styles.slideWrap}>
                  <ImageBackground
                    source={{ uri: item.image || FALLBACK_HERO_IMAGE }}
                    style={styles.hero}
                    imageStyle={styles.heroImage}
                  >
                    <View style={styles.heroOverlay} />
                    <View style={styles.heroGlow} />
                    <View style={styles.heroContent}>
                      <Text style={styles.heroTag}>Coleccion destacada</Text>
                      <Text style={styles.heroTitle}>{item.title || heroContent.title}</Text>
                      <Text style={styles.heroSubtitle}>{item.subtitle || heroContent.subtitle}</Text>

                      <View style={styles.heroActions}>
                        <TouchableOpacity
                          style={styles.heroPrimary}
                          onPress={() => navigation.navigate('Tienda')}
                          activeOpacity={0.92}
                        >
                          <Text style={styles.heroPrimaryText}>{item.buttonText || heroContent.ctaText}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.heroSecondary}
                          onPress={() => navigation.navigate('Favoritos')}
                          activeOpacity={0.92}
                        >
                          <Text style={styles.heroSecondaryText}>Ver favoritos</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </ImageBackground>
                </View>
              )}
            />

            <View style={styles.dots}>
              {heroSlides.map((slide, index) => (
                <View key={slide.id} style={[styles.dot, index === activeSlide && styles.dotActive]} />
              ))}
            </View>
          </View>
        </AnimatedEntrance>

        <AnimatedEntrance delay={80} style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('Tienda')}
            activeOpacity={0.9}
          >
            <Ionicons name="storefront-outline" size={18} color={COLORS.primary} />
            <Text style={styles.quickActionTitle}>Catalogo</Text>
            <Text style={styles.quickActionText}>Explora productos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('Favoritos')}
            activeOpacity={0.9}
          >
            <Ionicons name="heart-outline" size={18} color={COLORS.primary} />
            <Text style={styles.quickActionTitle}>Favoritos</Text>
            <Text style={styles.quickActionText}>Guarda lo que te interesa</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('Tienda', { screen: 'About' })}
            activeOpacity={0.9}
          >
            <Ionicons name="sparkles-outline" size={18} color={COLORS.primary} />
            <Text style={styles.quickActionTitle}>Nosotros</Text>
            <Text style={styles.quickActionText}>Conoce la marca</Text>
          </TouchableOpacity>
        </AnimatedEntrance>

        <AnimatedEntrance delay={110} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionCopy}>
              <Text style={styles.sectionEyebrow}>Destacados</Text>
              <Text style={styles.sectionTitle}>Productos listos para tu proximo cuidado</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Tienda')} activeOpacity={0.88}>
              <Text style={styles.sectionLink}>Ver todo</Text>
            </TouchableOpacity>
          </View>

          {!settings.catalogEnabled ? (
            <ScreenState
              isDark={isDark}
              icon="eye-off-outline"
              title="Catalogo deshabilitado"
              description="El catalogo no esta disponible en este momento."
            />
          ) : !productsResult ? (
            <ScreenState
              isDark={isDark}
              icon="time-outline"
              title="Cargando productos"
              description="Estamos preparando el catalogo para ti."
            />
          ) : !productsResult.success ? (
            <ScreenState
              isDark={isDark}
              icon="cloud-offline-outline"
              title="No pudimos cargar el catalogo"
              description={productsResult.error || 'Intenta de nuevo en unos segundos.'}
              actionLabel="Reintentar"
              onAction={refetchProducts}
            />
          ) : featuredProducts.length === 0 ? (
            <ScreenState
              isDark={isDark}
              icon="cube-outline"
              title="Aun no hay destacados"
              description="Cuando haya productos marcados como destacados apareceran aqui."
            />
          ) : (
            <FlatList
              data={featuredProducts}
              renderItem={renderProduct}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredList}
            />
          )}
        </AnimatedEntrance>

        <AnimatedEntrance delay={150} style={styles.storyCard}>
          <View style={styles.storyHeader}>
            <View style={styles.storyIcon}>
              <Ionicons name="flash-outline" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.storyCopy}>
              <Text style={styles.storyEyebrow}>Experiencia mobile</Text>
              <Text style={styles.storyTitle}>{aboutContent.title}</Text>
            </View>
          </View>

          <Text style={styles.storyText}>{aboutContent.description}</Text>

          <View style={styles.storyGrid}>
            <View style={styles.storyBlock}>
              <Text style={styles.storyBlockLabel}>Mision</Text>
              <Text style={styles.storyBlockText}>{aboutContent.mission}</Text>
            </View>
            <View style={styles.storyBlock}>
              <Text style={styles.storyBlockLabel}>Vision</Text>
              <Text style={styles.storyBlockText}>{aboutContent.vision}</Text>
            </View>
          </View>

          <View style={styles.storyActions}>
            <TouchableOpacity
              style={styles.storyPrimary}
              onPress={() => navigation.navigate('Contact')}
              activeOpacity={0.92}
            >
              <Text style={styles.storyPrimaryText}>Hablar con el equipo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.storySecondary}
              onPress={() => navigation.navigate('Tienda', { screen: 'About' })}
              activeOpacity={0.92}
            >
              <Text style={styles.storySecondaryText}>Leer mas</Text>
            </TouchableOpacity>
          </View>
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
      paddingBottom: 36,
      gap: 14,
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
    heroWrap: {
      marginHorizontal: 16,
      gap: 12,
    },
    slideWrap: {
      width: width - 32,
    },
    hero: {
      width: width - 32,
      height: (width - 32) * 1.08,
      justifyContent: 'flex-end',
      borderRadius: 28,
      overflow: 'hidden',
      backgroundColor: isDark ? COLORS.surfaceDark : COLORS.surface,
    },
    heroImage: {
      borderRadius: 28,
    },
    heroOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(15, 23, 42, 0.58)',
    },
    heroGlow: {
      position: 'absolute',
      width: 180,
      height: 180,
      borderRadius: 90,
      top: -36,
      right: -36,
      backgroundColor: 'rgba(37, 99, 235, 0.3)',
    },
    heroContent: {
      paddingHorizontal: 24,
      paddingVertical: 26,
      gap: 12,
    },
    heroTag: {
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      color: '#fff',
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      backgroundColor: 'rgba(255,255,255,0.14)',
    },
    heroTitle: {
      color: '#fff',
      fontSize: 31,
      lineHeight: 37,
      fontWeight: '900',
    },
    heroSubtitle: {
      color: '#e2e8f0',
      fontSize: 14,
      lineHeight: 22,
      maxWidth: '88%',
    },
    heroActions: {
      gap: 10,
      marginTop: 4,
    },
    heroPrimary: {
      minHeight: 52,
      borderRadius: 18,
      paddingHorizontal: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: COLORS.primary,
    },
    heroPrimaryText: {
      color: '#fff',
      fontWeight: '800',
      fontSize: 15,
    },
    heroSecondary: {
      minHeight: 50,
      borderRadius: 18,
      paddingHorizontal: 16,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)',
      backgroundColor: 'rgba(255,255,255,0.08)',
    },
    heroSecondaryText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 15,
    },
    dots: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 6,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: isDark ? '#334155' : '#cbd5e1',
    },
    dotActive: {
      width: 22,
      backgroundColor: COLORS.primary,
    },
    quickActions: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      gap: 12,
    },
    quickAction: {
      flex: 1,
      minHeight: 122,
      padding: 16,
      gap: 9,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: isDark ? COLORS.borderDark : COLORS.border,
      backgroundColor: isDark ? 'rgba(26, 34, 53, 0.92)' : 'rgba(255,255,255,0.97)',
    },
    quickActionTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: isDark ? COLORS.textLight : COLORS.textPrimary,
    },
    quickActionText: {
      fontSize: 12,
      lineHeight: 18,
      color: isDark ? COLORS.textMuted : COLORS.textSecondary,
    },
    section: {
      gap: 12,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      gap: 16,
    },
    sectionCopy: {
      flex: 1,
      gap: 4,
    },
    sectionEyebrow: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      color: COLORS.primary,
    },
    sectionTitle: {
      fontSize: 24,
      lineHeight: 30,
      fontWeight: '900',
      color: isDark ? COLORS.textLight : COLORS.textPrimary,
    },
    sectionLink: {
      fontSize: 13,
      fontWeight: '800',
      color: COLORS.primary,
    },
    featuredList: {
      paddingHorizontal: 16,
      gap: 14,
    },
    productCardWrap: {
      width: 192,
    },
    storyCard: {
      marginHorizontal: 16,
      padding: 22,
      gap: 16,
      borderRadius: 30,
      borderWidth: 1,
      borderColor: isDark ? COLORS.borderDark : COLORS.border,
      backgroundColor: isDark ? 'rgba(26, 34, 53, 0.94)' : 'rgba(255,255,255,0.98)',
    },
    storyHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    storyIcon: {
      width: 48,
      height: 48,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? 'rgba(37, 99, 235, 0.18)' : 'rgba(37, 99, 235, 0.1)',
    },
    storyCopy: {
      flex: 1,
      gap: 4,
    },
    storyEyebrow: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      color: COLORS.primary,
    },
    storyTitle: {
      fontSize: 22,
      lineHeight: 28,
      fontWeight: '900',
      color: isDark ? COLORS.textLight : COLORS.textPrimary,
    },
    storyText: {
      fontSize: 14,
      lineHeight: 23,
      color: isDark ? COLORS.textMuted : COLORS.textSecondary,
    },
    storyGrid: {
      gap: 12,
    },
    storyBlock: {
      padding: 16,
      gap: 7,
      borderRadius: 22,
      backgroundColor: isDark ? '#111827' : COLORS.backgroundLight,
    },
    storyBlockLabel: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.7,
      textTransform: 'uppercase',
      color: COLORS.primary,
    },
    storyBlockText: {
      fontSize: 13,
      lineHeight: 21,
      color: isDark ? COLORS.textLight : COLORS.textPrimary,
    },
    storyActions: {
      gap: 10,
    },
    storyPrimary: {
      minHeight: 52,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: COLORS.primary,
    },
    storyPrimaryText: {
      color: '#fff',
      fontSize: 15,
      fontWeight: '800',
    },
    storySecondary: {
      minHeight: 50,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: isDark ? COLORS.borderDark : COLORS.border,
      backgroundColor: isDark ? '#111827' : COLORS.backgroundLight,
    },
    storySecondaryText: {
      color: isDark ? COLORS.textLight : COLORS.textPrimary,
      fontSize: 15,
      fontWeight: '700',
    },
  });
