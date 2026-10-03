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
import { Building2, QrCode, CreditCard, ShieldCheck } from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { AmbientBackground } from '../../components/common/ScreenBackground';
import { useOrgStore } from '../../store/useOrgStore';
import { orgRepository } from '../../database/repositories/orgRepository';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { useResponsive } from '../../utils/useResponsive';

export const PaymentSettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { activeOrg, updateOrg } = useOrgStore();
  const { contentMaxWidth } = useResponsive();

  const [bankName, setBankName] = useState(activeOrg?.bankName || '');
  const [bankAccount, setBankAccount] = useState(activeOrg?.bankAccountNo || '');
  const [bankIfsc, setBankIfsc] = useState(activeOrg?.bankIfscSwift || '');
  const [bankHolder, setBankHolder] = useState(activeOrg?.bankAccountHolder || '');
  const [upiVpa, setUpiVpa] = useState(activeOrg?.upiVpa || '');
  const [paymentTerms, setPaymentTerms] = useState(
    activeOrg?.defaultTerms || 'Payment via wire transfer or UPI is accepted.'
  );
  const [showOnInvoice, setShowOnInvoice] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!activeOrg) return;
    setSaving(true);
    try {
      await updateOrg(activeOrg.id, {
        bankName: bankName.trim(),
        bankAccountNo: bankAccount.trim(),
        bankIfscSwift: bankIfsc.trim(),
        bankAccountHolder: bankHolder.trim(),
        upiVpa: upiVpa.trim(),
        defaultTerms: paymentTerms.trim(),
      });
      Alert.alert('Payment Settings Saved', 'Your receiving bank & UPI settings have been updated.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to update payment settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <AmbientBackground />
      <Header
        title="Bank & Payment Details"
        subtitle={`Workspace: ${activeOrg?.displayName || activeOrg?.name || 'Current'}`}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={[styles.scrollContent, { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' }]} showsVerticalScrollIndicator={false}>
        {/* Visibility Toggle Card */}
        <Card variant="elevated" padding={16} style={styles.card}>
          <View style={styles.switchRow}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={styles.switchTitle}>Show Bank Details on Invoices</Text>
              <Text style={styles.switchSub}>
                Automatically print payment instructions and bank details on generated PDF invoices
              </Text>
            </View>
            <Switch
              value={showOnInvoice}
              onValueChange={setShowOnInvoice}
              trackColor={{ false: colors.borderLight, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </Card>

        {/* Bank Account Details Card */}
        <Card variant="elevated" padding={16} style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Building2 size={20} color={colors.primaryDarker} />
            <Text style={styles.sectionTitle}>Bank Account Information</Text>
          </View>

          <Input
            label="Bank Name"
            placeholder="e.g. JPMorgan Chase or HDFC Bank"
            value={bankName}
            onChangeText={setBankName}
            containerStyle={{ marginBottom: 10 }}
          />

          <Input
            label="Account Holder Name"
            placeholder="e.g. Acme Corporation LLC"
            value={bankHolder}
            onChangeText={setBankHolder}
            containerStyle={{ marginBottom: 10 }}
          />

          <Input
            label="Account Number / IBAN"
            placeholder="e.g. 9876543210123"
            value={bankAccount}
            onChangeText={setBankAccount}
            keyboardType="numeric"
            containerStyle={{ marginBottom: 10 }}
          />

          <Input
            label="IFSC / SWIFT / Routing Code"
            placeholder="e.g. HDFC0001234 or CHASUS33"
            value={bankIfsc}
            onChangeText={setBankIfsc}
            autoCapitalize="characters"
          />
        </Card>

        {/* Digital / UPI Payment Card */}
        <Card variant="elevated" padding={16} style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <QrCode size={20} color="#0369A1" />
            <Text style={styles.sectionTitle}>UPI & Instant Payment</Text>
          </View>

          <Input
            label="UPI ID / VPA (Optional)"
            placeholder="e.g. business@okhdfcbank"
            value={upiVpa}
            onChangeText={setUpiVpa}
            autoCapitalize="none"
            containerStyle={{ marginBottom: 4 }}
          />
          <Text style={styles.hintText}>
            Enables instant QR code generation on PDF invoices for mobile payments.
          </Text>
        </Card>

        {/* Payment Instructions */}
        <Card variant="elevated" padding={16} style={styles.card}>
          <Text style={styles.sectionTitle}>Payment Instructions</Text>
          <Input
            placeholder="Please mention Invoice # in the transfer reference..."
            value={paymentTerms}
            onChangeText={setPaymentTerms}
            multiline
            numberOfLines={3}
          />
        </Card>
      </ScrollView>

      {/* Sticky Save CTA */}
      <View style={[styles.footer, { maxWidth: Math.min(contentMaxWidth, 800), alignSelf: 'center', width: '100%' }]}>
        <Button
          title="Save Payment Details"
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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  switchSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    ...typography.bodySemiBold,
    color: colors.text,
    fontSize: 15,
  },
  inputRow: {
    flexDirection: 'row',
  },
  hintText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
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
