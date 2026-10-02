import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { FileText, CreditCard, FileSpreadsheet, Receipt } from 'lucide-react-native';
import { colors } from '../../theme/colors';

export type TransactionTabKey = 'INVOICES' | 'PAYMENTS' | 'QUOTES' | 'EXPENSES';

interface TabItemConfig {
  key: TransactionTabKey;
  label: string;
  count: number;
}

interface TransactionTabsProps {
  activeTab: TransactionTabKey;
  onTabChange: (key: TransactionTabKey) => void;
  invoiceCount: number;
  paymentCount: number;
  quoteCount: number;
  expenseCount?: number;
}

export const TransactionTabs: React.FC<TransactionTabsProps> = ({
  activeTab,
  onTabChange,
  invoiceCount,
  paymentCount,
  quoteCount,
  expenseCount,
}) => {
  const tabs: TabItemConfig[] = [
    { key: 'INVOICES', label: 'Invoices', count: invoiceCount },
    { key: 'PAYMENTS', label: 'Payments', count: paymentCount },
    { key: 'QUOTES', label: 'Quotes', count: quoteCount },
  ];

  if (expenseCount !== undefined) {
    tabs.push({ key: 'EXPENSES', label: 'Expenses', count: expenseCount });
  }

  const getIcon = (key: TransactionTabKey, isActive: boolean) => {
    const iconColor = isActive ? '#15803D' : '#64748B';
    const iconSize = 16;
    switch (key) {
      case 'INVOICES':
        return <FileText size={iconSize} color={iconColor} strokeWidth={isActive ? 2.4 : 1.8} />;
      case 'PAYMENTS':
        return <CreditCard size={iconSize} color={iconColor} strokeWidth={isActive ? 2.4 : 1.8} />;
      case 'QUOTES':
        return <FileSpreadsheet size={iconSize} color={iconColor} strokeWidth={isActive ? 2.4 : 1.8} />;
      case 'EXPENSES':
        return <Receipt size={iconSize} color={iconColor} strokeWidth={isActive ? 2.4 : 1.8} />;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollRow}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              activeOpacity={0.75}
              onPress={() => onTabChange(tab.key)}
              style={[
                styles.tabBtn,
                isActive ? styles.tabBtnActive : styles.tabBtnInactive,
              ]}
            >
              {getIcon(tab.key, isActive)}
              <Text
                style={[
                  styles.tabLabel,
                  isActive ? styles.tabLabelActive : styles.tabLabelInactive,
                ]}
              >
                {tab.label}
              </Text>
              <View
                style={[
                  styles.countBadge,
                  isActive ? styles.countBadgeActive : styles.countBadgeInactive,
                ]}
              >
                <Text
                  style={[
                    styles.countText,
                    isActive ? styles.countTextActive : styles.countTextInactive,
                  ]}
                >
                  {tab.count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  scrollRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    minHeight: 42,
  },
  tabBtnActive: {
    backgroundColor: '#DCFCE7',
    borderColor: '#22C55E',
  },
  tabBtnInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: colors.border,
  },
  tabLabel: {
    fontSize: 13,
    letterSpacing: -0.1,
  },
  tabLabelActive: {
    color: '#15803D',
    fontWeight: '700',
  },
  tabLabelInactive: {
    color: '#64748B',
    fontWeight: '600',
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 8,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeActive: {
    backgroundColor: '#22C55E',
  },
  countBadgeInactive: {
    backgroundColor: '#F1F5F9',
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
  },
  countTextActive: {
    color: '#FFFFFF',
  },
  countTextInactive: {
    color: '#64748B',
  },
});
