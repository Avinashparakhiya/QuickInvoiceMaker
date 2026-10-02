import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Hash, Calendar, FileText, Check } from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useOrgStore } from '../../store/useOrgStore';
import { orgRepository } from '../../database/repositories/orgRepository';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { useResponsive } from '../../utils/useResponsive';

const DUE_DAY_PRESETS = [
  { label: 'On Receipt', value: 0 },
  { label: '7 Days', value: 7 },
  { label: '14 Days', value: 14 },
  { label: '30 Days', value: 30 },
  { label: '45 Days', value: 45 },
  { label: '60 Days', value: 60 },
];

export const InvoiceNumberingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { activeOrg, updateOrg } = useOrgStore();
  const { contentMaxWidth } = useResponsive();

  const [prefix, setPrefix] = useState(activeOrg?.invoicePrefix || 'INV-');
  const [nextNumber, setNextNumber] = useState(
    activeOrg?.invoiceNextNumber ? String(activeOrg.invoiceNextNumber) : '1001'
  );
  const [dueDays, setDueDays] = useState(14);
  const [defaultNotes, setDefaultNotes] = useState(
    activeOrg?.defaultNotes || 'Thank you for your business! We appreciate your trust.'
  );
  const [defaultTerms, setDefaultTerms] = useState(
    activeOrg?.defaultTerms || 'Payment is due within 14 days of invoice issue date.'
  );
  const [saving, setSaving] = useState(false);

  const formattedInvoiceSample = `${prefix || 'INV-'}${String(nextNumber || '1').padStart(4, '0')}`;

  const handleSave = async () => {
    if (!activeOrg) return;
    setSaving(true);
    try {
      const num = parseInt(nextNumber, 10) || 1;
      await updateOrg(activeOrg.id, {
        invoicePrefix: prefix.trim() || 'INV-',
        invoiceNextNumber: num,
        defaultNotes: defaultNotes.trim(),
        defaultTerms: defaultTerms.trim(),
      });
      Alert.alert('Settings Saved', 'Invoice numbering and default terms updated.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to update numbering settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Invoice & Defaults"
        subtitle={`Workspace: ${activeOrg?.displayName || activeOrg?.name || 'Current'}`}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={[styles.scrollContent, { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' }]} showsVerticalScrollIndicator={false}>
        {/* Live Sequence Preview Card */}
        <Card variant="softGreen" padding={16} style={styles.card}>
          <Text style={styles.previewHeading}>NEXT INVOICE NUMBER PREVIEW</Text>
          <Text style={styles.previewCode}>{formattedInvoiceSample}</Text>
          <Text style={styles.previewSub}>
            New invoices will automatically generate sequentially starting from this code.
          </Text>
        </Card>

        {/* Numbering Prefix & Starting Number */}
        <Card variant="elevated" padding={16} style={styles.card}>
          <Text style={styles.sectionTitle}>Numbering Sequence</Text>
          <View style={styles.inputRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Input
                label="Invoice Prefix"
                placeholder="INV-"
                value={prefix}
                onChangeText={setPrefix}
                autoCapitalize="characters"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="Next Number"
                placeholder="1001"
                value={nextNumber}
                onChangeText={setNextNumber}
                keyboardType="numeric"
              />
            </View>
          </View>
        </Card>

        {/* Default Payment Due Period */}
        <Card variant="elevated" padding={16} style={styles.card}>
          <Text style={styles.sectionTitle}>Default Payment Terms (Due In)</Text>
          <View style={styles.presetsGrid}>
            {DUE_DAY_PRESETS.map((preset) => {
              const isSelected = dueDays === preset.value;

              return (
                <TouchableOpacity
                  key={preset.value}
                  activeOpacity={0.7}
                  onPress={() => setDueDays(preset.value)}
                  style={[styles.presetChip, isSelected && styles.presetChipActive]}
                >
                  <Text style={[styles.presetText, isSelected && styles.presetTextActive]}>
                    {preset.label}
                  </Text>
                  {isSelected && <Check size={14} color="#FFFFFF" style={{ marginLeft: 4 }} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Default Notes & Terms */}
        <Card variant="elevated" padding={16} style={styles.card}>
          <Text style={styles.sectionTitle}>Default Client Notes & Footers</Text>
          <Input
            label="Default Thank You Note"
            placeholder="Thank you for your business!"
            value={defaultNotes}
            onChangeText={setDefaultNotes}
            multiline
            numberOfLines={2}
            containerStyle={{ marginBottom: 12 }}
          />

          <Input
            label="Default Payment Terms / Instructions"
            placeholder="Payment due within 14 days..."
            value={defaultTerms}
            onChangeText={setDefaultTerms}
            multiline
            numberOfLines={3}
          />
        </Card>
      </ScrollView>

      {/* Sticky Save CTA */}
      <View style={[styles.footer, { maxWidth: Math.min(contentMaxWidth, 800), alignSelf: 'center', width: '100%' }]}>
        <Button
          title="Save Invoice Settings"
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
  previewHeading: {
    fontSize: 11,
    color: colors.primaryDarker,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  previewCode: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    marginVertical: 4,
  },
  previewSub: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  sectionTitle: {
    ...typography.bodySemiBold,
    color: colors.text,
    fontSize: 15,
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D7E5DC',
  },
  presetChipActive: {
    backgroundColor: colors.primaryDarker,
    borderColor: colors.primaryDarker,
  },
  presetText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  presetTextActive: {
    color: '#FFFFFF',
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
