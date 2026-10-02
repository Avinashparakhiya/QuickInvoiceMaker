import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Search, Plus, UserPlus, Phone, Mail, ChevronRight, FileText, CheckCircle } from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { EmptyState } from '../../components/common/EmptyState';
import { useOrgStore } from '../../store/useOrgStore';
import { customerRepository } from '../../database/repositories/customerRepository';
import { invoiceRepository } from '../../database/repositories/invoiceRepository';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { formatCurrency } from '../../utils/currency';
import { Customer, Invoice } from '../../types';
import { useResponsive } from '../../utils/useResponsive';

const AVATAR_COLORS = [
  { bg: '#DCFCE7', text: '#15803D', border: '#86EFAC' },
  { bg: '#E0F2FE', text: '#0369A1', border: '#7DD3FC' },
  { bg: '#EDE9FE', text: '#6D28D9', border: '#C4B5FD' },
  { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' },
  { bg: '#FCE7F3', text: '#BE185D', border: '#FBCFE8' },
];

export const CustomerListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { contentMaxWidth, isWideScreen } = useResponsive();
  const { activeOrg } = useOrgStore();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoicesByCustomer, setInvoicesByCustomer] = useState<Record<string, { count: number; totalDue: number }>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'DUE' | 'ACTIVE'>('ALL');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (activeOrg) {
      loadCustomers();
    }
  }, [activeOrg?.id, searchQuery]);

  const loadCustomers = async () => {
    if (!activeOrg) return;
    let list: Customer[] = [];
    if (searchQuery.trim()) {
      list = await customerRepository.search(activeOrg.id, searchQuery);
    } else {
      list = await customerRepository.getByOrg(activeOrg.id);
    }

    // Load invoice balances per customer
    const allInvoices = await invoiceRepository.getAll({ orgId: activeOrg.id });
    const invMap: Record<string, { count: number; totalDue: number }> = {};
    for (const inv of allInvoices) {
      if (!invMap[inv.customerId]) {
        invMap[inv.customerId] = { count: 0, totalDue: 0 };
      }
      invMap[inv.customerId].count += 1;
      invMap[inv.customerId].totalDue += (inv.balanceDue || 0);
    }
    setInvoicesByCustomer(invMap);
    setCustomers(list);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCustomers();
    setRefreshing(false);
  };

  const filteredCustomers = customers.filter((cust) => {
    const stats = invoicesByCustomer[cust.id] || { count: 0, totalDue: 0 };
    if (filterMode === 'DUE') {
      return stats.totalDue > 0;
    }
    if (filterMode === 'ACTIVE') {
      return stats.count > 0;
    }
    return true;
  });

  const currencySymbol = activeOrg?.currencySymbol || '$';

  return (
    <View style={styles.container}>
      <Header
        title="Customers"
        subtitle={`${customers.length} clients in ${activeOrg?.displayName || activeOrg?.name || 'Workspace'}`}
        showBack
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('CustomerForm', {})}
            style={styles.headerAddBtn}
          >
            <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
        }
      />

      {/* Search Bar & Filter Chips */}
      <View style={[styles.searchSection, { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' }]}>
        <View style={styles.searchBox}>
          <Search size={18} color="#94A3B8" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search customers by name, company, email..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
          />
        </View>

        <View style={styles.filterChipRow}>
          {(['ALL', 'DUE', 'ACTIVE'] as const).map((mode) => {
            const isSelected = filterMode === mode;
            const label =
              mode === 'ALL'
                ? `All (${customers.length})`
                : mode === 'DUE'
                ? 'With Balance'
                : 'With Invoices';

            return (
              <TouchableOpacity
                key={mode}
                activeOpacity={0.7}
                onPress={() => setFilterMode(mode)}
                style={[
                  styles.filterChip,
                  isSelected && styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected && styles.filterChipTextActive,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <FlatList
        data={filteredCustomers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContent, { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        renderItem={({ item, index }) => {
          const colorTheme = AVATAR_COLORS[index % AVATAR_COLORS.length];
          const stats = invoicesByCustomer[item.id] || { count: 0, totalDue: 0 };

          return (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('CustomerDetail', { customerId: item.id })}
              style={styles.customerCard}
            >
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: colorTheme.bg, borderColor: colorTheme.border },
                ]}
              >
                <Text style={[styles.avatarText, { color: colorTheme.text }]}>
                  {item.name.charAt(0).toUpperCase()}
                </Text>
              </View>

              <View style={styles.details}>
                <Text numberOfLines={1} style={styles.name}>{item.name}</Text>
                <Text numberOfLines={1} style={styles.company}>
                  {item.companyName || item.email || item.phone || 'No company specified'}
                </Text>
                <View style={styles.metaRow}>
                  <View style={styles.invoiceCountBadge}>
                    <FileText size={11} color="#64748B" />
                    <Text style={styles.invoiceCountText}>
                      {stats.count} {stats.count === 1 ? 'Invoice' : 'Invoices'}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.rightSection}>
                {stats.totalDue > 0 ? (
                  <View style={styles.dueBadge}>
                    <Text style={styles.dueText}>
                      {formatCurrency(stats.totalDue, currencySymbol)}
                    </Text>
                    <Text style={styles.dueSub}>Due</Text>
                  </View>
                ) : stats.count > 0 ? (
                  <View style={styles.settledBadge}>
                    <CheckCircle size={12} color="#15803D" />
                    <Text style={styles.settledText}>Settled</Text>
                  </View>
                ) : (
                  <ChevronRight size={18} color={colors.textMuted} />
                )}
              </View>
            </TouchableOpacity>
          );
        }}
        ListFooterComponent={
          filteredCustomers.length > 0 ? (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('CustomerForm', {})}
              style={styles.addCustomerBtn}
            >
              <UserPlus size={18} color="#15803D" strokeWidth={2.5} />
              <Text style={styles.addCustomerBtnText}>+ Add New Customer</Text>
            </TouchableOpacity>
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            icon={<UserPlus size={32} color="#15803D" />}
            title="No Customers Found"
            description="Add your client contact details and billing addresses to quickly create invoices."
            actionTitle="+ Add First Customer"
            onAction={() => navigation.navigate('CustomerForm', {})}
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
  headerAddBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
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
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: colors.text,
    padding: 0,
  },
  filterChipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 32,
  },
  customerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
  },
  details: {
    flex: 1,
    paddingRight: 8,
  },
  name: {
    ...typography.bodySemiBold,
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  company: {
    ...typography.captionRegular,
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  invoiceCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  invoiceCountText: {
    ...typography.micro,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  dueBadge: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'flex-end',
  },
  dueText: {
    ...typography.caption,
    color: '#B45309',
    fontWeight: '700',
    fontSize: 12,
  },
  dueSub: {
    ...typography.micro,
    color: '#B45309',
    fontSize: 9,
    marginTop: -2,
  },
  settledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  settledText: {
    ...typography.micro,
    color: '#15803D',
    fontWeight: '700',
  },
  addCustomerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySubtle,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    borderRadius: 14,
    paddingVertical: 13,
    marginTop: 6,
    marginBottom: 16,
    gap: 8,
  },
  addCustomerBtnText: {
    ...typography.bodySemiBold,
    color: '#15803D',
    fontSize: 14,
  },
});
