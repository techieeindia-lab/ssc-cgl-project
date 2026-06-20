import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { COLORS } from '../../src/theme/colors';
import { useAuth } from '../../src/context/AuthContext';
import { getUserStats, getLevelFromXP, UserStats } from '../../src/services/coinService';
import { logout } from '../../src/services/authService';

const MENU_ITEMS = [
  { icon: '📋', label: 'My Test History',   sub: 'View all past tests',           route: '/profile/history' },
  { icon: '🏆', label: 'Leaderboard',       sub: 'See how you rank',              route: '/profile/leaderboard' },
  { icon: '⭐', label: 'Upgrade to Premium',sub: 'Unlock all tests & features',   accent: true, route: '/profile/premium' },
  { icon: '🔔', label: 'Notifications',     sub: 'Manage alerts',                 route: '/profile/notifications' },
  { icon: '🌐', label: 'Language',          sub: 'English',                       route: '/profile/language' },
  { icon: '📞', label: 'Support',           sub: 'Get help',                      route: '/profile/support' },
  { icon: '⚙️', label: 'Settings',          sub: 'App preferences',               route: '/profile/settings' },
  { icon: '🛠️', label: 'Admin Panel',       sub: 'Upload and seed questions',     route: '/(admin)/seed' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        getUserStats(user.uid).then(setStats).catch(console.error);
      }
    }, [user]),
  );

  const levelInfo = getLevelFromXP(stats?.xp ?? 0);

  const handleLogout = () => {
    Alert.alert('Sign out?', 'You can sign back in anytime.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => logout().catch(console.error) },
    ]);
  };

  // ── Signed-out state ──
  if (!user) {
    return (
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Profile</Text>
          </View>
          <View style={styles.signedOutCard}>
            <Text style={styles.signedOutEmoji}>👤</Text>
            <Text style={styles.signedOutTitle}>You're not signed in</Text>
            <Text style={styles.signedOutSub}>
              Sign in to save your progress, earn coins, and compete on the leaderboard.
            </Text>
            <View style={styles.signedOutBtns}>
              <TouchableOpacity
                style={[styles.authBtn, styles.authPrimary]}
                onPress={() => router.push('/(auth)/login')}
              >
                <Text style={styles.authBtnText}>Sign In</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.authBtn, styles.authSecondary]}
                onPress={() => router.push('/(auth)/register')}
              >
                <Text style={[styles.authBtnText, { color: COLORS.accent_light }]}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.version}>SSC CGL App v1.0.0</Text>
          <View style={{ height: 32 }} />
        </ScrollView>
      </View>
    );
  }

  // ── Signed-in state ──
  const displayName = user.displayName || 'Student';
  const initial = (displayName[0] || 'S').toUpperCase();
  const isPhoto = !!user.photoURL;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logoutLink}>Sign out</Text>
          </TouchableOpacity>
        </View>

        {/* Avatar + Name */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            {isPhoto ? (
              <Image source={{ uri: user.photoURL! }} style={styles.avatarImg} />
            ) : (
              <Text style={styles.avatarText}>{initial}</Text>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{displayName}</Text>
            <Text style={styles.userEmail} numberOfLines={1}>{user.email}</Text>
            <View style={styles.levelRow}>
              <Text style={styles.levelChip}>Lv.{levelInfo.level} · {levelInfo.title}</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { n: stats?.totalTests ?? 0, l: 'Tests' },
            { n: stats?.streak ?? 0,     l: 'Streak' },
            { n: `${stats?.bestScore ?? 0}%`, l: 'Best' },
            { n: stats?.xp ?? 0,         l: 'XP' },
          ].map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={styles.statNum}>{s.n}</Text>
              <Text style={styles.statLbl}>{s.l}</Text>
            </View>
          ))}
        </View>

        {/* Menu */}
        <View style={styles.menu}>
          {MENU_ITEMS.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.menuRow, item.accent && styles.menuRowAccent]}
              activeOpacity={0.75}
              onPress={() => router.push(item.route as any)}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <View style={styles.menuInfo}>
                <Text style={[styles.menuLabel, item.accent && styles.menuLabelAccent]}>
                  {item.label}
                </Text>
                <Text style={styles.menuSub}>{item.sub}</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.version}>SSC CGL App v1.0.0</Text>
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg_primary },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
  },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.text_primary },
  logoutLink: { fontSize: 13, fontWeight: '700', color: COLORS.q_not_answered },

  // Signed-out card
  signedOutCard: {
    marginHorizontal: 20, marginBottom: 24,
    backgroundColor: COLORS.bg_card, borderRadius: 16, padding: 24,
    borderWidth: 1, borderColor: COLORS.border, alignItems: 'center',
  },
  signedOutEmoji: { fontSize: 56, marginBottom: 12 },
  signedOutTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text_primary, marginBottom: 6 },
  signedOutSub: {
    fontSize: 13, color: COLORS.text_secondary, textAlign: 'center',
    lineHeight: 19, marginBottom: 20,
  },
  signedOutBtns: { flexDirection: 'row', gap: 10, width: '100%' },
  authBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  authPrimary: { backgroundColor: COLORS.accent },
  authSecondary: { backgroundColor: COLORS.bg_secondary, borderWidth: 1, borderColor: COLORS.border },
  authBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },

  // Signed-in profile card
  profileCard: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 20, marginBottom: 20,
    backgroundColor: COLORS.bg_card, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: COLORS.border, gap: 14,
  },
  avatar: {
    width: 56, height: 56, borderRadius: 18,
    backgroundColor: COLORS.accent_dark,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  avatarImg: { width: 56, height: 56 },
  avatarText: { fontSize: 24, fontWeight: '800', color: COLORS.accent_light },
  userName: { fontSize: 16, fontWeight: '700', color: COLORS.text_primary },
  userEmail: { fontSize: 12, color: COLORS.text_secondary, marginTop: 2 },
  levelRow: { flexDirection: 'row', marginTop: 6 },
  levelChip: {
    fontSize: 11, fontWeight: '700', color: COLORS.accent_light,
    backgroundColor: COLORS.accent + '22',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, overflow: 'hidden',
  },

  statsRow: {
    flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 24,
  },
  statCard: {
    flex: 1, backgroundColor: COLORS.bg_card, borderRadius: 12, padding: 12,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  statNum: { fontSize: 16, fontWeight: '800', color: COLORS.accent_light },
  statLbl: { fontSize: 9, color: COLORS.text_secondary, marginTop: 3, textAlign: 'center' },

  menu: {
    marginHorizontal: 20, backgroundColor: COLORS.bg_card, borderRadius: 16,
    borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 14,
  },
  menuRowAccent: { backgroundColor: COLORS.accent + '15' },
  menuIcon: { fontSize: 20 },
  menuInfo: { flex: 1 },
  menuLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text_primary },
  menuLabelAccent: { color: COLORS.accent_light },
  menuSub: { fontSize: 11, color: COLORS.text_secondary, marginTop: 2 },
  menuArrow: { fontSize: 20, color: COLORS.text_muted },

  version: { textAlign: 'center', fontSize: 11, color: COLORS.text_muted, marginTop: 24 },
});