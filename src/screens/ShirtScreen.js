import React, { memo, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  InteractionManager,
} from 'react-native';
import {
  COLOR_SWATCHES,
  KIT_PATTERNS,
  KIT_PRESETS,
  isLightColor,
  normalizeKit,
  sameHex,
  contrastInk,
} from '../constants/initialData';
import { useSquad } from '../context/SquadContext';
import CustomColorModal from '../components/CustomColorModal';
import ColorFill from '../components/ColorFill';
import JerseyNode from '../components/JerseyNode';
import ScreenHeader from '../components/ScreenHeader';
import { useI18n } from '../i18n/LanguageContext';
import { useThemedStyles } from '../theme';

/** Kompakt palet + özel renk (+) */
const ColorPicker = memo(function ColorPicker({
  label,
  value,
  swatches,
  onSelect,
  onAddCustom,
}) {
  const styles = useThemedStyles(createColorPickerStyles);
  const lightValue = isLightColor(value);

  return (
    <View style={styles.colorBlock}>
      <View style={styles.colorLabelRow}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.currentChip}>
          <View
            style={[
              styles.currentDotView,
              { backgroundColor: value },
              lightValue && styles.swatchInnerLight,
            ]}
          />
          <Text style={styles.currentHex}>
            {String(value || '').toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.swatchGrid}>
        {swatches.map((color) => {
          const active = sameHex(color, value);
          const light = isLightColor(color);
          return (
            <TouchableOpacity
              key={color}
              onPress={() => onSelect(color)}
              activeOpacity={0.85}
              style={[
                styles.swatchOuter,
                light && styles.swatchOuterLight,
                active && styles.swatchOuterActive,
              ]}
            >
              <View
                style={[
                  styles.swatchInner,
                  { backgroundColor: color },
                  light && styles.swatchInnerLight,
                ]}
              />
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity style={styles.addSwatch} onPress={onAddCustom}>
          <Text style={styles.addSwatchText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function ShirtScreen() {
  const { activeTeam, teamName, kit, setKit, setActiveTab } = useSquad();
  const { t } = useI18n();
  const styles = useThemedStyles(createStyles);
  const currentKit = normalizeKit(kit);
  const [editMode, setEditMode] = useState('field');
  const [customTarget, setCustomTarget] = useState(null);
  const [heavyReady, setHeavyReady] = useState(false);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      setHeavyReady(true);
    });
    return () => task.cancel?.();
  }, []);

  const palette = useMemo(() => {
    const custom = currentKit.customSwatches || [];
    const merged = [...custom, ...COLOR_SWATCHES];
    const seen = new Set();
    return merged.filter((c) => {
      const key = String(c).toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [currentKit.customSwatches]);

  if (!activeTeam) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>{t('common.noTeam')}</Text>
        <Text style={styles.emptyText}>{t('shirt.noTeamHint')}</Text>
      </View>
    );
  }

  const applyPreset = (presetId) => setKit({ presetId });

  const patchKit = (partial) => {
    setKit({
      ...currentKit,
      ...partial,
      presetId: 'custom',
      custom: true,
    });
  };

  const rememberCustom = (color) => {
    const next = [
      color,
      ...(currentKit.customSwatches || []).filter(
        (c) => !sameHex(c, color)
      ),
    ].slice(0, 16);
    return next;
  };

  /** Ana renk → kol + (düzdese) desen aynı; açık renkte koyu numara */
  const selectPrimary = (primary) => {
    const ink = contrastInk(primary);
    patchKit({
      primary,
      sleeveColor: primary,
      ...(currentKit.pattern === 'solid' ? { secondary: primary } : {}),
      ...(isLightColor(primary) ? { number: ink, border: ink } : {}),
    });
  };

  const selectGkPrimary = (gkPrimary) => {
    const ink = contrastInk(gkPrimary);
    patchKit({
      gkPrimary,
      gkSleeveColor: gkPrimary,
      ...(currentKit.gkPattern === 'solid' ? { gkSecondary: gkPrimary } : {}),
      ...(isLightColor(gkPrimary) ? { gkNumber: ink, gkBorder: ink } : {}),
    });
  };

  const randomizeKit = () => {
    const pool = COLOR_SWATCHES.filter((c) => !sameHex(c, '#ffffff'));
    const primary = pickRandom(pool);
    const secondary = pickRandom(pool.filter((c) => !sameHex(c, primary)));
    const gkPrimary = pickRandom(pool.filter((c) => !sameHex(c, primary)));
    const pattern = pickRandom(KIT_PATTERNS).id;
    const gkPattern = pickRandom(KIT_PATTERNS).id;
    const number = pickRandom(['#FFFFFF', '#000000', '#FFEB3B']);
    patchKit({
      primary,
      secondary: pattern === 'solid' ? primary : secondary,
      sleeveColor: primary,
      number,
      border: number,
      pattern,
      gkPrimary,
      gkSecondary: gkPattern === 'solid' ? gkPrimary : pickRandom(pool),
      gkSleeveColor: gkPrimary,
      gkNumber: pickRandom(['#FFFFFF', '#000000']),
      gkBorder: '#FFFFFF',
      gkPattern,
    });
  };

  const swapFieldGk = () => {
    patchKit({
      primary: currentKit.gkPrimary,
      secondary: currentKit.gkSecondary,
      sleeveColor: currentKit.gkSleeveColor,
      number: currentKit.gkNumber,
      border: currentKit.gkBorder,
      pattern: currentKit.gkPattern,
      gkPrimary: currentKit.primary,
      gkSecondary: currentKit.secondary,
      gkSleeveColor: currentKit.sleeveColor,
      gkNumber: currentKit.number,
      gkBorder: currentKit.border,
      gkPattern: currentKit.pattern,
    });
  };

  const openCustom = (target) => setCustomTarget(target);

  const applyCustomColor = (color) => {
    if (!customTarget) return;
    const customSwatches = rememberCustom(color);
    if (customTarget === 'primary') {
      const syncSecondary =
        currentKit.pattern === 'solid' ||
        sameHex(currentKit.secondary, currentKit.primary);
      const syncSleeve =
        !currentKit.sleeveColor ||
        sameHex(currentKit.sleeveColor, currentKit.primary);
      patchKit({
        primary: color,
        ...(syncSecondary ? { secondary: color } : {}),
        ...(syncSleeve ? { sleeveColor: color } : {}),
        ...(isLightColor(color)
          ? { number: contrastInk(color), border: contrastInk(color) }
          : {}),
        customSwatches,
      });
    } else if (customTarget === 'gkPrimary') {
      const syncSecondary =
        currentKit.gkPattern === 'solid' ||
        sameHex(currentKit.gkSecondary, currentKit.gkPrimary);
      const syncSleeve =
        !currentKit.gkSleeveColor ||
        sameHex(currentKit.gkSleeveColor, currentKit.gkPrimary);
      patchKit({
        gkPrimary: color,
        ...(syncSecondary ? { gkSecondary: color } : {}),
        ...(syncSleeve ? { gkSleeveColor: color } : {}),
        ...(isLightColor(color)
          ? { gkNumber: contrastInk(color), gkBorder: contrastInk(color) }
          : {}),
        customSwatches,
      });
    } else {
      const map = {
        secondary: { secondary: color },
        sleeveColor: { sleeveColor: color },
        number: { number: color, border: color },
        border: { border: color },
        gkSecondary: { gkSecondary: color },
        gkSleeveColor: { gkSleeveColor: color },
        gkNumber: { gkNumber: color, gkBorder: color },
      };
      patchKit({ ...(map[customTarget] || {}), customSwatches });
    }
    setCustomTarget(null);
  };

  const initialForTarget = {
    primary: currentKit.primary,
    secondary: currentKit.secondary,
    sleeveColor: currentKit.sleeveColor,
    number: currentKit.number,
    border: currentKit.border,
    gkPrimary: currentKit.gkPrimary,
    gkSecondary: currentKit.gkSecondary,
    gkSleeveColor: currentKit.gkSleeveColor,
    gkNumber: currentKit.gkNumber,
  }[customTarget] || currentKit.primary;

  const patternKey = editMode === 'field' ? 'pattern' : 'gkPattern';
  const activePattern =
    editMode === 'field' ? currentKit.pattern : currentKit.gkPattern;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ScreenHeader
        eyebrow={t('shirt.eyebrow')}
        title={t('shirt.title')}
        subtitle={t('shirt.subtitle', { team: teamName })}
      />

      <View style={styles.previewCard}>
        <View style={styles.previewStage}>
          <View style={styles.previewRow}>
            <View style={styles.previewItem}>
              <ColorFill
                color={currentKit.primary}
                borderRadius={8}
                borderWidth={1}
                borderColor={
                  isLightColor(currentKit.primary) ? '#111827' : 'rgba(255,255,255,0.5)'
                }
                style={styles.rawSwatch}
              />
              <JerseyNode
                number={9}
                primary={currentKit.primary}
                secondary={currentKit.secondary}
                sleeveColor={currentKit.sleeveColor}
                numberColor={currentKit.number}
                borderColor={currentKit.border}
                pattern={currentKit.pattern}
                size={78}
              />
              <Text style={styles.previewLabel}>{t('shirt.field')}</Text>
            </View>
            <View style={styles.previewDivider} />
            <View style={styles.previewItem}>
              <ColorFill
                color={currentKit.gkPrimary}
                borderRadius={8}
                borderWidth={1}
                borderColor={
                  isLightColor(currentKit.gkPrimary)
                    ? '#111827'
                    : 'rgba(255,255,255,0.5)'
                }
                style={styles.rawSwatch}
              />
              <JerseyNode
                number={1}
                primary={currentKit.gkPrimary}
                secondary={currentKit.gkSecondary}
                sleeveColor={currentKit.gkSleeveColor}
                numberColor={currentKit.gkNumber}
                borderColor={currentKit.gkBorder}
                pattern={currentKit.gkPattern}
                size={78}
              />
              <Text style={styles.previewLabel}>{t('shirt.gk')}</Text>
            </View>
          </View>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickBtn} onPress={randomizeKit}>
            <Text style={styles.quickBtnText}>{t('shirt.random')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickBtn} onPress={swapFieldGk}>
            <Text style={styles.quickBtnText}>{t('shirt.swap')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.sectionTitle}>{t('shirt.presets')}</Text>
      {heavyReady ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.presetScroll}
        >
          {KIT_PRESETS.map((preset) => {
            const active = currentKit.presetId === preset.id;
            return (
              <TouchableOpacity
                key={preset.id}
                style={[styles.presetCard, active && styles.presetCardActive]}
                onPress={() => applyPreset(preset.id)}
                activeOpacity={0.85}
              >
                <View style={styles.presetShirts}>
                  <JerseyNode
                    number={9}
                    primary={preset.primary}
                    secondary={preset.secondary}
                    sleeveColor={preset.sleeveColor}
                    numberColor={preset.number}
                    borderColor={preset.border}
                    pattern={preset.pattern}
                    size={34}
                  />
                  <JerseyNode
                    number={1}
                    primary={preset.gkPrimary}
                    secondary={preset.gkSecondary}
                    sleeveColor={preset.gkSleeveColor}
                    numberColor={preset.gkNumber}
                    borderColor={preset.gkBorder}
                    pattern={preset.gkPattern}
                    size={34}
                  />
                </View>
                <Text
                  style={[styles.presetName, active && styles.presetNameActive]}
                  numberOfLines={1}
                >
                  {preset.name}
                </Text>
                {active ? <Text style={styles.presetCheck}>✓</Text> : null}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      ) : (
        <Text style={styles.loadingHint}>{t('common.loading')}</Text>
      )}

      <View style={styles.modeTabs}>
        <TouchableOpacity
          style={[styles.modeTab, editMode === 'field' && styles.modeTabActive]}
          onPress={() => setEditMode('field')}
        >
          <Text
            style={[
              styles.modeTabText,
              editMode === 'field' && styles.modeTabTextActive,
            ]}
          >
            {t('shirt.tabField')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeTab, editMode === 'gk' && styles.modeTabActive]}
          onPress={() => setEditMode('gk')}
        >
          <Text
            style={[
              styles.modeTabText,
              editMode === 'gk' && styles.modeTabTextActive,
            ]}
          >
            {t('shirt.tabGk')}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>{t('shirt.pattern')}</Text>
      <View style={styles.patternRow}>
        {KIT_PATTERNS.map((item) => {
          const active = activePattern === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.patternChip, active && styles.patternChipActive]}
              onPress={() => {
                if (item.id === 'solid') {
                  if (editMode === 'field') {
                    patchKit({
                      pattern: 'solid',
                      secondary: currentKit.primary,
                    });
                  } else {
                    patchKit({
                      gkPattern: 'solid',
                      gkSecondary: currentKit.gkPrimary,
                    });
                  }
                } else {
                  patchKit({ [patternKey]: item.id });
                }
              }}
            >
              <Text
                style={[
                  styles.patternText,
                  active && styles.patternTextActive,
                ]}
              >
                {t(`shirt.pattern.${item.id}`)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {heavyReady ? (
        editMode === 'field' ? (
          <>
            <ColorPicker
              label={t('shirt.primary')}
              value={currentKit.primary}
              swatches={palette}
              onSelect={selectPrimary}
              onAddCustom={() => openCustom('primary')}
            />
            <ColorPicker
              label={t('shirt.secondary')}
              value={currentKit.secondary}
              swatches={palette}
              onSelect={(secondary) => patchKit({ secondary })}
              onAddCustom={() => openCustom('secondary')}
            />
            <ColorPicker
              label={t('shirt.sleeve')}
              value={currentKit.sleeveColor}
              swatches={palette}
              onSelect={(sleeveColor) => patchKit({ sleeveColor })}
              onAddCustom={() => openCustom('sleeveColor')}
            />
            <ColorPicker
              label={t('shirt.number')}
              value={currentKit.number}
              swatches={palette}
              onSelect={(number) => patchKit({ number, border: number })}
              onAddCustom={() => openCustom('number')}
            />
          </>
        ) : (
          <>
            <ColorPicker
              label={t('shirt.gkPrimary')}
              value={currentKit.gkPrimary}
              swatches={palette}
              onSelect={selectGkPrimary}
              onAddCustom={() => openCustom('gkPrimary')}
            />
            <ColorPicker
              label={t('shirt.gkSecondary')}
              value={currentKit.gkSecondary}
              swatches={palette}
              onSelect={(gkSecondary) => patchKit({ gkSecondary })}
              onAddCustom={() => openCustom('gkSecondary')}
            />
            <ColorPicker
              label={t('shirt.gkSleeve')}
              value={currentKit.gkSleeveColor}
              swatches={palette}
              onSelect={(gkSleeveColor) => patchKit({ gkSleeveColor })}
              onAddCustom={() => openCustom('gkSleeveColor')}
            />
            <ColorPicker
              label={t('shirt.gkNumber')}
              value={currentKit.gkNumber}
              swatches={palette}
              onSelect={(gkNumber) =>
                patchKit({ gkNumber, gkBorder: gkNumber })
              }
              onAddCustom={() => openCustom('gkNumber')}
            />
          </>
        )
      ) : null}

      {(currentKit.customSwatches || []).length > 0 ? (
        <View style={styles.customSaved}>
          <Text style={styles.sectionTitle}>Kayıtlı özel renkler</Text>
          <View style={styles.swatchRowPad}>
            {currentKit.customSwatches.map((color) => (
              <TouchableOpacity
                key={color}
                style={[styles.swatch, { backgroundColor: color }]}
                onPress={() =>
                  patchKit(
                    editMode === 'field'
                      ? { primary: color }
                      : { gkPrimary: color }
                  )
                }
              />
            ))}
            <TouchableOpacity
              style={styles.clearCustom}
              onPress={() => patchKit({ customSwatches: [] })}
            >
              <Text style={styles.clearCustomText}>Temizle</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      <TouchableOpacity
        style={styles.pitchBtn}
        onPress={() => setActiveTab('pitch')}
      >
        <Text style={styles.pitchBtnText}>{t('shirt.seePitch')}</Text>
      </TouchableOpacity>

      <CustomColorModal
        visible={!!customTarget}
        initialColor={initialForTarget}
        title="Özel Renk Ekle"
        onClose={() => setCustomTarget(null)}
        onConfirm={applyCustomColor}
      />
    </ScrollView>
  );
}

function createColorPickerStyles(colors) {
  return StyleSheet.create({
    colorBlock: { marginHorizontal: 16, marginBottom: 14 },
    colorLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    label: { fontSize: 13, fontWeight: '700', color: colors.textMuted },
    currentChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.surface,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
    },
    currentHex: {
      fontSize: 10,
      fontWeight: '800',
      color: colors.textDim,
    },
    currentDotView: {
      width: 14,
      height: 14,
      borderRadius: 7,
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.12)',
      overflow: 'hidden',
    },
    swatchGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    swatchOuter: {
      width: 36,
      height: 36,
      borderRadius: 18,
      padding: 3,
      borderWidth: 2,
      borderColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
    },
    swatchOuterLight: {
      backgroundColor: 'rgba(255,255,255,0.08)',
    },
    swatchOuterActive: {
      borderColor: colors.accentBright,
    },
    swatchInner: {
      width: 26,
      height: 26,
      borderRadius: 13,
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.08)',
      overflow: 'hidden',
    },
    swatchInnerLight: {
      borderColor: '#64748B',
    },
    addSwatch: {
      width: 36,
      height: 36,
      borderRadius: 18,
      borderWidth: 1.5,
      borderColor: colors.accent,
      borderStyle: 'dashed',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accentSoft,
    },
    addSwatchText: {
      color: colors.accentBright,
      fontWeight: '900',
      fontSize: 18,
      lineHeight: 20,
    },
  });
}

function createStyles(colors) {
  return StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: 36 },
  previewCard: {
    marginHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 18,
    overflow: 'hidden',
  },
  previewStage: {
    backgroundColor: colors.pitch,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 12,
  },
  previewGlow: {
    position: 'absolute',
    top: -40,
    alignSelf: 'center',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 28,
  },
  previewDivider: {
    width: 1,
    height: 70,
    backgroundColor: 'rgba(255,255,255,0.35)',
    marginBottom: 18,
  },
  previewItem: { alignItems: 'center', gap: 8 },
  rawSwatch: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    marginBottom: 2,
  },
  rawSwatchLight: {
    borderColor: '#111827',
  },
  previewLabel: { color: '#fff', fontWeight: '800', fontSize: 12 },
  quickActions: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  quickBtn: {
    backgroundColor: 'rgba(8,10,14,0.55)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  quickBtnText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  sectionTitle: {
    marginHorizontal: 16,
    fontSize: 12,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 4,
  },
  presetScroll: {
    paddingHorizontal: 16,
    gap: 10,
    paddingBottom: 6,
  },
  presetCard: {
    width: 118,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
  },
  presetCardActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  presetShirts: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
    justifyContent: 'center',
  },
  presetName: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textMuted,
    textAlign: 'center',
  },
  presetNameActive: { color: colors.text },
  presetCheck: {
    marginTop: 4,
    textAlign: 'center',
    color: colors.accentBright,
    fontWeight: '900',
  },
  modeTabs: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 11,
    alignItems: 'center',
  },
  modeTabActive: { backgroundColor: colors.accent },
  modeTabText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textMuted,
  },
  modeTabTextActive: { color: '#fff' },
  patternRow: {
    marginHorizontal: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  patternChip: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  patternChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  patternText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textMuted,
  },
  patternTextActive: { color: '#fff' },
  loadingHint: {
    marginHorizontal: 16,
    marginBottom: 12,
    color: colors.textDim,
    fontWeight: '600',
    fontSize: 13,
  },
  swatchRowPad: {
    marginHorizontal: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    alignItems: 'center',
  },
  swatch: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customSaved: { marginTop: 4, marginBottom: 8 },
  clearCustom: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  clearCustomText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
  },
  pitchBtn: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  pitchBtnText: { color: '#ffffff', fontWeight: '900', fontSize: 15 },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: colors.bg,
  },
  emptyTitle: { fontSize: 20, fontWeight: '900', color: colors.text },
  emptyText: {
    marginTop: 8,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
  },
  });
}
