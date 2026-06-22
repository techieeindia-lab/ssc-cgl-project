import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../src/theme/colors';
import { useTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import { QUIZ_TOPICS } from '../../src/constants/examConfig';
import { getMistakesByTag } from '../../src/services/mistakeService';

const SUBJECT_META: Record<string, { nameKey: string; section: 'QA' | 'GIR'; icon: string; color: string }> = {
  quant: { nameKey: 'practice.subjectCards.quant', section: 'QA', icon: '🔢', color: '#E74C3C' },
  reasoning: { nameKey: 'practice.subjectCards.reasoning', section: 'GIR', icon: '🧠', color: '#9B59B6' },
};

const TOOL_LINKS = [
  { icon: '📐', key: 'formulaSheet', route: '/tools/formula-sheet' },
  { icon: '📝', key: 'workedExamples', route: '/tools/worked-examples' },
  { icon: '⚡', key: 'speedDrill', route: '/quiz/speed' },
  { icon: '❌', key: 'mistakeBank', route: '/quiz/revision' },
] as const;

export default function SubjectPracticeScreen() {
  const router = useRouter();
  const { subject } = useLocalSearchParams<{ subject: string }>();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();

  const meta = SUBJECT_META[subject ?? ''];
  const topics = meta ? QUIZ_TOPICS[meta.section] : [];

  const [mistakeCounts, setMistakeCounts] = useState<Record<string, number>>({});

  useFocusEffect(
    useCallback(() => {
      if (!user || !meta) return;
      (async () => {
        const counts: Record<string, number> = {};
        for (const topic of topics) {
          try {
            const qs = await getMistakesByTag(user.uid, topic.tag, 1);
            counts[topic.tag] = qs.length;
          } catch { /* ignore */ }
        }
        setMistakeCounts(counts);
      })();
    }, [user, meta?.section]),
  );

  if (!meta) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Unknown subject</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>{t('common.goBack')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={COLORS.bg_primary} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>{t('common.goBack')}</Text>
        </TouchableOpacity>
        <Text style={styles.heading}>{meta.icon} {t(meta.nameKey)}</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {topics.map((topic) => {
          const mistakeCount = mistakeCounts[topic.tag] ?? 0;

          return (
            <View key={topic.tag} style={styles.topicCard}>
              {/* Tap card body → 10-question quiz */}
              <TouchableOpacity
                style={styles.topicBody}
                activeOpacity={0.75}
                onPress={() =>
                  router.push({
                    pathname: '/quiz/play',
                    params: { type: 'topic', section: meta.section, tag: topic.tag, count: '10' },
                  })
                }
              >
                <View style={[styles.topicIconWrap, { backgroundColor: meta.color + '22' }]}>
                  <Text style={styles.topicIcon}>{meta.icon}</Text>
                </View>
                <View style={styles.topicInfo}>
                  <Text style={styles.topicLabel}>{topic.label}</Text>
                  <Text style={styles.topicCta}>{t('practice.topicPractice.startQuiz')}</Text>
                </View>
              </TouchableOpacity>

              {/* 4 icon tool links */}
              <View style={styles.toolRow}>
                {/* Formula Sheet */}
                <TouchableOpacity
                  style={styles.toolTile}
                  activeOpacity={0.7}
                  onPress={() => router.push({ pathname: '/tools/formula-sheet', params: { tag: topic.tag } } as any)}
                >
                  <Text style={styles.toolIcon}>📐</Text>
                  <Text style={styles.toolLabel}>{t('practice.topicPractice.formulaSheet')}</Text>
                </TouchableOpacity>

                {/* Worked Examples */}
                <TouchableOpacity
                  style={styles.toolTile}
                  activeOpacity={0.7}
                  onPress={() => router.push({ pathname: '/tools/worked-examples', params: { tag: topic.tag } } as any)}
                >
                  <Text style={styles.toolIcon}>📝</Text>
                  <Text style={styles.toolLabel}>{t('practice.topicPractice.workedExamples')}</Text>
                </TouchableOpacity>

                {/* Speed Drill */}
                <TouchableOpacity
                  style={styles.toolTile}
                  activeOpacity={0.7}
                  onPress={() =>
                    router.push({
                      pathname: '/quiz/speed',
                      params: { tag: topic.tag, section: meta.section },
                    })
                  }
                >
                  <Text style={styles.toolIcon}>⚡</Text>
                  <Text style={styles.toolLabel}>{t('practice.topicPractice.speedDrill')}</Text>
                </TouchableOpacity>

                {/* Mistake Bank */}
                <TouchableOpacity
                  style={styles.toolTile}
                  activeOpacity={0.7}
                  onPress={() =>
                    user
                      ? router.push({ pathname: '/quiz/revision', params: { tag: topic.tag } } as any)
                      : router.push('/(auth)/login')
                  }
                >
                  <Text style={styles.toolIcon}>❌</Text>
                  <Text style={styles.toolLabel}>
                    {mistakeCount > 0
                      ? t('practice.topicPractice.mistakeCount', { count: mistakeCount })
                      : t('practice.topicPractice.noMistakes')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg_primary },
  center: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorText: { fontSize: 16, color: COLORS.text_primary, marginBottom: 12 },
  backLink: { color: COLORS.accent_light, fontWeight: '700', fontSize: 14 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12,
  },
  back: { color: COLORS.accent_light, fontWeight: '700', fontSize: 14 },
  heading: { color: COLORS.text_primary, fontWeight: '900', fontSize: 18 },

  list: { paddingHorizontal: 16, paddingTop: 8 },

  topicCard: {
    backgroundColor: COLORS.bg_card, borderRadius: 14, marginBottom: 12,
    borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden',
  },
  topicBody: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 14, paddingVertical: 14,
  },
  topicIconWrap: {
    width: 42, height: 42, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  topicIcon: { fontSize: 20 },
  topicInfo: { flex: 1 },
  topicLabel: { fontSize: 14, fontWeight: '700', color: COLORS.text_primary },
  topicCta: { fontSize: 11, color: COLORS.accent_light, fontWeight: '700', marginTop: 2 },

  toolRow: {
    flexDirection: 'row', borderTopWidth: 1, borderTopColor: COLORS.border,
    paddingVertical: 8, paddingHorizontal: 8, gap: 4,
  },
  toolTile: {
    flex: 1, alignItems: 'center', gap: 3,
    paddingVertical: 8, borderRadius: 10,
  },
  toolIcon: { fontSize: 16 },
  toolLabel: { fontSize: 9, fontWeight: '700', color: COLORS.text_secondary, textAlign: 'center', lineHeight: 12 },
});
