import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  Package,
  Briefcase,
  DollarSign,
  Percent,
  Barcode,
  Check,
  AlignLeft,
} from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { AmbientBackground } from '../../components/common/ScreenBackground';
import { useOrgStore } from '../../store/useOrgStore';
import { itemRepository } from '../../database/repositories/itemRepository';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { useResponsive } from '../../utils/useResponsive';

export const ItemFormScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const itemId = route.params?.itemId;
  const { activeOrg } = useOrgStore();
  const { contentMaxWidth } = useResponsive();

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [rate, setRate] = useState('');
  const [taxRate, setTaxRate] = useState('0');
  const [category, setCategory] = useState<'PRODUCT' | 'SERVICE'>('SERVICE');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (itemId) {
      loadItem(itemId);
    }
  }, [itemId]);

  const loadItem = async (id: string) => {
    const itm = await itemRepository.getById(id);
    if (itm) {
      setName(itm.name);
      setSku(itm.sku || '');
      setDescription(itm.description || '');
      setUnit(itm.unit || 'pcs');
      setRate(itm.rate.toString());
      setTaxRate(itm.taxRate.toString());
      setCategory(itm.category);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Required Field', 'Please enter item or service name.');
      return;
    }
    if (!activeOrg) {
      Alert.alert('Error', 'No active business profile selected.');
      return;
    }

    setLoading(true);
    try {
      const parsedRate = parseFloat(rate) || 0;
      const parsedTax = parseFloat(taxRate) || 0;

      if (itemId) {
        await itemRepository.update(itemId, {
          name: name.trim(),
          sku: sku.trim() || undefined,
          description: description.trim() || undefined,
          unit: unit || 'pcs',
          rate: parsedRate,
          taxRate: parsedTax,
          category,
        });
      } else {
        const newId = `item-${Date.now()}`;
        await itemRepository.create({
          id: newId,
          organizationId: activeOrg.id,
          name: name.trim(),
          sku: sku.trim() || undefined,
          description: description.trim() || undefined,
          unit: unit || 'pcs',
          rate: parsedRate,
          taxRate: parsedTax,
          category,
          isActive: true,
        });
      }
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save item.');
    } finally {
      setLoading(false);
    }
  };

  const units = ['pcs', 'hrs', 'days', 'pkg', 'box', 'kg', 'm', 'service'];
  const currencySymbol = activeOrg?.currencySymbol || '$';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <AmbientBackground />
      <Header
        title={itemId ? 'Edit Item' : 'New Item / Service'}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={[styles.scrollContent, { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' }]} showsVerticalScrollIndicator={false}>
        {/* Category Toggle */}
        <View style={styles.catRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setCategory('SERVICE')}
            style={[styles.catBtn, category === 'SERVICE' && styles.catBtnActive]}
          >
            <Briefcase size={18} color={category === 'SERVICE' ? '#15803D' : '#64748B'} />
            <Text style={[styles.catText, category === 'SERVICE' && styles.catTextActive]}>
              Service / Consulting
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setCategory('PRODUCT')}
            style={[styles.catBtn, category === 'PRODUCT' && styles.catBtnActive]}
          >
            <Package size={18} color={category === 'PRODUCT' ? '#15803D' : '#64748B'} />
            <Text style={[styles.catText, category === 'PRODUCT' && styles.catTextActive]}>
              Physical Product
            </Text>
          </TouchableOpacity>
        </View>

        {/* Card 1: Basic Information */}
        <View style={styles.formCard}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: '#DCFCE7' }]}>
              {category === 'SERVICE' ? (
                <Briefcase size={16} color="#15803D" />
              ) : (
                <Package size={16} color="#15803D" />
              )}
            </View>
            <Text style={styles.cardTitle}>Basic Information</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {category === 'SERVICE' ? 'Service Name *' : 'Product Name *'}
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder={category === 'SERVICE' ? 'e.g. Website Development' : 'e.g. Wireless Mouse'}
              placeholderTextColor="#94A3B8"
              style={styles.textInput}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>SKU / Code (Optional)</Text>
            <TextInput
              value={sku}
              onChangeText={setSku}
              placeholder="e.g. SRV-001 or PROD-99"
              placeholderTextColor="#94A3B8"
              style={styles.textInput}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description (Optional)</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Detailed item description for invoice line items..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={3}
              style={[styles.textInput, { minHeight: 70, textAlignVertical: 'top' }]}
            />
          </View>
        </View>

        {/* Card 2: Pricing & Tax */}
        <View style={styles.formCard}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
              <DollarSign size={16} color="#B45309" />
            </View>
            <Text style={styles.cardTitle}>Pricing & Tax</Text>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1.2 }]}>
              <Text style={styles.inputLabel}>Unit Price ({currencySymbol}) *</Text>
              <TextInput
                value={rate}
                onChangeText={setRate}
                placeholder="0.00"
                placeholderTextColor="#94A3B8"
                keyboardType="decimal-pad"
                style={styles.textInput}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 0.8, marginLeft: 10 }]}>
              <Text style={styles.inputLabel}>Tax Rate (%)</Text>
              <TextInput
                value={taxRate}
                onChangeText={setTaxRate}
                placeholder="0"
                placeholderTextColor="#94A3B8"
                keyboardType="decimal-pad"
                style={styles.textInput}
              />
            </View>
          </View>

          <Text style={styles.unitLabel}>Unit of Measurement</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.unitList}>
            {units.map((u) => {
              const isSelected = unit === u;
              return (
                <TouchableOpacity
                  key={u}
                  activeOpacity={0.7}
                  onPress={() => setUnit(u)}
                  style={[
                    styles.unitChip,
                    isSelected && styles.unitChipSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.unitChipText,
                      isSelected && styles.unitChipTextSelected,
                    ]}
                  >
                    {u}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Save Button */}
        <Button
          title={itemId ? 'Update Item' : 'Save Item to Catalog'}
          onPress={handleSave}
          loading={loading}
          icon={<Check size={18} color="#FFFFFF" strokeWidth={3} />}
          size="lg"
          style={styles.saveBtn}
        />
      </ScrollView>
    </KeyboardAvoidingView>
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
  catRow: {
    flexDirection: 'row',
    marginBottom: 14,
    gap: 10,
  },
  catBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  catBtnActive: {
    backgroundColor: '#DCFCE7',
    borderColor: colors.primary,
  },
  catText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 13,
  },
  catTextActive: {
    color: '#15803D',
    fontWeight: '700',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    ...typography.h3,
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    ...typography.captionRegular,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 6,
    fontSize: 13,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unitLabel: {
    ...typography.captionRegular,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 8,
    fontSize: 13,
  },
  unitList: {
    gap: 8,
    paddingBottom: 4,
  },
  unitChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  unitChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  unitChipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  unitChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  saveBtn: {
    width: '100%',
    marginTop: 4,
    marginBottom: 24,
  },
});
