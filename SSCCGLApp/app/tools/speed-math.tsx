// app/tools/speed-math.tsx
// 60-second mental arithmetic challenge. Pick a mode (add / sub / mul / div / mix)
// and try to answer as many as possible before the timer hits zero.

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  StatusBar, Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../../src/theme/colors';

type Mode = 'add' | 'sub' | 'mul' | 'div' | 'mix';
const TIME_LIMIT = 60;

const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const generate = (mode: Mode): { a: number; b: number; op: string; answer: number } => {
  let a = 0, b = 0, op = '+', answer = 0;
  if (mode === 'add') {
    a = rand(10, 99); b = rand(10, 99); op = '+'; answer = a + b;
  } else if (mode === 'sub') {
    a = rand(50, 99); b = rand(1, a - 1); op = '−'; answer = a - b;
  } else if (mode === 'mul') {
    a = rand(11, 99); b = rand(2, 19); op = '×'; answer = a * b;
  } else if (mode === 'div') {
    b = rand(2, 12); answer = rand(2, 25); a = b * answer; op = '÷';
  } else {
    // mix
    const ops: Mode[] = ['add', 'sub', 'mul', 'div'];
    return generate(ops[rand(0, 3)]);
  }
  return { a, b, op, answer };
};

const MODES: { id: Mode; label: string; icon: string }[] = [
  { id: 'mix', label: 'Mix',   icon: '🎲' },
  { id: 'add', label: 'Add',   icon: '➕' },
  { id: 'sub', label: 'Sub',   icon: '➖' },
  { id: 'mul', label: 'Mult',  icon: '✖️' },
  { id: 'div', label: 'Div',   icon: '➗' },
];

export default function SpeedMathScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode | null>(null);
  const [question, setQuestion] = useState(generate('mix'));
  const [input, setInput] = useState('');
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [done, setDone] = useState(false);
  const [feedback, setFeedback] = useState<'right' | 'wrong' | null>(null);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!mode || done) return;
    const t = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) { clearInterval(t); setDone(true); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [mode, done]);

  // Auto-focus the input when a new question appears
  useEffect(() => {
    if (mode && !done) {
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [question, mode, done]);

  const submit = () => {
    const parsed = parseInt(input, 10);
    if (isNaN(parsed)) return;
    if (parsed === question.answer) {
      setScore((s) => ({ correct: s.correct + 1, wrong: s.wrong }));
      setFeedback('right');
    } else {
      setScore((s) => ({ correct: s.correct, wrong: s.wrong + 1 }));
      setFeedback('wrong');
    }
    setInput('');
    setQuestion(generate(mode!));
    setTimeout(() => setFeedback(null), 220);
  };

  // Mode picker screen
  if (!mode) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bg_primary} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.heading}>⏱️ Speed Math</Text>
          <View style={{ width: 48 }} />
        </View>

        <View style={styles.intro}>
          <Text style={styles.introTitle}>Answer as many as you can in 60 seconds</Text>
          <Text style={styles.introSub}>Type your answer and hit ↵ to submit. Fast fingers win.</Text>
        </View>

        {MODES.map((m) => (
          <TouchableOpacity
            key={m.id}
            style={styles.modeCard}
            activeOpacity={0.85}
            onPress={() => { setMode(m.id); setQuestion(generate(m.id)); }}
          >
            <Text style={styles.modeIcon}>{m.icon}</Text>
            <Text style={styles.modeLbl}>{m.label}</Text>
            <Text style={styles.modeArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  // Done screen
  if (done) {
    const total = score.correct + score.wrong;
    const acc = total === 0 ? 0 : Math.round((score.correct / total) * 100);
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bg_primary} />
        <View style={styles.header}>
          <View style={{ width: 48 }} />
          <Text style={styles.heading}>⏱️ Speed Math</Text>
          <View style={{ width: 48 }} />
        </View>

        <View style={styles.doneWrap}>
          <Text style={styles.doneEmoji}>{acc >= 80 ? '🏆' : acc >= 50 ? '🎯' : '💪'}</Text>
          <Text style={styles.doneTitle}>Time's up!</Text>

          <View style={styles.statBox}>
            <Stat label="Correct" value={score.correct} color="#27AE60" />
            <Stat label="Wrong"   value={score.wrong}   color="#E74C3C" />
            <Stat label="Accuracy" value={`${acc}%`}    color={COLORS.accent_light} />
          </View>

          <TouchableOpacity
            style={styles.bigBtn}
            onPress={() => { setMode(null); setDone(false); setScore({ correct: 0, wrong: 0 }); setTimeLeft(TIME_LIMIT); }}
          >
            <Text style={styles.bigBtnTxt}>↻ Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.bigBtn, { backgroundColor: COLORS.bg_card, marginTop: 10, borderWidth: 1, borderColor: COLORS.border }]}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={[styles.bigBtnTxt, { color: COLORS.accent_light }]}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Live game screen
  const danger = timeLeft < 10;
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg_primary} />

      <View style={styles.gameHeader}>
        <TouchableOpacity onPress={() => { setMode(null); Keyboard.dismiss(); }}>
          <Text style={styles.back}>← Exit</Text>
        </TouchableOpacity>
        <View style={styles.gameScoreRow}>
          <Text style={styles.scoreGreen}>✓ {score.correct}</Text>
          <Text style={styles.scoreRed}>✗ {score.wrong}</Text>
        </View>
      </View>

      {/* Timer */}
      <View style={styles.timerBar}>
        <View style={styles.timerTrack}>
          <View
            style={[
              styles.timerFill,
              { width: `${(timeLeft / TIME_LIMIT) * 100}%` },
              danger && { backgroundColor: '#E74C3C' },
            ]}
          />
        </View>
        <Text style={[styles.timerTxt, danger && { color: '#E74C3C' }]}>
          ⏱ {timeLeft}s
        </Text>
      </View>

      {/* Question */}
      <View style={[styles.qCard, feedback === 'right' && { borderColor: '#27AE60' }, feedback === 'wrong' && { borderColor: '#E74C3C' }]}>
        <Text style={styles.qText}>
          {question.a}  {question.op}  {question.b}  =  ?
        </Text>
      </View>

      <View style={styles.inputRow}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={input}
          onChangeText={setInput}
          keyboardType="number-pad"
          placeholder="Your answer"
          placeholderTextColor={COLORS.text_muted}
          returnKeyType="go"
          onSubmitEditing={submit}
          maxLength={6}
        />
        <TouchableOpacity style={styles.goBtn} onPress={submit}>
          <Text style={styles.goBtnTxt}>↵</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.hint}>Press ↵ (return key) to submit fast</Text>
    </View>
  );
}

const Stat = ({ label, value, color }: { label: string; value: any; color: string }) => (
  <View style={styles.stat}>
    <Text style={[styles.statVal, { color }]}>{value}</Text>
    <Text style={styles.statLbl}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg_primary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
  },
  back: { color: COLORS.accent_light, fontWeight: '700', fontSize: 14 },
  heading: { color: COLORS.text_primary, fontWeight: '900', fontSize: 18 },

  intro: { paddingHorizontal: 20, marginBottom: 24 },
  introTitle: { color: COLORS.text_primary, fontSize: 17, fontWeight: '800' },
  introSub: { color: COLORS.text_secondary, fontSize: 13, marginTop: 6, lineHeight: 19 },

  modeCard: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 20, marginBottom: 12,
    backgroundColor: COLORS.bg_card, borderRadius: 14,
    padding: 18, borderWidth: 1, borderColor: COLORS.border, gap: 14,
  },
  modeIcon: { fontSize: 24 },
  modeLbl: { color: COLORS.text_primary, fontWeight: '800', fontSize: 15, flex: 1 },
  modeArrow: { color: COLORS.text_muted, fontSize: 20 },

  // Game
  gameHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12,
  },
  gameScoreRow: { flexDirection: 'row', gap: 12 },
  scoreGreen: { color: '#27AE60', fontWeight: '900', fontSize: 16 },
  scoreRed:   { color: '#E74C3C', fontWeight: '900', fontSize: 16 },

  timerBar: { paddingHorizontal: 20, marginBottom: 16 },
  timerTrack: { height: 6, backgroundColor: COLORS.bg_card, borderRadius: 3, overflow: 'hidden' },
  timerFill: { height: 6, backgroundColor: COLORS.accent, borderRadius: 3 },
  timerTxt: { color: COLORS.accent_light, fontSize: 12, fontWeight: '800', marginTop: 6, textAlign: 'right' },

  qCard: {
    marginHorizontal: 20, backgroundColor: COLORS.bg_card, borderRadius: 20,
    padding: 36, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', marginBottom: 22,
  },
  qText: { color: COLORS.text_primary, fontSize: 40, fontWeight: '900', letterSpacing: 1 },

  inputRow: {
    flexDirection: 'row', marginHorizontal: 20, gap: 10, marginBottom: 12,
  },
  input: {
    flex: 1, backgroundColor: COLORS.bg_card, borderRadius: 14,
    borderWidth: 1, borderColor: COLORS.border, color: COLORS.text_primary,
    fontSize: 22, fontWeight: '700', paddingHorizontal: 16, paddingVertical: 14,
  },
  goBtn: {
    width: 56, backgroundColor: COLORS.accent, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  goBtnTxt: { color: '#fff', fontSize: 22, fontWeight: '900' },
  hint: { color: COLORS.text_muted, fontSize: 12, textAlign: 'center' },

  // Done
  doneWrap: { alignItems: 'center', padding: 24, paddingTop: 48 },
  doneEmoji: { fontSize: 72, marginBottom: 12 },
  doneTitle: { color: COLORS.text_primary, fontSize: 22, fontWeight: '900', marginBottom: 24 },
  statBox: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  stat: {
    backgroundColor: COLORS.bg_card, borderRadius: 14,
    paddingVertical: 16, paddingHorizontal: 22, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border, minWidth: 96,
  },
  statVal: { fontSize: 26, fontWeight: '900' },
  statLbl: { color: COLORS.text_secondary, fontSize: 11, marginTop: 4 },
  bigBtn: {
    backgroundColor: COLORS.accent, borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 28, alignItems: 'center',
    minWidth: 220,
  },
  bigBtnTxt: { color: '#fff', fontWeight: '800', fontSize: 15 },
});