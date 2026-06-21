import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, Modal,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../src/theme/colors';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { getUserStats, getLevelFromXP, UserStats } from '../../src/services/coinService';
import { logout } from '../../src/services/authService';
import { changeLanguage } from '../../src/i18n';

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme, isDark } = useTheme();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [langModal, setLangModal] = useState(false);

  const currentLang = i18n.language?.startsWith('hi') ? 'hi' : 'en';

  useFocusEffect(
    useCallback(() => {
      if (user) {
        getUserStats(user.uid).then(setStats).catch(console.error);
      }
    }, [user]),
  );

  const levelInfo = getLevelFromXP(stats?.xp ?? 0);

  const handleLogout = () => {
    Alert.alert(t('profile.signOutTitle'), t('profile.signOutMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('profile.signOut'), style: 'destructive', onPress: () => logout().catch(console.error) },
    ]);
  };

  const switchLang = async (lang: 'en' | 'hi') => {
    await changeLanguage(lang);
    setLangModal(false);
  };

  const MENU_ITEMS = [
    { icon: '📋', label: t('profile.menuItems.testHistory'),   sub: t('profile.menuItems.testHistorySub'),           route: '/profile/history' },
    { icon: '🏆', label: t('profile.menuItems.leaderboard'),   sub: t('profile.menuItems.leaderboardSub'),           route: '/profile/leaderboard' },
    { icon: '⭐', label: t('profile.menuItems.premium'),        sub: t('profile.menuItems.premiumSub'),               accent: true, route: '/profile/premium' },
    { icon: '🔔', label: t('profile.menuItems.notifications'),  sub: t('profile.menuItems.notificationsSub'),         route: '/profile/notifications' },
    { icon: '🌐', label: t('profile.menuItems.language'),       sub: currentLang === 'hi' ? t('profile.menuItems.languageSubHi') : t('profile.menuItems.languageSub'), onPress: () => setLangModal(true) },
    { icon: '📞', label: t('profile.menuItems.support'),        sub: t('profile.menuItems.supportSub'),               route: '/profile/support' },
    { icon: '⚙️', label: t('profile.menuItems.settings'),       sub: t('profile.menuItems.settingsSub'),              route: '/profile/settings' },
    { icon: '🛠️', label: t('profile.menuItems.admin'),          sub: t('profile.menuItems.adminSub'),                 route: '/(admin)/seed' },
  ];

  // ── Signed-out state ──
  if (!user) {
    return (
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('profile.title')}</Text>
            <View style={styles.headerRowRight}>
              <TouchableOpacity onPress={() => switchLang(currentLang === 'en' ? 'hi' : 'en')} style={styles.langToggle} activeOpacity={0.75}>
                <Text style={styles.langToggleText}>{currentLang === 'hi' ? 'EN' : 'HI'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle} activeOpacity={0.75}>
                <Text style={styles.themeToggleEmoji}>{isDark ? '☀️' : '🌙'}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.signedOutCard}>
            <Text style={styles.signedOutEmoji}>👤</Text>
            <Text style={styles.signedOutTitle}>{t('profile.signedOutTitle')}</Text>
            <Text style={styles.signedOutSub}>
              {t('profile.signedOutSub')}
            </Text>
            <View style={styles.signedOutBtns}>
              <TouchableOpacity
                style={[styles.authBtn, styles.authPrimary]}
                onPress={() => router.push('/(auth)/login')}
              >
                <Text style={styles.authBtnText}>{t('common.signIn')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.authBtn, styles.authSecondary]}
                onPress={() => router.push('/(auth)/register')}
              >
                <Text style={[styles.authBtnText, { color: COLORS.accent_light }]}>{t('common.register')}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.version}>{t('profile.version')}</Text>
          <View style={{ height: 32 }} />
        </ScrollView>

        {/* Language Modal */}
        <LanguageModal visible={langModal} current={currentLang} onSelect={switchLang} onClose={() => setLangModal(false)} />
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
          <Text style={styles.title}>{t('profile.title')}</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => switchLang(currentLang === 'en' ? 'hi' : 'en')} style={styles.langToggle} activeOpacity={0.75}>
              <Text style={styles.langToggleText}>{currentLang === 'hi' ? 'EN' : 'HI'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle} activeOpacity={0.75}>
              <Text style={styles.themeToggleEmoji}>{isDark ? '☀️' : '🌙'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout}>
              <Text style={styles.logoutLink}>{t('profile.signOut')}</Text>
            </TouchableOpacity>
          </View>
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
            { n: stats?.totalTests ?? 0, l: t('profile.tests') },
            { n: stats?.streak ?? 0,     l: t('profile.streak') },
            { n: `${stats?.bestScore ?? 0}%`, l: t('profile.best') },
            { n: stats?.xp ?? 0,         l: t('profile.xp') },
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
              onPress={() => item.onPress ? item.onPress() : router.push(item.route as any)}
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

        <Text style={styles.version}>{t('profile.version')}</Text>
        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Language Modal */}
      <LanguageModal visible={langModal} current={currentLang} onSelect={switchLang} onClose={() => setLangModal(false)} />
    </View>
  );
}

function LanguageModal({ visible, current, onSelect, onClose }: {
  visible: boolean;
  current: string;
  onSelect: (lang: 'en' | 'hi') => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={langStyles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={langStyles.sheet}>
          <Text style={langStyles.title}>{t('language.title')}</Text>
          <Text style={langStyles.sub}>{t('language.selectLanguage')}</Text>
          {([
            { code: 'en', label: t('language.english') },
            { code: 'hi', label: t('language.hindi') },
          ] as const).map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[langStyles.option, current === lang.code && langStyles.optionActive]}
              onPress={() => onSelect(lang.code)}
            >
              <Text style={[langStyles.optionText, current === lang.code && langStyles.optionTextActive]}>
                {lang.label}
              </Text>
              {current === lang.code && <Text style={langStyles.check}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg_primary },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
  },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.text_primary },
  headerRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoutLink: { fontSize: 13, fontWeight: '700', color: COLORS.q_not_answered, paddingVertical: 8 },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  themeToggle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.bg_card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  themeToggleEmoji: {
    fontSize: 16,
  },
  langToggle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.bg_card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  langToggleText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.accent_light,
    letterSpacing: 0.5,
  },

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

const langStyles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.bg_primary,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 24, paddingBottom: 40,
  },
  title: {
    fontSize: 18, fontWeight: '800', color: COLORS.text_primary,
    marginBottom: 4,
  },
  sub: {
    fontSize: 13, color: COLORS.text_secondary,
    marginBottom: 20,
  },
  option: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, paddingHorizontal: 16,
    borderRadius: 12, marginBottom: 8,
    backgroundColor: COLORS.bg_card,
    borderWidth: 1, borderColor: COLORS.border,
  },
  optionActive: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accent + '15',
  },
  optionText: {
    fontSize: 15, fontWeight: '600', color: COLORS.text_primary,
  },
  optionTextActive: {
    color: COLORS.accent_light, fontWeight: '800',
  },
  check: {
    fontSize: 16, color: COLORS.accent_light, fontWeight: '800',
  },
});