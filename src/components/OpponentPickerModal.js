import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { normalizeKit, sizeLabel } from '../constants/initialData';
import { useI18n } from '../i18n/LanguageContext';
import { useThemedStyles } from '../theme';

export default function OpponentPickerModal({
  visible = false,
  teams = [],
  activeTeamId = null,
  selectedId = null,
  onClose,
  onSelect,
  onDisableVs,
}) {
  const { t } = useI18n();
  const styles = useThemedStyles(createStyles);
  const options = teams.filter((tItem) => tItem.id !== activeTeamId);

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
          <View style={styles.handle} />
          <Text style={styles.title}>{t('opponent.title')}</Text>
          <Text style={styles.subtitle}>{t('opponent.subtitle')}</Text>

          {options.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>{t('opponent.empty')}</Text>
            </View>
          ) : (
            <FlatList
              data={options}
              keyExtractor={(item) => item.id}
              style={styles.list}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => {
                const kit = normalizeKit(item.kit);
                const active = item.id === selectedId;
                return (
                  <TouchableOpacity
                    style={[styles.row, active && styles.rowActive]}
                    activeOpacity={0.85}
                    onPress={() => onSelect?.(item.id)}
                  >
                    <View style={styles.kitStrip}>
                      <View
                        style={[styles.swatch, { backgroundColor: kit.primary }]}
                      />
                      <View
                        style={[
                          styles.swatch,
                          { backgroundColor: kit.gkPrimary },
                        ]}
                      />
                    </View>
                    <View style={styles.rowText}>
                      <Text style={styles.rowTitle}>{item.name}</Text>
                      <Text style={styles.rowMeta}>
                        {sizeLabel(item.teamSize)} · {item.formation} ·{' '}
                        {t('menu.players', {
                          count: (item.players || []).length,
                        })}
                      </Text>
                    </View>
                    {active ? <Text style={styles.check}>✓</Text> : null}
                  </TouchableOpacity>
                );
              }}
            />
          )}

          {selectedId ? (
            <TouchableOpacity style={styles.disableBtn} onPress={onDisableVs}>
              <Text style={styles.disableText}>{t('opponent.disable')}</Text>
            </TouchableOpacity>
          ) : null}

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
      backgroundColor: 'rgba(0,0,0,0.72)',
      justifyContent: 'flex-end',
    },
    dismiss: { flex: 1 },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 22,
      borderTopRightRadius: 22,
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 24,
      borderWidth: 1,
      borderColor: colors.border,
      maxHeight: '78%',
    },
    handle: {
      alignSelf: 'center',
      width: 42,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      marginBottom: 12,
    },
    title: { fontSize: 20, fontWeight: '900', color: colors.text },
    subtitle: {
      marginTop: 4,
      marginBottom: 12,
      fontSize: 13,
      color: colors.textMuted,
      fontWeight: '600',
    },
    list: { maxHeight: 360 },
    listContent: { gap: 8, paddingBottom: 8 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: colors.bgElevated,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
    },
    rowActive: {
      borderColor: colors.accent,
      backgroundColor: colors.accentSoft,
    },
    kitStrip: {
      width: 10,
      height: 36,
      borderRadius: 5,
      overflow: 'hidden',
    },
    swatch: { flex: 1 },
    rowText: { flex: 1 },
    rowTitle: { fontSize: 15, fontWeight: '800', color: colors.text },
    rowMeta: {
      marginTop: 3,
      fontSize: 12,
      fontWeight: '600',
      color: colors.textMuted,
    },
    check: { color: colors.accentBright, fontWeight: '900', fontSize: 16 },
    empty: { paddingVertical: 28, paddingHorizontal: 8 },
    emptyText: {
      textAlign: 'center',
      color: colors.textMuted,
      fontSize: 13,
      lineHeight: 19,
    },
    disableBtn: {
      marginTop: 8,
      paddingVertical: 12,
      alignItems: 'center',
      borderRadius: 12,
      backgroundColor: colors.bgElevated,
      borderWidth: 1,
      borderColor: colors.border,
    },
    disableText: { color: colors.warning, fontWeight: '800', fontSize: 14 },
    cancelBtn: { marginTop: 8, paddingVertical: 10, alignItems: 'center' },
    cancelText: { color: colors.textDim, fontWeight: '700' },
  });
}
