// src/components/study/EbookView.tsx
// Chapter list → chapter reader. Tap a chapter to read it; tap back to list.
//
// Premium gate: signed-out users AND free users see only the first
// chapter, truncated. Premium users see the full chapter set.

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../../theme/colors';
import { EbookChapter } from '../../data/studyContent';
import { fetchEbookChapters, checkPremiumGate } from '../../services/studyService';
import { useAuth } from '../../context/AuthContext';

const PREVIEW_CHARS = 200;

export default function EbookView({ section, tag }: { section: string; tag: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const [chapters, setChapters] = useState<EbookChapter[] | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetchEbookChapters(section, tag),
      checkPremiumGate(user?.uid),
    ]).then(([c, p]) => {
      if (cancelled) return;
      setChapters(c);
      setIsPremium(p);
    });
    return () => { cancelled = true; };
  }, [section, tag, user?.uid]);

  if (chapters === null) {
    return (
      <View style={styles.empty}>
        <ActivityIndicator color={COLORS.accent} size="large" />
      </View>
    );
  }

  if (chapters.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyEmoji}>📖</Text>
        <Text style={styles.emptyTxt}>No chapters for this topic yet.</Text>
      </View>
    );
  }

  // Effective chapter list: premium → all, free → first chapter only.
  const visibleChapters = isPremium ? chapters : chapters.slice(0, 1);
  const locked = !isPremium;

  if (active !== null) {
    const ch = visibleChapters[active];
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

        {locked && ch.content.length > PREVIEW_CHARS && (
          <View style={styles.gateOverlay}>
            <Text style={styles.gateEmoji}>🔒</Text>
            <Text style={styles.gateTitle}>Continue reading with Premium</Text>
            <Text style={styles.gateSub}>
              You're seeing a preview. Upgrade to unlock all chapters of every e-book.
            </Text>
            <TouchableOpacity
              style={styles.gateBtn}
              onPress={() => router.push('/profile/premium' as any)}
            >
              <Text style={styles.gateBtnTxt}>
                {user ? 'Upgrade to Premium' : 'Sign in or Upgrade'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.chNav}>
          <TouchableOpacity
            style={[styles.chNavBtn, active === 0 && { opacity: 0.4 }]}
            disabled={active === 0}
            onPress={() => setActive((a) => (a === null ? 0 : a - 1))}
          >
            <Text style={styles.chNavBtnTxt}>← Previous</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chNavBtn, active === visibleChapters.length - 1 && { opacity: 0.4 }]}
            disabled={active === visibleChapters.length - 1}
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
      {chapters.map((ch, i) => {
        const isLocked = locked && i > 0;
        return (
          <TouchableOpacity
            key={i}
            style={[styles.chapterRow, isLocked && styles.chapterRowLocked]}
            activeOpacity={isLocked ? 1 : 0.85}
            onPress={() => {
              if (isLocked) router.push('/profile/premium' as any);
              else setActive(i);
            }}
          >
            <View style={styles.chNum}>
              <Text style={styles.chNumTxt}>{i + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.chRowTitle}>{ch.title}</Text>
              <Text style={styles.chRowMeta}>⏱ {ch.readTime}</Text>
            </View>
            <Text style={styles.chRowArrow}>{isLocked ? '🔒' : '›'}</Text>
          </TouchableOpacity>
        );
      })}
      {locked && chapters.length > 1 && (
        <TouchableOpacity
          style={styles.upgradeHint}
          onPress={() => router.push('/profile/premium' as any)}
        >
          <Text style={styles.upgradeHintTxt}>
            🔒 {chapters.length - 1} more chapter{chapters.length - 1 === 1 ? '' : 's'} locked.{' '}
            <Text style={styles.upgradeHintLink}>Upgrade →</Text>
          </Text>
        </TouchableOpacity>
      )}
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
  chapterRowLocked: { opacity: 0.55 },
  chNum: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: COLORS.accent_dark, alignItems: 'center', justifyContent: 'center',
  },
  chNumTxt: { color: COLORS.accent_light, fontWeight: '900', fontSize: 14 },
  chRowTitle: { color: COLORS.text_primary, fontWeight: '700', fontSize: 14 },
  chRowMeta: { color: COLORS.text_muted, fontSize: 11, marginTop: 3 },
  chRowArrow: { color: COLORS.text_muted, fontSize: 20 },

  upgradeHint: {
    backgroundColor: '#F39C1222', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: '#F39C12', marginTop: 4,
  },
  upgradeHintTxt: { color: COLORS.text_secondary, fontSize: 12, lineHeight: 18 },
  upgradeHintLink: { color: '#F39C12', fontWeight: '800' },

  gateOverlay: {
    marginTop: 18, padding: 18, borderRadius: 14,
    backgroundColor: COLORS.accent + '15',
    borderWidth: 1, borderColor: COLORS.accent, alignItems: 'center',
  },
  gateEmoji: { fontSize: 30, marginBottom: 8 },
  gateTitle: { color: COLORS.text_primary, fontSize: 15, fontWeight: '800', marginBottom: 6 },
  gateSub: { color: COLORS.text_secondary, fontSize: 12, textAlign: 'center', lineHeight: 18, marginBottom: 14 },
  gateBtn: {
    backgroundColor: COLORS.accent, paddingHorizontal: 22,
    paddingVertical: 11, borderRadius: 10,
  },
  gateBtnTxt: { color: '#fff', fontWeight: '800', fontSize: 13 },
});