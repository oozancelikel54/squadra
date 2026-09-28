import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  View,
  Text,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useI18n } from '../i18n/LanguageContext';
import { useTheme, spacing, motion } from '../theme';
import {
  FieldIcon,
  PlayerAddIcon,
  SettingsIcon,
  ShirtIcon,
  TeamIcon,
} from './NavIcons';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const TAB_DEFS = [
  { id: 'shirt', labelKey: 'nav.shirt', Icon: ShirtIcon },
  { id: 'menu', labelKey: 'nav.team', Icon: TeamIcon },
  { id: 'pitch', labelKey: 'nav.pitch', Icon: FieldIcon },
  { id: 'players', labelKey: 'nav.players', Icon: PlayerAddIcon },
  { id: 'settings', labelKey: 'nav.settings', Icon: SettingsIcon },
];

function TabItem({ tab, active, onPress, colors }) {
  const Icon = tab.Icon;
  const scale = useRef(new Animated.Value(active ? 1 : 0.92)).current;
  const glow = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: active ? 1 : 0.92,
        ...motion.spring,
        useNativeDriver: true,
      }),
      Animated.timing(glow, {
        toValue: active ? 1 : 0,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [active, scale, glow]);

  const color = active ? colors.navTextActive : colors.navText;

  return (
    <Pressable
      style={styles.tabItem}
      onPress={() => {
        LayoutAnimation.configureNext(
          LayoutAnimation.create(220, 'easeInEaseOut', 'opacity')
        );
        onPress?.(tab.id);
      }}
      android_ripple={{ color: 'rgba(255,255,255,0.08)', borderless: true }}
    >
      <Animated.View
        style={[
          styles.indicator,
          {
            backgroundColor: colors.limeSoft,
            opacity: glow,
            transform: [
              {
                scaleX: glow.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.35, 1],
                }),
              },
            ],
          },
        ]}
      />
      <Animated.View style={{ transform: [{ scale }] }}>
        <Icon color={color} size={tab.id === 'pitch' ? 23 : 20} />
      </Animated.View>
      <Text
        style={[
          styles.tabLabel,
          { color: colors.navText },
          active && { color: colors.navTextActive },
        ]}
      >
        {tab.label}
      </Text>
    </Pressable>
  );
}

export default function BottomNav({ onTabPress, activeTab = 'pitch' }) {
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const { colors } = useTheme();
  const tabs = useMemo(
    () => TAB_DEFS.map((tab) => ({ ...tab, label: t(tab.labelKey) })),
    [t]
  );

  return (
    <View
      style={[
        styles.wrapper,
        {
          backgroundColor: colors.nav,
          borderTopColor: colors.navBorder,
          paddingBottom: Math.max(insets.bottom, spacing.navBottom),
        },
      ]}
    >
      <View style={styles.bar}>
        {tabs.map((tab) => (
          <TabItem
            key={tab.id}
            tab={tab}
            active={activeTab === tab.id}
            onPress={onTabPress}
            colors={colors}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderTopWidth: 1,
  },
  bar: {
    height: spacing.navHeight,
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingHorizontal: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingTop: 10,
  },
  indicator: {
    position: 'absolute',
    top: 0,
    width: 28,
    height: 3,
    borderRadius: 999,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
});
