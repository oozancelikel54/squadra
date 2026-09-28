import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useSquad } from '../context/SquadContext';
import { createPlayer, normalizeKit } from '../constants/initialData';
import { getInstructionById } from '../constants/instructions';
import PlayerCard from '../components/PlayerCard';
import EditPlayerModal from '../components/EditPlayerModal';
import ScreenHeader from '../components/ScreenHeader';
import { useDialog } from '../components/AppDialog';
import { useI18n } from '../i18n/LanguageContext';
import { useThemedStyles } from '../theme';

const FILTER_IDS = ['all', 'pitch', 'bench', 'gk'];

function isOnPitch(playerId, lineup) {
  return Object.values(lineup || {}).includes(playerId);
}

export default function PlayersScreen() {
  const {
    activeTeam,
    players,
    lineup,
    kit,
    teamSize,
    addPlayer,
    updatePlayer,
    deletePlayer,
  } = useSquad();
  const { t, ti } = useI18n();
  const { showDialog } = useDialog();
  const styles = useThemedStyles(createStyles);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [filter, setFilter] = useState('all');

  const kitColors = normalizeKit(kit);

  const filters = useMemo(
    () =>
      FILTER_IDS.map((id) => ({
        id,
        label: t(
          id === 'all'
            ? 'players.filterAll'
            : id === 'pitch'
              ? 'players.filterPitch'
              : id === 'bench'
                ? 'players.filterBench'
                : 'players.filterGk'
        ),
      })),
    [t]
  );

  const playerSubText = useCallback(
    (player) => {
      const onPitch = isOnPitch(player.id, lineup);
      const parts = [
        onPitch ? t('players.statusSquad') : t('players.statusBench'),
      ];
      const instruction = ti(getInstructionById(player.instructionId));
      if (instruction) parts.push(instruction.short);
      return parts.join(' · ');
    },
    [lineup, t, ti]
  );

  const stats = useMemo(() => {
    const list = players || [];
    const onPitchCount = list.filter((p) => isOnPitch(p.id, lineup)).length;
    return {
      total: list.length,
      onPitch: onPitchCount,
      bench: list.length - onPitchCount,
      gk: list.filter((p) => p.isGoalkeeper).length,
      slots: teamSize || 7,
    };
  }, [players, lineup, teamSize]);

  const usedNumbers = useMemo(
    () => new Set((players || []).map((p) => p.number)),
    [players]
  );

  const sortedPlayers = useMemo(() => {
    let list = [...(players || [])];
    if (filter === 'pitch') {
      list = list.filter((p) => isOnPitch(p.id, lineup));
    } else if (filter === 'bench') {
      list = list.filter((p) => !isOnPitch(p.id, lineup));
    } else if (filter === 'gk') {
      list = list.filter((p) => p.isGoalkeeper);
    }
    return list.sort((a, b) => (a.number || 0) - (b.number || 0));
  }, [players, lineup, filter]);

  const openCreate = () => {
    setEditingPlayer(null);
    setModalVisible(true);
  };

  const openEdit = (player) => {
    setEditingPlayer(player);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingPlayer(null);
  };

  const handleSave = (data) => {
    if (data.id) {
      updatePlayer(data);
    } else {
      addPlayer(createPlayer(data));
    }
    closeModal();
  };

  const handleDelete = (player) => {
    showDialog({
      title: t('players.deleteTitle'),
      message: t('players.deleteBody', { name: player.name }),
      buttons: [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            deletePlayer(player.id);
            closeModal();
          },
        },
      ],
    });
  };

  if (!activeTeam) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>{t('common.noTeam')}</Text>
        <Text style={styles.emptyText}>{t('players.noTeamHint')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        eyebrow={t('players.eyebrow')}
        title={t('players.title')}
        subtitle={`${activeTeam.name} · ${t('players.count', {
          count: stats.total,
        })}`}
        right={
          <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
            <Text style={styles.addBtnText}>{t('players.add')}</Text>
          </TouchableOpacity>
        }
      />

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {stats.onPitch}/{stats.slots}
          </Text>
          <Text style={styles.statLabel}>{t('players.onPitch')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.bench}</Text>
          <Text style={styles.statLabel}>{t('players.bench')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.gk}</Text>
          <Text style={styles.statLabel}>{t('players.gk')}</Text>
        </View>
      </View>

      <View style={styles.filterRow}>
        {filters.map((item) => {
          const active = filter === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setFilter(item.id)}
            >
              <Text
                style={[
                  styles.filterText,
                  active && styles.filterTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {sortedPlayers.length === 0 ? (
        <View style={styles.emptyList}>
          <Text style={styles.emptyTitle}>
            {filter === 'all'
              ? t('players.emptyTitle')
              : t('players.emptyFilter')}
          </Text>
          <Text style={styles.emptyText}>
            {filter === 'all'
              ? t('players.emptyHint')
              : t('players.emptyFilterHint')}
          </Text>
          {filter === 'all' ? (
            <TouchableOpacity style={styles.primaryBtn} onPress={openCreate}>
              <Text style={styles.primaryBtnText}>{t('players.create')}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : (
        <FlatList
          data={sortedPlayers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const onPitch = isOnPitch(item.id, lineup);
            const isGk = !!item.isGoalkeeper;
            return (
              <PlayerCard
                name={item.name}
                number={item.number}
                subText={playerSubText(item)}
                kitColor={isGk ? kitColors.gkPrimary : kitColors.primary}
                numberColor={isGk ? kitColors.gkNumber : kitColors.number}
                borderColor={isGk ? kitColors.gkBorder : kitColors.border}
                isGoalkeeper={isGk}
                instructionId={item.instructionId}
                onPitch={onPitch}
                onPress={() => openEdit(item)}
              />
            );
          }}
        />
      )}

      <EditPlayerModal
        visible={modalVisible}
        player={editingPlayer}
        kit={kitColors}
        usedNumbers={usedNumbers}
        onClose={closeModal}
        onSave={handleSave}
        onDelete={editingPlayer ? handleDelete : undefined}
      />
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  addBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 13,
  },
  statsRow: {
    marginHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
  },
  statLabel: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '700',
    color: colors.textDim,
  },
  filterRow: {
    marginHorizontal: 16,
    marginBottom: 10,
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textMuted,
  },
  filterTextActive: { color: '#FFFFFF' },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 28,
    gap: 10,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: colors.bg,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  primaryBtn: {
    marginTop: 18,
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 14,
  },
  });
}
