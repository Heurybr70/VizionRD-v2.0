/**
 * HomeScreen — basado en 1.html
 * Hero + Productos Destacados + Misión/Visión
 */
import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ImageBackground, Image, FlatList, StyleSheet, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';

import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { getProducts } from '../services/firestore.service';
import COLORS from '@shared/constants/colors';
import { formatPrice } from '@shared/utils/formatters';

const { width } = Dimensions.get('window');

const HERO_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCK1CLUIT-8jrFn_BuGLjyxOwDa2ICtZ-PjNs9mjcNqj-qh-gqgOXvAZDPn35PwedSo27KHqEz34YYSSMkTp1BO2PyV_3YYq-en49lLaqSLqG_980NI12hnUUEWfIfOMiQkfAIugbYphK7ti3sYgMA8VhteBMHeDaVdv5Bz9kbVmG7UNbm3_7nyRFaCbYdFBSRhgpbQmzmKdkMNCe-wzNwITZuqCzIxTnydzozhI0VZjO6ZGenDpVDJmIJIB1ImbtMAOzt6iD6sWsvz';

export default function HomeScreen() {
  const { isDark } = useTheme();
  const { itemCount } = useCart();
  const navigation = useNavigation();
  const s = styles(isDark);

  const { data: productsData } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => getProducts(true),
    select: (res) => (res.data || []).filter(p => p.featured).slice(0, 6),
  });

  const featured = productsData || [];

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={s.productCard}
      onPress={() => navigation.navigate('Tienda', {
        screen: 'ProductDetail',
        params: { productId: item.id },
      })}
    >
      <View style={s.productImageWrap}>
        {item.image ? (
          <Image source={{ uri: item.thumbnail || item.image }} style={s.productImage} />
        ) : (
          <View style={[s.productImage, { backgroundColor: isDark ? '#1e293b' : '#e2e8f0' }]} />
        )}
      </View>
      <Text style={s.productCategory} numberOfLines={1}>
        {item.category ? item.category.toUpperCase() : 'PRODUCTO'}
      </Text>
      <Text style={s.productName} numberOfLines={1}>{item.name}</Text>
      <Text style={s.productPrice}>{formatPrice(item.price)}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.iconBtn}>
          <Ionicons name="menu" size={28} color={isDark ? COLORS.textLight : COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Vizion RD</Text>
        <TouchableOpacity
          style={s.iconBtn}
          onPress={() => navigation.navigate('Carrito')}
        >
          <View>
            <Ionicons name="cart-outline" size={26} color={COLORS.primary} />
            {itemCount > 0 && (
              <View style={s.badge}>
                <Text style={s.badgeText}>{itemCount}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Hero */}
        <View style={s.heroWrap}>
          <ImageBackground source={{ uri: HERO_IMAGE }} style={s.hero} imageStyle={{ borderRadius: 16 }}>
            <View style={s.heroOverlay} />
            <View style={s.heroContent}>
              <Text style={s.heroTitle}>Pasión por la{'\n'}Perfección</Text>
              <Text style={s.heroSub}>
                Elevamos el estándar del cuidado automotriz con tecnología de vanguardia.
              </Text>
              <TouchableOpacity
                style={s.heroBtn}
                onPress={() => navigation.navigate('Tienda')}
              >
                <Text style={s.heroBtnText}>Ver Productos</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.heroBtnOutline}
                onPress={() => navigation.navigate('Tienda', { screen: 'About' })}
              >
                <Text style={s.heroBtnOutlineText}>Nuestra Historia</Text>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </View>

        {/* Featured Products */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Productos Destacados</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Tienda')}>
              <Text style={s.sectionLink}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          {featured.length > 0 ? (
            <FlatList
              data={featured}
              renderItem={renderProduct}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
            />
          ) : (
            <View style={s.emptyProducts}>
              <Text style={s.emptyText}>Cargando productos...</Text>
            </View>
          )}
        </View>

        {/* Mission / Vision */}
        <View style={[s.section, s.missionCard]}>
          <Ionicons name="checkmark-circle" size={40} color={COLORS.primary} />
          <Text style={s.missionTitle}>Excelencia en Cada Detalle</Text>
          <Text style={s.missionLabel}>NUESTRA MISIÓN</Text>
          <Text style={s.missionText}>
            Transformar la experiencia del cuidado vehicular a través de productos de grado
            profesional accesibles para todos.
          </Text>
          <View style={s.divider} />
          <Text style={s.missionLabel}>NUESTRA VISIÓN</Text>
          <Text style={s.missionText}>
            Ser el referente #1 en detailing en la región, impulsando la innovación y la
            protección duradera.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = (isDark) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: isDark ? COLORS.backgroundDark : COLORS.backgroundLight },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: isDark ? `${COLORS.backgroundDark}CC` : `${COLORS.surface}CC`,
    borderBottomWidth: 1, borderBottomColor: isDark ? COLORS.borderDark : `${COLORS.primary}1A`,
  },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    flex: 1, textAlign: 'center', fontSize: 20, fontWeight: 'bold',
    color: isDark ? COLORS.textLight : COLORS.textPrimary,
  },
  badge: {
    position: 'absolute', top: -4, right: -6,
    backgroundColor: '#ef4444', borderRadius: 8,
    minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 2,
  },
  badgeText: { color: '#fff', fontSize: 8, fontWeight: 'bold' },
  heroWrap: { margin: 16 },
  hero: { height: (width - 32) * 1.25, justifyContent: 'flex-end', borderRadius: 16, overflow: 'hidden' },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(16,22,34,0.8)',
    borderRadius: 16,
  },
  heroContent: { padding: 24, gap: 12 },
  heroTitle: { color: '#fff', fontSize: 32, fontWeight: 'bold', lineHeight: 40 },
  heroSub: { color: '#cbd5e1', fontSize: 13 },
  heroBtn: {
    backgroundColor: COLORS.primary, padding: 16, borderRadius: 12, alignItems: 'center',
    shadowColor: COLORS.primary, shadowOpacity: 0.4, shadowRadius: 8, elevation: 4,
  },
  heroBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  heroBtnOutline: {
    padding: 16, borderRadius: 12, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  heroBtnOutlineText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  section: { marginTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: isDark ? COLORS.textLight : COLORS.textPrimary },
  sectionLink: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
  productCard: { width: 160, gap: 6 },
  productImageWrap: {
    aspectRatio: 1, backgroundColor: isDark ? '#1e293b' : '#fff',
    borderRadius: 12, padding: 12, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: isDark ? COLORS.borderDark : `${COLORS.primary}0D`,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  productImage: { width: '100%', height: '100%', resizeMode: 'contain', borderRadius: 8 },
  productCategory: { fontSize: 9, fontWeight: 'bold', color: COLORS.primary, letterSpacing: 1 },
  productName: { fontSize: 13, fontWeight: '600', color: isDark ? COLORS.textLight : COLORS.textPrimary },
  productPrice: { fontSize: 14, fontWeight: 'bold', color: COLORS.primary },
  emptyProducts: { paddingHorizontal: 16, paddingVertical: 8 },
  emptyText: { color: COLORS.textMuted, fontSize: 13 },
  missionCard: {
    marginHorizontal: 16, padding: 28,
    backgroundColor: `${COLORS.primary}0D`,
    borderRadius: 16, borderWidth: 1, borderColor: `${COLORS.primary}1A`,
    gap: 8,
  },
  missionTitle: { fontSize: 22, fontWeight: 'bold', color: isDark ? COLORS.textLight : COLORS.textPrimary },
  missionLabel: { fontSize: 11, fontWeight: 'bold', color: COLORS.primary, letterSpacing: 2, marginTop: 8 },
  missionText: { fontSize: 13, color: isDark ? COLORS.textMuted : COLORS.textSecondary, lineHeight: 20 },
  divider: { height: 1, backgroundColor: `${COLORS.primary}20`, marginVertical: 4 },
});
