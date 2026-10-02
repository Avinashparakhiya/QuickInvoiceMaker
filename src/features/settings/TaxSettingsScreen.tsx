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
import { Percent, ShieldCheck, Check } from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useOrgStore } from '../../store/useOrgStore';
import { orgRepository } from '../../database/repositories/orgRepository';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { formatCurrency } from '../../utils/currency';
import { useResponsive } from '../../utils/useResponsive';
import { TaxType } from '../../types';

const TAX_RATE_PRESETS = [0, 5, 10, 12, 18, 20, 28];

export const TaxSettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { activeOrg, updateOrg } = useOrgStore();
  const { contentMaxWidth } = useResponsive();

  const [taxEnabled, setTaxEnabled] = useState(activeOrg?.taxEnabled ?? true);
  const [taxId, setTaxId] = useState(activeOrg?.taxId || '');
  const [taxRate, setTaxRate] = useState('18');
  const [taxType, setTaxType] = useState<TaxType>(activeOrg?.taxType || 'EXCLUSIVE');
  const [saving, setSaving] = useState(false);

  const currencySymbol = activeOrg?.currencySymbol || '$';
  const numericRate = parseFloat(taxRate) || 0;
  const sampleSubtotal = 1000;
  const sampleTax = taxEnabled ? (sampleSubtotal * numericRate) / 100 : 0;
  const sampleTotal = sampleSubtotal + sampleTax;

  const handleSave = async () => {
    if (!activeOrg) return;
    setSaving(true);
    try {
      await updateOrg(activeOrg.id, {
        taxId: taxId.trim(),
        taxEnabled,
        taxType,
      });
      Alert.alert('Tax Settings Saved', 'Your tax and GST preferences have been updated.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to update tax settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Tax & GST Settings"
        subtitle={`Workspace: ${activeOrg?.displayName || activeOrg?.name || 'Current'}`}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={[styles.scrollContent, { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' }]} showsVerticalScrollIndicator={false}>
        {/* Enable Tax Calculation Toggle Card */}
        <Card variant="elevated" padding={16} style={styles.card}>
          <View style={styles.switchRow}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={styles.switchTitle}>Enable Tax Calculation</Text>
              <Text style={styles.switchSub}>
                Automatically compute and apply sales tax/GST on invoices and line items
              </Text>
            </View>
            <Switch
              value={taxEnabled}
              onValueChange={setTaxEnabled}
              trackColor={{ false: colors.borderLight, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </Card>

        {taxEnabled && (
          <>
            {/* Live Calculation Preview Card */}
            <Card variant="softGreen" padding={16} style={styles.card}>
              <Text style={styles.previewHeading}>CALCULATION BREAKDOWN PREVIEW</Text>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Sample Subtotal:</Text>
                <Text style={styles.previewVal}>{formatCurrency(sampleSubtotal, currencySymbol)}</Text>
              </View>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Tax ({numericRate}%):</Text>
                <Text style={[styles.previewVal, { color: colors.primaryDarker }]}>
                  +{formatCurrency(sampleTax, currencySymbol)}
                </Text>
              </View>
              <View style={styles.previewDivider} />
              <View style={styles.previewRow}>
                <Text style={[styles.previewLabel, { fontWeight: '700', color: colors.text }]}>
                  Invoice Total:
                </Text>
                <Text style={[styles.previewVal, { fontSize: 18, fontWeight: '800' }]}>
                  {formatCurrency(sampleTotal, currencySymbol)}
                </Text>
              </View>
            </Card>

            {/* Tax Identification Details Card */}
            <Card variant="elevated" padding={16} style={styles.card}>
              <Text style={styles.sectionTitle}>Business Tax Details</Text>
              <Input
                label="Tax Identification / GSTIN / VAT Number"
                placeholder="e.g. 24ABCDE1234F1Z5 or US-TAX-998822"
                value={taxId}
                onChangeText={setTaxId}
                autoCapitalize="characters"
                containerStyle={{ marginBottom: 4 }}
              />
              <Text style={styles.hintText}>
                This identifier will be clearly displayed on all client invoice headers & PDF exports.
              </Text>
            </Card>

            {/* Default Rate Presets Card */}
            <Card variant="elevated" padding={16} style={styles.card}>
              <Text style={styles.sectionTitle}>Default Tax Rate (%)</Text>
              <Input
                label="Custom Tax Percentage"
                placeholder="18"
                value={taxRate}
                onChangeText={setTaxRate}
                keyboardType="numeric"
                suffix={<Percent size={18} color={colors.textSecondary} />}
                containerStyle={{ marginBottom: 12 }}
              />

              <Text style={styles.presetLabel}>Quick Presets:</Text>
              <View style={styles.presetsGrid}>
                {TAX_RATE_PRESETS.map((rate) => {
                  const isSelected = numericRate === rate;

                  return (
                    <TouchableOpacity
                      key={rate}
                      activeOpacity={0.7}
                      onPress={() => setTaxRate(String(rate))}
                      style={[styles.presetChip, isSelected && styles.presetChipActive]}
                    >
                      <Text style={[styles.presetText, isSelected && styles.presetTextActive]}>
                        {rate}%
                      </Text>
                      {isSelected && <Check size={14} color="#FFFFFF" style={{ marginLeft: 4 }} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Card>
          </>
        )}
      </ScrollView>

      {/* Sticky Save CTA */}
      <View style={[styles.footer, { maxWidth: Math.min(contentMaxWidth, 800), alignSelf: 'center', width: '100%' }]}>
        <Button
          title="Save Tax Settings"
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
  previewHeading: {
    fontSize: 11,
    color: colors.primaryDarker,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  previewLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  previewVal: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  previewDivider: {
    height: 1,
    backgroundColor: '#D7E5DC',
    marginVertical: 8,
  },
  sectionTitle: {
    ...typography.bodySemiBold,
    color: colors.text,
    fontSize: 15,
    marginBottom: 10,
  },
  hintText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
  },
  presetLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 8,
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
