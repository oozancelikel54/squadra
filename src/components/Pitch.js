import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  PanResponder,
  Animated,
} from 'react-native';
import { getFormationSlots } from '../constants/initialData';
import { getInstructionById } from '../constants/instructions';
import { APP_HASHTAG } from '../constants/appBrand';
import { buildVsSlots, clampVsPosition } from '../utils/vsLayout';
import JerseyNode from './JerseyNode';
import TacticalOverlay from './TacticalOverlay';
import { useI18n } from '../i18n/LanguageContext';
import { useThemedStyles, colors as fallbackColors } from '../theme';

const { width } = Dimensions.get('window');
const DRAG_THRESHOLD = 8;
const SLOT_WIDTH = 58;
const SLOT_OFFSET_X = 12;

function parsePercent(value) {
  if (typeof value === 'number') return value;
  return parseFloat(String(value).replace('%', '')) || 0;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function percentToPixels(topPct, leftPct, pitchW, pitchH) {
  return {
    x: (parsePercent(leftPct) / 100) * pitchW,
    y: (parsePercent(topPct) / 100) * pitchH,
  };
}

function pixelsToPercent(x, y, pitchW, pitchH) {
  return {
    top: `${clamp((y / pitchH) * 100, 2, 92).toFixed(1)}%`,
    left: `${clamp((x / pitchW) * 100, 2, 86).toFixed(1)}%`,
  };
}

function DraggablePlayer({
  slot,
  player,
  customPosition,
  pitchSize,
  kit,
  onSlotPress,
  onPositionChange,
  onTacticDrag,
  hideMeta = false,
  compact = false,
  dragSide = null,
}) {
  const { ti } = useI18n();
  const styles = useThemedStyles(createStyles);
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const dragScale = useRef(new Animated.Value(1)).current;
  const dragDistance = useRef(0);
  const isDragging = useRef(false);
  /** Sürükleme sonrası props gelene kadar sync atlanır — ışınlanma önlemi */
  const pendingPosKey = useRef(null);
  const [dragElevated, setDragElevated] = useState(false);
  const startXY = useRef({ x: 0, y: 0 });
  const syncedKey = useRef('');

  const baseTop = customPosition?.top ?? slot.top;
  const baseLeft = customPosition?.left ?? slot.left;
  const isGk = !!player?.isGoalkeeper || slot.role === 'GK';
  const shirtBg = isGk
    ? kit?.gkPrimary || fallbackColors.jerseyGk
    : kit?.primary || fallbackColors.jerseyBronze;
  const shirtSecondary = isGk
    ? kit?.gkSecondary || kit?.gkBorder
    : kit?.secondary || kit?.border;
  const shirtSleeve = isGk
    ? kit?.gkSleeveColor || kit?.gkPrimary
    : kit?.sleeveColor || kit?.primary;
  const shirtNumberColor = isGk
    ? kit?.gkNumber || '#ffffff'
    : kit?.number || '#ffffff';
  const shirtBorder = isGk
    ? kit?.gkBorder || fallbackColors.jerseyGkLight
    : kit?.border || fallbackColors.jerseyBronzeLight;
  const shirtPattern = isGk ? kit?.gkPattern || 'solid' : kit?.pattern || 'solid';
  const jerseySize = compact ? 36 : 48;

  const instruction = hideMeta
    ? null
    : ti(getInstructionById(player?.instructionId));

  const latestRef = useRef({});

  const commitDragPosition = useCallback(
    (size, side, onChange, currentSlot, nextX, nextY, tacticDrag) => {
      const clampedX = clamp(nextX, 0, size.width - SLOT_WIDTH + SLOT_OFFSET_X);
      const clampedY = clamp(nextY, 0, size.height - 56);
      let pct = pixelsToPercent(clampedX, clampedY, size.width, size.height);
      if (side) {
        pct = clampVsPosition(side, pct.top, pct.left);
      }
      const locked = percentToPixels(pct.top, pct.left, size.width, size.height);
      pan.setValue({ x: locked.x, y: locked.y });
      pendingPosKey.current = `${pct.top}|${pct.left}`;
      syncedKey.current = `${pct.top}|${pct.left}|${size.width}|${size.height}`;
      const id = currentSlot.id ?? currentSlot.sourceId;
      // Sürüklerken ok gizliydi — bırakınca doğru yerde tek sefer göster
      tacticDrag?.({ type: 'end', slotId: id, pct });
      onChange?.(currentSlot, pct);
    },
    [pan]
  );

  latestRef.current = {
    baseTop,
    baseLeft,
    pitchSize,
    onSlotPress,
    onPositionChange,
    onTacticDrag,
    slot,
    pan,
    dragScale,
    dragSide,
    setDragElevated,
    commitDragPosition,
  };

  useEffect(() => {
    const { width: w, height: h } = pitchSize || {};
    if (!w || !h) return;
    if (isDragging.current) return;

    const posKey = `${baseTop}|${baseLeft}`;
    if (pendingPosKey.current) {
      if (pendingPosKey.current !== posKey) {
        // State henüz eski — pan'ı bozma
        return;
      }
      pendingPosKey.current = null;
    }

    const key = `${posKey}|${w}|${h}`;
    if (syncedKey.current === key) return;
    syncedKey.current = key;

    const { x, y } = percentToPixels(baseTop, baseLeft, w, h);
    pan.setValue({ x, y });
  }, [baseTop, baseLeft, pitchSize, pan]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 3 || Math.abs(g.dy) > 3,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        isDragging.current = true;
        pendingPosKey.current = null;
        latestRef.current.setDragElevated(true);
        dragDistance.current = 0;
        startXY.current = {
          x: pan.x.__getValue(),
          y: pan.y.__getValue(),
        };
        const slot = latestRef.current.slot;
        const id = slot?.id ?? slot?.sourceId;
        if (id != null) {
          latestRef.current.onTacticDrag?.({ type: 'start', slotId: id });
        }
        Animated.spring(dragScale, {
          toValue: 1.1,
          friction: 6,
          useNativeDriver: false,
        }).start();
      },
      onPanResponderMove: (_, g) => {
        dragDistance.current = Math.max(
          dragDistance.current,
          Math.sqrt(g.dx * g.dx + g.dy * g.dy)
        );
        pan.setValue({
          x: startXY.current.x + g.dx,
          y: startXY.current.y + g.dy,
        });
      },
      onPanResponderRelease: (_, g) => {
        const {
          pitchSize: size,
          onSlotPress: onPress,
          onPositionChange: onChange,
          onTacticDrag: tacticDrag,
          slot: currentSlot,
          dragScale: scaleAnim,
          dragSide: side,
          setDragElevated: setElevated,
          commitDragPosition: commit,
        } = latestRef.current;

        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          useNativeDriver: false,
        }).start();

        const endDrag = () => {
          isDragging.current = false;
          setElevated(false);
        };

        const slotId = currentSlot?.id ?? currentSlot?.sourceId;

        if (dragDistance.current < DRAG_THRESHOLD) {
          pan.setValue(startXY.current);
          tacticDrag?.({ type: 'cancel', slotId });
          endDrag();
          onPress?.(currentSlot);
          return;
        }

        if (!size?.width || !size?.height || !onChange || !commit) {
          pan.setValue(startXY.current);
          tacticDrag?.({ type: 'cancel', slotId });
          endDrag();
          return;
        }

        commit(
          size,
          side,
          onChange,
          currentSlot,
          startXY.current.x + g.dx,
          startXY.current.y + g.dy,
          tacticDrag
        );
        endDrag();
      },
      onPanResponderTerminate: (_, g) => {
        const {
          dragScale: scaleAnim,
          pitchSize: size,
          onPositionChange: onChange,
          onTacticDrag: tacticDrag,
          slot: currentSlot,
          dragSide: side,
          setDragElevated: setElevated,
          commitDragPosition: commit,
        } = latestRef.current;
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          useNativeDriver: false,
        }).start();

        const endDrag = () => {
          isDragging.current = false;
          setElevated(false);
        };

        const slotId = currentSlot?.id ?? currentSlot?.sourceId;

        if (
          dragDistance.current >= DRAG_THRESHOLD &&
          size?.width &&
          size?.height &&
          onChange &&
          commit
        ) {
          commit(
            size,
            side,
            onChange,
            currentSlot,
            startXY.current.x + g.dx,
            startXY.current.y + g.dy,
            tacticDrag
          );
          endDrag();
          return;
        }
        pan.setValue(startXY.current);
        tacticDrag?.({ type: 'cancel', slotId });
        endDrag();
      },
    })
  ).current;

  return (
    <Animated.View
      style={[
        styles.playerSlot,
        {
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
            { scale: dragScale },
          ],
          zIndex: dragElevated ? 40 : 10,
        },
      ]}
      {...panResponder.panHandlers}
    >
      <JerseyNode
        number={player?.number ?? slot.sourceId ?? slot.id}
        primary={shirtBg}
        secondary={shirtSecondary}
        sleeveColor={shirtSleeve}
        numberColor={shirtNumberColor}
        borderColor={shirtBorder}
        pattern={shirtPattern}
        size={jerseySize}
        animateIn
        highlight={!!instruction}
      />

      <View style={[styles.nameBadge, compact && styles.nameBadgeCompact]}>
        <Text style={styles.playerName} numberOfLines={1}>
          {player?.name || (hideMeta ? '—' : slot.role)}
        </Text>
      </View>

      {instruction ? (
        <View
          style={[styles.instructionChip, { borderColor: instruction.color }]}
        >
          <View
            style={[
              styles.instructionDot,
              { backgroundColor: instruction.color },
            ]}
          />
          <Text style={styles.instructionText} numberOfLines={1}>
            {instruction.short}
          </Text>
        </View>
      ) : null}
    </Animated.View>
  );
}

function PitchWatermark() {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.watermarkLayer} pointerEvents="none">
      <Text style={[styles.watermark, styles.wmBL]}>{APP_HASHTAG}</Text>
      <Text style={[styles.watermark, styles.wmBR]}>{APP_HASHTAG}</Text>
    </View>
  );
}

export default function Pitch({
  mode = 7,
  formation = '2-3-1',
  sahaKadro = {},
  customPositions = {},
  kit,
  onSlotPress,
  onPositionChange,
  vsMode = false,
  awayMode,
  awayFormation,
  awaySahaKadro = {},
  awayKit,
  vsHomePositions = {},
  vsAwayPositions = {},
  onVsPositionChange,
  showWatermark = false,
  showTactics = true,
}) {
  const styles = useThemedStyles(createStyles);
  const [pitchSize, setPitchSize] = useState({ width: 0, height: 0 });
  /** Sürüklenen slot — oklar gizlenir (her kare SVG güncellemesi yok) */
  const [draggingSlotId, setDraggingSlotId] = useState(null);
  /** Bırakınca oklar state gelene kadar burada durur */
  const [livePositions, setLivePositions] = useState({});
  const fade = useRef(new Animated.Value(0)).current;

  const handleTacticDrag = useCallback((event) => {
    if (!event?.slotId && event?.slotId !== 0) return;
    if (event.type === 'start') {
      setDraggingSlotId(event.slotId);
      return;
    }
    if (event.type === 'cancel') {
      setDraggingSlotId((cur) => (cur === event.slotId ? null : cur));
      return;
    }
    if (event.type === 'end' && event.pct) {
      setDraggingSlotId(null);
      setLivePositions((prev) => ({
        ...prev,
        [event.slotId]: event.pct,
      }));
    }
  }, []);

  const overlayPositions = useMemo(
    () => ({ ...customPositions, ...livePositions }),
    [customPositions, livePositions]
  );

  useEffect(() => {
    setLivePositions((prev) => {
      const ids = Object.keys(prev);
      if (!ids.length) return prev;
      let changed = false;
      const next = { ...prev };
      ids.forEach((id) => {
        const saved = customPositions[id];
        const live = prev[id];
        if (
          saved &&
          live &&
          saved.top === live.top &&
          saved.left === live.left
        ) {
          delete next[id];
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [customPositions]);

  const vsData = useMemo(() => {
    if (!vsMode) return null;
    return buildVsSlots(
      mode,
      formation,
      awayMode || mode,
      awayFormation || formation
    );
  }, [vsMode, mode, formation, awayMode, awayFormation]);

  const singleSlots = useMemo(
    () => getFormationSlots(mode, formation) || [],
    [mode, formation]
  );

  // VS: sadece dolu slotlar — boş rol etiketleri kalabalığı yok
  const homeFilled = useMemo(() => {
    if (!vsData) return [];
    return vsData.homeSlots.filter((slot) => !!sahaKadro[slot.sourceId]);
  }, [vsData, sahaKadro]);

  const awayFilled = useMemo(() => {
    if (!vsData) return [];
    return vsData.awaySlots.filter((slot) => !!awaySahaKadro[slot.sourceId]);
  }, [vsData, awaySahaKadro]);

  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, {
      toValue: 1,
      duration: 380,
      useNativeDriver: true,
    }).start();
  }, [mode, formation, vsMode, awayMode, awayFormation, fade]);

  const handleSoloPosition = (slot, pct) => {
    onPositionChange?.(slot.id, pct);
  };

  const handleVsPosition = (slot, pct) => {
    onVsPositionChange?.(slot.side, slot.sourceId, pct);
  };

  const handleSoloPress = (slot) => onSlotPress?.(slot);

  const handleHomePress = (slot) => {
    onSlotPress?.({ ...slot, id: slot.sourceId });
  };

  return (
    <View style={styles.pitchContainer}>
      <Animated.View
        style={[styles.pitch, { opacity: fade }]}
        onLayout={(event) => {
          const { width: w, height: h } = event.nativeEvent.layout;
          setPitchSize({ width: w, height: h });
        }}
      >
        <View style={styles.pitchTint} />
        <View style={styles.centerLine} />
        <View style={styles.centerCircle} />
        <View style={styles.penaltyAreaTop} />
        <View style={styles.penaltyAreaBottom} />
        <View style={styles.goalTop} />
        <View style={styles.goalBottom} />

        {vsMode ? (
          <View style={styles.vsBadge} pointerEvents="none">
            <Text style={styles.vsBadgeText}>VS</Text>
          </View>
        ) : null}

        {showWatermark ? <PitchWatermark /> : null}

        {pitchSize.width > 0 && !vsMode && showTactics ? (
          <TacticalOverlay
            pitchSize={pitchSize}
            slots={singleSlots}
            sahaKadro={sahaKadro}
            customPositions={overlayPositions}
            hiddenSlotId={draggingSlotId}
          />
        ) : null}

        {pitchSize.width > 0 &&
          !vsMode &&
          singleSlots.map((slot) => (
            <DraggablePlayer
              key={`solo-${mode}-${formation}-${slot.id}`}
              slot={slot}
              player={sahaKadro[slot.id]}
              customPosition={customPositions[slot.id]}
              pitchSize={pitchSize}
              kit={kit}
              onSlotPress={handleSoloPress}
              onPositionChange={handleSoloPosition}
              onTacticDrag={showTactics ? handleTacticDrag : undefined}
            />
          ))}

        {pitchSize.width > 0 &&
          vsMode &&
          awayFilled.map((slot) => (
            <DraggablePlayer
              key={`away-${awayMode}-${awayFormation}-${slot.id}`}
              slot={slot}
              player={awaySahaKadro[slot.sourceId]}
              customPosition={vsAwayPositions[slot.sourceId]}
              pitchSize={pitchSize}
              kit={awayKit}
              onPositionChange={handleVsPosition}
              hideMeta
              compact
              dragSide="away"
            />
          ))}

        {pitchSize.width > 0 &&
          vsMode &&
          homeFilled.map((slot) => (
            <DraggablePlayer
              key={`home-${mode}-${formation}-${slot.id}`}
              slot={slot}
              player={sahaKadro[slot.sourceId]}
              customPosition={vsHomePositions[slot.sourceId]}
              pitchSize={pitchSize}
              kit={kit}
              onSlotPress={handleHomePress}
              onPositionChange={handleVsPosition}
              hideMeta
              compact
              dragSide="home"
            />
          ))}
      </Animated.View>
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
  pitchContainer: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 4,
  },
  pitch: {
    flex: 1,
    backgroundColor: colors.pitch,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.28)',
    position: 'relative',
    overflow: 'hidden',
  },
  pitchTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.pitchDeep,
    opacity: 0.35,
  },
  centerLine: {
    position: 'absolute',
    top: '50%',
    width: '100%',
    height: 2,
    backgroundColor: colors.pitchLine,
  },
  centerCircle: {
    position: 'absolute',
    top: '38%',
    left: '28%',
    width: width * 0.38,
    height: width * 0.38,
    borderRadius: (width * 0.38) / 2,
    borderWidth: 2,
    borderColor: colors.pitchLine,
  },
  penaltyAreaTop: {
    position: 'absolute',
    top: 0,
    left: '22%',
    width: '56%',
    height: '16%',
    borderWidth: 2,
    borderTopWidth: 0,
    borderColor: colors.pitchLine,
  },
  penaltyAreaBottom: {
    position: 'absolute',
    bottom: 0,
    left: '22%',
    width: '56%',
    height: '16%',
    borderWidth: 2,
    borderBottomWidth: 0,
    borderColor: colors.pitchLine,
  },
  goalTop: {
    position: 'absolute',
    top: 0,
    left: '38%',
    width: '24%',
    height: '5%',
    borderWidth: 2,
    borderTopWidth: 0,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  goalBottom: {
    position: 'absolute',
    bottom: 0,
    left: '38%',
    width: '24%',
    height: '5%',
    borderWidth: 2,
    borderBottomWidth: 0,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  vsBadge: {
    position: 'absolute',
    top: '47%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 5,
  },
  vsBadgeText: {
    backgroundColor: 'rgba(8,10,14,0.55)',
    color: '#fff',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 2,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  watermarkLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 45, // oyuncuların üstünde — paylaşımda köşe filigranı görünsün
  },
  watermark: {
    position: 'absolute',
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1.1,
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
    backgroundColor: 'rgba(8, 16, 12, 0.55)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(217, 249, 157, 0.45)',
  },
  wmTL: { top: 12, left: 12 },
  wmTR: { top: 12, right: 12 },
  wmBL: { bottom: 12, left: 12 },
  wmBR: { bottom: 12, right: 12 },
  playerSlot: {
    position: 'absolute',
    left: 0,
    top: 0,
    alignItems: 'center',
    width: SLOT_WIDTH,
    marginLeft: -SLOT_OFFSET_X,
  },
  nameBadge: {
    backgroundColor: colors.chipDark,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    marginTop: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    maxWidth: 70,
  },
  nameBadgeCompact: {
    paddingHorizontal: 5,
    maxWidth: 62,
  },
  playerName: {
    color: colors.onDark,
    fontSize: 8,
    fontWeight: '800',
    textAlign: 'center',
  },
  instructionChip: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(8,16,12,0.78)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
    maxWidth: 76,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  instructionDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  instructionText: {
    color: colors.onDark,
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  });
}
