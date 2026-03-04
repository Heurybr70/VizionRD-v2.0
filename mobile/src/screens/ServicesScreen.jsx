/**
 * ServicesScreen — basado en 6.html
 * Hero + Filtro por categoría + Cards de servicios
 */
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ImageBackground, StyleSheet, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../context/ThemeContext';
import COLORS from '@shared/constants/colors';
import { SERVICE_CATEGORIES } from '@shared/constants/categories';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

const SERVICES = [
  {
    id: '1',
    title: 'Lavado Premium',
    price: 'RD$ 1,500+',
    description:
      'Limpieza profunda artesanal con pH neutro, descontaminado básico y sellado cerámico rápido para un brillo espectacular.',
    category: 'exterior',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDs5BywT6R47Slq5wLDpC2HxQWI-KBckAKqujCWJrJs61u8DiWy_GMTXHu5dp5OnzIaCYm5H9thAdb-Cp4IpgGbrhUPyR7Cp4ubRyZD2FQEotJnV1K96uTYgvX9K58WrW_dMlihDDOqKHO8pvaQc5G5sY6Kg2s4J3hYG7a4P6T-WzMaIA4cN-X5ygjxlg6ls1QUtUGlgk_Ggx-FqOCAgDl6vtycg_cJpCE8tNaJVlsr4OW7aFd-KKdQkE18TZ3eJjTu09ZXP3W2cx4_',
  },
  {
    id: '2',
    title: 'Pulido de Pintura',
    price: 'RD$ 5,500+',
    description:
      'Corrección de micro-rayas (swirls) y recuperación de la profundidad del color mediante sistema de pulido multi-etapa.',
    category: 'exterior',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDqEF6V5jWaX_kBR2klvJ8U7XE3gzEYj8mKg7SVhOaTglXOlhab7k_6At84Kc2u2TvjPTxMNL3gkFRhdsjfH4cMXcJ0msbYEJnWbt9uj9X8Jw1HEji8rTPHbXJdG2uau9Tj81puxBfz_TbCcQcjqjLba7qxnxGGqPoHTM_4Tdxtm-XQO4medOJuJhA_3CJFJ8BE7SXXWhqlBU-HzHfLuavUTujcjAGc_D8gNSoWysVi8waf_RARurj8m24B2RvbYGbVR9-4ryDZlKCv',
  },
  {
    id: '3',
    title: 'Ceramic Coating 9H',
    price: 'RD$ 12,000+',
    description:
      'Protección nano-tecnológica de larga duración. Repele agua, suciedad y rayos UV. Garantía de hasta 3 años.',
    category: 'protection',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB30gYz97fzz32Xwv9p_YnBn9HHBgo_hzBo8uezaheQIZBjzlZBz28Yka7PeQ-ZWwHLInegI0I82jWZxfNlbXuqjHPc6C9JoBfAaYEymTi7Z1FhbZ-X0lG0BNqfXFvfKpGWvI17OAMmXWfKqOhHJdKuMK9cMFMNwFIfWmBkZ7kqfYT5rVmQFWvZpzSg3m3Vy3aS5lqfJeSTDovdVKXpCo5eoB9ixoE_Yzf3ZkAbWLHuv0r6hjRK0zqJh_FUfIYVVPSlbPirEQ3u6B',
  },
  {
    id: '4',
    title: 'Detallado Interior',
    price: 'RD$ 3,500+',
    description:
      'Limpieza profunda de tapicería, plásticos, cuero y cristales interiores. Eliminación de malos olores.',
    category: 'interior',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAqQRw4XUUMhemag93ZJYR9FTYQ3bzKKeP8ctwf3FSeBSiGBSmGst9T4K7qNgRrPwbLTCeIzcg6VaW7wFtUHYrSha0mhbvTnQvyfhAxrlwJdnIjZO7zd1PPjVSvO68GTyx1lfykMy-pP-CMWN2475Ck0vfgSdhmhfN_nF9iZ2s2L7h2v3t3GYjqMzOodwBsCLccR1UCDlabrwfDG2sEjY7AdZWBia-rQAKaHaDO-RkJ58y4f3hhJynIHl3WYSDQwA4PL4OQuQui8YZQ',
  },
];

export default function ServicesScreen() {
  const { isDark } = useTheme();
  const [activeCategory, setActiveCategory] = useState('all');
  const s = styles(isDark);

  const filtered = activeCategory === 'all'
    ? SERVICES
    : SERVICES.filter(sv => sv.category === activeCategory);

  const handleBook = (service) => {
    Toast.show({ type: 'info', text1: 'Solicitar cita', text2: `${service.title} — próximamente por WhatsApp` });
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.iconBtn}>
          <Ionicons name="menu" size={28} color={isDark ? COLORS.textLight : COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>VIZION RD</Text>
        <TouchableOpacity style={s.iconBtn}>
          <Ionicons name="person-circle-outline" size={28} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Hero */}
        <View style={s.heroWrap}>
          <ImageBackground
            source={{
              uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHAJneJ6GMt_danKzUlFuR080yAq3omrByF3WhbK1-WrWRsUKTLqCO4ed8jO01x6giS9Y36pWIf2KAaSvSHbutZhV2JgDHOY0H-x87qIgDosspO71eAzGgpxYMH8PCTimJhipVPTozHTQ_y-9Fu0WB0q6sf8d-objOb_EU94NideeygGwnBDkBnhDx2I2Tf9hdb7c4Unu8GasapJvyd5nBb16xgEPiYFqzWlCidN3OHXcARLXvaCVfjRPZvdiz3Dpl7dG7VuyHGqDQ',
            }}
            style={s.hero}
            imageStyle={{ borderRadius: 14 }}
          >
            <View style={s.heroOverlay} />
            <View style={s.heroContent}>
              <View style={s.heroBadge}>
                <Text style={s.heroBadgeText}>Premium Care</Text>
              </View>
              <Text style={s.heroTitle}>Detallado de{'\n'}Alta Gama</Text>
            </View>
          </ImageBackground>
        </View>

        {/* Category filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.categoryRow}
        >
          {SERVICE_CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.value}
              onPress={() => setActiveCategory(cat.value)}
              style={[s.catBtn, activeCategory === cat.value && s.catBtnActive]}
            >
              <Text style={[s.catBtnText, activeCategory === cat.value && s.catBtnTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Service cards */}
        <View style={s.serviceList}>
          <Text style={s.sectionTitle}>Servicios Destacados</Text>
          {filtered.map(service => (
            <View key={service.id} style={s.serviceCard}>
              <ImageBackground
                source={{ uri: service.image }}
                style={s.serviceImage}
                imageStyle={{ borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
              />
              <View style={s.serviceBody}>
                <View style={s.serviceHeader}>
                  <Text style={s.serviceTitle}>{service.title}</Text>
                  <Text style={s.servicePrice}>{service.price}</Text>
                </View>
                <Text style={s.serviceDesc}>{service.description}</Text>
                <TouchableOpacity style={s.bookBtn} onPress={() => handleBook(service)}>
                  <Ionicons name="calendar-outline" size={16} color="#fff" />
                  <Text style={s.bookBtnText}>Reservar Ahora</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
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
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: 'bold', color: COLORS.primary, letterSpacing: 2 },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  heroWrap: { margin: 16 },
  hero: { height: 200, justifyContent: 'flex-end', borderRadius: 14, overflow: 'hidden' },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(16,22,34,0.6)', borderRadius: 14,
  },
  heroContent: { padding: 20, gap: 8 },
  heroBadge: {
    backgroundColor: COLORS.primary, alignSelf: 'flex-start',
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20,
  },
  heroBadgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  heroTitle: { color: '#fff', fontSize: 26, fontWeight: 'bold', lineHeight: 32 },
  categoryRow: { paddingHorizontal: 16, gap: 8, marginBottom: 12, paddingBottom: 4 },
  catBtn: {
    paddingHorizontal: 20, paddingVertical: 9, borderRadius: 24,
    backgroundColor: isDark ? '#1e293b' : COLORS.surface,
    borderWidth: 1, borderColor: isDark ? COLORS.borderDark : COLORS.border,
  },
  catBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catBtnText: { fontSize: 13, fontWeight: '600', color: isDark ? COLORS.textMuted : COLORS.textSecondary },
  catBtnTextActive: { color: '#fff' },
  serviceList: { paddingHorizontal: 16, gap: 16 },
  sectionTitle: { fontSize: 19, fontWeight: 'bold', color: isDark ? COLORS.textLight : COLORS.textPrimary, marginBottom: 4 },
  serviceCard: {
    borderRadius: 12, overflow: 'hidden',
    backgroundColor: isDark ? COLORS.surfaceDark : COLORS.surface,
    borderWidth: 1, borderColor: isDark ? COLORS.borderDark : COLORS.border,
  },
  serviceImage: { height: 180, width: '100%' },
  serviceBody: { padding: 16, gap: 10 },
  serviceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  serviceTitle: { fontSize: 17, fontWeight: 'bold', color: isDark ? COLORS.textLight : COLORS.textPrimary, flex: 1 },
  servicePrice: { fontSize: 15, fontWeight: 'bold', color: COLORS.primary },
  serviceDesc: { fontSize: 13, color: isDark ? COLORS.textMuted : COLORS.textSecondary, lineHeight: 19 },
  bookBtn: {
    backgroundColor: COLORS.primary, padding: 12, borderRadius: 10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  bookBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  width,
});
