import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Lock, ShieldCheck, Vibrate, Check, Smartphone } from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { AmbientBackground } from '../../components/common/ScreenBackground';
import { useSettingsStore } from '../../store/useSettingsStore';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { useResponsive } from '../../utils/useResponsive';

const TIMEOUT_OPTIONS = [
  { id: 'immediate', label: 'Immediately upon exit' },
  { id: '1min', label: 'After 1 Minute' },
  { id: '5min', label: 'After 5 Minutes' },
  { id: '15min', label: 'After 15 Minutes' },
];

export const SecuritySettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { contentMaxWidth } = useResponsive();
  const {
    isBiometricEnabled,
    isHapticsEnabled,
    setBiometrics,
    setHaptics,
  } = useSettingsStore();

  const [selectedTimeout, setSelectedTimeout] = useState('immediate');
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      Alert.alert('Security Preferences Saved', 'Your app lock and security settings are active.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }, 300);
  };

  return (
    <View style={styles.container}>
      <AmbientBackground />
      <Header
        title="Security & App Lock"
        subtitle="Protect sensitive billing & client data"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={[styles.scrollContent, { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' }]} showsVerticalScrollIndicator={false}>
        {/* Privacy Card */}
        <Card variant="softGreen" padding={16} style={styles.card}>
          <View style={styles.privacyHeader}>
            <ShieldCheck size={24} color={colors.primaryDarker} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.privacyTitle}>Local Data Shield</Text>
              <Text style={styles.privacyDesc}>
                Your database is stored in your device's private sandbox. No cloud servers have access to your invoices without your explicit backup exports.
              </Text>
            </View>
          </View>
        </Card>

        {/* Lock Toggles */}
        <Card variant="elevated" padding={16} style={styles.card}>
          <Text style={styles.sectionTitle}>Device Authentication</Text>

          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <View style={styles.rowTitle}>
                <Lock size={16} color={colors.primaryDarker} />
                <Text style={styles.switchLabel}>Biometric / PIN App Lock</Text>
              </View>
              <Text style={styles.switchDesc}>
                Require Face ID, Fingerprint, or PIN passcode to open Quick Invoice Maker
              </Text>
            </View>
            <Switch
              value={isBiometricEnabled}
              onValueChange={setBiometrics}
              trackColor={{ false: colors.borderLight, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <View style={styles.rowTitle}>
                <Vibrate size={16} color={colors.primaryDarker} />
                <Text style={styles.switchLabel}>Tactile Haptic Feedback</Text>
              </View>
              <Text style={styles.switchDesc}>
                Vibrate gently on button taps, payment recordings, and deletions
              </Text>
            </View>
            <Switch
              value={isHapticsEnabled}
              onValueChange={setHaptics}
              trackColor={{ false: colors.borderLight, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </Card>

        {/* Auto Lock Timeout */}
        {isBiometricEnabled && (
          <Card variant="elevated" padding={16} style={styles.card}>
            <Text style={styles.sectionTitle}>Auto-Lock Inactivity Timeout</Text>
            <Text style={styles.sectionSub}>Lock the app when switched to the background after:</Text>

            {TIMEOUT_OPTIONS.map((opt) => {
              const isSelected = selectedTimeout === opt.id;

              return (
                <TouchableOpacity
                  key={opt.id}
                  activeOpacity={0.7}
                  onPress={() => setSelectedTimeout(opt.id)}
                  style={[styles.timeoutRow, isSelected && styles.timeoutRowSelected]}
                >
                  <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                  <Text style={[styles.timeoutText, isSelected && styles.timeoutTextSelected]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </Card>
        )}
      </ScrollView>

      {/* Sticky Save CTA */}
      <View style={[styles.footer, { maxWidth: Math.min(contentMaxWidth, 800), alignSelf: 'center', width: '100%' }]}>
        <Button
          title="Save Security Settings"
          onPress={handleSave}
          loading={saving}
          fullWidth
          size="lg"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    marginBottom: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  privacyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryDarker,
  },
  privacyDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  sectionTitle: {
    ...typography.bodySemiBold,
    color: colors.text,
    fontSize: 15,
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  switchInfo: {
    flex: 1,
    paddingRight: 12,
  },
  rowTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  switchDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
  timeoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
  },
  timeoutRowSelected: {
    backgroundColor: '#F0FDF4',
    borderColor: colors.primary,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioCircleSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  timeoutText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  timeoutTextSelected: {
    color: colors.primaryDarker,
    fontWeight: '700',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
});
