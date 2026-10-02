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
  Plus,
  Minus,
  X,
  UserPlus,
  Calendar,
  DollarSign,
  ChevronDown,
  FileText,
  Building,
  Check,
  Package,
  Palette,
  Eye,
  Share2,
  Printer,
  ChevronRight,
  Edit2,
} from 'lucide-react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { StepProgressBar } from './components/StepProgressBar';
import { AddItemModal } from './components/AddItemModal';
import { QuickCustomerModal } from './components/QuickCustomerModal';
import { InvoiceSuccessModal } from './components/InvoiceSuccessModal';
import { useOrgStore } from '../../store/useOrgStore';
import { useInvoiceStore } from '../../store/useInvoiceStore';
import { customerRepository } from '../../database/repositories/customerRepository';
import { itemRepository } from '../../database/repositories/itemRepository';
import { orgRepository } from '../../database/repositories/orgRepository';
import { buildInvoiceHtml } from '../../pdf/htmlBuilder';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { formatCurrency } from '../../utils/currency';
import { format, addDays } from 'date-fns';
import { Customer, Item, TemplateId, PaymentTerms, Invoice } from '../../types';
import { useResponsive } from '../../utils/useResponsive';

interface LineItemState {
  itemId?: string;
  description: string;
  unit: string;
  quantity: number;
  rate: number;
  discountRate: number;
  taxRate: number;
  lineTotal: number;
}

export const InvoiceCreateScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { contentMaxWidth, isWideScreen } = useResponsive();
  const { activeOrg } = useOrgStore();
  const { createInvoice } = useInvoiceStore();

  // Step state: 0 = Customer & Details, 1 = Items, 2 = Preview
  const [currentStep, setCurrentStep] = useState<number>(0);

  // Data sources
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [catalogItems, setCatalogItems] = useState<Item[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Form Fields
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [issueDate, setIssueDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dueDate, setDueDate] = useState(format(addDays(new Date(), 14), 'yyyy-MM-dd'));
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerms>('NET_15');
  const [templateId, setTemplateId] = useState<TemplateId>('classic_green');
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');
  const [loading, setLoading] = useState(false);

  // Line items
  const [lineItems, setLineItems] = useState<LineItemState[]>([]);

  // Modals
  const [customerModalVisible, setCustomerModalVisible] = useState(false);
  const [addItemModalVisible, setAddItemModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [createdInvoice, setCreatedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    if (activeOrg) {
      loadInitialData();
    }
  }, [activeOrg?.id]);

  const loadInitialData = async () => {
    if (!activeOrg) return;
    const [custs, itms] = await Promise.all([
      customerRepository.getByOrg(activeOrg.id),
      itemRepository.getByOrg(activeOrg.id),
    ]);
    setCustomers(custs);
    setCatalogItems(itms);

    if (custs.length > 0) {
      setSelectedCustomer(custs[0]);
    }

    const nextNum = activeOrg.invoiceNextNumber || 1001;
    const padded = nextNum.toString().padStart(activeOrg.invoicePadding || 4, '0');
    setInvoiceNumber(`${activeOrg.invoicePrefix || 'INV-'}${padded}`);
    setTemplateId(activeOrg.defaultTemplateId || 'classic_green');
    setNotes(activeOrg.defaultNotes || 'Thank you for your business!');
    setTerms(activeOrg.defaultTerms || 'Payment due according to specified terms.');

    const cloneInvoice = route.params?.cloneInvoice as Invoice | undefined;
    if (cloneInvoice) {
      if (cloneInvoice.customerId) {
        const found = custs.find((c) => c.id === cloneInvoice.customerId);
        if (found) setSelectedCustomer(found);
      }
      if (cloneInvoice.items && cloneInvoice.items.length > 0) {
        setLineItems(
          cloneInvoice.items.map((it) => ({
            itemId: it.itemId,
            description: it.description,
            unit: it.unit || 'pcs',
            quantity: it.quantity,
            rate: it.rate,
            discountRate: it.discountRate || 0,
            taxRate: it.taxRate || 0,
            lineTotal: it.lineTotal,
          }))
        );
      }
      if (cloneInvoice.templateId) setTemplateId(cloneInvoice.templateId as TemplateId);
      if (cloneInvoice.paymentTerms) setPaymentTerms(cloneInvoice.paymentTerms as PaymentTerms);
      if (cloneInvoice.notes) setNotes(cloneInvoice.notes);
      if (cloneInvoice.termsConditions) setTerms(cloneInvoice.termsConditions);
    } else {
      // Default sample item if none
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
            description: 'Web Design & Consulting',
            unit: 'hrs',
            quantity: 1,
            rate: 500,
            discountRate: 0,
            taxRate: 10,
            lineTotal: 550,
          },
        ]);
      }
    }
  };

  // Stepper quantity update
  const handleUpdateQty = (index: number, delta: number) => {
    const updated = [...lineItems];
    const current = updated[index];
    const newQty = Math.max(1, current.quantity + delta);

    const rawTotal = newQty * current.rate;
    const disc = (rawTotal * (current.discountRate || 0)) / 100;
    const taxable = rawTotal - disc;
    const taxAmt = (taxable * (current.taxRate || 0)) / 100;

    current.quantity = newQty;
    current.lineTotal = taxable + taxAmt;
    setLineItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    if (lineItems.length <= 1) {
      Alert.alert('Required', 'Invoice must have at least one line item.');
      return;
    }
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleAddItem = (newItem: LineItemState) => {
    setLineItems([...lineItems, newItem]);
  };

  const handlePaymentTermsChange = (termsKey: PaymentTerms) => {
    setPaymentTerms(termsKey);
    const baseDate = new Date(issueDate);
    switch (termsKey) {
      case 'DUE_ON_RECEIPT':
        setDueDate(format(baseDate, 'yyyy-MM-dd'));
        break;
      case 'NET_7':
        setDueDate(format(addDays(baseDate, 7), 'yyyy-MM-dd'));
        break;
      case 'NET_15':
        setDueDate(format(addDays(baseDate, 15), 'yyyy-MM-dd'));
        break;
      case 'NET_30':
        setDueDate(format(addDays(baseDate, 30), 'yyyy-MM-dd'));
        break;
      case 'NET_60':
        setDueDate(format(addDays(baseDate, 60), 'yyyy-MM-dd'));
        break;
    }
  };

  // Calculations
  const subtotal = lineItems.reduce((sum, item) => {
    const raw = item.quantity * item.rate;
    const disc = (raw * (item.discountRate || 0)) / 100;
    return sum + (raw - disc);
  }, 0);

  const totalDiscount = lineItems.reduce((sum, item) => {
    const raw = item.quantity * item.rate;
    return sum + (raw * (item.discountRate || 0)) / 100;
  }, 0);

  const totalTax = lineItems.reduce((sum, item) => {
    const raw = item.quantity * item.rate;
    const disc = (raw * (item.discountRate || 0)) / 100;
    const taxable = raw - disc;
    return sum + (taxable * (item.taxRate || 0)) / 100;
  }, 0);

  const grandTotal = subtotal + totalTax;
  const currencySymbol = activeOrg?.currencySymbol || '$';

  // Step 1 Validation & Proceed
  const handleProceedToStep2 = () => {
    if (!selectedCustomer) {
      Alert.alert('Select Customer', 'Please select or add a customer to continue.');
      return;
    }
    if (!invoiceNumber.trim()) {
      Alert.alert('Invoice Number', 'Please provide an invoice number.');
      return;
    }
    setCurrentStep(1);
  };

  // Step 2 Validation & Proceed
  const handleProceedToStep3 = () => {
    if (lineItems.length === 0) {
      Alert.alert('No Items', 'Please add at least one item to the invoice.');
      return;
    }
    setCurrentStep(2);
  };

  // Step 3: Save Invoice
  const handleSaveInvoice = async () => {
    if (!selectedCustomer || !activeOrg) return;

    setLoading(true);
    try {
      const invId = `inv-${Date.now()}`;
      const newInvoice: any = {
        id: invId,
        organizationId: activeOrg.id,
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        customerEmail: selectedCustomer.email,
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
        discountAmount: totalDiscount,
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
      };

      const created = await createInvoice(
        newInvoice,
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

      // Increment org next invoice number
      await orgRepository.incrementNextInvoiceNumber(activeOrg.id);

      setCreatedInvoice(created);
      setSuccessModalVisible(true);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create invoice.');
    } finally {
      setLoading(false);
    }
  };

  // Share PDF
  const handleSharePdf = async () => {
    if (!createdInvoice && (!activeOrg || !selectedCustomer)) return;
    const inv = createdInvoice || {
      id: 'temp',
      organizationId: activeOrg!.id,
      customerId: selectedCustomer!.id,
      customerName: selectedCustomer!.name,
      customerEmail: selectedCustomer!.email,
      invoiceNumber,
      poNumber,
      issueDate,
      dueDate,
      paymentTerms,
      status: 'UNPAID',
      templateId,
      currencyCode: activeOrg!.currencyCode,
      currencySymbol: activeOrg!.currencySymbol,
      subtotal,
      discountType: 'PERCENTAGE',
      discountValue: 0,
      discountAmount: totalDiscount,
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
      items: lineItems as any,
    } as Invoice;

    try {
      const html = buildInvoiceHtml(inv, activeOrg!, templateId);
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          UTI: '.pdf',
          mimeType: 'application/pdf',
          dialogTitle: `Share Invoice ${inv.invoiceNumber}`,
        });
      }
    } catch (err: any) {
      Alert.alert('Share Error', err.message || 'Failed to share invoice.');
    }
  };

  const handleCreateAnother = () => {
    setSuccessModalVisible(false);
    setCreatedInvoice(null);
    setCurrentStep(0);
    loadInitialData();
  };

  const getScreenTitle = () => {
    switch (currentStep) {
      case 0:
        return 'Create Invoice';
      case 1:
        return 'Add Items';
      case 2:
        return 'Invoice Preview';
      default:
        return 'Create Invoice';
    }
  };

  const handleHeaderBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  const templatesList: { id: TemplateId; name: string }[] = [
    { id: 'classic_green', name: '01 Classic' },
    { id: 'minimal_slate', name: '02 Minimal' },
    { id: 'modern_card', name: '03 Modern' },
    { id: 'business_pro', name: '04 Corporate' },
    { id: 'gst_india', name: '05 GST India' },
    { id: 'service_detailed', name: '06 Service' },
  ];

  return (
    <View style={styles.container}>
      <Header
        title={getScreenTitle()}
        showBack
        onBack={handleHeaderBack}
      />

      {/* Step Progress Bar */}
      <StepProgressBar
        currentStep={currentStep}
        onStepPress={(step) => setCurrentStep(step)}
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { maxWidth: contentMaxWidth }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= STEP 1: CUSTOMER & DETAILS ================= */}
        {currentStep === 0 && (
          <View style={styles.stepContainer}>
            {/* Customer Selection Card */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Select Customer</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setCustomerModalVisible(true)}
              style={styles.customerSelectCard}
            >
              <View style={styles.custAvatarBox}>
                <Text style={styles.custAvatarText}>
                  {selectedCustomer ? selectedCustomer.name.charAt(0).toUpperCase() : '?'}
                </Text>
              </View>

              <View style={styles.custSelectDetails}>
                <Text numberOfLines={1} style={styles.custSelectName}>
                  {selectedCustomer ? selectedCustomer.name : 'Choose a customer'}
                </Text>
                <Text numberOfLines={1} style={styles.custSelectMeta}>
                  {selectedCustomer
                    ? selectedCustomer.email || selectedCustomer.phone || selectedCustomer.companyName || 'No contact info'
                    : 'Tap to pick from list'}
                </Text>
              </View>

              <ChevronDown size={18} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setCustomerModalVisible(true)}
              style={styles.addCustomerLink}
            >
              <UserPlus size={16} color="#15803D" />
              <Text style={styles.addCustomerLinkText}>+ Add New Customer</Text>
            </TouchableOpacity>

            {/* Invoice Details Card */}
            <View style={[styles.sectionHeaderRow, { marginTop: 16 }]}>
              <Text style={styles.sectionTitle}>Invoice Details</Text>
            </View>

            <View style={styles.detailsCard}>
              {/* Invoice Number */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Invoice Number *</Text>
                <TextInput
                  value={invoiceNumber}
                  onChangeText={setInvoiceNumber}
                  placeholder="#INV-0001"
                  placeholderTextColor="#94A3B8"
                  style={styles.textInput}
                />
              </View>

              {/* Invoice Date */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Invoice Date</Text>
                <View style={styles.dateInputContainer}>
                  <TextInput
                    value={issueDate}
                    onChangeText={setIssueDate}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#94A3B8"
                    style={styles.dateInput}
                  />
                  <Calendar size={18} color={colors.textSecondary} />
                </View>
              </View>

              {/* Due Date */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Due Date</Text>
                <View style={styles.dateInputContainer}>
                  <TextInput
                    value={dueDate}
                    onChangeText={setDueDate}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#94A3B8"
                    style={styles.dateInput}
                  />
                  <Calendar size={18} color={colors.textSecondary} />
                </View>
              </View>

              {/* Quick Payment Terms Chips */}
              <View style={styles.termsRow}>
                {(['DUE_ON_RECEIPT', 'NET_7', 'NET_15', 'NET_30'] as PaymentTerms[]).map((term) => {
                  const isSelected = paymentTerms === term;
                  const label =
                    term === 'DUE_ON_RECEIPT'
                      ? 'Receipt'
                      : term === 'NET_7'
                      ? 'Net 7'
                      : term === 'NET_15'
                      ? 'Net 15'
                      : 'Net 30';

                  return (
                    <TouchableOpacity
                      key={term}
                      activeOpacity={0.7}
                      onPress={() => handlePaymentTermsChange(term)}
                      style={[
                        styles.termChip,
                        isSelected && styles.termChipSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.termChipText,
                          isSelected && styles.termChipTextSelected,
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Currency Display */}
              <View style={[styles.fieldGroup, { marginTop: 12 }]}>
                <Text style={styles.fieldLabel}>Currency</Text>
                <View style={styles.currencyDisplayBox}>
                  <Text style={styles.currencyDisplayText}>
                    {activeOrg?.currencyCode || 'USD'} - {activeOrg?.currencySymbol || '$'}
                  </Text>
                  <Badge label="Active Profile" variant="paid" size="sm" />
                </View>
              </View>
            </View>

            {/* Next Button */}
            <Button
              title="Next: Add Items"
              onPress={handleProceedToStep2}
              icon={<ChevronRight size={18} color="#FFFFFF" />}
              style={styles.nextStepBtn}
            />
          </View>
        )}

        {/* ================= STEP 2: ADD ITEMS ================= */}
        {currentStep === 1 && (
          <View style={styles.stepContainer}>
            {/* Customer Summary Bar */}
            <View style={styles.customerSummaryBar}>
              <View style={styles.custSummaryLeft}>
                <Text style={styles.custSummaryLabel}>Billing To:</Text>
                <Text numberOfLines={1} style={styles.custSummaryName}>
                  {selectedCustomer?.name || 'Customer'}
                </Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setCurrentStep(0)}
                style={styles.custSummaryEditBtn}
              >
                <Edit2 size={14} color="#15803D" />
                <Text style={styles.custSummaryEditText}>Edit</Text>
              </TouchableOpacity>
            </View>

            {/* Items List */}
            <View style={styles.itemsListContainer}>
              {lineItems.map((item, index) => {
                const itemBgColors = ['#E0F2FE', '#FEF3C7', '#EDE9FE', '#DCFCE7'];
                const bg = itemBgColors[index % itemBgColors.length];

                return (
                  <View key={index} style={styles.itemCard}>
                    <View style={styles.itemCardTop}>
                      <View style={[styles.itemIconBox, { backgroundColor: bg }]}>
                        <FileText size={18} color="#0F172A" />
                      </View>

                      <View style={styles.itemInfo}>
                        <Text style={styles.itemName}>{item.description || 'Service'}</Text>
                        <Text style={styles.itemRate}>
                          {formatCurrency(item.rate, currencySymbol)} / {item.unit || 'pcs'}
                        </Text>
                      </View>

                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => handleRemoveItem(index)}
                        style={styles.itemRemoveBtn}
                      >
                        <X size={16} color="#94A3B8" />
                      </TouchableOpacity>
                    </View>

                    {/* Stepper and Line Total Row */}
                    <View style={styles.itemCardBottom}>
                      <View style={styles.itemStepperRow}>
                        <Text style={styles.stepperLabel}>Qty:</Text>
                        <View style={styles.itemStepperBox}>
                          <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => handleUpdateQty(index, -1)}
                            style={styles.stepperSubBtn}
                          >
                            <Minus size={14} color="#0F172A" />
                          </TouchableOpacity>
                          <Text style={styles.stepperQtyText}>{item.quantity}</Text>
                          <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => handleUpdateQty(index, 1)}
                            style={styles.stepperSubBtn}
                          >
                            <Plus size={14} color="#0F172A" />
                          </TouchableOpacity>
                        </View>
                      </View>

                      <Text style={styles.itemLineTotal}>
                        {formatCurrency(item.lineTotal, currencySymbol)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Add Item Button */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setAddItemModalVisible(true)}
              style={styles.addItemBtn}
            >
              <Plus size={18} color="#15803D" strokeWidth={2.5} />
              <Text style={styles.addItemBtnText}>+ Add Item</Text>
            </TouchableOpacity>

            {/* Financial Summary Card */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryLine}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryVal}>
                  {formatCurrency(subtotal, currencySymbol)}
                </Text>
              </View>

              {totalDiscount > 0 ? (
                <View style={styles.summaryLine}>
                  <Text style={styles.summaryLabel}>Discount</Text>
                  <Text style={[styles.summaryVal, { color: '#15803D' }]}>
                    -{formatCurrency(totalDiscount, currencySymbol)}
                  </Text>
                </View>
              ) : null}

              <View style={styles.summaryLine}>
                <Text style={styles.summaryLabel}>Tax</Text>
                <Text style={styles.summaryVal}>
                  +{formatCurrency(totalTax, currencySymbol)}
                </Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryTotalLine}>
                <Text style={styles.summaryTotalLabel}>Total</Text>
                <Text style={styles.summaryTotalVal}>
                  {formatCurrency(grandTotal, currencySymbol)}
                </Text>
              </View>
            </View>

            {/* Bottom Actions Row */}
            <View style={styles.buttonRow}>
              <Button
                title="Back"
                variant="outline"
                onPress={() => setCurrentStep(0)}
                style={{ minWidth: 90, marginRight: 10 }}
              />
              <Button
                title="Next: Preview"
                onPress={handleProceedToStep3}
                icon={<ChevronRight size={18} color="#FFFFFF" />}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        )}

        {/* ================= STEP 3: PREVIEW & SAVE ================= */}
        {currentStep === 2 && (
          <View style={styles.stepContainer}>
            {/* Template Selector Strip */}
            <View style={styles.templatePickerBar}>
              <Text style={styles.templatePickerTitle}>Select Template Style:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tplScroll}>
                {templatesList.map((tpl) => {
                  const isSelected = templateId === tpl.id;
                  return (
                    <TouchableOpacity
                      key={tpl.id}
                      activeOpacity={0.7}
                      onPress={() => setTemplateId(tpl.id)}
                      style={[
                        styles.tplChip,
                        isSelected && styles.tplChipSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.tplChipText,
                          isSelected && styles.tplChipTextSelected,
                        ]}
                      >
                        {tpl.name}
                      </Text>
                      {isSelected ? <Check size={12} color="#FFFFFF" strokeWidth={3} /> : null}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* A4 Document Preview Card */}
            <View style={styles.previewDocumentCard}>
              {/* Document Header */}
              <View style={styles.docHeader}>
                <View style={styles.docOrgInfo}>
                  <View style={styles.docAvatar}>
                    <Text style={styles.docAvatarText}>
                      {activeOrg?.name.charAt(0).toUpperCase() || 'A'}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.docOrgName}>{activeOrg?.displayName || activeOrg?.name}</Text>
                    <Text style={styles.docOrgMeta}>
                      {activeOrg?.addressCity ? `${activeOrg.addressCity}, ${activeOrg.addressCountry || ''}` : activeOrg?.email || ''}
                    </Text>
                  </View>
                </View>

                <View style={styles.docInvoiceTitleBox}>
                  <Text style={styles.docInvoiceTitle}>INVOICE</Text>
                  <Text style={styles.docInvoiceNum}>{invoiceNumber}</Text>
                </View>
              </View>

              <View style={styles.docDivider} />

              {/* Bill To & Dates */}
              <View style={styles.docMetaGrid}>
                <View style={styles.docBillTo}>
                  <Text style={styles.docMetaLabel}>Bill To:</Text>
                  <Text style={styles.docCustomerName}>{selectedCustomer?.name}</Text>
                  {selectedCustomer?.companyName ? (
                    <Text style={styles.docCustomerSub}>{selectedCustomer.companyName}</Text>
                  ) : null}
                  {selectedCustomer?.email ? (
                    <Text style={styles.docCustomerSub}>{selectedCustomer.email}</Text>
                  ) : null}
                </View>

                <View style={styles.docDates}>
                  <View style={styles.docDateRow}>
                    <Text style={styles.docMetaLabel}>Issue Date:</Text>
                    <Text style={styles.docDateVal}>{issueDate}</Text>
                  </View>
                  <View style={styles.docDateRow}>
                    <Text style={styles.docMetaLabel}>Due Date:</Text>
                    <Text style={styles.docDateVal}>{dueDate}</Text>
                  </View>
                  <View style={styles.docDateRow}>
                    <Text style={styles.docMetaLabel}>Status:</Text>
                    <Badge status="UNPAID" size="sm" />
                  </View>
                </View>
              </View>

              {/* Itemized Table */}
              <View style={styles.tableHeader}>
                <Text style={[styles.thText, { flex: 0.4 }]}>#</Text>
                <Text style={[styles.thText, { flex: 2 }]}>Description</Text>
                <Text style={[styles.thText, { flex: 0.6, textAlign: 'center' }]}>Qty</Text>
                <Text style={[styles.thText, { flex: 1, textAlign: 'right' }]}>Price</Text>
                <Text style={[styles.thText, { flex: 1.2, textAlign: 'right' }]}>Amount</Text>
              </View>

              {lineItems.map((item, idx) => (
                <View key={idx} style={styles.tableRow}>
                  <Text style={[styles.tdText, { flex: 0.4, color: colors.textMuted }]}>
                    {idx + 1}
                  </Text>
                  <Text style={[styles.tdText, { flex: 2, fontWeight: '500' }]}>
                    {item.description}
                  </Text>
                  <Text style={[styles.tdText, { flex: 0.6, textAlign: 'center' }]}>
                    {item.quantity}
                  </Text>
                  <Text style={[styles.tdText, { flex: 1, textAlign: 'right' }]}>
                    {formatCurrency(item.rate, currencySymbol)}
                  </Text>
                  <Text style={[styles.tdText, { flex: 1.2, textAlign: 'right', fontWeight: '600' }]}>
                    {formatCurrency(item.lineTotal, currencySymbol)}
                  </Text>
                </View>
              ))}

              <View style={styles.docDivider} />

              {/* Totals Breakdown */}
              <View style={styles.docTotalsContainer}>
                <View style={styles.docTotalRow}>
                  <Text style={styles.docTotalLabel}>Subtotal:</Text>
                  <Text style={styles.docTotalVal}>{formatCurrency(subtotal, currencySymbol)}</Text>
                </View>

                {totalDiscount > 0 ? (
                  <View style={styles.docTotalRow}>
                    <Text style={styles.docTotalLabel}>Discount:</Text>
                    <Text style={[styles.docTotalVal, { color: '#15803D' }]}>
                      -{formatCurrency(totalDiscount, currencySymbol)}
                    </Text>
                  </View>
                ) : null}

                <View style={styles.docTotalRow}>
                  <Text style={styles.docTotalLabel}>Tax:</Text>
                  <Text style={styles.docTotalVal}>+{formatCurrency(totalTax, currencySymbol)}</Text>
                </View>

                <View style={styles.docGrandTotalRow}>
                  <Text style={styles.docGrandTotalLabel}>Total:</Text>
                  <Text style={styles.docGrandTotalVal}>
                    {formatCurrency(grandTotal, currencySymbol)}
                  </Text>
                </View>
              </View>

              {/* Notes & Terms */}
              <View style={styles.docFooter}>
                <Text style={styles.docTermsTitle}>Terms & Conditions</Text>
                <Text style={styles.docTermsText}>{notes}</Text>
              </View>
            </View>

            {/* Bottom Actions Row */}
            <View style={styles.buttonRow}>
              <Button
                title="Back"
                variant="outline"
                onPress={() => setCurrentStep(1)}
                style={{ minWidth: 90, marginRight: 10 }}
              />
              <Button
                title="Save & Create Invoice"
                onPress={handleSaveInvoice}
                loading={loading}
                icon={<Check size={18} color="#FFFFFF" strokeWidth={3} />}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Quick Customer Picker / Creator Modal */}
      <QuickCustomerModal
        visible={customerModalVisible}
        onClose={() => setCustomerModalVisible(false)}
        customers={customers}
        selectedCustomerId={selectedCustomer?.id}
        onSelectCustomer={(cust) => {
          setSelectedCustomer(cust);
          if (!customers.find((c) => c.id === cust.id)) {
            setCustomers([...customers, cust]);
          }
        }}
        orgId={activeOrg?.id || ''}
      />

      {/* Add Item Bottom Sheet */}
      <AddItemModal
        visible={addItemModalVisible}
        onClose={() => setAddItemModalVisible(false)}
        onAddItem={handleAddItem}
        catalogItems={catalogItems}
        currencySymbol={currencySymbol}
        defaultTaxRate={activeOrg?.taxEnabled ? 18 : 0}
      />

      {/* Invoice Created Celebratory Success Modal */}
      <InvoiceSuccessModal
        visible={successModalVisible}
        invoice={createdInvoice}
        onViewInvoice={() => {
          setSuccessModalVisible(false);
          navigation.replace('InvoiceDetail', { invoiceId: createdInvoice?.id });
        }}
        onShare={handleSharePdf}
        onCreateAnother={handleCreateAnother}
        onClose={() => {
          setSuccessModalVisible(false);
          navigation.goBack();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  stepContainer: {
    paddingBottom: 20,
  },
  sectionHeaderRow: {
    marginBottom: 8,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  customerSelectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  custAvatarBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  custAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#15803D',
  },
  custSelectDetails: {
    flex: 1,
    paddingRight: 8,
  },
  custSelectName: {
    ...typography.bodySemiBold,
    color: colors.text,
    fontSize: 15,
  },
  custSelectMeta: {
    ...typography.captionRegular,
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  addCustomerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
    gap: 6,
  },
  addCustomerLinkText: {
    ...typography.caption,
    color: '#15803D',
    fontWeight: '700',
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
    marginBottom: 20,
  },
  fieldGroup: {
    marginBottom: 12,
  },
  fieldLabel: {
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
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  dateInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    padding: 0,
  },
  termsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  termChip: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  termChipSelected: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  termChipText: {
    ...typography.micro,
    color: '#64748B',
    fontWeight: '600',
  },
  termChipTextSelected: {
    color: '#15803D',
    fontWeight: '700',
  },
  currencyDisplayBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  currencyDisplayText: {
    ...typography.bodyMedium,
    color: colors.text,
    fontWeight: '600',
  },
  nextStepBtn: {
    width: '100%',
    marginTop: 4,
  },
  customerSummaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#DCFCE7',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  custSummaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  custSummaryLabel: {
    ...typography.captionRegular,
    color: '#15803D',
    fontWeight: '600',
  },
  custSummaryName: {
    ...typography.bodySemiBold,
    color: '#15803D',
    fontWeight: '700',
    flex: 1,
  },
  custSummaryEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  custSummaryEditText: {
    ...typography.caption,
    color: '#15803D',
    fontWeight: '700',
  },
  itemsListContainer: {
    marginBottom: 12,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  itemCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  itemInfo: {
    flex: 1,
    paddingRight: 6,
  },
  itemName: {
    ...typography.bodySemiBold,
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  itemRate: {
    ...typography.captionRegular,
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  itemRemoveBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  itemCardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  itemStepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepperLabel: {
    ...typography.captionRegular,
    color: colors.textSecondary,
    fontSize: 12,
  },
  itemStepperBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 4,
    paddingVertical: 2,
    gap: 8,
  },
  stepperSubBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperQtyText: {
    ...typography.bodySemiBold,
    fontSize: 13,
    minWidth: 16,
    textAlign: 'center',
    color: colors.text,
  },
  itemLineTotal: {
    ...typography.bodySemiBold,
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  addItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF8EF',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 14,
    paddingVertical: 12,
    marginBottom: 16,
    gap: 6,
  },
  addItemBtnText: {
    ...typography.bodySemiBold,
    color: '#15803D',
    fontSize: 14,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  summaryLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryLabel: {
    ...typography.captionRegular,
    color: colors.textSecondary,
    fontSize: 13,
  },
  summaryVal: {
    ...typography.bodyMedium,
    color: colors.text,
    fontSize: 14,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 8,
  },
  summaryTotalLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  summaryTotalLabel: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '700',
  },
  summaryTotalVal: {
    ...typography.h2,
    color: '#15803D',
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  templatePickerBar: {
    marginBottom: 12,
  },
  templatePickerTitle: {
    ...typography.captionRegular,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 6,
  },
  tplScroll: {
    gap: 8,
  },
  tplChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 4,
  },
  tplChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tplChipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tplChipTextSelected: {
    color: '#FFFFFF',
  },
  previewDocumentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#D7E5DC',
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  docHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  docOrgInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  docAvatar: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#15803D',
  },
  docOrgName: {
    ...typography.bodySemiBold,
    color: colors.text,
    fontSize: 14,
  },
  docOrgMeta: {
    ...typography.micro,
    color: colors.textSecondary,
    marginTop: 2,
  },
  docInvoiceTitleBox: {
    alignItems: 'flex-end',
  },
  docInvoiceTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 0.5,
  },
  docInvoiceNum: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  docDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  docMetaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  docBillTo: {
    flex: 1,
  },
  docMetaLabel: {
    ...typography.micro,
    color: colors.textMuted,
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: 2,
  },
  docCustomerName: {
    ...typography.bodySemiBold,
    color: colors.text,
    fontSize: 14,
  },
  docCustomerSub: {
    ...typography.micro,
    color: colors.textSecondary,
    marginTop: 1,
  },
  docDates: {
    alignItems: 'flex-end',
  },
  docDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  docDateVal: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginTop: 12,
    marginBottom: 6,
  },
  thText: {
    ...typography.micro,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tdText: {
    ...typography.captionRegular,
    color: colors.text,
    fontSize: 12,
  },
  docTotalsContainer: {
    alignItems: 'flex-end',
  },
  docTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 160,
    paddingVertical: 2,
  },
  docTotalLabel: {
    ...typography.captionRegular,
    color: colors.textSecondary,
    fontSize: 12,
  },
  docTotalVal: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
  },
  docGrandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 160,
    paddingTop: 6,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  docGrandTotalLabel: {
    ...typography.bodySemiBold,
    color: colors.text,
    fontSize: 14,
  },
  docGrandTotalVal: {
    ...typography.bodySemiBold,
    color: '#15803D',
    fontSize: 15,
    fontWeight: '700',
  },
  docFooter: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  docTermsTitle: {
    ...typography.micro,
    color: colors.textMuted,
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: 2,
  },
  docTermsText: {
    ...typography.micro,
    color: colors.textSecondary,
    lineHeight: 14,
  },
});
