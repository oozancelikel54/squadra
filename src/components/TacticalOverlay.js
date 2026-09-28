import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import { getInstructionById } from '../constants/instructions';
import { getTacticalVisual } from '../constants/tacticalVisuals';

const SLOT_WIDTH = 58;
const SLOT_OFFSET_X = 12;
const JERSEY_CY = 24;

function parsePercent(value) {
  if (typeof value === 'number') return value;
  return parseFloat(String(value).replace('%', '')) || 0;
}

function playerCenter(slot, custom, pitchW, pitchH) {
  const top = custom?.top ?? slot.top;
  const left = custom?.left ?? slot.left;
  const x = (parsePercent(left) / 100) * pitchW;
  const y = (parsePercent(top) / 100) * pitchH;
  return {
    cx: x - SLOT_OFFSET_X + SLOT_WIDTH / 2,
    cy: y + JERSEY_CY,
  };
}

/** İnce chevron uçlu ok — dış kontur + iç renk (yeşil sahada okunur) */
function StrokeArrow({
  x1,
  y1,
  x2,
  y2,
  color,
  weight = 2,
  dashed = false,
  head = 8,
}) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const hx = x2 - Math.cos(angle) * (head * 0.35);
  const hy = y2 - Math.sin(angle) * (head * 0.35);
  const left = {
    x: x2 - head * Math.cos(angle - Math.PI / 7),
    y: y2 - head * Math.sin(angle - Math.PI / 7),
  };
  const right = {
    x: x2 - head * Math.cos(angle + Math.PI / 7),
    y: y2 - head * Math.sin(angle + Math.PI / 7),
  };
  const shaft = `M ${x1} ${y1} L ${hx} ${hy}`;
  const tip = `M ${left.x} ${left.y} L ${x2} ${y2} L ${right.x} ${right.y}`;
  const dash = dashed ? '5 4' : undefined;

  return (
    <G>
      <Path
        d={shaft}
        stroke="rgba(8,16,12,0.55)"
        strokeWidth={weight + 2.4}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={dash}
      />
      <Path
        d={tip}
        stroke="rgba(8,16,12,0.55)"
        strokeWidth={weight + 1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d={shaft}
        stroke={color}
        strokeWidth={weight}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={dash}
        opacity={0.95}
      />
      <Path
        d={tip}
        stroke={color}
        strokeWidth={weight}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity={0.98}
      />
    </G>
  );
}

function OriginDot({ cx, cy, color }) {
  return (
    <G>
      <Circle cx={cx} cy={cy} r={5.5} fill="rgba(8,16,12,0.45)" />
      <Circle cx={cx} cy={cy} r={3.2} fill={color} opacity={0.95} />
      <Circle cx={cx} cy={cy} r={1.2} fill="#fff" opacity={0.85} />
    </G>
  );
}

function renderMark(mark) {
  const { key, cx, cy, color, visual } = mark;
  const w = visual.weight || 2;
  const len = visual.length || 40;
  const r = visual.r || 24;

  switch (visual.kind) {
    case 'thrust':
      return (
        <G key={key}>
          <OriginDot cx={cx} cy={cy} color={color} />
          <StrokeArrow
            x1={cx}
            y1={cy - 12}
            x2={cx}
            y2={cy - len}
            color={color}
            weight={w}
            head={9}
          />
          <StrokeArrow
            x1={cx - 9}
            y1={cy - 8}
            x2={cx - 14}
            y2={cy - len * 0.72}
            color={color}
            weight={w - 0.4}
            head={7}
          />
          <StrokeArrow
            x1={cx + 9}
            y1={cy - 8}
            x2={cx + 14}
            y2={cy - len * 0.72}
            color={color}
            weight={w - 0.4}
            head={7}
          />
        </G>
      );

    case 'brace':
      return (
        <G key={key}>
          <Circle
            cx={cx}
            cy={cy}
            r={r + 3}
            stroke="rgba(8,16,12,0.4)"
            strokeWidth={w + 2}
            fill="none"
            strokeDasharray="3 5"
          />
          <Circle
            cx={cx}
            cy={cy}
            r={r}
            stroke={color}
            strokeWidth={w}
            fill={`${color}18`}
            strokeDasharray="3 5"
            opacity={0.95}
          />
          <Circle cx={cx} cy={cy} r={4} fill={`${color}55`} />
        </G>
      );

    case 'spread':
      return (
        <G key={key}>
          <OriginDot cx={cx} cy={cy} color={color} />
          <StrokeArrow
            x1={cx - 10}
            y1={cy}
            x2={cx - len}
            y2={cy}
            color={color}
            weight={w}
            head={8}
          />
          <StrokeArrow
            x1={cx + 10}
            y1={cy}
            x2={cx + len}
            y2={cy}
            color={color}
            weight={w}
            head={8}
          />
        </G>
      );

    case 'loft': {
      const midX = cx + 10;
      const midY = cy - len * 0.55;
      const endY = cy - len;
      const d = `M ${cx} ${cy - 10} Q ${midX} ${midY} ${cx} ${endY}`;
      return (
        <G key={key}>
          <OriginDot cx={cx} cy={cy} color={color} />
          <Path
            d={d}
            stroke="rgba(8,16,12,0.5)"
            strokeWidth={w + 2.2}
            fill="none"
            strokeLinecap="round"
            strokeDasharray="5 4"
          />
          <Path
            d={d}
            stroke={color}
            strokeWidth={w}
            fill="none"
            strokeLinecap="round"
            strokeDasharray="5 4"
            opacity={0.95}
          />
          <StrokeArrow
            x1={cx}
            y1={endY + 10}
            x2={cx}
            y2={endY}
            color={color}
            weight={w}
            head={8}
          />
        </G>
      );
    }

    case 'link':
      return (
        <G key={key}>
          <OriginDot cx={cx} cy={cy} color={color} />
          <StrokeArrow
            x1={cx}
            y1={cy - 8}
            x2={cx}
            y2={cy - len}
            color={color}
            weight={w}
            head={6}
          />
          <StrokeArrow
            x1={cx - 3}
            y1={cy - 6}
            x2={cx - 14}
            y2={cy - len * 0.85}
            color={color}
            weight={w - 0.2}
            head={5}
          />
          <StrokeArrow
            x1={cx + 3}
            y1={cy - 6}
            x2={cx + 14}
            y2={cy - len * 0.85}
            color={color}
            weight={w - 0.2}
            head={5}
          />
        </G>
      );

    case 'lock':
      return (
        <G key={key}>
          <Circle
            cx={cx}
            cy={cy}
            r={r + 2}
            stroke="rgba(8,16,12,0.45)"
            strokeWidth={w + 2}
            fill="none"
          />
          <Circle
            cx={cx}
            cy={cy}
            r={r}
            stroke={color}
            strokeWidth={w}
            fill={`${color}20`}
            opacity={0.96}
          />
          <Circle
            cx={cx}
            cy={cy}
            r={r - 7}
            stroke={color}
            strokeWidth={1.2}
            fill="none"
            opacity={0.7}
          />
          <Circle cx={cx} cy={cy} r={2.5} fill={color} />
        </G>
      );

    case 'burst':
      return (
        <G key={key}>
          <OriginDot cx={cx} cy={cy} color={color} />
          <StrokeArrow
            x1={cx - 5}
            y1={cy - 8}
            x2={cx - 5}
            y2={cy - len}
            color={color}
            weight={w}
            head={8}
            dashed
          />
          <StrokeArrow
            x1={cx + 5}
            y1={cy - 4}
            x2={cx + 5}
            y2={cy - len + 6}
            color={color}
            weight={w}
            head={8}
          />
        </G>
      );

    case 'tempo':
      return (
        <G key={key}>
          <Path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            stroke="rgba(8,16,12,0.45)"
            strokeWidth={w + 2}
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            stroke={color}
            strokeWidth={w}
            fill="none"
            strokeLinecap="round"
            opacity={0.92}
          />
          <Path
            d={`M ${cx + r - 2} ${cy + 3} A ${r} ${r} 0 0 1 ${cx - r + 2} ${cy + 3}`}
            stroke={color}
            strokeWidth={w}
            fill="none"
            strokeLinecap="round"
            strokeDasharray="3 4"
            opacity={0.7}
          />
          <OriginDot cx={cx} cy={cy} color={color} />
        </G>
      );

    case 'strike':
      return (
        <G key={key}>
          <OriginDot cx={cx} cy={cy} color={color} />
          <StrokeArrow
            x1={cx}
            y1={cy - 10}
            x2={cx}
            y2={cy - len}
            color={color}
            weight={w}
            head={10}
          />
          <Circle
            cx={cx}
            cy={cy - len - 2}
            r={3}
            fill={color}
            opacity={0.85}
          />
        </G>
      );

    case 'curve': {
      const left = `M ${cx - 4} ${cy + 2} Q ${cx - 22} ${cy - len * 0.45} ${cx - 16} ${cy - len}`;
      const right = `M ${cx + 4} ${cy + 2} Q ${cx + 22} ${cy - len * 0.45} ${cx + 16} ${cy - len}`;
      return (
        <G key={key}>
          <OriginDot cx={cx} cy={cy} color={color} />
          {[left, right].map((d, i) => (
            <G key={`${key}-c${i}`}>
              <Path
                d={d}
                stroke="rgba(8,16,12,0.5)"
                strokeWidth={w + 2.2}
                fill="none"
                strokeLinecap="round"
              />
              <Path
                d={d}
                stroke={color}
                strokeWidth={w}
                fill="none"
                strokeLinecap="round"
                opacity={0.95}
              />
            </G>
          ))}
          <StrokeArrow
            x1={cx - 16}
            y1={cy - len + 8}
            x2={cx - 16}
            y2={cy - len}
            color={color}
            weight={w}
            head={6}
          />
          <StrokeArrow
            x1={cx + 16}
            y1={cy - len + 8}
            x2={cx + 16}
            y2={cy - len}
            color={color}
            weight={w}
            head={6}
          />
        </G>
      );
    }

    default:
      return null;
  }
}

/**
 * Profesyonel taktik katmanı — yayın grafiği dili.
 */
export default function TacticalOverlay({
  pitchSize,
  slots = [],
  sahaKadro = {},
  customPositions = {},
  hiddenSlotId = null,
}) {
  const { width: pitchW, height: pitchH } = pitchSize || {};

  const { marks, zones } = useMemo(() => {
    if (!pitchW || !pitchH) return { marks: [], zones: new Set() };

    const nextMarks = [];
    const nextZones = new Set();
    const hiddenKey =
      hiddenSlotId == null ? null : String(hiddenSlotId);

    slots.forEach((slot) => {
      if (hiddenKey != null && String(slot.id) === hiddenKey) return;

      const player = sahaKadro[slot.id];
      if (!player?.instructionId) return;
      const instruction = getInstructionById(player.instructionId);
      const visual = getTacticalVisual(player.instructionId);
      if (!instruction || !visual) return;

      const { cx, cy } = playerCenter(
        slot,
        customPositions[slot.id],
        pitchW,
        pitchH
      );
      nextMarks.push({
        key: `tac-${slot.id}-${player.instructionId}`,
        cx,
        cy,
        color: instruction.color,
        visual,
      });
      if (visual.zone) nextZones.add(visual.zone);
    });

    return { marks: nextMarks, zones: nextZones };
  }, [pitchW, pitchH, slots, sahaKadro, customPositions, hiddenSlotId]);

  if (!pitchW || !pitchH || (marks.length === 0 && zones.size === 0)) {
    return null;
  }

  return (
    <View style={styles.layer} pointerEvents="none">
      <Svg width={pitchW} height={pitchH}>
        <Defs>
          <LinearGradient id="pressWash" x1="0" y1="1" x2="0" y2="0">
            <Stop offset="0%" stopColor="#ef4444" stopOpacity="0" />
            <Stop offset="55%" stopColor="#ef4444" stopOpacity="0.08" />
            <Stop offset="100%" stopColor="#ef4444" stopOpacity="0.22" />
          </LinearGradient>
          <RadialGradient id="pressCore" cx="50%" cy="18%" rx="55%" ry="28%">
            <Stop offset="0%" stopColor="#ef4444" stopOpacity="0.2" />
            <Stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </RadialGradient>
          <LinearGradient id="wideL" x1="1" y1="0" x2="0" y2="0">
            <Stop offset="0%" stopColor="#22c55e" stopOpacity="0" />
            <Stop offset="100%" stopColor="#22c55e" stopOpacity="0.16" />
          </LinearGradient>
          <LinearGradient id="wideR" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor="#22c55e" stopOpacity="0" />
            <Stop offset="100%" stopColor="#22c55e" stopOpacity="0.16" />
          </LinearGradient>
        </Defs>

        {zones.has('press') ? (
          <G>
            <Ellipse
              cx={pitchW / 2}
              cy={pitchH * 0.16}
              rx={pitchW * 0.48}
              ry={pitchH * 0.2}
              fill="url(#pressWash)"
            />
            <Ellipse
              cx={pitchW / 2}
              cy={pitchH * 0.14}
              rx={pitchW * 0.42}
              ry={pitchH * 0.16}
              fill="url(#pressCore)"
            />
            <Path
              d={`M ${pitchW * 0.12} ${pitchH * 0.28} Q ${pitchW / 2} ${pitchH * 0.06} ${pitchW * 0.88} ${pitchH * 0.28}`}
              stroke="rgba(239,68,68,0.35)"
              strokeWidth={1.4}
              fill="none"
              strokeDasharray="4 6"
            />
          </G>
        ) : null}

        {zones.has('wide') ? (
          <G>
            <Path
              d={`M 0 0 L ${pitchW * 0.14} 0 L ${pitchW * 0.1} ${pitchH} L 0 ${pitchH} Z`}
              fill="url(#wideL)"
            />
            <Path
              d={`M ${pitchW} 0 L ${pitchW * 0.86} 0 L ${pitchW * 0.9} ${pitchH} L ${pitchW} ${pitchH} Z`}
              fill="url(#wideR)"
            />
            <Path
              d={`M ${pitchW * 0.08} ${pitchH * 0.12} L ${pitchW * 0.08} ${pitchH * 0.88}`}
              stroke="rgba(34,197,94,0.35)"
              strokeWidth={1.2}
              strokeDasharray="3 5"
            />
            <Path
              d={`M ${pitchW * 0.92} ${pitchH * 0.12} L ${pitchW * 0.92} ${pitchH * 0.88}`}
              stroke="rgba(34,197,94,0.35)"
              strokeWidth={1.2}
              strokeDasharray="3 5"
            />
          </G>
        ) : null}

        {marks.map(renderMark)}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 6,
  },
});
