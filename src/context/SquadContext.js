import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import {
  buildSahaKadro,
  createInitialSquadState,
  createTeam,
  getActiveTeam,
  getFormationSlots,
  getFormationsForSize,
  kitFromPreset,
  normalizeKit,
  normalizeTeamSize,
  sizeLabel,
} from '../constants/initialData';
import {
  clearSquadState,
  loadSquadState,
  saveSquadState,
} from '../storage/squadStorage';

export const SquadActions = {
  CREATE_TEAM: 'CREATE_TEAM',
  UPDATE_TEAM_SETUP: 'UPDATE_TEAM_SETUP',
  SELECT_TEAM: 'SELECT_TEAM',
  DELETE_TEAM: 'DELETE_TEAM',
  SET_FORMATION: 'SET_FORMATION',
  SET_TEAM_SIZE: 'SET_TEAM_SIZE',
  SET_TEAM_META: 'SET_TEAM_META',
  ASSIGN_PLAYER: 'ASSIGN_PLAYER',
  MOVE_TO_BENCH: 'MOVE_TO_BENCH',
  UPDATE_PLAYER: 'UPDATE_PLAYER',
  ADD_PLAYER: 'ADD_PLAYER',
  DELETE_PLAYER: 'DELETE_PLAYER',
  SET_PLAYER_INSTRUCTION: 'SET_PLAYER_INSTRUCTION',
  SET_CUSTOM_POSITION: 'SET_CUSTOM_POSITION',
  CLEAR_CUSTOM_POSITIONS: 'CLEAR_CUSTOM_POSITIONS',
  SET_KIT: 'SET_KIT',
  SET_ACTIVE_TAB: 'SET_ACTIVE_TAB',
  LOAD_STATE: 'LOAD_STATE',
  RESET: 'RESET',
};

function remapLineupForSlots(prevLineup, prevBenchIds, slots) {
  const slotIds = slots.map((s) => s.id);
  const lineup = {};
  slotIds.forEach((id) => {
    lineup[id] = null;
  });

  const keptPlayerIds = new Set();
  const previousAssignments = Object.entries(prevLineup || {})
    .filter(([, playerId]) => playerId)
    .map(([slotId, playerId]) => ({ slotId: Number(slotId), playerId }));

  previousAssignments.forEach(({ slotId, playerId }) => {
    if (slotIds.includes(slotId) && !keptPlayerIds.has(playerId)) {
      lineup[slotId] = playerId;
      keptPlayerIds.add(playerId);
    }
  });

  const displaced = previousAssignments
    .filter(({ playerId }) => !keptPlayerIds.has(playerId))
    .map(({ playerId }) => playerId);

  const uniqueBench = [...new Set([...(prevBenchIds || []), ...displaced])].filter(
    (id) => !keptPlayerIds.has(id)
  );

  return { lineup, benchIds: uniqueBench };
}

function mapActiveTeam(state, mapper) {
  const active = getActiveTeam(state);
  if (!active) return state;

  const nextTeam = mapper(active);
  if (!nextTeam || nextTeam === active) return state;

  return {
    ...state,
    teams: state.teams.map((team) =>
      team.id === active.id ? nextTeam : team
    ),
  };
}

function applySizeAndFormation(team, teamSize, formation) {
  const size = normalizeTeamSize(teamSize);
  const available = getFormationsForSize(size);
  const nextFormation = available.includes(formation)
    ? formation
    : available[0];
  const slots = getFormationSlots(size, nextFormation);
  const { lineup, benchIds } = remapLineupForSlots(
    team.lineup,
    team.benchIds,
    slots
  );

  return {
    ...team,
    teamSize: size,
    formation: nextFormation,
    lineup,
    benchIds,
    customPositions: {},
  };
}

function squadReducer(state, action) {
  switch (action.type) {
    case SquadActions.CREATE_TEAM: {
      const {
        name,
        managerName,
        teamSize,
        formation,
        goToPitch = true,
        withSamplePlayers = false,
      } = action.payload;

      const team = createTeam({
        name,
        managerName,
        teamSize,
        formation,
        withSamplePlayers,
      });

      return {
        ...state,
        teams: [...state.teams, team],
        activeTeamId: team.id,
        ...(goToPitch ? { activeTab: 'pitch' } : {}),
      };
    }

    case SquadActions.UPDATE_TEAM_SETUP: {
      const {
        teamId,
        name,
        managerName,
        teamSize,
        formation,
        goToPitch = true,
      } = action.payload;

      const targetId = teamId || state.activeTeamId;
      const target = state.teams.find((t) => t.id === targetId);
      if (!target) return state;

      const trimmedName =
        typeof name === 'string' ? name.trim() : target.name;

      let next = applySizeAndFormation(
        target,
        teamSize ?? target.teamSize,
        formation ?? target.formation
      );

      next = {
        ...next,
        name: trimmedName || target.name,
        ...(managerName !== undefined ? { managerName } : {}),
      };

      return {
        ...state,
        teams: state.teams.map((t) => (t.id === targetId ? next : t)),
        activeTeamId: targetId,
        ...(goToPitch ? { activeTab: 'pitch' } : {}),
      };
    }

    case SquadActions.SELECT_TEAM: {
      const teamId = action.payload;
      if (!state.teams.some((t) => t.id === teamId)) return state;
      return {
        ...state,
        activeTeamId: teamId,
        activeTab: 'pitch',
      };
    }

    case SquadActions.DELETE_TEAM: {
      const teamId = action.payload;
      if (state.teams.length <= 1) return state;

      const teams = state.teams.filter((t) => t.id !== teamId);
      const activeTeamId =
        state.activeTeamId === teamId ? teams[0].id : state.activeTeamId;

      return { ...state, teams, activeTeamId };
    }

    case SquadActions.SET_FORMATION: {
      return mapActiveTeam(state, (team) =>
        applySizeAndFormation(team, team.teamSize, action.payload)
      );
    }

    case SquadActions.SET_TEAM_SIZE: {
      return mapActiveTeam(state, (team) =>
        applySizeAndFormation(team, action.payload, team.formation)
      );
    }

    case SquadActions.SET_TEAM_META: {
      const { teamName, name, managerName } = action.payload;
      return mapActiveTeam(state, (team) => ({
        ...team,
        ...(teamName !== undefined || name !== undefined
          ? { name: (teamName ?? name).trim() || team.name }
          : {}),
        ...(managerName !== undefined ? { managerName } : {}),
      }));
    }

    case SquadActions.ASSIGN_PLAYER: {
      const { slotId, playerId } = action.payload;
      return mapActiveTeam(state, (team) => {
        const slots = getFormationSlots(team.teamSize, team.formation);
        if (!slots.some((s) => s.id === slotId)) return team;
        if (!team.players.some((p) => p.id === playerId)) return team;

        const nextLineup = { ...team.lineup };
        const previousInSlot = nextLineup[slotId];

        Object.keys(nextLineup).forEach((key) => {
          if (nextLineup[key] === playerId) nextLineup[key] = null;
        });

        nextLineup[slotId] = playerId;

        let benchIds = team.benchIds.filter((id) => id !== playerId);
        if (previousInSlot && previousInSlot !== playerId) {
          benchIds = [...benchIds, previousInSlot];
        }

        return {
          ...team,
          lineup: nextLineup,
          benchIds: [...new Set(benchIds)],
        };
      });
    }

    case SquadActions.MOVE_TO_BENCH: {
      const { playerId, slotId } = action.payload;
      return mapActiveTeam(state, (team) => {
        const nextLineup = { ...team.lineup };

        if (slotId != null) {
          if (nextLineup[slotId] === playerId) nextLineup[slotId] = null;
        } else {
          Object.keys(nextLineup).forEach((key) => {
            if (nextLineup[key] === playerId) nextLineup[key] = null;
          });
        }

        const benchIds = team.benchIds.includes(playerId)
          ? team.benchIds
          : [...team.benchIds, playerId];

        return { ...team, lineup: nextLineup, benchIds };
      });
    }

    case SquadActions.UPDATE_PLAYER: {
      const { id, ...updates } = action.payload;
      return mapActiveTeam(state, (team) => ({
        ...team,
        players: team.players.map((p) =>
          p.id === id ? { ...p, ...updates, id: p.id } : p
        ),
      }));
    }

    case SquadActions.ADD_PLAYER: {
      const player = action.payload;
      return mapActiveTeam(state, (team) => {
        if (!player?.id || team.players.some((p) => p.id === player.id)) {
          return team;
        }
        return {
          ...team,
          players: [...team.players, player],
          benchIds: [...team.benchIds, player.id],
        };
      });
    }

    case SquadActions.DELETE_PLAYER: {
      const playerId = action.payload;
      return mapActiveTeam(state, (team) => {
        const nextLineup = { ...team.lineup };
        Object.keys(nextLineup).forEach((key) => {
          if (nextLineup[key] === playerId) nextLineup[key] = null;
        });

        return {
          ...team,
          players: team.players.filter((p) => p.id !== playerId),
          lineup: nextLineup,
          benchIds: team.benchIds.filter((id) => id !== playerId),
        };
      });
    }

    case SquadActions.SET_PLAYER_INSTRUCTION: {
      const { playerId, instructionId } = action.payload;
      return mapActiveTeam(state, (team) => ({
        ...team,
        players: team.players.map((p) =>
          p.id === playerId
            ? { ...p, instructionId: instructionId || null }
            : p
        ),
      }));
    }

    case SquadActions.SET_CUSTOM_POSITION: {
      const { slotId, position } = action.payload;
      return mapActiveTeam(state, (team) => ({
        ...team,
        customPositions: {
          ...team.customPositions,
          [slotId]: position,
        },
      }));
    }

    case SquadActions.CLEAR_CUSTOM_POSITIONS:
      return mapActiveTeam(state, (team) => ({
        ...team,
        customPositions: {},
      }));

    case SquadActions.SET_KIT: {
      const payload = action.payload || {};
      return mapActiveTeam(state, (team) => {
        const prev = normalizeKit(team.kit);
        let nextKit;
        if (payload.presetId && !payload.custom) {
          nextKit = {
            ...kitFromPreset(payload.presetId),
            customSwatches: prev.customSwatches,
          };
        } else {
          nextKit = normalizeKit({
            ...prev,
            ...payload,
            presetId: payload.presetId || 'custom',
          });
        }
        return { ...team, kit: nextKit };
      });
    }

    case SquadActions.SET_ACTIVE_TAB:
      return { ...state, activeTab: action.payload };

    case SquadActions.LOAD_STATE:
      return {
        ...createInitialSquadState(),
        ...action.payload,
        _hydrated: true,
      };

    case SquadActions.RESET:
      return { ...createInitialSquadState(), _hydrated: true };

    default:
      return state;
  }
}

const SquadContext = createContext(null);

export function SquadProvider({ children }) {
  const [state, dispatch] = useReducer(squadReducer, undefined, () => ({
    ...createInitialSquadState(),
    _hydrated: false,
  }));
  // true → bir sonraki save effect'ini atla (hydrate / reset sonrası)
  const skipSaveRef = useRef(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const saved = await loadSquadState();
      if (!mounted) return;
      skipSaveRef.current = true;
      dispatch({
        type: SquadActions.LOAD_STATE,
        payload: saved || createInitialSquadState(),
      });
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!state._hydrated) return undefined;
    // Hydrate/reset yazımını atla; hemen ardından gelen kullanıcı değişiklikleri kaydedilsin
    if (skipSaveRef.current) {
      skipSaveRef.current = false;
      return undefined;
    }
    const snapshot = state;
    const timer = setTimeout(() => {
      saveSquadState(snapshot);
    }, 500);
    return () => clearTimeout(timer);
  }, [state]);

  const activeTeam = useMemo(() => getActiveTeam(state), [state]);

  const sahaKadro = useMemo(() => {
    if (!activeTeam) return {};
    return buildSahaKadro(activeTeam.players, activeTeam.lineup);
  }, [activeTeam]);

  const createNewTeam = useCallback(
    (setup) => dispatch({ type: SquadActions.CREATE_TEAM, payload: setup }),
    []
  );

  const updateTeamSetup = useCallback(
    (setup) =>
      dispatch({ type: SquadActions.UPDATE_TEAM_SETUP, payload: setup }),
    []
  );

  const selectTeam = useCallback(
    (teamId) => dispatch({ type: SquadActions.SELECT_TEAM, payload: teamId }),
    []
  );

  const deleteTeam = useCallback(
    (teamId) => dispatch({ type: SquadActions.DELETE_TEAM, payload: teamId }),
    []
  );

  const setFormation = useCallback(
    (formation) =>
      dispatch({ type: SquadActions.SET_FORMATION, payload: formation }),
    []
  );

  const setTeamSize = useCallback(
    (teamSize) =>
      dispatch({ type: SquadActions.SET_TEAM_SIZE, payload: teamSize }),
    []
  );

  const setMode = useCallback(
    (modeOrSize) =>
      dispatch({
        type: SquadActions.SET_TEAM_SIZE,
        payload: normalizeTeamSize(modeOrSize),
      }),
    []
  );

  const setTeamMeta = useCallback(
    (meta) => dispatch({ type: SquadActions.SET_TEAM_META, payload: meta }),
    []
  );

  /** Geriye uyumluluk: create vs update ayrımı CreateTeamScreen'de yapılır */
  const applyTeamSetup = useCallback((setup) => {
    if (setup?.teamId) {
      dispatch({ type: SquadActions.UPDATE_TEAM_SETUP, payload: setup });
    } else {
      dispatch({ type: SquadActions.CREATE_TEAM, payload: setup });
    }
  }, []);

  const assignPlayer = useCallback(
    (slotId, playerId) =>
      dispatch({
        type: SquadActions.ASSIGN_PLAYER,
        payload: { slotId, playerId },
      }),
    []
  );

  const moveToBench = useCallback(
    (playerId, slotId) =>
      dispatch({
        type: SquadActions.MOVE_TO_BENCH,
        payload: { playerId, slotId },
      }),
    []
  );

  const updatePlayer = useCallback(
    (payload) =>
      dispatch({ type: SquadActions.UPDATE_PLAYER, payload }),
    []
  );

  const addPlayer = useCallback(
    (player) => dispatch({ type: SquadActions.ADD_PLAYER, payload: player }),
    []
  );

  const deletePlayer = useCallback(
    (playerId) =>
      dispatch({ type: SquadActions.DELETE_PLAYER, payload: playerId }),
    []
  );

  const setPlayerInstruction = useCallback(
    (playerId, instructionId) =>
      dispatch({
        type: SquadActions.SET_PLAYER_INSTRUCTION,
        payload: { playerId, instructionId },
      }),
    []
  );

  const setCustomPosition = useCallback(
    (slotId, position) =>
      dispatch({
        type: SquadActions.SET_CUSTOM_POSITION,
        payload: { slotId, position },
      }),
    []
  );

  const clearCustomPositions = useCallback(
    () => dispatch({ type: SquadActions.CLEAR_CUSTOM_POSITIONS }),
    []
  );

  const setKit = useCallback(
    (kit) => dispatch({ type: SquadActions.SET_KIT, payload: kit }),
    []
  );

  const setActiveTab = useCallback(
    (tab) => dispatch({ type: SquadActions.SET_ACTIVE_TAB, payload: tab }),
    []
  );

  const loadState = useCallback(
    (partial) => dispatch({ type: SquadActions.LOAD_STATE, payload: partial }),
    []
  );

  const resetSquad = useCallback(async () => {
    skipSaveRef.current = true;
    await clearSquadState();
    dispatch({ type: SquadActions.RESET });
    const fresh = createInitialSquadState();
    await saveSquadState(fresh);
  }, []);

  const persistNow = useCallback(async () => {
    const ok = await saveSquadState(state);
    return ok;
  }, [state]);

  const value = useMemo(() => {
    const team = activeTeam;
    return {
      ...state,
      activeTeam: team,
      // Aktif takım kısayolları (ekranlar için)
      teamName: team?.name ?? '',
      managerName: team?.managerName ?? '',
      teamSize: team?.teamSize ?? 7,
      mode: team ? sizeLabel(team.teamSize) : '7v7',
      formation: team?.formation ?? '2-3-1',
      players: team?.players ?? [],
      lineup: team?.lineup ?? {},
      benchIds: team?.benchIds ?? [],
      customPositions: team?.customPositions ?? {},
      kit: normalizeKit(team?.kit),
      sahaKadro,
      dispatch,
      createNewTeam,
      updateTeamSetup,
      selectTeam,
      deleteTeam,
      setFormation,
      setTeamSize,
      setMode,
      setTeamMeta,
      applyTeamSetup,
      assignPlayer,
      moveToBench,
      updatePlayer,
      addPlayer,
      deletePlayer,
      setPlayerInstruction,
      setCustomPosition,
      clearCustomPositions,
      setKit,
      setActiveTab,
      loadState,
      resetSquad,
      persistNow,
      hydrated: !!state._hydrated,
    };
  }, [
    state,
    activeTeam,
    sahaKadro,
    createNewTeam,
    updateTeamSetup,
    selectTeam,
    deleteTeam,
    setFormation,
    setTeamSize,
    setMode,
    setTeamMeta,
    applyTeamSetup,
    assignPlayer,
    moveToBench,
    updatePlayer,
    addPlayer,
    deletePlayer,
    setPlayerInstruction,
    setCustomPosition,
    clearCustomPositions,
    setKit,
    setActiveTab,
    loadState,
    resetSquad,
    persistNow,
  ]);

  return (
    <SquadContext.Provider value={value}>{children}</SquadContext.Provider>
  );
}

export function useSquad() {
  const ctx = useContext(SquadContext);
  if (!ctx) {
    throw new Error('useSquad must be used within SquadProvider');
  }
  return ctx;
}
