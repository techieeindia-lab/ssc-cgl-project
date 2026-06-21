import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { registerWithEmail } from '../../src/services/authService';
import { COLORS } from '../../src/theme/colors';

export default function RegisterScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleRegister() {
    if (!name || !email || !password || !confirm) {
      Alert.alert(t('auth.missingFields'), t('auth.missingFieldsMsg'));
      return;
    }
    if (password !== confirm) {
      Alert.alert(t('auth.passwordMismatch'), t('auth.passwordMismatchMsg'));
      return;
    }
    if (password.length < 6) {
      Alert.alert(t('auth.weakPassword'), t('auth.weakPasswordMsg'));
      return;
    }
    setLoading(true);
    try {
      await registerWithEmail(name.trim(), email.trim(), password);
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert(t('auth.registrationFailed'), e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>{t('auth.back')}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{t('auth.createAccount')}</Text>
          <Text style={styles.sub}>{t('auth.createAccountSub')}</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('auth.fullName')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('auth.namePlaceholder')}
              placeholderTextColor={COLORS.text_muted}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('auth.email')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('auth.emailPlaceholder')}
              placeholderTextColor={COLORS.text_muted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('auth.password')}</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder={t('auth.minChars')}
                placeholderTextColor={COLORS.text_muted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('auth.confirmPassword')}</Text>
            <TextInput
              style={[
                styles.input,
                confirm.length > 0 && confirm !== password && styles.inputError,
              ]}
              placeholder={t('auth.confirmPlaceholder')}
              placeholderTextColor={COLORS.text_muted}
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            {confirm.length > 0 && confirm !== password && (
              <Text style={styles.errorText}>{t('auth.passwordMismatchMsg')}</Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.registerBtn, loading && { opacity: 0.7 }]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.registerBtnText}>{t('auth.createAccountBtn')}</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('auth.hasAccount')}</Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
            <Text style={styles.footerLink}>{t('common.signIn')}</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg_primary },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  header: { marginBottom: 36 },
  backBtn: { marginBottom: 24 },
  backText: { fontSize: 14, fontWeight: '600', color: COLORS.accent_light },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.text_primary, marginBottom: 8 },
  sub: { fontSize: 14, color: COLORS.text_secondary },
  form: { gap: 4 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.text_secondary, marginBottom: 8 },
  input: {
    backgroundColor: COLORS.bg_card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.text_primary,
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputError: { borderColor: COLORS.q_not_answered },
  errorText: { fontSize: 12, color: COLORS.q_not_answered, marginTop: 6 },
  passwordRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eyeBtn: {
    backgroundColor: COLORS.bg_card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
  },
  eyeText: { fontSize: 16 },
  registerBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  registerBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  footerText: { fontSize: 14, color: COLORS.text_secondary },
  footerLink: { fontSize: 14, fontWeight: '700', color: COLORS.accent_light },
});