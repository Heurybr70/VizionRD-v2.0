import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';

import COLORS from '@shared/constants/colors';
import { useTheme } from '../context/ThemeContext';
import { getSiteContent } from '../services/firestore.service';
import {
  normalizeAboutContent,
  normalizeContactInfo,
  normalizeSocialLinks,
} from '../services/content.service';
import { openWhatsApp } from '../services/whatsapp.service';
import AppHeader from '../components/common/AppHeader';
import AnimatedEntrance from '../components/common/AnimatedEntrance';

const HERO_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBG_n8qm28Rxko2nHur6YMs8t-xOup-BPnWsJsPCq59PDDsEyD4dVArIu6LHTK7UZbFCV4SLI9Y_4X0M_hchng_XhWC9iBAEb_zujl7PH1RG_71wBgQdWphE7qoVkurX8gRRXTIBno2oaV7sQlVEj0GCfwoKJjEOvdL6ZqfV1BRb-iTkOgWoh1-hZWb6inYFJ7jEVeA0asdCV6Vdo9lWZSRSlTPFstDxgaTWn1U-korMyaou579OZZd9dA0XvmcBrj80RTE0EJFk-Un';

export default function AboutScreen() {
  const navigation = useNavigation();
  const { isDark } = useTheme();
  const styles = useMemo(() => createStyles(isDark), [isDark]);

  const { data: aboutDoc } = useQuery({
    queryKey: ['site_content', 'about_us', 'mobile-about'],
    queryFn: () => getSiteContent('about_us'),
  });

  const { data: contactDoc } = useQuery({
    queryKey: ['site_content', 'contact_info', 'mobile-about'],
    queryFn: () => getSiteContent('contact_info'),
  });

  const { data: socialDoc } = useQuery({
    queryKey: ['site_content', 'social_links', 'mobile-about'],
    queryFn: () => getSiteContent('social_links'),
  });

  const about = normalizeAboutContent(aboutDoc?.data);
  const contact = normalizeContactInfo(contactDoc?.data);
  const social = normalizeSocialLinks(socialDoc?.data || contactDoc?.data?.content?.socials);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader
        isDark={isDark}
        title="Nosotros"
        subtitle="Detras de Vizion RD"
        onLeftPress={() => navigation.goBack()}
        rightContent={(
          <TouchableOpacity style={styles.headerAction} onPress={() => navigation.navigate('Contact')} activeOpacity={0.9}>
            <Ionicons name="mail-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AnimatedEntrance delay={35}>
          <View style={styles.heroWrap}>
            <ImageBackground source={{ uri: HERO_IMAGE }} style={styles.hero} imageStyle={styles.heroImage}>
              <View style={styles.heroOverlay} />
              <View style={styles.heroContent}>
                <Text style={styles.heroBadge}>Vizion RD</Text>
                <Text style={styles.heroTitle}>{about.title}</Text>
                <Text style={styles.heroSubtitle}>{about.description}</Text>
              </View>
            </ImageBackground>
          </View>
        </AnimatedEntrance>

        <AnimatedEntrance delay={75} style={styles.dualCard}>
          <View style={styles.infoBlock}>
            <Text style={styles.blockLabel}>Mision</Text>
            <Text style={styles.blockText}>{about.mission}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.blockLabel}>Vision</Text>
            <Text style={styles.blockText}>{about.vision}</Text>
          </View>
        </AnimatedEntrance>

        <AnimatedEntrance delay={110} style={styles.storyCard}>
          <Text style={styles.cardTitle}>Nuestra historia</Text>
          <Text style={styles.cardText}>{about.history}</Text>
        </AnimatedEntrance>

        <AnimatedEntrance delay={140} style={styles.contactCard}>
          <Text style={styles.cardTitle}>Contacto directo</Text>
          <Text style={styles.contactLine}>{contact.phone}</Text>
          <Text style={styles.contactLine}>{contact.email}</Text>
          <Text style={styles.cardMuted}>{contact.address}</Text>
          <Text style={styles.cardMuted}>{contact.hours}</Text>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.whatsAppButton]}
              onPress={() => openWhatsApp(contact.whatsapp, 'Hola VizionRD, me gustaria recibir mas informacion.')}
              activeOpacity={0.92}
            >
              <Ionicons name="logo-whatsapp" size={18} color="#fff" />
              <Text style={styles.actionText}>WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.mailButton]}
              onPress={() => navigation.navigate('Contact')}
              activeOpacity={0.92}
            >
              <Ionicons name="mail-outline" size={18} color="#fff" />
              <Text style={styles.actionText}>Formulario</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.socialButton]}
              onPress={() => Linking.openURL(social.instagram || social.facebook)}
              activeOpacity={0.92}
            >
              <Ionicons name="share-social-outline" size={18} color="#fff" />
              <Text style={styles.actionText}>Redes</Text>
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
    headerAction: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : COLORS.backgroundLight,
    },
    content: {
      padding: 16,
      gap: 14,
      paddingBottom: 36,
    },
    heroWrap: {
      borderRadius: 30,
      overflow: 'hidden',
    },
    hero: {
      minHeight: 290,
      justifyContent: 'flex-end',
    },
    heroImage: {
      borderRadius: 30,
    },
    heroOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(17, 82, 212, 0.58)',
    },
    heroContent: {
      padding: 24,
      gap: 10,
    },
    heroBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      color: '#fff',
      backgroundColor: 'rgba(255,255,255,0.16)',
    },
    heroTitle: {
      fontSize: 30,
      lineHeight: 36,
      fontWeight: '900',
      color: '#fff',
    },
    heroSubtitle: {
      fontSize: 14,
      lineHeight: 22,
      color: '#e2e8f0',
      maxWidth: '88%',
    },
    dualCard: {
      gap: 12,
    },
    infoBlock: {
      padding: 20,
      gap: 8,
      borderRadius: 28,
      borderWidth: 1,
      borderColor: isDark ? COLORS.borderDark : COLORS.border,
      backgroundColor: isDark ? 'rgba(26, 34, 53, 0.94)' : 'rgba(255,255,255,0.98)',
    },
    blockLabel: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      color: COLORS.primary,
    },
    blockText: {
      fontSize: 14,
      lineHeight: 22,
      color: isDark ? COLORS.textLight : COLORS.textPrimary,
    },
    storyCard: {
      padding: 22,
      gap: 10,
      borderRadius: 30,
      borderWidth: 1,
      borderColor: isDark ? COLORS.borderDark : COLORS.border,
      backgroundColor: isDark ? 'rgba(26, 34, 53, 0.94)' : 'rgba(255,255,255,0.98)',
    },
    cardTitle: {
      fontSize: 22,
      fontWeight: '900',
      color: isDark ? COLORS.textLight : COLORS.textPrimary,
    },
    cardText: {
      fontSize: 14,
      lineHeight: 23,
      color: isDark ? COLORS.textMuted : COLORS.textSecondary,
    },
    contactCard: {
      padding: 22,
      gap: 8,
      borderRadius: 30,
      borderWidth: 1,
      borderColor: isDark ? COLORS.borderDark : COLORS.border,
      backgroundColor: isDark ? 'rgba(26, 34, 53, 0.94)' : 'rgba(255,255,255,0.98)',
    },
    contactLine: {
      fontSize: 14,
      lineHeight: 21,
      color: isDark ? COLORS.textLight : COLORS.textPrimary,
    },
    cardMuted: {
      fontSize: 13,
      lineHeight: 20,
      color: isDark ? COLORS.textMuted : COLORS.textSecondary,
    },
    actions: {
      gap: 10,
      marginTop: 10,
    },
    actionButton: {
      minHeight: 52,
      borderRadius: 18,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    whatsAppButton: {
      backgroundColor: COLORS.whatsapp,
    },
    mailButton: {
      backgroundColor: '#E1306C',
    },
    socialButton: {
      backgroundColor: '#111827',
    },
    actionText: {
      color: '#fff',
      fontWeight: '800',
      fontSize: 15,
    },
  });
