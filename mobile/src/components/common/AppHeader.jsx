import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '@shared/constants/colors';

export default function AppHeader({
  isDark = false,
  title,
  subtitle,
  leftIcon = 'arrow-back',
  onLeftPress,
  rightIcon,
  onRightPress,
  rightContent,
}) {
  const styles = useMemo(() => createStyles(isDark), [isDark]);

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconButton}
          disabled={!onLeftPress}
          onPress={onLeftPress}
        >
          {onLeftPress ? (
            <Ionicons name={leftIcon} size={22} color={isDark ? COLORS.textLight : COLORS.textPrimary} />
          ) : (
            <View style={styles.placeholder} />
          )}
        </TouchableOpacity>

        <View style={styles.titleBlock}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {!!subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
        </View>

        <View style={styles.rightSlot}>
          {rightContent || (rightIcon && onRightPress ? (
            <TouchableOpacity style={styles.iconButtonInner} onPress={onRightPress}>
              <Ionicons name={rightIcon} size={22} color={isDark ? COLORS.textLight : COLORS.textPrimary} />
            </TouchableOpacity>
          ) : (
            <View style={styles.placeholder} />
          ))}
        </View>
      </View>
    </View>
  );
}

const createStyles = (isDark) =>
  StyleSheet.create({
    wrap: {
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 8,
      backgroundColor: isDark ? COLORS.backgroundDark : COLORS.backgroundLight,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 10,
      paddingVertical: 10,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: isDark ? COLORS.borderDark : COLORS.border,
      backgroundColor: isDark ? 'rgba(26, 34, 53, 0.92)' : 'rgba(255,255,255,0.94)',
    },
    titleBlock: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
    },
    title: {
      fontSize: 17,
      fontWeight: '800',
      color: isDark ? COLORS.textLight : COLORS.textPrimary,
    },
    subtitle: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      color: isDark ? COLORS.textMuted : COLORS.textSecondary,
    },
    iconButton: {
      width: 42,
      height: 42,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rightSlot: {
      minWidth: 42,
      minHeight: 42,
      alignItems: 'flex-end',
      justifyContent: 'center',
    },
    iconButtonInner: {
      width: 42,
      height: 42,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 14,
      backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : COLORS.backgroundLight,
    },
    placeholder: {
      width: 22,
      height: 22,
    },
  });
