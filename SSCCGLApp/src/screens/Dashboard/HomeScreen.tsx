import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Dimensions,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../theme/colors';
import { useTheme } from '../../context/ThemeContext';
import { SECTIONS } from '../../constants/examConfig';
import { getUserStats, getLevelFromXP, UserStats } from '../../services/coinService';
import { computeSectionMastery, SectionMastery } from '../../services/analyticsService';
import { getMistakesCount } from '../../services/mistakeService';
import { getTestHistory } from '../../services/testService';
import { fetchRecentArticles } from '../../services/currentAffairsService';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

type RecentTest = {
  id: string;
  score: number;
  maxScore: number;
  testType: string;
  createdAt?: { seconds: number } | null;
};

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [mastery, setMastery] = useState<SectionMastery[] | null>(null);
  const [mistakesCount, setMistakesCount] = useState(0);
  const [lastTest, setLastTest] = useState<RecentTest | null>(null);
  const [caTitle, setCaTitle] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      Promise.all([
        getUserStats(user.uid),
        computeSectionMastery(user.uid),
        getMistakesCount(user.uid),
        getTestHistory(user.uid, 1),
        fetchRecentArticles(1),
      ]).then(([s, m, mc, h, ca]) => {
        setStats(s);
        setMastery(m.bySection);
        setMistakesCount(mc);
        setLastTest(h.length > 0 ? h[0] as RecentTest : null);
        setCaTitle(ca.length > 0 ? ca[0].title : null);
      }).catch(console.error);
    }, [user]),
  );

  const levelInfo = getLevelFromXP(stats?.xp ?? 0);
  const today = new Date().toISOString().split('T')[0];
  const quizDone = stats?.lastQuizDate === today;

  const greetingKey = () => {
    const h = new Date().getHours();
    if (h < 12) return 'home.greetingMorning';
    if (h < 17) return 'home.greetingAfternoon';
    return 'home.greetingEvening';
  };

  const missions = [
    {
      done: quizDone,
      label: quizDone ? t('home.missionDailyQuizDone') : t('home.missionDailyQuiz'),
      onPress: () => router.push({ pathname: '/quiz/play', params: { type: 'mix', count: '10' } }),
    },
    {
      done: mistakesCount === 0,
      label: mistakesCount === 0 ? t('home.missionReviseDone') : t('home.missionRevise'),
      onPress: () => router.push('/quiz/revision'),
    },
    {
      done: (stats?.totalTests ?? 0) > 0,
      label: (stats?.totalTests ?? 0) > 0 ? t('home.missionMockTestDone') : t('home.missionMockTest'),
      onPress: () => router.push('/(tabs)/test'),
    },
    {
      done: caTitle !== null,
      label: caTitle !== null ? t('home.missionCADone') : t('home.missionCA'),
      onPress: () => router.push('/current-affairs'),
    },
  ];
  const allDone = missions.every((m) => m.done);

  const sectionToTile = (s: typeof SECTIONS[0]) => {
    const m = mastery?.find((x) => x.section === s.id);
    const pct = m && m.attempted > 0 ? m.accuracy : null;

    // TODO: Replace with real routes when app/practice/[subject].tsx exists
    // and app/study/index.tsx supports initial tab param.
    const route = (): string => {
      if (s.id === 'QA') return '/quiz';           // TODO → /practice/quant
      if (s.id === 'GIR') return '/quiz';           // TODO → /practice/reasoning
      if (s.id === 'GA') return '/study';           // TODO → /study?tab=gk
      return '/study';                               // TODO → /study?tab=english
    };

    return (
      <TouchableOpacity
        key={s.id}
        style={[styles.masteryTile, { borderLeftColor: s.color }]}
        onPress={() => router.push(route() as any)}
        activeOpacity={0.75}
      >
        <Text style={styles.masteryIcon}>{s.icon}</Text>
        <Text style={styles.masteryShort}>{s.shortName}</Text>
        <Text style={[styles.masteryPct, { color: s.color }]}>
          {pct === null ? '—' : `${pct}%`}
        </Text>
        <View style={styles.masteryBar}>
          <View style={[styles.masteryBarFill, { backgroundColor: s.color, width: pct === null ? '0%' : `${pct}%` }]} />
        </View>
      </TouchableOpacity>
    );
  };

  const continueLabel = () => {
    if (!lastTest) return null;
    const date = lastTest.createdAt?.seconds
      ? new Date(lastTest.createdAt.seconds * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
      : '';
    return t('home.continueLastTest', {
      type: lastTest.testType === 'full' ? 'Full Mock' : lastTest.testType,
      date,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={COLORS.bg_primary} />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* 1. HEADER */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>{t(greetingKey())}</Text>
            <Text style={styles.appName}>{t('common.appName')}</Text>
            <Text style={styles.appSub}>{t('common.appSub')}</Text>
          </View>
          <TouchableOpacity style={styles.streakBadge} onPress={() => router.push('/(tabs)/profile')}>
            <Text style={styles.streakFire}>🔥</Text>
            <Text style={styles.streakCount}>{stats?.streak ?? 0}</Text>
            <Text style={styles.streakLabel}>{t('home.streak')}</Text>
          </TouchableOpacity>
        </View>

        {/* XP / COINS BAR */}
        <View style={styles.xpCard}>
          <View style={styles.xpLeft}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{t('home.level')}.{levelInfo.level}</Text>
            </View>
            <View>
              <Text style={styles.levelTitle}>{levelInfo.title}</Text>
              <Text style={styles.xpLabel}>{stats?.xp ?? 0} {t('home.xp')}</Text>
            </View>
          </View>
          <View style={styles.coinsBadge}>
            <Text style={styles.coinsIcon}>{t('home.coins')}</Text>
            <Text style={styles.coinsCount}>{stats?.coins ?? 0}</Text>
          </View>
        </View>
        {levelInfo.nextLevel && (
          <View style={styles.xpBarWrapper}>
            <View style={styles.xpBarBg}>
              <View style={[styles.xpBarFill, { width: `${levelInfo.progress}%` }]} />
            </View>
            <Text style={styles.xpBarLabel}>
              {Math.round(levelInfo.progress)}% {t('home.to')} {levelInfo.nextLevel.title}
            </Text>
          </View>
        )}

        {/* 2. TODAY'S MISSION */}
        <Text style={styles.sectionTitle}>{t('home.todaysMission')}</Text>
        <View style={styles.missionCard}>
          {missions.map((m, i) => (
            <TouchableOpacity
              key={i}
              style={styles.missionRow}
              onPress={m.onPress}
              activeOpacity={0.75}
            >
              <View style={[styles.missionCheck, m.done && styles.missionCheckDone]}>
                {m.done && <Text style={styles.missionCheckIcon}>✓</Text>}
              </View>
              <Text style={[styles.missionLabel, m.done && styles.missionLabelDone]}>
                {m.label}
              </Text>
            </TouchableOpacity>
          ))}
          {allDone && (
            <Text style={styles.missionBonus}>{t('home.missionEmpty')}</Text>
          )}
        </View>

        {/* 3. SECTION MASTERY */}
        <Text style={styles.sectionTitle}>{t('home.masteryTitle')}</Text>
        <View style={styles.masteryRow}>
          {SECTIONS.map(sectionToTile)}
        </View>

        {/* 4. CONTINUE CARD */}
        <Text style={styles.sectionTitle}>{t('home.continueTitle')}</Text>
        <TouchableOpacity
          style={styles.continueCard}
          onPress={() => lastTest ? router.push('/(tabs)/test') : router.push('/(tabs)/test')}
          activeOpacity={0.8}
        >
          {lastTest ? (
            <>
              <Text style={styles.continueLabel}>{continueLabel()}</Text>
              <Text style={styles.continueCta}>{t('home.continueStartTest')}</Text>
            </>
          ) : (
            <Text style={styles.continueEmpty}>{t('home.continueEmpty')}</Text>
          )}
        </TouchableOpacity>

        {/* 5. JUMP IN */}
        <Text style={styles.sectionTitle}>{t('home.jumpIn')}</Text>
        <View style={styles.jumpRow}>
          {[
            { icon: '⚡', label: t('home.jumpPractice'), route: '/(tabs)/practice' },
            { icon: '📝', label: t('home.jumpTest'), route: '/(tabs)/test' },
            { icon: '📚', label: t('home.jumpTopics'), route: '/study' },
            { icon: '📰', label: t('home.jumpCA'), route: '/current-affairs' },
          ].map((item, i) => (
            <TouchableOpacity
              key={i}
              style={styles.jumpTile}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.75}
            >
              <Text style={styles.jumpIcon}>{item.icon}</Text>
              <Text style={styles.jumpLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 6. CURRENT AFFAIRS PREVIEW */}
        <TouchableOpacity
          style={styles.caCard}
          onPress={() => router.push('/current-affairs')}
          activeOpacity={0.85}
        >
          <View style={styles.caHeader}>
            <Text style={styles.caTitle}>📰 {t('home.jumpCA')}</Text>
            <Text style={styles.caArrow}>{t('home.caReadMore')}</Text>
          </View>
          {caTitle ? (
            <Text style={styles.caPreview} numberOfLines={2}>
              {t('home.caPreview', { title: caTitle })}
            </Text>
          ) : (
            <Text style={styles.caEmpty}>{t('home.caEmpty')}</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg_primary },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
  },
  greeting: { fontSize: 13, color: COLORS.text_secondary, marginBottom: 4 },
  appName: { fontSize: 28, fontWeight: '900', color: COLORS.text_primary },
  appSub: { fontSize: 14, fontWeight: '300', color: COLORS.accent_light, letterSpacing: 3, marginTop: -2 },
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

  sectionTitle: {
    fontSize: 15, fontWeight: '800', color: COLORS.text_primary,
    paddingHorizontal: 20, marginBottom: 10,
  },

  // Today's Mission
  missionCard: {
    marginHorizontal: 20, marginBottom: 20,
    backgroundColor: COLORS.bg_card, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: COLORS.border,
  },
  missionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 8,
  },
  missionCheck: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  missionCheckDone: {
    backgroundColor: '#27AE60', borderColor: '#27AE60',
  },
  missionCheckIcon: { color: '#fff', fontSize: 12, fontWeight: '900' },
  missionLabel: { fontSize: 13, fontWeight: '600', color: COLORS.text_primary, flex: 1 },
  missionLabelDone: { color: COLORS.text_muted, textDecorationLine: 'line-through' },
  missionBonus: { fontSize: 11, color: COLORS.accent_light, textAlign: 'center', marginTop: 6, fontWeight: '700' },

  // Section Mastery Tiles
  masteryRow: {
    flexDirection: 'row', paddingHorizontal: 12, gap: 8, marginBottom: 20,
  },
  masteryTile: {
    flex: 1, backgroundColor: COLORS.bg_card, borderRadius: 12, padding: 10,
    borderWidth: 1, borderColor: COLORS.border, borderLeftWidth: 4, gap: 4,
  },
  masteryIcon: { fontSize: 18 },
  masteryShort: { fontSize: 9, fontWeight: '800', color: COLORS.accent_light, letterSpacing: 0.5 },
  masteryPct: { fontSize: 16, fontWeight: '900' },
  masteryBar: { height: 3, backgroundColor: COLORS.bg_secondary, borderRadius: 2, overflow: 'hidden' },
  masteryBarFill: { height: '100%', borderRadius: 2 },

  // Continue Card
  continueCard: {
    marginHorizontal: 20, marginBottom: 20,
    backgroundColor: COLORS.bg_card, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: COLORS.border,
  },
  continueLabel: { fontSize: 13, color: COLORS.text_secondary, marginBottom: 6 },
  continueCta: { fontSize: 14, fontWeight: '800', color: COLORS.accent_light },
  continueEmpty: { fontSize: 13, color: COLORS.text_muted },

  // Jump In
  jumpRow: {
    flexDirection: 'row', paddingHorizontal: 12, gap: 8, marginBottom: 20,
  },
  jumpTile: {
    flex: 1, backgroundColor: COLORS.bg_card, borderRadius: 12, padding: 12,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, gap: 6,
  },
  jumpIcon: { fontSize: 22 },
  jumpLabel: { fontSize: 10, fontWeight: '700', color: COLORS.text_primary, textAlign: 'center' },

  // Current Affairs Preview
  caCard: {
    marginHorizontal: 20, marginBottom: 20,
    backgroundColor: COLORS.bg_card, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: COLORS.border,
  },
  caHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8,
  },
  caTitle: { fontSize: 14, fontWeight: '800', color: COLORS.text_primary },
  caArrow: { fontSize: 12, fontWeight: '700', color: COLORS.accent_light },
  caPreview: { fontSize: 13, color: COLORS.text_secondary, lineHeight: 18 },
  caEmpty: { fontSize: 13, color: COLORS.text_muted },
});
