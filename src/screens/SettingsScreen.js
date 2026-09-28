import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
} from 'react-native';
import { useSquad } from '../context/SquadContext';
import { useI18n } from '../i18n/LanguageContext';
import { useTheme, useThemedStyles } from '../theme';
import { useDialog } from '../components/AppDialog';
import { APP_HASHTAG, PRIVACY_POLICY_URL } from '../constants/appBrand';

export default function SettingsScreen({ onShowTutorial }) {
  const {
    activeTeam,
    teamName,
    managerName,
    setTeamMeta,
    clearCustomPositions,
    resetSquad,
    persistNow,
    hydrated,
    setActiveTab,
  } = useSquad();
  const { t, locale, setLocale, locales } = useI18n();
  const { colors, mode, setMode } = useTheme();
  const { showDialog } = useDialog();
  const styles = useThemedStyles(createStyles);

  const [name, setName] = useState(teamName);
  const [manager, setManager] = useState(managerName);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(teamName);
    setManager(managerName);
  }, [teamName, managerName, activeTeam?.id]);

  const handleSaveMeta = async () => {
    if (!activeTeam) return;
    const trimmed = name.trim();
    if (!trimmed) {
      showDialog({
        title: t('settings.missingTitle'),
        message: t('settings.missingBody'),
        buttons: [{ text: t('common.ok') }],
      });
      return;
    }
    setTeamMeta({
      teamName: trimmed,
      managerName: manager.trim() || t('common.coach'),
    });
    setSaving(true);
    const ok = await persistNow();
    setSaving(false);
    showDialog({
      title: ok ? t('settings.savedTitle') : t('settings.warnTitle'),
      message: ok ? t('settings.savedBody') : t('settings.warnBody'),
      buttons: [{ text: t('common.ok') }],
    });
  };

  const handleClearPositions = () => {
    showDialog({
      title: t('settings.clearPosTitle'),
      message: t('settings.clearPosBody'),
      buttons: [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.reset'),
          style: 'destructive',
          onPress: () => {
            clearCustomPositions();
            showDialog({
              title: t('common.ok'),
              message: t('settings.clearPosDone'),
              buttons: [{ text: t('common.ok') }],
            });
          },
        },
      ],
    });
  };

  const handleResetAll = () => {
    showDialog({
      title: t('settings.resetTitle'),
      message: t('settings.resetBody'),
      buttons: [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.reset'),
          style: 'destructive',
          onPress: async () => {
            await resetSquad();
            showDialog({
              title: t('common.ok'),
              message: t('settings.resetDone'),
              buttons: [{ text: t('common.ok') }],
            });
            setActiveTab('pitch');
          },
        },
      ],
    });
  };

  if (!activeTeam) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>{t('common.noTeam')}</Text>
        <Text style={styles.emptyText}>{t('settings.createTeamFirst')}</Text>
        <TouchableOpacity
          style={[styles.secondaryBtn, { marginTop: 20, alignSelf: 'stretch' }]}
          onPress={() => onShowTutorial?.()}
        >
          <Text style={styles.secondaryBtnText}>{t('settings.showTutorial')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.brand}>{APP_HASHTAG}</Text>
      <Text style={styles.title}>{t('settings.title')}</Text>
      <Text style={styles.subtitle}>
        {hydrated ? t('settings.subtitleSaved') : t('settings.subtitleLoading')}
      </Text>

      <Text style={styles.section}>{t('settings.sectionAppearance')}</Text>
      <Text style={styles.label}>{t('settings.themeHint')}</Text>
      <View style={styles.langRow}>
        {[
          { id: 'light', label: t('settings.themeLight') },
          { id: 'dark', label: t('settings.themeDark') },
        ].map((item) => {
          const active = mode === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.langChip, active && styles.langChipActive]}
              onPress={() => setMode(item.id)}
              activeOpacity={0.85}
            >
              <Text style={[styles.langText, active && styles.langTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.section}>{t('settings.sectionLanguage')}</Text>
      <Text style={styles.label}>{t('settings.languageHint')}</Text>
      <View style={styles.langRow}>
        {locales.map((item) => {
          const active = locale === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.langChip, active && styles.langChipActive]}
              onPress={() => setLocale(item.id)}
              activeOpacity={0.85}
            >
              <Text style={[styles.langText, active && styles.langTextActive]}>
                {item.nativeLabel}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.section}>{t('settings.sectionTeam')}</Text>
      <Text style={styles.label}>{t('settings.teamName')}</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder={t('settings.teamName')}
        placeholderTextColor={colors.textDim}
        maxLength={32}
      />

      <Text style={styles.label}>{t('settings.coach')}</Text>
      <TextInput
        style={styles.input}
        value={manager}
        onChangeText={setManager}
        placeholder={t('settings.coach')}
        placeholderTextColor={colors.textDim}
        maxLength={32}
      />

      <TouchableOpacity
        style={[styles.primaryBtn, saving && styles.disabled]}
        onPress={handleSaveMeta}
        disabled={saving}
      >
        <Text style={styles.primaryBtnText}>
          {saving ? t('settings.saving') : t('settings.saveInfo')}
        </Text>
      </TouchableOpacity>

      <Text style={styles.section}>{t('settings.sectionLegal')}</Text>
      <TouchableOpacity
        style={styles.secondaryBtn}
        onPress={async () => {
          try {
            await Linking.openURL(PRIVACY_POLICY_URL);
          } catch {
            showDialog({
              title: t('settings.privacyTitle'),
              message: t('settings.privacyOpenFail'),
              buttons: [{ text: t('common.ok') }],
            });
          }
        }}
      >
        <Text style={styles.secondaryBtnText}>{t('settings.privacy')}</Text>
      </TouchableOpacity>

      <Text style={styles.section}>{t('settings.sectionHelp')}</Text>
      <TouchableOpacity
        style={styles.secondaryBtn}
        onPress={() => onShowTutorial?.()}
      >
        <Text style={styles.secondaryBtnText}>{t('settings.showTutorial')}</Text>
      </TouchableOpacity>

      <Text style={styles.section}>{t('settings.sectionPitch')}</Text>
      <TouchableOpacity style={styles.secondaryBtn} onPress={handleClearPositions}>
        <Text style={styles.secondaryBtnText}>{t('settings.clearPositions')}</Text>
      </TouchableOpacity>

      <Text style={styles.section}>{t('settings.sectionData')}</Text>
      <TouchableOpacity style={styles.dangerBtn} onPress={handleResetAll}>
        <Text style={styles.dangerBtnText}>{t('settings.resetAll')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    content: { padding: 16, paddingBottom: 32 },
    brand: {
      fontSize: 13,
      fontWeight: '900',
      letterSpacing: 1.6,
      color: colors.accentBright,
      marginBottom: 4,
    },
    title: { fontSize: 24, fontWeight: '900', color: colors.text },
    subtitle: {
      marginTop: 6,
      marginBottom: 18,
      fontSize: 13,
      color: colors.textMuted,
      fontWeight: '600',
    },
    section: {
      marginTop: 18,
      marginBottom: 8,
      fontSize: 12,
      fontWeight: '800',
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    label: {
      fontSize: 12,
      fontWeight: '800',
      color: colors.textDim,
      marginBottom: 6,
      marginTop: 8,
    },
    langRow: { flexDirection: 'row', gap: 10 },
    langChip: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      alignItems: 'center',
    },
    langChipActive: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    langText: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.textMuted,
    },
    langTextActive: { color: '#FFFFFF' },
    input: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      color: colors.text,
      fontWeight: '600',
    },
    primaryBtn: {
      marginTop: 14,
      backgroundColor: colors.accent,
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: 'center',
    },
    primaryBtnText: { color: '#fff', fontWeight: '900', fontSize: 15 },
    secondaryBtn: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 14,
      alignItems: 'center',
    },
    secondaryBtnText: {
      color: colors.text,
      fontWeight: '800',
      fontSize: 14,
    },
    dangerBtn: {
      backgroundColor: 'rgba(239,68,68,0.12)',
      borderRadius: 14,
      borderWidth: 1,
      borderColor: 'rgba(239,68,68,0.35)',
      paddingVertical: 14,
      alignItems: 'center',
    },
    dangerBtnText: {
      color: colors.danger,
      fontWeight: '900',
      fontSize: 14,
    },
    disabled: { opacity: 0.55 },
    empty: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.bg,
      padding: 24,
    },
    emptyTitle: { fontSize: 18, fontWeight: '900', color: colors.text },
    emptyText: { marginTop: 8, color: colors.textMuted, fontSize: 13 },
  });
}
