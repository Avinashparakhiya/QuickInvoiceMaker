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
import { useNavigation } from '@react-navigation/native';
import { Plus, Trash2, User, Package, Calendar } from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { BottomSheet } from '../../components/common/BottomSheet';
import { AmbientBackground } from '../../components/common/ScreenBackground';
import { useOrgStore } from '../../store/useOrgStore';
import { customerRepository } from '../../database/repositories/customerRepository';
import { itemRepository } from '../../database/repositories/itemRepository';
import { estimateRepository } from '../../database/repositories/estimateRepository';
import { orgRepository } from '../../database/repositories/orgRepository';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { formatCurrency } from '../../utils/currency';
import { useResponsive } from '../../utils/useResponsive';
import { format, addDays } from 'date-fns';
import { Customer, Item, EstimateItem } from '../../types';

export const EstimateCreateScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { activeOrg } = useOrgStore();
  const { contentMaxWidth } = useResponsive();

  const [estimateNumber, setEstimateNumber] = useState('EST-101');
  const [issueDate, setIssueDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [expiryDate, setExpiryDate] = useState(format(addDays(new Date(), 14), 'yyyy-MM-dd'));
  
  // Customers
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerPickerVisible, setCustomerPickerVisible] = useState(false);

  // Catalog items
  const [catalogItems, setCatalogItems] = useState<Item[]>([]);
  const [itemPickerVisible, setItemPickerVisible] = useState(false);

  // Line items
  const [items, setItems] = useState<Array<{
    itemId?: string;
    description: string;
    unit: string;
    quantity: number;
    rate: number;
    taxRate: number;
    discountRate: number;
    lineTotal: number;
  }>>([
    {
      description: 'Consulting & Implementation Scope',
      unit: 'hrs',
      quantity: 10,
      rate: 120,
      taxRate: 0,
      discountRate: 0,
      lineTotal: 1200,
    },
  ]);

  // Notes & terms
  const [notes, setNotes] = useState('Thank you for considering our proposal. We look forward to working with you.');
  const [terms, setTerms] = useState('Proposal valid for 14 days from issue date. 50% deposit required upon acceptance.');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (activeOrg) {
      customerRepository.getByOrg(activeOrg.id).then((custs) => {
        setCustomers(custs);
        if (custs.length > 0) setSelectedCustomer(custs[0]);
      });

      itemRepository.getByOrg(activeOrg.id).then(setCatalogItems);

      const nextNum = activeOrg.estimateNextNumber || 101;
      setEstimateNumber(`${activeOrg.estimatePrefix || 'EST-'}${nextNum}`);
    }
  }, [activeOrg?.id]);

  const recalculateLineTotal = (qty: number, rate: number, taxRate: number, discRate: number) => {
    const base = qty * rate;
    const discount = (base * (discRate || 0)) / 100;
    const discounted = base - discount;
    const tax = (discounted * (taxRate || 0)) / 100;
    return discounted + tax;
  };

  const handleUpdateItem = (index: number, field: string, val: any) => {
    const updated = [...items];
    const current = { ...updated[index], [field]: val };
    current.lineTotal = recalculateLineTotal(
      Number(current.quantity) || 0,
      Number(current.rate) || 0,
      Number(current.taxRate) || 0,
      Number(current.discountRate) || 0
    );
    updated[index] = current;
    setItems(updated);
  };

  const handleAddItem = (catalogItem?: Item) => {
    if (catalogItem) {
      const newLine = {
        itemId: catalogItem.id,
        description: catalogItem.name,
        unit: catalogItem.unit || 'pcs',
        quantity: 1,
        rate: catalogItem.rate || 0,
        taxRate: catalogItem.taxRate || 0,
        discountRate: 0,
        lineTotal: catalogItem.rate || 0,
      };
      setItems([...items, newLine]);
      setItemPickerVisible(false);
    } else {
      setItems([
        ...items,
        {
          description: '',
          unit: 'pcs',
          quantity: 1,
          rate: 0,
          taxRate: 0,
          discountRate: 0,
          lineTotal: 0,
        },
      ]);
    }
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      Alert.alert('Notice', 'An estimate must have at least one line item.');
      return;
    }
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

  // Math totals
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const totalDiscount = items.reduce((sum, item) => sum + ((item.quantity * item.rate * (item.discountRate || 0)) / 100), 0);
  const totalTax = items.reduce((sum, item) => {
    const discounted = (item.quantity * item.rate) - ((item.quantity * item.rate * (item.discountRate || 0)) / 100);
    return sum + ((discounted * (item.taxRate || 0)) / 100);
  }, 0);
  const grandTotal = subtotal - totalDiscount + totalTax;

  const handleSave = async () => {
    if (!activeOrg) return;
    if (!selectedCustomer) {
      Alert.alert('Validation Error', 'Please select or create a customer.');
      return;
    }
    if (items.some((i) => !i.description.trim())) {
      Alert.alert('Validation Error', 'Please provide a description for all items.');
      return;
    }

    setSaving(true);
    try {
      const estimateId = `est-${Date.now()}`;
      const estimate = await estimateRepository.create(
        {
          id: estimateId,
          organizationId: activeOrg.id,
          customerId: selectedCustomer.id,
          estimateNumber,
          issueDate,
          expiryDate,
          status: 'DRAFT',
          templateId: activeOrg.defaultTemplateId || 'classic_green',
          currencyCode: activeOrg.currencyCode || 'USD',
          currencySymbol: activeOrg.currencySymbol || '$',
          subtotal,
          discountAmount: totalDiscount,
          taxAmount: totalTax,
          shippingCharge: 0,
          totalAmount: grandTotal,
          notes,
          termsConditions: terms,
        },
        items.map((it, idx) => ({
          itemId: it.itemId,
          description: it.description,
          unit: it.unit,
          quantity: it.quantity,
          rate: it.rate,
          taxRate: it.taxRate,
          discountRate: it.discountRate,
          lineTotal: it.lineTotal,
          sortOrder: idx,
        }))
      );

      // Increment estimate counter
      await orgRepository.incrementNextEstimateNumber(activeOrg.id);

      Alert.alert(
        'Estimate Created',
        `Estimate ${estimate.estimateNumber} created successfully!`,
        [
          {
            text: 'View Details',
            onPress: () =>
              navigation.replace('EstimateDetail', { estimateId: estimate.id }),
          },
          {
            text: 'Done',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Save Error', err.message || 'Unable to save estimate.');
    } finally {
      setSaving(false);
    }
  };

  const currencySymbol = activeOrg?.currencySymbol || '$';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <AmbientBackground />
      <Header title="Create Estimate / Quote" showBack onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={[styles.scrollContent, { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' }]} showsVerticalScrollIndicator={false}>
        {/* Estimate Details */}
        <Card variant="elevated" padding={16} style={styles.card}>
          <Text style={styles.sectionHeading}>Estimate Details</Text>
          <Input label="Estimate Number" value={estimateNumber} onChangeText={setEstimateNumber} />
          
          <View style={styles.row}>
            <View style={styles.col}>
              <Input label="Issue Date" value={issueDate} onChangeText={setIssueDate} />
            </View>
            <View style={styles.gap} />
            <View style={styles.col}>
              <Input label="Valid Until / Expiry" value={expiryDate} onChangeText={setExpiryDate} />
            </View>
          </View>
        </Card>

        {/* Customer Selector */}
        <Card variant="elevated" padding={16} style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.sectionHeading}>Proposed For (Client)</Text>
            <TouchableOpacity onPress={() => navigation.navigate('CustomerForm', {})}>
              <Text style={styles.quickAddText}>+ New Client</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.customerSelector}
            onPress={() => setCustomerPickerVisible(true)}
          >
            <User size={20} color={colors.primaryDark} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.customerSelectedName}>
                {selectedCustomer?.name || 'Tap to select client'}
              </Text>
              {selectedCustomer?.email ? (
                <Text style={styles.customerSelectedEmail}>{selectedCustomer.email}</Text>
              ) : null}
            </View>
            <Text style={styles.changeText}>Change</Text>
          </TouchableOpacity>
        </Card>

        {/* Line Items */}
        <Card variant="elevated" padding={16} style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.sectionHeading}>Proposed Scope & Items</Text>
            <TouchableOpacity onPress={() => setItemPickerVisible(true)}>
              <Text style={styles.quickAddText}>+ From Catalog</Text>
            </TouchableOpacity>
          </View>

          {items.map((item, index) => (
            <View key={index} style={styles.itemBox}>
              <View style={styles.itemBoxHeader}>
                <Text style={styles.itemIndex}>Item #{index + 1}</Text>
                {items.length > 1 && (
                  <TouchableOpacity onPress={() => handleRemoveItem(index)}>
                    <Trash2 size={16} color={colors.danger} />
                  </TouchableOpacity>
                )}
              </View>

              <Input
                placeholder="Item / Service description..."
                value={item.description}
                onChangeText={(v) => handleUpdateItem(index, 'description', v)}
                containerStyle={{ marginBottom: 8 }}
              />

              <View style={styles.row}>
                <View style={{ flex: 1.5 }}>
                  <Input
                    label="Qty"
                    value={item.quantity.toString()}
                    onChangeText={(v) => handleUpdateItem(index, 'quantity', parseFloat(v) || 0)}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={styles.gap} />
                <View style={{ flex: 1.5 }}>
                  <Input
                    label="Unit"
                    value={item.unit}
                    onChangeText={(v) => handleUpdateItem(index, 'unit', v)}
                  />
                </View>
                <View style={styles.gap} />
                <View style={{ flex: 2 }}>
                  <Input
                    label="Rate"
                    value={item.rate.toString()}
                    onChangeText={(v) => handleUpdateItem(index, 'rate', parseFloat(v) || 0)}
                    keyboardType="decimal-pad"
                    prefix={currencySymbol}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.col}>
                  <Input
                    label="Tax (%)"
                    value={item.taxRate.toString()}
                    onChangeText={(v) => handleUpdateItem(index, 'taxRate', parseFloat(v) || 0)}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={styles.gap} />
                <View style={styles.col}>
                  <Input
                    label="Line Total"
                    value={formatCurrency(item.lineTotal, currencySymbol)}
                    editable={false}
                  />
                </View>
              </View>
            </View>
          ))}

          <Button
            title="+ Add Custom Line Item"
            variant="outline"
            size="sm"
            onPress={() => handleAddItem()}
            style={{ marginTop: 8 }}
          />
        </Card>

        {/* Totals Summary */}
        <Card variant="softGreen" padding={16} style={styles.card}>
          <Text style={styles.sectionHeading}>Estimate Financials</Text>
          
          <View style={styles.totalRow}>
            <Text style={styles.totalRowLabel}>Subtotal</Text>
            <Text style={styles.totalRowValue}>{formatCurrency(subtotal, currencySymbol)}</Text>
          </View>

          {totalTax > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalRowLabel}>Estimated Tax</Text>
              <Text style={styles.totalRowValue}>{formatCurrency(totalTax, currencySymbol)}</Text>
            </View>
          )}

          <View style={[styles.totalRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>Estimated Total</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(grandTotal, currencySymbol)}</Text>
          </View>
        </Card>

        {/* Notes & Terms */}
        <Card variant="elevated" padding={16} style={styles.card}>
          <Text style={styles.sectionHeading}>Terms & Notes</Text>
          <Input
            label="Proposal Notes"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={2}
          />
          <Input
            label="Terms & Validity"
            value={terms}
            onChangeText={setTerms}
            multiline
            numberOfLines={2}
          />
        </Card>

        <Button
          title="Save & Finalize Estimate"
          onPress={handleSave}
          loading={saving}
          size="lg"
          fullWidth
          style={{ marginTop: 8, marginBottom: 40 }}
        />
      </ScrollView>

      {/* Customer Picker Bottom Sheet */}
      <BottomSheet
        visible={customerPickerVisible}
        onClose={() => setCustomerPickerVisible(false)}
        title="Select Client"
      >
        <ScrollView style={{ maxHeight: 350 }}>
          {customers.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={styles.pickerItem}
              onPress={() => {
                setSelectedCustomer(c);
                setCustomerPickerVisible(false);
              }}
            >
              <View>
                <Text style={styles.pickerTitle}>{c.name}</Text>
                <Text style={styles.pickerSubtitle}>{c.email || c.phone || 'No contact details'}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </BottomSheet>

      {/* Item Catalog Picker Bottom Sheet */}
      <BottomSheet
        visible={itemPickerVisible}
        onClose={() => setItemPickerVisible(false)}
        title="Pick from Catalog"
      >
        <ScrollView style={{ maxHeight: 350 }}>
          {catalogItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.pickerItem}
              onPress={() => handleAddItem(item)}
            >
              <View>
                <Text style={styles.pickerTitle}>{item.name}</Text>
                <Text style={styles.pickerSubtitle}>
                  {formatCurrency(item.rate, currencySymbol)} / {item.unit}
                </Text>
              </View>
              <Plus size={18} color={colors.primaryDarker} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </BottomSheet>
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
  },
  card: {
    marginBottom: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeading: {
    ...typography.h3,
    color: colors.text,
  },
  quickAddText: {
    ...typography.caption,
    color: colors.primaryDarker,
    fontWeight: '700',
  },
  customerSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardPressed,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  customerSelectedName: {
    ...typography.bodySemiBold,
    color: colors.text,
  },
  customerSelectedEmail: {
    ...typography.captionRegular,
    color: colors.textSecondary,
    marginTop: 2,
  },
  changeText: {
    ...typography.caption,
    color: colors.primaryDarker,
    fontWeight: '700',
  },
  itemBox: {
    backgroundColor: colors.cardPressed,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  itemBoxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemIndex: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
  },
  col: {
    flex: 1,
  },
  gap: {
    width: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  totalRowLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  totalRowValue: {
    ...typography.bodySemiBold,
    color: colors.text,
  },
  grandTotalRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(34, 197, 94, 0.3)',
    paddingTop: 8,
    marginTop: 6,
  },
  grandTotalLabel: {
    ...typography.bodySemiBold,
    color: colors.text,
    fontSize: 16,
  },
  grandTotalValue: {
    ...typography.h2,
    color: colors.primaryDarker,
  },
  pickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  pickerTitle: {
    ...typography.bodySemiBold,
    color: colors.text,
  },
  pickerSubtitle: {
    ...typography.captionRegular,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
