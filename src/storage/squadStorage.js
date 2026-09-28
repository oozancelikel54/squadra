import AsyncStorage from '@react-native-async-storage/async-storage';
import { createInitialSquadState, normalizeKit } from '../constants/initialData';

export const STORAGE_KEY = '@halisaha/squad/v1';

function sanitizeTeam(team) {
  if (!team || typeof team !== 'object') return null;
  return {
    ...team,
    kit: normalizeKit(team.kit),
    players: Array.isArray(team.players) ? team.players : [],
    lineup: team.lineup && typeof team.lineup === 'object' ? team.lineup : {},
    benchIds: Array.isArray(team.benchIds) ? team.benchIds : [],
    customPositions:
      team.customPositions && typeof team.customPositions === 'object'
        ? team.customPositions
        : {},
  };
}

export function sanitizePersistedState(raw) {
  const fallback = createInitialSquadState();
  if (!raw || typeof raw !== 'object') return fallback;

  const teams = Array.isArray(raw.teams)
    ? raw.teams.map(sanitizeTeam).filter(Boolean)
    : [];

  if (!teams.length) return fallback;

  const activeTeamId = teams.some((t) => t.id === raw.activeTeamId)
    ? raw.activeTeamId
    : teams[0].id;

  return {
    teams,
    activeTeamId,
    activeTab: typeof raw.activeTab === 'string' ? raw.activeTab : 'pitch',
  };
}

export async function loadSquadState() {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (!json) return null;
    return sanitizePersistedState(JSON.parse(json));
  } catch (error) {
    console.warn('loadSquadState failed', error);
    return null;
  }
}

export async function saveSquadState(state) {
  try {
    const payload = {
      teams: state.teams,
      activeTeamId: state.activeTeamId,
      activeTab: state.activeTab,
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch (error) {
    console.warn('saveSquadState failed', error);
    return false;
  }
}

export async function clearSquadState() {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.warn('clearSquadState failed', error);
    return false;
  }
}
