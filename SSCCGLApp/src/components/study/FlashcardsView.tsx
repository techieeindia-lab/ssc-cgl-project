// src/components/study/FlashcardsView.tsx
// Tap-to-flip flashcard deck. Cycles through flashcards one at a time
// with Previous/Next and a progress indicator.

import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import { getFlashcards, Flashcard } from '../../data/studyContent';

export default function FlashcardsView({ section, tag }: { section: string; tag: string }) {
  const cards: Flashcard[] = getFlashcards(section, tag);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;

  if (cards.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyEmoji}>🃏</Text>
        <Text style={styles.emptyTxt}>No flashcards for this topic yet.</Text>
      </View>
    );
  }

  const flip = () => {
    Animated.timing(flipAnim, {
      toValue: flipped ? 0 : 1,
      duration: 320,
      useNativeDriver: true,
    }).start();
    setFlipped(!flipped);
  };

  const rotate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  const rotateBack = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });
  const frontStyle = { transform: [{ rotateY: rotate }] };
  const backStyle  = { transform: [{ rotateY: rotateBack }] };

  const next = () => {
    setFlipped(false);
    flipAnim.setValue(0);
    setIdx((i) => (i + 1) % cards.length);
  };
  const prev = () => {
    setFlipped(false);
    flipAnim.setValue(0);
    setIdx((i) => (i - 1 + cards.length) % cards.length);
  };

  const card = cards[idx];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <Text style={styles.progress}>Card {idx + 1} of {cards.length}</Text>

      {/* Card */}
      <View style={styles.cardArea}>
        {/* Front */}
        <Animated.View style={[styles.card, styles.cardFront, frontStyle]}>
          <Text style={styles.side}>QUESTION</Text>
          <Text style={styles.cardText}>{card.front}</Text>
          <Text style={styles.tapHint}>Tap to flip</Text>
        </Animated.View>

        {/* Back (overlay only when flipped) */}
        {flipped && (
          <Animated.View style={[styles.card, styles.cardBack, backStyle]}>
            <Text style={styles.side}>ANSWER</Text>
            <Text style={styles.cardText}>{card.back}</Text>
          </Animated.View>
        )}

        {/* Tappable layer (always full size) */}
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={flip} activeOpacity={1} />
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.ctrlBtn} onPress={prev}>
          <Text style={styles.ctrlBtnTxt}>← Previous</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.ctrlBtn, styles.ctrlPrimary]} onPress={flip}>
          <Text style={[styles.ctrlBtnTxt, { color: '#fff' }]}>
            {flipped ? 'Show Question' : 'Show Answer'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.ctrlBtn} onPress={next}>
          <Text style={styles.ctrlBtnTxt}>Next →</Text>
        </TouchableOpacity>
      </View>

      {/* Dot indicators */}
      <View style={styles.dots}>
        {cards.map((_, i) => (
          <View key={i} style={[styles.dot, i === idx && styles.dotActive]} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg_primary },
  empty: { alignItems: 'center', padding: 48 },
  emptyEmoji: { fontSize: 48, marginBottom: 10 },
  emptyTxt: { color: COLORS.text_secondary, fontSize: 14, textAlign: 'center' },

  progress: {
    textAlign: 'center', color: COLORS.text_muted,
    fontSize: 11, fontWeight: '800', letterSpacing: 1,
    textTransform: 'uppercase', marginBottom: 14,
  },
  cardArea: {
    height: 320, marginBottom: 18,
    borderRadius: 18, overflow: 'hidden',
  },
  card: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 18, padding: 22, justifyContent: 'center',
    alignItems: 'center', borderWidth: 1.5,
    backfaceVisibility: 'hidden',
  },
  cardFront: { backgroundColor: COLORS.bg_card, borderColor: COLORS.accent_dark },
  cardBack:  { backgroundColor: '#27AE6015', borderColor: '#27AE60' },
  side: {
    position: 'absolute', top: 14, fontSize: 10, fontWeight: '900',
    letterSpacing: 2, color: COLORS.text_muted,
  },
  cardText: {
    color: COLORS.text_primary, fontSize: 18, fontWeight: '700',
    textAlign: 'center', lineHeight: 26,
  },
  tapHint: {
    position: 'absolute', bottom: 14, fontSize: 11,
    color: COLORS.text_muted, fontStyle: 'italic',
  },

  controls: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  ctrlBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    backgroundColor: COLORS.bg_card, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  ctrlPrimary: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  ctrlBtnTxt: { color: COLORS.text_primary, fontWeight: '800', fontSize: 13 },

  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: COLORS.bg_card,
  },
  dotActive: { backgroundColor: COLORS.accent, width: 22 },
});