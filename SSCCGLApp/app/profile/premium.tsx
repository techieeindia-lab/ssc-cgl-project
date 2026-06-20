// app/profile/premium.tsx
// Premium tier screen. v1: shows the user's current tier (Free / Premium)
// and a "Coming soon" upgrade button. To flip a user to premium in dev,
// update `users/{uid}.isPremium = true` in the Firestore console.

import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
  ActivityIndicator, StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../../src/theme/colors';
import { useAuth } from '../../src/context/AuthContext';
import { checkPremiumGate } from '../../src/services/studyService';

const BENEFITS = [
  { emoji: '📖', title: 'Full e-book chapters',  sub: 'Unlock every chapter of every topic.' },
  { emoji: '📰', title: 'Weekly current affairs', sub: 'Deep-dive digests as they are published.' },
  { emoji: '🎯', title: 'Topic mastery deep cuts', sub: 'Per-topic accuracy and revision history.' },
  { emoji: '📊', title: 'Detailed analytics',     sub: 'Trends, weak areas, and study plans.' },
];

export default function PremiumScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    checkPremiumGate(user?.uid).then((p) => { if (!cancelled) setIsPremium(p); });
    return () => { cancelled = true; };
  }, [user?.uid]);

  if (isPremium === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.accent} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg_primary} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.heading}>⭐ Premium</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View style={[styles.tierCard, isPremium && styles.tierCardActive]}>
          <Text style={styles.tierEmoji}>{isPremium ? '👑' : '✨'}</Text>
          <Text style={styles.tierName}>{isPremium ? 'SSC CGL Premium' : 'Free'}</Text>
          <Text style={styles.tierSub}>
            {isPremium
              ? 'Thanks for being a premium member!'
              : 'Upgrade to unlock all premium study tools.'}
          </Text>
        </View>

        <Text style={styles.sectionHeader}>What you get</Text>
        {BENEFITS.map((b, i) => (
          <View key={i} style={styles.benefitRow}>
            <Text style={styles.benefitEmoji}>{b.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.benefitTitle}>{b.title}</Text>
              <Text style={styles.benefitSub}>{b.sub}</Text>
            </View>
            {!isPremium && <Text style={styles.benefitLock}>🔒</Text>}
          </View>
        ))}

        {!isPremium ? (
          <TouchableOpacity
            style={styles.upgradeBtn}
            onPress={() =>
              Alert.alert(
                'Coming soon',
                'In-app purchases will arrive in a future release. For now, contact support to upgrade.',
              )
            }
          >
            <Text style={styles.upgradeBtnTxt}>Upgrade Now</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.activeNote}>
            <Text style={styles.activeNoteTxt}>
              You're all set. Premium features are unlocked on this account.
            </Text>
          </View>
        )}

        {!user && (
          <Text style={styles.signinNote}>
            Sign in to view your personalized premium status.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg_primary },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg_primary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12,
  },
  back: { color: COLORS.accent_light, fontWeight: '700', fontSize: 14, width: 50 },
  heading: { color: COLORS.text_primary, fontWeight: '900', fontSize: 18 },

  tierCard: {
    backgroundColor: COLORS.bg_card, borderRadius: 16, padding: 24,
    borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', marginBottom: 24,
  },
  tierCardActive: { borderColor: '#F39C12', backgroundColor: '#F39C1215' },
  tierEmoji: { fontSize: 48, marginBottom: 8 },
  tierName: { color: COLORS.text_primary, fontWeight: '900', fontSize: 22, marginBottom: 6 },
  tierSub: { color: COLORS.text_secondary, fontSize: 13, textAlign: 'center' },

  sectionHeader: { color: COLORS.text_muted, fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 10 },
  benefitRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.bg_card, borderRadius: 12, padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: COLORS.border,
  },
  benefitEmoji: { fontSize: 22 },
  benefitTitle: { color: COLORS.text_primary, fontWeight: '800', fontSize: 14 },
  benefitSub: { color: COLORS.text_secondary, fontSize: 11, marginTop: 2 },
  benefitLock: { fontSize: 16 },

  upgradeBtn: {
    marginTop: 24, backgroundColor: '#F39C12', paddingVertical: 16,
    borderRadius: 14, alignItems: 'center',
  },
  upgradeBtnTxt: { color: '#000', fontWeight: '900', fontSize: 15 },

  activeNote: {
    marginTop: 24, backgroundColor: '#27AE6015', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#27AE60',
  },
  activeNoteTxt: { color: '#27AE60', fontSize: 13, textAlign: 'center', fontWeight: '700' },

  signinNote: { color: COLORS.text_muted, fontSize: 11, textAlign: 'center', marginTop: 16 },
});