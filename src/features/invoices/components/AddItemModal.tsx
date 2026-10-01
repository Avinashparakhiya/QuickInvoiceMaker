import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { Plus, Search, Minus, Package, Sparkles } from 'lucide-react-native';
import { BottomSheet } from '../../../components/common/BottomSheet';
import { Button } from '../../../components/common/Button';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { formatCurrency } from '../../../utils/currency';
import { Item } from '../../../types';

interface AddItemModalProps {
  visible: boolean;
  onClose: () => void;
  onAddItem: (item: {
    itemId?: string;
    description: string;
    unit: string;
    quantity: number;
    rate: number;
    discountRate: number;
    taxRate: number;
    lineTotal: number;
  }) => void;
  catalogItems: Item[];
  currencySymbol?: string;
  defaultTaxRate?: number;
}

export const AddItemModal: React.FC<AddItemModalProps> = ({
  visible,
  onClose,
  onAddItem,
  catalogItems,
  currencySymbol = '$',
  defaultTaxRate = 0,
}) => {
  const [activeTab, setActiveTab] = useState<'custom' | 'catalog'>(
    catalogItems.length > 0 ? 'catalog' : 'custom'
  );
  const [searchQuery, setSearchQuery] = useState('');

  // Custom Item Fields
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('pcs');
  const [rate, setRate] = useState('');
  const [discountRate, setDiscountRate] = useState('');
  const [taxRate, setTaxRate] = useState(defaultTaxRate > 0 ? String(defaultTaxRate) : '0');

  const parsedRate = parseFloat(rate) || 0;
  const parsedDiscount = parseFloat(discountRate) || 0;
  const parsedTax = parseFloat(taxRate) || 0;

  const rawTotal = quantity * parsedRate;
  const discountAmount = (rawTotal * parsedDiscount) / 100;
  const taxableAmount = rawTotal - discountAmount;
  const taxAmount = (taxableAmount * parsedTax) / 100;
  const calculatedLineTotal = taxableAmount + taxAmount;

  const handleAddCustomItem = () => {
    if (!description.trim()) {
      return;
    }

    onAddItem({
      description: description.trim(),
      unit: unit || 'pcs',
      quantity: Math.max(1, quantity),
      rate: parsedRate,
      discountRate: parsedDiscount,
      taxRate: parsedTax,
      lineTotal: calculatedLineTotal,
    });

    // Reset fields
    setDescription('');
    setQuantity(1);
    setRate('');
    setDiscountRate('');
    onClose();
  };

  const handleSelectCatalogItem = (item: Item) => {
    const itemRate = item.rate || 0;
    const itemTax = item.taxRate || 0;
    const itemTaxAmt = (itemRate * itemTax) / 100;

    onAddItem({
      itemId: item.id,
      description: item.name,
      unit: item.unit || 'pcs',
      quantity: 1,
      rate: itemRate,
      discountRate: 0,
      taxRate: itemTax,
      lineTotal: itemRate + itemTaxAmt,
    });

    onClose();
  };

  const filteredCatalog = catalogItems.filter((i) =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Add Item"
      subtitle="Select saved product or enter custom service"
    >
      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setActiveTab('catalog')}
          style={[styles.tabBtn, activeTab === 'catalog' && styles.tabBtnActive]}
        >
          <Package size={16} color={activeTab === 'catalog' ? '#15803D' : '#64748B'} />
          <Text style={[styles.tabText, activeTab === 'catalog' && styles.tabTextActive]}>
            From Catalog ({catalogItems.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setActiveTab('custom')}
          style={[styles.tabBtn, activeTab === 'custom' && styles.tabBtnActive]}
        >
          <Sparkles size={16} color={activeTab === 'custom' ? '#15803D' : '#64748B'} />
          <Text style={[styles.tabText, activeTab === 'custom' && styles.tabTextActive]}>
            Custom Item
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'catalog' ? (
        <View style={styles.catalogContainer}>
          {/* Search Box */}
          <View style={styles.searchBox}>
            <Search size={18} color="#94A3B8" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search catalog items..."
              placeholderTextColor="#94A3B8"
              style={styles.searchInput}
            />
          </View>

          <ScrollView style={styles.catalogList} showsVerticalScrollIndicator={false}>
            {filteredCatalog.length === 0 ? (
              <View style={styles.emptyCatalog}>
                <Text style={styles.emptyCatalogText}>No matching catalog items found.</Text>
                <Button
                  title="+ Add as Custom Item"
                  variant="outline"
                  size="sm"
                  onPress={() => {
                    setDescription(searchQuery);
                    setActiveTab('custom');
                  }}
                  style={{ marginTop: 10 }}
                />
              </View>
            ) : (
              filteredCatalog.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.7}
                  onPress={() => handleSelectCatalogItem(item)}
                  style={styles.catalogItemRow}
                >
                  <View style={styles.catalogItemLeft}>
                    <Text style={styles.catalogItemName}>{item.name}</Text>
                    <Text style={styles.catalogItemMeta}>
                      {item.unit || 'pcs'} {item.taxRate > 0 ? `• Tax: ${item.taxRate}%` : ''}
                    </Text>
                  </View>

                  <View style={styles.catalogItemRight}>
                    <Text style={styles.catalogItemRate}>
                      {formatCurrency(item.rate, currencySymbol)}
                    </Text>
                    <View style={styles.addPlusCircle}>
                      <Plus size={14} color="#15803D" strokeWidth={3} />
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      ) : (
        <ScrollView style={styles.customContainer} showsVerticalScrollIndicator={false}>
          {/* Item Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Item Description / Service Name *</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="e.g. Web Design Service, Logo Design"
              placeholderTextColor="#94A3B8"
              style={styles.textInput}
            />
          </View>

          {/* Rate & Unit Row */}
          <View style={styles.formRow}>
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
              <Text style={styles.inputLabel}>Unit</Text>
              <TextInput
                value={unit}
                onChangeText={setUnit}
                placeholder="pcs / hrs"
                placeholderTextColor="#94A3B8"
                style={styles.textInput}
              />
            </View>
          </View>

          {/* Quantity Stepper Row */}
          <View style={styles.stepperRow}>
            <Text style={styles.inputLabel}>Quantity</Text>
            <View style={styles.stepperControls}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                style={styles.stepperBtn}
              >
                <Minus size={16} color="#0F172A" />
              </TouchableOpacity>
              <Text style={styles.stepperValue}>{quantity}</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setQuantity(quantity + 1)}
                style={styles.stepperBtn}
              >
                <Plus size={16} color="#0F172A" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Discount & Tax Row */}
          <View style={styles.formRow}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Discount (%)</Text>
              <TextInput
                value={discountRate}
                onChangeText={setDiscountRate}
                placeholder="0"
                placeholderTextColor="#94A3B8"
                keyboardType="decimal-pad"
                style={styles.textInput}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
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

          {/* Calculated Line Total Preview */}
          <View style={styles.totalPreviewBox}>
            <Text style={styles.totalPreviewLabel}>Line Total:</Text>
            <Text style={styles.totalPreviewAmount}>
              {formatCurrency(calculatedLineTotal, currencySymbol)}
            </Text>
          </View>

          {/* Add Button */}
          <Button
            title="+ Add to Invoice"
            onPress={handleAddCustomItem}
            disabled={!description.trim() || parsedRate <= 0}
            style={styles.addSubmitBtn}
          />
        </ScrollView>
      )}
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 14,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  tabText: {
    ...typography.captionRegular,
    color: '#64748B',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#15803D',
    fontWeight: '700',
  },
  catalogContainer: {
    maxHeight: 380,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: colors.text,
    padding: 0,
  },
  catalogList: {
    maxHeight: 300,
  },
  catalogItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  catalogItemLeft: {
    flex: 1,
    paddingRight: 8,
  },
  catalogItemName: {
    ...typography.bodySemiBold,
    color: colors.text,
    fontSize: 14,
  },
  catalogItemMeta: {
    ...typography.micro,
    color: colors.textSecondary,
    marginTop: 2,
  },
  catalogItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  catalogItemRate: {
    ...typography.bodySemiBold,
    color: colors.text,
    fontSize: 14,
  },
  addPlusCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCatalog: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyCatalogText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  customContainer: {
    maxHeight: 420,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    ...typography.captionRegular,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 6,
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
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 12,
  },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    ...typography.bodySemiBold,
    fontSize: 16,
    color: colors.text,
    minWidth: 24,
    textAlign: 'center',
  },
  totalPreviewBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 10,
  },
  totalPreviewLabel: {
    ...typography.bodySemiBold,
    color: '#15803D',
  },
  totalPreviewAmount: {
    ...typography.h3,
    color: '#15803D',
    fontWeight: '700',
  },
  addSubmitBtn: {
    marginTop: 6,
    marginBottom: 16,
  },
});
