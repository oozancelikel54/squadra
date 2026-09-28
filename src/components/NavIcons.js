import React from 'react';
import { View } from 'react-native';

/** Hafif çizgi ikonlar — harici icon paketi yok */

export function ShirtIcon({ color = '#94a3b8', size = 20 }) {
  const w = size * 0.72;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: w,
          height: size * 0.78,
          borderWidth: 1.8,
          borderColor: color,
          borderRadius: 4,
          marginTop: size * 0.08,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: size * 0.06,
          width: size * 0.42,
          height: size * 0.18,
          borderWidth: 1.8,
          borderColor: color,
          borderRadius: 8,
          backgroundColor: 'transparent',
        }}
      />
    </View>
  );
}

export function TeamIcon({ color = '#94a3b8', size = 20 }) {
  const r = size * 0.16;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ flexDirection: 'row', gap: size * 0.12, marginBottom: size * 0.08 }}>
        <View style={{ width: r * 2, height: r * 2, borderRadius: r, backgroundColor: color }} />
        <View style={{ width: r * 2, height: r * 2, borderRadius: r, backgroundColor: color }} />
      </View>
      <View
        style={{
          width: size * 0.72,
          height: size * 0.28,
          borderRadius: 6,
          borderWidth: 1.8,
          borderColor: color,
        }}
      />
    </View>
  );
}

export function PlayerAddIcon({ color = '#94a3b8', size = 20 }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: size * 0.28,
          height: size * 0.28,
          borderRadius: size * 0.14,
          backgroundColor: color,
          marginBottom: 2,
          marginRight: size * 0.12,
        }}
      />
      <View
        style={{
          width: size * 0.5,
          height: size * 0.26,
          borderRadius: 5,
          borderWidth: 1.8,
          borderColor: color,
          marginRight: size * 0.12,
        }}
      />
      <View
        style={{
          position: 'absolute',
          right: size * 0.08,
          top: size * 0.28,
          width: size * 0.28,
          height: 1.8,
          backgroundColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute',
          right: size * 0.18,
          top: size * 0.18,
          width: 1.8,
          height: size * 0.28,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

export function SettingsIcon({ color = '#94a3b8', size = 20 }) {
  const outer = size * 0.72;
  const inner = size * 0.28;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: outer,
          height: outer,
          borderRadius: outer / 2,
          borderWidth: 1.8,
          borderColor: color,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            width: inner,
            height: inner,
            borderRadius: inner / 2,
            backgroundColor: color,
          }}
        />
      </View>
    </View>
  );
}

export function FieldIcon({ color = '#ffffff', size = 24 }) {
  return (
    <View
      style={{
        width: size,
        height: size * 0.72,
        borderWidth: 1.8,
        borderColor: color,
        borderRadius: 3,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          position: 'absolute',
          width: 1.8,
          height: '100%',
          backgroundColor: color,
        }}
      />
      <View
        style={{
          width: size * 0.28,
          height: size * 0.28,
          borderRadius: size * 0.14,
          borderWidth: 1.6,
          borderColor: color,
        }}
      />
    </View>
  );
}

export function ShareIcon({ color = '#ffffff', size = 15 }) {
  const dot = size * 0.28;
  return (
    <View style={{ width: size, height: size, justifyContent: 'center' }}>
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: size * 0.08,
          width: dot,
          height: dot,
          borderRadius: dot / 2,
          backgroundColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute',
          right: 0,
          top: size * 0.08,
          width: dot,
          height: dot,
          borderRadius: dot / 2,
          backgroundColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: size * 0.36,
          bottom: size * 0.08,
          width: dot,
          height: dot,
          borderRadius: dot / 2,
          backgroundColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: size * 0.2,
          top: size * 0.22,
          width: size * 0.42,
          height: 1.5,
          backgroundColor: color,
          transform: [{ rotate: '28deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: size * 0.2,
          top: size * 0.42,
          width: size * 0.42,
          height: 1.5,
          backgroundColor: color,
          transform: [{ rotate: '-28deg' }],
        }}
      />
    </View>
  );
}

