import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import {
  Phone,
  Mail,
  MessageCircle,
  FileText,
  Plus,
  Edit2,
  Trash2,
  CreditCard,
  MapPin,
  Building,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  FileSpreadsheet,
  Printer,
  Share2,
} from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { AmbientBackground } from '../../components/common/ScreenBackground';
import { useOrgStore } from '../../store/useOrgStore';
import { customerRepository } from '../../database/repositories/customerRepository';
import { invoiceRepository } from '../../database/repositories/invoiceRepository';
import { paymentRepository } from '../../database/repositories/paymentRepository';
import { buildCustomerStatementPdfHtml } from '../../pdf/customerStatementBuilder';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dates';
import { Customer, Invoice, Payment } from '../../types';
import { useResponsive } from '../../utils/useResponsive';

export const CustomerDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const customerId = route.params?.customerId;

  const { contentMaxWidth, isWideScreen } = useResponsive();
  const { activeOrg } = useOrgStore();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [activeTab, setActiveTab] = useState<'invoices' | 'payments' | 'details'>('invoices');

  useEffect(() => {
    if (customerId && activeOrg) {
      loadCustomerData(customerId);
    }
  }, [customerId, activeOrg?.id]);

  const loadCustomerData = async (id: string) => {
    const cust = await customerRepository.getById(id);
    setCustomer(cust);

    if (activeOrg) {
      const invs = await invoiceRepository.getAll({
        orgId: activeOrg.id,
        customerId: id,
      });
      setInvoices(invs);
    }
  };

  const handleCall = () => {
    if (customer?.phone) {
      Linking.openURL(`tel:${customer.phone}`);
    }
  };

  const handleEmail = () => {
    if (customer?.email) {
      Linking.openURL(`mailto:${customer.email}`);
    }
  };

  const handleWhatsApp = () => {
    if (customer?.phone) {
      const cleanPhone = customer.phone.replace(/[^0-9]/g, '');
      Linking.openURL(`https://wa.me/${cleanPhone}`);
    }
  };

  const handleDelete = () => {
    if (!customer) return;
    Alert.alert(
      'Delete Customer',
      `Are you sure you want to delete ${customer.name}? This will not delete past invoices.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await customerRepository.delete(customer.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  if (!customer) {
    return (
      <View style={styles.container}>
        <AmbientBackground />
        <Header title="Customer Details" showBack onBack={() => navigation.goBack()} />
      </View>
    );
  }

  const handlePrintStatement = async () => {
    if (!customer || !activeOrg) return;
    try {
      const html = buildCustomerStatementPdfHtml(activeOrg, customer, invoices, allPayments);
      await Print.printAsync({ html });
    } catch (err: any) {
      Alert.alert('Print Error', err.message || 'Unable to print statement.');
    }
  };

  const handleShareStatement = async () => {
    if (!customer || !activeOrg) return;
    try {
      const html = buildCustomerStatementPdfHtml(activeOrg, customer, invoices, allPayments);
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          UTI: '.pdf',
          mimeType: 'application/pdf',
          dialogTitle: `Statement of Account - ${customer.name}`,
        });
      } else {
        Alert.alert('Statement Ready', 'Statement generated successfully.');
      }
    } catch (err: any) {
      Alert.alert('Share Error', err.message || 'Unable to share statement.');
    }
  };

  const symbol = activeOrg?.currencySymbol || '$';
  const totalBilled = invoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const totalPaid = invoices.reduce((sum, i) => sum + i.paidAmount, 0);
  const totalDue = invoices.reduce((sum, i) => sum + i.balanceDue, 0);

  // Extract all payments from invoices
  const allPayments: Payment[] = [];
  invoices.forEach((inv) => {
    if (inv.payments && inv.payments.length > 0) {
      allPayments.push(...inv.payments);
    }
  });

  return (
    <View style={styles.container}>
      <AmbientBackground />
      <Header
        title={customer.name}
        showBack
        onBack={() => navigation.goBack()}
        rightAction={
          <View style={styles.headerRight}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('CustomerForm', { customerId: customer.id })}
              style={styles.headerIconBtn}
            >
              <Edit2 size={16} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleDelete}
              style={[styles.headerIconBtn, { marginLeft: 6 }]}
            >
              <Trash2 size={16} color={colors.danger} />
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { maxWidth: contentMaxWidth }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileTop}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{customer.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.profileDetails}>
              <Text style={styles.profileName}>{customer.name}</Text>
              {customer.companyName ? (
                <Text style={styles.profileCompany}>{customer.companyName}</Text>
              ) : null}
              {customer.taxId ? (
                <Text style={styles.profileTax}>Tax ID: {customer.taxId}</Text>
              ) : null}
            </View>
          </View>

          {/* Contact Action Buttons */}
          <View style={styles.contactActionRow}>
            {customer.phone ? (
              <TouchableOpacity activeOpacity={0.7} onPress={handleCall} style={styles.actionPill}>
                <Phone size={14} color="#15803D" />
                <Text style={styles.actionPillText}>Call</Text>
              </TouchableOpacity>
            ) : null}
            {customer.phone ? (
              <TouchableOpacity activeOpacity={0.7} onPress={handleWhatsApp} style={styles.actionPill}>
                <MessageCircle size={14} color="#15803D" />
                <Text style={styles.actionPillText}>WhatsApp</Text>
              </TouchableOpacity>
            ) : null}
            {customer.email ? (
              <TouchableOpacity activeOpacity={0.7} onPress={handleEmail} style={styles.actionPill}>
                <Mail size={14} color="#0369A1" />
                <Text style={[styles.actionPillText, { color: '#0369A1' }]}>Email</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* 3 KPI Mini-Cards Row */}
        <View style={styles.kpiRow}>
          <View style={[styles.kpiCard, { borderColor: '#BBF7D0' }]}>
            <Text style={styles.kpiLabel}>Invoiced</Text>
            <Text numberOfLines={1} style={[styles.kpiValue, { color: '#15803D' }]}>
              {formatCurrency(totalBilled, symbol)}
            </Text>
          </View>

          <View style={[styles.kpiCard, { borderColor: '#BAE6FD' }]}>
            <Text style={styles.kpiLabel}>Paid</Text>
            <Text numberOfLines={1} style={[styles.kpiValue, { color: '#0369A1' }]}>
              {formatCurrency(totalPaid, symbol)}
            </Text>
          </View>

          <View style={[styles.kpiCard, { borderColor: totalDue > 0 ? '#FECACA' : '#E2E8F0' }]}>
            <Text style={styles.kpiLabel}>Outstanding</Text>
            <Text numberOfLines={1} style={[styles.kpiValue, { color: totalDue > 0 ? '#EF4444' : '#64748B' }]}>
              {formatCurrency(totalDue, symbol)}
            </Text>
          </View>
        </View>

        {/* Customer Statement Quick Action */}
        <View style={styles.statementCard}>
          <View style={styles.statementLeft}>
            <Text style={styles.statementTitle}>Statement of Account</Text>
            <Text style={styles.statementSubtitle}>Export or share complete ledger PDF</Text>
          </View>
          <View style={styles.statementActions}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handlePrintStatement}
              style={styles.statementBtn}
            >
              <Printer size={15} color="#15803D" />
              <Text style={styles.statementBtnText}>Print</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleShareStatement}
              style={[styles.statementBtn, styles.statementBtnPrimary]}
            >
              <Share2 size={15} color="#FFFFFF" />
              <Text style={[styles.statementBtnText, { color: '#FFFFFF' }]}>Share PDF</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Segmented Tab Selector */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setActiveTab('invoices')}
            style={[styles.tabBtn, activeTab === 'invoices' && styles.tabBtnActive]}
          >
            <Text style={[styles.tabText, activeTab === 'invoices' && styles.tabTextActive]}>
              Invoices ({invoices.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setActiveTab('payments')}
            style={[styles.tabBtn, activeTab === 'payments' && styles.tabBtnActive]}
          >
            <Text style={[styles.tabText, activeTab === 'payments' && styles.tabTextActive]}>
              Payments ({allPayments.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setActiveTab('details')}
            style={[styles.tabBtn, activeTab === 'details' && styles.tabBtnActive]}
          >
            <Text style={[styles.tabText, activeTab === 'details' && styles.tabTextActive]}>
              Details
            </Text>
          </TouchableOpacity>
        </View>

        {/* TAB 1: INVOICES */}
        {activeTab === 'invoices' && (
          <View style={styles.tabContent}>
            {invoices.length === 0 ? (
              <EmptyState
                icon={<FileText size={28} color="#15803D" />}
                title="No Invoices Yet"
                description={`Create a professional invoice for ${customer.name}.`}
                actionTitle="+ Create Invoice"
                onAction={() => navigation.navigate('InvoiceCreate', {})}
              />
            ) : (
              invoices.map((inv) => (
                <TouchableOpacity
                  key={inv.id}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('InvoiceDetail', { invoiceId: inv.id })}
                  style={styles.invCard}
                >
                  <View style={styles.invLeft}>
                    <View style={styles.invTitleRow}>
                      <Text style={styles.invNumber}>{inv.invoiceNumber}</Text>
                      <Badge status={inv.status} size="sm" />
                    </View>
                    <Text style={styles.invDateText}>
                      Issued: {formatDate(inv.issueDate, 'dd MMM')} • Due: {formatDate(inv.dueDate, 'dd MMM')}
                    </Text>
                  </View>

                  <View style={styles.invRight}>
                    <Text style={styles.invAmount}>
                      {formatCurrency(inv.totalAmount, inv.currencySymbol)}
                    </Text>
                    {inv.balanceDue > 0 ? (
                      <Text style={styles.invDue}>
                        Due: {formatCurrency(inv.balanceDue, inv.currencySymbol)}
                      </Text>
                    ) : null}
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* TAB 2: PAYMENTS */}
        {activeTab === 'payments' && (
          <View style={styles.tabContent}>
            {allPayments.length === 0 ? (
              <EmptyState
                icon={<CreditCard size={28} color="#0369A1" />}
                title="No Payments Recorded"
                description={`No payment transactions logged for ${customer.name} yet.`}
                actionTitle="Record Payment"
                onAction={() => navigation.navigate('RecordPayment', { customerId: customer.id })}
              />
            ) : (
              allPayments.map((p) => (
                <View key={p.id} style={styles.paymentCard}>
                  <View style={styles.paymentIconBox}>
                    <CreditCard size={18} color="#15803D" />
                  </View>
                  <View style={styles.paymentDetails}>
                    <Text style={styles.paymentNum}>{p.paymentNumber}</Text>
                    <Text style={styles.paymentMeta}>{p.paymentMethod} • {formatDate(p.paymentDate)}</Text>
                  </View>
                  <Text style={styles.paymentAmount}>{formatCurrency(p.amount, symbol)}</Text>
                </View>
              ))
            )}
          </View>
        )}

        {/* TAB 3: DETAILS & ADDRESS */}
        {activeTab === 'details' && (
          <View style={styles.tabContent}>
            <View style={styles.infoCard}>
              <View style={styles.infoCardHeader}>
                <MapPin size={16} color="#15803D" />
                <Text style={styles.infoCardTitle}>Billing Address</Text>
              </View>
              <Text style={styles.infoCardText}>
                {customer.billingStreet ? `${customer.billingStreet}\n` : ''}
                {customer.billingCity ? `${customer.billingCity}, ` : ''}
                {customer.billingState ? `${customer.billingState} ` : ''}
                {customer.billingZip ? `${customer.billingZip}\n` : ''}
                {customer.billingCountry || 'No billing address saved'}
              </Text>
            </View>

            {customer.notes ? (
              <View style={styles.infoCard}>
                <View style={styles.infoCardHeader}>
                  <FileText size={16} color="#6D28D9" />
                  <Text style={styles.infoCardTitle}>Internal Notes</Text>
                </View>
                <Text style={styles.infoCardText}>{customer.notes}</Text>
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>

      {/* Bottom Sticky Action Buttons */}
      <View style={[styles.bottomBar, { maxWidth: Math.min(contentMaxWidth, 800), alignSelf: 'center', width: '100%' }]}>
        <Button
          title="+ Create Invoice"
          onPress={() => navigation.navigate('InvoiceCreate', {})}
          icon={<Plus size={18} color="#FFFFFF" strokeWidth={2.5} />}
          style={{ flex: 1.5, marginRight: 8 }}
        />
        <Button
          title="Record Payment"
          variant="outline"
          onPress={() => navigation.navigate('RecordPayment', { customerId: customer.id })}
          icon={<CreditCard size={16} color={colors.primaryDarker} />}
          style={{ flex: 1 }}
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    width: '100%',
    alignSelf: 'center',
    padding: 16,
    paddingBottom: 100,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#15803D',
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    ...typography.h3,
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  profileCompany: {
    ...typography.captionRegular,
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 1,
  },
  profileTax: {
    ...typography.micro,
    color: colors.textMuted,
    marginTop: 2,
  },
  contactActionRow: {
    flexDirection: 'row',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 8,
  },
  actionPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingVertical: 7,
    gap: 6,
  },
  actionPillText: {
    ...typography.caption,
    color: '#15803D',
    fontWeight: '600',
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  kpiLabel: {
    ...typography.micro,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  kpiValue: {
    ...typography.bodySemiBold,
    fontSize: 14,
    fontWeight: '700',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
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
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#15803D',
    fontWeight: '700',
  },
  tabContent: {
    marginBottom: 20,
  },
  invCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  invLeft: {
    flex: 1,
    paddingRight: 8,
  },
  invTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  invNumber: {
    ...typography.bodySemiBold,
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  invDateText: {
    ...typography.micro,
    color: colors.textMuted,
  },
  invRight: {
    alignItems: 'flex-end',
  },
  invAmount: {
    ...typography.bodySemiBold,
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  invDue: {
    ...typography.micro,
    color: '#EF4444',
    fontWeight: '600',
    marginTop: 2,
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  paymentIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  paymentDetails: {
    flex: 1,
  },
  paymentNum: {
    ...typography.bodySemiBold,
    color: colors.text,
    fontSize: 14,
  },
  paymentMeta: {
    ...typography.micro,
    color: colors.textSecondary,
    marginTop: 2,
  },
  paymentAmount: {
    ...typography.bodySemiBold,
    color: '#15803D',
    fontSize: 15,
    fontWeight: '700',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoCardTitle: {
    ...typography.bodySemiBold,
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  infoCardText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 20,
    fontSize: 13,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 6,
  },
  statementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: 14,
  },
  statementLeft: {
    flex: 1,
    marginRight: 10,
  },
  statementTitle: {
    ...typography.bodySemiBold,
    color: '#15803D',
    fontSize: 13,
    fontWeight: '700',
  },
  statementSubtitle: {
    ...typography.micro,
    color: '#166534',
    marginTop: 2,
  },
  statementActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statementBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  statementBtnPrimary: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },
  statementBtnText: {
    ...typography.caption,
    fontWeight: '700',
    color: '#15803D',
    fontSize: 12,
  },
});
