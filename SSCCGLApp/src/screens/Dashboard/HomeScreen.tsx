import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Dimensions,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../theme/colors';
import { useTheme } from '../../context/ThemeContext';
import { SECTIONS } from '../../constants/examConfig';
import { getUserStats, getLevelFromXP, UserStats } from '../../services/coinService';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [stats, setStats] = useState<UserStats | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        getUserStats(user.uid).then(setStats).catch(console.error);
      }
    }, [user]),
  );

  const levelInfo = getLevelFromXP(stats?.xp ?? 0);

  const greetingKey = () => {
    const h = new Date().getHours();
    if (h < 12) return 'home.greetingMorning';
    if (h < 17) return 'home.greetingAfternoon';
    return 'home.greetingEvening';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={COLORS.bg_primary} />
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{t(greetingKey())}</Text>
            <Text style={styles.appName}>{t('common.appName')}</Text>
            <Text style={styles.appSub}>{t('common.appSub')}</Text>
            <Text style={styles.tagline}>{t('home.tagline')}</Text>
          </View>
          <TouchableOpacity style={styles.streakBadge} onPress={() => router.push('/(tabs)/profile')}>
            <Text style={styles.streakFire}>🔥</Text>
            <Text style={styles.streakCount}>{stats?.streak ?? 0}</Text>
            <Text style={styles.streakLabel}>{t('home.streak')}</Text>
          </TouchableOpacity>
        </View>

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

        <View style={styles.patternCard}>
          <View style={styles.patternHeader}>
            <Text style={styles.patternTitle}>{t('home.patternTitle')}</Text>
            <View style={styles.liveBadge}>
              <Text style={styles.liveText}>{t('home.patternLive')}</Text>
            </View>
          </View>
          <View style={styles.patternStats}>
            {[
              { num: '100', label: t('home.questions') },
              { num: '60',  label: t('home.minutes') },
              { num: '200', label: t('home.maxMarks') },
              { num: '-0.5',label: t('home.negMark') },
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

        <Text style={styles.sectionTitle}>{t('home.examSections')}</Text>
        <View style={styles.sectionsGrid}>
          {SECTIONS.map((section) => (
            <View key={section.id} style={[styles.sectionCard, { borderLeftColor: section.color }]}>
              <Text style={styles.sectionIcon}>{section.icon}</Text>
              <Text style={styles.sectionShort}>{section.shortName}</Text>
              <Text style={styles.sectionName} numberOfLines={2}>{section.name}</Text>
              <View style={styles.sectionMeta}>
                <Text style={styles.sectionMetaText}>25 {t('home.qs')}</Text>
                <Text style={[styles.sectionMetaText, { color: section.color }]}>15 {t('home.min')}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.quizHeader}>
          <Text style={styles.sectionTitle}>{t('home.quickQuiz')}</Text>
          <TouchableOpacity onPress={() => router.push('/quiz')}>
            <Text style={styles.seeAll}>{t('common.seeAll')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.quizCards}>
          <TouchableOpacity
            style={[styles.quizCard, { borderTopColor: COLORS.accent }]}
            onPress={() => router.push({ pathname: '/quiz/play', params: { type: 'mix', count: '10' } })}
            activeOpacity={0.85}
          >
            <Text style={styles.quizCardIcon}>🎲</Text>
            <Text style={styles.quizCardTitle}>{t('home.mixQuiz')}</Text>
            <Text style={styles.quizCardSub}>{t('home.mixQuizSub')}</Text>
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
            <Text style={styles.quizCardTitle}>{t('home.subjectQuiz')}</Text>
            <Text style={styles.quizCardSub}>{t('home.subjectQuizSub')}</Text>
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
            <Text style={styles.quizCardTitle}>{t('home.topicQuiz')}</Text>
            <Text style={styles.quizCardSub}>{t('home.topicQuizSub')}</Text>
            <View style={styles.quizCardReward}>
              <Text style={styles.quizCardRewardText}>+50 🪙</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>{t('home.quickPractice')}</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickCard} onPress={() => router.push('/(tabs)/test')}>
            <Text style={styles.quickIcon}>📄</Text>
            <Text style={styles.quickLabel}>{t('home.mockTest')}</Text>
            <Text style={styles.quickSub}>{t('home.mockTestSub')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickCard} onPress={() => router.push('/(tabs)/test')}>
            <Text style={styles.quickIcon}>📚</Text>
            <Text style={styles.quickLabel}>{t('home.prevYear')}</Text>
            <Text style={styles.quickSub}>{t('home.prevYearSub')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => router.push({ pathname: '/quiz/play', params: { type: 'mix', count: '10' } })}
          >
            <Text style={styles.quickIcon}>⚡</Text>
            <Text style={styles.quickLabel}>{t('home.dailyQuiz')}</Text>
            <Text style={styles.quickSub}>{t('home.dailyQuizSub')}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>{t('home.smartTools')}</Text>
        <View style={styles.toolsRow}>
          <TouchableOpacity style={styles.toolCard} onPress={() => router.push('/tools/calculator')}>
            <Text style={styles.toolIcon}>🧮</Text>
            <Text style={styles.toolLbl}>{t('home.calculator')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolCard} onPress={() => router.push('/tools/periodic-table')}>
            <Text style={styles.toolIcon}>⚛️</Text>
            <Text style={styles.toolLbl}>{t('home.periodicTable')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolCard} onPress={() => router.push('/tools/speed-math')}>
            <Text style={styles.toolIcon}>⏱️</Text>
            <Text style={styles.toolLbl}>{t('home.speedMath')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolCard} onPress={() => router.push('/tools')}>
            <Text style={styles.toolIcon}>🛠️</Text>
            <Text style={styles.toolLbl}>{t('home.allTools')}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>{t('home.exploreMore')}</Text>

        <TouchableOpacity
          activeOpacity={0.88}
          style={styles.featuredWrap}
          onPress={() => router.push('/study')}
        >
          <LinearGradient
            colors={['#2E86DE', '#9B59B6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.featuredCard}
          >
            <View style={styles.featuredIconsRow}>
              <Text style={styles.featuredIconSmall}>🃏</Text>
              <Text style={styles.featuredIconSmall}>📖</Text>
              <Text style={styles.featuredIconSmall}>🧠</Text>
              <Text style={styles.featuredIconSmall}>⚡</Text>
            </View>
            <Text style={styles.featuredTitle}>{t('home.topicMastery')}</Text>
            <Text style={styles.featuredSub}>{t('home.topicMasterySub')}</Text>
            <View style={styles.featuredCta}>
              <Text style={styles.featuredCtaText}>{t('home.exploreStudyHub')}</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.88}
          style={styles.featuredWrap}
          onPress={() => router.push('/current-affairs')}
        >
          <LinearGradient
            colors={['#F39C12', '#E74C3C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.featuredCard}
          >
            <Text style={styles.featuredIcon}>📰</Text>
            <Text style={styles.featuredTitle}>{t('home.currentAffairs')}</Text>
            <Text style={styles.featuredSub}>{t('home.currentAffairsSub')}</Text>
            <View style={styles.featuredCta}>
              <Text style={styles.featuredCtaText}>{t('home.readThisWeek')}</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.startButton}
          activeOpacity={0.85}
          onPress={() => router.push('/(tabs)/test')}
        >
          <Text style={styles.startButtonText}>{t('home.startFullMock')}</Text>
          <Text style={styles.startButtonSub}>{t('home.startFullMockSub')}</Text>
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

  // Featured notecards (Topic Mastery / Current Affairs)
  featuredWrap: {
    marginHorizontal: 20, marginBottom: 14, borderRadius: 18,
    overflow: 'hidden',
  },
  featuredCard: { padding: 20 },
  featuredIconsRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  featuredIconSmall: { fontSize: 22 },
  featuredIcon: { fontSize: 30, marginBottom: 8 },
  featuredTitle: { fontSize: 18, fontWeight: '900', color: '#fff', marginBottom: 6 },
  featuredSub: {
    fontSize: 12, color: 'rgba(255,255,255,0.85)', lineHeight: 17, marginBottom: 16,
  },
  featuredCta: {
    alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10,
  },
  featuredCtaText: { color: '#fff', fontWeight: '800', fontSize: 12 },

  startButton: {
    marginHorizontal: 20, backgroundColor: COLORS.accent, borderRadius: 16,
    paddingVertical: 18, alignItems: 'center',
  },
  startButtonText: { fontSize: 17, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  startButtonSub: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
});