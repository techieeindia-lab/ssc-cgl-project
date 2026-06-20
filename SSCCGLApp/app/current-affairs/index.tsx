// app/current-affairs/index.tsx
// Home feed for the Current Affairs feature. Three segments: This Week,
// This Month, All. Articles are grouped by week (newest first within).

import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, StatusBar, RefreshControl,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { COLORS } from '../../src/theme/colors';
import {
  fetchRecentArticles, groupByWeek, isoWeek,
  CurrentAffairsArticle,
} from '../../src/services/currentAffairsService';

type Segment = 'week' | 'month' | 'all';

export default function CurrentAffairsHome() {
  const router = useRouter();
  const [articles, setArticles] = useState<CurrentAffairsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [segment, setSegment] = useState<Segment>('week');

  const load = useCallback(async () => {
    const all = await fetchRecentArticles(60);
    setArticles(all);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  // Filter articles by the current segment.
  const now = isoWeek(new Date());
  const filtered = articles.filter((a) => {
    if (segment === 'all') return true;
    if (segment === 'week') return a.weekKey === now.key;
    if (segment === 'month') return a.year === now.year && a.month === new Date().getMonth() + 1;
    return true;
  });
  const groups = groupByWeek(filtered);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg_primary} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.heading}>📰 Current Affairs</Text>
          <Text style={styles.sub}>Weekly & monthly digests</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/current-affairs/weekly-quiz' as any)}>
          <Text style={styles.quizLink}>📝 Quiz</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.segments}>
        {(['week', 'month', 'all'] as Segment[]).map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.segment, segment === s && styles.segmentActive]}
            onPress={() => setSegment(s)}
          >
            <Text style={[styles.segmentTxt, segment === s && styles.segmentTxtActive]}>
              {s === 'week' ? 'This Week' : s === 'month' ? 'This Month' : 'All'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={COLORS.accent} size="large" />
        </View>
      ) : groups.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.emptyWrap}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />}
        >
          <Text style={styles.emptyEmoji}>📭</Text>
          <Text style={styles.emptyTxt}>No current affairs for this view yet.</Text>
          <Text style={styles.emptySub}>Pull to refresh, or check back soon.</Text>
        </ScrollView>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />}
        >
          {groups.map((g) => (
            <View key={g.weekKey} style={styles.group}>
              <Text style={styles.groupHeader}>{g.weekKey.replace('-', ' · ').replace('W', 'Week ')}</Text>
              {g.items.map((a) => (
                <TouchableOpacity
                  key={a.id}
                  style={[styles.card, a.important && styles.cardImportant]}
                  activeOpacity={0.85}
                  onPress={() => router.push(`/current-affairs/${a.id}` as any)}
                >
                  <View style={styles.cardHead}>
                    {a.important && <Text style={styles.star}>⭐</Text>}
                    <Text style={styles.cardTitle} numberOfLines={2}>{a.title}</Text>
                  </View>
                  <Text style={styles.cardSummary} numberOfLines={2}>{a.summary}</Text>
                  <View style={styles.cardMeta}>
                    <Text style={styles.cardMetaTxt}>
                      {a.source ? `${a.source} · ` : ''}
                      {a.publishedAt?.toDate ? a.publishedAt.toDate().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : ''}
                    </Text>
                    {a.quizId ? <Text style={styles.cardQuizBadge}>📝 Quiz</Text> : null}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg_primary },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12, gap: 12,
  },
  back: { color: COLORS.accent_light, fontWeight: '700', fontSize: 14 },
  heading: { color: COLORS.text_primary, fontWeight: '900', fontSize: 18 },
  sub: { color: COLORS.text_secondary, fontSize: 11, marginTop: 2 },
  quizLink: { color: COLORS.accent_light, fontWeight: '800', fontSize: 13 },

  segments: {
    flexDirection: 'row', marginHorizontal: 20, marginBottom: 16,
    backgroundColor: COLORS.bg_card, borderRadius: 10, padding: 4,
    borderWidth: 1, borderColor: COLORS.border,
  },
  segment: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  segmentActive: { backgroundColor: COLORS.accent },
  segmentTxt: { color: COLORS.text_secondary, fontWeight: '700', fontSize: 12 },
  segmentTxtActive: { color: '#fff' },

  group: { paddingHorizontal: 20, marginBottom: 18 },
  groupHeader: {
    color: COLORS.text_muted, fontSize: 11, fontWeight: '900',
    letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8,
  },
  card: {
    backgroundColor: COLORS.bg_card, borderRadius: 12,
    padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: COLORS.border,
  },
  cardImportant: { borderLeftWidth: 4, borderLeftColor: '#F39C12' },
  cardHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 6 },
  star: { fontSize: 14 },
  cardTitle: { flex: 1, color: COLORS.text_primary, fontWeight: '800', fontSize: 14, lineHeight: 20 },
  cardSummary: { color: COLORS.text_secondary, fontSize: 12, lineHeight: 18, marginBottom: 8 },
  cardMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardMetaTxt: { color: COLORS.text_muted, fontSize: 10 },
  cardQuizBadge: { color: COLORS.accent_light, fontSize: 11, fontWeight: '800' },

  emptyEmoji: { fontSize: 48, marginBottom: 8 },
  emptyTxt: { color: COLORS.text_secondary, fontSize: 15, fontWeight: '700', marginBottom: 4 },
  emptySub: { color: COLORS.text_muted, fontSize: 12 },
});