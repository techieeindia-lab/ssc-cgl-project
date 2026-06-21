import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';

type Props = {
  icon: string;
  progress: number; // 0-100
  color: string;
  size?: number;
};

export default function ProgressRing({ icon, progress, color, size = 44 }: Props) {
  const clamped = Math.min(100, Math.max(0, progress));
  const ringWidth = 3;
  const innerSize = size - ringWidth * 2 - 2; // 1px gap between ring and inner
  // Pick ring color: gray when empty, accent color when there's progress
  const ringColor = clamped > 0 ? color : COLORS.border;
  // Opacity dims the icon when no progress
  const iconOpacity = clamped > 0 ? 1 : 0.35;
  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      {/* Outer ring */}
      <View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: ringWidth,
            borderColor: ringColor,
          },
        ]}
      />
      {/* Inner circle with icon */}
      <View
        style={[
          styles.inner,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
            backgroundColor: COLORS.bg_card,
          },
        ]}
      >
        <Text style={[styles.icon, { opacity: iconOpacity }]}>{icon}</Text>
      </View>
      {/* Percentage badge */}
      <View
        style={[
          styles.badge,
          { backgroundColor: clamped > 0 ? color : COLORS.text_muted },
        ]}
      >
        <Text style={styles.badgeText}>{clamped}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
  },
  inner: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 14,
  },
  badge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    borderRadius: 7,
    paddingHorizontal: 3,
    paddingVertical: 1,
    minWidth: 22,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 7,
    fontWeight: '800',
    color: '#fff',
  },
});
