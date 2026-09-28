import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useThemedStyles } from '../theme';
import { useI18n } from '../i18n/LanguageContext';
import ColorFill from './ColorFill';

/**
 * Yedek kulübesi — seçili oyuncu ile pozisyona hızlı atama.
 */
export default function BenchStrip({
  players = [],
  benchIds = [],
  kit = null,
  selectedPlayerId = null,
  onSelectPlayer,
}) {
  const { t } = useI18n();
  const styles = useThemedStyles(createStyles);
  const benchPlayers = useMemo(() => {
    const byId = Object.fromEntries(players.map((p) => [p.id, p]));
    return benchIds.map((id) => byId[id]).filter(Boolean);
  }, [players, benchIds]);

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('bench.title')}</Text>
        <Text style={styles.hint}>
          {selectedPlayerId ? t('bench.hintPlace') : t('bench.hintSelect')}
        </Text>
      </View>

      {benchPlayers.length === 0 ? (
        <Text style={styles.empty}>{t('bench.empty')}</Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          {benchPlayers.map((player) => {
            const active = selectedPlayerId === player.id;
            const bg = player.isGoalkeeper ? kit?.gkPrimary : kit?.primary;
            const numColor = player.isGoalkeeper
              ? kit?.gkNumber
              : kit?.number;
            return (
              <TouchableOpacity
                key={player.id}
                style={[styles.chip, active && styles.chipActive]}
                activeOpacity={0.85}
                onPress={() =>
                  onSelectPlayer?.(
                    active ? null : player.id
                  )
                }
              >
                <ColorFill
                  color={bg || '#d32f2f'}
                  borderRadius={999}
                  style={styles.badge}
                >
                  <Text style={[styles.badgeText, { color: numColor || '#fff' }]}>
                    {player.number}
                  </Text>
                </ColorFill>
                <Text style={styles.name} numberOfLines={1}>
                  {player.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    wrap: {
      paddingHorizontal: 12,
      paddingBottom: 6,
      paddingTop: 2,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      marginBottom: 8,
      gap: 8,
    },
    title: {
      fontSize: 12,
      fontWeight: '800',
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    hint: {
      flex: 1,
      textAlign: 'right',
      fontSize: 11,
      color: colors.textDim,
      fontWeight: '600',
    },
    empty: {
      color: colors.textDim,
      fontSize: 12,
      fontWeight: '600',
      paddingVertical: 8,
    },
    row: {
      gap: 8,
      paddingRight: 8,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 6,
      paddingHorizontal: 10,
      gap: 8,
      maxWidth: 140,
    },
    chipActive: {
      borderColor: colors.neon,
      backgroundColor: colors.surfaceSoft,
    },
    badge: {
      width: 26,
      height: 26,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeText: {
      fontWeight: '900',
      fontSize: 11,
    },
    name: {
      color: colors.text,
      fontWeight: '700',
      fontSize: 12,
      flexShrink: 1,
    },
  });
}
