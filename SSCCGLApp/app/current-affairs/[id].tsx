// app/current-affairs/[id].tsx
// Article detail. Renders body with line-split + bullet rendering
// matching EbookView. Optional "Take this article's quiz" CTA at the
// bottom that routes to /exam/[id] with the linked paper.

import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../src/theme/colors';
import { fetchArticle, CurrentAffairsArticle } from '../../src/services/currentAffairsService';

export default function CurrentAffairsDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const [article, setArticle] = useState<CurrentAffairsArticle | null | undefined>(undefined);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    fetchArticle(id).then((a) => { if (!cancelled) setArticle(a); });
    return () => { cancelled = true; };
  }, [id]);

  if (article === undefined) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.accent} size="large" />
      </View>
    );
  }

  if (!article) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyEmoji}>📭</Text>
        <Text style={styles.emptyTxt}>{t('currentAffairs.articleNotFound')}</Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.back()}>
          <Text style={styles.btnTxt}>{t('currentAffairs.goBack')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const dateStr = article.publishedAt?.toDate
    ? article.publishedAt.toDate().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg_primary} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>{t('currentAffairs.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerLabel}>{article.weekKey.replace('W', 'Week ')}</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {article.important ? <Text style={styles.importantBadge}>{t('currentAffairs.featured')}</Text> : null}
        <Text style={styles.title}>{article.title}</Text>
        <Text style={styles.meta}>
          {[article.source, dateStr].filter(Boolean).join(' · ')}
        </Text>

        <View style={styles.divider} />

        {article.body.split('\n').map((line, i) => {
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

        {article.quizId ? (
          <TouchableOpacity
            style={styles.quizCta}
            onPress={() => router.push(`/exam/${article.quizId}` as any)}
          >
            <Text style={styles.quizCtaTxt}>{t('currentAffairs.takeQuiz')}</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg_primary },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg_primary, padding: 24 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12,
  },
  back: { color: COLORS.accent_light, fontWeight: '700', fontSize: 14, width: 50 },
  headerLabel: { color: COLORS.text_muted, fontSize: 11, fontWeight: '800', letterSpacing: 1 },

  importantBadge: {
    color: '#F39C12', fontSize: 11, fontWeight: '800',
    letterSpacing: 1, marginBottom: 6,
  },
  title: { color: COLORS.text_primary, fontSize: 22, fontWeight: '900', lineHeight: 28, marginBottom: 8 },
  meta: { color: COLORS.text_muted, fontSize: 11 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 16 },

  body: { color: COLORS.text_primary, fontSize: 15, lineHeight: 24, marginBottom: 10 },
  bullet: { flexDirection: 'row', marginBottom: 8 },
  bulletDot: { color: COLORS.accent_light, fontSize: 15, marginRight: 8, lineHeight: 24 },

  quizCta: {
    marginTop: 24, backgroundColor: COLORS.accent,
    paddingVertical: 14, borderRadius: 12, alignItems: 'center',
  },
  quizCtaTxt: { color: '#fff', fontWeight: '800', fontSize: 14 },

  emptyEmoji: { fontSize: 48, marginBottom: 10 },
  emptyTxt: { color: COLORS.text_secondary, fontSize: 15, marginBottom: 18 },
  btn: { backgroundColor: COLORS.accent, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  btnTxt: { color: '#fff', fontWeight: '800' },
});