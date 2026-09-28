import React, { memo, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { INSTRUCTIONS, getInstructionById } from '../constants/instructions';
import { useI18n } from '../i18n/LanguageContext';
import { useThemedStyles } from '../theme';

function InstructionRow({ item, active, onSelect, styles }) {
  const { ti } = useI18n();
  const localized = ti(item);

  return (
    <TouchableOpacity
      style={[styles.row, active && styles.rowActive]}
      activeOpacity={0.85}
      onPress={() => onSelect?.(item.id)}
    >
      <View style={[styles.dot, { backgroundColor: item.color }]} />
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{localized.title}</Text>
        <Text style={styles.rowDesc}>{localized.description}</Text>
      </View>
      {active ? <Text style={styles.check}>✓</Text> : null}
    </TouchableOpacity>
  );
}

const MemoRow = memo(InstructionRow);

export default function InstructionsSheet({
  visible = false,
  player = null,
  selectedId = null,
  onClose,
  onSelect,
}) {
  const { t, ti } = useI18n();
  const styles = useThemedStyles(createStyles);
  const current = ti(getInstructionById(selectedId));

  const renderItem = useCallback(
    ({ item }) => (
      <MemoRow
        item={item}
        active={item.id === selectedId}
        onSelect={onSelect}
        styles={styles}
      />
    ),
    [onSelect, selectedId, styles]
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <TouchableOpacity
          style={styles.dismiss}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.headerRow}>
            <View style={styles.headerAccent} />
            <Text style={styles.title}>{t('instruction.title')}</Text>
          </View>
          <Text style={styles.subtitle}>
            {player
              ? `${player.name} (#${player.number})`
              : t('instruction.noPlayer')}
            {current
              ? ` · ${t('instruction.current', { title: current.title })}`
              : ` · ${t('instruction.none')}`}
          </Text>

          <FlatList
            data={INSTRUCTIONS}
            keyExtractor={(item) => item.id}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            renderItem={renderItem}
            initialNumToRender={8}
            windowSize={5}
            removeClippedSubviews
          />

          <TouchableOpacity
            style={styles.clearBtn}
            onPress={() => onSelect?.(null)}
          >
            <Text style={styles.clearText}>{t('instruction.clear')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelText}>{t('common.close')}</Text>
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
      backgroundColor: colors.overlay,
      justifyContent: 'flex-end',
    },
    dismiss: { flex: 1 },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 24,
      borderWidth: 1,
      borderColor: colors.border,
      maxHeight: '82%',
    },
    handle: {
      alignSelf: 'center',
      width: 42,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      marginBottom: 12,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    headerAccent: {
      width: 4,
      height: 22,
      borderRadius: 2,
      backgroundColor: colors.accent,
    },
    title: {
      fontSize: 20,
      fontWeight: '900',
      color: colors.text,
    },
    subtitle: {
      marginTop: 6,
      marginBottom: 12,
      fontSize: 13,
      color: colors.textDim,
      fontWeight: '600',
      lineHeight: 18,
    },
    list: { maxHeight: 420 },
    listContent: { paddingBottom: 8, gap: 8 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.bgElevated,
      borderRadius: 14,
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 12,
    },
    rowActive: {
      borderColor: colors.accent,
      backgroundColor: colors.accentSoft,
    },
    dot: {
      width: 12,
      height: 12,
      borderRadius: 6,
    },
    rowText: { flex: 1 },
    rowTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.text,
    },
    rowDesc: {
      marginTop: 3,
      fontSize: 12,
      color: colors.textDim,
      lineHeight: 17,
    },
    check: {
      color: colors.accentBright,
      fontWeight: '900',
      fontSize: 16,
    },
    clearBtn: {
      marginTop: 10,
      paddingVertical: 12,
      alignItems: 'center',
      borderRadius: 12,
      backgroundColor: colors.surfaceSoft,
      borderWidth: 1,
      borderColor: colors.border,
    },
    clearText: {
      color: colors.warning,
      fontWeight: '800',
      fontSize: 14,
    },
    cancelBtn: {
      marginTop: 6,
      paddingVertical: 12,
      alignItems: 'center',
    },
    cancelText: {
      color: colors.textDim,
      fontWeight: '700',
    },
  });
}
