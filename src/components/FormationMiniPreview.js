import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getFormationSlots } from '../constants/initialData';
import { useTheme, useThemedStyles } from '../theme';

/**
 * Küçük diziliş önizlemesi — takım kurma ekranı için.
 */
export default function FormationMiniPreview({
  teamSize = 7,
  formation = '2-3-1',
  height = 168,
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const slots = useMemo(
    () => getFormationSlots(teamSize, formation) || [],
    [teamSize, formation]
  );

  return (
    <View style={[styles.pitch, { height }]}>
      <View style={styles.centerLine} />
      <View style={styles.centerDot} />
      <View style={styles.boxTop} />
      <View style={styles.boxBottom} />

      {slots.map((slot) => {
        const isGk = slot.role === 'GK';
        return (
          <View
            key={slot.id}
            style={[
              styles.dot,
              {
                top: slot.top,
                left: slot.left,
                backgroundColor: isGk ? colors.jerseyGk : colors.jerseyBronze,
                borderColor: isGk
                  ? colors.jerseyGkLight
                  : colors.jerseyBronzeLight,
              },
            ]}
          />
        );
      })}

      <View style={styles.badge}>
        <Text style={styles.badgeText}>
          {teamSize}v{teamSize} · {formation}
        </Text>
      </View>
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    pitch: {
      width: '100%',
      borderRadius: 16,
      backgroundColor: colors.pitch,
      borderWidth: 1.5,
      borderColor: 'rgba(255,255,255,0.22)',
      overflow: 'hidden',
      position: 'relative',
    },
    centerLine: {
      position: 'absolute',
      top: '50%',
      left: 0,
      right: 0,
      height: 1.5,
      backgroundColor: colors.pitchLine,
    },
    centerDot: {
      position: 'absolute',
      top: '46%',
      left: '46%',
      width: '8%',
      aspectRatio: 1,
      borderRadius: 99,
      borderWidth: 1.5,
      borderColor: colors.pitchLine,
    },
    boxTop: {
      position: 'absolute',
      top: 0,
      left: '28%',
      width: '44%',
      height: '14%',
      borderWidth: 1.5,
      borderTopWidth: 0,
      borderColor: colors.pitchLine,
    },
    boxBottom: {
      position: 'absolute',
      bottom: 0,
      left: '28%',
      width: '44%',
      height: '14%',
      borderWidth: 1.5,
      borderBottomWidth: 0,
      borderColor: colors.pitchLine,
    },
    dot: {
      position: 'absolute',
      width: 12,
      height: 12,
      marginLeft: -6,
      marginTop: -6,
      borderRadius: 6,
      borderWidth: 1.5,
    },
    badge: {
      position: 'absolute',
      bottom: 8,
      alignSelf: 'center',
      left: 0,
      right: 0,
      alignItems: 'center',
    },
    badgeText: {
      backgroundColor: 'rgba(8,10,14,0.75)',
      overflow: 'hidden',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      color: '#fff',
      fontSize: 11,
      fontWeight: '800',
    },
  });
}
