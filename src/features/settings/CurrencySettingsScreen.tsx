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
import { Check, Search, DollarSign } from 'lucide-react-native';
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

interface CurrencyOption {
  code: string;
  symbol: string;
  name: string;
  country: string;
}

const CURRENCY_LIST: CurrencyOption[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', country: 'United States' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', country: 'India' },
  { code: 'EUR', symbol: '€', name: 'Euro', country: 'European Union' },
  { code: 'GBP', symbol: '£', name: 'British Pound', country: 'United Kingdom' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', country: 'Canada' },
  { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar', country: 'Australia' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham', country: 'United Arab Emirates' },
  { code: 'SGD', symbol: 'SG$', name: 'Singapore Dollar', country: 'Singapore' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', country: 'Japan' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', country: 'Switzerland' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', country: 'New Zealand' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', country: 'South Africa' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', country: 'Brazil' },
  { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso', country: 'Mexico' },
  { code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal', country: 'Saudi Arabia' },
];

export const CurrencySettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { activeOrg, updateOrg } = useOrgStore();
  const { contentMaxWidth } = useResponsive();
  const [search, setSearch] = useState('');
  const [selectedCode, setSelectedCode] = useState(activeOrg?.currencyCode || 'USD');
  const [selectedSymbol, setSelectedSymbol] = useState(activeOrg?.currencySymbol || '$');
  const [saving, setSaving] = useState(false);

  const filteredCurrencies = CURRENCY_LIST.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.country.toLowerCase().includes(search.toLowerCase()) ||
      c.symbol.includes(search)
  );

  const handleSelect = (currency: CurrencyOption) => {
    setSelectedCode(currency.code);
    setSelectedSymbol(currency.symbol);
  };

  const handleSave = async () => {
    if (!activeOrg) return;
    setSaving(true);
    try {
      await updateOrg(activeOrg.id, {
        currencyCode: selectedCode,
        currencySymbol: selectedSymbol,
      });
      Alert.alert('Currency Updated', `Default currency set to ${selectedCode} (${selectedSymbol})`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to update currency.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Currency Settings"
        subtitle={`Workspace: ${activeOrg?.displayName || activeOrg?.name || 'Current'}`}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={[styles.scrollContent, { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' }]} showsVerticalScrollIndicator={false}>
        {/* Live Preview Card */}
        <Card variant="softGreen" padding={16} style={styles.previewCard}>
          <Text style={styles.previewLabel}>LIVE PREVIEW</Text>
          <Text style={styles.previewAmount}>
            {formatCurrency(12450.0, selectedSymbol)}
          </Text>
          <Text style={styles.previewCode}>
            Code: {selectedCode} • Symbol: {selectedSymbol}
          </Text>
        </Card>

        {/* Search Box */}
        <View style={styles.searchSection}>
          <Input
            placeholder="Search currency code, name, or country..."
            value={search}
            onChangeText={setSearch}
            prefix={<Search size={18} color={colors.textSecondary} />}
          />
        </View>

        {/* Currency List */}
        <Card variant="elevated" padding={0} style={styles.listCard}>
          {filteredCurrencies.map((c, index) => {
            const isSelected = selectedCode === c.code;

            return (
              <TouchableOpacity
                key={c.code}
                activeOpacity={0.7}
                onPress={() => handleSelect(c)}
                style={[
                  styles.currencyRow,
                  index < filteredCurrencies.length - 1 && styles.currencyRowBorder,
                  isSelected && styles.currencyRowSelected,
                ]}
              >
                <View style={[styles.symbolCircle, isSelected && styles.symbolCircleSelected]}>
                  <Text style={[styles.symbolText, isSelected && styles.symbolTextSelected]}>
                    {c.symbol}
                  </Text>
                </View>

                <View style={styles.currencyInfo}>
                  <Text style={styles.currencyName}>{c.name}</Text>
                  <Text style={styles.currencyCountry}>
                    {c.country} • {c.code}
                  </Text>
                </View>

                {isSelected && (
                  <View style={styles.checkBadge}>
                    <Check size={16} color="#FFFFFF" strokeWidth={3} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </Card>
      </ScrollView>

      {/* Sticky Save CTA */}
      <View style={[styles.footer, { maxWidth: Math.min(contentMaxWidth, 800), alignSelf: 'center', width: '100%' }]}>
        <Button
          title={`Save Currency (${selectedCode})`}
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
  previewCard: {
    marginBottom: 14,
    alignItems: 'center',
    borderRadius: 14,
  },
  previewLabel: {
    fontSize: 11,
    color: colors.primaryDarker,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  previewAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 2,
  },
  previewCode: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  searchSection: {
    marginBottom: 10,
  },
  listCard: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D7E5DC',
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  currencyRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  currencyRowSelected: {
    backgroundColor: '#F0FDF4',
  },
  symbolCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  symbolCircleSelected: {
    backgroundColor: colors.primary,
  },
  symbolText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  symbolTextSelected: {
    color: '#FFFFFF',
  },
  currencyInfo: {
    flex: 1,
  },
  currencyName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  currencyCountry: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
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
