// app/tools/periodic-table.tsx
// 18-column × 7-period grid, plus lanthanide/actinide rows.
// Tap an element to open a details sheet.

import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, StatusBar, Dimensions, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../../src/theme/colors';
import {
  ELEMENTS, CATEGORY_COLORS, CATEGORY_LABELS, Element,
} from '../../src/data/periodicTable';

const { width } = Dimensions.get('window');
// Leave a tiny margin so 18 columns fit comfortably.
const COL_W = (width - 16) / 19;
const ROW_H = COL_W * 1.1;

const CATS_ORDER: (keyof typeof CATEGORY_COLORS)[] = [
  'alkali', 'alkaline', 'transition', 'post-transition',
  'metalloid', 'nonmetal', 'halogen', 'noble', 'lanthanide', 'actinide',
];

export default function PeriodicTableScreen() {
  const router = useRouter();
  const [active, setActive] = useState<Element | null>(null);

  // Bucket elements by (group, period) for fast lookup.
  const cell = useMemo(() => {
    const map = new Map<string, Element>();
    ELEMENTS.forEach((el) => {
      if (el.group !== null) {
        map.set(`${el.group}-${el.period}`, el);
      }
    });
    return map;
  }, []);

  const lanthanides = ELEMENTS.filter((e) => e.category === 'lanthanide' && e.number >= 57);
  const actinides   = ELEMENTS.filter((e) => e.category === 'actinide' && e.number >= 89);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg_primary} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.heading}>⚛️ Periodic Table</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Period labels column (left margin) */}
        <View style={styles.gridWrap}>
          {[1, 2, 3, 4, 5, 6, 7].map((p) => (
            <View key={`p-${p}`} style={[styles.gridRow, { height: ROW_H }]}>
              <View style={styles.periodLabel}>
                <Text style={styles.periodLabelTxt}>{p}</Text>
              </View>
              {Array.from({ length: 18 }, (_, i) => i + 1).map((g) => {
                const el = cell.get(`${g}-${p}`);
                if (!el) {
                  return <View key={`${g}-${p}`} style={{ width: COL_W, height: ROW_H }} />;
                }
                return (
                  <TouchableOpacity
                    key={el.number}
                    style={[
                      styles.cell,
                      { width: COL_W, height: ROW_H, backgroundColor: CATEGORY_COLORS[el.category] + 'DD' },
                    ]}
                    onPress={() => setActive(el)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cellNum}>{el.number}</Text>
                    <Text style={styles.cellSym}>{el.symbol}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}

          {/* Group labels row at bottom of main grid */}
          <View style={[styles.gridRow, { height: 18, marginTop: 4 }]}>
            <View style={{ width: 16 }} />
            {Array.from({ length: 18 }, (_, i) => i + 1).map((g) => (
              <View key={`g-${g}`} style={{ width: COL_W, alignItems: 'center' }}>
                <Text style={styles.groupLbl}>{g}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Lanthanides row */}
        <View style={styles.lanthRow}>
          <View style={{ width: 16 }} />
          <View style={[styles.spacer, { width: COL_W * 2 + 4 }]}>
            <Text style={styles.lanthLbl}>57-71</Text>
          </View>
          {lanthanides.map((el) => (
            <TouchableOpacity
              key={el.number}
              style={[
                styles.cell,
                { width: COL_W, height: ROW_H, backgroundColor: CATEGORY_COLORS[el.category] + 'DD' },
              ]}
              onPress={() => setActive(el)}
              activeOpacity={0.7}
            >
              <Text style={styles.cellNum}>{el.number}</Text>
              <Text style={styles.cellSym}>{el.symbol}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Actinides row */}
        <View style={styles.lanthRow}>
          <View style={{ width: 16 }} />
          <View style={[styles.spacer, { width: COL_W * 2 + 4 }]}>
            <Text style={styles.lanthLbl}>89-103</Text>
          </View>
          {actinides.map((el) => (
            <TouchableOpacity
              key={el.number}
              style={[
                styles.cell,
                { width: COL_W, height: ROW_H, backgroundColor: CATEGORY_COLORS[el.category] + 'DD' },
              ]}
              onPress={() => setActive(el)}
              activeOpacity={0.7}
            >
              <Text style={styles.cellNum}>{el.number}</Text>
              <Text style={styles.cellSym}>{el.symbol}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Category legend */}
        <View style={styles.legend}>
          {CATS_ORDER.map((c) => (
            <View key={c} style={styles.legendItem}>
              <View style={[styles.legendSwatch, { backgroundColor: CATEGORY_COLORS[c] }]} />
              <Text style={styles.legendTxt}>{CATEGORY_LABELS[c]}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Detail sheet */}
      <Modal
        visible={!!active}
        transparent
        animationType="slide"
        onRequestClose={() => setActive(null)}
      >
        {active && <ElementSheet el={active} onClose={() => setActive(null)} />}
      </Modal>
    </View>
  );
}

function ElementSheet({ el, onClose }: { el: Element; onClose: () => void }) {
  return (
    <View style={sheetStyles.backdrop}>
      <View style={sheetStyles.sheet}>
        <View style={[sheetStyles.hero, { backgroundColor: CATEGORY_COLORS[el.category] }]}>
          <Text style={sheetStyles.heroNum}>{el.number}</Text>
          <Text style={sheetStyles.heroSym}>{el.symbol}</Text>
          <Text style={sheetStyles.heroMass}>{el.mass} u</Text>
        </View>

        <ScrollView style={{ padding: 20 }} contentContainerStyle={{ paddingBottom: 24 }}>
          <Text style={sheetStyles.name}>{el.name}</Text>
          <View style={[sheetStyles.catPill, { backgroundColor: CATEGORY_COLORS[el.category] + '33', borderColor: CATEGORY_COLORS[el.category] }]}>
            <Text style={[sheetStyles.catPillTxt, { color: CATEGORY_COLORS[el.category] }]}>
              {CATEGORY_LABELS[el.category]}
            </Text>
          </View>

          <Row label="Atomic Number"  value={String(el.number)} />
          <Row label="Atomic Mass"    value={`${el.mass} u`} />
          <Row label="Group"          value={el.group ? String(el.group) : '— (f-block)'} />
          <Row label="Period"         value={String(el.period)} />
          <Row label="Electron Config" value={el.electronConfig} mono />

          {el.discoveredBy && <Row label="Discovered By" value={el.discoveredBy} />}

          <View style={sheetStyles.summaryBox}>
            <Text style={sheetStyles.summaryLbl}>Quick Fact</Text>
            <Text style={sheetStyles.summaryTxt}>{el.summary}</Text>
          </View>

          <TouchableOpacity style={sheetStyles.closeBtn} onPress={onClose}>
            <Text style={sheetStyles.closeBtnTxt}>Close</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}

const Row = ({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) => (
  <View style={sheetStyles.row}>
    <Text style={sheetStyles.rowLbl}>{label}</Text>
    <Text style={[sheetStyles.rowVal, mono && { fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }) }]}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg_primary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12,
  },
  back: { color: COLORS.accent_light, fontWeight: '700', fontSize: 14 },
  heading: { color: COLORS.text_primary, fontWeight: '900', fontSize: 18 },

  gridWrap: { paddingHorizontal: 4 },
  gridRow: { flexDirection: 'row', alignItems: 'center' },
  periodLabel: { width: 16, alignItems: 'center' },
  periodLabelTxt: { color: COLORS.text_muted, fontSize: 10, fontWeight: '800' },

  cell: {
    margin: 1, borderRadius: 4, alignItems: 'center', justifyContent: 'center',
    borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.2)',
  },
  cellNum: { color: '#fff', fontSize: 7, fontWeight: '700', opacity: 0.85 },
  cellSym: { color: '#fff', fontSize: 12, fontWeight: '900' },

  groupLbl: { color: COLORS.text_muted, fontSize: 9, fontWeight: '800' },

  lanthRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  lanthLbl: { color: COLORS.text_muted, fontSize: 9, fontWeight: '700' },
  spacer: { alignItems: 'center', justifyContent: 'center' },

  legend: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 12, marginTop: 16, gap: 10,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendSwatch: { width: 14, height: 14, borderRadius: 3 },
  legendTxt: { color: COLORS.text_secondary, fontSize: 11 },
});

const sheetStyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: COLORS.bg_primary,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '85%', overflow: 'hidden',
  },
  hero: {
    alignItems: 'center', paddingTop: 28, paddingBottom: 22,
  },
  heroNum: { color: '#fff', fontSize: 14, fontWeight: '700', opacity: 0.85 },
  heroSym: { color: '#fff', fontSize: 56, fontWeight: '900', letterSpacing: 1, marginTop: 2 },
  heroMass: { color: '#fff', fontSize: 13, fontWeight: '700', marginTop: 4, opacity: 0.9 },

  name: { color: COLORS.text_primary, fontSize: 24, fontWeight: '900', marginBottom: 8 },
  catPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12,
    borderWidth: 1, marginBottom: 16,
  },
  catPillTxt: { fontSize: 12, fontWeight: '800' },

  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  rowLbl: { color: COLORS.text_secondary, fontSize: 13 },
  rowVal: { color: COLORS.text_primary, fontSize: 14, fontWeight: '700' },

  summaryBox: {
    marginTop: 16, backgroundColor: COLORS.bg_card, borderRadius: 12,
    padding: 14, borderWidth: 1, borderColor: COLORS.border,
  },
  summaryLbl: { color: COLORS.accent_light, fontSize: 10, fontWeight: '900', letterSpacing: 1, marginBottom: 6 },
  summaryTxt: { color: COLORS.text_primary, fontSize: 14, lineHeight: 20 },

  closeBtn: {
    marginTop: 18, backgroundColor: COLORS.accent, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
  },
  closeBtnTxt: { color: '#fff', fontWeight: '800', fontSize: 15 },
});