import React, { useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { useThemedStyles } from '../theme';
import PlayerCard from './PlayerCard';

/**
 * Saha slotuna oyuncu atama modalı.
 * players: takım oyuncu listesi
 * lineup: { [slotId]: playerId }
 */
export default function AssignPlayerModal({
  visible = false,
  slot = null,
  players = [],
  lineup = {},
  kit = null,
  onClose,
  onAssign,
  onClear,
}) {
  const styles = useThemedStyles(createStyles);
  const currentPlayerId = slot ? lineup[slot.id] ?? null : null;

  const rows = useMemo(() => {
    const onPitchIds = new Set(
      Object.values(lineup || {}).filter(Boolean)
    );

    return [...players]
      .sort((a, b) => {
        const aBusy = onPitchIds.has(a.id) && a.id !== currentPlayerId;
        const bBusy = onPitchIds.has(b.id) && b.id !== currentPlayerId;
        if (aBusy !== bBusy) return aBusy ? 1 : -1;
        return (a.number || 0) - (b.number || 0);
      })
      .map((player) => {
        const assignedSlot = Object.entries(lineup || {}).find(
          ([, pid]) => pid === player.id
        );
        const isCurrent = player.id === currentPlayerId;
        const isOnOtherSlot = !!assignedSlot && !isCurrent;

        return {
          player,
          isCurrent,
          isOnOtherSlot,
          status: isCurrent
            ? 'Bu pozisyonda'
            : isOnOtherSlot
              ? 'Sahada (değiştir)'
              : 'Müsait',
        };
      });
  }, [players, lineup, currentPlayerId]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <TouchableOpacity
          style={styles.dismissArea}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.sheet}>
          <Text style={styles.title}>Oyuncu Seç</Text>
          <Text style={styles.subtitle}>
            {slot ? `${slot.role} pozisyonu` : 'Pozisyon'}
            {currentPlayerId
              ? ` · mevcut: ${
                  players.find((p) => p.id === currentPlayerId)?.name || '—'
                }`
              : ' · boş'}
          </Text>

          {rows.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                Henüz oyuncu yok. Oyuncu sekmesinden yeni oyuncu oluştur.
              </Text>
            </View>
          ) : (
            <FlatList
              data={rows}
              keyExtractor={(item) => item.player.id}
              style={styles.list}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.rowWrap,
                    item.isCurrent && styles.rowCurrent,
                  ]}
                >
                  <PlayerCard
                    name={item.player.name}
                    number={item.player.number}
                    subText={item.status}
                    kitColor={
                      item.player.isGoalkeeper
                        ? kit?.gkPrimary
                        : kit?.primary
                    }
                    numberColor={
                      item.player.isGoalkeeper
                        ? kit?.gkNumber
                        : kit?.number
                    }
                    borderColor={
                      item.player.isGoalkeeper
                        ? kit?.gkBorder
                        : kit?.border
                    }
                    isGoalkeeper={!!item.player.isGoalkeeper}
                    instructionId={item.player.instructionId}
                    onPitch={item.isCurrent || item.isOnOtherSlot}
                    onPress={() => onAssign?.(item.player, slot)}
                  />
                </View>
              )}
            />
          )}

          {currentPlayerId ? (
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={() => onClear?.(slot)}
            >
              <Text style={styles.clearBtnText}>Pozisyonu Boşalt</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelBtnText}>Kapat</Text>
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
      backgroundColor: 'rgba(0,0,0,0.65)',
      justifyContent: 'flex-end',
    },
    dismissArea: {
      flex: 1,
    },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 24,
      borderWidth: 1,
      borderColor: colors.border,
      maxHeight: '78%',
    },
    title: {
      fontSize: 20,
      fontWeight: '900',
      color: colors.text,
    },
    subtitle: {
      marginTop: 4,
      marginBottom: 12,
      fontSize: 13,
      color: colors.textMuted,
      fontWeight: '600',
    },
    list: {
      flexGrow: 0,
    },
    listContent: {
      paddingBottom: 8,
      gap: 8,
    },
    rowWrap: {
      borderRadius: 10,
    },
    rowCurrent: {
      borderWidth: 1,
      borderColor: colors.neon,
      borderRadius: 10,
    },
    empty: {
      paddingVertical: 28,
      paddingHorizontal: 8,
    },
    emptyText: {
      textAlign: 'center',
      color: colors.textMuted,
      fontSize: 13,
      lineHeight: 18,
    },
    clearBtn: {
      marginTop: 10,
      paddingVertical: 12,
      alignItems: 'center',
      borderRadius: 12,
      backgroundColor: colors.bgElevated,
      borderWidth: 1,
      borderColor: colors.border,
    },
    clearBtnText: {
      color: colors.danger,
      fontWeight: '800',
      fontSize: 14,
    },
    cancelBtn: {
      marginTop: 8,
      paddingVertical: 12,
      alignItems: 'center',
    },
    cancelBtnText: {
      color: colors.textDim,
      fontWeight: '700',
      fontSize: 14,
    },
  });
}
