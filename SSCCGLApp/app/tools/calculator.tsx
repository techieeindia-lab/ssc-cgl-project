// app/tools/calculator.tsx
// Scientific calculator with expression input + history strip.

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../../src/theme/colors';
import { evaluate } from '../../src/utils/calcEngine';

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

export default function CalculatorScreen() {
  const router = useRouter();
  const [expr, setExpr] = useState('');
  const [history, setHistory] = useState<string[]>([]);

  const press = (k: Key) => {
    if (k === 'C') return setExpr('');
    if (k === '⌫') return setExpr((e) => e.slice(0, -1));
    if (k === '=') {
      const { value, error } = evaluate(expr);
      if (error) return;
      setHistory((h) => [`${expr} = ${value}`, ...h].slice(0, 6));
      return setExpr(String(value));
    }
    if (k === '±') {
      // toggle sign of last number, or wrap whole expression
      return setExpr((e) => {
        const m = e.match(/(.*?)(\d+\.?\d*)$/);
        if (!m) return e.startsWith('-') ? e.slice(1) : '-' + e;
        const head = m[1];
        const num = m[2];
        return head + (num.startsWith('-') ? num.slice(1) : '-' + num);
      });
    }
    if (k === 'π') return setExpr((e) => e + 'π');
    if (k === 'e') return setExpr((e) => e + 'e');
    setExpr((e) => e + k);
  };

  const { value: preview, error } = expr === '' ? { value: 0, error: null } : evaluate(expr);
  const isPreviewValid = expr !== '' && !error;

  // Determine key style: highlight = primary, number/digit = normal, etc.
  const isPrimary = (k: Key) => ['÷', '×', '-', '+', '='].includes(k);
  const isDanger  = (k: Key) => ['C'].includes(k);
  const isSpecial = (k: Key) => ['⌫', '%', '±', '^', '√', '(', ')'].includes(k);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg_primary} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.heading}>🧮 Calculator</Text>
        <View style={{ width: 48 }} />
      </View>

      {/* Display */}
      <View style={styles.display}>
        {history.length > 0 && (
          <Text style={styles.historyLine} numberOfLines={1}>
            {history[0]}
          </Text>
        )}
        <Text style={styles.expr} numberOfLines={2} adjustsFontSizeToFit>
          {expr || '0'}
        </Text>
        <Text style={[styles.preview, !isPreviewValid && expr !== '' && { color: '#E74C3C' }]}>
          {expr === '' ? '' :
           isPreviewValid ? `= ${preview}` :
           error ?? ''}
        </Text>
      </View>

      {/* Keypad */}
      <View style={styles.pad}>
        {KEYS.flat().map((k, i) => (
          <TouchableOpacity
            key={i}
            style={[
              styles.key,
              isPrimary(k) && styles.keyPrimary,
              isDanger(k)  && styles.keyDanger,
              isSpecial(k) && styles.keySpecial,
            ]}
            onPress={() => press(k)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.keyTxt,
              isPrimary(k) && { color: '#fff', fontSize: 22 },
              isDanger(k)  && { color: '#E74C3C' },
              isSpecial(k) && { color: COLORS.accent_light },
            ]}>
              {k}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* History */}
      {history.length > 0 && (
        <ScrollView style={styles.historyList}>
          {history.slice(1).map((h, i) => (
            <TouchableOpacity key={i} onPress={() => setExpr(h.split(' = ')[0])}>
              <Text style={styles.historyItem}>{h}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg_primary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12,
  },
  back: { color: COLORS.accent_light, fontWeight: '700', fontSize: 14 },
  heading: { color: COLORS.text_primary, fontWeight: '900', fontSize: 18 },

  display: {
    marginHorizontal: 16, marginVertical: 8, padding: 18,
    backgroundColor: COLORS.bg_card, borderRadius: 16,
    borderWidth: 1, borderColor: COLORS.border, minHeight: 130,
    justifyContent: 'flex-end',
  },
  historyLine: { color: COLORS.text_muted, fontSize: 12, marginBottom: 4 },
  expr: { color: COLORS.text_primary, fontSize: 36, fontWeight: '300', textAlign: 'right' },
  preview: {
    color: COLORS.accent_light, fontSize: 22, fontWeight: '700',
    textAlign: 'right', marginTop: 6, minHeight: 26,
  },

  pad: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 12, paddingTop: 8, gap: 8,
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
  keyTxt: { color: COLORS.text_primary, fontSize: 20, fontWeight: '700' },

  historyList: {
    paddingHorizontal: 16, marginTop: 8, maxHeight: 80,
  },
  historyItem: {
    color: COLORS.text_secondary, fontSize: 13, paddingVertical: 4,
  },
});