import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { normalizeKit, sizeLabel } from '../constants/initialData';
import ScreenHeader from '../components/ScreenHeader';
import { useDialog } from '../components/AppDialog';
import { useSquad } from '../context/SquadContext';
import { useI18n } from '../i18n/LanguageContext';
import { useThemedStyles } from '../theme';
import ColorFill from '../components/ColorFill';

export default function MenuScreen({ onOpenCreateTeam, onEditTeam }) {
  const { teams, activeTeamId, selectTeam, deleteTeam, setActiveTab } =
    useSquad();
  const { t } = useI18n();
  const { showDialog } = useDialog();
  const styles = useThemedStyles(createStyles);

  const confirmDelete = (team) => {
    if (teams.length <= 1) {
      showDialog({
        title: t('menu.cannotDelete'),
        message: t('menu.cannotDeleteBody'),
        buttons: [{ text: t('common.ok') }],
      });
      return;
    }

    showDialog({
      title: t('menu.deleteTitle'),
      message: t('menu.deleteBody', { name: team.name }),
      buttons: [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => deleteTeam(team.id),
        },
      ],
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ScreenHeader
        eyebrow={t('menu.eyebrow')}
        title={t('menu.title')}
        subtitle={t('menu.subtitle', { count: teams.length })}
      />

      <TouchableOpacity
        style={styles.createBtn}
        activeOpacity={0.85}
        onPress={onOpenCreateTeam}
      >
        <View>
          <Text style={styles.createBtnText}>{t('menu.newTeam')}</Text>
          <Text style={styles.createBtnHint}>{t('menu.newHint')}</Text>
        </View>
        <Text style={styles.createArrow}>→</Text>
      </TouchableOpacity>

      {teams.map((team) => {
        const isActive = team.id === activeTeamId;
        const kit = normalizeKit(team.kit);
        const playerCount = team.players?.length || 0;
        return (
          <View
            key={team.id}
            style={[styles.teamCard, isActive && styles.teamCardActive]}
          >
            <TouchableOpacity
              style={styles.teamMain}
              activeOpacity={0.85}
              onPress={() => {
                selectTeam(team.id);
                setActiveTab?.('pitch');
              }}
            >
              <View style={styles.kitStrip}>
                <ColorFill color={kit.primary} style={styles.kitSwatch} />
                <ColorFill color={kit.gkPrimary} style={styles.kitSwatch} />
              </View>

              <View style={styles.teamBody}>
                <View style={styles.teamHeader}>
                  <Text style={styles.teamName}>{team.name}</Text>
                  {isActive ? (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{t('common.active')}</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.teamMeta}>
                  {sizeLabel(team.teamSize)} · {team.formation} ·{' '}
                  {t('menu.players', { count: playerCount })}
                </Text>
                <Text style={styles.teamHint}>
                  {team.managerName || t('common.coach')} · {t('menu.tapPitch')}
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => onEditTeam && onEditTeam(team.id)}
              >
                <Text style={styles.actionText}>{t('common.edit')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.deleteBtn]}
                onPress={() => confirmDelete(team)}
              >
                <Text style={[styles.actionText, styles.deleteText]}>
                  {t('common.delete')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: 32 },
  createBtn: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: colors.accent,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  createBtnText: { color: '#ffffff', fontWeight: '900', fontSize: 16 },
  createBtnHint: {
    marginTop: 3,
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontWeight: '600',
  },
  createArrow: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '300',
  },
  teamCard: {
    marginHorizontal: 16,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
    overflow: 'hidden',
  },
  teamCardActive: {
    borderColor: colors.accent,
    borderWidth: 1.5,
    backgroundColor: colors.surfaceSelected,
  },
  teamMain: {
    flexDirection: 'row',
    padding: 14,
    gap: 12,
  },
  kitStrip: {
    width: 10,
    borderRadius: 6,
    overflow: 'hidden',
  },
  kitSwatch: { flex: 1 },
  teamBody: { flex: 1 },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  teamName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  badge: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  teamMeta: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
  },
  teamHint: { marginTop: 4, fontSize: 11, color: colors.textDim },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionBtn: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  deleteBtn: { borderLeftWidth: 1, borderLeftColor: colors.border },
  actionText: { fontSize: 13, fontWeight: '800', color: colors.textMuted },
  deleteText: { color: colors.danger },
  });
}
