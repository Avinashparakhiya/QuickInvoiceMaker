import React, { useEffect, useState } from 'react';
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
  TrendingDown,
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

  const invoiceStatusFilters = [
    { label: 'All', value: 'ALL' },
    { label: 'Unpaid', value: 'UNPAID' },
    { label: 'Partial', value: 'PARTIAL' },
    { label: 'Paid', value: 'PAID' },
    { label: 'Overdue', value: 'OVERDUE' },
    { label: 'Draft', value: 'DRAFT' },
  ];

  const filteredPayments = payments.filter((p) => {
    if (!searchQuery.trim()) return true;
    const term = searchQuery.toLowerCase();
    return (
      p.paymentNumber.toLowerCase().includes(term) ||
      p.customerName?.toLowerCase().includes(term) ||
      p.invoiceNumber?.toLowerCase().includes(term) ||
      p.referenceNumber?.toLowerCase().includes(term)
    );
  });

  const filteredEstimates = estimates.filter((e) => {
    if (!searchQuery.trim()) return true;
    const term = searchQuery.toLowerCase();
    return (
      e.estimateNumber.toLowerCase().includes(term) ||
      (e.customerName && e.customerName.toLowerCase().includes(term))
    );
  });

  const filteredExpenses = expenses.filter((exp) => {
    if (!searchQuery.trim()) return true;
    const term = searchQuery.toLowerCase();
    return (
      exp.category.toLowerCase().includes(term) ||
      (exp.vendor && exp.vendor.toLowerCase().includes(term)) ||
      (exp.description && exp.description.toLowerCase().includes(term))
    );
  });

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

  const renderInvoiceItem = ({ item }: { item: Invoice }) => (
    <Card
      variant="elevated"
      padding={14}
      onPress={() => navigation.navigate('InvoiceDetail', { invoiceId: item.id })}
      style={styles.card}
    >
      <View style={styles.cardRow}>
        <View style={styles.cardLeft}>
          <View style={styles.titleRow}>
            <Text style={styles.invNumber}>{item.invoiceNumber}</Text>
            <Badge status={item.status} size="sm" />
          </View>
          <Text numberOfLines={1} style={styles.customerName}>
            {item.customerName || 'Walk-in Customer'}
          </Text>
          <Text style={styles.datesText}>
            {formatDate(item.issueDate, 'MMM dd, yyyy')} • Due {formatDate(item.dueDate, 'MMM dd')}
          </Text>
        </View>

        <View style={styles.cardRight}>
          <Text style={styles.totalAmount}>
            {formatCurrency(item.totalAmount, item.currencySymbol)}
          </Text>
          {item.status === 'PARTIAL' ? (
            <Text style={styles.balanceText}>
              Due: {formatCurrency(item.balanceDue, item.currencySymbol)}
            </Text>
          ) : item.status === 'PAID' ? (
            <Text style={styles.paidText}>Fully Settled</Text>
          ) : null}
        </View>
      </View>
    </Card>
  );

  const renderPaymentItem = ({ item }: { item: Payment }) => (
    <Card
      variant="elevated"
      padding={14}
      onPress={() => navigation.navigate('PaymentList')}
      style={styles.card}
    >
      <View style={styles.cardRow}>
        <View style={styles.cardLeft}>
          <View style={styles.titleRow}>
            <Text style={styles.invNumber}>{item.paymentNumber}</Text>
            <View style={styles.methodBadge}>
              <Text style={styles.methodText}>{item.paymentMethod.replace('_', ' ')}</Text>
            </View>
          </View>
          <Text style={styles.customerName}>{item.customerName || 'Customer'}</Text>
          <Text style={styles.datesText}>
            {formatDate(item.paymentDate)}
            {item.invoiceNumber ? ` • Invoice #${item.invoiceNumber}` : ''}
          </Text>
        </View>

        <View style={styles.cardRight}>
          <Text style={[styles.totalAmount, { color: colors.success }]}>
            +{formatCurrency(item.amount, activeOrg?.currencySymbol || '$')}
          </Text>
        </View>
      </View>
    </Card>
  );

  const renderEstimateItem = ({ item }: { item: Estimate }) => (
    <Card
      variant="elevated"
      padding={14}
      onPress={() => navigation.navigate('EstimateDetail', { estimateId: item.id })}
      style={styles.card}
    >
      <View style={styles.cardRow}>
        <View style={styles.cardLeft}>
          <View style={styles.titleRow}>
            <Text style={styles.invNumber}>{item.estimateNumber}</Text>
            <View style={styles.estimateBadge}>
              <Text style={styles.estimateBadgeText}>{item.status}</Text>
            </View>
          </View>
          <Text style={styles.customerName}>{item.customerName || 'Potential Client'}</Text>
          <Text style={styles.datesText}>
            Issued {formatDate(item.issueDate, 'MMM dd')} • Valid till {formatDate(item.expiryDate, 'MMM dd')}
          </Text>
        </View>

        <View style={styles.cardRight}>
          <Text style={styles.totalAmount}>
            {formatCurrency(item.totalAmount, item.currencySymbol || activeOrg?.currencySymbol || '$')}
          </Text>
          {item.status !== 'CONVERTED' ? (
            <Text style={styles.actionPromptText}>Tap to Convert</Text>
          ) : (
            <Text style={styles.paidText}>Converted</Text>
          )}
        </View>
      </View>
    </Card>
  );

  const renderExpenseItem = ({ item }: { item: Expense }) => (
    <Card
      variant="elevated"
      padding={14}
      onPress={() => navigation.navigate('ExpenseList')}
      style={styles.card}
    >
      <View style={styles.cardRow}>
        <View style={styles.cardLeft}>
          <View style={styles.titleRow}>
            <Text style={styles.invNumber}>{item.category}</Text>
            {item.isBillable && (
              <View style={styles.billableBadge}>
                <Text style={styles.billableText}>Billable</Text>
              </View>
            )}
          </View>
          <Text style={styles.customerName}>{item.vendor || item.description || 'Expense'}</Text>
          <Text style={styles.datesText}>{formatDate(item.expenseDate, 'MMM dd, yyyy')}</Text>
        </View>

        <View style={styles.cardRight}>
          <Text style={[styles.totalAmount, { color: colors.danger }]}>
            -{formatCurrency(item.amount, activeOrg?.currencySymbol || '$')}
          </Text>
        </View>
      </View>
    </Card>
  );

  const getRecordCount = () => {
    switch (activeTab) {
      case 'INVOICES':
        return invoices.length;
      case 'PAYMENTS':
        return filteredPayments.length;
      case 'ESTIMATES':
        return filteredEstimates.length;
      case 'EXPENSES':
        return filteredExpenses.length;
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Transactions Hub"
        subtitle={`${getRecordCount()} records`}
        rightAction={
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleFabPress}
            style={styles.addBtn}
          >
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        }
      />

      {/* Main 4-Tab Switcher */}
      <View style={styles.mainTabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mainTabRow}>
          <TouchableOpacity
            onPress={() => setActiveTab('INVOICES')}
            style={[styles.mainTabBtn, activeTab === 'INVOICES' && styles.mainTabBtnActive]}
          >
            <FileText size={15} color={activeTab === 'INVOICES' ? colors.primaryDarker : colors.textSecondary} />
            <Text style={[styles.mainTabText, activeTab === 'INVOICES' && styles.mainTabTextActive]}>
              Invoices ({invoices.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('PAYMENTS')}
            style={[styles.mainTabBtn, activeTab === 'PAYMENTS' && styles.mainTabBtnActive]}
          >
            <CreditCard size={15} color={activeTab === 'PAYMENTS' ? colors.primaryDarker : colors.textSecondary} />
            <Text style={[styles.mainTabText, activeTab === 'PAYMENTS' && styles.mainTabTextActive]}>
              Payments ({payments.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('ESTIMATES')}
            style={[styles.mainTabBtn, activeTab === 'ESTIMATES' && styles.mainTabBtnActive]}
          >
            <FileSpreadsheet size={15} color={activeTab === 'ESTIMATES' ? colors.primaryDarker : colors.textSecondary} />
            <Text style={[styles.mainTabText, activeTab === 'ESTIMATES' && styles.mainTabTextActive]}>
              Quotes ({estimates.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('EXPENSES')}
            style={[styles.mainTabBtn, activeTab === 'EXPENSES' && styles.mainTabBtnActive]}
          >
            <Receipt size={15} color={activeTab === 'EXPENSES' ? colors.primaryDarker : colors.textSecondary} />
            <Text style={[styles.mainTabText, activeTab === 'EXPENSES' && styles.mainTabTextActive]}>
              Expenses ({expenses.length})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Search Input */}
      <View style={styles.searchSection}>
        <Input
          placeholder={
            activeTab === 'INVOICES'
              ? 'Search by invoice #, customer name...'
              : activeTab === 'PAYMENTS'
              ? 'Search receipt #, customer...'
              : activeTab === 'ESTIMATES'
              ? 'Search quote #, customer...'
              : 'Search expense category, vendor...'
          }
          value={searchQuery}
          onChangeText={setSearchQuery}
          prefix={<Search size={18} color={colors.textSecondary} />}
          containerStyle={styles.searchInput}
        />
      </View>

      {/* Status Filter Chips (Only for Invoices) */}
      {activeTab === 'INVOICES' && (
        <View style={styles.filtersSection}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={invoiceStatusFilters}
            keyExtractor={(item) => item.value}
            contentContainerStyle={styles.filtersList}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setFilterStatus(item.value)}
                style={[
                  styles.filterChip,
                  filterStatus === item.value && styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filterStatus === item.value && styles.filterChipTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Active Tab List */}
      {activeTab === 'INVOICES' && (
        <FlatList
          data={invoices}
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
              icon={<FileText size={44} color={colors.primary} />}
              title="No Invoices Found"
              description="Create and send your first professional invoice."
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
              icon={<CreditCard size={44} color={colors.primary} />}
              title="No Payments Recorded"
              description="Record payments received from clients to track balances."
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
              icon={<FileSpreadsheet size={44} color={colors.primary} />}
              title="No Estimates Found"
              description="Draft estimates and proposals to win more client contracts."
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
              icon={<Receipt size={44} color={colors.primary} />}
              title="No Expenses Logged"
              description="Keep clean financial records by tracking business costs."
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
  mainTabContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
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
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  mainTabBtnActive: {
    backgroundColor: colors.primarySubtle,
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
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  searchInput: {
    marginBottom: 4,
  },
  filtersSection: {
    paddingBottom: 4,
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
    borderColor: colors.borderLight,
  },
  filterChipActive: {
    backgroundColor: colors.primaryDarker,
    borderColor: colors.primaryDarker,
  },
  filterChipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
    flexGrow: 1,
  },
  card: {
    marginBottom: 10,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLeft: {
    flex: 1,
    paddingRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  invNumber: {
    ...typography.bodySemiBold,
    color: colors.text,
  },
  customerName: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  datesText: {
    ...typography.captionRegular,
    color: colors.textMuted,
    fontSize: 12,
  },
  cardRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  totalAmount: {
    ...typography.h3,
    color: colors.text,
    fontSize: 16,
  },
  balanceText: {
    ...typography.caption,
    color: colors.danger,
    fontWeight: '600',
    marginTop: 2,
  },
  paidText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
    marginTop: 2,
  },
  actionPromptText: {
    ...typography.caption,
    color: colors.primaryDarker,
    fontWeight: '700',
    marginTop: 2,
  },
  methodBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  methodText: {
    ...typography.caption,
    color: '#B45309',
    fontWeight: '700',
    fontSize: 10,
  },
  estimateBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  estimateBadgeText: {
    ...typography.caption,
    color: '#0369A1',
    fontWeight: '700',
    fontSize: 10,
  },
  billableBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  billableText: {
    ...typography.caption,
    color: '#0369A1',
    fontWeight: '700',
    fontSize: 10,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
