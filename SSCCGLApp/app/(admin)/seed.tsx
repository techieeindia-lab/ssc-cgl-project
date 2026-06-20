// app/(admin)/seed.tsx
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator, TextInput, Clipboard
} from 'react-native';
import { collection, writeBatch, doc, serverTimestamp, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../src/services/firebase';
import { COLORS } from '../../src/theme/colors';

const SAMPLE_JSON = `[
  {
    "text": "In a triangle ABC, if AB = AC and angle A = 50°, find angle B.",
    "options": ["50°", "60°", "65°", "70°"],
    "correct": 2,
    "section": "QA",
    "difficulty": "medium",
    "tags": ["geometry", "triangles"],
    "year": 2024,
    "explanation": "Since AB = AC, angle B = angle C. Sum = 180° -> B + C = 130° -> B = 65°",
    "questionImg": "https://raw.githubusercontent.com/techieeindia-lab/ssc-cgl-images/main/questions/abc.png",
    "optionImgs": ["", "", "", ""],
    "explanationImg": ""
  }
]`;

export default function SeedScreen() {
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<'quiz' | 'mock' | 'pyq'>('quiz');
  const [paperId, setPaperId] = useState('');
  const [jsonText, setJsonText] = useState('');

  const addLog = (msg: string) => setLog((prev) => [...prev, msg]);

  const handleCopySample = () => {
    Clipboard.setString(SAMPLE_JSON);
    Alert.alert('Copied!', 'Sample question JSON copied to clipboard.');
  };

  const handleValidate = () => {
    if (!jsonText.trim()) {
      Alert.alert('Empty Input', 'Please paste some JSON first.');
      return null;
    }
    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) {
        Alert.alert('Validation Error', 'JSON must be an array of question objects.');
        return null;
      }
      if (parsed.length === 0) {
        Alert.alert('Validation Error', 'The array is empty.');
        return null;
      }

      // Check fields of first item
      const item = parsed[0];
      const required = ['text', 'options', 'correct', 'section'];
      for (const req of required) {
        if (item[req] === undefined) {
          Alert.alert('Validation Error', `Question is missing required field: "${req}"`);
          return null;
        }
      }

      Alert.alert('Success', `JSON is valid! Found ${parsed.length} questions.`);
      return parsed;
    } catch (e: any) {
      Alert.alert('Invalid JSON', `JSON Parse Error: ${e.message}`);
      return null;
    }
  };

  const handleUpload = async () => {
    const questions = handleValidate();
    if (!questions) return;

    if ((selectedType === 'mock' || selectedType === 'pyq') && !paperId.trim()) {
      Alert.alert('Error', 'Please enter a Paper ID (e.g. pyq_2024_d1_s1 or mock_1)');
      return;
    }

    Alert.alert(
      '⚠️ Confirm Upload',
      `Upload ${questions.length} questions as "${selectedType}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Upload Now', onPress: () => runUpload(questions) },
      ]
    );
  };

  const runUpload = async (questions: any[]) => {
    setLoading(true);
    setLog([]);
    addLog(`⏳ Initializing upload of ${questions.length} questions...`);

    try {
      const BATCH_SIZE = 400;
      let uploaded = 0;

      // If mock or pyq, verify and ensure parent document exists (simple write metadata)
      if (selectedType === 'mock') {
        const parentRef = doc(db, 'mock_tests', paperId.trim());
        const parentSnap = await getDoc(parentRef);
        if (!parentSnap.exists()) {
          addLog(`📝 Creating parent mock test metadata document for "${paperId.trim()}"...`);
          await setDoc(parentRef, {
            id: paperId.trim(),
            title: `Mock Test - ${paperId.trim().toUpperCase()}`,
            duration: 3600,
            totalQuestions: questions.length,
            isActive: true,
            createdAt: serverTimestamp(),
          });
        }
      } else if (selectedType === 'pyq') {
        const parentRef = doc(db, 'pyq_papers', paperId.trim());
        const parentSnap = await getDoc(parentRef);
        if (!parentSnap.exists()) {
          addLog(`📝 Creating parent PYQ paper metadata document for "${paperId.trim()}"...`);
          // Extract year/shift if format is e.g. pyq_2024_s1
          const parts = paperId.trim().split('_');
          const year = parseInt(parts[1] || '2024', 10);
          const shift = parseInt((parts[2] || 's1').replace('s', ''), 10);
          await setDoc(parentRef, {
            id: paperId.trim(),
            title: `CGL ${year} (Shift ${shift})`,
            year: isNaN(year) ? 2024 : year,
            shift: isNaN(shift) ? 1 : shift,
            date: new Date().toISOString().split('T')[0],
            totalQuestions: questions.length,
            createdAt: serverTimestamp(),
          });
        }
      }

      for (let i = 0; i < questions.length; i += BATCH_SIZE) {
        const chunk = questions.slice(i, i + BATCH_SIZE);
        const batch = writeBatch(db);

        chunk.forEach((q, idx) => {
          let ref;
          if (selectedType === 'quiz') {
            ref = doc(collection(db, 'quiz_questions'));
          } else if (selectedType === 'mock') {
            ref = doc(collection(db, 'mock_tests', paperId.trim(), 'questions'));
          } else {
            ref = doc(collection(db, 'pyq_papers', paperId.trim(), 'questions'));
          }

          const qData: any = {
            text: q.text || '',
            options: Array.isArray(q.options) ? q.options : [],
            correct: typeof q.correct === 'number' ? q.correct : 0,
            section: q.section || 'QA',
            difficulty: q.difficulty || 'medium',
            tags: Array.isArray(q.tags) ? q.tags : [],
            year: typeof q.year === 'number' ? q.year : null,
            explanation: q.explanation || '',
            questionImg: q.questionImg || null,
            optionImgs: Array.isArray(q.optionImgs) ? q.optionImgs : null,
            explanationImg: q.explanationImg || null,
            createdAt: serverTimestamp(),
          };

          if (selectedType === 'mock' || selectedType === 'pyq') {
            qData.qNumber = typeof q.qNumber === 'number' ? q.qNumber : (i + idx + 1);
          }

          batch.set(ref, qData);
        });

        await batch.commit();
        uploaded += chunk.length;
        addLog(`✅ Uploaded ${uploaded}/${questions.length}`);
      }

      addLog(`\n🎉 Upload completed successfully!`);
      Alert.alert('Complete', 'All questions uploaded successfully!');
    } catch (err: any) {
      addLog(`❌ Error: ${err.message}`);
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
      <Text style={styles.title}>🛠️ Admin Panel</Text>
      <Text style={styles.subtitle}>Upload and seed questions to Firestore</Text>

      {/* QUESTION TYPE */}
      <Text style={styles.label}>1. Select Question Category</Text>
      <View style={styles.typeRow}>
        {(['quiz', 'mock', 'pyq'] as const).map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.typeBtn, selectedType === type && styles.typeBtnActive]}
            onPress={() => setSelectedType(type)}
          >
            <Text style={[styles.typeBtnText, selectedType === type && styles.typeBtnTextActive]}>
              {type.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* PAPER ID */}
      {(selectedType === 'mock' || selectedType === 'pyq') && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>2. Enter Paper ID (Required for Mock/PYQ)</Text>
          <TextInput
            style={styles.textInput}
            value={paperId}
            onChangeText={setPaperId}
            placeholder={selectedType === 'pyq' ? "e.g., pyq_2024_d1_s1" : "e.g., mock_1"}
            placeholderTextColor={COLORS.text_muted}
            autoCapitalize="none"
          />
        </View>
      )}

      {/* PASTE JSON */}
      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>3. Paste Questions JSON</Text>
          <TouchableOpacity onPress={handleCopySample}>
            <Text style={styles.copyLink}>Copy Sample Schema</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.jsonTextArea}
          multiline
          numberOfLines={12}
          value={jsonText}
          onChangeText={setJsonText}
          placeholder="Paste JSON array here..."
          placeholderTextColor={COLORS.text_muted}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* BUTTONS */}
      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.secondaryBtn} onPress={handleValidate}>
          <Text style={styles.secondaryBtnText}>🔍 Validate JSON</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryBtn} onPress={handleUpload} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryBtnText}>🚀 Upload Questions</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* SCHEMAS GUIDE */}
      <View style={styles.guideCard}>
        <Text style={styles.guideTitle}>💡 Image Seeding Guide</Text>
        <Text style={styles.guideText}>
          To add images for Math/Reasoning questions, upload your images to Firebase Storage or a public image hosting site, then use these properties in your JSON:
        </Text>
        <Text style={styles.bulletItem}>• <Text style={styles.boldText}>questionImg</Text>: Image URL for the question figure.</Text>
        <Text style={styles.bulletItem}>• <Text style={styles.boldText}>optionImgs</Text>: An array of 4 URLs (or empty strings) corresponding to Options A, B, C, D.</Text>
        <Text style={styles.bulletItem}>• <Text style={styles.boldText}>explanationImg</Text>: Image URL showing the formulas/steps in the explanation.</Text>
      </View>

      {/* LOG BOX */}
      {log.length > 0 && (
        <View style={styles.logContainer}>
          <Text style={styles.logTitle}>Log Output</Text>
          <View style={styles.logBox}>
            {log.map((line, i) => (
              <Text key={i} style={styles.logLine}>{line}</Text>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg_primary, padding: 20, paddingTop: 60 },
  title: { color: COLORS.text_primary, fontSize: 26, fontWeight: 'bold', marginBottom: 6 },
  subtitle: { color: COLORS.text_secondary, fontSize: 13, marginBottom: 24 },
  label: { color: COLORS.text_primary, fontSize: 14, fontWeight: '700', marginBottom: 8 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  copyLink: { color: COLORS.accent_light, fontSize: 12, fontWeight: '600', textDecorationLine: 'underline' },
  typeRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  typeBtn: {
    flex: 1, backgroundColor: COLORS.bg_card, borderWidth: 1, borderColor: COLORS.border,
    paddingVertical: 12, borderRadius: 10, alignItems: 'center',
  },
  typeBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  typeBtnText: { color: COLORS.text_secondary, fontWeight: '700', fontSize: 13 },
  typeBtnTextActive: { color: '#fff' },
  inputGroup: { marginBottom: 20 },
  textInput: {
    backgroundColor: COLORS.bg_card, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 10, padding: 14, color: COLORS.text_primary, fontSize: 14,
  },
  jsonTextArea: {
    backgroundColor: COLORS.bg_card, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 10, padding: 14, color: COLORS.text_primary, fontSize: 12,
    fontFamily: 'monospace', minHeight: 200, textAlignVertical: 'top',
  },
  btnRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  primaryBtn: {
    flex: 1, backgroundColor: COLORS.accent, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', justifyContent: 'center',
  },
  primaryBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  secondaryBtn: {
    flex: 1, backgroundColor: COLORS.bg_card, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 12, paddingVertical: 14, alignItems: 'center', justifyContent: 'center',
  },
  secondaryBtnText: { color: COLORS.text_primary, fontSize: 14, fontWeight: 'bold' },
  guideCard: {
    backgroundColor: COLORS.bg_card, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 24,
  },
  guideTitle: { color: COLORS.accent_light, fontSize: 14, fontWeight: '700', marginBottom: 8 },
  guideText: { color: COLORS.text_secondary, fontSize: 12, lineHeight: 18, marginBottom: 8 },
  bulletItem: { color: COLORS.text_secondary, fontSize: 12, marginBottom: 4 },
  boldText: { fontWeight: '700', color: COLORS.text_primary },
  logContainer: { marginTop: 10 },
  logTitle: { color: COLORS.text_primary, fontSize: 14, fontWeight: '700', marginBottom: 8 },
  logBox: {
    backgroundColor: '#00000044', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: COLORS.border,
  },
  logLine: { color: COLORS.accent_light, fontSize: 12, fontFamily: 'monospace', marginBottom: 2 },
});