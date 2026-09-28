import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import JerseyNode from './JerseyNode';
import { getInstructionById } from '../constants/instructions';
import { useI18n } from '../i18n/LanguageContext';
import { useThemedStyles, colors as fallbackColors } from '../theme';

export default function PlayerCard({
  name = '',
  number,
  subText,
  kitColor = fallbackColors.jerseyBronze,
  numberColor = '#ffffff',
  borderColor,
  isGoalkeeper = false,
  instructionId = null,
  onPitch = false,
  onPress,
}) {
  const { t, ti } = useI18n();
  const styles = useThemedStyles(createStyles);
  const instruction = ti(getInstructionById(instructionId));

  return (
    <TouchableOpacity
      style={[styles.card, onPitch && styles.cardOnPitch]}
      activeOpacity={0.82}
      onPress={onPress}
    >
      <JerseyNode
        number={number}
        primary={kitColor}
        numberColor={numberColor}
        borderColor={borderColor || numberColor}
        size={42}
        animateIn={false}
      />

      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          {isGoalkeeper ? (
            <View style={styles.gkTag}>
              <Text style={styles.gkTagText}>GK</Text>
            </View>
          ) : null}
        </View>
        {!!subText && (
          <Text style={styles.sub} numberOfLines={1}>
            {subText}
          </Text>
        )}
        {instruction ? (
          <View style={styles.instructionRow}>
            <View
              style={[styles.instructionDot, { backgroundColor: instruction.color }]}
            />
            <Text style={styles.instructionText}>{instruction.title}</Text>
          </View>
        ) : null}
      </View>

      <View
        style={[
          styles.statusPill,
          onPitch ? styles.statusPitch : styles.statusBench,
        ]}
      >
        <Text style={styles.statusText}>
          {onPitch ? t('card.onPitch') : t('card.bench')}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 16,
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 12,
      shadowColor: colors.cardShadow,
      shadowOpacity: 1,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 2,
    },
    cardOnPitch: {
      borderColor: colors.accent,
      backgroundColor: colors.surfaceSelected,
    },
    info: { flex: 1, minWidth: 0 },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    name: {
      flexShrink: 1,
      fontSize: 15,
      fontWeight: '800',
      color: colors.text,
    },
    gkTag: {
      backgroundColor: colors.accentSoft,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
    },
    gkTagText: {
      fontSize: 10,
      fontWeight: '900',
      color: colors.accentBright,
    },
    sub: {
      marginTop: 3,
      fontSize: 12,
      color: colors.textDim,
      fontWeight: '600',
    },
    instructionRow: {
      marginTop: 5,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    instructionDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    instructionText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textDim,
    },
    statusPill: {
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: 999,
    },
    statusPitch: {
      backgroundColor: colors.accentSoft,
    },
    statusBench: {
      backgroundColor: colors.surfaceSoft,
    },
    statusText: {
      fontSize: 11,
      fontWeight: '800',
      color: colors.text,
    },
  });
}
