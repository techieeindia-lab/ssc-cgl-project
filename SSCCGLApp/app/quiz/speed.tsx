// app/quiz/speed.tsx
// 20 questions, 10 minutes — a fast-paced mix quiz. Same engine as regular quiz
// but with a hard 10-minute timer and harder difficulty bias.

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
  ScrollView, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../../src/theme/colors';
import { getMixQuizQuestions, Question } from '../../src/services/questionService';
import { useAuth } from '../../src/context/AuthContext';
import { awardQuizCoins } from '../../src/services/coinService';

const TOTAL_QS = 20;
const TOTAL_SECONDS = 10 * 60; // 10 minutes

export default function SpeedQuizScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS);
  const [reward, setReward] = useState<{ coins: number; xp: number } | null>(null);
  const [done, setDone] = useState(false);

  // Load questions on mount
  useEffect(() => {
    (async () => {
      try {
        const qs = await getMixQuizQuestions(TOTAL_QS);
        setQuestions(qs);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    })();
  }, []);

  // Countdown
  useEffect(() => {
    if (loading || done) return;
    const t = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          finish();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [loading, done]);

  const finish = useCallback(async () => {
    setDone(true);
    if (user) {
      try {
        const r = await awardQuizCoins(user.uid, score.correct, questions.length, true);
        setReward({ coins: r.coinsEarned, xp: r.xpEarned });
      } catch (e) { console.error(e); }
    }
  }, [user, score, questions]);

  const handleAnswer = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    const q = questions[idx];
    const ok = i === q.correct;
    setScore((s) => ({ correct: s.correct + (ok ? 1 : 0), wrong: s.wrong + (ok ? 0 : 1) }));
    // auto-advance after 700ms for speed feel
    setTimeout(() => {
      if (idx + 1 >= questions.length) {
        finish();
      } else {
        setIdx(idx + 1);
        setSelected(null);
      }
    }, 700);
  };

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${r < 10 ? '0' : ''}${r}`;
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.accent} size="large" />
        <Text style={styles.loadingTxt}>Loading Speed Round...</Text>
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyEmoji}>📭</Text>
        <Text style={styles.emptyTxt}>No questions available right now.</Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.back()}>
          <Text style={styles.btnTxt}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (done) {
    const pct = Math.round((score.correct / questions.length) * 100);
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.result}>
        <Text style={styles.bigEmoji}>{pct >= 70 ? '🏁' : '💨'}</Text>
        <Text style={styles.resultTitle}>Speed Round Complete!</Text>
        <Text style={styles.resultSub}>You scored {score.correct}/{questions.length}</Text>
        {reward && (
          <View style={styles.rewardCard}>
            <Text style={styles.rewardRow}>🪙 +{reward.coins} Coins</Text>
            <Text style={styles.rewardRow}>⭐ +{reward.xp} XP</Text>
          </View>
        )}
        <TouchableOpacity style={styles.btn} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.btnTxt}>Done</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  const q = questions[idx];
  const danger = timeLeft < 60;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backTxt}>← Exit</Text>
        </TouchableOpacity>
        <Text style={styles.heading}>⚡ Speed Round</Text>
        <Text style={styles.progress}>{idx + 1}/{questions.length}</Text>
      </View>

      <View style={styles.timerBar}>
        <View style={styles.timerRow}>
          <Text style={styles.timerLbl}>Time Left</Text>
          <Text style={[styles.timerVal, danger && styles.timerValDanger]}>
            {fmt(timeLeft)}
          </Text>
        </View>
        <View style={styles.timerTrack}>
          <View
            style={[
              styles.timerFill,
              { width: `${(timeLeft / TOTAL_SECONDS) * 100}%` },
              danger && styles.timerFillDanger,
            ]}
          />
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View style={styles.qCard}>
          <Text style={styles.qText}>{q.text}</Text>
        </View>

        {q.options.map((opt, i) => {
          const opts = ['A', 'B', 'C', 'D'];
          let style = styles.optDefault;
          if (selected !== null) {
            if (i === q.correct) style = styles.optCorrect;
            else if (i === selected) style = styles.optWrong;
            else style = styles.optDimmed;
          }
          return (
            <TouchableOpacity
              key={i}
              style={[styles.opt, style]}
              onPress={() => handleAnswer(i)}
              disabled={selected !== null}
              activeOpacity={0.8}
            >
              <View style={styles.optBadge}>
                <Text style={styles.optBadgeTxt}>{opts[i]}</Text>
              </View>
              <Text style={styles.optTxt} numberOfLines={3}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.scoreStrip}>
        <Text style={styles.scoreItem}>✓ {score.correct}</Text>
        <Text style={styles.scoreItem}>✗ {score.wrong}</Text>
        <Text style={styles.scoreItem}>⏱ {fmt(timeLeft)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg_primary },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg_primary, padding: 24 },
  loadingTxt: { color: COLORS.text_secondary, marginTop: 12, fontSize: 14 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTxt: { color: COLORS.text_secondary, fontSize: 15, textAlign: 'center', marginBottom: 24 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12,
  },
  backTxt: { color: COLORS.accent_light, fontWeight: '700', fontSize: 14 },
  heading: { color: COLORS.text_primary, fontWeight: '900', fontSize: 16 },
  progress: { color: COLORS.text_secondary, fontWeight: '700', fontSize: 14 },

  timerBar: { paddingHorizontal: 20, paddingBottom: 12 },
  timerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  timerLbl: { color: COLORS.text_secondary, fontSize: 12, fontWeight: '700' },
  timerVal: { color: '#27AE60', fontSize: 18, fontWeight: '900', fontVariant: ['tabular-nums'] },
  timerValDanger: { color: '#E74C3C' },
  timerTrack: { height: 4, backgroundColor: COLORS.bg_card, borderRadius: 4, overflow: 'hidden' },
  timerFill: { height: 4, backgroundColor: '#27AE60', borderRadius: 4 },
  timerFillDanger: { backgroundColor: '#E74C3C' },

  qCard: {
    backgroundColor: COLORS.bg_card, borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 14,
  },
  qText: { color: COLORS.text_primary, fontSize: 16, lineHeight: 24 },

  opt: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.bg_card, borderRadius: 12, padding: 14,
    borderWidth: 1.5, marginBottom: 8, gap: 12,
  },
  optDefault: { borderColor: COLORS.border },
  optCorrect: { borderColor: '#27AE60', backgroundColor: '#27AE6022' },
  optWrong:   { borderColor: '#E74C3C', backgroundColor: '#E74C3C22' },
  optDimmed:  { borderColor: COLORS.border, opacity: 0.4 },
  optBadge: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: COLORS.bg_secondary, alignItems: 'center', justifyContent: 'center',
  },
  optBadgeTxt: { color: COLORS.text_primary, fontWeight: '900', fontSize: 13 },
  optTxt: { color: COLORS.text_primary, fontSize: 14, flex: 1, lineHeight: 20 },

  scoreStrip: {
    flexDirection: 'row', justifyContent: 'space-around',
    paddingVertical: 12, backgroundColor: COLORS.bg_card,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  scoreItem: { color: COLORS.text_primary, fontWeight: '800', fontSize: 14 },

  result: { alignItems: 'center', padding: 24, paddingTop: 80 },
  bigEmoji: { fontSize: 64, marginBottom: 12 },
  resultTitle: { fontSize: 22, fontWeight: '900', color: COLORS.text_primary, marginBottom: 6 },
  resultSub: { fontSize: 14, color: COLORS.text_secondary, marginBottom: 20 },
  rewardCard: {
    backgroundColor: '#F39C1222', borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: '#F39C12', marginBottom: 20,
    alignItems: 'center', gap: 6,
  },
  rewardRow: { fontSize: 18, fontWeight: '900', color: COLORS.text_primary },
  btn: { backgroundColor: COLORS.accent, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 12, marginTop: 8 },
  btnTxt: { color: '#fff', fontWeight: '800', fontSize: 15 },
});