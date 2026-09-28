import React, { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import ViewShot from 'react-native-view-shot';
import Header from '../components/Header';
import Pitch from '../components/Pitch';
import BenchStrip from '../components/BenchStrip';
import AssignPlayerModal from '../components/AssignPlayerModal';
import InstructionsSheet from '../components/InstructionsSheet';
import OpponentPickerModal from '../components/OpponentPickerModal';
import ShareFab from '../components/ShareFab';
import { useDialog } from '../components/AppDialog';
import {
  buildSahaKadro,
  normalizeKit,
  sizeLabel,
} from '../constants/initialData';
import { useSquad } from '../context/SquadContext';
import { useI18n } from '../i18n/LanguageContext';
import { useThemedStyles } from '../theme';

const PitchScreen = forwardRef(function PitchScreen(
  { onSharePress, sharing = false },
  ref
) {
  const { t } = useI18n();
  const { showDialog } = useDialog();
  const styles = useThemedStyles(createStyles);
  const {
    teams,
    activeTeam,
    activeTeamId,
    teamName,
    managerName,
    teamSize,
    formation,
    players,
    lineup,
    benchIds,
    sahaKadro,
    customPositions,
    kit,
    setCustomPosition,
    assignPlayer,
    moveToBench,
    setPlayerInstruction,
  } = useSquad();

  const [assignSlot, setAssignSlot] = useState(null);
  const [selectedBenchId, setSelectedBenchId] = useState(null);
  const [instructionPlayer, setInstructionPlayer] = useState(null);
  const [vsMode, setVsMode] = useState(false);
  const [opponentId, setOpponentId] = useState(null);
  const [opponentMenuOpen, setOpponentMenuOpen] = useState(false);
  const [vsHomePositions, setVsHomePositions] = useState({});
  const [vsAwayPositions, setVsAwayPositions] = useState({});
  const [showTactics, setShowTactics] = useState(true);

  const opponent = useMemo(
    () => teams.find((t) => t.id === opponentId) || null,
    [teams, opponentId]
  );

  useEffect(() => {
    if (opponentId && !teams.some((t) => t.id === opponentId)) {
      setOpponentId(null);
      setVsMode(false);
    }
    if (opponentId && opponentId === activeTeamId) {
      setOpponentId(null);
      setVsMode(false);
    }
  }, [teams, opponentId, activeTeamId]);

  // Rakip veya diziliş değişince VS sürükleme offsetlerini sıfırla
  useEffect(() => {
    setVsHomePositions({});
    setVsAwayPositions({});
  }, [
    opponentId,
    activeTeamId,
    teamSize,
    formation,
    opponent?.teamSize,
    opponent?.formation,
  ]);

  const awaySahaKadro = useMemo(() => {
    if (!opponent) return {};
    return buildSahaKadro(opponent.players, opponent.lineup);
  }, [opponent]);

  const handleVsPositionChange = useCallback((side, sourceId, pct) => {
    if (side === 'away') {
      setVsAwayPositions((prev) => ({ ...prev, [sourceId]: pct }));
    } else {
      setVsHomePositions((prev) => ({ ...prev, [sourceId]: pct }));
    }
  }, []);

  const closeAssign = useCallback(() => setAssignSlot(null), []);

  const openInstructionForSlot = useCallback(
    (slot) => {
      const playerId = lineup[slot.id];
      const player = players.find((p) => p.id === playerId);
      if (player) setInstructionPlayer(player);
    },
    [lineup, players]
  );

  const handleSlotPress = useCallback(
    (slot) => {
      if (selectedBenchId) {
        assignPlayer(slot.id, selectedBenchId);
        setSelectedBenchId(null);
        return;
      }

      const playerId = lineup[slot.id];
      if (playerId) {
        const player = players.find((p) => p.id === playerId);
        showDialog({
          title: player?.name || slot.role,
          message: t('pitch.whatToDo'),
          buttons: [
            { text: t('common.cancel'), style: 'cancel' },
            {
              text: t('pitch.giveInstruction'),
              onPress: () => openInstructionForSlot(slot),
            },
            {
              text: t('pitch.changePlayer'),
              onPress: () => setAssignSlot(slot),
            },
            {
              text: t('pitch.toBench'),
              style: 'destructive',
              onPress: () => moveToBench(playerId, slot.id),
            },
          ],
        });
        return;
      }

      setAssignSlot(slot);
    },
    [
      assignPlayer,
      selectedBenchId,
      lineup,
      players,
      openInstructionForSlot,
      moveToBench,
      t,
      showDialog,
    ]
  );

  const handleAssign = useCallback(
    (player, slot) => {
      if (!player?.id || !slot?.id) return;
      assignPlayer(slot.id, player.id);
      setAssignSlot(null);
      setSelectedBenchId(null);
    },
    [assignPlayer]
  );

  const handleClear = useCallback(
    (slot) => {
      if (!slot?.id) return;
      const playerId = lineup[slot.id];
      if (playerId) {
        moveToBench(playerId, slot.id);
      }
      setAssignSlot(null);
    },
    [lineup, moveToBench]
  );

  const handleInstructionSelect = useCallback(
    (instructionId) => {
      if (!instructionPlayer?.id) return;
      setPlayerInstruction(instructionPlayer.id, instructionId);
      setInstructionPlayer(null);
    },
    [instructionPlayer, setPlayerInstruction]
  );

  const handleVsPress = () => {
    const others = teams.filter((t) => t.id !== activeTeamId);
    if (others.length === 0) {
      showDialog({
        title: t('pitch.noOpponentTitle'),
        message: t('pitch.noOpponentBody'),
        buttons: [{ text: t('common.ok') }],
      });
      return;
    }
    setOpponentMenuOpen(true);
  };

  const handleSelectOpponent = (teamId) => {
    setOpponentId(teamId);
    setVsHomePositions({});
    setVsAwayPositions({});
    setVsMode(true);
    setOpponentMenuOpen(false);
  };

  const handleDisableVs = () => {
    setVsMode(false);
    setOpponentId(null);
    setVsHomePositions({});
    setVsAwayPositions({});
    setOpponentMenuOpen(false);
  };

  if (!activeTeam) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>{t('common.noTeam')}</Text>
        <Text style={styles.emptyText}>{t('pitch.noTeamHint')}</Text>
      </View>
    );
  }

  const vsActive = vsMode && !!opponent;

  return (
    <View style={styles.container}>
      <ViewShot
        ref={ref}
        style={styles.shot}
        options={{ format: 'png', quality: 1 }}
        collapsable={false}
      >
        <Header
          teamName={teamName}
          managerName={managerName}
          vsMode={vsActive}
          awayTeamName={opponent?.name}
        />
        <View style={styles.metaBar}>
          <Text style={styles.metaText}>
            {vsActive
              ? `${sizeLabel(teamSize)} ${formation}  vs  ${sizeLabel(
                  opponent.teamSize
                )} ${opponent.formation} · ${t('pitch.alignDrag')}`
              : `${sizeLabel(teamSize)} · ${formation} · ${t(
                  'pitch.touchPosition'
                )}`}
            {selectedBenchId ? ` · ${t('pitch.placeFromBench')}` : ''}
          </Text>
          {!vsActive ? (
            <TouchableOpacity
              style={[
                styles.tacticsChip,
                showTactics && styles.tacticsChipOn,
              ]}
              activeOpacity={0.85}
              onPress={() => setShowTactics((v) => !v)}
            >
              <View
                style={[
                  styles.tacticsDot,
                  showTactics && styles.tacticsDotOn,
                ]}
              />
              <Text
                style={[
                  styles.tacticsChipText,
                  showTactics && styles.tacticsChipTextOn,
                ]}
              >
                {t('pitch.tactics')}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
        <View style={styles.pitchWrap}>
          <Pitch
            mode={teamSize}
            formation={formation}
            sahaKadro={sahaKadro}
            customPositions={customPositions}
            kit={kit}
            onSlotPress={handleSlotPress}
            onPositionChange={setCustomPosition}
            vsMode={vsActive}
            awayMode={opponent?.teamSize}
            awayFormation={opponent?.formation}
            awaySahaKadro={awaySahaKadro}
            awayKit={normalizeKit(opponent?.kit)}
            vsHomePositions={vsHomePositions}
            vsAwayPositions={vsAwayPositions}
            onVsPositionChange={handleVsPositionChange}
            // Paylaşım sırasında Squadra filigranı (capture öncesi sharing=true)
            showWatermark={sharing}
            showTactics={showTactics && !vsActive}
          />
        </View>
      </ViewShot>

      <TouchableOpacity
        style={[styles.vsBtn, vsActive && styles.vsBtnActive]}
        activeOpacity={0.8}
        onPress={handleVsPress}
        onLongPress={vsActive ? handleDisableVs : undefined}
      >
        <Text style={[styles.vsBtnText, vsActive && styles.vsBtnTextActive]}>
          VS
        </Text>
      </TouchableOpacity>

      <View style={styles.shareRow}>
        <ShareFab
          inline
          onPress={onSharePress}
          disabled={sharing}
          label={t('common.share')}
        />
      </View>

      <BenchStrip
        players={players}
        benchIds={benchIds}
        kit={kit}
        selectedPlayerId={selectedBenchId}
        onSelectPlayer={setSelectedBenchId}
      />

      <AssignPlayerModal
        visible={!!assignSlot}
        slot={assignSlot}
        players={players}
        lineup={lineup}
        kit={kit}
        onClose={closeAssign}
        onAssign={handleAssign}
        onClear={handleClear}
      />

      <InstructionsSheet
        visible={!!instructionPlayer}
        player={instructionPlayer}
        selectedId={instructionPlayer?.instructionId}
        onClose={() => setInstructionPlayer(null)}
        onSelect={handleInstructionSelect}
      />

      <OpponentPickerModal
        visible={opponentMenuOpen}
        teams={teams}
        activeTeamId={activeTeamId}
        selectedId={opponentId}
        onClose={() => setOpponentMenuOpen(false)}
        onSelect={handleSelectOpponent}
        onDisableVs={handleDisableVs}
      />
    </View>
  );
});

export default PitchScreen;

function createStyles(colors) {
  return StyleSheet.create({
  container: {
    flex: 1,
  },
  shot: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  metaBar: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textDim,
    textAlign: 'center',
    backgroundColor: colors.surfaceSoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  tacticsChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgElevated,
  },
  tacticsChipOn: {
    borderColor: 'rgba(34,197,94,0.55)',
    backgroundColor: colors.accentSoft,
  },
  tacticsDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.textDim,
    opacity: 0.55,
  },
  tacticsDotOn: {
    backgroundColor: colors.accentBright,
    opacity: 1,
  },
  tacticsChipText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
    color: colors.textDim,
  },
  tacticsChipTextOn: {
    color: colors.accentBright,
  },
  pitchWrap: {
    flex: 1,
    position: 'relative',
  },
  vsBtn: {
    position: 'absolute',
    top: 10,
    right: 14,
    zIndex: 50,
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.chipDark,
    borderWidth: 1,
    borderColor: 'rgba(217,249,157,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  vsBtnActive: {
    backgroundColor: colors.accent,
    borderColor: colors.limeSoft,
  },
  vsBtnText: {
    color: colors.onDarkMuted,
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 1,
  },
  vsBtnTextActive: {
    color: '#fff',
  },
  shareRow: {
    alignItems: 'flex-end',
    paddingTop: 4,
    paddingBottom: 6,
    minHeight: 52,
    justifyContent: 'center',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.text,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 13,
    color: colors.textDim,
    textAlign: 'center',
  },
  });
}
