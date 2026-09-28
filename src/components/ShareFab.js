import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ShareIcon } from './NavIcons';
import { useTheme } from '../theme';

/** Daha sade FAB — tek soft pulse (GPU dostu) */
export default function ShareFab({
  onPress,
  disabled = false,
  label = 'Paylaş',
  inline = false,
}) {
  const { colors } = useTheme();
  const pulse = useRef(new Animated.Value(0)).current;
  const press = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (disabled) {
      pulse.setValue(0);
      return undefined;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [disabled, pulse]);

  const glowScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });
  const glowOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.22, 0.04],
  });

  return (
    <View
      style={[styles.wrap, inline && styles.wrapInline]}
      pointerEvents="box-none"
    >
      <Animated.View
        style={[
          styles.glow,
          {
            backgroundColor: colors.accent,
            opacity: glowOpacity,
            transform: [{ scale: glowScale }],
          },
        ]}
      />
      <Animated.View style={{ transform: [{ scale: press }] }}>
        <TouchableOpacity
          style={[
            styles.btn,
            {
              backgroundColor: colors.accent,
              shadowColor: colors.accentGlow,
            },
            disabled && styles.btnDisabled,
          ]}
          activeOpacity={0.9}
          onPressIn={() =>
            Animated.spring(press, {
              toValue: 0.94,
              friction: 6,
              tension: 120,
              useNativeDriver: true,
            }).start()
          }
          onPressOut={() =>
            Animated.spring(press, {
              toValue: 1,
              friction: 5,
              tension: 100,
              useNativeDriver: true,
            }).start()
          }
          onPress={onPress}
          disabled={disabled}
        >
          <ShareIcon color="#fff" size={15} />
          <Text style={styles.label}>{disabled ? '...' : label}</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    right: 18,
    bottom: 14,
    zIndex: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrapInline: {
    position: 'relative',
    right: undefined,
    bottom: undefined,
    alignSelf: 'flex-end',
    marginRight: 14,
    marginTop: 6,
    marginBottom: 2,
  },
  glow: {
    position: 'absolute',
    width: 96,
    height: 46,
    borderRadius: 24,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    shadowOpacity: 0.55,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  btnDisabled: { opacity: 0.55 },
  label: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 0.4,
  },
});
