// src/screens/Quiz/QuizScreen.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Animated, Platform, Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Audio } from 'expo-av';
import { COLORS } from '../../theme/colors';
import { Question } from '../../services/questionService';
import {
  getMixQuizQuestions, getSubjectQuizQuestions, getTopicQuizQuestions,
} from '../../services/questionService';
import { awardQuizCoins, getUserStats } from '../../services/coinService';
import { useAuth } from '../../context/AuthContext';

type OptionState = 'default' | 'correct' | 'wrong';

export default function QuizScreen() {
  const router = useRouter();
  const { type, section, tag, count } = useLocalSearchParams<{
    type: 'mix' | 'subject' | 'topic';
    section?: string;
    tag?: string;
    count?: string;
  }>();
  const { user } = useAuth();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [finished, setFinished] = useState(false);
  const [reward, setReward] = useState<{ coins: number; xp: number } | null>(null);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const correctSound = useRef<Audio.Sound | null>(null);
  const wrongSound = useRef<Audio.Sound | null>(null);

  // ── Load sounds ───────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
      const { sound: cs } = await Audio.Sound.createAsync(
        require('../../../assets/sounds/correct.mp3')
      );

      const { sound: ws } = await Audio.Sound.createAsync(
        require('../../../assets/sounds/error.mp3')
      );

      correctSound.current = cs;
      wrongSound.current = ws;
    } catch (_) {}
    })();
    return () => {
      correctSound.current?.unloadAsync();
      wrongSound.current?.unloadAsync();
    };
  }, []);

  // ── Load questions ────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const n = parseInt(count ?? '10', 10);
        let qs: Question[] = [];
        if (type === 'mix') {
          qs = await getMixQuizQuestions(n);
        } else if (type === 'subject' && section) {
          qs = await getSubjectQuizQuestions(section as any, n);
        } else if (type === 'topic' && section && tag) {
          qs = await getTopicQuizQuestions(section as any, tag, n);
        }
        setQuestions(qs);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    })();
  }, [type, section, tag, count]);

  const playSound = async (correct: boolean) => {
    try {
      if (correct) {
        await correctSound.current?.replayAsync();
      } else {
        await wrongSound.current?.replayAsync();
      }
    } catch (_) {}
  };

  const handleOptionPress = async (optionIndex: number) => {
    if (selectedOption !== null) return;
    const q = questions[currentIndex];
    const isCorrect = optionIndex === q.correct;
    setSelectedOption(optionIndex);
    setShowSolution(true);
    setScore((prev) => ({
      correct: isCorrect ? prev.correct + 1 : prev.correct,
      wrong: !isCorrect ? prev.wrong + 1 : prev.wrong,
    }));
    await playSound(isCorrect);
  };

  const animateNext = (cb: () => void) => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -30, duration: 180, useNativeDriver: true }),
    ]).start(() => {
      cb();
      slideAnim.setValue(30);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start();
    });
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      handleFinish();
      return;
    }
    animateNext(() => {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setShowSolution(false);
    });
  };

  const handleFinish = async () => {
    setFinished(true);
    if (user) {
      const stats = await getUserStats(user.uid);
      const today = new Date().toISOString().split('T')[0];
      const isStreakDay = stats.lastQuizDate !== today;
      const r = await awardQuizCoins(user.uid, score.correct, questions.length, isStreakDay);
      setReward({ coins: r.coinsEarned, xp: r.xpEarned });
    }
  };

  const getOptionStyle = (index: number): object => {
    if (selectedOption === null) return styles.optionDefault;
    const q = questions[currentIndex];
    if (index === q.correct) return styles.optionCorrect;
    if (index === selectedOption && index !== q.correct) return styles.optionWrong;
    return styles.optionDimmed;
  };

  const getOptionTextStyle = (index: number): object => {
    if (selectedOption === null) return styles.optionText;
    const q = questions[currentIndex];
    if (index === q.correct) return styles.optionTextCorrect;
    if (index === selectedOption && index !== q.correct) return styles.optionTextWrong;
    return styles.optionTextDimmed;
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.loadingText}>Loading Quiz...</Text>
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyIcon}>📭</Text>
        <Text style={styles.emptyText}>No questions found for this quiz.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Finished screen ───────────────────────────────────────────────────────
  if (finished) {
    const pct = Math.round((score.correct / questions.length) * 100);
    const emoji = pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪';
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.resultContent}>
        <Text style={styles.resultEmoji}>{emoji}</Text>
        <Text style={styles.resultTitle}>Quiz Complete!</Text>
        <View style={styles.resultCard}>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Score</Text>
            <Text style={styles.resultValue}>{score.correct}/{questions.length}</Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Correct</Text>
            <Text style={[styles.resultValue, { color: '#27AE60' }]}>{score.correct} ✓</Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Wrong</Text>
            <Text style={[styles.resultValue, { color: '#E74C3C' }]}>{score.wrong} ✗</Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Accuracy</Text>
            <Text style={styles.resultValue}>{pct}%</Text>
          </View>
        </View>

        {reward && (
          <View style={styles.rewardCard}>
            <Text style={styles.rewardTitle}>🎁 Rewards Earned</Text>
            <View style={styles.rewardRow}>
              <Text style={styles.rewardItem}>🪙 +{reward.coins} Coins</Text>
              <Text style={styles.rewardItem}>⭐ +{reward.xp} XP</Text>
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.startButton} onPress={() => router.back()}>
          <Text style={styles.startButtonText}>Back to Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.startButton, { backgroundColor: COLORS.bg_card, marginTop: 12 }]}
          onPress={() => {
            setCurrentIndex(0); setSelectedOption(null);
            setShowSolution(false); setScore({ correct: 0, wrong: 0 });
            setFinished(false); setReward(null);
          }}
        >
          <Text style={[styles.startButtonText, { color: COLORS.accent_light }]}>🔄 Play Again</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // ── Quiz screen ───────────────────────────────────────────────────────────
  const q = questions[currentIndex];
  const OPTIONS = ['A', 'B', 'C', 'D'];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backArrow}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.progress}>{currentIndex + 1} / {questions.length}</Text>
        <View style={styles.miniScore}>
          <Text style={styles.miniCorrect}>✓ {score.correct}</Text>
          <Text style={styles.miniWrong}>✗ {score.wrong}</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View
          style={[styles.progressFill, { width: `${((currentIndex + 1) / questions.length) * 100}%` }]}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* Section badge */}
          <View style={styles.badgeRow}>
            <View style={[styles.sectionBadge, { backgroundColor: getSectionColor(q.section) + '22' }]}>
              <Text style={[styles.sectionBadgeText, { color: getSectionColor(q.section) }]}>
                {q.section}
              </Text>
            </View>
            <View style={styles.diffBadge}>
              <Text style={styles.diffText}>{q.difficulty}</Text>
            </View>
          </View>

          {/* Question */}
          <View style={styles.questionCard}>
            <Text style={styles.questionText}>{q.text}</Text>
            {q.questionImg ? (
              <Image
                source={{ uri: q.questionImg }}
                style={styles.qImage}
                resizeMode="contain"
              />
            ) : null}
          </View>

          {/* Options */}
          {q.options.map((opt, idx) => {
            const optImg = q.optionImgs?.[idx];
            return (
              <TouchableOpacity
                key={idx}
                style={[styles.option, getOptionStyle(idx), optImg ? { flexDirection: 'column', alignItems: 'flex-start' } : null]}
                onPress={() => handleOptionPress(idx)}
                activeOpacity={0.8}
                disabled={selectedOption !== null}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={styles.optionLabelBox}>
                    <Text style={[styles.optionLabel, getOptionTextStyle(idx)]}>{OPTIONS[idx]}</Text>
                  </View>
                  <Text style={[styles.optionText, getOptionTextStyle(idx)]} numberOfLines={3}>
                    {opt}
                  </Text>
                  {selectedOption !== null && idx === q.correct && (
                    <Text style={styles.checkIcon}>✓</Text>
                  )}
                  {selectedOption === idx && idx !== q.correct && (
                    <Text style={styles.crossIcon}>✗</Text>
                  )}
                </View>
                {optImg ? (
                  <Image
                    source={{ uri: optImg }}
                    style={styles.optImage}
                    resizeMode="contain"
                  />
                ) : null}
              </TouchableOpacity>
            );
          })}

          {/* Solution */}
          {showSolution && (
            <View style={styles.solutionCard}>
              <Text style={styles.solutionTitle}>
                {selectedOption === q.correct ? '✅ Correct!' : '❌ Incorrect'}
              </Text>
              <Text style={styles.solutionAnswer}>
                Correct Answer: {OPTIONS[q.correct]}. {q.options[q.correct]}
              </Text>
              {(q.explanation || q.explanationImg) ? (
                <>
                  <View style={styles.solutionDivider} />
                  <Text style={styles.solutionLabel}>Explanation</Text>
                  {q.explanation ? (
                    <Text style={styles.solutionText}>{q.explanation}</Text>
                  ) : null}
                  {q.explanationImg ? (
                    <Image
                      source={{ uri: q.explanationImg }}
                      style={styles.expImage}
                      resizeMode="contain"
                    />
                  ) : null}
                </>
              ) : null}
            </View>
          )}

          {/* Next button */}
          {showSolution && (
            <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.85}>
              <Text style={styles.nextButtonText}>
                {currentIndex + 1 >= questions.length ? '🏁  Finish Quiz' : 'Next Question →'}
              </Text>
            </TouchableOpacity>
          )}

          <View style={{ height: 40 }} />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const getSectionColor = (section: string) => {
  const map: Record<string, string> = {
    QA: '#E74C3C', GIR: '#9B59B6', GA: '#27AE60', EN: '#F39C12',
  };
  return map[section] ?? COLORS.accent;
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg_primary },
  center: { flex: 1, backgroundColor: COLORS.bg_primary, alignItems: 'center', justifyContent: 'center', padding: 24 },
  loadingText: { color: COLORS.text_secondary, marginTop: 12, fontSize: 14 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: COLORS.text_secondary, fontSize: 15, textAlign: 'center', marginBottom: 24 },
  backBtn: { backgroundColor: COLORS.accent, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  backBtnText: { color: '#fff', fontWeight: '700' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12,
  },
  backArrow: { fontSize: 14, color: COLORS.accent_light, fontWeight: '600' },
  progress: { fontSize: 14, color: COLORS.text_secondary, fontWeight: '600' },
  miniScore: { flexDirection: 'row', gap: 10 },
  miniCorrect: { fontSize: 13, color: '#27AE60', fontWeight: '700' },
  miniWrong: { fontSize: 13, color: '#E74C3C', fontWeight: '700' },

  progressBar: { height: 4, backgroundColor: COLORS.bg_card, marginHorizontal: 20, borderRadius: 4, marginBottom: 16 },
  progressFill: { height: 4, backgroundColor: COLORS.accent, borderRadius: 4 },

  badgeRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 12 },
  sectionBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  sectionBadgeText: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  diffBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: COLORS.bg_card },
  diffText: { fontSize: 11, color: COLORS.text_secondary, fontWeight: '600', textTransform: 'capitalize' },

  questionCard: {
    marginHorizontal: 20, backgroundColor: COLORS.bg_card, borderRadius: 16,
    padding: 20, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  questionText: { fontSize: 16, color: COLORS.text_primary, lineHeight: 26, fontWeight: '500' },

  option: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 10,
    borderRadius: 12, padding: 14, borderWidth: 1.5, gap: 12,
  },
  optionDefault: { backgroundColor: COLORS.bg_card, borderColor: COLORS.border },
  optionCorrect: { backgroundColor: '#27AE6022', borderColor: '#27AE60' },
  optionWrong: { backgroundColor: '#E74C3C22', borderColor: '#E74C3C' },
  optionDimmed: { backgroundColor: COLORS.bg_card, borderColor: COLORS.border, opacity: 0.5 },
  optionLabelBox: {
    width: 30, height: 30, borderRadius: 15, backgroundColor: COLORS.bg_secondary,
    alignItems: 'center', justifyContent: 'center',
  },
  optionLabel: { fontSize: 13, fontWeight: '800' },
  optionText: { flex: 1, fontSize: 14, color: COLORS.text_primary, lineHeight: 20 },
  optionTextCorrect: { color: '#27AE60', fontWeight: '700', flex: 1, fontSize: 14, lineHeight: 20 },
  optionTextWrong: { color: '#E74C3C', fontWeight: '700', flex: 1, fontSize: 14, lineHeight: 20 },
  optionTextDimmed: { color: COLORS.text_muted, flex: 1, fontSize: 14, lineHeight: 20 },
  checkIcon: { fontSize: 16, color: '#27AE60', fontWeight: '800' },
  crossIcon: { fontSize: 16, color: '#E74C3C', fontWeight: '800' },

  solutionCard: {
    marginHorizontal: 20, marginTop: 4, marginBottom: 16,
    backgroundColor: COLORS.bg_card, borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: COLORS.accent_dark,
  },
  solutionTitle: { fontSize: 15, fontWeight: '800', color: COLORS.text_primary, marginBottom: 8 },
  solutionAnswer: { fontSize: 13, color: COLORS.accent_light, lineHeight: 20, marginBottom: 8 },
  solutionDivider: { height: 1, backgroundColor: COLORS.border, marginBottom: 10 },
  solutionLabel: { fontSize: 11, color: COLORS.text_muted, fontWeight: '700', letterSpacing: 1, marginBottom: 6 },
  solutionText: { fontSize: 13, color: COLORS.text_secondary, lineHeight: 21 },

  nextButton: {
    marginHorizontal: 20, backgroundColor: COLORS.accent, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginTop: 4,
  },
  nextButtonText: { fontSize: 15, fontWeight: '800', color: '#fff' },

  // Result screen
  resultContent: { alignItems: 'center', padding: 24, paddingTop: 80 },
  resultEmoji: { fontSize: 64, marginBottom: 12 },
  resultTitle: { fontSize: 24, fontWeight: '900', color: COLORS.text_primary, marginBottom: 24 },
  resultCard: {
    width: '100%', backgroundColor: COLORS.bg_card, borderRadius: 16,
    padding: 20, borderWidth: 1, borderColor: COLORS.border, marginBottom: 20,
  },
  resultRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  resultLabel: { fontSize: 14, color: COLORS.text_secondary },
  resultValue: { fontSize: 14, fontWeight: '800', color: COLORS.text_primary },
  rewardCard: {
    width: '100%', backgroundColor: '#F39C1222', borderRadius: 16,
    padding: 20, borderWidth: 1, borderColor: '#F39C12', marginBottom: 24,
  },
  rewardTitle: { fontSize: 15, fontWeight: '800', color: '#F39C12', marginBottom: 12 },
  rewardRow: { flexDirection: 'row', justifyContent: 'space-around' },
  rewardItem: { fontSize: 18, fontWeight: '800', color: COLORS.text_primary },
  startButton: {
    width: '100%', backgroundColor: COLORS.accent, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
  },
  startButtonText: { fontSize: 15, fontWeight: '800', color: '#fff' },
  qImage:         { width: '100%', height: 180, marginTop: 12, borderRadius: 8, backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#eee' },
  optImage:       { width: 140, height: 80, marginTop: 8, marginLeft: 42, borderRadius: 6, backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#eee' },
  expImage:       { width: '100%', height: 160, marginTop: 12, borderRadius: 8, backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#eee' },
});