// src/components/study/MindMapView.tsx
// Render a MindMapNode tree as nested cards. The center node is highlighted;
// children fan out below it in collapsible cards.

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import { getMindmap, MindMapNode } from '../../data/studyContent';

export default function MindMapView({ section, tag }: { section: string; tag: string }) {
  const tree: MindMapNode | null = getMindmap(section, tag);

  if (!tree) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyEmoji}>🧠</Text>
        <Text style={styles.emptyTxt}>No mind map for this topic yet.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      {/* Center node */}
      <View style={styles.center}>
        <Text style={styles.centerLbl}>{tree.label}</Text>
      </View>

      {/* Children */}
      {tree.children?.map((child, i) => (
        <Branch key={i} node={child} depth={1} />
      ))}

      <Text style={styles.legend}>Tap any node to collapse / expand its branches.</Text>
    </ScrollView>
  );
}

function Branch({ node, depth }: { node: MindMapNode; depth: number }) {
  const [open, setOpen] = useState(true);
  const hasChildren = !!node.children?.length;

  const indent = depth * 14;
  const cardStyle = [
    styles.branch,
    { marginLeft: indent, borderLeftColor: depth === 1 ? '#9B59B6' : '#5DADE2' },
  ];

  return (
    <>
      <TouchableOpacity
        style={cardStyle}
        onPress={() => hasChildren && setOpen(!open)}
        activeOpacity={hasChildren ? 0.85 : 1}
      >
        <Text style={styles.branchLbl}>{node.label}</Text>
        {hasChildren && (
          <Text style={styles.branchChev}>{open ? '▾' : '▸'}</Text>
        )}
      </TouchableOpacity>
      {open && node.children?.map((child, i) => (
        <Branch key={i} node={child} depth={depth + 1} />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg_primary },
  empty: { alignItems: 'center', padding: 48 },
  emptyEmoji: { fontSize: 48, marginBottom: 10 },
  emptyTxt: { color: COLORS.text_secondary, fontSize: 14 },

  center: {
    alignSelf: 'center',
    backgroundColor: '#9B59B6',
    borderRadius: 18, paddingHorizontal: 24, paddingVertical: 14,
    marginBottom: 18,
    shadowColor: '#9B59B6', shadowOpacity: 0.5,
    shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  centerLbl: { color: '#fff', fontWeight: '900', fontSize: 17, letterSpacing: 0.5 },

  branch: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.bg_card, borderRadius: 10,
    padding: 12, marginBottom: 8,
    borderLeftWidth: 3,
  },
  branchLbl: { color: COLORS.text_primary, fontWeight: '700', fontSize: 14, flex: 1 },
  branchChev: { color: COLORS.text_muted, fontSize: 14, marginLeft: 8 },

  legend: {
    textAlign: 'center', color: COLORS.text_muted,
    fontSize: 11, fontStyle: 'italic', marginTop: 14,
  },
});