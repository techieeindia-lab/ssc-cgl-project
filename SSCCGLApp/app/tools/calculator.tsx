import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, TextInput, Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../src/theme/colors';
import { evaluate } from '../../src/utils/calcEngine';

type CalcMode = 'basic' | 'si' | 'ci' | 'pl' | 'tsd';

type Key =
  | 'C' | '⌫' | '%' | '÷'
  | '7' | '8' | '9' | '×'
  | '4' | '5' | '6' | '-'
  | '1' | '2' | '3' | '+'
  | '±' | '0' | '.' | '='
  | '(' | ')' | '√' | '^'
  | 'π' | 'e';

const KEYS: Key[][] = [
  ['C',  '⌫', '%', '÷'],
  ['7',  '8', '9', '×'],
  ['4',  '5', '6', '-'],
  ['1',  '2', '3', '+'],
  ['±',  '0', '.', '='],
  ['(',  ')', '√', '^'],
  ['π',  'e'],
];

const MODES: { id: CalcMode; icon: string }[] = [
  { id: 'basic', icon: '🔢' },
  { id: 'si', icon: '💰' },
  { id: 'ci', icon: '📈' },
  { id: 'pl', icon: '📊' },
  { id: 'tsd', icon: '🚀' },
];

function fmt(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(2);
}

export default function CalculatorScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [mode, setMode] = useState<CalcMode>('basic');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg_primary} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>{t('calculator.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.heading}>{t('calculator.title')}</Text>
        <View style={{ width: 48 }} />
      </View>

      <View style={styles.modeRow}>
        {MODES.map((m) => (
          <TouchableOpacity
            key={m.id}
            style={[styles.modeTab, mode === m.id && styles.modeTabActive]}
            onPress={() => setMode(m.id)}
          >
            <Text style={styles.modeIcon}>{m.icon}</Text>
            <Text style={[styles.modeLabel, mode === m.id && styles.modeLabelActive]}>
              {t(`calculator.${modeLabels[m.id]}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {mode === 'basic' ? (
        <BasicCalc />
      ) : mode === 'si' ? (
        <SimpleInterestCalc />
      ) : mode === 'ci' ? (
        <CompoundInterestCalc />
      ) : mode === 'pl' ? (
        <ProfitLossCalc />
      ) : (
        <TimeSpeedDistCalc />
      )}
    </View>
  );
}

const modeLabels: Record<CalcMode, string> = {
  basic: 'basic',
  si: 'simpleInterest',
  ci: 'compoundInterest',
  pl: 'profitLoss',
  tsd: 'timeSpeedDistance',
};

function BasicCalc() {
  const { t } = useTranslation();
  const [expr, setExpr] = useState('');
  const [history, setHistory] = useState<string[]>([]);

  const press = (k: Key) => {
    if (k === 'C') return setExpr('');
    if (k === '⌫') return setExpr((e) => e.slice(0, -1));
    if (k === '=') {
      const { value, error } = evaluate(expr);
      if (error) return;
      setHistory((h) => [`${expr} = ${value}`, ...h].slice(0, 8));
      return setExpr(String(value));
    }
    if (k === '±') {
      return setExpr((e) => {
        const m = e.match(/(.*?)(\d+\.?\d*)$/);
        if (!m) return e.startsWith('-') ? e.slice(1) : '-' + e;
        return m[1] + (m[2].startsWith('-') ? m[2].slice(1) : '-' + m[2]);
      });
    }
    if (k === 'π') return setExpr((e) => e + 'π');
    if (k === 'e') return setExpr((e) => e + 'e');
    setExpr((e) => e + k);
  };

  const { value: preview, error } = expr === '' ? { value: 0, error: null } : evaluate(expr);
  const isPreviewValid = expr !== '' && !error;
  const isPrimary = (k: Key) => ['÷', '×', '-', '+', '='].includes(k);
  const isDanger  = (k: Key) => ['C'].includes(k);
  const isSpecial = (k: Key) => ['⌫', '%', '±', '^', '√', '(', ')'].includes(k);

  return (
    <>
      <View style={styles.display}>
        {history.length > 0 && (
          <Text style={styles.historyLine} numberOfLines={1}>{history[0]}</Text>
        )}
        <Text style={styles.expr} numberOfLines={2} adjustsFontSizeToFit>
          {expr || '0'}
        </Text>
        <Text style={[styles.preview, !isPreviewValid && expr !== '' && { color: '#E74C3C' }]}>
          {expr === '' ? '' : isPreviewValid ? `= ${preview}` : error ?? ''}
        </Text>
      </View>

      <View style={styles.pad}>
        {KEYS.flat().map((k, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.key, isPrimary(k) && styles.keyPrimary, isDanger(k) && styles.keyDanger, isSpecial(k) && styles.keySpecial]}
            onPress={() => press(k)}
            activeOpacity={0.7}
          >
            <Text style={[styles.keyTxt, isPrimary(k) && { color: '#fff', fontSize: 22 }, isDanger(k) && { color: '#E74C3C' }, isSpecial(k) && { color: COLORS.accent_light }]}>
              {k}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {history.length > 0 && (
        <ScrollView style={styles.historyList}>
          {history.slice(1).map((h, i) => (
            <TouchableOpacity key={i} onPress={() => setExpr(h.split(' = ')[0])}>
              <Text style={styles.historyItem}>{h}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </>
  );
}

function SimpleInterestCalc() {
  const { t } = useTranslation();
  const [p, setP] = useState('');
  const [r, setR] = useState('');
  const [tDays, setTDays] = useState('');
  const [result, setResult] = useState<{ si: number; amt: number } | null>(null);

  const calc = () => {
    Keyboard.dismiss();
    const P = parseFloat(p);
    const R = parseFloat(r);
    const T = parseFloat(tDays);
    if (isNaN(P) || isNaN(R) || isNaN(T)) return;
    const si = (P * R * T) / (365 * 100);
    setResult({ si: Math.round(si * 100) / 100, amt: Math.round((P + si) * 100) / 100 });
  };

  return (
    <ScrollView contentContainerStyle={styles.formContainer}>
      <Input label={t('calculator.principal')} val={p} onChange={setP} />
      <Input label={t('calculator.rate')} val={r} onChange={setR} />
      <Input label={t('calculator.timeDays')} val={tDays} onChange={setTDays} />
      <TouchableOpacity style={styles.calcBtn} onPress={calc}>
        <Text style={styles.calcBtnText}>{t('calculator.calculate')}</Text>
      </TouchableOpacity>
      {result && (
        <View style={styles.resultCard}>
          <ResultRow label={t('calculator.si')} value={`₹${fmt(result.si)}`} />
          <ResultRow label={t('calculator.amount')} value={`₹${fmt(result.amt)}`} color="#27AE60" />
        </View>
      )}
    </ScrollView>
  );
}

function CompoundInterestCalc() {
  const { t } = useTranslation();
  const [p, setP] = useState('');
  const [r, setR] = useState('');
  const [tYrs, setTYrs] = useState('');
  const [n, setN] = useState('12');
  const [result, setResult] = useState<{ ci: number; amt: number } | null>(null);

  const calc = () => {
    Keyboard.dismiss();
    const P = parseFloat(p);
    const R = parseFloat(r);
    const T = parseFloat(tYrs);
    const N = parseFloat(n);
    if (isNaN(P) || isNaN(R) || isNaN(T) || isNaN(N)) return;
    const amt = P * Math.pow(1 + R / (100 * N), N * T);
    setResult({ ci: Math.round((amt - P) * 100) / 100, amt: Math.round(amt * 100) / 100 });
  };

  return (
    <ScrollView contentContainerStyle={styles.formContainer}>
      <Input label={t('calculator.principal')} val={p} onChange={setP} />
      <Input label={t('calculator.rate')} val={r} onChange={setR} />
      <Input label={t('calculator.time')} val={tYrs} onChange={setTYrs} />
      <Input label={t('calculator.nperYear')} val={n} onChange={setN} />
      <TouchableOpacity style={styles.calcBtn} onPress={calc}>
        <Text style={styles.calcBtnText}>{t('calculator.calculate')}</Text>
      </TouchableOpacity>
      {result && (
        <View style={styles.resultCard}>
          <ResultRow label={t('calculator.ci')} value={`₹${fmt(result.ci)}`} />
          <ResultRow label={t('calculator.amount')} value={`₹${fmt(result.amt)}`} color="#27AE60" />
        </View>
      )}
    </ScrollView>
  );
}

function ProfitLossCalc() {
  const { t } = useTranslation();
  const [cp, setCp] = useState('');
  const [sp, setSp] = useState('');
  const [result, setResult] = useState<{ type: string; amt: number; pct: number } | null>(null);

  const calc = () => {
    Keyboard.dismiss();
    const CP = parseFloat(cp);
    const SP = parseFloat(sp);
    if (isNaN(CP) || isNaN(SP)) return;
    const diff = SP - CP;
    if (diff >= 0) {
      const pct = (diff / CP) * 100;
      setResult({ type: t('calculator.profit'), amt: Math.round(diff * 100) / 100, pct: Math.round(pct * 100) / 100 });
    } else {
      const pct = (Math.abs(diff) / CP) * 100;
      setResult({ type: t('calculator.loss'), amt: Math.round(Math.abs(diff) * 100) / 100, pct: Math.round(pct * 100) / 100 });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.formContainer}>
      <Input label={t('calculator.cp')} val={cp} onChange={setCp} />
      <Input label={t('calculator.sp')} val={sp} onChange={setSp} />
      <TouchableOpacity style={styles.calcBtn} onPress={calc}>
        <Text style={styles.calcBtnText}>{t('calculator.calculate')}</Text>
      </TouchableOpacity>
      {result && (
        <View style={styles.resultCard}>
          <ResultRow label={result.type} value={`₹${fmt(result.amt)}`} color={result.type === t('calculator.loss') ? '#E74C3C' : '#27AE60'} />
          <ResultRow label={result.type === t('calculator.loss') ? t('calculator.lossPct') : t('calculator.profitPct')} value={`${result.pct}%`} color={result.type === t('calculator.loss') ? '#E74C3C' : '#27AE60'} />
        </View>
      )}
    </ScrollView>
  );
}

function TimeSpeedDistCalc() {
  const { t } = useTranslation();
  const [d, setD] = useState('');
  const [s, setS] = useState('');
  const [tH, setTH] = useState('');
  const [result, setResult] = useState<{ label: string; value: string } | null>(null);

  const calc = () => {
    Keyboard.dismiss();
    const D = parseFloat(d);
    const S = parseFloat(s);
    const T = parseFloat(tH);
    const filled = [D ? 1 : 0, S ? 1 : 0, T ? 1 : 0].reduce((a, b) => a + b, 0);
    if (filled !== 2) return;
    if (D && S && !T) {
      setResult({ label: t('calculator.timeHrs'), value: `${fmt(Math.round((D / S) * 100) / 100)} hrs` });
    } else if (D && T && !S) {
      setResult({ label: t('calculator.speed'), value: `${fmt(Math.round((D / T) * 100) / 100)} km/h` });
    } else if (S && T && !D) {
      setResult({ label: t('calculator.distance'), value: `${fmt(Math.round((S * T) * 100) / 100)} km` });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.formContainer}>
      <Text style={styles.hint}>Enter any 2 values to find the third</Text>
      <Input label={t('calculator.distance') + ' (km)'} val={d} onChange={setD} />
      <Input label={t('calculator.speed') + ' (km/h)'} val={s} onChange={setS} />
      <Input label={t('calculator.timeHrs')} val={tH} onChange={setTH} />
      <TouchableOpacity style={styles.calcBtn} onPress={calc}>
        <Text style={styles.calcBtnText}>{t('calculator.calculate')}</Text>
      </TouchableOpacity>
      {result && (
        <View style={styles.resultCard}>
          <ResultRow label={result.label} value={result.value} color="#2E86DE" />
        </View>
      )}
    </ScrollView>
  );
}

function Input({ label, val, onChange }: { label: string; val: string; onChange: (v: string) => void }) {
  return (
    <View style={inputStyles.wrap}>
      <Text style={inputStyles.label}>{label}</Text>
      <TextInput
        style={inputStyles.input}
        value={val}
        onChangeText={onChange}
        keyboardType="decimal-pad"
        placeholderTextColor={COLORS.text_muted}
      />
    </View>
  );
}

function ResultRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={resultStyles.row}>
      <Text style={resultStyles.label}>{label}</Text>
      <Text style={[resultStyles.value, color && { color }]}>{value}</Text>
    </View>
  );
}

const inputStyles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '700', color: COLORS.text_secondary, marginBottom: 6, letterSpacing: 0.5 },
  input: {
    backgroundColor: COLORS.bg_card, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border,
    color: COLORS.text_primary, fontSize: 16, paddingHorizontal: 16, paddingVertical: 12,
  },
});

const resultStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  label: { fontSize: 14, color: COLORS.text_secondary, fontWeight: '600' },
  value: { fontSize: 18, fontWeight: '900', color: COLORS.text_primary },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg_primary },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 8,
  },
  back: { color: COLORS.accent_light, fontWeight: '700', fontSize: 14 },
  heading: { color: COLORS.text_primary, fontWeight: '900', fontSize: 18 },

  modeRow: {
    flexDirection: 'row', paddingHorizontal: 12, gap: 6, paddingBottom: 8,
  },
  modeTab: {
    flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 10,
    backgroundColor: COLORS.bg_card, borderWidth: 1, borderColor: COLORS.border,
  },
  modeTabActive: { backgroundColor: COLORS.accent + '22', borderColor: COLORS.accent },
  modeIcon: { fontSize: 16, marginBottom: 2 },
  modeLabel: { fontSize: 8, fontWeight: '700', color: COLORS.text_muted, textAlign: 'center' },
  modeLabelActive: { color: COLORS.accent_light },

  display: {
    marginHorizontal: 16, marginVertical: 8, padding: 18,
    backgroundColor: COLORS.bg_card, borderRadius: 16,
    borderWidth: 1, borderColor: COLORS.border, minHeight: 120,
    justifyContent: 'flex-end',
  },
  historyLine: { color: COLORS.text_muted, fontSize: 12, marginBottom: 4 },
  expr: { color: COLORS.text_primary, fontSize: 34, fontWeight: '300', textAlign: 'right' },
  preview: {
    color: COLORS.accent_light, fontSize: 22, fontWeight: '700',
    textAlign: 'right', marginTop: 6, minHeight: 26,
  },

  pad: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 12, paddingTop: 4, gap: 8,
  },
  key: {
    width: '23.5%', aspectRatio: 1.4,
    backgroundColor: COLORS.bg_card, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  keyPrimary: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  keyDanger:  { backgroundColor: '#E74C3C22', borderColor: '#E74C3C44' },
  keySpecial: { backgroundColor: COLORS.bg_secondary },
  keyTxt: { color: COLORS.text_primary, fontSize: 18, fontWeight: '700' },

  historyList: { paddingHorizontal: 16, marginTop: 4, maxHeight: 60 },
  historyItem: { color: COLORS.text_secondary, fontSize: 12, paddingVertical: 3 },

  formContainer: { padding: 20, paddingBottom: 40 },
  calcBtn: {
    backgroundColor: COLORS.accent, borderRadius: 14,
    paddingVertical: 14, alignItems: 'center', marginTop: 8,
  },
  calcBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  resultCard: {
    marginTop: 20, backgroundColor: COLORS.bg_card, borderRadius: 14,
    padding: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  hint: { fontSize: 12, color: COLORS.text_muted, marginBottom: 16, textAlign: 'center' },
});
