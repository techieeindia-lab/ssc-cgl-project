// app/exam/[id].tsx
// SSC CGL Official Interface — 3 Phase Flow

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  Alert, Modal, ActivityIndicator, BackHandler, StatusBar, Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getMockTestQuestions, getQuestionsBySection, getQuestionsByPaper } from '../../src/services/questionService';
import { saveTestResult } from '../../src/services/testService';
import { awardExamCoins, ExamReward } from '../../src/services/coinService';
import { useAuth } from '../../src/context/AuthContext';
import ConfirmModal from '../../src/components/common/ConfirmModal';

// ─── Official SSC CGL Color Palette ─────────────────────────
const SC = {
  headerBg:       '#1B3A6B',
  headerText:     '#FFFFFF',
  secActive:      '#008000',
  secInactive:    '#1565C0',
  secDone:        '#888888',
  timerBg:        '#FFD700',
  timerText:      '#000000',
  timerLowText:   '#CC0000',
  bg:             '#F0F0F0',
  white:          '#FFFFFF',
  border:         '#BBBBBB',
  text:           '#000000',
  subText:        '#444444',
  btnBlue:        '#1565C0',
  btnGreen:       '#006400',
  btnOrange:      '#CC4400',
  btnGray:        '#666666',
  notVisited:     '#4169E1',
  notAnswered:    '#FF4500',
  answered:       '#228B22',
  marked:         '#FF8C00',
  answeredMarked: '#800080',
};

const SECTION_ORDER = ['QA', 'GIR', 'GA', 'EN'];
const PART_LABELS: Record<string, string> = {
  QA: 'PART-A', GIR: 'PART-B', GA: 'PART-C', EN: 'PART-D',
};
const SECTION_NAMES: Record<string, string> = {
  QA:  'Quantitative Aptitude',
  GIR: 'General Intelligence & Reasoning',
  GA:  'General Awareness',
  EN:  'English Language (Basic Knowledge)',
};
const SECTION_TIME = 900;

type QStatus   = 'not_visited' | 'not_answered' | 'answered' | 'marked' | 'answered_marked';
type AnswerMap = Record<string, number | null>;
type StatusMap = Record<string, QStatus>;
type Phase     = 'instructions' | 'symbols' | 'exam';
type ConfirmData = {
  title: string;
  message: string;
  confirmText: string;
  confirmColor: string;
  onConfirm: () => void;
} | null;

// ════════════════════════════════════════════════
// MAIN EXPORT
// ════════════════════════════════════════════════
export default function ExamScreen() {
  const { id }   = useLocalSearchParams<{ id: string }>();
  const router   = useRouter();
  const { user } = useAuth();

  // ─── RESOLVE TEST CONFIGURATION ───────────────────────────
  const testConfig = React.useMemo(() => {
    const isPyst = (id || '').startsWith('pyst_');
    const isSectional = ['QA', 'GIR', 'GA', 'EN'].includes(id || '');
    const isPyq = (id || '').startsWith('pyq_');

    if (isPyst) {
      const section = (id || '').split('_')[1] || 'QA';
      const sectionName = SECTION_NAMES[section] || section;
      return {
        label: `${sectionName} PYST`,
        sections: [section],
        sectionTime: 900, // 15 mins
        totalQs: 25,
        maxScore: 50,
      };
    } else if (isSectional) {
      const sectionName = SECTION_NAMES[id || ''] || id || '';
      return {
        label: `${sectionName} Sectional`,
        sections: [id || 'QA'],
        sectionTime: 900, // 15 mins
        totalQs: 15,
        maxScore: 30,
      };
    } else if (isPyq) {
      const parts = (id || '').split('_');
      const year = parts[1] || '2024';
      const shiftPart = parts.find((p) => p.startsWith('s'));
      const shiftNum = shiftPart ? shiftPart.replace('s', '') : '1';
      return {
        label: `CGL ${year} (Shift ${shiftNum})`,
        sections: ['QA', 'GIR', 'GA', 'EN'],
        sectionTime: 900, // 15 mins per section
        totalQs: 100,
        maxScore: 200,
      };
    } else {
      return {
        label: 'Full Mock Test',
        sections: ['QA', 'GIR', 'GA', 'EN'],
        sectionTime: 900, // 15 mins per section
        totalQs: 100,
        maxScore: 200,
      };
    }
  }, [id]);

  const sectionsList = testConfig.sections;

  // ── ALL useState hooks together at the top ───
  const [confirmData,  setConfirmData]  = useState<ConfirmData>(null);
  const [phase,        setPhase]        = useState<Phase>('instructions');
  const [qBySection,   setQBySection]   = useState<Record<string, any[]>>({});
  const [answers,      setAnswers]      = useState<AnswerMap>({});
  const [statuses,     setStatuses]     = useState<StatusMap>({});
  const [secIdx,       setSecIdx]       = useState(0);
  const [qIdx,         setQIdx]         = useState(0);
  const [timeLeft,     setTimeLeft]     = useState(testConfig.sectionTime);
  const [doneSecs,     setDoneSecs]     = useState<string[]>([]);
  const [secResults,   setSecResults]   = useState<Record<string, any>>({});
  const [showPalette,  setShowPalette]  = useState(false);
  const [loading,      setLoading]      = useState(true);

  // ── ALL useRef hooks together ────────────────
  const timerRef      = useRef<ReturnType<typeof setInterval> | null>(null);
  const secIdxRef     = useRef(0);
  const answersRef    = useRef<AnswerMap>({});
  const qBySecRef     = useRef<Record<string, any[]>>({});
  const secResultsRef = useRef<Record<string, any>>({});

  // Keep refs in sync
  answersRef.current = answers;
  qBySecRef.current  = qBySection;

  // ── ALL useEffect hooks together ─────────────
  useEffect(() => {
    loadQuestions();
    const back = BackHandler.addEventListener('hardwareBackPress', () => {
      confirmExit();
      return true;
    });
    return () => back.remove();
  }, []);

  useEffect(() => {
    if (loading || phase !== 'exam') return;
    secIdxRef.current = secIdx;
    setTimeLeft(testConfig.sectionTime);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          onTimerEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, phase, secIdx, testConfig.sectionTime]);

  // ════════════════════════════════════════════════
  // DATA LOADING
  // ════════════════════════════════════════════════
  const loadQuestions = async () => {
    try {
      let all: any[] = [];
      const isPyst = (id || '').startsWith('pyst_');
      const isSectional = ['QA', 'GIR', 'GA', 'EN'].includes(id || '');
      const isPyq = (id || '').startsWith('pyq_');

      if (isPyst) {
        const section = (id || '').split('_')[1] || 'QA';
        // Previous Year Sectional Test fetches questions for that section
        const allSecQs = await getQuestionsBySection(section as any, 50); // Fetch more to select PYQs
        all = allSecQs.filter((q: any) => q.year !== null).slice(0, 25);
        if (all.length < 25) {
          all = allSecQs.slice(0, 25);
        }
      } else if (isSectional) {
        // Fetch exactly 15 questions for this specific section
        all = await getQuestionsBySection(id as any, 15, 'mock');
      } else if (isPyq) {
        // Fetch questions for this specific shift paper
        all = await getQuestionsByPaper(id);
        if (all.length === 0) {
          all = await getMockTestQuestions();
        }
      } else {
        // Full Mock Test
        all = await getQuestionsByPaper(id);
        if (all.length === 0) {
          all = await getMockTestQuestions();
        }
      }

      const byS: Record<string, any[]> = {};
      sectionsList.forEach((s) => {
        byS[s] = all.filter((q: any) => q.section === s);
      });
      setQBySection(byS);
      qBySecRef.current = byS;

      const initA: AnswerMap = {};
      const initS: StatusMap = {};
      all.forEach((q: any) => {
        initA[q.id] = null;
        initS[q.id] = 'not_visited';
      });

      const firstSec = sectionsList[0];
      if (byS[firstSec]?.[0]) initS[byS[firstSec][0].id] = 'not_answered';

      setAnswers(initA);
      setStatuses(initS);
    } catch (e) {
      console.error('Error loading questions:', e);
      Alert.alert('Error', 'Could not load questions. Check Firestore connection.');
    } finally {
      setLoading(false);
    }
  };

  // ════════════════════════════════════════════════
  // TIMER
  // ════════════════════════════════════════════════
  const onTimerEnd = () => {
    const sec = sectionsList[secIdxRef.current];
    Alert.alert(
      `⏰ Time Up! — ${PART_LABELS[sec]}`,
      `${SECTION_NAMES[sec]} has been auto-submitted.`,
      [{ text: 'Continue →', onPress: () => doSubmitSection(sec) }],
      { cancelable: false }
    );
  };

  // ════════════════════════════════════════════════
  // SCORING
  // ════════════════════════════════════════════════
  const scoreSingleSection = (sec: string) => {
    const qs = qBySecRef.current[sec] || [];
    let correct = 0, wrong = 0, skipped = 0;
    qs.forEach((q: any) => {
      const a = answersRef.current[q.id];
      if (a === null || a === undefined) skipped++;
      else if (a === q.correct) correct++;
      else wrong++;
    });
    return {
      section: sec, correct, wrong, skipped,
      score: correct * 2 - wrong * 0.5,
      total: qs.length,
    };
  };

  // ════════════════════════════════════════════════
  // SUBMIT LOGIC
  // ════════════════════════════════════════════════
  const doFinishExam = async (allResults: Record<string, any>) => {
    let tC = 0, tW = 0, tS = 0, tScore = 0;
    Object.values(allResults).forEach((r: any) => {
      tC     += r.correct  || 0;
      tW     += r.wrong    || 0;
      tS     += r.skipped  || 0;
      tScore += r.score    || 0;
    });

    const final = {
      score: tScore, correct: tC, wrong: tW, skipped: tS,
      total: testConfig.totalQs, maxScore: testConfig.maxScore, timeTaken: 0,
      sectionStats: allResults, testType: id || 'full',
    };

    if (user) {
      try {
        await saveTestResult(user.uid, {
          ...final,
          answers: answersRef.current,
          questionIds: [],
        });
        console.log('✅ Result saved to Firestore');
      } catch (e) {
        console.error('❌ Firebase save error:', e);
      }

      // Award coins/XP for completing the exam (no-op if not signed in).
      try {
        const reward: ExamReward = await awardExamCoins(
          user.uid,
          tScore,
          testConfig.maxScore,
          testConfig.totalQs,
        );
        (final as any).reward = reward;
      } catch (e) {
        console.error('❌ awardExamCoins error:', e);
      }
    }

    router.replace({
      pathname: '/exam/result',
      params: { result: JSON.stringify(final) },
    });
  };

  const doSubmitSection = (sec: string) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setShowPalette(false);

    const result     = scoreSingleSection(sec);
    const newResults = { ...secResultsRef.current, [sec]: result };
    secResultsRef.current = newResults;
    setSecResults({ ...newResults });
    setDoneSecs((prev) => [...prev, sec]);

    const nextIdx = sectionsList.indexOf(sec) + 1;

    if (nextIdx < sectionsList.length) {
      const nextSec = sectionsList[nextIdx];
      const nextQ   = qBySecRef.current[nextSec]?.[0];
      if (nextQ) {
        setStatuses((prev) => ({ ...prev, [nextQ.id]: 'not_answered' }));
      }
      setQIdx(0);
      secIdxRef.current = nextIdx;
      setSecIdx(nextIdx);
    } else {
      doFinishExam(newResults);
    }
  };

  const handleSubmitSection = () => {
    const sec      = sectionsList[secIdxRef.current];
    const qs       = qBySecRef.current[sec] || [];
    const answered = qs.filter((q: any) => answersRef.current[q.id] !== null).length;
    const isLast   = secIdxRef.current === sectionsList.length - 1;
    setShowPalette(false);
    setConfirmData({
      title: `Submit ${PART_LABELS[sec]}?`,
      message: `Answered: ${answered} / ${qs.length}\nNot Answered: ${qs.length - answered}\n\n${
        isLast ? 'This will end the test.' : 'Next section opens immediately.'
      }`,
      confirmText: isLast ? '🏁 Finish & See Results' : 'Submit & Next →',
      confirmColor: '#006400',
      onConfirm: () => {
        setConfirmData(null);
        doSubmitSection(sec);
      },
    });
  };

  const handleSubmitTest = () => {
    const totalAnswered = Object.values(answersRef.current).filter((v) => v !== null).length;
    setShowPalette(false);
    setConfirmData({
      title: '🏁 Submit Entire Test?',
      message: `Total Answered: ${totalAnswered} / ${testConfig.totalQs}\nAll sections will be scored now.`,
      confirmText: 'Yes, Submit Test',
      confirmColor: '#8B0000',
      onConfirm: () => {
        setConfirmData(null);
        if (timerRef.current) clearInterval(timerRef.current);
        const allResults = { ...secResultsRef.current };
        sectionsList.forEach((s) => {
          if (!allResults[s]) allResults[s] = scoreSingleSection(s);
        });
        secResultsRef.current = allResults;
        doFinishExam(allResults);
      },
    });
  };

  // ════════════════════════════════════════════════
  // ANSWER ACTIONS
  // ════════════════════════════════════════════════
  const selectOption = (idx: number) => {
    if (!currentQ) return;
    setAnswers((prev) => ({ ...prev, [currentQ.id]: idx }));
    setStatuses((prev) => ({
      ...prev,
      [currentQ.id]: prev[currentQ.id] === 'marked' ? 'answered_marked' : 'answered',
    }));
  };

  const clearResponse = () => {
    if (!currentQ) return;
    setAnswers((prev) => ({ ...prev, [currentQ.id]: null }));
    setStatuses((prev) => ({ ...prev, [currentQ.id]: 'not_answered' }));
  };

  const markForReview = () => {
    if (!currentQ) return;
    setStatuses((prev) => ({
      ...prev,
      [currentQ.id]: answers[currentQ.id] !== null ? 'answered_marked' : 'marked',
    }));
    goNext();
  };

  const saveAndNext = () => { goNext(); };

  // ════════════════════════════════════════════════
  // NAVIGATION
  // ════════════════════════════════════════════════
  const goNext = () => {
    if (qIdx < currentQs.length - 1) {
      const nq = currentQs[qIdx + 1];
      if (statuses[nq.id] === 'not_visited')
        setStatuses((p) => ({ ...p, [nq.id]: 'not_answered' }));
      setQIdx((i) => i + 1);
    }
  };

  const goPrev = () => { if (qIdx > 0) setQIdx((i) => i - 1); };

  const jumpTo = (i: number) => {
    const q = currentQs[i];
    if (q && statuses[q.id] === 'not_visited')
      setStatuses((p) => ({ ...p, [q.id]: 'not_answered' }));
    setQIdx(i);
    setShowPalette(false);
  };

  const confirmExit = () =>
    Alert.alert(
      'Exit Test?', 'All progress will be lost.',
      [
        { text: 'Stay', style: 'cancel' },
        { text: 'Exit', style: 'destructive', onPress: () => router.back() },
      ]
    );

  // ════════════════════════════════════════════════
  // DERIVED VALUES
  // ════════════════════════════════════════════════
  const currentSec = sectionsList[secIdx];
  const currentQs  = qBySection[currentSec] || [];
  const currentQ   = currentQs[qIdx];
  const isTimeLow  = timeLeft <= 120;

  const fmt = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const dotColor = (status: QStatus): string => ({
    not_visited:     SC.notVisited,
    not_answered:    SC.notAnswered,
    answered:        SC.answered,
    marked:          SC.marked,
    answered_marked: SC.answeredMarked,
  }[status] ?? SC.notVisited);

  const secStats = (sec: string) => {
    const qs = qBySection[sec] || [];
    return {
      answered:   qs.filter((q) => answers[q.id] !== null && statuses[q.id] !== 'marked').length,
      notAnswered:qs.filter((q) => answers[q.id] === null && (statuses[q.id] === 'not_answered' || statuses[q.id] === 'not_visited')).length,
      marked:     qs.filter((q) => statuses[q.id] === 'marked' || statuses[q.id] === 'answered_marked').length,
    };
  };

  // ════════════════════════════════════════════════
  // PHASE 1 — INSTRUCTIONS
  // ════════════════════════════════════════════════
  if (phase === 'instructions') {
    const isSingleSec = sectionsList.length === 1;
    return (
      <View style={p1.root}>
        <StatusBar barStyle="dark-content" backgroundColor={SC.bg} />
        <View style={p1.header}>
          <Text style={p1.headerTitle}>{isSingleSec ? `${testConfig.label} Instructions` : 'Instructions, Terms & Conditions'}</Text>
        </View>
        <ScrollView style={p1.scroll} contentContainerStyle={{ paddingBottom: 32 }}>
          {isSingleSec ? (
            // Dynamic instructions for Sectional / PYST tests
            <View>
              <Text style={p1.secNum}>1.</Text>
              <Text style={p1.secTitle}>Exam Overview / परीक्षा का संक्षिप्त विवरण</Text>
              <View style={p1.bulletBox}>
                <Text style={p1.bullet}>• Test Mode: {testConfig.label}</Text>
                <Text style={p1.bullet}>• Subject / विषय: {SECTION_NAMES[sectionsList[0]]}</Text>
                <Text style={p1.bullet}>• Total Questions / कुल प्रश्न: {testConfig.totalQs} Questions</Text>
                <Text style={p1.bullet}>• Duration / अवधि: {Math.floor(testConfig.sectionTime / 60)} minutes / मिनट</Text>
                <Text style={p1.bullet}>• Max Marks / अधिकतम अंक: {testConfig.maxScore} Marks</Text>
              </View>

              <Text style={p1.secNum}>2.</Text>
              <Text style={p1.secTitle}>Marking Scheme / अंक योजना</Text>
              <View style={p1.markBox}>
                <View style={p1.markRow}>
                  <View style={[p1.markDot, { backgroundColor: SC.answered }]} />
                  <Text style={p1.markTxt}>Correct Answer: <Text style={{ color: SC.answered, fontWeight: '700' }}>+2 Marks</Text></Text>
                </View>
                <View style={p1.markRow}>
                  <View style={[p1.markDot, { backgroundColor: SC.notAnswered }]} />
                  <Text style={p1.markTxt}>Wrong Answer: <Text style={{ color: '#CC0000', fontWeight: '700' }}>-0.5 Marks</Text></Text>
                </View>
                <View style={p1.markRow}>
                  <View style={[p1.markDot, { backgroundColor: '#888' }]} />
                  <Text style={p1.markTxt}>Not Attempted: <Text style={{ fontWeight: '700' }}>0 Marks</Text></Text>
                </View>
              </View>

              <Text style={p1.secNum}>3.</Text>
              <Text style={p1.secTitle}>Timing & Navigation / समय एवं नेविगेशन</Text>
              <View style={p1.bulletBox}>
                <Text style={p1.bullet}>• The timer shows remaining time for this section.</Text>
                <Text style={p1.bullet}>• The test will auto-submit when the {Math.floor(testConfig.sectionTime / 60)}-minute timer runs out.</Text>
                <Text style={p1.bullet}>• You can submit early by clicking "Submit Section" or "Finish & See Results" inside the Question Palette.</Text>
              </View>
            </View>
          ) : (
            // Full Mock Test instructions
            <View>
              <Text style={p1.secNum}>1.</Text>
              <Text style={p1.secTitle}>Exam Overview / परीक्षा का संक्षिप्त विवरण</Text>
              <View style={p1.bulletBox}>
                {[
                  `Duration: ${Math.floor((testConfig.sectionTime * sectionsList.length) / 60)} minutes / अवधि: ${Math.floor((testConfig.sectionTime * sectionsList.length) / 60)} मिनट`,
                  `Total Questions / कुल प्रश्न: ${testConfig.totalQs}`,
                  'Negative Marking: 0.50 marks deducted for each wrong answer.',
                  `Number of Sections displayed at any time: 1 section per ${Math.floor(testConfig.sectionTime / 60)} minutes.`,
                ].map((b, i) => <Text key={i} style={p1.bullet}>• {b}</Text>)}
              </View>

              <View style={p1.table}>
                <View style={[p1.tableRow, p1.tableHeader]}>
                  <Text style={[p1.tableCell, p1.tableCellHeader, { flex: 1.2 }]}>Section</Text>
                  <Text style={[p1.tableCell, p1.tableCellHeader, { flex: 2 }]}>Subject</Text>
                  <Text style={[p1.tableCell, p1.tableCellHeader]}>Questions</Text>
                  <Text style={[p1.tableCell, p1.tableCellHeader]}>Max Marks</Text>
                </View>
                {[
                  { id: 'EN',  part: 'PART-A', name: 'English Language (Basic Knowledge)', q: testConfig.totalQs / sectionsList.length, m: (testConfig.totalQs / sectionsList.length) * 2 },
                  { id: 'GIR', part: 'PART-B', name: 'General Intelligence', q: testConfig.totalQs / sectionsList.length, m: (testConfig.totalQs / sectionsList.length) * 2 },
                  { id: 'QA',  part: 'PART-C', name: 'Quantitative Aptitude', q: testConfig.totalQs / sectionsList.length, m: (testConfig.totalQs / sectionsList.length) * 2 },
                  { id: 'GA',  part: 'PART-D', name: 'General Awareness', q: testConfig.totalQs / sectionsList.length, m: (testConfig.totalQs / sectionsList.length) * 2 },
                ].map((row) => (
                  <View key={row.id} style={p1.tableRow}>
                    <Text style={[p1.tableCell, { flex: 1.2 }]}>{row.part}</Text>
                    <Text style={[p1.tableCell, { flex: 2 }]}>{row.name}</Text>
                    <Text style={p1.tableCell}>{row.q}</Text>
                    <Text style={p1.tableCell}>{row.m}</Text>
                  </View>
                ))}
              </View>

              <Text style={p1.secNum}>2.</Text>
              <Text style={p1.secTitle}>Timing & Submission / समय एवं जमा करना</Text>
              <View style={p1.bulletBox}>
                {[
                  'The timer (top right) shows remaining time for the current section.',
                  'Each section has a 15-minute timer. Auto-submits when time ends.',
                  'You can submit a section early by clicking "Submit Section".',
                  'After the last section, the exam ends and results are shown.',
                ].map((b, i) => <Text key={i} style={p1.bullet}>• {b}</Text>)}
              </View>

              <Text style={p1.secNum}>3.</Text>
              <Text style={p1.secTitle}>Navigation / नेविगेशन</Text>
              <View style={p1.bulletBox}>
                {[
                  'Sections are shown one at a time. You cannot jump to a future section.',
                  'Within a section, you can freely move between questions.',
                  'Use Previous or Save & Next to move between questions.',
                  'Use Mark for Review to flag questions you want to revisit.',
                  'After you submit a section, you cannot return to it.',
                ].map((b, i) => <Text key={i} style={p1.bullet}>• {b}</Text>)}
              </View>

              <Text style={p1.secNum}>4.</Text>
              <Text style={p1.secTitle}>Marking Scheme / अंक योजना</Text>
              <View style={p1.markBox}>
                <View style={p1.markRow}>
                  <View style={[p1.markDot, { backgroundColor: SC.answered }]} />
                  <Text style={p1.markTxt}>Correct Answer: <Text style={{ color: SC.answered, fontWeight: '700' }}>+2 Marks</Text></Text>
                </View>
                <View style={p1.markRow}>
                  <View style={[p1.markDot, { backgroundColor: SC.notAnswered }]} />
                  <Text style={p1.markTxt}>Wrong Answer: <Text style={{ color: '#CC0000', fontWeight: '700' }}>-0.5 Marks</Text></Text>
                </View>
                <View style={p1.markRow}>
                  <View style={[p1.markDot, { backgroundColor: '#888' }]} />
                  <Text style={p1.markTxt}>Not Attempted: <Text style={{ fontWeight: '700' }}>0 Marks</Text></Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={p1.bottomBar}>
          <TouchableOpacity style={p1.backBtn} onPress={() => router.back()}>
            <Text style={p1.backBtnTxt}>◄ Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={p1.agreeBtn} onPress={() => setPhase('symbols')}>
            <Text style={p1.agreeBtnTxt}>I Agree ►</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ════════════════════════════════════════════════
  // PHASE 2 — SYMBOLS & LANGUAGE
  // ════════════════════════════════════════════════
  if (phase === 'symbols') {
    return (
      <View style={p1.root}>
        <StatusBar barStyle="dark-content" backgroundColor={SC.bg} />
        <View style={p1.header}>
          <Text style={p1.headerTitle}>Symbols & Language / प्रतीक एवं भाषा</Text>
        </View>
        <ScrollView style={p1.scroll} contentContainerStyle={{ paddingBottom: 32 }}>
          <Text style={sym.intro}>
            The different symbols used in the exam are shown below. Please go through them before you start the test.
          </Text>

          <View style={p1.table}>
            <View style={[p1.tableRow, p1.tableHeader]}>
              <Text style={[p1.tableCell, p1.tableCellHeader, { flex: 0.8 }]}>Symbol</Text>
              <Text style={[p1.tableCell, p1.tableCellHeader, { flex: 3 }]}>Description</Text>
            </View>
            {[
              { dot: null,  border: '#888',        bg: '#fff',           label: 'Option Not Chosen — No answer selected.' },
              { dot: '✓',   border: SC.answered,   bg: SC.answered,      label: 'Option Chosen as Correct — Click again to deselect.' },
              { num: '12',  bg: SC.notVisited,                           label: 'Question in blue: You have NOT yet attempted this question.' },
              { num: '13',  bg: SC.answered,                             label: 'Question in green: You HAVE answered this question.' },
              { num: '14',  bg: SC.marked,                               label: 'You have NOT answered, but marked it for later.' },
              { num: '15',  bg: SC.answeredMarked,                       label: 'You HAVE answered, but marked it for review (still evaluated).' },
            ].map((item: any, i: number) => (
              <View key={i} style={[p1.tableRow, { alignItems: 'center' }]}>
                <View style={sym.symbolCell}>
                  {item.num ? (
                    <View style={[sym.numBadge, { backgroundColor: item.bg }]}>
                      <Text style={sym.numBadgeTxt}>{item.num}</Text>
                    </View>
                  ) : (
                    <View style={[sym.radioBadge, { borderColor: item.border ?? '#888' }]}>
                      {item.dot && <Text style={{ color: SC.answered, fontSize: 14 }}>{item.dot}</Text>}
                    </View>
                  )}
                </View>
                <Text style={[p1.tableCell, { flex: 3, color: SC.subText, fontSize: 12 }]}>{item.label}</Text>
              </View>
            ))}
          </View>

          <Text style={sym.subTitle}>Button Guide:</Text>
          {[
            { btn: 'Save & Next',    color: SC.btnBlue,   desc: 'Save your answer and move to the next question.' },
            { btn: 'Previous',       color: SC.btnGray,   desc: 'Go back to the previous question.' },
            { btn: 'Mark for Review',color: SC.btnOrange, desc: 'Flag this question to revisit later.' },
            { btn: 'Clear Response', color: SC.btnGray,   desc: 'Remove your selected answer for this question.' },
            { btn: 'Submit Section', color: SC.btnGreen,  desc: 'Submit current section and move to the next.' },
          ].map((item) => (
            <View key={item.btn} style={sym.btnGuideRow}>
              <View style={[sym.btnSample, { backgroundColor: item.color }]}>
                <Text style={sym.btnSampleTxt}>{item.btn}</Text>
              </View>
              <Text style={sym.btnGuideDesc}>{item.desc}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={p1.bottomBar}>
          <TouchableOpacity style={p1.backBtn} onPress={() => setPhase('instructions')}>
            <Text style={p1.backBtnTxt}>◄ Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[p1.agreeBtn, loading && { opacity: 0.6 }]}
            onPress={() => !loading && setPhase('exam')}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={p1.agreeBtnTxt}>Start Test ►</Text>
            }
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ════════════════════════════════════════════════
  // PHASE 3 — EXAM
  // ════════════════════════════════════════════════
  if (!currentQ) {
    return (
      <View style={ex.centered}>
        <ActivityIndicator size="large" color={SC.btnBlue} />
        <Text style={{ marginTop: 12, color: SC.subText }}>Loading questions...</Text>
      </View>
    );
  }

  const stats = secStats(currentSec);

  return (
    <View style={ex.root}>
      <StatusBar barStyle="light-content" backgroundColor={SC.headerBg} />

      {/* ═══ HEADER ═══ */}
      <View style={ex.header}>
        <View style={{ flex: 1 }}>
          <Text style={ex.headerTitle}>{testConfig.label.toUpperCase()}</Text>
          <Text style={ex.headerSub}>{SECTION_NAMES[currentSec]}</Text>
        </View>
        <View style={[ex.timerBox, isTimeLow && ex.timerBoxLow]}>
          <Text style={ex.timerLabel}>Time Left</Text>
          <Text style={[ex.timerVal, isTimeLow && { color: SC.timerLowText }]}>
            {fmt(timeLeft)}
          </Text>
        </View>
      </View>

      {/* ═══ SECTION TABS ═══ */}
      <View style={ex.secRow}>
        {sectionsList.map((sec, i) => {
          const done   = doneSecs.includes(sec);
          const active = i === secIdx;
          const locked = i > secIdx;
          return (
            <View
              key={sec}
              style={[
                ex.secBtn,
                active && { backgroundColor: SC.secActive },
                done   && { backgroundColor: '#888' },
                locked && { backgroundColor: '#CCC' },
              ]}
            >
              <Text style={[ex.secBtnTxt, locked && { color: '#999' }]}>
                {done ? '✓ ' : ''}{PART_LABELS[sec]}
              </Text>
            </View>
          );
        })}
      </View>

      {/* ═══ TOP ACTION ROW ═══ */}
      <View style={ex.topActionRow}>
        <TouchableOpacity style={ex.markBtn} onPress={markForReview}>
          <Text style={ex.markBtnTxt}>Mark for Review</Text>
        </TouchableOpacity>
        <TouchableOpacity style={ex.saveNextBtn} onPress={saveAndNext}>
          <Text style={ex.saveNextBtnTxt}>Save & Next</Text>
        </TouchableOpacity>
      </View>

      {/* ═══ QUESTION AREA ═══ */}
      <ScrollView style={ex.scroll} contentContainerStyle={{ paddingBottom: 12 }}>
        <View style={ex.qMeta}>
          <Text style={ex.qNumLabel}>Question : {qIdx + 1}</Text>
          <TouchableOpacity onPress={clearResponse}>
            <Text style={ex.clearLink}>Clear Response</Text>
          </TouchableOpacity>
        </View>

        <View style={ex.qCard}>
          <Text style={ex.qText}>{currentQ.text}</Text>
          {currentQ.questionImg ? (
            <Image
              source={{ uri: currentQ.questionImg }}
              style={ex.qImage}
              resizeMode="contain"
            />
          ) : null}
        </View>

        {currentQ.options.map((opt: string, i: number) => {
          const sel = answers[currentQ.id] === i;
          const optImg = currentQ.optionImgs?.[i];
          return (
            <TouchableOpacity
              key={i}
              style={[ex.optRow, optImg ? { flexDirection: 'column', alignItems: 'flex-start' } : null]}
              onPress={() => selectOption(i)}
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={[ex.radio, sel && ex.radioSel]}>
                  {sel && <View style={ex.radioDot} />}
                </View>
                <Text style={[ex.optTxt, sel && ex.optTxtSel]}>{opt}</Text>
              </View>
              {optImg ? (
                <Image
                  source={{ uri: optImg }}
                  style={ex.optImage}
                  resizeMode="contain"
                />
              ) : null}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ═══ BOTTOM NAV ═══ */}
      <View style={ex.bottomNav}>
        <TouchableOpacity
          style={[ex.prevBtn, qIdx === 0 && ex.btnOff]}
          onPress={goPrev}
          disabled={qIdx === 0}
        >
          <Text style={ex.prevBtnTxt}>◄ Previous</Text>
        </TouchableOpacity>
        <TouchableOpacity style={ex.paletteOpenBtn} onPress={() => setShowPalette(true)}>
          <Text style={ex.paletteOpenTxt}>
            ⊞ Palette  {stats.answered}/{currentQs.length}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={ex.saveNextBtn2} onPress={saveAndNext}>
          <Text style={ex.saveNextBtnTxt}>Save & Next ►</Text>
        </TouchableOpacity>
      </View>

      {/* ═══ PALETTE MODAL ═══ */}
      <Modal
        visible={showPalette}
        animationType="slide"
        transparent
        onRequestClose={() => setShowPalette(false)}
      >
        <View style={pal.overlay}>
          <View style={pal.sheet}>
            <View style={pal.head}>
              <Text style={pal.headTtl}>{PART_LABELS[currentSec]} — {SECTION_NAMES[currentSec]}</Text>
              <TouchableOpacity onPress={() => setShowPalette(false)}>
                <Text style={pal.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={pal.legend}>
              {[
                { c: SC.notVisited,     l: 'Not Visited' },
                { c: SC.notAnswered,    l: 'Not Answered' },
                { c: SC.answered,       l: 'Answered' },
                { c: SC.marked,         l: 'Marked' },
                { c: SC.answeredMarked, l: 'Ans+Marked' },
              ].map((item) => (
                <View key={item.l} style={pal.legendItem}>
                  <View style={[pal.legendDot, { backgroundColor: item.c }]} />
                  <Text style={pal.legendLbl}>{item.l}</Text>
                </View>
              ))}
            </View>

            <ScrollView style={{ maxHeight: 200 }} contentContainerStyle={pal.grid}>
              {currentQs.map((q: any, i: number) => (
                <TouchableOpacity
                  key={q.id}
                  style={[
                    pal.dot,
                    { backgroundColor: dotColor(statuses[q.id] || 'not_visited') },
                    i === qIdx && pal.dotCurrent,
                  ]}
                  onPress={() => jumpTo(i)}
                >
                  <Text style={pal.dotNum}>{i + 1}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={pal.analysis}>
              <Text style={pal.analysisTtl}>{PART_LABELS[currentSec]} Analysis</Text>
              <View style={pal.analysisTable}>
                {[
                  { label: 'Answered',        val: stats.answered,    color: SC.answered },
                  { label: 'Not Answered',    val: stats.notAnswered, color: SC.notAnswered },
                  { label: 'Mark for Review', val: stats.marked,      color: SC.marked },
                ].map((row) => (
                  <View key={row.label} style={pal.analysisRow}>
                    <Text style={pal.analysisLabel}>{row.label}</Text>
                    <View style={[pal.analysisBadge, { backgroundColor: row.color }]}>
                      <Text style={pal.analysisBadgeTxt}>{row.val}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            <View style={pal.submitArea}>
              <TouchableOpacity style={pal.submitSecBtn} onPress={handleSubmitSection}>
                <Text style={pal.submitSecTxt}>
                  {secIdx === sectionsList.length - 1
                    ? '🏁 Finish & See Results'
                    : `Submit ${PART_LABELS[currentSec]} →`}
                </Text>
              </TouchableOpacity>
              {secIdx < sectionsList.length - 1 && (
                <TouchableOpacity style={pal.submitTestBtn} onPress={handleSubmitTest}>
                  <Text style={pal.submitTestTxt}>🏁 Submit Entire Test</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* ═══ CONFIRM MODAL — works on top of palette ═══ */}
      {confirmData && (
        <ConfirmModal
          visible={true}
          title={confirmData.title}
          message={confirmData.message}
          confirmText={confirmData.confirmText}
          confirmColor={confirmData.confirmColor}
          onConfirm={confirmData.onConfirm}
          onCancel={() => setConfirmData(null)}
        />
      )}
    </View>
  );
}

// ════════════════════════════════════════════════
// STYLES
// ════════════════════════════════════════════════
const p1 = StyleSheet.create({
  root:            { flex: 1, backgroundColor: SC.bg },
  header:          { backgroundColor: SC.headerBg, paddingTop: 52, paddingBottom: 14, paddingHorizontal: 16 },
  headerTitle:     { color: '#fff', fontSize: 16, fontWeight: '800' },
  scroll:          { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  secNum:          { color: SC.text, fontWeight: '800', fontSize: 14, marginTop: 16 },
  secTitle:        { color: SC.text, fontWeight: '700', fontSize: 13, marginBottom: 6, borderBottomWidth: 1, borderBottomColor: SC.border, paddingBottom: 4 },
  bulletBox:       { marginLeft: 12, marginBottom: 8 },
  bullet:          { color: SC.subText, fontSize: 12.5, marginBottom: 4, lineHeight: 18 },
  table:           { borderWidth: 1, borderColor: SC.border, borderRadius: 4, overflow: 'hidden', marginBottom: 12 },
  tableRow:        { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: SC.border },
  tableHeader:     { backgroundColor: '#D0D8E8' },
  tableCell:       { flex: 1, padding: 8, fontSize: 12, color: SC.text },
  tableCellHeader: { fontWeight: '700', color: '#002060' },
  markBox:         { backgroundColor: '#F9F9F9', borderWidth: 1, borderColor: SC.border, borderRadius: 8, padding: 12, marginBottom: 12 },
  markRow:         { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
  markDot:         { width: 14, height: 14, borderRadius: 7 },
  markTxt:         { fontSize: 13, color: SC.subText },
  bottomBar:       { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderTopWidth: 1, borderTopColor: SC.border, backgroundColor: '#E8EAF0' },
  backBtn:         { backgroundColor: SC.btnGray, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 6 },
  backBtnTxt:      { color: '#fff', fontWeight: '700' },
  agreeBtn:        { backgroundColor: SC.btnBlue, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 6, minWidth: 120, alignItems: 'center' },
  agreeBtnTxt:     { color: '#fff', fontWeight: '800', fontSize: 15 },
});

const sym = StyleSheet.create({
  intro:        { fontSize: 13, color: SC.text, marginBottom: 14, lineHeight: 20 },
  symbolCell:   { flex: 0.8, padding: 8, alignItems: 'center', justifyContent: 'center' },
  numBadge:     { width: 32, height: 32, borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  numBadgeTxt:  { color: '#fff', fontWeight: '800', fontSize: 13 },
  radioBadge:   { width: 24, height: 24, borderRadius: 12, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  subTitle:     { fontWeight: '800', fontSize: 13, color: '#002060', marginTop: 16, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: SC.border, paddingBottom: 4 },
  btnGuideRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  btnSample:    { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 4, minWidth: 100, alignItems: 'center' },
  btnSampleTxt: { color: '#fff', fontWeight: '700', fontSize: 11 },
  btnGuideDesc: { flex: 1, fontSize: 12, color: SC.subText },
});

const ex = StyleSheet.create({
  root:           { flex: 1, backgroundColor: SC.bg },
  centered:       { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: SC.bg },
  header:         { flexDirection: 'row', alignItems: 'center', backgroundColor: SC.headerBg, paddingTop: 46, paddingBottom: 10, paddingHorizontal: 14, gap: 10 },
  headerTitle:    { color: '#fff', fontSize: 14, fontWeight: '800' },
  headerSub:      { color: '#AAC4FF', fontSize: 10, marginTop: 2 },
  timerBox:       { backgroundColor: SC.timerBg, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, alignItems: 'center', minWidth: 80 },
  timerBoxLow:    { backgroundColor: '#FFE0E0' },
  timerLabel:     { fontSize: 9, color: '#333', fontWeight: '600' },
  timerVal:       { fontSize: 17, fontWeight: '800', color: SC.timerText },
  secRow:         { flexDirection: 'row', backgroundColor: '#EEF2FF', borderBottomWidth: 2, borderBottomColor: '#CCC', paddingHorizontal: 8, paddingVertical: 6, gap: 6 },
  secBtn:         { flex: 1, backgroundColor: SC.secInactive, borderRadius: 4, paddingVertical: 7, alignItems: 'center' },
  secBtnTxt:      { color: '#fff', fontSize: 11, fontWeight: '800' },
  topActionRow:   { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#F5F5F5', borderBottomWidth: 1, borderBottomColor: SC.border, gap: 8 },
  markBtn:        { backgroundColor: SC.btnOrange, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 4 },
  markBtnTxt:     { color: '#fff', fontWeight: '700', fontSize: 12 },
  saveNextBtn:    { backgroundColor: SC.btnBlue, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 4 },
  saveNextBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 12 },
  scroll:         { flex: 1, paddingHorizontal: 14, paddingTop: 10 },
  qMeta:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  qNumLabel:      { color: SC.text, fontWeight: '800', fontSize: 14 },
  clearLink:      { color: '#CC0000', fontSize: 12, textDecorationLine: 'underline' },
  qCard:          { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#666', borderRadius: 6, padding: 14, marginBottom: 14 },
  qText:          { color: SC.text, fontSize: 15, lineHeight: 24 },
  optRow:         { flexDirection: 'row', alignItems: 'center', backgroundColor: SC.white, borderWidth: 1, borderColor: SC.border, borderRadius: 6, padding: 12, marginBottom: 8, gap: 12 },
  radio:          { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#666', justifyContent: 'center', alignItems: 'center' },
  radioSel:       { borderColor: SC.btnBlue },
  radioDot:       { width: 10, height: 10, borderRadius: 5, backgroundColor: SC.btnBlue },
  optTxt:         { flex: 1, color: SC.text, fontSize: 14 },
  optTxtSel:      { color: SC.btnBlue, fontWeight: '600' },
  bottomNav:      { flexDirection: 'row', backgroundColor: '#E8EAF0', paddingHorizontal: 10, paddingBottom: 24, paddingTop: 10, gap: 8, borderTopWidth: 1, borderTopColor: SC.border },
  prevBtn:        { flex: 1, backgroundColor: SC.btnGray, borderRadius: 4, paddingVertical: 11, alignItems: 'center' },
  btnOff:         { opacity: 0.4 },
  prevBtnTxt:     { color: '#fff', fontWeight: '700', fontSize: 12 },
  paletteOpenBtn: { flex: 2, backgroundColor: '#002060', borderRadius: 4, paddingVertical: 11, alignItems: 'center' },
  paletteOpenTxt: { color: '#fff', fontWeight: '700', fontSize: 12 },
  saveNextBtn2:   { flex: 2, backgroundColor: SC.btnBlue, borderRadius: 4, paddingVertical: 11, alignItems: 'center' },
  qImage:         { width: '100%', height: 180, marginTop: 12, borderRadius: 8, backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#eee' },
  optImage:       { width: 140, height: 80, marginTop: 8, marginLeft: 32, borderRadius: 6, backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#eee' },
});

const pal = StyleSheet.create({
  overlay:          { flex: 1, backgroundColor: '#00000077', justifyContent: 'flex-end' },
  sheet:            { backgroundColor: SC.white, borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingBottom: 32 },
  head:             { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, backgroundColor: SC.headerBg, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  headTtl:          { color: '#fff', fontSize: 13, fontWeight: '800', flex: 1 },
  closeBtn:         { color: '#fff', fontSize: 18, paddingHorizontal: 8 },
  legend:           { flexDirection: 'row', flexWrap: 'wrap', padding: 10, gap: 8, borderBottomWidth: 1, borderBottomColor: SC.border, backgroundColor: '#F5F5F5' },
  legendItem:       { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot:        { width: 14, height: 14, borderRadius: 3 },
  legendLbl:        { fontSize: 10, color: SC.subText },
  grid:             { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 8 },
  dot:              { width: 40, height: 40, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  dotCurrent:       { borderWidth: 3, borderColor: '#000' },
  dotNum:           { color: '#fff', fontSize: 13, fontWeight: '800' },
  analysis:         { marginHorizontal: 12, marginTop: 8, borderWidth: 1, borderColor: SC.border, borderRadius: 6, overflow: 'hidden' },
  analysisTtl:      { backgroundColor: '#D0D8E8', padding: 8, color: '#002060', fontWeight: '800', fontSize: 13, textAlign: 'center' },
  analysisTable:    { backgroundColor: SC.white },
  analysisRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  analysisLabel:    { fontSize: 13, color: SC.text },
  analysisBadge:    { width: 32, height: 32, borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  analysisBadgeTxt: { color: '#fff', fontWeight: '800', fontSize: 14 },
  submitArea:       { padding: 12, gap: 8 },
  submitSecBtn:     { backgroundColor: SC.secActive, borderRadius: 6, paddingVertical: 14, alignItems: 'center' },
  submitSecTxt:     { color: '#fff', fontWeight: '800', fontSize: 15 },
  submitTestBtn:    { backgroundColor: '#8B0000', borderRadius: 6, paddingVertical: 12, alignItems: 'center' },
  submitTestTxt:    { color: '#fff', fontWeight: '700', fontSize: 13 },
});