import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useTheme, useThemedStyles } from '../theme';
import { isLightColor, QUICK_COLORS } from '../constants/colorPalette';
import ColorFill from './ColorFill';

function clampByte(n) {
  return Math.max(0, Math.min(255, Math.round(Number(n) || 0)));
}

function hexToRgb(hex) {
  const raw = String(hex || '')
    .replace('#', '')
    .trim();
  const full =
    raw.length === 3
      ? raw
          .split('')
          .map((c) => c + c)
          .join('')
      : raw;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return { r: 34, g: 197, b: 94 };
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

function rgbToHex(r, g, b) {
  const to = (n) => clampByte(n).toString(16).padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`;
}

function Stepper({ label, value, onChange }) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.stepper}>
      <Text style={styles.stepLabel}>{label}</Text>
      <View style={styles.stepControls}>
        <TouchableOpacity
          style={styles.stepBtn}
          onPress={() => onChange(clampByte(value - 8))}
        >
          <Text style={styles.stepBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.stepValue}>{value}</Text>
        <TouchableOpacity
          style={styles.stepBtn}
          onPress={() => onChange(clampByte(value + 8))}
        >
          <Text style={styles.stepBtnText}>+</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.barTrack}>
        <View
          style={[
            styles.barFill,
            {
              width: `${(value / 255) * 100}%`,
              backgroundColor:
                label === 'R' ? '#ef4444' : label === 'G' ? '#22c55e' : '#3b82f6',
            },
          ]}
        />
      </View>
    </View>
  );
}

/**
 * Özel renk seçici — hex + RGB adımları.
 */
export default function CustomColorModal({
  visible = false,
  initialColor = '#22C55E',
  title = 'Özel Renk',
  onClose,
  onConfirm,
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const start = useMemo(() => hexToRgb(initialColor), [initialColor]);
  const [r, setR] = useState(start.r);
  const [g, setG] = useState(start.g);
  const [b, setB] = useState(start.b);
  const [hexInput, setHexInput] = useState(
    String(initialColor || '#22C55E').replace('#', '')
  );

  useEffect(() => {
    if (!visible) return;
    const rgb = hexToRgb(initialColor);
    setR(rgb.r);
    setG(rgb.g);
    setB(rgb.b);
    setHexInput(rgbToHex(rgb.r, rgb.g, rgb.b).replace('#', ''));
  }, [visible, initialColor]);

  const hex = rgbToHex(r, g, b);

  const applyHexInput = (raw) => {
    const cleaned = raw.replace(/[^0-9a-fA-F]/g, '').slice(0, 6);
    setHexInput(cleaned);
    if (cleaned.length === 6) {
      const rgb = hexToRgb(`#${cleaned}`);
      setR(rgb.r);
      setG(rgb.g);
      setB(rgb.b);
    }
  };

  const syncFromRgb = (nr, ng, nb) => {
    setR(nr);
    setG(ng);
    setB(nb);
    setHexInput(rgbToHex(nr, ng, nb).replace('#', ''));
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <TouchableOpacity style={styles.dismiss} activeOpacity={1} onPress={onClose} />
        <View style={styles.sheet}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>Hex yaz veya RGB ayarla</Text>

          <ColorFill color={hex} style={styles.preview} borderRadius={14} />
          <Text style={styles.hexLabel}>{hex.toUpperCase()}</Text>

          <Text style={styles.fieldLabel}>HEX</Text>
          <View style={styles.hexRow}>
            <Text style={styles.hash}>#</Text>
            <TextInput
              style={styles.hexInput}
              value={hexInput}
              onChangeText={applyHexInput}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={6}
              placeholder="2B6CFF"
              placeholderTextColor={colors.textDim}
            />
          </View>

          <Stepper label="R" value={r} onChange={(v) => syncFromRgb(v, g, b)} />
          <Stepper label="G" value={g} onChange={(v) => syncFromRgb(r, v, b)} />
          <Stepper label="B" value={b} onChange={(v) => syncFromRgb(r, g, v)} />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickRow}
          >
            {QUICK_COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => {
                    const rgb = hexToRgb(c);
                    syncFromRgb(rgb.r, rgb.g, rgb.b);
                  }}
                  activeOpacity={0.85}
                >
                  <ColorFill
                    color={c}
                    borderRadius={12}
                    borderWidth={isLightColor(c) ? 1 : 0}
                    borderColor="#94A3B8"
                    style={styles.quick}
                  />
                </TouchableOpacity>
              ))}
          </ScrollView>

          <TouchableOpacity
            style={styles.primary}
            onPress={() => onConfirm?.(hex)}
          >
            <Text style={styles.primaryText}>Rengi Uygula</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancel} onPress={onClose}>
            <Text style={styles.cancelText}>İptal</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.72)',
      justifyContent: 'flex-end',
    },
    dismiss: { flex: 1 },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 22,
      borderTopRightRadius: 22,
      padding: 18,
      paddingBottom: 28,
      borderWidth: 1,
      borderColor: colors.border,
    },
    title: { fontSize: 20, fontWeight: '900', color: colors.text },
    subtitle: {
      marginTop: 4,
      marginBottom: 14,
      fontSize: 13,
      color: colors.textMuted,
    },
    preview: {
      height: 64,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    hexLabel: {
      marginTop: 8,
      textAlign: 'center',
      fontWeight: '800',
      color: colors.textMuted,
      letterSpacing: 1,
    },
    fieldLabel: {
      marginTop: 14,
      marginBottom: 6,
      fontSize: 11,
      fontWeight: '800',
      color: colors.textDim,
      textTransform: 'uppercase',
    },
    hexRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.bgElevated,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
    },
    hash: { color: colors.textDim, fontWeight: '900', fontSize: 16 },
    hexInput: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 8,
      color: colors.text,
      fontWeight: '700',
      fontSize: 16,
      letterSpacing: 1,
    },
    stepper: { marginTop: 12 },
    stepLabel: {
      fontSize: 12,
      fontWeight: '800',
      color: colors.textMuted,
      marginBottom: 6,
    },
    stepControls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    stepBtn: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: colors.bgElevated,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepBtnText: { color: colors.text, fontSize: 20, fontWeight: '700' },
    stepValue: {
      width: 44,
      textAlign: 'center',
      color: colors.text,
      fontWeight: '900',
    },
    barTrack: {
      marginTop: 8,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.bgElevated,
      overflow: 'hidden',
    },
    barFill: { height: '100%', borderRadius: 3 },
    quickRow: { gap: 8, paddingVertical: 14 },
    quick: {
      width: 28,
      height: 28,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.15)',
    },
    quickLight: { borderColor: '#94a3b8' },
    primary: {
      backgroundColor: colors.accent,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
    },
    primaryText: { color: '#fff', fontWeight: '900', fontSize: 15 },
    cancel: { marginTop: 10, paddingVertical: 10, alignItems: 'center' },
    cancelText: { color: colors.textMuted, fontWeight: '700' },
  });
}
