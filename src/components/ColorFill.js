import React, { memo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { isLightColor } from '../constants/colorPalette';

/**
 * Renk dolgusu.
 * SVG yalnızca Android + açık renklerde (Force Dark); diğerleri düz View.
 */
function ColorFill({
  color,
  style,
  children,
  borderRadius = 0,
  borderColor,
  borderWidth = 0,
}) {
  const fill = color || '#22C55E';
  const useSvg = Platform.OS === 'android' && isLightColor(fill);

  return (
    <View
      collapsable={false}
      style={[
        {
          borderRadius,
          borderColor,
          borderWidth,
          overflow: 'hidden',
          backgroundColor: useSvg ? 'transparent' : fill,
        },
        style,
      ]}
    >
      {useSvg ? (
        <Svg
          pointerEvents="none"
          width="100%"
          height="100%"
          style={StyleSheet.absoluteFill}
          preserveAspectRatio="none"
        >
          <Rect x="0" y="0" width="100%" height="100%" fill={fill} />
        </Svg>
      ) : null}
      {children}
    </View>
  );
}

export default memo(ColorFill);
