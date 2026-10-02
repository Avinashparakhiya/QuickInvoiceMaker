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
import { Search, Plus, FileSpreadsheet, ArrowRight, CheckCircle, FileText } from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { EmptyState } from '../../components/common/EmptyState';
import { useOrgStore } from '../../store/useOrgStore';
import { estimateRepository } from '../../database/repositories/estimateRepository';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dates';
import { useResponsive } from '../../utils/useResponsive';
import { Estimate } from '../../types';

export const EstimateListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const { activeOrg } = useOrgStore();
  const { contentMaxWidth } = useResponsive();

  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadEstimates = async () => {
    if (!activeOrg) return;
    const list = await estimateRepository.getByOrg(activeOrg.id);
    setEstimates(list);
  };

  useEffect(() => {
    if (isFocused) {
      loadEstimates();
    }
  }, [isFocused, activeOrg?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEstimates();
    setRefreshing(false);
  };

  const statusFilters = [
    { label: 'All', value: 'ALL' },
    { label: 'Draft', value: 'DRAFT' },
    { label: 'Sent', value: 'SENT' },
    { label: 'Accepted', value: 'ACCEPTED' },
    { label: 'Declined', value: 'DECLINED' },
    { label: 'Converted', value: 'CONVERTED' },
  ];

  const filteredEstimates = estimates.filter((e) => {
    const matchesStatus = filterStatus === 'ALL' || e.status === filterStatus;
    if (!matchesStatus) return false;

    if (!searchQuery.trim()) return true;
    const term = searchQuery.toLowerCase();
    return (
      e.estimateNumber.toLowerCase().includes(term) ||
      (e.customerName && e.customerName.toLowerCase().includes(term))
    );
  });

  const handleConvertToInvoice = async (estimate: Estimate) => {
    try {
      Alert.alert(
        'Convert to Invoice',
        `Convert estimate ${estimate.estimateNumber} into a new invoice?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Convert Now',
            onPress: async () => {
              const invoice = await estimateRepository.convertToInvoice(estimate.id);
              await loadEstimates();
              Alert.alert(
                'Converted Successfully!',
                `Invoice ${invoice.invoiceNumber} has been created from this estimate.`,
                [
                  {
                    text: 'View Invoice',
                    onPress: () => navigation.navigate('InvoiceDetail', { invoiceId: invoice.id }),
                  },
                  { text: 'OK' },
                ]
              );
            },
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Conversion Failed', err.message || 'Unable to convert estimate.');
    }
  };

  const getStatusBadgeStyle = (status: Estimate['status']) => {
    switch (status) {
      case 'ACCEPTED':
        return { bg: '#DCFCE7', text: '#15803D' };
      case 'CONVERTED':
        return { bg: '#E0F2FE', text: '#0369A1' };
      case 'SENT':
        return { bg: '#FEF3C7', text: '#B45309' };
      case 'DECLINED':
        return { bg: '#FEE2E2', text: '#B91C1C' };
      default:
        return { bg: '#F1F5F9', text: '#475569' };
    }
  };

  const renderEstimateItem = ({ item }: { item: Estimate }) => {
    const badgeStyle = getStatusBadgeStyle(item.status);
    const symbol = item.currencySymbol || activeOrg?.currencySymbol || '$';

    return (
      <Card
        variant="elevated"
        padding={14}
        onPress={() => navigation.navigate('EstimateDetail', { estimateId: item.id })}
        style={styles.card}
      >
        <View style={styles.cardRow}>
          <View style={styles.cardLeft}>
            <View style={styles.titleRow}>
              <Text style={styles.estNumber}>{item.estimateNumber}</Text>
              <View style={[styles.statusBadge, { backgroundColor: badgeStyle.bg }]}>
                <Text style={[styles.statusBadgeText, { color: badgeStyle.text }]}>
                  {item.status}
                </Text>
              </View>
            </View>

            <Text numberOfLines={1} style={styles.customerName}>
              {item.customerName || 'Potential Client'}
            </Text>

            <Text style={styles.datesText}>
              Issued {formatDate(item.issueDate, 'MMM dd, yyyy')} • Valid till {formatDate(item.expiryDate, 'MMM dd')}
            </Text>
          </View>

          <View style={styles.cardRight}>
            <Text style={styles.totalAmount}>{formatCurrency(item.totalAmount, symbol)}</Text>
            
            {item.status !== 'CONVERTED' ? (
              <TouchableOpacity
                onPress={() => handleConvertToInvoice(item)}
                style={styles.convertBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.convertBtnText}>Convert</Text>
                <ArrowRight size={12} color={colors.primaryDarker} />
              </TouchableOpacity>
            ) : (
              <View style={styles.convertedPill}>
                <CheckCircle size={12} color={colors.info} />
                <Text style={styles.convertedPillText}>Invoiced</Text>
              </View>
            )}
          </View>
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Estimates & Quotes"
        subtitle={`${filteredEstimates.length} quotes created`}
        showBack
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('EstimateCreate', {})}
            style={styles.addBtn}
          >
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        }
      />

      {/* Search Input */}
      <View style={[styles.searchSection, { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' }]}>
        <Input
          placeholder="Search by quote # or client name..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          prefix={<Search size={18} color={colors.textSecondary} />}
          containerStyle={styles.searchInput}
        />
      </View>

      {/* Status Filter Chips */}
      <View style={[styles.filtersSection, { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' }]}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={statusFilters}
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

      {/* Estimates List */}
      <FlatList
        data={filteredEstimates}
        keyExtractor={(item) => item.id}
        renderItem={renderEstimateItem}
        contentContainerStyle={[styles.listContent, { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' }]}
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
            description={
              searchQuery || filterStatus !== 'ALL'
                ? 'Try adjusting your filters or search term.'
                : 'Send formal proposals and quotes to clients. Convert them to invoices with 1 tap upon acceptance!'
            }
            actionTitle="+ Create Estimate"
            onAction={() => navigation.navigate('EstimateCreate', {})}
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLeft: {
    flex: 1,
    paddingRight: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  estNumber: {
    ...typography.bodySemiBold,
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusBadgeText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '700',
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
    fontSize: 17,
    marginBottom: 6,
  },
  convertBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primarySubtle,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  convertBtnText: {
    ...typography.caption,
    color: colors.primaryDarker,
    fontWeight: '700',
    fontSize: 11,
  },
  convertedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  convertedPillText: {
    ...typography.caption,
    color: colors.info,
    fontWeight: '700',
    fontSize: 11,
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
