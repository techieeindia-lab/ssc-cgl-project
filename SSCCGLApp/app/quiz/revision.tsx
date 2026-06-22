// app/quiz/revision.tsx
// "Revise your mistakes" — pulls the user's most recent unresolved
// mistakes from `users/{uid}/mistakes` and quizzes them again. After the
// session, any question the user got right is marked `resolved: true`
// so it won't appear in future revision rounds.

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS } from '../../src/theme/colors';
import { Question } from '../../src/services/questionService';
import { useAuth } from '../../src/context/AuthContext';
import { awardQuizCoins, getUserStats } from '../../src/services/coinService';
import { getRevisionQuestions, getMistakesByTag, markResolved } from '../../src/services/mistakeService';

export default function RevisionQuizScreen() {
  const router = useRouter();
  const { tag } = useLocalSearchParams<{ tag?: string }>();
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [selected, setSelected] = useState<number | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reward, setReward] = useState<{ coins: number; xp: number } | null>(null);
  const [done, setDone] = useState(false);
  // Track question IDs the user got right in this session, so we can mark
  // them `resolved: true` when the session ends.
  const [gotRight, setGotRight] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      try {
        if (user) {
          const qs = tag
            ? await getMistakesByTag(user.uid, tag, 10)
            : await getRevisionQuestions(user.uid, 10);
          setQuestions(qs);
        } else {
          setQuestions([]);
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, [user, tag]);

  const handleAnswer = async (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    setShowSolution(true);
    const q = questions[idx];
    const ok = i === q.correct;
    setScore((s) => ({ correct: s.correct + (ok ? 1 : 0), wrong: s.wrong + (ok ? 0 : 1) }));
    if (ok) {
      setGotRight((prev) => {
        const next = new Set(prev);
        next.add(q.id);
        return next;
      });
    }
  };

  const handleNext = async () => {
    if (idx + 1 >= questions.length) {
      setDone(true);
      if (user) {
        try {
          // Mark the questions the user got right this round as resolved.
          gotRight.forEach((qid) => markResolved(user.uid, qid));

          const stats = await getUserStats(user.uid);
          const today = new Date().toISOString().split('T')[0];
          const isStreakDay = stats.lastQuizDate !== today;
          const r = await awardQuizCoins(user.uid, score.correct, questions.length, isStreakDay);
          setReward({ coins: r.coinsEarned, xp: r.xpEarned });
        } catch (e) { console.error(e); }
      }
      return;
    }
    setIdx(idx + 1);
    setSelected(null);
    setShowSolution(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.accent} size="large" />
        <Text style={styles.loadingTxt}>Loading revision set...</Text>
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyEmoji}>📭</Text>
        <Text style={styles.emptyTxt}>
          {user ? 'No revision questions yet.' : 'Sign in to track your mistakes.'}
        </Text>
        <Text style={styles.emptySub}>
          {user
            ? 'Take a quiz or mock test to start tracking mistakes.'
            : 'We can only show your previously-wrong questions once you sign in.'}
        </Text>
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
        <Text style={styles.bigEmoji}>{pct >= 70 ? '🔁' : '💪'}</Text>
        <Text style={styles.resultTitle}>Revision Complete</Text>
        <Text style={styles.resultSub}>{score.correct} of {questions.length} correct</Text>
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
  const opts = ['A', 'B', 'C', 'D'];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backTxt}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.heading}>🔁 Revision Mode</Text>
        <Text style={styles.progress}>{idx + 1}/{questions.length}</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        <View style={styles.qCard}>
          <Text style={styles.qText}>{q.text}</Text>
        </View>

        {q.options.map((opt, i) => {
          let style: any = styles.optDefault;
          let txtStyle: any = styles.optTxt;
          if (selected !== null) {
            if (i === q.correct) { style = styles.optCorrect; txtStyle = styles.optTxtCorrect; }
            else if (i === selected) { style = styles.optWrong; txtStyle = styles.optTxtWrong; }
            else { style = styles.optDimmed; }
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
              <Text style={[styles.optTxt, txtStyle]} numberOfLines={3}>{opt}</Text>
            </TouchableOpacity>
          );
        })}

        {showSolution && (
          <View style={styles.solution}>
            <Text style={styles.solTitle}>
              {selected === q.correct ? '✅ Correct!' : '❌ Incorrect'}
            </Text>
            <Text style={styles.solAnswer}>
              Correct: {opts[q.correct]}. {q.options[q.correct]}
            </Text>
            {q.explanation ? (
              <Text style={styles.solText}>{q.explanation}</Text>
            ) : null}
          </View>
        )}
      </ScrollView>

      {showSolution && (
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextBtnTxt}>
            {idx + 1 >= questions.length ? '🏁 Finish' : 'Next →'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg_primary },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg_primary, padding: 24 },
  loadingTxt: { color: COLORS.text_secondary, marginTop: 12 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTxt: { color: COLORS.text_secondary, fontSize: 15, textAlign: 'center', marginBottom: 6 },
  emptySub: { color: COLORS.text_muted, fontSize: 13, textAlign: 'center', marginBottom: 24 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
  },
  backTxt: { color: COLORS.accent_light, fontWeight: '700' },
  heading: { color: COLORS.text_primary, fontWeight: '900', fontSize: 16 },
  progress: { color: COLORS.text_secondary, fontWeight: '700' },

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
  optTxt: { color: COLORS.text_primary, fontSize: 14, flex: 1 },
  optTxtCorrect: { color: '#27AE60', fontWeight: '700' },
  optTxtWrong:   { color: '#E74C3C', fontWeight: '700' },

  solution: {
    marginTop: 12, backgroundColor: COLORS.bg_card, borderRadius: 14,
    padding: 14, borderWidth: 1, borderColor: COLORS.accent_dark,
  },
  solTitle: { color: COLORS.text_primary, fontWeight: '800', fontSize: 14, marginBottom: 6 },
  solAnswer: { color: COLORS.accent_light, fontSize: 13, marginBottom: 8 },
  solText: { color: COLORS.text_secondary, fontSize: 13, lineHeight: 20 },

  nextBtn: {
    position: 'absolute', left: 20, right: 20, bottom: 24,
    backgroundColor: COLORS.accent, paddingVertical: 16, borderRadius: 14, alignItems: 'center',
  },
  nextBtnTxt: { color: '#fff', fontWeight: '800', fontSize: 15 },

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