import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { INSTRUCTIONS, getInstructionById } from '../constants/instructions';
import { normalizeKit } from '../constants/initialData';
import JerseyNode from './JerseyNode';
import { useI18n } from '../i18n/LanguageContext';
import { useTheme, useThemedStyles } from '../theme';

const emptyForm = {
  name: '',
  number: '',
  isGoalkeeper: false,
  instructionId: null,
};

const NAME_HINTS = ['Emre', 'Can', 'Burak', 'Ozan', 'Mert', 'Kerem', 'Yusuf', 'Ali'];

function nextFreeNumber(usedNumbers = new Set(), preferGk = false) {
  const start = preferGk ? 1 : 2;
  for (let n = start; n <= 99; n += 1) {
    if (!usedNumbers.has(n)) return String(n);
  }
  return preferGk ? '1' : '10';
}

export default function EditPlayerModal({
  visible = false,
  player = null,
  kit = null,
  usedNumbers = new Set(),
  title,
  onClose,
  onSave,
  onDelete,
}) {
  const { t, ti } = useI18n();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const isEdit = !!player?.id;
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const kitColors = normalizeKit(kit);

  useEffect(() => {
    if (!visible) return;
    setError('');
    if (player) {
      setForm({
        name: player.name ?? '',
        number: String(player.number ?? ''),
        isGoalkeeper: !!player.isGoalkeeper,
        instructionId: player.instructionId ?? null,
      });
    } else {
      setForm({
        ...emptyForm,
        number: nextFreeNumber(usedNumbers, false),
      });
    }
  }, [visible, player, usedNumbers]);

  const suggestedNumbers = useMemo(() => {
    const picks = [];
    const prefer = form.isGoalkeeper
      ? [1, 12, 13, 99]
      : [7, 8, 9, 10, 11, 6, 5, 4];
    for (const n of prefer) {
      const taken =
        usedNumbers.has(n) && !(isEdit && player?.number === n);
      if (!taken) picks.push(n);
      if (picks.length >= 5) break;
    }
    return picks;
  }, [usedNumbers, form.isGoalkeeper, isEdit, player]);

  const patch = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    const name = form.name.trim();
    if (!name) {
      setError(t('editPlayer.nameRequired'));
      return;
    }

    const number = parseInt(form.number, 10);
    if (!Number.isFinite(number) || number < 0 || number > 99) {
      setError(t('editPlayer.numberRange'));
      return;
    }

    const clash =
      usedNumbers.has(number) && !(isEdit && player?.number === number);
    if (clash) {
      setError(t('editPlayer.numberClash', { n: number }));
      return;
    }

    onSave?.({
      ...(isEdit ? { id: player.id } : {}),
      name,
      number,
      isGoalkeeper: !!form.isGoalkeeper,
      instructionId: form.instructionId || null,
    });
  };

  const previewPrimary = form.isGoalkeeper
    ? kitColors.gkPrimary
    : kitColors.primary;
  const previewNumber = form.isGoalkeeper
    ? kitColors.gkNumber
    : kitColors.number;
  const previewBorder = form.isGoalkeeper
    ? kitColors.gkBorder
    : kitColors.border;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity
          style={styles.dismissArea}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.hero}>
              <JerseyNode
                number={form.number || '?'}
                primary={previewPrimary}
                numberColor={previewNumber}
                borderColor={previewBorder}
                size={72}
                animateIn={false}
              />
              <View style={styles.heroText}>
                <Text style={styles.title}>
                  {title ||
                    (isEdit
                      ? t('editPlayer.titleEdit')
                      : t('editPlayer.titleNew'))}
                </Text>
                <Text style={styles.hint}>{t('editPlayer.hint')}</Text>
              </View>
            </View>

            <Text style={styles.label}>{t('editPlayer.name')}</Text>
            <TextInput
              style={styles.input}
              value={form.name}
              onChangeText={(v) => patch('name', v)}
              placeholder="Örn. Emre"
              placeholderTextColor={colors.textDim}
              maxLength={24}
              autoFocus={!isEdit}
            />
            {!isEdit ? (
              <View style={styles.hintRow}>
                {NAME_HINTS.slice(0, 4).map((n) => (
                  <TouchableOpacity
                    key={n}
                    style={styles.miniChip}
                    onPress={() => patch('name', n)}
                  >
                    <Text style={styles.miniChipText}>{n}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}

            <Text style={styles.label}>{t('editPlayer.number')}</Text>
            <TextInput
              style={styles.input}
              value={form.number}
              onChangeText={(v) => patch('number', v.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              placeholder="10"
              placeholderTextColor={colors.textDim}
              maxLength={2}
            />
            <View style={styles.hintRow}>
              {suggestedNumbers.map((n) => (
                <TouchableOpacity
                  key={n}
                  style={[
                    styles.miniChip,
                    String(n) === form.number && styles.miniChipActive,
                  ]}
                  onPress={() => patch('number', String(n))}
                >
                  <Text
                    style={[
                      styles.miniChipText,
                      String(n) === form.number && styles.miniChipTextActive,
                    ]}
                  >
                    #{n}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>{t('editPlayer.role')}</Text>
            <View style={styles.roleTabs}>
              <TouchableOpacity
                style={[
                  styles.roleTab,
                  !form.isGoalkeeper && styles.roleTabActive,
                ]}
                onPress={() => patch('isGoalkeeper', false)}
              >
                <Text
                  style={[
                    styles.roleTabText,
                    !form.isGoalkeeper && styles.roleTabTextActive,
                  ]}
                >
                  {t('editPlayer.outfield')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.roleTab,
                  form.isGoalkeeper && styles.roleTabActiveGk,
                ]}
                onPress={() => {
                  patch('isGoalkeeper', true);
                  if (!form.number || form.number === '10') {
                    patch('number', nextFreeNumber(usedNumbers, true));
                  }
                }}
              >
                <Text
                  style={[
                    styles.roleTabText,
                    form.isGoalkeeper && styles.roleTabTextActive,
                  ]}
                >
                  {t('editPlayer.gk')}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>{t('editPlayer.instruction')}</Text>
            <Text style={styles.instructionHint}>
              {ti(getInstructionById(form.instructionId))?.title ||
                t('editPlayer.notSelected')}
            </Text>
            <View style={styles.instructionGrid}>
              {INSTRUCTIONS.map((item) => {
                const localized = ti(item);
                const active = form.instructionId === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.instructionChip,
                      active && {
                        borderColor: item.color,
                        backgroundColor: `${item.color}22`,
                      },
                    ]}
                    onPress={() =>
                      patch('instructionId', active ? null : item.id)
                    }
                  >
                    <View
                      style={[
                        styles.instructionDot,
                        { backgroundColor: item.color },
                      ]}
                    />
                    <Text
                      style={[
                        styles.instructionChipText,
                        active && { color: colors.text },
                      ]}
                      numberOfLines={1}
                    >
                      {localized.short}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {!!error && <Text style={styles.error}>{error}</Text>}

            <TouchableOpacity style={styles.primaryBtn} onPress={handleSave}>
              <Text style={styles.primaryBtnText}>
                {isEdit ? t('common.save') : t('editPlayer.create')}
              </Text>
            </TouchableOpacity>

            {isEdit && onDelete ? (
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => onDelete(player)}
              >
                <Text style={styles.deleteBtnText}>
                  {t('editPlayer.delete')}
                </Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
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
    dismissArea: { flex: 1 },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 18,
      paddingTop: 10,
      paddingBottom: 28,
      borderWidth: 1,
      borderColor: colors.border,
      maxHeight: '92%',
    },
    handle: {
      alignSelf: 'center',
      width: 42,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      marginBottom: 12,
    },
    hero: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      marginBottom: 8,
      backgroundColor: colors.bgElevated,
      borderRadius: 16,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    heroText: { flex: 1 },
    title: {
      fontSize: 18,
      fontWeight: '900',
      color: colors.text,
    },
    hint: {
      marginTop: 4,
      fontSize: 12,
      color: colors.textMuted,
      lineHeight: 16,
    },
    label: {
      fontSize: 12,
      fontWeight: '800',
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
      marginBottom: 6,
      marginTop: 12,
    },
    input: {
      backgroundColor: colors.bgElevated,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      color: colors.text,
      fontWeight: '600',
    },
    hintRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 8,
    },
    miniChip: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: colors.bgElevated,
      borderWidth: 1,
      borderColor: colors.border,
    },
    miniChipActive: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    miniChipText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textMuted,
    },
    miniChipTextActive: { color: '#fff' },
    roleTabs: {
      flexDirection: 'row',
      backgroundColor: colors.bgElevated,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 4,
      gap: 4,
    },
    roleTab: {
      flex: 1,
      paddingVertical: 11,
      borderRadius: 10,
      alignItems: 'center',
    },
    roleTabActive: { backgroundColor: colors.accent },
    roleTabActiveGk: { backgroundColor: colors.jerseyGk },
    roleTabText: {
      fontSize: 13,
      fontWeight: '800',
      color: colors.textMuted,
    },
    roleTabTextActive: { color: '#fff' },
    instructionHint: {
      fontSize: 13,
      color: colors.textDim,
      fontWeight: '600',
      marginBottom: 8,
    },
    instructionGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    instructionChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.bgElevated,
      width: '48%',
    },
    instructionDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    instructionChipText: {
      flex: 1,
      fontSize: 12,
      fontWeight: '700',
      color: colors.text,
    },
    error: {
      marginTop: 12,
      color: colors.danger,
      fontWeight: '700',
      fontSize: 13,
    },
    primaryBtn: {
      marginTop: 18,
      backgroundColor: colors.accent,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
    },
    primaryBtnText: {
      color: '#fff',
      fontWeight: '900',
      fontSize: 15,
    },
    deleteBtn: {
      marginTop: 10,
      paddingVertical: 12,
      alignItems: 'center',
    },
    deleteBtnText: {
      color: colors.danger,
      fontWeight: '800',
      fontSize: 14,
    },
    cancelBtn: {
      marginTop: 4,
      paddingVertical: 12,
      alignItems: 'center',
    },
    cancelBtnText: {
      color: colors.textMuted,
      fontWeight: '700',
      fontSize: 14,
    },
  });
}
