import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Users } from 'lucide-react-native';
import { CustomerAvatar } from '../transactions/CustomerAvatar';
import { formatCurrency } from '../../utils/currency';

export interface TopCustomerItem {
  name: string;
  total: number;
  count: number;
}

interface TopCustomersCardProps {
  customers: TopCustomerItem[];
  currencySymbol?: string;
}

export const TopCustomersCard: React.FC<TopCustomersCardProps> = ({
  customers,
  currencySymbol = '$',
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Users size={17} color="#15803D" strokeWidth={2.2} />
        <Text style={styles.heading}>Top Clients by Revenue</Text>
      </View>

      {customers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No client sales recorded in this period.</Text>
        </View>
      ) : (
        customers.map((cust, idx) => (
          <View key={cust.name} style={styles.row}>
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>#{idx + 1}</Text>
            </View>

            <CustomerAvatar name={cust.name} size={34} />

            <View style={styles.infoCol}>
              <Text numberOfLines={1} style={styles.name}>
                {cust.name}
              </Text>
              <Text style={styles.count}>
                {cust.count} {cust.count === 1 ? 'Invoice' : 'Invoices'}
              </Text>
            </View>

            <Text style={styles.totalAmount}>
              {formatCurrency(cust.total, currencySymbol)}
            </Text>
          </View>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  heading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  emptyContainer: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  rankBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  rankText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  infoCol: {
    flex: 1,
    marginLeft: 10,
    marginRight: 8,
    justifyContent: 'center',
  },
  name: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 1,
  },
  count: {
    fontSize: 11,
    color: '#64748B',
  },
  totalAmount: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
});
