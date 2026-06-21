// app/current-affairs/weekly-quiz.tsx
// Entry screen for the Current Affairs weekly quiz. Lists the current
// week's articles and starts a topic quiz (tag = 'current-affairs')
// using the existing /quiz/play infrastructure.

import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../src/theme/colors';
import {
  fetchWeeklyDigest, fetchRecentArticles, isoWeek,
  CurrentAffairsArticle, groupByWeek,
} from '../../src/services/currentAffairsService';

export default function WeeklyQuizEntry() {
  const router = useRouter();
  const { t } = useTranslation();
  const [articles, setArticles] = useState<CurrentAffairsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const now = isoWeek(new Date());
      let week = await fetchWeeklyDigest(now.year, now.week);
      if (week.length === 0) {
        // Fallback to the most recent week with content.
        const recent = await fetchRecentArticles(40);
        const groups = groupByWeek(recent);
        week = groups[0]?.items ?? [];
      }
      setArticles(week);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.accent} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg_primary} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>{t('currentAffairs.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.heading}>{t('currentAffairs.weeklyQuiz')}</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View style={styles.introBox}>
          <Text style={styles.introEmoji}>📰</Text>
          <Text style={styles.introTitle}>{t('currentAffairs.quizTitle')}</Text>
          <Text style={styles.introSub}>{t('currentAffairs.quizSub')}</Text>
        </View>

        {articles.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyTxt}>{t('currentAffairs.noArticlesDigest')}</Text>
          </View>
        ) : (
          <View style={styles.articlesCard}>
            <Text style={styles.articlesHeader}>{t('currentAffairs.thisWeekArticles', { count: articles.length })}</Text>
            {articles.slice(0, 5).map((a) => (
              <View key={a.id} style={styles.articleRow}>
                <Text style={styles.articleDot}>•</Text>
                <Text style={styles.articleTxt} numberOfLines={2}>{a.title}</Text>
              </View>
            ))}
            {articles.length > 5 ? (
              <Text style={styles.moreTxt}>{t('currentAffairs.more', { count: articles.length - 5 })}</Text>
            ) : null}
          </View>
        )}

        <TouchableOpacity
          style={[styles.startBtn, articles.length === 0 && { opacity: 0.5 }]}
          onPress={() => {
            router.push({
              pathname: '/quiz/play',
              params: { type: 'topic', section: 'GA', tag: 'current-affairs', count: '10' },
            } as any);
          }}
        >
          <Text style={styles.startBtnTxt}>{t('currentAffairs.startQuiz')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg_primary },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg_primary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12,
  },
  back: { color: COLORS.accent_light, fontWeight: '700', fontSize: 14, width: 50 },
  heading: { color: COLORS.text_primary, fontWeight: '900', fontSize: 18 },

  introBox: {
    backgroundColor: COLORS.bg_card, borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: COLORS.accent_dark, alignItems: 'center', marginBottom: 20,
  },
  introEmoji: { fontSize: 36, marginBottom: 8 },
  introTitle: { color: COLORS.text_primary, fontWeight: '900', fontSize: 16, marginBottom: 6 },
  introSub: { color: COLORS.text_secondary, fontSize: 12, textAlign: 'center', lineHeight: 18 },

  articlesCard: {
    backgroundColor: COLORS.bg_card, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 20,
  },
  articlesHeader: { color: COLORS.text_muted, fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 10 },
  articleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  articleDot: { color: COLORS.accent_light, fontSize: 14, lineHeight: 18 },
  articleTxt: { flex: 1, color: COLORS.text_primary, fontSize: 13, lineHeight: 18 },
  moreTxt: { color: COLORS.text_muted, fontSize: 11, fontStyle: 'italic', marginTop: 4 },

  startBtn: {
    backgroundColor: COLORS.accent, paddingVertical: 16, borderRadius: 14, alignItems: 'center',
  },
  startBtnTxt: { color: '#fff', fontWeight: '800', fontSize: 15 },

  emptyBox: { alignItems: 'center', padding: 32, marginBottom: 20 },
  emptyEmoji: { fontSize: 40, marginBottom: 8 },
  emptyTxt: { color: COLORS.text_secondary, fontSize: 13, textAlign: 'center' },
});