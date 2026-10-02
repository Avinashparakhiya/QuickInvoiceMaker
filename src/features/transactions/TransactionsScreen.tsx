import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import {
  Search,
  Plus,
  FileText,
  CreditCard,
  Receipt,
  FileSpreadsheet,
  ArrowRight,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle2,
  X,
  Filter,
  DollarSign,
} from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Input } from '../../components/common/Input';
import { EmptyState } from '../../components/common/EmptyState';
import { useOrgStore } from '../../store/useOrgStore';
import { useInvoiceStore } from '../../store/useInvoiceStore';
import { paymentRepository } from '../../database/repositories/paymentRepository';
import { estimateRepository } from '../../database/repositories/estimateRepository';
import { expenseRepository } from '../../database/repositories/expenseRepository';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dates';
import { Invoice, Payment, Estimate, Expense } from '../../types';

type TabType = 'INVOICES' | 'PAYMENTS' | 'ESTIMATES' | 'EXPENSES';

const AVATAR_COLORS = [
  { bg: '#DCFCE7', text: '#15803D' }, // Green
  { bg: '#E0F2FE', text: '#0369A1' }, // Sky Blue
  { bg: '#FEF3C7', text: '#B45309' }, // Amber
  { bg: '#FEE2E2', text: '#B91C1C' }, // Rose
  { bg: '#F3E8FF', text: '#7E22CE' }, // Purple
  { bg: '#FFEDD5', text: '#C2410C' }, // Orange
];

const getAvatarTheme = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
};

const getInitials = (name: string) => {
  if (!name) return 'WK';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

export const TransactionsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const { activeOrg } = useOrgStore();
  const {
    invoices,
    filterStatus,
    searchQuery,
    setFilterStatus,
    setSearchQuery,
    loadInvoices,
  } = useInvoiceStore();

  const [activeTab, setActiveTab] = useState<TabType>('INVOICES');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('ALL');
  const [estimateStatusFilter, setEstimateStatusFilter] = useState('ALL');
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState('ALL');

  const loadAllData = async () => {
    if (!activeOrg) return;
    await loadInvoices(activeOrg.id);
    const p = await paymentRepository.getByOrg(activeOrg.id);
    const est = await estimateRepository.getByOrg(activeOrg.id);
    const exp = await expenseRepository.getByOrg(activeOrg.id);
    setPayments(p);
    setEstimates(est);
    setExpenses(exp);
  };

  useEffect(() => {
    if (activeOrg && isFocused) {
      loadAllData();
    }
  }, [activeOrg?.id, filterStatus, searchQuery, activeTab, isFocused]);

  const onRefresh = async () => {
    if (!activeOrg) return;
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  };

  const currencySymbol = activeOrg?.currencySymbol || '$';

  // Financial summary metrics
  const totalInvoiced = useMemo(() => {
    return invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  }, [invoices]);

  const totalCollected = useMemo(() => {
    return payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  }, [payments]);

  const totalOutstanding = useMemo(() => {
    return invoices.reduce((sum, inv) => sum + (inv.balanceDue || 0), 0);
  }, [invoices]);

  // Invoice Filters
  const invoiceStatusFilters = [
    { label: 'All', value: 'ALL' },
    { label: 'Unpaid', value: 'UNPAID' },
    { label: 'Partial', value: 'PARTIAL' },
    { label: 'Paid', value: 'PAID' },
    { label: 'Overdue', value: 'OVERDUE' },
    { label: 'Draft', value: 'DRAFT' },
  ];

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      // Status filter
      if (filterStatus !== 'ALL' && inv.status !== filterStatus) return false;
      // Search term
      if (!searchQuery.trim()) return true;
      const term = searchQuery.toLowerCase();
      return (
        inv.invoiceNumber.toLowerCase().includes(term) ||
        (inv.customerName && inv.customerName.toLowerCase().includes(term))
      );
    });
  }, [invoices, filterStatus, searchQuery]);

  // Payment Filters
  const paymentMethods = [
    { label: 'All', value: 'ALL' },
    { label: 'Bank Transfer', value: 'BANK_TRANSFER' },
    { label: 'UPI', value: 'UPI' },
    { label: 'Cash', value: 'CASH' },
    { label: 'Credit Card', value: 'CREDIT_CARD' },
    { label: 'Cheque', value: 'CHEQUE' },
  ];

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (paymentMethodFilter !== 'ALL' && p.paymentMethod !== paymentMethodFilter) return false;
      if (!searchQuery.trim()) return true;
      const term = searchQuery.toLowerCase();
      return (
        p.paymentNumber.toLowerCase().includes(term) ||
        (p.customerName && p.customerName.toLowerCase().includes(term)) ||
        (p.invoiceNumber && p.invoiceNumber.toLowerCase().includes(term)) ||
        (p.referenceNumber && p.referenceNumber.toLowerCase().includes(term))
      );
    });
  }, [payments, paymentMethodFilter, searchQuery]);

  // Estimate Filters
  const estimateStatusFilters = [
    { label: 'All', value: 'ALL' },
    { label: 'Draft', value: 'DRAFT' },
    { label: 'Sent', value: 'SENT' },
    { label: 'Accepted', value: 'ACCEPTED' },
    { label: 'Declined', value: 'DECLINED' },
    { label: 'Converted', value: 'CONVERTED' },
  ];

  const filteredEstimates = useMemo(() => {
    return estimates.filter((e) => {
      if (estimateStatusFilter !== 'ALL' && e.status !== estimateStatusFilter) return false;
      if (!searchQuery.trim()) return true;
      const term = searchQuery.toLowerCase();
      return (
        e.estimateNumber.toLowerCase().includes(term) ||
        (e.customerName && e.customerName.toLowerCase().includes(term))
      );
    });
  }, [estimates, estimateStatusFilter, searchQuery]);

  // Expense Filters
  const expenseCategories = [
    { label: 'All', value: 'ALL' },
    { label: 'Office Supplies', value: 'Office Supplies' },
    { label: 'Software / SaaS', value: 'Software / SaaS' },
    { label: 'Travel & Food', value: 'Travel & Meals' },
    { label: 'Utilities', value: 'Utilities' },
    { label: 'Services', value: 'Professional Services' },
  ];

  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      if (expenseCategoryFilter !== 'ALL' && exp.category !== expenseCategoryFilter) return false;
      if (!searchQuery.trim()) return true;
      const term = searchQuery.toLowerCase();
      return (
        exp.category.toLowerCase().includes(term) ||
        (exp.vendor && exp.vendor.toLowerCase().includes(term)) ||
        (exp.description && exp.description.toLowerCase().includes(term))
      );
    });
  }, [expenses, expenseCategoryFilter, searchQuery]);

  const handleFabPress = () => {
    switch (activeTab) {
      case 'INVOICES':
        navigation.navigate('InvoiceCreate', {});
        break;
      case 'PAYMENTS':
        navigation.navigate('RecordPayment', {});
        break;
      case 'ESTIMATES':
        navigation.navigate('EstimateCreate', {});
        break;
      case 'EXPENSES':
        navigation.navigate('ExpenseForm', {});
        break;
    }
  };

  const renderInvoiceItem = ({ item }: { item: Invoice }) => {
    const avatarTheme = getAvatarTheme(item.customerName || 'Walkin');
    const initials = getInitials(item.customerName || 'Walkin');

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => navigation.navigate('InvoiceDetail', { invoiceId: item.id })}
        style={styles.cardContainer}
      >
        <Card variant="elevated" padding={14} style={styles.card}>
          <View style={styles.cardRow}>
            {/* Avatar Initials */}
            <View style={[styles.avatarCircle, { backgroundColor: avatarTheme.bg }]}>
              <Text style={[styles.avatarText, { color: avatarTheme.text }]}>{initials}</Text>
            </View>

            {/* Middle info */}
            <View style={styles.cardLeft}>
              <View style={styles.titleRow}>
                <Text numberOfLines={1} style={styles.customerName}>
                  {item.customerName || 'Walk-in Customer'}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.invNumber}>{item.invoiceNumber}</Text>
                <Text style={styles.dotSeparator}>•</Text>
                <Text style={styles.datesText}>
                  {formatDate(item.issueDate, 'MMM dd, yyyy')}
                </Text>
              </View>
            </View>

            {/* Right amount & status */}
            <View style={styles.cardRight}>
              <Text style={styles.totalAmount}>
                {formatCurrency(item.totalAmount, item.currencySymbol)}
              </Text>
              <View style={styles.statusBadgeWrapper}>
                <Badge status={item.status} size="sm" />
              </View>
              {item.balanceDue > 0 && item.status !== 'UNPAID' && (
                <Text style={styles.balanceText}>
                  Due: {formatCurrency(item.balanceDue, item.currencySymbol)}
                </Text>
              )}
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderPaymentItem = ({ item }: { item: Payment }) => {
    const avatarTheme = getAvatarTheme(item.customerName || 'Payment');
    const initials = getInitials(item.customerName || 'Payment');

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => navigation.navigate('PaymentList')}
        style={styles.cardContainer}
      >
        <Card variant="elevated" padding={14} style={styles.card}>
          <View style={styles.cardRow}>
            {/* Avatar Circle */}
            <View style={[styles.avatarCircle, { backgroundColor: avatarTheme.bg }]}>
              <Text style={[styles.avatarText, { color: avatarTheme.text }]}>{initials}</Text>
            </View>

            {/* Middle Info */}
            <View style={styles.cardLeft}>
              <Text numberOfLines={1} style={styles.customerName}>
                {item.customerName || 'Customer Payment'}
              </Text>
              <View style={styles.metaRow}>
                <Text style={styles.invNumber}>{item.paymentNumber}</Text>
                {item.invoiceNumber && (
                  <>
                    <Text style={styles.dotSeparator}>•</Text>
                    <Text style={styles.datesText}>#{item.invoiceNumber}</Text>
                  </>
                )}
                <Text style={styles.dotSeparator}>•</Text>
                <Text style={styles.datesText}>{formatDate(item.paymentDate, 'MMM dd')}</Text>
              </View>
            </View>

            {/* Right Side */}
            <View style={styles.cardRight}>
              <Text style={[styles.totalAmount, { color: colors.success }]}>
                +{formatCurrency(item.amount, activeOrg?.currencySymbol || '$')}
              </Text>
              <View style={styles.methodBadge}>
                <Text style={styles.methodText}>{item.paymentMethod.replace(/_/g, ' ')}</Text>
              </View>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderEstimateItem = ({ item }: { item: Estimate }) => {
    const avatarTheme = getAvatarTheme(item.customerName || 'Estimate');
    const initials = getInitials(item.customerName || 'Estimate');

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => navigation.navigate('EstimateDetail', { estimateId: item.id })}
        style={styles.cardContainer}
      >
        <Card variant="elevated" padding={14} style={styles.card}>
          <View style={styles.cardRow}>
            <View style={[styles.avatarCircle, { backgroundColor: avatarTheme.bg }]}>
              <Text style={[styles.avatarText, { color: avatarTheme.text }]}>{initials}</Text>
            </View>

            <View style={styles.cardLeft}>
              <Text numberOfLines={1} style={styles.customerName}>
                {item.customerName || 'Potential Client'}
              </Text>
              <View style={styles.metaRow}>
                <Text style={styles.invNumber}>{item.estimateNumber}</Text>
                <Text style={styles.dotSeparator}>•</Text>
                <Text style={styles.datesText}>
                  Valid till {formatDate(item.expiryDate, 'MMM dd')}
                </Text>
              </View>
            </View>

            <View style={styles.cardRight}>
              <Text style={styles.totalAmount}>
                {formatCurrency(item.totalAmount, item.currencySymbol || activeOrg?.currencySymbol || '$')}
              </Text>
              <View style={[
                styles.estimateBadge,
                item.status === 'ACCEPTED' ? { backgroundColor: '#DCFCE7' } :
                item.status === 'CONVERTED' ? { backgroundColor: '#E0F2FE' } :
                item.status === 'DECLINED' ? { backgroundColor: '#FEE2E2' } :
                { backgroundColor: '#F1F5F9' }
              ]}>
                <Text style={[
                  styles.estimateBadgeText,
                  item.status === 'ACCEPTED' ? { color: '#15803D' } :
                  item.status === 'CONVERTED' ? { color: '#0369A1' } :
                  item.status === 'DECLINED' ? { color: '#B91C1C' } :
                  { color: '#475569' }
                ]}>
                  {item.status}
                </Text>
              </View>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderExpenseItem = ({ item }: { item: Expense }) => {
    const avatarTheme = getAvatarTheme(item.category || 'Expense');
    const initials = getInitials(item.category || 'Expense');

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => navigation.navigate('ExpenseList')}
        style={styles.cardContainer}
      >
        <Card variant="elevated" padding={14} style={styles.card}>
          <View style={styles.cardRow}>
            <View style={[styles.avatarCircle, { backgroundColor: avatarTheme.bg }]}>
              <Text style={[styles.avatarText, { color: avatarTheme.text }]}>{initials}</Text>
            </View>

            <View style={styles.cardLeft}>
              <Text numberOfLines={1} style={styles.customerName}>
                {item.vendor || item.description || item.category}
              </Text>
              <View style={styles.metaRow}>
                <Text style={styles.invNumber}>{item.category}</Text>
                <Text style={styles.dotSeparator}>•</Text>
                <Text style={styles.datesText}>{formatDate(item.expenseDate, 'MMM dd, yyyy')}</Text>
              </View>
            </View>

            <View style={styles.cardRight}>
              <Text style={[styles.totalAmount, { color: colors.danger }]}>
                -{formatCurrency(item.amount, activeOrg?.currencySymbol || '$')}
              </Text>
              {item.isBillable && (
                <View style={styles.billableBadge}>
                  <Text style={styles.billableText}>Billable</Text>
                </View>
              )}
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Transactions Hub"
        subtitle={activeOrg?.displayName || activeOrg?.name || 'Workspace'}
        rightAction={
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleFabPress}
            style={styles.addBtn}
          >
            <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
        }
      />

      {/* Top Financial Summary Metrics Strip */}
      <View style={styles.summaryStrip}>
        <View style={styles.summaryMetricItem}>
          <Text style={styles.summaryMetricLabel}>Billed</Text>
          <Text numberOfLines={1} style={styles.summaryMetricValue}>
            {formatCurrency(totalInvoiced, currencySymbol)}
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryMetricItem}>
          <Text style={styles.summaryMetricLabel}>Collected</Text>
          <Text numberOfLines={1} style={[styles.summaryMetricValue, { color: colors.success }]}>
            {formatCurrency(totalCollected, currencySymbol)}
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryMetricItem}>
          <Text style={styles.summaryMetricLabel}>Outstanding</Text>
          <Text numberOfLines={1} style={[styles.summaryMetricValue, { color: colors.warning }]}>
            {formatCurrency(totalOutstanding, currencySymbol)}
          </Text>
        </View>
      </View>

      {/* Document Type Switcher Tabs */}
      <View style={styles.mainTabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mainTabRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setActiveTab('INVOICES')}
            style={[styles.mainTabBtn, activeTab === 'INVOICES' && styles.mainTabBtnActive]}
          >
            <FileText size={15} color={activeTab === 'INVOICES' ? colors.primaryDarker : colors.textSecondary} />
            <Text style={[styles.mainTabText, activeTab === 'INVOICES' && styles.mainTabTextActive]}>
              Invoices
            </Text>
            <View style={[styles.tabCountPill, activeTab === 'INVOICES' && styles.tabCountPillActive]}>
              <Text style={[styles.tabCountText, activeTab === 'INVOICES' && styles.tabCountTextActive]}>
                {invoices.length}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setActiveTab('PAYMENTS')}
            style={[styles.mainTabBtn, activeTab === 'PAYMENTS' && styles.mainTabBtnActive]}
          >
            <CreditCard size={15} color={activeTab === 'PAYMENTS' ? colors.primaryDarker : colors.textSecondary} />
            <Text style={[styles.mainTabText, activeTab === 'PAYMENTS' && styles.mainTabTextActive]}>
              Payments
            </Text>
            <View style={[styles.tabCountPill, activeTab === 'PAYMENTS' && styles.tabCountPillActive]}>
              <Text style={[styles.tabCountText, activeTab === 'PAYMENTS' && styles.tabCountTextActive]}>
                {payments.length}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setActiveTab('ESTIMATES')}
            style={[styles.mainTabBtn, activeTab === 'ESTIMATES' && styles.mainTabBtnActive]}
          >
            <FileSpreadsheet size={15} color={activeTab === 'ESTIMATES' ? colors.primaryDarker : colors.textSecondary} />
            <Text style={[styles.mainTabText, activeTab === 'ESTIMATES' && styles.mainTabTextActive]}>
              Quotes
            </Text>
            <View style={[styles.tabCountPill, activeTab === 'ESTIMATES' && styles.tabCountPillActive]}>
              <Text style={[styles.tabCountText, activeTab === 'ESTIMATES' && styles.tabCountTextActive]}>
                {estimates.length}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setActiveTab('EXPENSES')}
            style={[styles.mainTabBtn, activeTab === 'EXPENSES' && styles.mainTabBtnActive]}
          >
            <Receipt size={15} color={activeTab === 'EXPENSES' ? colors.primaryDarker : colors.textSecondary} />
            <Text style={[styles.mainTabText, activeTab === 'EXPENSES' && styles.mainTabTextActive]}>
              Expenses
            </Text>
            <View style={[styles.tabCountPill, activeTab === 'EXPENSES' && styles.tabCountPillActive]}>
              <Text style={[styles.tabCountText, activeTab === 'EXPENSES' && styles.tabCountTextActive]}>
                {expenses.length}
              </Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Search Input Section */}
      <View style={styles.searchSection}>
        <Input
          placeholder={
            activeTab === 'INVOICES'
              ? 'Search invoices, clients...'
              : activeTab === 'PAYMENTS'
              ? 'Search receipts, clients...'
              : activeTab === 'ESTIMATES'
              ? 'Search quotes, clients...'
              : 'Search expenses, vendors...'
          }
          value={searchQuery}
          onChangeText={setSearchQuery}
          prefix={<Search size={18} color={colors.textSecondary} />}
          suffix={
            searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            ) : undefined
          }
          containerStyle={styles.searchInput}
        />
      </View>

      {/* Sub-Filter Chips */}
      <View style={styles.filtersSection}>
        {activeTab === 'INVOICES' && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersList}>
            {invoiceStatusFilters.map((chip) => (
              <TouchableOpacity
                key={chip.value}
                activeOpacity={0.7}
                onPress={() => setFilterStatus(chip.value)}
                style={[
                  styles.filterChip,
                  filterStatus === chip.value && styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filterStatus === chip.value && styles.filterChipTextActive,
                  ]}
                >
                  {chip.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {activeTab === 'PAYMENTS' && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersList}>
            {paymentMethods.map((chip) => (
              <TouchableOpacity
                key={chip.value}
                activeOpacity={0.7}
                onPress={() => setPaymentMethodFilter(chip.value)}
                style={[
                  styles.filterChip,
                  paymentMethodFilter === chip.value && styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    paymentMethodFilter === chip.value && styles.filterChipTextActive,
                  ]}
                >
                  {chip.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {activeTab === 'ESTIMATES' && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersList}>
            {estimateStatusFilters.map((chip) => (
              <TouchableOpacity
                key={chip.value}
                activeOpacity={0.7}
                onPress={() => setEstimateStatusFilter(chip.value)}
                style={[
                  styles.filterChip,
                  estimateStatusFilter === chip.value && styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    estimateStatusFilter === chip.value && styles.filterChipTextActive,
                  ]}
                >
                  {chip.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {activeTab === 'EXPENSES' && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersList}>
            {expenseCategories.map((chip) => (
              <TouchableOpacity
                key={chip.value}
                activeOpacity={0.7}
                onPress={() => setExpenseCategoryFilter(chip.value)}
                style={[
                  styles.filterChip,
                  expenseCategoryFilter === chip.value && styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    expenseCategoryFilter === chip.value && styles.filterChipTextActive,
                  ]}
                >
                  {chip.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Active Tab List Content */}
      {activeTab === 'INVOICES' && (
        <FlatList
          data={filteredInvoices}
          keyExtractor={(item) => item.id}
          renderItem={renderInvoiceItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon={<FileText size={32} color={colors.primary} />}
              title="No Invoices Found"
              description={
                searchQuery || filterStatus !== 'ALL'
                  ? 'No invoices match your current search or filter.'
                  : 'Create and send your first invoice in seconds.'
              }
              actionTitle="+ Create Invoice"
              onAction={() => navigation.navigate('InvoiceCreate', {})}
            />
          }
        />
      )}

      {activeTab === 'PAYMENTS' && (
        <FlatList
          data={filteredPayments}
          keyExtractor={(item) => item.id}
          renderItem={renderPaymentItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon={<CreditCard size={32} color={colors.primary} />}
              title="No Payments Found"
              description="Record incoming payments to track real-time cashflow."
              actionTitle="+ Record Payment"
              onAction={() => navigation.navigate('RecordPayment', {})}
            />
          }
        />
      )}

      {activeTab === 'ESTIMATES' && (
        <FlatList
          data={filteredEstimates}
          keyExtractor={(item) => item.id}
          renderItem={renderEstimateItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon={<FileSpreadsheet size={32} color={colors.primary} />}
              title="No Quotes Found"
              description="Draft estimates and convert them directly to invoices upon client approval."
              actionTitle="+ Create Estimate"
              onAction={() => navigation.navigate('EstimateCreate', {})}
            />
          }
        />
      )}

      {activeTab === 'EXPENSES' && (
        <FlatList
          data={filteredExpenses}
          keyExtractor={(item) => item.id}
          renderItem={renderExpenseItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon={<Receipt size={32} color={colors.primary} />}
              title="No Expenses Logged"
              description="Log business expenses to maintain clean tax-ready books."
              actionTitle="+ Log Expense"
              onAction={() => navigation.navigate('ExpenseForm', {})}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 4,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#D7E5DC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  summaryMetricItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryMetricLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  summaryMetricValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  summaryDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
  mainTabContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  mainTabRow: {
    flexDirection: 'row',
    gap: 8,
  },
  mainTabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D7E5DC',
  },
  mainTabBtnActive: {
    backgroundColor: '#DCFCE7',
    borderColor: colors.primary,
  },
  mainTabText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  mainTabTextActive: {
    color: colors.primaryDarker,
    fontWeight: '700',
  },
  tabCountPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  tabCountPillActive: {
    backgroundColor: colors.primary,
  },
  tabCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  tabCountTextActive: {
    color: '#FFFFFF',
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  searchInput: {
    marginBottom: 2,
  },
  filtersSection: {
    paddingVertical: 6,
  },
  filtersList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D7E5DC',
  },
  filterChipActive: {
    backgroundColor: colors.primaryDarker,
    borderColor: colors.primaryDarker,
  },
  filterChipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 32,
    flexGrow: 1,
  },
  cardContainer: {
    marginBottom: 10,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D7E5DC',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
  },
  cardLeft: {
    flex: 1,
    paddingRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  customerName: {
    ...typography.bodySemiBold,
    color: colors.text,
    fontSize: 14,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  invNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primaryDarker,
  },
  dotSeparator: {
    marginHorizontal: 5,
    color: '#94A3B8',
    fontSize: 10,
  },
  datesText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  cardRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  totalAmount: {
    ...typography.h3,
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  statusBadgeWrapper: {
    marginTop: 4,
  },
  balanceText: {
    fontSize: 11,
    color: colors.danger,
    fontWeight: '600',
    marginTop: 2,
  },
  methodBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  methodText: {
    ...typography.micro,
    color: '#B45309',
    fontWeight: '700',
  },
  estimateBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  estimateBadgeText: {
    ...typography.micro,
    fontWeight: '700',
  },
  billableBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  billableText: {
    ...typography.micro,
    color: '#0369A1',
    fontWeight: '700',
  },
});
