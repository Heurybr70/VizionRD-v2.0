/**
 * AboutScreen — basado en 3.html
 * Hero, Misión/Visión, Historia, Contacto
 */
import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ImageBackground, Linking, StyleSheet, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '../context/ThemeContext';
import COLORS from '@shared/constants/colors';

const { width } = Dimensions.get('window');

const HERO_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBG_n8qm28Rxko2nHur6YMs8t-xOup-BPnWsJsPCq59PDDsEyD4dVArIu6LHTK7UZbFCV4SLI9Y_4X0M_hchng_XhWC9iBAEb_zujl7PH1RG_71wBgQdWphE7qoVkurX8gRRXTIBno2oaV7sQlVEj0GCfwoKJjEOvdL6ZqfV1BRb-iTkOgWoh1-hZWb6inYFJ7jEVeA0asdCV6Vdo9lWZSRSlTPFstDxgaTWn1U-korMyaou579OZZd9dA0XvmcBrj80RTE0EJFk-Un';

export default function AboutScreen() {
  const { isDark } = useTheme();
  const navigation = useNavigation();
  const s = styles(isDark);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity style={s.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Nosotros</Text>
        <View style={s.iconBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Hero */}
        <View style={s.heroWrap}>
          <ImageBackground source={{ uri: HERO_IMAGE }} style={s.hero} imageStyle={{ borderRadius: 14 }}>
            <View style={[StyleSheet.absoluteFill, { borderRadius: 14, backgroundColor: 'rgba(17,82,212,0.7)' }]} />
            <View style={s.heroContent}>
              <View style={s.heroBadge}>
                <Text style={s.heroBadgeText}>Vizion RD</Text>
              </View>
              <Text style={s.heroTitle}>Excelencia en{'\n'}Cada Detalle</Text>
            </View>
          </ImageBackground>
        </View>

        {/* Mission */}
        <View style={s.cardsWrap}>
          <View style={s.card}>
            <View style={s.cardIcon}>
              <Ionicons name="radio-button-on" size={28} color={COLORS.primary} />
            </View>
            <Text style={s.cardTitle}>Nuestra Misión</Text>
            <Text style={s.cardText}>
              Brindar un servicio de detallado automotriz excepcional, utilizando tecnología de
              punta y productos premium para superar las expectativas de cada cliente.
            </Text>
          </View>

          <View style={s.card}>
            <View style={s.cardIcon}>
              <Ionicons name="eye-outline" size={28} color={COLORS.primary} />
            </View>
            <Text style={s.cardTitle}>Nuestra Visión</Text>
            <Text style={s.cardText}>
              Ser el referente número uno en el cuidado estético y restauración de vehículos en
              la región, reconocidos por nuestra integridad y calidad superior.
            </Text>
          </View>
        </View>

        {/* History */}
        <View style={s.history}>
          <Text style={s.historyLabel}>NUESTRA HISTORIA</Text>
          <Text style={s.historyTitle}>Pasión por la Perfección</Text>
          <Text style={s.historyText}>
            Vizion RD nació de la pasión genuina por el automovilismo y la estética. Lo que
            comenzó como un pasatiempo se transformó en un compromiso profesional con la
            perfección técnica.
          </Text>
          <Text style={[s.historyText, { marginTop: 12 }]}>
            Entendemos que su vehículo es más que un medio de transporte; es una inversión y un
            reflejo de su personalidad. Por ello, tratamos cada automóvil con el máximo respeto y
            dedicación artesanal.
          </Text>
        </View>

        {/* Contact */}
        <View style={s.contact}>
          <Text style={s.contactTitle}>Contáctanos</Text>
          <TouchableOpacity
            style={[s.contactBtn, { backgroundColor: COLORS.whatsapp }]}
            onPress={() => Linking.openURL('https://wa.me/18091234567')}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={20} color="#fff" />
            <Text style={s.contactBtnText}>WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.contactBtn, { backgroundColor: '#fd1d1d' }]}
            onPress={() => Linking.openURL('https://instagram.com/vizionrd')}
          >
            <Ionicons name="camera-outline" size={20} color="#fff" />
            <Text style={s.contactBtnText}>Instagram</Text>
          </TouchableOpacity>
          <Text style={s.copy}>© 2025 Vizion RD. Todos los derechos reservados.</Text>
        </View>
      </ScrollView>
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
  heroWrap: { margin: 16 },
  hero: { height: (width - 32) * 0.65, justifyContent: 'flex-end', borderRadius: 14, overflow: 'hidden' },
  heroContent: { padding: 22, gap: 8 },
  heroBadge: {
    backgroundColor: COLORS.primary, alignSelf: 'flex-start',
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20,
  },
  heroBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  heroTitle: { color: '#fff', fontSize: 28, fontWeight: 'bold', lineHeight: 34 },
  cardsWrap: { paddingHorizontal: 16, gap: 12 },
  card: {
    backgroundColor: isDark ? COLORS.surfaceDark : COLORS.surface,
    borderRadius: 12, padding: 18, gap: 8,
    borderWidth: 1, borderColor: isDark ? COLORS.borderDark : COLORS.border,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  cardIcon: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: `${COLORS.primary}1A`, alignItems: 'center', justifyContent: 'center',
  },
  cardTitle: { fontSize: 17, fontWeight: 'bold', color: isDark ? COLORS.textLight : COLORS.textPrimary },
  cardText: { fontSize: 13, color: isDark ? COLORS.textMuted : COLORS.textSecondary, lineHeight: 20 },
  history: { paddingHorizontal: 22, paddingVertical: 24, gap: 6 },
  historyLabel: { fontSize: 11, fontWeight: 'bold', color: COLORS.primary, letterSpacing: 3, textTransform: 'uppercase' },
  historyTitle: { fontSize: 24, fontWeight: '900', color: isDark ? COLORS.textLight : COLORS.textPrimary },
  historyText: { fontSize: 13, color: isDark ? COLORS.textMuted : COLORS.textSecondary, lineHeight: 21 },
  contact: {
    marginHorizontal: 16, marginTop: 8, padding: 24, borderRadius: 24,
    backgroundColor: isDark ? '#0d1525' : '#f8fafc',
    borderTopWidth: 1, borderTopColor: isDark ? COLORS.borderDark : COLORS.border,
    gap: 12, alignItems: 'center',
  },
  contactTitle: { fontSize: 19, fontWeight: 'bold', color: isDark ? COLORS.textLight : COLORS.textPrimary },
  contactBtn: {
    width: '100%', padding: 16, borderRadius: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 6, elevation: 3,
  },
  contactBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  copy: { fontSize: 11, color: COLORS.textMuted, marginTop: 8 },
});
