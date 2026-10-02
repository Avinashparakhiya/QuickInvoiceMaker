import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import {
  Search,
  Plus,
  FileText,
  CreditCard,
  FileSpreadsheet,
  Receipt,
  X,
  ArrowDownUp,
} from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { TransactionSummary } from '../../components/transactions/TransactionSummary';
import { TransactionTabs, TransactionTabKey } from '../../components/transactions/TransactionTabs';
import { InvoiceFilterChips, FilterChipOption } from '../../components/transactions/InvoiceFilterChips';
import { InvoiceListItem } from '../../components/transactions/InvoiceListItem';
import { PaymentListItem } from '../../components/transactions/PaymentListItem';
import { QuoteListItem } from '../../components/transactions/QuoteListItem';
import { SortBottomSheet, SortOptionKey } from '../../components/transactions/SortBottomSheet';
import { EmptyState } from '../../components/common/EmptyState';
import { useOrgStore } from '../../store/useOrgStore';
import { useInvoiceStore } from '../../store/useInvoiceStore';
import { paymentRepository } from '../../database/repositories/paymentRepository';
import { estimateRepository } from '../../database/repositories/estimateRepository';
import { expenseRepository } from '../../database/repositories/expenseRepository';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Invoice, Payment, Estimate, Expense } from '../../types';
import { useResponsive } from '../../utils/useResponsive';

export const TransactionsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const { contentMaxWidth, horizontalPadding } = useResponsive();
  const { activeOrg } = useOrgStore();
  const {
    invoices,
    filterStatus,
    searchQuery,
    setFilterStatus,
    setSearchQuery,
    loadInvoices,
  } = useInvoiceStore();

  const [activeTab, setActiveTab] = useState<TransactionTabKey>('INVOICES');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [sortSheetVisible, setSortSheetVisible] = useState(false);
  const [selectedSort, setSelectedSort] = useState<SortOptionKey>('NEWEST');

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

  // Dynamic Financial Summary Calculations
  const totalBilled = useMemo(() => {
    return invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  }, [invoices]);

  const totalCollected = useMemo(() => {
    return payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  }, [payments]);

  const totalOutstanding = useMemo(() => {
    return invoices.reduce((sum, inv) => sum + (inv.balanceDue || 0), 0);
  }, [invoices]);

  // Invoice Filters
  const invoiceStatusFilterOptions: FilterChipOption[] = [
    { label: 'All', value: 'ALL' },
    { label: 'Paid', value: 'PAID' },
    { label: 'Unpaid', value: 'UNPAID' },
    { label: 'Partial', value: 'PARTIAL' },
    { label: 'Overdue', value: 'OVERDUE' },
    { label: 'Draft', value: 'DRAFT' },
  ];

  // Payment Filters
  const paymentMethodFilterOptions: FilterChipOption[] = [
    { label: 'All', value: 'ALL' },
    { label: 'Bank Transfer', value: 'BANK_TRANSFER' },
    { label: 'UPI', value: 'UPI' },
    { label: 'Cash', value: 'CASH' },
    { label: 'Credit Card', value: 'CREDIT_CARD' },
    { label: 'Cheque', value: 'CHEQUE' },
  ];

  // Quote Filters
  const estimateStatusFilterOptions: FilterChipOption[] = [
    { label: 'All', value: 'ALL' },
    { label: 'Draft', value: 'DRAFT' },
    { label: 'Sent', value: 'SENT' },
    { label: 'Accepted', value: 'ACCEPTED' },
    { label: 'Declined', value: 'DECLINED' },
    { label: 'Converted', value: 'CONVERTED' },
  ];

  // Filtered & Sorted Invoices
  const filteredInvoices = useMemo(() => {
    let result = invoices.filter((inv) => {
      // Status filter
      if (filterStatus !== 'ALL' && inv.status !== filterStatus) {
        return false;
      }
      // Search query
      if (!searchQuery.trim()) return true;
      const term = searchQuery.toLowerCase();
      return (
        inv.invoiceNumber.toLowerCase().includes(term) ||
        (inv.customerName && inv.customerName.toLowerCase().includes(term))
      );
    });

    // Sorting
    result.sort((a, b) => {
      switch (selectedSort) {
        case 'OLDEST':
          return new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime();
        case 'HIGHEST_AMOUNT':
          return (b.totalAmount || 0) - (a.totalAmount || 0);
        case 'LOWEST_AMOUNT':
          return (a.totalAmount || 0) - (b.totalAmount || 0);
        case 'DUE_DATE':
          return new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime();
        case 'NEWEST':
        default:
          return new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime();
      }
    });

    return result;
  }, [invoices, filterStatus, searchQuery, selectedSort]);

  // Filtered Payments
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

  // Filtered Quotes
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

  const handleCreateAction = () => {
    switch (activeTab) {
      case 'INVOICES':
        navigation.navigate('InvoiceCreate', {});
        break;
      case 'PAYMENTS':
        navigation.navigate('RecordPayment', {});
        break;
      case 'QUOTES':
        navigation.navigate('EstimateCreate', {});
        break;
      case 'EXPENSES':
        navigation.navigate('ExpenseForm', {});
        break;
    }
  };

  const getSearchPlaceholder = () => {
    switch (activeTab) {
      case 'INVOICES':
        return 'Search invoices, clients...';
      case 'PAYMENTS':
        return 'Search receipts, clients...';
      case 'QUOTES':
        return 'Search quotes, clients...';
      case 'EXPENSES':
        return 'Search expenses, vendors...';
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. Header with Transactions Hub title, Org name, and 44px round green + button */}
      <Header
        title="Transactions Hub"
        subtitle={activeOrg?.displayName || activeOrg?.name || 'Workspace'}
        rightAction={
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleCreateAction}
            style={styles.headerAddBtn}
          >
            <Plus size={22} color="#FFFFFF" strokeWidth={3} />
          </TouchableOpacity>
        }
      />

      <View style={[styles.mainWrapper, { maxWidth: contentMaxWidth, paddingHorizontal: horizontalPadding }]}>
        {/* 2. Top 3-Column Financial Summary (Billed, Collected, Outstanding) */}
        <TransactionSummary
          billed={totalBilled}
          collected={totalCollected}
          outstanding={totalOutstanding}
          currencySymbol={currencySymbol}
        />

        {/* 3. Main Switcher Tabs (Invoices, Payments, Quotes) */}
        <TransactionTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          invoiceCount={invoices.length}
          paymentCount={payments.length}
          quoteCount={estimates.length}
          expenseCount={expenses.length > 0 ? expenses.length : undefined}
        />

        {/* 4. Search Bar & Sort Trigger */}
        <View style={styles.searchSortRow}>
          <View style={styles.searchContainer}>
            <Search size={18} color="#64748B" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={getSearchPlaceholder()}
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setSearchQuery('')}
                style={styles.clearBtn}
              >
                <X size={16} color="#64748B" />
              </TouchableOpacity>
            )}
          </View>

          {activeTab === 'INVOICES' && (
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => setSortSheetVisible(true)}
              style={styles.sortBtn}
            >
              <ArrowDownUp size={18} color="#15803D" />
            </TouchableOpacity>
          )}
        </View>

        {/* 5. Horizontal Filter Chips */}
        {activeTab === 'INVOICES' && (
          <InvoiceFilterChips
            options={invoiceStatusFilterOptions}
            selectedValue={filterStatus}
            onSelect={setFilterStatus}
          />
        )}

        {activeTab === 'PAYMENTS' && (
          <InvoiceFilterChips
            options={paymentMethodFilterOptions}
            selectedValue={paymentMethodFilter}
            onSelect={setPaymentMethodFilter}
          />
        )}

        {activeTab === 'QUOTES' && (
          <InvoiceFilterChips
            options={estimateStatusFilterOptions}
            selectedValue={estimateStatusFilter}
            onSelect={setEstimateStatusFilter}
          />
        )}

        {/* 6. Main List Content */}
        {activeTab === 'INVOICES' && (
          <FlatList
            data={filteredInvoices}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <InvoiceListItem
                invoice={item}
                onPress={() => navigation.navigate('InvoiceDetail', { invoiceId: item.id })}
              />
            )}
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
                icon={<FileText size={32} color="#15803D" />}
                title={searchQuery || filterStatus !== 'ALL' ? 'No matching invoices' : 'No invoices yet'}
                description={
                  searchQuery || filterStatus !== 'ALL'
                    ? 'Try changing your filters or search terms.'
                    : 'Create your first professional invoice in seconds.'
                }
                actionTitle={searchQuery || filterStatus !== 'ALL' ? 'Clear Filters' : '+ Create Invoice'}
                onAction={() => {
                  if (searchQuery || filterStatus !== 'ALL') {
                    setFilterStatus('ALL');
                    setSearchQuery('');
                  } else {
                    navigation.navigate('InvoiceCreate', {});
                  }
                }}
              />
            }
          />
        )}

        {activeTab === 'PAYMENTS' && (
          <FlatList
            data={filteredPayments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <PaymentListItem
                payment={item}
                currencySymbol={currencySymbol}
                onPress={() => navigation.navigate('PaymentList')}
              />
            )}
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
                icon={<CreditCard size={32} color="#15803D" />}
                title="No payments recorded"
                description="Record client payments to keep your business records clean and up-to-date."
                actionTitle="+ Record Payment"
                onAction={() => navigation.navigate('RecordPayment', {})}
              />
            }
          />
        )}

        {activeTab === 'QUOTES' && (
          <FlatList
            data={filteredEstimates}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <QuoteListItem
                quote={item}
                currencySymbol={currencySymbol}
                onPress={() => navigation.navigate('EstimateDetail', { estimateId: item.id })}
              />
            )}
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
                icon={<FileSpreadsheet size={32} color="#15803D" />}
                title="No quotes found"
                description="Create quotes/estimates and convert them to invoices upon customer approval."
                actionTitle="+ Create Quote"
                onAction={() => navigation.navigate('EstimateCreate', {})}
              />
            }
          />
        )}
      </View>

      {/* Sort Bottom Sheet */}
      <SortBottomSheet
        visible={sortSheetVisible}
        onClose={() => setSortSheetVisible(false)}
        selectedSort={selectedSort}
        onSelectSort={setSelectedSort}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerAddBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  mainWrapper: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
    paddingTop: 8,
  },
  searchSortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  searchContainer: {
    flex: 1,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '500',
  },
  clearBtn: {
    padding: 4,
  },
  sortBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingTop: 4,
    paddingBottom: 96,
    flexGrow: 1,
  },
});
