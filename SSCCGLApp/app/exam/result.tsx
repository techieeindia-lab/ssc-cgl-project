// app/exam/result.tsx
import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

const SC = {
  headerBg:  '#1B3A6B',
  bg:        '#F0F0F0',
  white:     '#FFFFFF',
  border:    '#BBBBBB',
  text:      '#000000',
  subText:   '#444444',
  answered:  '#228B22',
  notAnswered:'#FF4500',
  marked:    '#FF8C00',
  btnBlue:   '#1565C0',
  btnGreen:  '#006400',
};

const SECTION_NAMES: Record<string, string> = {
  QA:  'Quantitative Aptitude',
  GIR: 'General Intelligence & Reasoning',
  GA:  'General Awareness',
  EN:  'English Language',
};

const PART_LABELS: Record<string, string> = {
  QA: 'PART-A', GIR: 'PART-B', GA: 'PART-C', EN: 'PART-D',
};

export default function ResultScreen() {
  const { result } = useLocalSearchParams<{ result: string }>();
  const router = useRouter();
  const { t } = useTranslation();

  let data: any = null;
  try {
    data = result ? JSON.parse(result) : null;
  } catch {
    data = null;
  }

  if (!data) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTxt}>{t('result.notFound')}</Text>
        <TouchableOpacity style={styles.homeBtn} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.homeBtnTxt}>{t('common.goHome')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const percentage = ((data.score / data.maxScore) * 100).toFixed(1);
  const grade =
    Number(percentage) >= 80 ? { label: t('result.excellent'), color: '#006400' } :
    Number(percentage) >= 60 ? { label: t('result.good'),      color: '#1565C0' } :
    Number(percentage) >= 40 ? { label: t('result.average'),   color: '#CC6600' } :
                               { label: t('result.needPractice'), color: '#CC0000' };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={SC.headerBg} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('result.testResult')}</Text>
        <Text style={styles.headerSub}>{t('result.mockTest')}</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>

        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>{t('result.yourScore')}</Text>
          <Text style={styles.scoreVal}>{data.score.toFixed(1)}</Text>
          <Text style={styles.scoreMax}>{t('result.outOf', { max: data.maxScore })}</Text>
          <View style={[styles.gradeBadge, { backgroundColor: grade.color }]}>
            <Text style={styles.gradeText}>{grade.label}</Text>
          </View>
          <Text style={styles.percentTxt}>{percentage}%</Text>
        </View>

        <View style={styles.summaryRow}>
          {[
            { label: t('result.correct'),   val: data.correct,  color: SC.answered },
            { label: t('result.wrong'),     val: data.wrong,    color: SC.notAnswered },
            { label: t('result.skipped'),   val: data.skipped,  color: '#888' },
            { label: t('result.total'),     val: data.total,    color: SC.btnBlue },
          ].map((item) => (
            <View key={item.label} style={styles.summaryCard}>
              <Text style={[styles.summaryVal, { color: item.color }]}>{item.val}</Text>
              <Text style={styles.summaryLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>{t('result.sectionBreakdown')}</Text>
        {Object.entries(data.sectionStats || {}).map(([sec, stats]: any) => (
          <View key={sec} style={styles.secCard}>
            <View style={styles.secCardHeader}>
              <Text style={styles.secCardPart}>{PART_LABELS[sec] || sec}</Text>
              <Text style={styles.secCardName}>{SECTION_NAMES[sec] || sec}</Text>
              <Text style={[styles.secCardScore, { color: stats.score >= 0 ? SC.answered : SC.notAnswered }]}>
                {stats.score?.toFixed(1)} / 50
              </Text>
            </View>
            <View style={styles.secCardRow}>
              <View style={styles.secStat}>
                <Text style={[styles.secStatVal, { color: SC.answered }]}>{stats.correct}</Text>
                <Text style={styles.secStatLbl}>{t('result.correct')}</Text>
              </View>
              <View style={styles.secStat}>
                <Text style={[styles.secStatVal, { color: SC.notAnswered }]}>{stats.wrong}</Text>
                <Text style={styles.secStatLbl}>{t('result.wrong')}</Text>
              </View>
              <View style={styles.secStat}>
                <Text style={[styles.secStatVal, { color: '#888' }]}>{stats.skipped}</Text>
                <Text style={styles.secStatLbl}>{t('result.skipped')}</Text>
              </View>
              <View style={styles.secStat}>
                <Text style={[styles.secStatVal, { color: SC.btnBlue }]}>{stats.total}</Text>
                <Text style={styles.secStatLbl}>{t('result.total')}</Text>
              </View>
            </View>
            <View style={styles.progBar}>
              <View style={[styles.progFill, {
                width: `${Math.max(0, (stats.score / 50) * 100)}%`,
                backgroundColor: stats.score >= 25 ? SC.answered : SC.notAnswered,
              }]} />
            </View>
          </View>
        ))}

        {data.reward && (
          <View style={styles.rewardCard}>
            <Text style={styles.rewardTitle}>{t('result.rewardsEarned')}</Text>
            <View style={styles.rewardRow}>
              <View style={styles.rewardItem}>
                <Text style={styles.rewardValue}>🪙 +{data.reward.coinsEarned}</Text>
                <Text style={styles.rewardLbl}>{t('result.coins')}</Text>
              </View>
              <View style={styles.rewardItem}>
                <Text style={styles.rewardValue}>⭐ +{data.reward.xpEarned}</Text>
                <Text style={styles.rewardLbl}>{t('result.xp')}</Text>
              </View>
            </View>
            {data.reward.isNewBest && (
              <View style={styles.newBestBadge}>
                <Text style={styles.newBestTxt}>{t('result.newPersonalBest')}</Text>
              </View>
            )}
            {data.reward.newLevel && (
              <View style={styles.levelUpBadge}>
                <Text style={styles.levelUpTxt}>{t('result.levelUp', { level: data.reward.newLevel })}</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.btnRow}>
          <TouchableOpacity
            style={styles.retakeBtn}
            onPress={() => router.replace(`/exam/${data.testType || 'full'}`)}
          >
            <Text style={styles.retakeBtnTxt}>{t('result.retakeTest')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.homeBtn2}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.homeBtnTxt2}>{t('result.goHome')}</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:           { flex: 1, backgroundColor: SC.bg },
  centered:       { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: SC.bg },
  errorTxt:       { fontSize: 16, color: '#CC0000', marginBottom: 16 },
  header:         { backgroundColor: SC.headerBg, paddingTop: 52, paddingBottom: 14, paddingHorizontal: 16 },
  headerTitle:    { color: '#fff', fontSize: 18, fontWeight: '800' },
  headerSub:      { color: '#AAC4FF', fontSize: 12, marginTop: 2 },
  scoreCard:      { backgroundColor: SC.white, margin: 16, borderRadius: 12, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: SC.border, elevation: 2 },
  scoreLabel:     { fontSize: 14, color: SC.subText, marginBottom: 4 },
  scoreVal:       { fontSize: 56, fontWeight: '900', color: SC.text },
  scoreMax:       { fontSize: 14, color: SC.subText, marginBottom: 12 },
  gradeBadge:     { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, marginBottom: 8 },
  gradeText:      { color: '#fff', fontWeight: '800', fontSize: 15 },
  percentTxt:     { fontSize: 16, color: SC.subText, fontWeight: '700' },
  summaryRow:     { flexDirection: 'row', marginHorizontal: 16, gap: 8, marginBottom: 20 },
  summaryCard:    { flex: 1, backgroundColor: SC.white, borderRadius: 8, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: SC.border },
  summaryVal:     { fontSize: 22, fontWeight: '800' },
  summaryLabel:   { fontSize: 10, color: SC.subText, marginTop: 4 },
  sectionTitle:   { fontSize: 15, fontWeight: '800', color: '#002060', marginHorizontal: 16, marginBottom: 10 },
  secCard:        { backgroundColor: SC.white, marginHorizontal: 16, marginBottom: 10, borderRadius: 8, borderWidth: 1, borderColor: SC.border, overflow: 'hidden' },
  secCardHeader:  { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EEF2FF', padding: 10, gap: 8 },
  secCardPart:    { fontWeight: '800', fontSize: 12, color: '#002060', minWidth: 54 },
  secCardName:    { flex: 1, fontSize: 11, color: SC.subText },
  secCardScore:   { fontWeight: '800', fontSize: 14 },
  secCardRow:     { flexDirection: 'row', padding: 12 },
  secStat:        { flex: 1, alignItems: 'center' },
  secStatVal:     { fontSize: 18, fontWeight: '800' },
  secStatLbl:     { fontSize: 10, color: SC.subText, marginTop: 2 },
  progBar:        { height: 6, backgroundColor: '#EEE', marginHorizontal: 12, marginBottom: 12, borderRadius: 3, overflow: 'hidden' },
  progFill:       { height: '100%', borderRadius: 3 },
  btnRow:         { flexDirection: 'row', marginHorizontal: 16, marginTop: 8, gap: 10 },
  retakeBtn:      { flex: 1, backgroundColor: SC.btnBlue, borderRadius: 8, paddingVertical: 14, alignItems: 'center' },
  retakeBtnTxt:   { color: '#fff', fontWeight: '800', fontSize: 14 },
  homeBtn:        { backgroundColor: SC.btnGreen, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, marginTop: 16 },
  homeBtn2:       { flex: 1, backgroundColor: SC.btnGreen, borderRadius: 8, paddingVertical: 14, alignItems: 'center' },
  homeBtnTxt:     { color: '#fff', fontWeight: '800', fontSize: 14 },
  homeBtnTxt2:    { color: '#fff', fontWeight: '800', fontSize: 14 },

  // Reward card
  rewardCard: {
    marginHorizontal: 16, marginBottom: 16,
    backgroundColor: '#FFF7E0', borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: '#F0C36D',
  },
  rewardTitle: { fontSize: 14, fontWeight: '800', color: '#8A5A00', marginBottom: 12 },
  rewardRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 },
  rewardItem: { alignItems: 'center' },
  rewardValue: { fontSize: 18, fontWeight: '900', color: '#5A3B00' },
  rewardLbl: { fontSize: 11, color: '#8A5A00', marginTop: 2 },
  newBestBadge: {
    backgroundColor: '#006400', paddingVertical: 8, paddingHorizontal: 12,
    borderRadius: 8, marginTop: 8, alignItems: 'center',
  },
  newBestTxt: { color: '#fff', fontWeight: '800', fontSize: 13 },
  levelUpBadge: {
    backgroundColor: '#1565C0', paddingVertical: 8, paddingHorizontal: 12,
    borderRadius: 8, marginTop: 8, alignItems: 'center',
  },
  levelUpTxt: { color: '#fff', fontWeight: '800', fontSize: 13 },
});