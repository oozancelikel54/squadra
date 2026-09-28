import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useThemedStyles, motion } from '../theme';

/** Ortak ekran başlığı */
export default function ScreenHeader({
  title,
  subtitle,
  right = null,
  eyebrow = null,
}) {
  const styles = useThemedStyles(createStyles);
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    fade.setValue(0);
    slide.setValue(8);
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 320,
        useNativeDriver: true,
      }),
      Animated.spring(slide, {
        toValue: 0,
        ...motion.softSpring,
        useNativeDriver: true,
      }),
    ]).start();
  }, [title, subtitle, fade, slide]);

  return (
    <Animated.View
      style={[
        styles.wrap,
        { opacity: fade, transform: [{ translateY: slide }] },
      ]}
    >
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <View style={styles.row}>
        <View style={styles.textCol}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {right}
      </View>
    </Animated.View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    wrap: {
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      marginBottom: 2,
    },
    eyebrow: {
      fontSize: 11,
      fontWeight: '800',
      color: colors.accentBright,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      marginBottom: 4,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },
    textCol: { flex: 1 },
    title: {
      fontSize: 26,
      fontWeight: '900',
      color: colors.text,
      letterSpacing: 0.2,
    },
    subtitle: {
      marginTop: 5,
      fontSize: 13,
      color: colors.textDim,
      fontWeight: '600',
      lineHeight: 18,
    },
  });
}
