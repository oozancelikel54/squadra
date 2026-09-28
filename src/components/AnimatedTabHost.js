import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { motion } from '../theme';

/**
 * Saha her zaman mount’ta kalır (paylaşım / drag state).
 * Diğer sekmeler: soft fade + hafif yükselme ile girer.
 */
export default function AnimatedTabHost({ activeTab, pitch, screens }) {
  const isPitch = activeTab === 'pitch';
  const fade = useRef(new Animated.Value(1)).current;
  const lift = useRef(new Animated.Value(0)).current;
  const prevTab = useRef(activeTab);

  useEffect(() => {
    if (prevTab.current === activeTab) return;
    prevTab.current = activeTab;

    if (activeTab === 'pitch') {
      fade.setValue(1);
      lift.setValue(0);
      return;
    }

    fade.setValue(0);
    lift.setValue(14);
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: motion.tabMs,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(lift, {
        toValue: 0,
        ...motion.softSpring,
        useNativeDriver: true,
      }),
    ]).start();
  }, [activeTab, fade, lift]);

  return (
    <View style={styles.root}>
      <View
        style={[styles.layer, !isPitch && styles.off]}
        pointerEvents={isPitch ? 'auto' : 'none'}
        removeClippedSubviews={!isPitch}
      >
        {pitch}
      </View>

      {!isPitch ? (
        <Animated.View
          style={[
            styles.layer,
            {
              opacity: fade,
              transform: [{ translateY: lift }],
            },
          ]}
        >
          {screens[activeTab] || null}
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden' },
  layer: { ...StyleSheet.absoluteFillObject },
  off: { opacity: 0 },
});
