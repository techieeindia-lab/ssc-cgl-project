// src/components/study/EbookView.tsx
// Chapter list → chapter reader. Tap a chapter to read it; tap back to list.

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import { getEbookChapters, EbookChapter } from '../../data/studyContent';

export default function EbookView({ section, tag }: { section: string; tag: string }) {
  const chapters: EbookChapter[] = getEbookChapters(section, tag);
  const [active, setActive] = useState<number | null>(null);

  if (chapters.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyEmoji}>📖</Text>
        <Text style={styles.emptyTxt}>No chapters for this topic yet.</Text>
      </View>
    );
  }

  if (active !== null) {
    const ch = chapters[active];
    return (
      <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <TouchableOpacity onPress={() => setActive(null)}>
          <Text style={styles.back}>← All Chapters</Text>
        </TouchableOpacity>
        <Text style={styles.chTitle}>{ch.title}</Text>
        <Text style={styles.chMeta}>⏱ {ch.readTime} read</Text>
        <View style={styles.divider} />
        {ch.content.split('\n').map((line, i) => {
          const trimmed = line.trim();
          if (!trimmed) return <View key={i} style={{ height: 10 }} />;
          if (trimmed.startsWith('•')) {
            return (
              <View key={i} style={styles.bullet}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.body}>{trimmed.slice(1).trim()}</Text>
              </View>
            );
          }
          return <Text key={i} style={styles.body}>{trimmed}</Text>;
        })}

        <View style={styles.chNav}>
          <TouchableOpacity
            style={[styles.chNavBtn, active === 0 && { opacity: 0.4 }]}
            disabled={active === 0}
            onPress={() => setActive((a) => (a === null ? 0 : a - 1))}
          >
            <Text style={styles.chNavBtnTxt}>← Previous</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chNavBtn, active === chapters.length - 1 && { opacity: 0.4 }]}
            disabled={active === chapters.length - 1}
            onPress={() => setActive((a) => (a === null ? 0 : a + 1))}
          >
            <Text style={styles.chNavBtnTxt}>Next →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <Text style={styles.listHeading}>Chapters</Text>
      {chapters.map((ch, i) => (
        <TouchableOpacity
          key={i}
          style={styles.chapterRow}
          activeOpacity={0.85}
          onPress={() => setActive(i)}
        >
          <View style={styles.chNum}>
            <Text style={styles.chNumTxt}>{i + 1}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.chRowTitle}>{ch.title}</Text>
            <Text style={styles.chRowMeta}>⏱ {ch.readTime}</Text>
          </View>
          <Text style={styles.chRowArrow}>›</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg_primary },
  empty: { alignItems: 'center', padding: 48 },
  emptyEmoji: { fontSize: 48, marginBottom: 10 },
  emptyTxt: { color: COLORS.text_secondary, fontSize: 14 },

  back: { color: COLORS.accent_light, fontWeight: '700', fontSize: 13, marginBottom: 16 },
  chTitle: { color: COLORS.text_primary, fontSize: 22, fontWeight: '900', marginBottom: 4 },
  chMeta: { color: COLORS.text_muted, fontSize: 12, marginBottom: 16 },
  divider: { height: 1, backgroundColor: COLORS.border, marginBottom: 18 },

  body: { color: COLORS.text_primary, fontSize: 15, lineHeight: 24, marginBottom: 10 },
  bullet: { flexDirection: 'row', marginBottom: 8 },
  bulletDot: { color: COLORS.accent_light, fontSize: 15, marginRight: 8, lineHeight: 24 },
  bodyBullet: { color: COLORS.text_primary, fontSize: 15, lineHeight: 24, flex: 1 },

  chNav: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, gap: 10 },
  chNavBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    backgroundColor: COLORS.bg_card, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  chNavBtnTxt: { color: COLORS.accent_light, fontWeight: '800' },

  listHeading: {
    color: COLORS.text_muted, fontSize: 11, fontWeight: '900',
    letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12,
  },
  chapterRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.bg_card, borderRadius: 12,
    padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border,
    gap: 12,
  },
  chNum: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: COLORS.accent_dark, alignItems: 'center', justifyContent: 'center',
  },
  chNumTxt: { color: COLORS.accent_light, fontWeight: '900', fontSize: 14 },
  chRowTitle: { color: COLORS.text_primary, fontWeight: '700', fontSize: 14 },
  chRowMeta: { color: COLORS.text_muted, fontSize: 11, marginTop: 3 },
  chRowArrow: { color: COLORS.text_muted, fontSize: 20 },
});