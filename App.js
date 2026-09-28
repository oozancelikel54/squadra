import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  StatusBar,
  View,
  ActivityIndicator,
  Text,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import BottomNav from './src/components/BottomNav';
import AnimatedTabHost from './src/components/AnimatedTabHost';
import TutorialModal from './src/components/TutorialModal';
import { AdBanner, useShareFlow } from './src/ads';
import { SquadProvider, useSquad } from './src/context/SquadContext';
import { LanguageProvider, useI18n } from './src/i18n/LanguageContext';
import { ThemeProvider, useTheme, useThemedStyles } from './src/theme';
import { DialogProvider } from './src/components/AppDialog';
import MenuScreen from './src/screens/MenuScreen';
import CreateTeamScreen from './src/screens/CreateTeamScreen';
import PitchScreen from './src/screens/PitchScreen';
import ShirtScreen from './src/screens/ShirtScreen';
import PlayersScreen from './src/screens/PlayersScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import {
  getTutorialSeen,
  setTutorialSeen,
} from './src/storage/tutorialStorage';

function AppScreen() {
  const { activeTab, setActiveTab, activeTeam } = useSquad();
  const { t, ready: i18nReady } = useI18n();
  const { colors, isDark } = useTheme();
  const styles = useThemedStyles(createStyles);

  const [menuView, setMenuView] = useState('home');
  const [editingTeamId, setEditingTeamId] = useState(null);
  const [tutorialVisible, setTutorialVisible] = useState(false);
  const [tutorialChecked, setTutorialChecked] = useState(false);
  const pitchShotRef = useRef(null);

  const { sharing, shareStatus, bootAds, handleSharePress } = useShareFlow({
    activeTeam,
    activeTab,
    setActiveTab,
    pitchShotRef,
    t,
  });

  useEffect(() => {
    bootAds();
  }, [bootAds]);

  useEffect(() => {
    if (!i18nReady || tutorialChecked) return;
    let alive = true;
    (async () => {
      const seen = await getTutorialSeen();
      if (!alive) return;
      if (!seen) setTutorialVisible(true);
      setTutorialChecked(true);
    })();
    return () => {
      alive = false;
    };
  }, [i18nReady, tutorialChecked]);

  useEffect(() => {
    if (activeTab !== 'menu') {
      setMenuView('home');
      setEditingTeamId(null);
    }
  }, [activeTab]);

  const openTutorial = useCallback(() => setTutorialVisible(true), []);

  const closeTutorial = useCallback(async () => {
    setTutorialVisible(false);
    await setTutorialSeen(true);
  }, []);

  const openCreateTeam = useCallback(() => {
    setEditingTeamId(null);
    setMenuView('createTeam');
  }, []);

  const openEditTeam = useCallback((teamId) => {
    setEditingTeamId(teamId);
    setMenuView('createTeam');
  }, []);

  const closeCreateTeam = useCallback(() => {
    setMenuView('home');
    setEditingTeamId(null);
  }, []);

  const pitch = useMemo(
    () => (
      <PitchScreen
        ref={pitchShotRef}
        onSharePress={handleSharePress}
        sharing={sharing}
      />
    ),
    [handleSharePress, sharing]
  );

  const tabScreens = useMemo(
    () => ({
      shirt: <ShirtScreen />,
      menu:
        menuView === 'createTeam' ? (
          <CreateTeamScreen
            editingTeamId={editingTeamId}
            onCancel={closeCreateTeam}
          />
        ) : (
          <MenuScreen
            onOpenCreateTeam={openCreateTeam}
            onEditTeam={openEditTeam}
          />
        ),
      players: <PlayersScreen />,
      settings: <SettingsScreen onShowTutorial={openTutorial} />,
    }),
    [
      menuView,
      editingTeamId,
      closeCreateTeam,
      openCreateTeam,
      openEditTeam,
      openTutorial,
    ]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={
          Platform.OS === 'android' ? 'transparent' : colors.bg
        }
        translucent={Platform.OS === 'android'}
      />

      <View style={styles.body}>
        <AnimatedTabHost
          activeTab={activeTab}
          pitch={pitch}
          screens={tabScreens}
        />
      </View>

      <AdBanner />
      <BottomNav activeTab={activeTab} onTabPress={setActiveTab} />

      <Modal visible={sharing} transparent animationType="fade">
        <View style={styles.shareOverlay}>
          <View style={styles.shareCard}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={styles.shareText}>
              {shareStatus || t('share.processing')}
            </Text>
          </View>
        </View>
      </Modal>

      <TutorialModal visible={tutorialVisible} onClose={closeTutorial} />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LanguageProvider>
          <DialogProvider>
            <SquadProvider>
              <AppScreen />
            </SquadProvider>
          </DialogProvider>
        </LanguageProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    body: {
      flex: 1,
    },
    shareOverlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      alignItems: 'center',
      justifyContent: 'center',
    },
    shareCard: {
      backgroundColor: colors.surface,
      borderRadius: 18,
      paddingHorizontal: 28,
      paddingVertical: 22,
      alignItems: 'center',
      gap: 12,
      borderWidth: 1,
      borderColor: colors.border,
      minWidth: 180,
      shadowColor: colors.cardShadow,
      shadowOpacity: 1,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 10 },
      elevation: 12,
    },
    shareText: {
      color: colors.text,
      fontWeight: '700',
      fontSize: 13,
      textAlign: 'center',
    },
  });
}
