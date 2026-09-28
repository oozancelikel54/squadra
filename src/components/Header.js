import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, Animated, View } from 'react-native';
import { useI18n } from '../i18n/LanguageContext';
import { useThemedStyles, motion } from '../theme';

export default function Header({
  teamName = '...',
  managerName = '...',
  vsMode = false,
  awayTeamName = null,
}) {
  const { t } = useI18n();
  const styles = useThemedStyles(createStyles);
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(-10)).current;
  const scale = useRef(new Animated.Value(0.97)).current;

  useEffect(() => {
    fade.setValue(0);
    slide.setValue(-10);
    scale.setValue(0.97);
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 360,
        useNativeDriver: true,
      }),
      Animated.spring(slide, {
        toValue: 0,
        ...motion.softSpring,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        ...motion.spring,
        useNativeDriver: true,
      }),
    ]).start();
  }, [teamName, managerName, vsMode, awayTeamName, fade, slide, scale]);

  const animStyle = {
    opacity: fade,
    transform: [{ translateY: slide }, { scale }],
  };

  if (vsMode && awayTeamName) {
    return (
      <Animated.View style={[styles.header, styles.headerVs, animStyle]}>
        <View style={styles.vsCol}>
          <Text style={styles.vsName} numberOfLines={1}>
            {teamName}
          </Text>
          <Text style={styles.vsSide}>{t('common.us')}</Text>
        </View>
        <View style={styles.vsMid}>
          <Text style={styles.vsLabel}>{t('common.vs')}</Text>
        </View>
        <View style={[styles.vsCol, styles.vsColRight]}>
          <Text style={styles.vsName} numberOfLines={1}>
            {awayTeamName}
          </Text>
          <Text style={styles.vsSide}>{t('common.opponent')}</Text>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.header, animStyle]}>
      <Text style={styles.teamTitle}>{teamName}</Text>
      <Text style={styles.managerTitle}>
        {managerName || t('common.coach')}
      </Text>
    </Animated.View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    header: {
      backgroundColor: 'transparent',
      alignItems: 'center',
      paddingTop: 10,
      paddingBottom: 6,
      paddingHorizontal: 16,
    },
    headerVs: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 48,
      paddingRight: 56,
    },
    teamTitle: {
      fontSize: 24,
      fontWeight: '900',
      color: colors.text,
      letterSpacing: 0.3,
    },
    managerTitle: {
      marginTop: 4,
      fontSize: 13,
      color: colors.textMuted,
      fontWeight: '600',
    },
    vsCol: { flex: 1, minWidth: 0 },
    vsColRight: { alignItems: 'flex-end' },
    vsName: {
      fontSize: 15,
      fontWeight: '900',
      color: colors.text,
    },
    vsSide: {
      marginTop: 2,
      fontSize: 11,
      fontWeight: '700',
      color: colors.textDim,
    },
    vsMid: {
      paddingHorizontal: 10,
    },
    vsLabel: {
      fontSize: 14,
      fontWeight: '900',
      color: colors.accentBright,
      letterSpacing: 1.4,
    },
  });
}
