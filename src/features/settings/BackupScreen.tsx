import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Switch,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import {
  Database,
  Download,
  Upload,
  FileSpreadsheet,
  ShieldCheck,
  Lock,
  Vibrate,
  RefreshCw,
  FileJson,
  CheckCircle2,
} from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { BottomSheet } from '../../components/common/BottomSheet';
import { useOrgStore } from '../../store/useOrgStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { invoiceRepository } from '../../database/repositories/invoiceRepository';
import { paymentRepository } from '../../database/repositories/paymentRepository';
import { customerRepository } from '../../database/repositories/customerRepository';
import { expenseRepository } from '../../database/repositories/expenseRepository';
import {
  exportDatabaseToJson,
  restoreDatabaseFromJson,
  generateInvoicesCsv,
  generatePaymentsCsv,
  generateCustomersCsv,
  generateExpensesCsv,
} from '../../utils/exportImport';
import { seedDatabase } from '../../database/db';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { format } from 'date-fns';

export const BackupScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { activeOrg, initialize } = useOrgStore();
  const {
    isBiometricEnabled,
    isHapticsEnabled,
    isAutoBackupEnabled,
    setBiometrics,
    setHaptics,
    setAutoBackup,
  } = useSettingsStore();

  const [loading, setLoading] = useState(false);
  const [restoreModalVisible, setRestoreModalVisible] = useState(false);
  const [restoreJsonInput, setRestoreJsonInput] = useState('');

  const triggerWebDownload = (content: string, filename: string, mimeType: string) => {
    if (Platform.OS === 'web') {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return true;
    }
    return false;
  };

  // 1. Export JSON Database Backup
  const handleExportJsonBackup = async () => {
    setLoading(true);
    try {
      const backupData = await exportDatabaseToJson();
      const jsonStr = JSON.stringify(backupData, null, 2);
      const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
      const filename = `QuickInvoiceMaker_Backup_${timestamp}.json`;

      if (triggerWebDownload(jsonStr, filename, 'application/json')) {
        Alert.alert('Backup Exported', `Downloaded ${filename}`);
        return;
      }

      await Share.share({
        title: filename,
        message: jsonStr,
      });

      Alert.alert('Backup Exported', 'Your full JSON database backup is ready and shared.');
    } catch (err: any) {
      Alert.alert('Export Error', err.message || 'Unable to export backup.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Restore JSON Database Backup
  const handleExecuteRestore = async () => {
    if (!restoreJsonInput.trim()) {
      Alert.alert('Validation Error', 'Please paste your JSON backup payload.');
      return;
    }

    try {
      const parsed = JSON.parse(restoreJsonInput);
      setLoading(true);
      await restoreDatabaseFromJson(parsed);
      await initialize();
      setRestoreModalVisible(false);
      setRestoreJsonInput('');

      Alert.alert(
        'Restore Complete',
        'Your database records, organizations, customers, invoices, quotes, and expenses have been successfully restored!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err: any) {
      Alert.alert('Restore Failed', err.message || 'Invalid backup JSON payload.');
    } finally {
      setLoading(false);
    }
  };

  // 3. CSV Exports
  const handleExportInvoicesCsv = async () => {
    if (!activeOrg) return;
    try {
      const invs = await invoiceRepository.getAll({ orgId: activeOrg.id });
      const csv = generateInvoicesCsv(invs);
      const filename = `Invoices_${format(new Date(), 'yyyyMMdd')}.csv`;
      if (triggerWebDownload(csv, filename, 'text/csv')) {
        Alert.alert('Exported', `Downloaded ${filename}`);
        return;
      }
      await Share.share({
        title: filename,
        message: csv,
      });
    } catch (err: any) {
      Alert.alert('Export Error', err.message);
    }
  };

  const handleExportPaymentsCsv = async () => {
    if (!activeOrg) return;
    try {
      const pms = await paymentRepository.getByOrg(activeOrg.id);
      const csv = generatePaymentsCsv(pms);
      const filename = `Payments_${format(new Date(), 'yyyyMMdd')}.csv`;
      if (triggerWebDownload(csv, filename, 'text/csv')) {
        Alert.alert('Exported', `Downloaded ${filename}`);
        return;
      }
      await Share.share({
        title: filename,
        message: csv,
      });
    } catch (err: any) {
      Alert.alert('Export Error', err.message);
    }
  };

  const handleExportCustomersCsv = async () => {
    if (!activeOrg) return;
    try {
      const custs = await customerRepository.getByOrg(activeOrg.id);
      const csv = generateCustomersCsv(custs);
      const filename = `Customers_${format(new Date(), 'yyyyMMdd')}.csv`;
      if (triggerWebDownload(csv, filename, 'text/csv')) {
        Alert.alert('Exported', `Downloaded ${filename}`);
        return;
      }
      await Share.share({
        title: filename,
        message: csv,
      });
    } catch (err: any) {
      Alert.alert('Export Error', err.message);
    }
  };

  const handleExportExpensesCsv = async () => {
    if (!activeOrg) return;
    try {
      const exps = await expenseRepository.getByOrg(activeOrg.id);
      const csv = generateExpensesCsv(exps);
      const filename = `Expenses_${format(new Date(), 'yyyyMMdd')}.csv`;
      if (triggerWebDownload(csv, filename, 'text/csv')) {
        Alert.alert('Exported', `Downloaded ${filename}`);
        return;
      }
      await Share.share({
        title: filename,
        message: csv,
      });
    } catch (err: any) {
      Alert.alert('Export Error', err.message);
    }
  };

  // 4. Reload Demo Seed Data
  const handleReloadDemoData = () => {
    Alert.alert(
      'Load Demo Data',
      'This will insert sample organizations, invoices, items, and proposals for testing. Proceed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Load Demo Data',
          onPress: async () => {
            setLoading(true);
            try {
              await seedDatabase();
              await initialize();
              Alert.alert('Success', 'Demo seed data loaded successfully!');
            } catch (err: any) {
              Alert.alert('Error', err.message);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Backup & Security" showBack onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Privacy Pledge Card */}
        <Card variant="softGreen" padding={16} style={styles.card}>
          <View style={styles.privacyHeader}>
            <View style={styles.privacyIcon}>
              <ShieldCheck size={24} color={colors.primaryDarker} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.privacyTitle}>100% Private & Local-First</Text>
              <Text style={styles.privacyBody}>
                All clients, invoices, and financial records stay strictly in your device's sandbox. Zero vendor lock-in.
              </Text>
            </View>
          </View>
        </Card>

        {/* JSON Database Backup & Restore */}
        <Card variant="elevated" padding={16} style={styles.card}>
          <Text style={styles.sectionHeading}>Database Backup & Portability</Text>
          <Text style={styles.sectionDesc}>
            Export your entire workspace into a portable JSON file to save to iCloud, Google Drive, or transfer devices.
          </Text>

          <View style={styles.btnRow}>
            <Button
              title="Export JSON Backup"
              onPress={handleExportJsonBackup}
              loading={loading}
              icon={<FileJson size={18} color="#FFFFFF" />}
              style={{ flex: 1 }}
            />
            <View style={{ width: 10 }} />
            <Button
              title="Restore"
              onPress={() => setRestoreModalVisible(true)}
              variant="white"
              icon={<Upload size={18} color={colors.text} />}
              style={{ flex: 1 }}
            />
          </View>
        </Card>

        {/* CSV Spreadsheets */}
        <Card variant="elevated" padding={16} style={styles.card}>
          <Text style={styles.sectionHeading}>Export Spreadsheets (CSV)</Text>
          <Text style={styles.sectionDesc}>
            Download structured CSV tables for Excel, Google Sheets, or accountant filings.
          </Text>

          <View style={styles.csvGrid}>
            <TouchableOpacity style={styles.csvBtn} onPress={handleExportInvoicesCsv}>
              <FileSpreadsheet size={20} color={colors.primaryDarker} />
              <Text style={styles.csvBtnText}>Invoices (.CSV)</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.csvBtn} onPress={handleExportPaymentsCsv}>
              <FileSpreadsheet size={20} color="#0369A1" />
              <Text style={styles.csvBtnText}>Payments (.CSV)</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.csvBtn} onPress={handleExportCustomersCsv}>
              <FileSpreadsheet size={20} color="#6D28D9" />
              <Text style={styles.csvBtnText}>Clients (.CSV)</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.csvBtn} onPress={handleExportExpensesCsv}>
              <FileSpreadsheet size={20} color="#B91C1C" />
              <Text style={styles.csvBtnText}>Expenses (.CSV)</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Security & App Lock */}
        <Card variant="elevated" padding={16} style={styles.card}>
          <Text style={styles.sectionHeading}>Security & Preferences</Text>

          <View style={styles.switchRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Lock size={16} color={colors.primaryDarker} />
                <Text style={styles.switchTitle}>Biometric / PIN App Lock</Text>
              </View>
              <Text style={styles.switchSubtitle}>
                Require Face ID / Fingerprint when opening Quick Invoice Maker
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
            <View style={{ flex: 1, paddingRight: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Vibrate size={16} color={colors.primaryDarker} />
                <Text style={styles.switchTitle}>Tactile Haptic Feedback</Text>
              </View>
              <Text style={styles.switchSubtitle}>
                Subtle vibrations upon saving, creating items, and recording payments
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

        {/* Demo & Testing Utilities */}
        <Card variant="elevated" padding={16} style={styles.card}>
          <Text style={styles.sectionHeading}>Developer & Demo Utilities</Text>
          <Text style={styles.sectionDesc}>
            Quickly test multi-organization workflows, 12 PDF templates, and reports with demo fixtures.
          </Text>

          <Button
            title="Reload Demo Sample Data"
            onPress={handleReloadDemoData}
            variant="outline"
            icon={<RefreshCw size={18} color={colors.primaryDarker} />}
            style={{ marginTop: 6 }}
          />
        </Card>
      </ScrollView>

      {/* Restore JSON Bottom Sheet */}
      <BottomSheet
        visible={restoreModalVisible}
        onClose={() => setRestoreModalVisible(false)}
        title="Restore from JSON Backup"
        subtitle="Paste your backup JSON payload below"
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
          <Input
            placeholder='Paste JSON here: { "version": "1.0.0", "organizations": [...] }'
            value={restoreJsonInput}
            onChangeText={setRestoreJsonInput}
            multiline
            numberOfLines={6}
            containerStyle={{ marginBottom: 14 }}
          />

          <Button
            title="Execute Database Restore"
            onPress={handleExecuteRestore}
            loading={loading}
            size="lg"
            fullWidth
          />
        </ScrollView>
      </BottomSheet>
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
    paddingBottom: 40,
  },
  card: {
    marginBottom: 14,
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  privacyIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  privacyTitle: {
    ...typography.bodySemiBold,
    color: colors.primaryDarker,
    fontSize: 15,
  },
  privacyBody: {
    ...typography.captionRegular,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  sectionHeading: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 4,
  },
  sectionDesc: {
    ...typography.captionRegular,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 18,
  },
  btnRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  csvGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  csvBtn: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: colors.cardPressed,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  csvBtnText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
    fontSize: 12,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  switchTitle: {
    ...typography.bodySemiBold,
    color: colors.text,
  },
  switchSubtitle: {
    ...typography.captionRegular,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 10,
  },
});
