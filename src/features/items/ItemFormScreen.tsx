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
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Header } from '../../components/common/Header';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { useOrgStore } from '../../store/useOrgStore';
import { itemRepository } from '../../database/repositories/itemRepository';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

export const ItemFormScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const itemId = route.params?.itemId;
  const { activeOrg } = useOrgStore();

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
      Alert.alert('Required Field', 'Please enter item/service name.');
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
          name,
          sku,
          description,
          unit,
          rate: parsedRate,
          taxRate: parsedTax,
          category,
        });
      } else {
        const newId = `item-${Date.now()}`;
        await itemRepository.create({
          id: newId,
          organizationId: activeOrg.id,
          name,
          sku,
          description,
          unit,
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

  const units = ['pcs', 'hrs', 'days', 'pkg', 'box', 'kg', 'm'];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Header
        title={itemId ? 'Edit Item / Service' : 'New Item / Service'}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Category Selector */}
        <View style={styles.catRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setCategory('SERVICE')}
            style={[styles.catBtn, category === 'SERVICE' && styles.catBtnActive]}
          >
            <Text style={[styles.catText, category === 'SERVICE' && styles.catTextActive]}>
              Service / Consulting
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setCategory('PRODUCT')}
            style={[styles.catBtn, category === 'PRODUCT' && styles.catBtnActive]}
          >
            <Text style={[styles.catText, category === 'PRODUCT' && styles.catTextActive]}>
              Physical Product
            </Text>
          </TouchableOpacity>
        </View>

        <Card variant="elevated" padding={16} style={styles.card}>
          <Input
            label="Item / Service Name"
            placeholder="e.g. Website Design or Hourly Consulting"
            value={name}
            onChangeText={setName}
            required
          />
          <Input
            label="SKU / Item Code (Optional)"
            placeholder="e.g. SRV-01"
            value={sku}
            onChangeText={setSku}
          />
          <Input
            label="Description"
            placeholder="Detailed description for the invoice line..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            inputStyle={{ minHeight: 60 }}
          />
        </Card>

        <Card variant="elevated" padding={16} style={styles.card}>
          <Text style={styles.sectionHeading}>Pricing & Tax</Text>
          <View style={styles.row}>
            <View style={styles.col}>
              <Input
                label="Unit Price / Rate"
                placeholder="0.00"
                value={rate}
                onChangeText={setRate}
                keyboardType="decimal-pad"
                prefix={activeOrg?.currencySymbol || '$'}
                required
              />
            </View>
            <View style={styles.gap} />
            <View style={styles.col}>
              <Input
                label="Default Tax Rate (%)"
                placeholder="0"
                value={taxRate}
                onChangeText={setTaxRate}
                keyboardType="decimal-pad"
                suffix="%"
              />
            </View>
          </View>

          <Text style={styles.unitLabel}>Unit of Measurement</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.unitList}>
            {units.map((u) => (
              <TouchableOpacity
                key={u}
                onPress={() => setUnit(u)}
                style={[styles.unitChip, unit === u && styles.unitChipActive]}
              >
                <Text style={[styles.unitChipText, unit === u && styles.unitChipTextActive]}>
                  {u}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Card>

        <Button
          title={itemId ? 'Update Item' : 'Save Item to Catalog'}
          onPress={handleSave}
          loading={loading}
          size="lg"
          fullWidth
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
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  catBtnActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  catText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  catTextActive: {
    color: colors.primaryDarker,
    fontWeight: '700',
  },
  card: {
    marginBottom: 14,
  },
  sectionHeading: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
  },
  col: {
    flex: 1,
  },
  gap: {
    width: 12,
  },
  unitLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 8,
  },
  unitList: {
    flexDirection: 'row',
  },
  unitChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: colors.gray100,
    marginRight: 8,
  },
  unitChipActive: {
    backgroundColor: colors.primary,
  },
  unitChipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  unitChipTextActive: {
    color: '#FFFFFF',
  },
  saveBtn: {
    marginTop: 8,
    marginBottom: 24,
  },
});
