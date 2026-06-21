import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../../src/theme/colors';
import { useAuth } from '../../src/context/AuthContext';
import { getTestHistory } from '../../src/services/testService';

export default function TestHistoryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    getTestHistory(user.uid, 50)
      .then((h) => {
        if (!cancelled) {
          setHistory(h);
          setLoading(false);
        }
      })
      .catch((e) => {
        console.error('Failed to load history', e);
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyEmoji}>👤</Text>
        <Text style={styles.emptyTitle}>Please sign in</Text>
        <Text style={styles.emptySub}>Sign in to view your test history.</Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.replace('/(auth)/login')}>
          <Text style={styles.btnTxt}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.accent} size="large" />
        <Text style={styles.loadingTxt}>Loading your test history...</Text>
      </View>
    );
  }

  // Calculate summary stats
  const totalTests = history.length;
  const avgScore = totalTests > 0 
    ? (history.reduce((acc, curr) => acc + (curr.score || 0), 0) / totalTests).toFixed(1)
    : '0.0';
  const avgAccuracy = totalTests > 0
    ? Math.round(
        (history.reduce((acc, curr) => {
          const totalAttempted = (curr.correct || 0) + (curr.wrong || 0);
          if (totalAttempted === 0) return acc + 0;
          return acc + ((curr.correct || 0) / totalAttempted) * 100;
        }, 0) / totalTests)
      )
    : 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg_primary} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.heading}>📋 Test History</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {/* Summary Dashboard */}
        {totalTests > 0 && (
          <View style={styles.statsCard}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{totalTests}</Text>
              <Text style={styles.statLbl}>Total Tests</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{avgScore}</Text>
              <Text style={styles.statLbl}>Avg Score</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{avgAccuracy}%</Text>
              <Text style={styles.statLbl}>Avg Accuracy</Text>
            </View>
          </View>
        )}

        {/* List of attempts */}
        <Text style={styles.sectionHeader}>PAST ATTEMPTS</Text>
        {history.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>📝</Text>
            <Text style={styles.emptyTitle}>No attempts found</Text>
            <Text style={styles.emptySub}>You haven't taken any mock or sectional tests yet.</Text>
            <TouchableOpacity style={styles.btn} onPress={() => router.replace('/(tabs)/test')}>
              <Text style={styles.btnTxt}>Take a Test Now</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.historyList}>
            {history.map((r) => {
              const pct = Math.round(((r.score || 0) / (r.maxScore || 100)) * 100);
              const date = r.createdAt?.seconds
                ? new Date(r.createdAt.seconds * 1000).toLocaleDateString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })
                : '—';
              
              // Get section or test details
              let typeLabel = 'Practice';
              if (r.testType === 'full') typeLabel = 'Full Mock Test';
              else if (r.testType === 'sectional') typeLabel = 'Sectional Test';
              else if (r.testType === 'pyst') typeLabel = 'PYST';
              else if (r.testType) typeLabel = `${r.testType} Sectional`;

              return (
                <TouchableOpacity 
                  key={r.id} 
                  style={styles.recentRow}
                  activeOpacity={0.8}
                  onPress={() => {
                    router.push({
                      pathname: '/exam/result',
                      params: { result: JSON.stringify(r) }
                    });
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.recentTitle}>{typeLabel}</Text>
                    <Text style={styles.recentSub}>
                      {r.correct}✓ · {r.wrong}✗ · {r.skipped}—  •  {date}
                    </Text>
                  </View>
                  <View style={styles.scoreArea}>
                    <Text style={[styles.recentScore, {
                      color: pct >= 60 ? '#27AE60' : pct >= 40 ? '#F39C12' : '#E74C3C',
                    }]}>
                      {pct}%
                    </Text>
                    <Text style={styles.scoreText}>{(r.score || 0).toFixed(1)}/{(r.maxScore || 100)}</Text>
                  </View>
                  <Text style={styles.arrow}>›</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg_primary },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg_primary, padding: 24 },
  loadingTxt: { color: COLORS.text_secondary, marginTop: 12, fontSize: 14 },
  
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12,
  },
  back: { color: COLORS.accent_light, fontWeight: '700', fontSize: 14, width: 50 },
  heading: { color: COLORS.text_primary, fontWeight: '900', fontSize: 18 },
  
  statsCard: {
    flexDirection: 'row', backgroundColor: COLORS.bg_card, borderRadius: 16,
    padding: 20, borderWidth: 1, borderColor: COLORS.border, marginBottom: 24,
    justifyContent: 'space-around', alignItems: 'center'
  },
  statBox: { alignItems: 'center', flex: 1 },
  statNum: { fontSize: 20, fontWeight: '900', color: COLORS.accent_light },
  statLbl: { fontSize: 10, color: COLORS.text_secondary, marginTop: 4 },
  statDivider: { width: 1, height: 32, backgroundColor: COLORS.border },

  sectionHeader: { color: COLORS.text_muted, fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 12 },
  historyList: { gap: 10 },
  recentRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.bg_card, borderRadius: 14,
    padding: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  recentTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text_primary },
  recentSub: { fontSize: 11, color: COLORS.text_secondary, marginTop: 4 },
  scoreArea: { alignItems: 'flex-end', marginRight: 8 },
  recentScore: { fontSize: 16, fontWeight: '900' },
  scoreText: { fontSize: 9, color: COLORS.text_muted, marginTop: 2 },
  arrow: { fontSize: 20, color: COLORS.text_muted },

  emptyCard: {
    backgroundColor: COLORS.bg_card, borderRadius: 16, padding: 24,
    borderWidth: 1, borderColor: COLORS.border, alignItems: 'center',
  },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text_primary, marginBottom: 6 },
  emptySub: { fontSize: 13, color: COLORS.text_secondary, textAlign: 'center', marginBottom: 18, lineHeight: 18 },
  btn: { backgroundColor: COLORS.accent, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12 },
  btnTxt: { color: '#fff', fontWeight: '800', fontSize: 14 },
});
