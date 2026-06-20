// src/components/study/OneLinerView.tsx
// Quick Q&A cards — tap to reveal the answer.

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import { getOneLiners, OneLiner } from '../../data/studyContent';

export default function OneLinerView({ section, tag }: { section: string; tag: string }) {
  const items: OneLiner[] = getOneLiners(section, tag);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyEmoji}>⚡</Text>
        <Text style={styles.emptyTxt}>No one-liners for this topic yet.</Text>
      </View>
    );
  }

  const toggle = (i: number) => {
    const next = new Set(revealed);
    next.has(i) ? next.delete(i) : next.add(i);
    setRevealed(next);
  };

  const known = [...revealed].filter((i) => items[i]).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <View style={styles.statBar}>
        <Text style={styles.statTxt}>
          {revealed.size}/{items.length} revealed
        </Text>
        <TouchableOpacity onPress={() => setRevealed(new Set(items.map((_, i) => i)))}>
          <Text style={styles.revealAll}>Reveal All</Text>
        </TouchableOpacity>
      </View>

      {items.map((item, i) => {
        const isOpen = revealed.has(i);
        return (
          <TouchableOpacity
            key={i}
            style={[styles.card, isOpen && styles.cardOpen]}
            activeOpacity={0.9}
            onPress={() => toggle(i)}
          >
            <View style={styles.cardHead}>
              <Text style={styles.qIdx}>Q{i + 1}</Text>
              <Text style={styles.qTxt}>{item.q}</Text>
            </View>
            {isOpen ? (
              <View style={styles.answerBox}>
                <Text style={styles.answerLbl}>Answer</Text>
                <Text style={styles.answerTxt}>{item.a}</Text>
              </View>
            ) : (
              <Text style={styles.tap}>Tap to reveal</Text>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg_primary },
  empty: { alignItems: 'center', padding: 48 },
  emptyEmoji: { fontSize: 48, marginBottom: 10 },
  emptyTxt: { color: COLORS.text_secondary, fontSize: 14, textAlign: 'center' },

  statBar: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 14,
  },
  statTxt: { color: COLORS.text_muted, fontSize: 12, fontWeight: '700' },
  revealAll: { color: COLORS.accent_light, fontSize: 13, fontWeight: '700' },

  card: {
    backgroundColor: COLORS.bg_card, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 10,
  },
  cardOpen: { borderColor: '#F39C12', backgroundColor: '#F39C1211' },
  cardHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  qIdx: {
    color: COLORS.accent_light, fontWeight: '900', fontSize: 11,
    paddingTop: 2,
  },
  qTxt: { color: COLORS.text_primary, fontSize: 14, lineHeight: 20, flex: 1 },
  tap: { color: COLORS.text_muted, fontSize: 11, marginTop: 8, fontStyle: 'italic' },
  answerBox: {
    marginTop: 12, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  answerLbl: { color: '#F39C12', fontSize: 10, fontWeight: '900', letterSpacing: 1, marginBottom: 4 },
  answerTxt: { color: COLORS.text_primary, fontSize: 14, fontWeight: '700', lineHeight: 20 },
});