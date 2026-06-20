import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { COLORS } from '../../src/theme/colors';
import { useAuth } from '../../src/context/AuthContext';
import { getUserStats, getLevelFromXP, UserStats } from '../../src/services/coinService';
import { getTestHistory } from '../../src/services/testService';
import { SECTIONS } from '../../src/constants/examConfig';
import { computeSectionMastery, SectionMastery } from '../../src/services/analyticsService';
import { getMistakesCount } from '../../src/services/mistakeService';

type RecentTest = {
  id: string;
  score: number;
  maxScore: number;
  total: number;
  correct: number;
  wrong: number;
  skipped: number;
  testType: string;
  createdAt?: { seconds: number } | null;
};

export default function ProgressScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recent, setRecent] = useState<RecentTest[]>([]);
  const [mastery, setMastery] = useState<SectionMastery[] | null>(null);
  const [mistakesCount, setMistakesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!user) {
        setStats(null);
        setRecent([]);
        setMastery(null);
        setMistakesCount(0);
        setLoading(false);
        return;
      }
      let cancelled = false;
      (async () => {
        setLoading(true);
        try {
          const [s, h, m, mc] = await Promise.all([
            getUserStats(user.uid),
            getTestHistory(user.uid, 5),
            computeSectionMastery(user.uid),
            getMistakesCount(user.uid),
          ]);
          if (!cancelled) {
            setStats(s);
            setRecent(h as RecentTest[]);
            setMastery(m.bySection);
            setMistakesCount(mc);
          }
        } catch (e) {
          console.error('progress load error', e);
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => { cancelled = true; };
    }, [user]),
  );

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>My Progress</Text>
          <Text style={styles.sub}>Track your performance</Text>
        </View>
        <View style={styles.signedOutCard}>
          <Text style={styles.signedOutEmoji}>📊</Text>
          <Text style={styles.signedOutTitle}>Sign in to see your progress</Text>
          <Text style={styles.signedOutSub}>
            Your test history, accuracy trends, and section-wise strengths will appear here.
          </Text>
          <TouchableOpacity
            style={styles.signedOutBtn}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.signedOutBtnTxt}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={COLORS.accent} size="large" />
      </View>
    );
  }

  const levelInfo = getLevelFromXP(stats?.xp ?? 0);
  const testsTaken = stats?.totalTests ?? 0;
  const bestScore = stats?.bestScore ?? 0;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>My Progress</Text>
          <Text style={styles.sub}>Track your performance</Text>
        </View>

        {/* KPI strip */}
        <View style={styles.statsRow}>
          <KPI value={String(testsTaken)} label="Tests" color={COLORS.accent_light} />
          <KPI value={`${bestScore}%`}    label="Best"  color="#27AE60" />
          <KPI value={`${stats?.streak ?? 0}`} label="Streak" color="#F39C12" />
          <KPI value={`${stats?.xp ?? 0}`} label="XP"    color="#9B59B6" />
        </View>

        {/* Level card */}
        <View style={styles.levelCard}>
          <View style={styles.levelRow}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeTxt}>Lv.{levelInfo.level}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.levelTitle}>{levelInfo.title}</Text>
              <Text style={styles.levelXp}>{stats?.xp ?? 0} XP earned</Text>
            </View>
            <Text style={styles.coinsBox}>🪙 {stats?.coins ?? 0}</Text>
          </View>
          {levelInfo.nextLevel && (
            <View style={{ marginTop: 12 }}>
              <View style={styles.bar}>
                <View style={[styles.barFill, { width: `${levelInfo.progress}%` }]} />
              </View>
              <Text style={styles.barLbl}>
                {Math.round(levelInfo.progress)}% to {levelInfo.nextLevel.title}
              </Text>
            </View>
          )}
        </View>

        {/* Section mastery — real per-section accuracy from analyticsService */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Section Mastery</Text>
          {mistakesCount > 0 && (
            <TouchableOpacity
              style={styles.reviseBadge}
              onPress={() => router.push('/quiz/revision')}
            >
              <Text style={styles.reviseBadgeTxt}>🔁 {mistakesCount} to revise</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.sectionList}>
          {SECTIONS.map((s) => {
            const m = mastery?.find((x) => x.section === s.id);
            const pct = m && m.attempted > 0 ? m.accuracy : null;
            return (
              <View key={s.id} style={[styles.sectionCard, { borderLeftColor: s.color }]}>
                <Text style={styles.secEmoji}>{s.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.secName}>{s.shortName}</Text>
                  <View style={styles.secBar}>
                    <View
                      style={[
                        styles.secBarFill,
                        { backgroundColor: s.color, width: pct === null ? '0%' : `${pct}%` },
                      ]}
                    />
                  </View>
                </View>
                <Text style={[styles.secPct, { color: s.color }]}>
                  {pct === null ? '—' : `${pct}%`}
                </Text>
              </View>
            );
          })}
          {!mastery || mastery.every((m) => m.attempted === 0) ? (
            <Text style={styles.sectionHint}>
              Take a few tests to unlock section-wise accuracy breakdowns.
            </Text>
          ) : null}
        </View>

        {/* Recent tests */}
        <View style={styles.recentHeader}>
          <Text style={styles.sectionTitle}>Recent Tests</Text>
          {recent.length > 0 && (
            <TouchableOpacity onPress={() => router.push('/profile/history')}>
              <Text style={styles.seeAll}>See All ›</Text>
            </TouchableOpacity>
          )}
        </View>
        {recent.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📝</Text>
            <Text style={styles.emptyTxt}>No tests yet</Text>
            <Text style={styles.emptySub}>Take your first mock test from the Test tab.</Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => router.push('/(tabs)/test')}
            >
              <Text style={styles.emptyBtnTxt}>Start a Test →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.recentList}>
            {recent.map((r) => {
              const pct = Math.round((r.score / r.maxScore) * 100);
              const date = r.createdAt?.seconds
                ? new Date(r.createdAt.seconds * 1000).toLocaleDateString('en-IN', {
                    day: '2-digit', month: 'short',
                  })
                : '—';
              return (
                <View key={r.id} style={styles.recentRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.recentTitle}>
                      {r.testType === 'full' ? 'Full Mock' : r.testType}
                    </Text>
                    <Text style={styles.recentSub}>
                      {r.correct}✓ · {r.wrong}✗ · {r.skipped}—  •  {date}
                    </Text>
                  </View>
                  <Text style={[styles.recentScore, {
                    color: pct >= 60 ? '#27AE60' : pct >= 40 ? '#F39C12' : '#E74C3C',
                  }]}>
                    {pct}%
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

function KPI({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <View style={styles.kpi}>
      <Text style={[styles.kpiVal, { color }]}>{value}</Text>
      <Text style={styles.kpiLbl}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg_primary },
  center: { alignItems: 'center', justifyContent: 'center' },

  header: {
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 20,
  },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.text_primary },
  sub: { fontSize: 13, color: COLORS.text_secondary, marginTop: 4 },

  // Signed-out
  signedOutCard: {
    marginHorizontal: 20, marginTop: 8, padding: 24,
    backgroundColor: COLORS.bg_card, borderRadius: 16,
    borderWidth: 1, borderColor: COLORS.border, alignItems: 'center',
  },
  signedOutEmoji: { fontSize: 48, marginBottom: 12 },
  signedOutTitle: { fontSize: 17, fontWeight: '800', color: COLORS.text_primary, marginBottom: 6 },
  signedOutSub: {
    fontSize: 13, color: COLORS.text_secondary, textAlign: 'center',
    lineHeight: 19, marginBottom: 18,
  },
  signedOutBtn: {
    backgroundColor: COLORS.accent, paddingHorizontal: 28,
    paddingVertical: 12, borderRadius: 12,
  },
  signedOutBtnTxt: { color: '#fff', fontWeight: '800', fontSize: 14 },

  // KPIs
  statsRow: {
    flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 20,
  },
  kpi: {
    flex: 1, backgroundColor: COLORS.bg_card, borderRadius: 14,
    padding: 14, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  kpiVal: { fontSize: 22, fontWeight: '900' },
  kpiLbl: { fontSize: 10, color: COLORS.text_secondary, marginTop: 4 },

  // Level card
  levelCard: {
    marginHorizontal: 20, backgroundColor: COLORS.bg_card, borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: COLORS.border, marginBottom: 24,
  },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  levelBadge: {
    backgroundColor: COLORS.accent, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  levelBadgeTxt: { color: '#fff', fontWeight: '900', fontSize: 14 },
  levelTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text_primary },
  levelXp: { fontSize: 11, color: COLORS.text_secondary, marginTop: 2 },
  coinsBox: { fontSize: 16, fontWeight: '800', color: '#F39C12' },
  bar: { height: 6, backgroundColor: COLORS.bg_secondary, borderRadius: 6, overflow: 'hidden' },
  barFill: { height: 6, backgroundColor: COLORS.accent, borderRadius: 6 },
  barLbl: { fontSize: 10, color: COLORS.text_muted, marginTop: 6, textAlign: 'right' },

  // Section mastery
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingRight: 20,
  },
  sectionTitle: {
    fontSize: 15, fontWeight: '800', color: COLORS.text_primary,
    paddingHorizontal: 20, marginBottom: 12,
  },
  reviseBadge: {
    backgroundColor: '#F39C1222', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: '#F39C12',
    marginRight: 20, marginBottom: 12,
  },
  reviseBadgeTxt: { color: '#F39C12', fontSize: 11, fontWeight: '800' },
  sectionList: { paddingHorizontal: 20, marginBottom: 24, gap: 8 },
  sectionCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.bg_card, borderRadius: 12, padding: 14,
    borderLeftWidth: 4, borderWidth: 1, borderColor: COLORS.border,
  },
  secEmoji: { fontSize: 22 },
  secName: { fontSize: 13, fontWeight: '700', color: COLORS.text_primary, marginBottom: 6 },
  secBar: {
    height: 4, backgroundColor: COLORS.bg_secondary,
    borderRadius: 2, overflow: 'hidden',
  },
  secBarFill: { height: '100%', borderRadius: 2, width: '0%' },
  secPct: { fontSize: 12, fontWeight: '800', minWidth: 40, textAlign: 'right' },
  sectionHint: {
    fontSize: 11, color: COLORS.text_muted, textAlign: 'center', marginTop: 4,
  },

  // Recent
  recentHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingRight: 20,
  },
  seeAll: { fontSize: 13, color: COLORS.accent_light, fontWeight: '700' },
  recentList: { marginHorizontal: 20, gap: 8 },
  recentRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.bg_card, borderRadius: 12,
    padding: 14, borderWidth: 1, borderColor: COLORS.border,
  },
  recentTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text_primary },
  recentSub: { fontSize: 11, color: COLORS.text_secondary, marginTop: 3 },
  recentScore: { fontSize: 18, fontWeight: '900' },

  empty: {
    marginHorizontal: 20, alignItems: 'center',
    padding: 28, backgroundColor: COLORS.bg_card,
    borderRadius: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  emptyEmoji: { fontSize: 44, marginBottom: 8 },
  emptyTxt: { fontSize: 15, fontWeight: '700', color: COLORS.text_primary, marginBottom: 4 },
  emptySub: { fontSize: 12, color: COLORS.text_secondary, marginBottom: 16, textAlign: 'center' },
  emptyBtn: {
    backgroundColor: COLORS.accent, paddingHorizontal: 22,
    paddingVertical: 11, borderRadius: 10,
  },
  emptyBtnTxt: { color: '#fff', fontWeight: '800', fontSize: 13 },
});