import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { isLightColor } from '../constants/colorPalette';
import { useTheme, colors as fallbackColors } from '../theme';
import ColorFill from './ColorFill';

function ensureHex(value, fallback = '#22C55E') {
  if (value == null || value === '') return fallback;
  let h = String(value).trim();
  if (!h.startsWith('#')) h = `#${h}`;
  if (/^#[0-9a-fA-F]{3}$/.test(h)) {
    h = `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}`;
  }
  if (!/^#[0-9a-fA-F]{6}$/i.test(h)) return fallback;
  return h.toUpperCase();
}

function JerseyNode({
  number,
  primary = fallbackColors.jerseyBronze,
  secondary = null,
  numberColor = '#FFFFFF',
  borderColor = '#111827',
  sleeveColor = null,
  pattern = 'solid',
  size = 46,
  highlight = false,
}) {
  const { colors } = useTheme();
  const bodyColor = ensureHex(primary, fallbackColors.jerseyBronze);
  const sleeveFill = ensureHex(sleeveColor || primary, bodyColor);
  const accent = ensureHex(secondary || borderColor, '#111827');
  const lightShirt = isLightColor(bodyColor);
  const edge = lightShirt ? '#111827' : ensureHex(borderColor, '#D9F99D');
  const ink = lightShirt
    ? '#111827'
    : isLightColor(numberColor)
      ? '#FFFFFF'
      : ensureHex(numberColor, '#FFFFFF');

  const bodyW = size * 0.7;
  const bodyH = size * 0.78;
  const sleeveW = size * 0.28;
  const sleeveH = size * 0.3;

  const renderPattern = () => {
    if (pattern === 'stripes') {
      return (
        <View style={styles.patternLayer} pointerEvents="none">
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={[
                styles.vStripe,
                {
                  left: `${12 + i * 22}%`,
                  backgroundColor: accent,
                  opacity: 0.75,
                },
              ]}
            />
          ))}
        </View>
      );
    }
    if (pattern === 'hoops') {
      return (
        <View style={styles.patternLayer} pointerEvents="none">
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[
                styles.hStripe,
                {
                  top: `${22 + i * 24}%`,
                  backgroundColor: accent,
                  opacity: 0.75,
                },
              ]}
            />
          ))}
        </View>
      );
    }
    if (pattern === 'sash') {
      return (
        <View style={styles.patternLayer} pointerEvents="none">
          <View style={[styles.sash, { backgroundColor: accent, opacity: 0.8 }]} />
        </View>
      );
    }
    if (pattern === 'shoulders') {
      return (
        <View style={styles.patternLayer} pointerEvents="none">
          <View style={[styles.shoulderBand, { backgroundColor: accent }]} />
        </View>
      );
    }
    return null;
  };

  return (
    <View
      style={[styles.wrap, { width: size, height: size * 1.12 }]}
      collapsable={false}
    >
      {highlight ? (
        <View
          style={[
            styles.glowRing,
            {
              width: size + 10,
              height: size + 10,
              borderRadius: (size + 10) / 2,
              borderColor: colors.accentBright,
            },
          ]}
        />
      ) : null}

      <ColorFill
        color={sleeveFill}
        borderRadius={6}
        borderColor={edge}
        borderWidth={1.5}
        style={[
          styles.sleeve,
          styles.sleeveL,
          { width: sleeveW, height: sleeveH, top: size * 0.14 },
        ]}
      />
      <ColorFill
        color={sleeveFill}
        borderRadius={6}
        borderColor={edge}
        borderWidth={1.5}
        style={[
          styles.sleeve,
          styles.sleeveR,
          { width: sleeveW, height: sleeveH, top: size * 0.14 },
        ]}
      />

      <ColorFill
        color={bodyColor}
        borderRadius={10}
        borderColor={edge}
        borderWidth={2}
        style={[
          styles.body,
          { width: bodyW, height: bodyH, marginTop: size * 0.12 },
        ]}
      >
        {renderPattern()}
        <View style={[styles.collar, { borderBottomColor: edge }]} />
        <Text style={[styles.number, { color: ink, fontSize: size * 0.32 }]}>
          {number ?? '-'}
        </Text>
      </ColorFill>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  glowRing: {
    position: 'absolute',
    borderWidth: 2,
    top: -2,
    opacity: 0.85,
  },
  sleeve: { position: 'absolute', zIndex: 0 },
  sleeveL: { left: 0, transform: [{ rotate: '-28deg' }] },
  sleeveR: { right: 0, transform: [{ rotate: '28deg' }] },
  body: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  patternLayer: { ...StyleSheet.absoluteFillObject },
  vStripe: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '12%',
  },
  hStripe: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: '14%',
  },
  sash: {
    position: 'absolute',
    width: '160%',
    height: '22%',
    top: '38%',
    left: '-30%',
    transform: [{ rotate: '-32deg' }],
  },
  shoulderBand: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '28%',
    opacity: 0.85,
  },
  collar: {
    position: 'absolute',
    top: -1,
    width: 0,
    height: 0,
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    zIndex: 3,
  },
  number: { fontWeight: '900', zIndex: 4 },
});

export default memo(JerseyNode);
