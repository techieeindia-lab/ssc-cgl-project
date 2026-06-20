// src/screens/Dashboard/HomeScreen.tsx
// ── FULL REPLACEMENT ──
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Dimensions,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { COLORS } from '../../theme/colors';
import { SECTIONS } from '../../constants/examConfig';
import { getUserStats, getLevelFromXP, UserStats } from '../../services/coinService';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        getUserStats(user.uid).then(setStats).catch(console.error);
      }
    }, [user]),
  );

  // Always compute levelInfo — falls back to 0 XP if stats not loaded yet
  const levelInfo = getLevelFromXP(stats?.xp ?? 0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg_primary} />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good Morning 👋</Text>
            <Text style={styles.appName}>SSC CGL</Text>
            <Text style={styles.appSub}>New Interface</Text>
            <Text style={styles.tagline}>New Pattern · Sectional Timing</Text>
          </View>
          <TouchableOpacity style={styles.streakBadge} onPress={() => router.push('/(tabs)/profile')}>
            <Text style={styles.streakFire}>🔥</Text>
            <Text style={styles.streakCount}>{stats?.streak ?? 0}</Text>
            <Text style={styles.streakLabel}>Streak</Text>
          </TouchableOpacity>
        </View>

        {/* XP / COINS BAR — always visible */}
        <View style={styles.xpCard}>
          <View style={styles.xpLeft}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>Lv.{levelInfo.level}</Text>
            </View>
            <View>
              <Text style={styles.levelTitle}>{levelInfo.title}</Text>
              <Text style={styles.xpLabel}>{stats?.xp ?? 0} XP</Text>
            </View>
          </View>
          <View style={styles.coinsBadge}>
            <Text style={styles.coinsIcon}>🪙</Text>
            <Text style={styles.coinsCount}>{stats?.coins ?? 0}</Text>
          </View>
        </View>
        {levelInfo.nextLevel && (
          <View style={styles.xpBarWrapper}>
            <View style={styles.xpBarBg}>
              <View style={[styles.xpBarFill, { width: `${levelInfo.progress}%` }]} />
            </View>
            <Text style={styles.xpBarLabel}>
              {Math.round(levelInfo.progress)}% to {levelInfo.nextLevel.title}
            </Text>
          </View>
        )}

        {/* PATTERN CARD */}
        <View style={styles.patternCard}>
          <View style={styles.patternHeader}>
            <Text style={styles.patternTitle}>📋 SSC CGL 2024 Pattern</Text>
            <View style={styles.liveBadge}>
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>
          <View style={styles.patternStats}>
            {[
              { num: '100', label: 'Questions' },
              { num: '60',  label: 'Minutes' },
              { num: '200', label: 'Max Marks' },
              { num: '-0.5',label: 'Neg. Mark' },
            ].map((s, i, arr) => (
              <React.Fragment key={s.label}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{s.num}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
                {i < arr.length - 1 && <View style={styles.statDivider} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* EXAM SECTIONS */}
        <Text style={styles.sectionTitle}>Exam Sections</Text>
        <View style={styles.sectionsGrid}>
          {SECTIONS.map((section) => (
            <View key={section.id} style={[styles.sectionCard, { borderLeftColor: section.color }]}>
              <Text style={styles.sectionIcon}>{section.icon}</Text>
              <Text style={styles.sectionShort}>{section.shortName}</Text>
              <Text style={styles.sectionName} numberOfLines={2}>{section.name}</Text>
              <View style={styles.sectionMeta}>
                <Text style={styles.sectionMetaText}>25 Qs</Text>
                <Text style={[styles.sectionMetaText, { color: section.color }]}>15 min</Text>
              </View>
            </View>
          ))}
        </View>

        {/* QUIZ SECTION — always rendered, no stats gate */}
        <View style={styles.quizHeader}>
          <Text style={styles.sectionTitle}>Quick Quiz</Text>
          <TouchableOpacity onPress={() => router.push('/quiz')}>
            <Text style={styles.seeAll}>See All ›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.quizCards}>
          <TouchableOpacity
            style={[styles.quizCard, { borderTopColor: COLORS.accent }]}
            onPress={() => router.push({ pathname: '/quiz/play', params: { type: 'mix', count: '10' } })}
            activeOpacity={0.85}
          >
            <Text style={styles.quizCardIcon}>🎲</Text>
            <Text style={styles.quizCardTitle}>Mix Quiz</Text>
            <Text style={styles.quizCardSub}>All subjects · 10 Qs</Text>
            <View style={styles.quizCardReward}>
              <Text style={styles.quizCardRewardText}>+100 🪙</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quizCard, { borderTopColor: '#9B59B6' }]}
            onPress={() => router.push('/quiz')}
            activeOpacity={0.85}
          >
            <Text style={styles.quizCardIcon}>📚</Text>
            <Text style={styles.quizCardTitle}>Subject Quiz</Text>
            <Text style={styles.quizCardSub}>Pick a subject</Text>
            <View style={styles.quizCardReward}>
              <Text style={styles.quizCardRewardText}>+50 🪙</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quizCard, { borderTopColor: '#27AE60' }]}
            onPress={() => router.push('/quiz')}
            activeOpacity={0.85}
          >
            <Text style={styles.quizCardIcon}>🎯</Text>
            <Text style={styles.quizCardTitle}>Topic Quiz</Text>
            <Text style={styles.quizCardSub}>Drill one topic</Text>
            <View style={styles.quizCardReward}>
              <Text style={styles.quizCardRewardText}>+50 🪙</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* QUICK PRACTICE */}
        <Text style={styles.sectionTitle}>Quick Practice</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickCard} onPress={() => router.push('/(tabs)/test')}>
            <Text style={styles.quickIcon}>📄</Text>
            <Text style={styles.quickLabel}>Mock Test</Text>
            <Text style={styles.quickSub}>Full 100 Qs</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickCard} onPress={() => router.push('/(tabs)/test')}>
            <Text style={styles.quickIcon}>📚</Text>
            <Text style={styles.quickLabel}>Prev. Year</Text>
            <Text style={styles.quickSub}>2017–2024</Text>
          </TouchableOpacity>
          {/* Fixed: Daily Quiz now goes to quiz engine, not practice tab */}
          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => router.push({ pathname: '/quiz/play', params: { type: 'mix', count: '10' } })}
          >
            <Text style={styles.quickIcon}>⚡</Text>
            <Text style={styles.quickLabel}>Daily Quiz</Text>
            <Text style={styles.quickSub}>10 Questions</Text>
          </TouchableOpacity>
        </View>

        {/* SMART TOOLS */}
        <Text style={styles.sectionTitle}>Smart Tools</Text>
        <View style={styles.toolsRow}>
          <TouchableOpacity style={styles.toolCard} onPress={() => router.push('/tools/calculator')}>
            <Text style={styles.toolIcon}>🧮</Text>
            <Text style={styles.toolLbl}>Calculator</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolCard} onPress={() => router.push('/tools/periodic-table')}>
            <Text style={styles.toolIcon}>⚛️</Text>
            <Text style={styles.toolLbl}>Periodic Table</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolCard} onPress={() => router.push('/tools/speed-math')}>
            <Text style={styles.toolIcon}>⏱️</Text>
            <Text style={styles.toolLbl}>Speed Math</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolCard} onPress={() => router.push('/tools')}>
            <Text style={styles.toolIcon}>🛠️</Text>
            <Text style={styles.toolLbl}>All Tools</Text>
          </TouchableOpacity>
        </View>

        {/* STUDY HUB */}
        <View style={styles.studyHeader}>
          <Text style={styles.sectionTitle}>Study Hub</Text>
          <TouchableOpacity onPress={() => router.push('/study')}>
            <Text style={styles.seeAll}>Open Hub ›</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.studyGrid}>
          <TouchableOpacity
            style={[styles.studyCard, { borderTopColor: '#E74C3C' }]}
            onPress={() => router.push('/study/flashcards/QA')}
          >
            <Text style={styles.studyEmoji}>🃏</Text>
            <Text style={styles.studyTitle}>Flashcards</Text>
            <Text style={styles.studySub}>Tap-flip recall</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.studyCard, { borderTopColor: '#2E86DE' }]}
            onPress={() => router.push('/study/ebook/GA')}
          >
            <Text style={styles.studyEmoji}>📖</Text>
            <Text style={styles.studyTitle}>E-Book</Text>
            <Text style={styles.studySub}>Short chapters</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.studyCard, { borderTopColor: '#9B59B6' }]}
            onPress={() => router.push('/study/mindmap/QA')}
          >
            <Text style={styles.studyEmoji}>🧠</Text>
            <Text style={styles.studyTitle}>Mind Map</Text>
            <Text style={styles.studySub}>Topic outlines</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.studyCard, { borderTopColor: '#F39C12' }]}
            onPress={() => router.push('/study/oneliner/EN')}
          >
            <Text style={styles.studyEmoji}>⚡</Text>
            <Text style={styles.studyTitle}>One-liners</Text>
            <Text style={styles.studySub}>Quick facts</Text>
          </TouchableOpacity>
        </View>

        {/* START BUTTON */}
        <TouchableOpacity
          style={styles.startButton}
          activeOpacity={0.85}
          onPress={() => router.push('/(tabs)/test')}
        >
          <Text style={styles.startButtonText}>🚀  Start Full Mock Test</Text>
          <Text style={styles.startButtonSub}>100 Questions · 60 Minutes · New Pattern</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg_primary },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 20,
  },
  greeting: { fontSize: 13, color: COLORS.text_secondary, marginBottom: 4 },
  appName: { fontSize: 28, fontWeight: '900', color: COLORS.text_primary },
  appSub: { fontSize: 14, fontWeight: '300', color: COLORS.accent_light, letterSpacing: 3, marginTop: -2 },
  tagline: { fontSize: 11, color: COLORS.accent_light, marginTop: 4 },
  streakBadge: {
    backgroundColor: COLORS.bg_card, borderRadius: 12, padding: 12,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, minWidth: 64,
  },
  streakFire: { fontSize: 20 },
  streakCount: { fontSize: 20, fontWeight: '800', color: '#F39C12' },
  streakLabel: { fontSize: 10, color: COLORS.text_secondary, marginTop: 2 },

  xpCard: {
    marginHorizontal: 20, backgroundColor: COLORS.bg_card, borderRadius: 14,
    padding: 14, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', borderWidth: 1, borderColor: COLORS.border, marginBottom: 8,
  },
  xpLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  levelBadge: { backgroundColor: COLORS.accent, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  levelText: { fontSize: 13, fontWeight: '900', color: '#fff' },
  levelTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text_primary },
  xpLabel: { fontSize: 11, color: COLORS.text_secondary, marginTop: 1 },
  coinsBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  coinsIcon: { fontSize: 18 },
  coinsCount: { fontSize: 18, fontWeight: '800', color: '#F39C12' },
  xpBarWrapper: { paddingHorizontal: 20, marginBottom: 20 },
  xpBarBg: { height: 6, backgroundColor: COLORS.bg_card, borderRadius: 6, overflow: 'hidden' },
  xpBarFill: { height: 6, backgroundColor: COLORS.accent, borderRadius: 6 },
  xpBarLabel: { fontSize: 10, color: COLORS.text_muted, marginTop: 4, textAlign: 'right' },

  patternCard: {
    marginHorizontal: 20, backgroundColor: COLORS.bg_card, borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: COLORS.accent_dark, marginBottom: 24,
  },
  patternHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16,
  },
  patternTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text_primary },
  liveBadge: { backgroundColor: '#E74C3C', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  liveText: { fontSize: 10, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  patternStats: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statItem: { alignItems: 'center', flex: 1 },
  statNumber: { fontSize: 20, fontWeight: '800', color: COLORS.accent_light },
  statLabel: { fontSize: 10, color: COLORS.text_secondary, marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: COLORS.border },

  sectionTitle: {
    fontSize: 16, fontWeight: '700', color: COLORS.text_primary,
    paddingHorizontal: 20, marginBottom: 12,
  },
  sectionsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, marginBottom: 24, gap: 8,
  },
  sectionCard: {
    backgroundColor: COLORS.bg_card, borderRadius: 12, padding: 14,
    width: (width - 40) / 2, borderLeftWidth: 4, borderWidth: 1, borderColor: COLORS.border,
  },
  sectionIcon: { fontSize: 22, marginBottom: 6 },
  sectionShort: { fontSize: 11, fontWeight: '800', color: COLORS.accent_light, letterSpacing: 1, marginBottom: 4 },
  sectionName: { fontSize: 12, color: COLORS.text_secondary, lineHeight: 17, marginBottom: 10 },
  sectionMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  sectionMetaText: { fontSize: 11, color: COLORS.text_muted, fontWeight: '600' },

  quizHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingRight: 20, marginBottom: 12,
  },
  seeAll: { fontSize: 13, color: COLORS.accent_light, fontWeight: '600' },
  quizCards: { flexDirection: 'row', paddingHorizontal: 12, gap: 8, marginBottom: 24 },
  quizCard: {
    flex: 1, backgroundColor: COLORS.bg_card, borderRadius: 14, padding: 14,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderTopWidth: 3,
  },
  quizCardIcon: { fontSize: 26, marginBottom: 8 },
  quizCardTitle: { fontSize: 12, fontWeight: '800', color: COLORS.text_primary, textAlign: 'center' },
  quizCardSub: { fontSize: 10, color: COLORS.text_secondary, marginTop: 3, textAlign: 'center' },
  quizCardReward: {
    marginTop: 8, backgroundColor: '#F39C1222', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3,
  },
  quizCardRewardText: { fontSize: 10, color: '#F39C12', fontWeight: '700' },

  quickActions: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 24 },
  quickCard: {
    flex: 1, backgroundColor: COLORS.bg_card, borderRadius: 12, padding: 14,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  quickIcon: { fontSize: 22, marginBottom: 6 },
  quickLabel: { fontSize: 11, fontWeight: '700', color: COLORS.text_primary, textAlign: 'center' },
  quickSub: { fontSize: 10, color: COLORS.text_secondary, marginTop: 3 },

  // Smart Tools
  toolsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 24 },
  toolCard: {
    flex: 1, backgroundColor: COLORS.bg_card, borderRadius: 12, padding: 12,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  toolIcon: { fontSize: 22, marginBottom: 6 },
  toolLbl: { fontSize: 10, fontWeight: '700', color: COLORS.text_primary, textAlign: 'center' },

  // Study Hub
  studyHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingRight: 20, marginBottom: 12,
  },
  studyGrid: {
    flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 8, marginBottom: 24,
  },
  studyCard: {
    width: (width - 40) / 2,
    backgroundColor: COLORS.bg_card, borderRadius: 14, padding: 14,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderTopWidth: 3,
  },
  studyEmoji: { fontSize: 28, marginBottom: 6 },
  studyTitle: { fontSize: 13, fontWeight: '800', color: COLORS.text_primary, textAlign: 'center' },
  studySub: { fontSize: 10, color: COLORS.text_secondary, marginTop: 3, textAlign: 'center' },

  startButton: {
    marginHorizontal: 20, backgroundColor: COLORS.accent, borderRadius: 16,
    paddingVertical: 18, alignItems: 'center',
  },
  startButtonText: { fontSize: 17, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  startButtonSub: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
});