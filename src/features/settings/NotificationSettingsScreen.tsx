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
import { Bell, Clock, AlertTriangle, CheckCircle2, TrendingUp, Check } from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

const REMINDER_PRESETS = [
  { id: '3_days_before', label: '3 Days Before Due Date' },
  { id: 'on_due_date', label: 'On Due Date Morning' },
  { id: '1_day_after', label: '1 Day After (Overdue Notice)' },
  { id: 'weekly_overdue', label: 'Weekly Overdue Follow-up' },
];

export const NotificationSettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const [dueSoonEnabled, setDueSoonEnabled] = useState(true);
  const [overdueEnabled, setOverdueEnabled] = useState(true);
  const [paymentReceivedEnabled, setPaymentReceivedEnabled] = useState(true);
  const [weeklyReportEnabled, setWeeklyReportEnabled] = useState(false);
  const [selectedReminders, setSelectedReminders] = useState<string[]>([
    '3_days_before',
    'on_due_date',
    '1_day_after',
  ]);
  const [saving, setSaving] = useState(false);

  const toggleReminder = (id: string) => {
    if (selectedReminders.includes(id)) {
      setSelectedReminders(selectedReminders.filter((r) => r !== id));
    } else {
      setSelectedReminders([...selectedReminders, id]);
    }
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      Alert.alert('Preferences Saved', 'Your reminder and notification rules are updated.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }, 400);
  };

  return (
    <View style={styles.container}>
      <Header
        title="Notifications & Alerts"
        subtitle="Configure due date reminders and alerts"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Main Alert Toggles */}
        <Card variant="elevated" padding={16} style={styles.card}>
          <Text style={styles.sectionTitle}>Automated Alert Channels</Text>

          {/* Due Soon */}
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <View style={styles.rowTitle}>
                <Clock size={16} color={colors.warning} />
                <Text style={styles.switchLabel}>Upcoming Due Invoices</Text>
              </View>
              <Text style={styles.switchDesc}>Alert when invoices approach their payment deadlines</Text>
            </View>
            <Switch
              value={dueSoonEnabled}
              onValueChange={setDueSoonEnabled}
              trackColor={{ false: colors.borderLight, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.divider} />

          {/* Overdue */}
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <View style={styles.rowTitle}>
                <AlertTriangle size={16} color={colors.danger} />
                <Text style={styles.switchLabel}>Overdue Payment Alerts</Text>
              </View>
              <Text style={styles.switchDesc}>Daily notice for past-due unpaid client invoices</Text>
            </View>
            <Switch
              value={overdueEnabled}
              onValueChange={setOverdueEnabled}
              trackColor={{ false: colors.borderLight, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.divider} />

          {/* Payment Received */}
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <View style={styles.rowTitle}>
                <CheckCircle2 size={16} color={colors.success} />
                <Text style={styles.switchLabel}>Payment Confirmations</Text>
              </View>
              <Text style={styles.switchDesc}>Instant celebration and balance update upon recording payments</Text>
            </View>
            <Switch
              value={paymentReceivedEnabled}
              onValueChange={setPaymentReceivedEnabled}
              trackColor={{ false: colors.borderLight, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.divider} />

          {/* Weekly Summary */}
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <View style={styles.rowTitle}>
                <TrendingUp size={16} color="#0369A1" />
                <Text style={styles.switchLabel}>Weekly Cashflow Digest</Text>
              </View>
              <Text style={styles.switchDesc}>Summary of total billed, collected, and outstanding receivables</Text>
            </View>
            <Switch
              value={weeklyReportEnabled}
              onValueChange={setWeeklyReportEnabled}
              trackColor={{ false: colors.borderLight, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </Card>

        {/* Due Date Timing Rules */}
        <Card variant="elevated" padding={16} style={styles.card}>
          <Text style={styles.sectionTitle}>Reminder Trigger Timing</Text>
          <Text style={styles.sectionSub}>Select the key moments when reminder badges should trigger:</Text>

          {REMINDER_PRESETS.map((item) => {
            const isSelected = selectedReminders.includes(item.id);

            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.7}
                onPress={() => toggleReminder(item.id)}
                style={[styles.reminderRow, isSelected && styles.reminderRowSelected]}
              >
                <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                  {isSelected && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                </View>
                <Text style={[styles.reminderText, isSelected && styles.reminderTextSelected]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </Card>
      </ScrollView>

      {/* Sticky Save CTA */}
      <View style={styles.footer}>
        <Button
          title="Save Notification Rules"
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
    borderColor: '#D7E5DC',
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
    marginBottom: 12,
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
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D7E5DC',
  },
  reminderRowSelected: {
    backgroundColor: '#F0FDF4',
    borderColor: colors.primary,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  reminderText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  reminderTextSelected: {
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
