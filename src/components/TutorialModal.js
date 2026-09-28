import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  StatusBar,
  Animated,
  Easing,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useI18n } from '../i18n/LanguageContext';
import { useTheme, useThemedStyles, motion } from '../theme';
import { APP_HASHTAG } from '../constants/appBrand';

const SLIDE_KEYS = [
  { mark: '01', title: 'tutorial.s1.title', body: 'tutorial.s1.body' },
  { mark: '02', title: 'tutorial.s2.title', body: 'tutorial.s2.body' },
  { mark: '03', title: 'tutorial.s3.title', body: 'tutorial.s3.body' },
  { mark: '04', title: 'tutorial.s4.title', body: 'tutorial.s4.body' },
  { mark: '05', title: 'tutorial.s5.title', body: 'tutorial.s5.body' },
];

export default function TutorialModal({ visible, onClose }) {
  const { t } = useI18n();
  const { colors, isDark } = useTheme();
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [pageWidth, setPageWidth] = useState(Dimensions.get('window').width);
  const enter = useRef(new Animated.Value(0)).current;
  const last = index >= SLIDE_KEYS.length - 1;

  useEffect(() => {
    if (visible) {
      setIndex(0);
      enter.setValue(0);
      Animated.timing(enter, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ x: 0, animated: false });
      });
    }
  }, [visible, enter]);

  const goTo = useCallback(
    (next) => {
      const clamped = Math.max(0, Math.min(SLIDE_KEYS.length - 1, next));
      setIndex(clamped);
      scrollRef.current?.scrollTo({ x: clamped * pageWidth, animated: true });
    },
    [pageWidth]
  );

  const handleSkip = () => onClose?.();
  const handleNext = () => {
    if (last) onClose?.();
    else goTo(index + 1);
  };

  const onMomentumEnd = (e) => {
    const x = e.nativeEvent.contentOffset.x;
    const next = Math.round(x / pageWidth);
    setIndex(Math.max(0, Math.min(SLIDE_KEYS.length - 1, next)));
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={handleSkip}
      statusBarTranslucent
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.bg}
      />
      <Animated.View
        style={[
          styles.root,
          {
            paddingTop: Math.max(insets.top, 16),
            paddingBottom: Math.max(insets.bottom, 16),
            opacity: enter,
            transform: [
              {
                translateY: enter.interpolate({
                  inputRange: [0, 1],
                  outputRange: [18, 0],
                }),
              },
            ],
          },
        ]}
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          if (w > 0 && Math.abs(w - pageWidth) > 1) setPageWidth(w);
        }}
      >
        <View style={styles.topBar}>
          <Text style={styles.brand}>{APP_HASHTAG}</Text>
          <TouchableOpacity
            onPress={handleSkip}
            hitSlop={12}
            accessibilityRole="button"
          >
            <Text style={styles.skip}>{t('tutorial.skip')}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onMomentumEnd}
          bounces={false}
          style={styles.pager}
        >
          {SLIDE_KEYS.map((slide) => (
            <View key={slide.title} style={[styles.slide, { width: pageWidth }]}>
              <View style={styles.markWrap}>
                <Text style={styles.mark}>{slide.mark}</Text>
              </View>
              <Text style={styles.title}>{t(slide.title)}</Text>
              <Text style={styles.body}>{t(slide.body)}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.dots}>
            {SLIDE_KEYS.map((slide, i) => (
              <AnimatedDot key={slide.title} active={i === index} colors={colors} />
            ))}
          </View>

          <TouchableOpacity
            style={styles.nextBtn}
            onPress={handleNext}
            activeOpacity={0.88}
          >
            <Text style={styles.nextText}>
              {last ? t('tutorial.done') : t('tutorial.next')}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}

function AnimatedDot({ active, colors }) {
  const w = useRef(new Animated.Value(active ? 22 : 8)).current;
  useEffect(() => {
    Animated.spring(w, {
      toValue: active ? 22 : 8,
      ...motion.spring,
      useNativeDriver: false,
    }).start();
  }, [active, w]);
  return (
    <Animated.View
      style={{
        width: w,
        height: 8,
        borderRadius: 4,
        backgroundColor: active ? colors.accent : colors.border,
      }}
    />
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    topBar: {
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    brand: {
      color: colors.accentBright,
      fontSize: 18,
      fontWeight: '900',
      letterSpacing: 1.2,
    },
    skip: {
      color: colors.textMuted,
      fontSize: 14,
      fontWeight: '800',
    },
    pager: { flex: 1 },
    slide: {
      flex: 1,
      paddingHorizontal: 28,
      justifyContent: 'center',
      alignItems: 'center',
    },
    markWrap: {
      width: 88,
      height: 88,
      borderRadius: 28,
      backgroundColor: colors.surfaceSelected,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 28,
    },
    mark: {
      fontSize: 28,
      fontWeight: '900',
      color: colors.accentBright,
      letterSpacing: 1,
    },
    title: {
      color: colors.text,
      fontSize: 26,
      fontWeight: '900',
      textAlign: 'center',
      marginBottom: 14,
      lineHeight: 32,
    },
    body: {
      color: colors.textMuted,
      fontSize: 15,
      fontWeight: '600',
      textAlign: 'center',
      lineHeight: 23,
      maxWidth: 340,
    },
    footer: {
      paddingHorizontal: 20,
      gap: 16,
    },
    dots: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
      alignItems: 'center',
    },
    nextBtn: {
      backgroundColor: colors.accent,
      borderRadius: 16,
      paddingVertical: 16,
      alignItems: 'center',
    },
    nextText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '900',
    },
  });
}
