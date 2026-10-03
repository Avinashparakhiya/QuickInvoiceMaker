import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  Monitor,
  Plane,
  Building,
  Package,
  Zap,
  Megaphone,
  UserCheck,
  Receipt,
  User,
} from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { BottomSheet } from '../../components/common/BottomSheet';
import { AmbientBackground } from '../../components/common/ScreenBackground';
import { useOrgStore } from '../../store/useOrgStore';
import { customerRepository } from '../../database/repositories/customerRepository';
import { expenseRepository } from '../../database/repositories/expenseRepository';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { useResponsive } from '../../utils/useResponsive';
import { format } from 'date-fns';
import { Customer } from '../../types';

export const ExpenseFormScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { activeOrg } = useOrgStore();
  const { contentMaxWidth } = useResponsive();

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Software');
  const [expenseDate, setExpenseDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [vendor, setVendor] = useState('');
  const [description, setDescription] = useState('');
  const [isBillable, setIsBillable] = useState(false);

  // Customer selection for billable expenses
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerPickerVisible, setCustomerPickerVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (activeOrg) {
      customerRepository.getByOrg(activeOrg.id).then(setCustomers);
    }
  }, [activeOrg?.id]);

  const categoryOptions = [
    { label: 'Software & SaaS', value: 'Software', icon: <Monitor size={18} color="#2563EB" /> },
    { label: 'Office Supplies', value: 'Office', icon: <Building size={18} color="#D97706" /> },
    { label: 'Travel & Meals', value: 'Travel', icon: <Plane size={18} color="#059669" /> },
    { label: 'Inventory & Goods', value: 'Inventory', icon: <Package size={18} color="#7C3AED" /> },
    { label: 'Utilities & Bills', value: 'Utilities', icon: <Zap size={18} color="#EA580C" /> },
    { label: 'Marketing & Ads', value: 'Marketing', icon: <Megaphone size={18} color="#DB2777" /> },
    { label: 'Salaries / Contractors', value: 'Salary', icon: <UserCheck size={18} color="#0D9488" /> },
    { label: 'General / Other', value: 'Other', icon: <Receipt size={18} color={colors.textSecondary} /> },
  ];

  const handleSave = async () => {
    if (!activeOrg) return;
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid expense amount.');
      return;
    }
    if (!category.trim()) {
      Alert.alert('Validation Error', 'Please select an expense category.');
      return;
    }

    setSaving(true);
    try {
      const expenseId = `exp-${Date.now()}`;
      await expenseRepository.create({
        id: expenseId,
        organizationId: activeOrg.id,
        category,
        amount: numAmount,
        currencyCode: activeOrg.currencyCode || 'USD',
        expenseDate,
        vendor: vendor.trim() || undefined,
        description: description.trim() || undefined,
        isBillable,
        customerId: isBillable ? selectedCustomer?.id : undefined,
      });

      Alert.alert('Expense Logged', 'Expense recorded successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Save Error', err.message || 'Unable to record expense.');
    } finally {
      setSaving(false);
    }
  };

  const currencySymbol = activeOrg?.currencySymbol || '$';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <AmbientBackground />
      <Header title="Log Business Expense" showBack onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={[styles.scrollContent, { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' }]} showsVerticalScrollIndicator={false}>
        {/* Amount & Date Card */}
        <Card variant="elevated" padding={16} style={styles.card}>
          <Text style={styles.sectionHeading}>Expense Amount & Date</Text>
          
          <Input
            label="Amount"
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            prefix={currencySymbol}
          />

          <Input
            label="Expense Date"
            value={expenseDate}
            onChangeText={setExpenseDate}
            placeholder="YYYY-MM-DD"
          />
        </Card>

        {/* Category Picker Card */}
        <Card variant="elevated" padding={16} style={styles.card}>
          <Text style={styles.sectionHeading}>Expense Category</Text>
          <View style={styles.categoryGrid}>
            {categoryOptions.map((cat) => {
              const isSelected = category === cat.value;
              return (
                <TouchableOpacity
                  key={cat.value}
                  onPress={() => setCategory(cat.value)}
                  style={[
                    styles.categoryBtn,
                    isSelected && styles.categoryBtnActive,
                  ]}
                >
                  <View style={styles.categoryIcon}>{cat.icon}</View>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.categoryLabel,
                      isSelected && styles.categoryLabelActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Vendor & Memo Card */}
        <Card variant="elevated" padding={16} style={styles.card}>
          <Text style={styles.sectionHeading}>Vendor & Details</Text>
          
          <Input
            label="Vendor / Payee"
            placeholder="e.g. AWS, Adobe, OfficeMax, Contractor name"
            value={vendor}
            onChangeText={setVendor}
          />

          <Input
            label="Notes / Description"
            placeholder="Purpose of expense..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={2}
          />
        </Card>

        {/* Billable to Customer Toggle */}
        <Card variant="elevated" padding={16} style={styles.card}>
          <View style={styles.switchRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.switchTitle}>Billable to Client?</Text>
              <Text style={styles.switchSubtitle}>
                Attach this expense to a customer for future reimbursement
              </Text>
            </View>
            <Switch
              value={isBillable}
              onValueChange={setIsBillable}
              trackColor={{ false: colors.borderLight, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          {isBillable && (
            <View style={styles.billableCustomerBox}>
              <TouchableOpacity
                style={styles.customerSelector}
                onPress={() => setCustomerPickerVisible(true)}
              >
                <User size={18} color={colors.primaryDark} />
                <Text style={styles.customerSelectedText}>
                  {selectedCustomer?.name || 'Select Customer to Bill'}
                </Text>
                <Text style={styles.changeText}>Choose</Text>
              </TouchableOpacity>
            </View>
          )}
        </Card>

        <Button
          title="Save Expense"
          onPress={handleSave}
          loading={saving}
          size="lg"
          fullWidth
          style={{ marginTop: 8, marginBottom: 40 }}
        />
      </ScrollView>

      {/* Customer Picker Bottom Sheet */}
      <BottomSheet
        visible={customerPickerVisible}
        onClose={() => setCustomerPickerVisible(false)}
        title="Select Billable Client"
      >
        <ScrollView style={{ maxHeight: 350 }}>
          {customers.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={styles.pickerItem}
              onPress={() => {
                setSelectedCustomer(c);
                setCustomerPickerVisible(false);
              }}
            >
              <View>
                <Text style={styles.pickerTitle}>{c.name}</Text>
                <Text style={styles.pickerSubtitle}>{c.email || c.phone || 'Client'}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </BottomSheet>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    marginBottom: 14,
  },
  sectionHeading: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryBtn: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  categoryBtnActive: {
    backgroundColor: colors.primarySubtle,
    borderColor: colors.primary,
  },
  categoryIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
    flex: 1,
  },
  categoryLabelActive: {
    color: colors.primaryDarker,
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchTitle: {
    ...typography.bodySemiBold,
    color: colors.text,
  },
  switchSubtitle: {
    ...typography.captionRegular,
    color: colors.textSecondary,
    marginTop: 2,
  },
  billableCustomerBox: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 12,
  },
  customerSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardPressed,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  customerSelectedText: {
    ...typography.bodyMedium,
    color: colors.text,
    flex: 1,
    marginLeft: 8,
  },
  changeText: {
    ...typography.caption,
    color: colors.primaryDarker,
    fontWeight: '700',
  },
  pickerItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  pickerTitle: {
    ...typography.bodySemiBold,
    color: colors.text,
  },
  pickerSubtitle: {
    ...typography.captionRegular,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
