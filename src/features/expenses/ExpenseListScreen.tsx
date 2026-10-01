import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import {
  Search,
  Plus,
  Receipt,
  TrendingDown,
  TrendingUp,
  Trash2,
  Briefcase,
  Plane,
  Monitor,
  Building,
  Package,
  Zap,
  Megaphone,
  UserCheck,
} from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { EmptyState } from '../../components/common/EmptyState';
import { useOrgStore } from '../../store/useOrgStore';
import { useInvoiceStore } from '../../store/useInvoiceStore';
import { expenseRepository } from '../../database/repositories/expenseRepository';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dates';
import { Expense } from '../../types';

export const ExpenseListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const { activeOrg } = useOrgStore();
  const { kpiSummary } = useInvoiceStore();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalExpenseAmount, setTotalExpenseAmount] = useState(0);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadExpenses = async () => {
    if (!activeOrg) return;
    const list = await expenseRepository.getByOrg(activeOrg.id);
    const total = await expenseRepository.getTotalByOrg(activeOrg.id);
    setExpenses(list);
    setTotalExpenseAmount(total);
  };

  useEffect(() => {
    if (isFocused) {
      loadExpenses();
    }
  }, [isFocused, activeOrg?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadExpenses();
    setRefreshing(false);
  };

  const categories = [
    { label: 'All', value: 'ALL' },
    { label: 'Software', value: 'Software' },
    { label: 'Office', value: 'Office' },
    { label: 'Travel', value: 'Travel' },
    { label: 'Inventory', value: 'Inventory' },
    { label: 'Utilities', value: 'Utilities' },
    { label: 'Marketing', value: 'Marketing' },
    { label: 'Salaries', value: 'Salary' },
    { label: 'Other', value: 'Other' },
  ];

  const filteredExpenses = expenses.filter((exp) => {
    const matchesCategory =
      filterCategory === 'ALL' ||
      exp.category.toLowerCase().includes(filterCategory.toLowerCase());
    if (!matchesCategory) return false;

    if (!searchQuery.trim()) return true;
    const term = searchQuery.toLowerCase();
    return (
      exp.category.toLowerCase().includes(term) ||
      (exp.vendor && exp.vendor.toLowerCase().includes(term)) ||
      (exp.description && exp.description.toLowerCase().includes(term))
    );
  });

  const handleDelete = (expense: Expense) => {
    Alert.alert(
      'Delete Expense',
      `Delete ${expense.category} expense of ${formatCurrency(expense.amount, activeOrg?.currencySymbol || '$')}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await expenseRepository.delete(expense.id);
            await loadExpenses();
          },
        },
      ]
    );
  };

  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('software') || cat.includes('saas'))
      return <Monitor size={18} color="#2563EB" />;
    if (cat.includes('travel') || cat.includes('flight') || cat.includes('hotel'))
      return <Plane size={18} color="#059669" />;
    if (cat.includes('office') || cat.includes('rent'))
      return <Building size={18} color="#D97706" />;
    if (cat.includes('inventory') || cat.includes('material'))
      return <Package size={18} color="#7C3AED" />;
    if (cat.includes('utility') || cat.includes('bill'))
      return <Zap size={18} color="#EA580C" />;
    if (cat.includes('marketing') || cat.includes('ad'))
      return <Megaphone size={18} color="#DB2777" />;
    if (cat.includes('salary') || cat.includes('contractor'))
      return <UserCheck size={18} color="#0D9488" />;
    return <Receipt size={18} color={colors.textSecondary} />;
  };

  // Profit calculation
  const totalSales = kpiSummary?.totalSales || 0;
  const netProfit = totalSales - totalExpenseAmount;
  const profitMargin = totalSales > 0 ? ((netProfit / totalSales) * 100).toFixed(0) : '0';
  const symbol = activeOrg?.currencySymbol || '$';

  const renderExpenseItem = ({ item }: { item: Expense }) => (
    <Card variant="elevated" padding={14} style={styles.card}>
      <View style={styles.cardRow}>
        <View style={styles.iconBox}>{getCategoryIcon(item.category)}</View>

        <View style={styles.cardLeft}>
          <View style={styles.titleRow}>
            <Text style={styles.categoryText}>{item.category}</Text>
            {item.isBillable && (
              <View style={styles.billableBadge}>
                <Text style={styles.billableText}>Billable</Text>
              </View>
            )}
          </View>

          <Text numberOfLines={1} style={styles.vendorText}>
            {item.vendor || item.description || 'General Business Expense'}
          </Text>

          <Text style={styles.dateText}>{formatDate(item.expenseDate, 'MMM dd, yyyy')}</Text>
        </View>

        <View style={styles.cardRight}>
          <Text style={styles.expenseAmount}>
            -{formatCurrency(item.amount, item.currencyCode ? symbol : symbol)}
          </Text>
          <TouchableOpacity
            onPress={() => handleDelete(item)}
            style={styles.deleteBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Trash2 size={15} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Header
        title="Expenses & Costs"
        subtitle={`${filteredExpenses.length} tracked records`}
        showBack
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('ExpenseForm', {})}
            style={styles.addBtn}
          >
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        }
      />

      {/* Net Profit & Financial Health Card */}
      <View style={styles.kpiContainer}>
        <Card variant="softGreen" padding={16} style={styles.kpiCard}>
          <View style={styles.profitHeaderRow}>
            <View>
              <Text style={styles.profitLabel}>Net Operating Profit</Text>
              <Text
                style={[
                  styles.profitAmount,
                  { color: netProfit >= 0 ? colors.primaryDarker : colors.danger },
                ]}
              >
                {formatCurrency(netProfit, symbol)}
              </Text>
            </View>
            <View style={styles.marginBadge}>
              {netProfit >= 0 ? (
                <TrendingUp size={14} color="#15803D" />
              ) : (
                <TrendingDown size={14} color="#B91C1C" />
              )}
              <Text
                style={[
                  styles.marginText,
                  { color: netProfit >= 0 ? '#15803D' : '#B91C1C' },
                ]}
              >
                {profitMargin}% Margin
              </Text>
            </View>
          </View>

          <View style={styles.kpiDivider} />

          <View style={styles.kpiSubRow}>
            <View style={styles.kpiSubCol}>
              <Text style={styles.kpiSubLabel}>Sales Revenue</Text>
              <Text style={styles.kpiSubValue}>{formatCurrency(totalSales, symbol)}</Text>
            </View>
            <View style={styles.kpiSubCol}>
              <Text style={styles.kpiSubLabel}>Total Expenses</Text>
              <Text style={[styles.kpiSubValue, { color: colors.danger }]}>
                {formatCurrency(totalExpenseAmount, symbol)}
              </Text>
            </View>
          </View>
        </Card>
      </View>

      {/* Search Input */}
      <View style={styles.searchSection}>
        <Input
          placeholder="Search by vendor, category, memo..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          prefix={<Search size={18} color={colors.textSecondary} />}
          containerStyle={styles.searchInput}
        />
      </View>

      {/* Category Filter Chips */}
      <View style={styles.filtersSection}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item.value}
          contentContainerStyle={styles.filtersList}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setFilterCategory(item.value)}
              style={[
                styles.filterChip,
                filterCategory === item.value && styles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filterCategory === item.value && styles.filterChipTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Expense List */}
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
            description={
              searchQuery || filterCategory !== 'ALL'
                ? 'No expenses matched your filter criteria.'
                : 'Keep accurate profit margins by tracking vendor bills, software, and operational expenses.'
            }
            actionTitle="+ Log Expense"
            onAction={() => navigation.navigate('ExpenseForm', {})}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  kpiContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  kpiCard: {
    marginBottom: 4,
  },
  profitHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  profitLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  profitAmount: {
    ...typography.h1,
    fontSize: 26,
  },
  marginBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  marginText: {
    ...typography.caption,
    fontWeight: '700',
    fontSize: 11,
  },
  kpiDivider: {
    height: 1,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    marginVertical: 10,
  },
  kpiSubRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  kpiSubCol: {
    flex: 1,
  },
  kpiSubLabel: {
    ...typography.captionRegular,
    color: colors.textSecondary,
    fontSize: 11,
  },
  kpiSubValue: {
    ...typography.bodySemiBold,
    color: colors.text,
    marginTop: 2,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  searchInput: {
    marginBottom: 8,
  },
  filtersSection: {
    paddingBottom: 8,
  },
  filtersList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
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
    alignItems: 'center',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.cardPressed,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardLeft: {
    flex: 1,
    paddingRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  categoryText: {
    ...typography.bodySemiBold,
    color: colors.text,
  },
  billableBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  billableText: {
    ...typography.caption,
    fontWeight: '700',
    color: '#0369A1',
    fontSize: 9,
  },
  vendorText: {
    ...typography.captionRegular,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  dateText: {
    ...typography.captionRegular,
    color: colors.textMuted,
    fontSize: 11,
  },
  cardRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 4,
  },
  expenseAmount: {
    ...typography.bodySemiBold,
    color: colors.danger,
    fontSize: 15,
  },
  deleteBtn: {
    padding: 4,
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
