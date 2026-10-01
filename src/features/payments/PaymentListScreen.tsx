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
import { useNavigation } from '@react-navigation/native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Search, Plus, CreditCard, Share2, Printer, ChevronRight } from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { useOrgStore } from '../../store/useOrgStore';
import { paymentRepository } from '../../database/repositories/paymentRepository';
import { buildPaymentReceiptHtml } from '../../pdf/receiptBuilder';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dates';
import { Payment } from '../../types';

export const PaymentListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { activeOrg } = useOrgStore();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMethod, setFilterMethod] = useState<string>('ALL');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (activeOrg) {
      loadPayments();
    }
  }, [activeOrg?.id, filterMethod, searchQuery]);

  const loadPayments = async () => {
    if (!activeOrg) return;
    let list = await paymentRepository.getByOrg(activeOrg.id);

    if (filterMethod !== 'ALL') {
      list = list.filter((p) => p.paymentMethod === filterMethod);
    }

    if (searchQuery.trim()) {
      const term = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.paymentNumber.toLowerCase().includes(term) ||
          p.customerName?.toLowerCase().includes(term) ||
          p.referenceNumber?.toLowerCase().includes(term) ||
          p.invoiceNumber?.toLowerCase().includes(term)
      );
    }

    setPayments(list);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPayments();
    setRefreshing(false);
  };

  const handleShareReceipt = async (payment: Payment) => {
    if (!activeOrg) return;
    try {
      const html = buildPaymentReceiptHtml(payment, activeOrg);
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          UTI: '.pdf',
          mimeType: 'application/pdf',
          dialogTitle: `Share Payment Voucher ${payment.paymentNumber}`,
        });
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Unable to share receipt.');
    }
  };

  const methods = ['ALL', 'BANK_TRANSFER', 'UPI', 'CASH', 'CARD', 'CHEQUE'];
  const symbol = activeOrg?.currencySymbol || '$';

  const renderItem = ({ item }: { item: Payment }) => (
    <Card variant="elevated" padding={14} style={styles.card}>
      <View style={styles.cardRow}>
        <View style={styles.cardLeft}>
          <View style={styles.titleRow}>
            <Text style={styles.paymentNum}>{item.paymentNumber}</Text>
            <View style={styles.methodBadge}>
              <Text style={styles.methodText}>{item.paymentMethod.replace('_', ' ')}</Text>
            </View>
          </View>
          <Text style={styles.customerName}>{item.customerName || 'Customer'}</Text>
          <Text style={styles.metaText}>
            {formatDate(item.paymentDate)}
            {item.invoiceNumber ? ` • Invoice #${item.invoiceNumber}` : ''}
            {item.referenceNumber ? ` • Ref: ${item.referenceNumber}` : ''}
          </Text>
        </View>

        <View style={styles.cardRight}>
          <Text style={styles.amount}>{formatCurrency(item.amount, symbol)}</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleShareReceipt(item)}
            style={styles.shareBtn}
          >
            <Share2 size={14} color={colors.primaryDarker} />
            <Text style={styles.shareBtnText}>Receipt</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Header
        title="Payment Records"
        subtitle={`${payments.length} transactions logged`}
        showBack
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('RecordPayment', {})}
            style={styles.addBtn}
          >
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        }
      />

      <View style={styles.searchSection}>
        <Input
          placeholder="Search receipt #, customer, reference..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          prefix={<Search size={18} color={colors.textSecondary} />}
          containerStyle={{ marginBottom: 8 }}
        />

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={methods}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setFilterMethod(item)}
              style={[
                styles.methodChip,
                filterMethod === item && styles.methodChipActive,
              ]}
            >
              <Text style={[styles.methodChipText, filterMethod === item && styles.methodChipTextActive]}>
                {item === 'ALL' ? 'All Methods' : item.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={payments}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon={<CreditCard size={28} color={colors.primaryDark} />}
            title="No Payments Logged"
            description="Record incoming client payments, retainers or split settlements."
            actionTitle="+ Record First Payment"
            onAction={() => navigation.navigate('RecordPayment', {})}
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
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    marginBottom: 8,
  },
  methodChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  methodChipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  methodChipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  methodChipTextActive: {
    color: colors.primaryDarker,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
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
    paddingRight: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  paymentNum: {
    ...typography.bodySemiBold,
    color: colors.text,
  },
  methodBadge: {
    backgroundColor: colors.gray100,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  methodText: {
    ...typography.micro,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  customerName: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  metaText: {
    ...typography.micro,
    color: colors.textMuted,
    marginTop: 2,
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  amount: {
    ...typography.bodySemiBold,
    color: colors.success,
    fontSize: 16,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: colors.primarySoft,
    marginTop: 6,
  },
  shareBtnText: {
    ...typography.micro,
    color: colors.primaryDarker,
    fontWeight: '700',
  },
});
