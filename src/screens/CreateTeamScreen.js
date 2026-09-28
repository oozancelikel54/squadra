import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  TEAM_SIZES,
  getFormationsForSize,
  sizeLabel,
} from '../constants/initialData';
import FormationMiniPreview from '../components/FormationMiniPreview';
import ScreenHeader from '../components/ScreenHeader';
import { useSquad } from '../context/SquadContext';
import { useI18n } from '../i18n/LanguageContext';
import { useTheme, useThemedStyles } from '../theme';

const NAME_SUGGESTIONS = {
  tr: [
    'Atlas SK',
    'Marmara FK',
    'Boğaziçi SK',
    'Anadolu FC',
    'Ege Athletic',
    'Başkent United',
    'Karadeniz FK',
    'Vadi SK',
  ],
  en: [
    'Atlas FC',
    'Northgate United',
    'Riverside Athletic',
    'Crest City',
    'Harbor FC',
    'Meridian United',
    'Valley Athletic',
    'Apex City',
  ],
};

export default function CreateTeamScreen({ onCancel, editingTeamId = null }) {
  const {
    teams,
    teamName: activeName,
    teamSize: activeSize,
    formation: activeFormation,
    createNewTeam,
    updateTeamSetup,
  } = useSquad();
  const { t, locale } = useI18n();
  const nameSuggestions =
    NAME_SUGGESTIONS[locale] || NAME_SUGGESTIONS.tr;
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const editingTeam = editingTeamId
    ? teams.find((t) => t.id === editingTeamId)
    : null;

  const [teamName, setTeamName] = useState(
    editingTeam?.name ?? (editingTeamId ? activeName : '')
  );
  const [managerName, setManagerName] = useState(
    editingTeam?.managerName ?? 'Teknik Direktör'
  );
  const [teamSize, setTeamSize] = useState(
    editingTeam?.teamSize ?? activeSize ?? 7
  );
  const [formation, setFormation] = useState(
    editingTeam?.formation ?? activeFormation ?? '2-3-1'
  );
  const [withSamples, setWithSamples] = useState(false);

  const formations = useMemo(() => getFormationsForSize(teamSize), [teamSize]);

  useEffect(() => {
    if (!formations.includes(formation)) {
      setFormation(formations[0]);
    }
  }, [formations, formation]);

  const handleSizeChange = (size) => {
    setTeamSize(size);
    setFormation(getFormationsForSize(size)[0]);
  };

  const canSubmit = teamName.trim().length > 0 && !!formation;
  const isEditing = !!editingTeam;
  const stepDone = {
    name: teamName.trim().length > 0,
    size: !!teamSize,
    formation: !!formation,
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    const payload = {
      name: teamName.trim(),
      managerName: managerName.trim() || t('common.coach'),
      teamSize,
      formation,
      goToPitch: true,
    };
    if (isEditing) {
      updateTeamSetup({ ...payload, teamId: editingTeam.id });
    } else {
      createNewTeam({ ...payload, withSamplePlayers: withSamples });
    }
  };

  const applySuggestion = () => {
    const unused = nameSuggestions.filter(
      (n) => !teams.some((t) => t.name === n)
    );
    const pool = unused.length ? unused : nameSuggestions;
    setTeamName(pool[Math.floor(Math.random() * pool.length)]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <ScreenHeader
        eyebrow={isEditing ? t('create.eyebrowEdit') : t('create.eyebrowNew')}
        title={isEditing ? t('create.titleEdit') : t('create.titleNew')}
        subtitle={t('create.subtitle')}
      />

      <View style={styles.steps}>
        {[
          { key: 'name', label: t('create.stepName') },
          { key: 'size', label: t('create.stepSize') },
          { key: 'formation', label: t('create.stepFormation') },
        ].map((step, index) => (
          <View key={step.key} style={styles.stepItem}>
            <View
              style={[
                styles.stepDot,
                stepDone[step.key] && styles.stepDotDone,
              ]}
            >
              <Text style={styles.stepNum}>{index + 1}</Text>
            </View>
            <Text style={styles.stepLabel}>{step.label}</Text>
            {index < 2 ? <View style={styles.stepLine} /> : null}
          </View>
        ))}
      </View>

      <View style={styles.previewWrap}>
        <FormationMiniPreview teamSize={teamSize} formation={formation} />
      </View>

      <Text style={styles.label}>{t('create.teamName')}</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, styles.inputFlex]}
          value={teamName}
          onChangeText={setTeamName}
          placeholder={t('create.teamNamePh')}
          placeholderTextColor={colors.textDim}
          maxLength={32}
        />
        <TouchableOpacity style={styles.suggestBtn} onPress={applySuggestion}>
          <Text style={styles.suggestBtnText}>?</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.suggestRow}
      >
        {nameSuggestions.map((name) => (
          <TouchableOpacity
            key={name}
            style={styles.suggestChip}
            onPress={() => setTeamName(name)}
          >
            <Text style={styles.suggestChipText}>{name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.label}>{t('create.coach')}</Text>
      <TextInput
        style={styles.input}
        value={managerName}
        onChangeText={setManagerName}
        placeholder={t('create.coachPh')}
        placeholderTextColor={colors.textDim}
        maxLength={28}
      />

      <Text style={styles.label}>{t('create.size')}</Text>
      <View style={styles.sizeGrid}>
        {TEAM_SIZES.map((size) => {
          const active = teamSize === size;
          return (
            <TouchableOpacity
              key={size}
              style={[styles.sizeCard, active && styles.sizeCardActive]}
              onPress={() => handleSizeChange(size)}
            >
              <Text
                style={[styles.sizeNumber, active && styles.sizeNumberActive]}
              >
                {size}
              </Text>
              <Text
                style={[styles.sizeMeta, active && styles.sizeMetaActive]}
              >
                {sizeLabel(size)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.label}>{t('create.formation')}</Text>
      <View style={styles.wrapRow}>
        {formations.map((item) => {
          const active = formation === item;
          return (
            <TouchableOpacity
              key={item}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setFormation(item)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {!isEditing ? (
        <TouchableOpacity
          style={[styles.sampleToggle, withSamples && styles.sampleToggleOn]}
          onPress={() => setWithSamples((v) => !v)}
          activeOpacity={0.85}
        >
          <View style={styles.sampleTextCol}>
            <Text style={styles.sampleTitle}>{t('create.sample')}</Text>
            <Text style={styles.sampleHint}>{t('create.sampleHint')}</Text>
          </View>
          <View style={[styles.checkbox, withSamples && styles.checkboxOn]}>
            {withSamples ? <Text style={styles.checkboxMark}>✓</Text> : null}
          </View>
        </TouchableOpacity>
      ) : null}

      <View style={styles.summary}>
        <Text style={styles.summaryEyebrow}>{t('create.summary')}</Text>
        <Text style={styles.summaryText}>
          {teamName.trim() || 'Takım'} · {managerName.trim() || 'TD'} ·{' '}
          {sizeLabel(teamSize)} · {formation}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.primaryBtn, !canSubmit && styles.primaryBtnDisabled]}
        onPress={handleSubmit}
        disabled={!canSubmit}
      >
        <Text style={styles.primaryBtnText}>
          {isEditing ? t('create.submitEdit') : t('create.submitNew')}
        </Text>
      </TouchableOpacity>

      {onCancel && (
        <TouchableOpacity style={styles.secondaryBtn} onPress={onCancel}>
          <Text style={styles.secondaryBtnText}>{t('create.back')}</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: 36 },
  steps: {
    marginHorizontal: 16,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stepDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotDone: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  stepNum: { color: '#fff', fontSize: 11, fontWeight: '900' },
  stepLabel: {
    marginLeft: 6,
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.border,
    marginHorizontal: 8,
  },
  previewWrap: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  label: {
    marginHorizontal: 16,
    fontSize: 12,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 8,
    marginTop: 14,
  },
  inputRow: {
    marginHorizontal: 16,
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    marginHorizontal: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },
  inputFlex: {
    flex: 1,
    marginHorizontal: 0,
  },
  suggestBtn: {
    width: 48,
    borderRadius: 14,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestBtnText: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.accentBright,
  },
  suggestRow: {
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 8,
  },
  suggestChip: {
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  sizeGrid: {
    marginHorizontal: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sizeCard: {
    width: '22%',
    minWidth: 68,
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    alignItems: 'center',
  },
  sizeCardActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  sizeNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.text,
  },
  sizeNumberActive: { color: '#fff' },
  sizeMeta: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '700',
    color: colors.textDim,
  },
  sizeMetaActive: { color: 'rgba(255,255,255,0.85)' },
  wrapRow: {
    marginHorizontal: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    minWidth: 88,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chipText: { fontSize: 14, fontWeight: '800', color: colors.textMuted },
  chipTextActive: { color: '#ffffff' },
  sampleToggle: {
    marginHorizontal: 16,
    marginTop: 18,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sampleToggleOn: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  sampleTextCol: { flex: 1 },
  sampleTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  sampleHint: {
    marginTop: 3,
    fontSize: 12,
    color: colors.textMuted,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  checkboxMark: { color: '#fff', fontWeight: '900' },
  summary: {
    marginHorizontal: 16,
    marginTop: 18,
    backgroundColor: colors.surfaceSoft,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textDim,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  primaryBtn: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  primaryBtnDisabled: { opacity: 0.45 },
  primaryBtnText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 15,
    letterSpacing: 0.3,
  },
  secondaryBtn: { marginTop: 10, paddingVertical: 12, alignItems: 'center' },
  secondaryBtnText: {
    color: colors.textMuted,
    fontWeight: '700',
    fontSize: 14,
  },
  });
}
