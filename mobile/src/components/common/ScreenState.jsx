import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '@shared/constants/colors';

export default function ScreenState({
  isDark = false,
  icon = 'alert-circle-outline',
  title,
  description,
  actionLabel,
  onAction,
}) {
  const styles = useMemo(() => createStyles(isDark), [isDark]);

  return (
    <View style={styles.outer}>
      <View style={styles.card}>
        <View style={styles.iconShell}>
          <View style={styles.iconWrap}>
            <Ionicons name={icon} size={30} color={COLORS.primary} />
          </View>
        </View>

        <Text style={styles.title}>{title}</Text>
        {!!description && <Text style={styles.description}>{description}</Text>}

        {!!actionLabel && !!onAction && (
          <TouchableOpacity style={styles.action} onPress={onAction} activeOpacity={0.9}>
            <Text style={styles.actionText}>{actionLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const createStyles = (isDark) =>
  StyleSheet.create({
    outer: {
      width: '100%',
      paddingHorizontal: 16,
      paddingVertical: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    card: {
      width: '100%',
      maxWidth: 480,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
      paddingVertical: 28,
      gap: 12,
      borderRadius: 28,
      borderWidth: 1,
      borderColor: isDark ? COLORS.borderDark : COLORS.border,
      backgroundColor: isDark ? 'rgba(26, 34, 53, 0.92)' : 'rgba(255,255,255,0.96)',
    },
    iconShell: {
      width: 82,
      height: 82,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? 'rgba(37, 99, 235, 0.18)' : 'rgba(37, 99, 235, 0.1)',
    },
    iconWrap: {
      width: 62,
      height: 62,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? COLORS.surfaceDark : COLORS.surface,
    },
    title: {
      fontSize: 21,
      lineHeight: 27,
      fontWeight: '800',
      textAlign: 'center',
      color: isDark ? COLORS.textLight : COLORS.textPrimary,
    },
    description: {
      fontSize: 14,
      lineHeight: 22,
      textAlign: 'center',
      color: isDark ? COLORS.textMuted : COLORS.textSecondary,
    },
    action: {
      marginTop: 8,
      minWidth: 168,
      borderRadius: 16,
      paddingHorizontal: 22,
      paddingVertical: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: COLORS.primary,
    },
    actionText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '800',
    },
  });
