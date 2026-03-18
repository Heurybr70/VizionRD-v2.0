import React, { useMemo } from 'react';
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';

import COLORS from '@shared/constants/colors';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import LeadCaptureForm from '../components/forms/LeadCaptureForm';
import AppHeader from '../components/common/AppHeader';
import AnimatedEntrance from '../components/common/AnimatedEntrance';
import { createLeadRequest, REQUEST_TYPES } from '../services/lead.service';
import { getSiteContent, getSiteSettings } from '../services/firestore.service';
import { normalizeContactInfo, normalizeSiteSettings } from '../services/content.service';
import ScreenState from '../components/common/ScreenState';
import { openWhatsApp } from '../services/whatsapp.service';

export default function ContactScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { isDark } = useTheme();
  const { user } = useAuth();
  const styles = useMemo(() => createStyles(isDark), [isDark]);

  const params = route.params || {};

  const { data: contactDoc } = useQuery({
    queryKey: ['site_content', 'contact_info', 'mobile'],
    queryFn: () => getSiteContent('contact_info'),
  });

  const { data: settingsDoc } = useQuery({
    queryKey: ['site_settings', 'mobile'],
    queryFn: () => getSiteSettings(),
  });

  const contactInfo = normalizeContactInfo(contactDoc?.data);
  const settings = normalizeSiteSettings(settingsDoc?.data);

  const initialValues = {
    name: user?.displayName || '',
    email: user?.email || '',
    subject: params.subject || 'Consulta desde la app mobile',
    message: params.message || '',
  };

  const handleSubmit = async (values) => {
    const result = await createLeadRequest({
      ...values,
      source: params.source || 'mobile_contact',
      requestType: params.requestType || REQUEST_TYPES.CONTACT,
      productId: params.productId || null,
      referenceName: params.referenceName || null,
      userId: user?.uid || null,
    });

    if (!result.success) {
      throw new Error(result.error || 'No se pudo enviar tu solicitud.');
    }

    Toast.show({
      type: 'success',
      text1: 'Solicitud enviada',
      text2: 'La recibimos correctamente.',
    });

    if (params.openWhatsAppAfterSubmit && settings.whatsappEnabled && contactInfo.whatsapp) {
      await openWhatsApp(contactInfo.whatsapp, params.whatsappMessage || values.message);
    }

    navigation.goBack();
  };

  if (!settings.contactFormEnabled) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenState
          isDark={isDark}
          icon="pause-circle-outline"
          title="Formulario no disponible"
          description="El administrador ha deshabilitado temporalmente el formulario de contacto."
          actionLabel="Abrir WhatsApp"
          onAction={() => openWhatsApp(contactInfo.whatsapp, 'Hola VizionRD, necesito asistencia.')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader
        isDark={isDark}
        title={params.title || 'Contacto'}
        subtitle="Atencion desde mobile"
        onLeftPress={() => navigation.goBack()}
        rightContent={(
          <TouchableOpacity
            style={styles.headerAction}
            onPress={() => openWhatsApp(contactInfo.whatsapp, params.whatsappMessage || 'Hola VizionRD, necesito informacion.')}
            activeOpacity={0.9}
          >
            <Ionicons name="logo-whatsapp" size={20} color={COLORS.whatsapp} />
          </TouchableOpacity>
        )}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AnimatedEntrance delay={35} style={styles.contactCard}>
          <View style={styles.contactHeader}>
            <View style={styles.contactIcon}>
              <Ionicons name="paper-plane-outline" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.contactCopy}>
              <Text style={styles.contactTitle}>Informacion de contacto</Text>
              <Text style={styles.contactText}>Respuesta humana y seguimiento desde el backend.</Text>
            </View>
          </View>

          <Text style={styles.contactLine}>{contactInfo.phone}</Text>
          <Text style={styles.contactLine}>{contactInfo.email}</Text>
          <Text style={styles.contactMuted}>{contactInfo.address}</Text>
          <Text style={styles.contactMuted}>{contactInfo.hours}</Text>
        </AnimatedEntrance>

        <AnimatedEntrance delay={85}>
          <LeadCaptureForm
            isDark={isDark}
            initialValues={initialValues}
            formTitle={params.formTitle || 'Cuentanos que necesitas'}
            helperText={params.helperText || 'Tu mensaje se guardara en el backend y quedara disponible para seguimiento.'}
            submitLabel={params.submitLabel || 'Enviar solicitud'}
            onSubmit={handleSubmit}
          />
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
    contactCard: {
      padding: 20,
      gap: 8,
      borderRadius: 28,
      borderWidth: 1,
      borderColor: isDark ? COLORS.borderDark : COLORS.border,
      backgroundColor: isDark ? 'rgba(26, 34, 53, 0.94)' : 'rgba(255,255,255,0.98)',
    },
    contactHeader: {
      flexDirection: 'row',
      gap: 14,
      marginBottom: 4,
    },
    contactIcon: {
      width: 46,
      height: 46,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? 'rgba(37, 99, 235, 0.18)' : 'rgba(37, 99, 235, 0.1)',
    },
    contactCopy: {
      flex: 1,
      gap: 4,
    },
    contactTitle: {
      fontSize: 20,
      fontWeight: '900',
      color: isDark ? COLORS.textLight : COLORS.textPrimary,
    },
    contactText: {
      fontSize: 13,
      lineHeight: 20,
      color: isDark ? COLORS.textMuted : COLORS.textSecondary,
    },
    contactLine: {
      fontSize: 14,
      lineHeight: 21,
      color: isDark ? COLORS.textLight : COLORS.textPrimary,
    },
    contactMuted: {
      fontSize: 13,
      lineHeight: 20,
      color: isDark ? COLORS.textMuted : COLORS.textSecondary,
    },
  });
