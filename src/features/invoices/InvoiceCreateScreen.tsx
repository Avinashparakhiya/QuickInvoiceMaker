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
import {
  Plus,
  Trash2,
  UserPlus,
  Calendar,
  DollarSign,
  Palette,
  Eye,
  Check,
} from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { BottomSheet } from '../../components/common/BottomSheet';
import { useOrgStore } from '../../store/useOrgStore';
import { useInvoiceStore } from '../../store/useInvoiceStore';
import { customerRepository } from '../../database/repositories/customerRepository';
import { itemRepository } from '../../database/repositories/itemRepository';
import { orgRepository } from '../../database/repositories/orgRepository';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { formatCurrency } from '../../utils/currency';
import { format, addDays } from 'date-fns';
import { Customer, Item, InvoiceItem, TemplateId, PaymentTerms } from '../../types';

export const InvoiceCreateScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { activeOrg } = useOrgStore();
  const { createInvoice } = useInvoiceStore();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [catalogItems, setCatalogItems] = useState<Item[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [issueDate, setIssueDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dueDate, setDueDate] = useState(format(addDays(new Date(), 30), 'yyyy-MM-dd'));
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerms>('NET_30');
  const [templateId, setTemplateId] = useState<TemplateId>('classic_green');
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');
  const [loading, setLoading] = useState(false);

  // Line items
  const [lineItems, setLineItems] = useState<
    {
      itemId?: string;
      description: string;
      unit: string;
      quantity: number;
      rate: number;
      discountRate: number;
      taxRate: number;
      lineTotal: number;
    }[]
  >([]);

  // Customer picker modal
  const [customerPickerVisible, setCustomerPickerVisible] = useState(false);
  // Item picker modal
  const [itemPickerVisible, setItemPickerVisible] = useState(false);
  // Template picker modal
  const [templatePickerVisible, setTemplatePickerVisible] = useState(false);

  useEffect(() => {
    if (activeOrg) {
      loadInitialData();
    }
  }, [activeOrg?.id]);

  const loadInitialData = async () => {
    if (!activeOrg) return;
    const custs = await customerRepository.getByOrg(activeOrg.id);
    const itms = await itemRepository.getByOrg(activeOrg.id);
    setCustomers(custs);
    setCatalogItems(itms);

    if (custs.length > 0) {
      setSelectedCustomer(custs[0]);
    }

    const nextNum = activeOrg.invoiceNextNumber || 1001;
    const padded = nextNum.toString().padStart(activeOrg.invoicePadding || 4, '0');
    setInvoiceNumber(`${activeOrg.invoicePrefix || 'INV-'}${padded}`);
    setTemplateId(activeOrg.defaultTemplateId || 'classic_green');
    setNotes(activeOrg.defaultNotes || '');
    setTerms(activeOrg.defaultTerms || '');

    // Add default line item
    if (itms.length > 0) {
      const first = itms[0];
      const lineTax = (first.rate * first.taxRate) / 100;
      setLineItems([
        {
          itemId: first.id,
          description: first.name,
          unit: first.unit || 'pcs',
          quantity: 1,
          rate: first.rate,
          discountRate: 0,
          taxRate: first.taxRate,
          lineTotal: first.rate + lineTax,
        },
      ]);
    } else {
      setLineItems([
        {
          description: 'Consulting Services',
          unit: 'hrs',
          quantity: 10,
          rate: 100,
          discountRate: 0,
          taxRate: 10,
          lineTotal: 1100,
        },
      ]);
    }
  };

  const handleAddItemFromCatalog = (item: Item) => {
    const rawTotal = item.rate * 1;
    const taxAmt = (rawTotal * item.taxRate) / 100;
    setLineItems([
      ...lineItems,
      {
        itemId: item.id,
        description: item.name,
        unit: item.unit || 'pcs',
        quantity: 1,
        rate: item.rate,
        discountRate: 0,
        taxRate: item.taxRate,
        lineTotal: rawTotal + taxAmt,
      },
    ]);
    setItemPickerVisible(false);
  };

  const handleAddCustomLine = () => {
    setLineItems([
      ...lineItems,
      {
        description: '',
        unit: 'pcs',
        quantity: 1,
        rate: 0,
        discountRate: 0,
        taxRate: 0,
        lineTotal: 0,
      },
    ]);
  };

  const updateLineItem = (index: number, updates: Partial<(typeof lineItems)[0]>) => {
    const updated = [...lineItems];
    const item = { ...updated[index], ...updates };

    const rawTotal = item.quantity * item.rate;
    const discountAmt = (rawTotal * (item.discountRate || 0)) / 100;
    const taxable = rawTotal - discountAmt;
    const taxAmt = (taxable * (item.taxRate || 0)) / 100;

    item.lineTotal = taxable + taxAmt;
    updated[index] = item;
    setLineItems(updated);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length <= 1) {
      Alert.alert('Required', 'An invoice must have at least one line item.');
      return;
    }
    const updated = lineItems.filter((_, i) => i !== index);
    setLineItems(updated);
  };

  // Calculations
  const subtotal = lineItems.reduce((sum, item) => {
    const raw = item.quantity * item.rate;
    const disc = (raw * (item.discountRate || 0)) / 100;
    return sum + (raw - disc);
  }, 0);

  const totalTax = lineItems.reduce((sum, item) => {
    const raw = item.quantity * item.rate;
    const disc = (raw * (item.discountRate || 0)) / 100;
    const taxable = raw - disc;
    return sum + (taxable * (item.taxRate || 0)) / 100;
  }, 0);

  const grandTotal = subtotal + totalTax;

  const handleSaveInvoice = async () => {
    if (!selectedCustomer) {
      Alert.alert('Required', 'Please select or create a customer.');
      return;
    }
    if (!invoiceNumber.trim()) {
      Alert.alert('Required', 'Please enter an invoice number.');
      return;
    }
    if (!activeOrg) {
      Alert.alert('Error', 'No active business profile.');
      return;
    }

    setLoading(true);
    try {
      const invId = `inv-${Date.now()}`;
      const created = await createInvoice(
        {
          id: invId,
          organizationId: activeOrg.id,
          customerId: selectedCustomer.id,
          invoiceNumber,
          poNumber,
          issueDate,
          dueDate,
          paymentTerms,
          status: 'UNPAID',
          templateId,
          currencyCode: activeOrg.currencyCode,
          currencySymbol: activeOrg.currencySymbol,
          subtotal,
          discountType: 'PERCENTAGE',
          discountValue: 0,
          discountAmount: 0,
          taxAmount: totalTax,
          shippingCharge: 0,
          adjustmentAmount: 0,
          totalAmount: grandTotal,
          paidAmount: 0,
          balanceDue: grandTotal,
          notes,
          termsConditions: terms,
          upiQrEnabled: true,
          signatureEnabled: true,
        },
        lineItems.map((item, idx) => ({
          itemId: item.itemId,
          description: item.description || 'Service',
          unit: item.unit,
          quantity: item.quantity,
          rate: item.rate,
          discountRate: item.discountRate,
          taxRate: item.taxRate,
          taxAmount: ((item.quantity * item.rate * (1 - item.discountRate / 100)) * item.taxRate) / 100,
          lineTotal: item.lineTotal,
          sortOrder: idx,
        }))
      );

      // Increment next invoice number in org
      await orgRepository.incrementNextInvoiceNumber(activeOrg.id);

      Alert.alert('Invoice Created!', `Invoice ${invoiceNumber} created successfully.`, [
        {
          text: 'View Invoice',
          onPress: () => navigation.replace('InvoiceDetail', { invoiceId: created.id }),
        },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create invoice.');
    } finally {
      setLoading(false);
    }
  };

  const templates: { id: TemplateId; name: string; desc: string }[] = [
    { id: 'classic_green', name: '01 Classic Green', desc: 'Default clean emerald banner' },
    { id: 'minimal_slate', name: '02 Minimal Slate', desc: 'Thin lines, pure white' },
    { id: 'modern_card', name: '03 Modern Card', desc: 'Rounded boxes, elevated cards' },
    { id: 'business_pro', name: '04 Business Pro', desc: 'Corporate deep navy/slate' },
    { id: 'gst_india', name: '05 GST Business', desc: 'India HSN/SAC & GST format' },
    { id: 'service_detailed', name: '06 Service & Hourly', desc: 'Emphasis on timesheets/tasks' },
    { id: 'retail_compact', name: '07 Retail Compact', desc: 'Dense items table with SKU' },
    { id: 'freelancer_chic', name: '08 Freelancer Chic', desc: 'Avatar, portfolio layout' },
    { id: 'editorial_serif', name: '09 Elegant Serif', desc: 'Luxury brand editorial look' },
    { id: 'bold_contrast', name: '10 Bold Contrast', desc: 'High contrast black & green' },
    { id: 'receipt_slip', name: '11 Compact Receipt', desc: 'Narrow single-page thermal style' },
    { id: 'simple_sage', name: '12 Simple Sage', desc: 'Fast everyday trades layout' },
  ];

  const currencySymbol = activeOrg?.currencySymbol || '$';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Header
        title="Create Invoice"
        showBack
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            onPress={() => setTemplatePickerVisible(true)}
            style={styles.templatePickerTrigger}
          >
            <Palette size={18} color={colors.primaryDark} />
            <Text style={styles.templateTriggerText}>Template</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Customer Selector Card */}
        <Card variant="elevated" padding={16} style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.sectionHeading}>Customer / Client</Text>
            <TouchableOpacity
              onPress={() => setCustomerPickerVisible(true)}
              style={styles.changeBtn}
            >
              <Text style={styles.changeBtnText}>Change</Text>
            </TouchableOpacity>
          </View>

          {selectedCustomer ? (
            <View style={styles.custSelectedContainer}>
              <View style={styles.custAvatar}>
                <Text style={styles.custAvatarText}>
                  {selectedCustomer.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.custDetails}>
                <Text style={styles.custName}>{selectedCustomer.name}</Text>
                {selectedCustomer.companyName ? (
                  <Text style={styles.custCompany}>{selectedCustomer.companyName}</Text>
                ) : null}
                <Text style={styles.custEmail}>{selectedCustomer.email || 'No email specified'}</Text>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => setCustomerPickerVisible(true)}
              style={styles.pickCustBtn}
            >
              <UserPlus size={20} color={colors.primaryDark} />
              <Text style={styles.pickCustText}>Select or Add Customer</Text>
            </TouchableOpacity>
          )}
        </Card>

        {/* Invoice Meta */}
        <Card variant="elevated" padding={16} style={styles.card}>
          <Text style={styles.sectionHeading}>Invoice Details</Text>
          <View style={styles.row}>
            <View style={styles.col}>
              <Input
                label="Invoice Number"
                value={invoiceNumber}
                onChangeText={setInvoiceNumber}
                required
              />
            </View>
            <View style={styles.gap} />
            <View style={styles.col}>
              <Input
                label="PO / Ref # (Optional)"
                placeholder="PO-001"
                value={poNumber}
                onChangeText={setPoNumber}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Input
                label="Issue Date"
                value={issueDate}
                onChangeText={setIssueDate}
              />
            </View>
            <View style={styles.gap} />
            <View style={styles.col}>
              <Input
                label="Due Date"
                value={dueDate}
                onChangeText={setDueDate}
              />
            </View>
          </View>
        </Card>

        {/* Line Items Section */}
        <Card variant="elevated" padding={16} style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.sectionHeading}>Items & Services ({lineItems.length})</Text>
            <TouchableOpacity
              onPress={() => setItemPickerVisible(true)}
              style={styles.changeBtn}
            >
              <Text style={styles.changeBtnText}>+ From Catalog</Text>
            </TouchableOpacity>
          </View>

          {lineItems.map((item, idx) => (
            <View key={idx} style={styles.itemBox}>
              <View style={styles.itemBoxHeader}>
                <Text style={styles.itemBoxIndex}>Item #{idx + 1}</Text>
                <TouchableOpacity onPress={() => removeLineItem(idx)}>
                  <Trash2 size={16} color={colors.danger} />
                </TouchableOpacity>
              </View>

              <Input
                placeholder="Description of item or service..."
                value={item.description}
                onChangeText={(val) => updateLineItem(idx, { description: val })}
              />

              <View style={styles.row}>
                <View style={[styles.col, { flex: 1.2 }]}>
                  <Input
                    label="Qty"
                    value={item.quantity.toString()}
                    onChangeText={(val) => updateLineItem(idx, { quantity: parseFloat(val) || 0 })}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={styles.gap} />
                <View style={[styles.col, { flex: 1.5 }]}>
                  <Input
                    label="Rate"
                    value={item.rate.toString()}
                    onChangeText={(val) => updateLineItem(idx, { rate: parseFloat(val) || 0 })}
                    keyboardType="decimal-pad"
                    prefix={currencySymbol}
                  />
                </View>
                <View style={styles.gap} />
                <View style={[styles.col, { flex: 1.2 }]}>
                  <Input
                    label="Tax %"
                    value={item.taxRate.toString()}
                    onChangeText={(val) => updateLineItem(idx, { taxRate: parseFloat(val) || 0 })}
                    keyboardType="decimal-pad"
                    suffix="%"
                  />
                </View>
              </View>

              <View style={styles.itemTotalRow}>
                <Text style={styles.itemTotalLabel}>Line Total:</Text>
                <Text style={styles.itemTotalValue}>
                  {formatCurrency(item.lineTotal, currencySymbol)}
                </Text>
              </View>
            </View>
          ))}

          <Button
            title="+ Add Custom Item Line"
            onPress={handleAddCustomLine}
            variant="secondary"
            size="sm"
            style={{ marginTop: 8 }}
          />
        </Card>

        {/* Totals Summary Card */}
        <Card variant="softGreen" padding={18} style={styles.card}>
          <Text style={styles.sectionHeading}>Summary & Totals</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{formatCurrency(subtotal, currencySymbol)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax Total</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalTax, currencySymbol)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Grand Total</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(grandTotal, currencySymbol)}</Text>
          </View>
        </Card>

        {/* Notes & Terms */}
        <Card variant="elevated" padding={16} style={styles.card}>
          <Text style={styles.sectionHeading}>Notes & Payment Terms</Text>
          <Input
            label="Customer Notes"
            placeholder="Thank you for your business!"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={2}
          />
          <Input
            label="Terms & Conditions"
            placeholder="Payment due within 30 days..."
            value={terms}
            onChangeText={setTerms}
            multiline
            numberOfLines={2}
          />
        </Card>

        <Button
          title="Create & Save Invoice"
          onPress={handleSaveInvoice}
          loading={loading}
          size="lg"
          fullWidth
          style={styles.submitBtn}
        />
      </ScrollView>

      {/* Customer Picker Modal */}
      <BottomSheet
        visible={customerPickerVisible}
        onClose={() => setCustomerPickerVisible(false)}
        title="Select Customer"
      >
        {customers.map((c) => (
          <TouchableOpacity
            key={c.id}
            activeOpacity={0.7}
            onPress={() => {
              setSelectedCustomer(c);
              setCustomerPickerVisible(false);
            }}
            style={styles.pickerRow}
          >
            <View style={styles.custAvatar}>
              <Text style={styles.custAvatarText}>{c.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.pickerInfo}>
              <Text style={styles.pickerTitle}>{c.name}</Text>
              <Text style={styles.pickerSub}>{c.companyName || c.email || 'No details'}</Text>
            </View>
            {selectedCustomer?.id === c.id ? (
              <Check size={18} color={colors.primary} />
            ) : null}
          </TouchableOpacity>
        ))}

        <Button
          title="+ Add New Customer"
          onPress={() => {
            setCustomerPickerVisible(false);
            navigation.navigate('CustomerForm', {});
          }}
          variant="secondary"
          size="md"
          style={{ marginTop: 12 }}
        />
      </BottomSheet>

      {/* Item Catalog Picker Modal */}
      <BottomSheet
        visible={itemPickerVisible}
        onClose={() => setItemPickerVisible(false)}
        title="Select from Catalog"
      >
        {catalogItems.map((itm) => (
          <TouchableOpacity
            key={itm.id}
            activeOpacity={0.7}
            onPress={() => handleAddItemFromCatalog(itm)}
            style={styles.pickerRow}
          >
            <View style={styles.pickerInfo}>
              <Text style={styles.pickerTitle}>{itm.name}</Text>
              <Text style={styles.pickerSub}>
                {formatCurrency(itm.rate, currencySymbol)} / {itm.unit} • Tax {itm.taxRate}%
              </Text>
            </View>
            <Plus size={18} color={colors.primaryDark} />
          </TouchableOpacity>
        ))}

        <Button
          title="+ Add New Item to Catalog"
          onPress={() => {
            setItemPickerVisible(false);
            navigation.navigate('ItemForm', {});
          }}
          variant="secondary"
          size="md"
          style={{ marginTop: 12 }}
        />
      </BottomSheet>

      {/* Template Selector Modal */}
      <BottomSheet
        visible={templatePickerVisible}
        onClose={() => setTemplatePickerVisible(false)}
        title="Choose Invoice Template"
        subtitle="12 pixel-perfect styles available"
      >
        {templates.map((tpl) => (
          <TouchableOpacity
            key={tpl.id}
            activeOpacity={0.7}
            onPress={() => {
              setTemplateId(tpl.id);
              setTemplatePickerVisible(false);
            }}
            style={[
              styles.pickerRow,
              templateId === tpl.id && styles.templateRowSelected,
            ]}
          >
            <View style={styles.pickerInfo}>
              <Text style={[styles.pickerTitle, templateId === tpl.id && { color: colors.primaryDarker }]}>
                {tpl.name}
              </Text>
              <Text style={styles.pickerSub}>{tpl.desc}</Text>
            </View>
            {templateId === tpl.id ? (
              <Check size={18} color={colors.primary} />
            ) : null}
          </TouchableOpacity>
        ))}
      </BottomSheet>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  templatePickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    gap: 4,
  },
  templateTriggerText: {
    ...typography.micro,
    color: colors.primaryDarker,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    marginBottom: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionHeading: {
    ...typography.h3,
    color: colors.text,
  },
  changeBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: colors.primarySoft,
  },
  changeBtnText: {
    ...typography.micro,
    color: colors.primaryDarker,
    fontWeight: '700',
  },
  custSelectedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  custAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  custAvatarText: {
    ...typography.h3,
    color: colors.primaryDarker,
  },
  custDetails: {
    flex: 1,
  },
  custName: {
    ...typography.bodySemiBold,
    color: colors.text,
  },
  custCompany: {
    ...typography.captionRegular,
    color: colors.textSecondary,
  },
  custEmail: {
    ...typography.micro,
    color: colors.textMuted,
  },
  pickCustBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    backgroundColor: colors.backgroundSecondary,
    gap: 8,
  },
  pickCustText: {
    ...typography.bodyMedium,
    color: colors.primaryDarker,
    fontWeight: '600',
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
  itemBox: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.gray50,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 10,
  },
  itemBoxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemBoxIndex: {
    ...typography.micro,
    color: colors.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  itemTotalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  itemTotalLabel: {
    ...typography.captionRegular,
    color: colors.textSecondary,
  },
  itemTotalValue: {
    ...typography.bodySemiBold,
    color: colors.text,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  summaryLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  summaryValue: {
    ...typography.bodySemiBold,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 10,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  grandTotalLabel: {
    ...typography.h3,
    color: colors.text,
  },
  grandTotalValue: {
    ...typography.h2,
    color: colors.primaryDarker,
  },
  submitBtn: {
    marginTop: 8,
    marginBottom: 24,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 8,
  },
  templateRowSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySubtle,
  },
  pickerInfo: {
    flex: 1,
  },
  pickerTitle: {
    ...typography.bodySemiBold,
    color: colors.text,
  },
  pickerSub: {
    ...typography.captionRegular,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
