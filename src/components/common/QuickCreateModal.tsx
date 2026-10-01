import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  FileText,
  FileSpreadsheet,
  UserPlus,
  CreditCard,
  PackagePlus,
  Receipt,
  ChevronRight,
} from 'lucide-react-native';
import { BottomSheet } from './BottomSheet';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

interface QuickCreateModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectAction: (action: 'invoice' | 'estimate' | 'customer' | 'payment' | 'item' | 'expense') => void;
}

export const QuickCreateModal: React.FC<QuickCreateModalProps> = ({
  visible,
  onClose,
  onSelectAction,
}) => {
  const actions = [
    {
      key: 'invoice',
      title: 'Create Invoice',
      subtitle: 'Fast 60-second invoice with live PDF preview',
      icon: <FileText size={22} color="#FFFFFF" />,
      iconBg: colors.primary,
      featured: true,
    },
    {
      key: 'estimate',
      title: 'New Estimate / Quote',
      subtitle: 'Create a proposal and convert to invoice later',
      icon: <FileSpreadsheet size={20} color="#0369A1" />,
      iconBg: '#E0F2FE',
    },
    {
      key: 'customer',
      title: 'Add New Customer',
      subtitle: 'Save client contact and billing address',
      icon: <UserPlus size={20} color="#15803D" />,
      iconBg: '#DCFCE7',
    },
    {
      key: 'payment',
      title: 'Record Payment',
      subtitle: 'Log full, partial or advance payment',
      icon: <CreditCard size={20} color="#B45309" />,
      iconBg: '#FEF3C7',
    },
    {
      key: 'item',
      title: 'Add Product / Service',
      subtitle: 'Save reusable catalog item with price & tax',
      icon: <PackagePlus size={20} color="#6D28D9" />,
      iconBg: '#EDE9FE',
    },
    {
      key: 'expense',
      title: 'Log Business Expense',
      subtitle: 'Track expense receipts and billables',
      icon: <Receipt size={20} color="#B91C1C" />,
      iconBg: '#FEE2E2',
    },
  ];

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Create New"
      subtitle="What would you like to create?"
    >
      <View style={styles.container}>
        {actions.map((item) => (
          <TouchableOpacity
            key={item.key}
            activeOpacity={0.7}
            onPress={() => {
              onClose();
              onSelectAction(item.key as any);
            }}
            style={[
              styles.actionRow,
              item.featured && styles.featuredRow,
            ]}
          >
            <View style={[styles.iconContainer, { backgroundColor: item.iconBg }]}>
              {item.icon}
            </View>

            <View style={styles.textContainer}>
              <Text style={[styles.actionTitle, item.featured && styles.featuredTitle]}>
                {item.title}
              </Text>
              <Text style={styles.actionSubtitle}>{item.subtitle}</Text>
            </View>

            <ChevronRight size={18} color={colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 8,
  },
  featuredRow: {
    backgroundColor: colors.primarySubtle,
    borderColor: colors.primaryLight,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  actionTitle: {
    ...typography.bodySemiBold,
    color: colors.text,
    fontSize: 15,
  },
  featuredTitle: {
    color: colors.primaryDarker,
  },
  actionSubtitle: {
    ...typography.captionRegular,
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
});
