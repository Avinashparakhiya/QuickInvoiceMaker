import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { Search, UserPlus, Check, User, Building, Phone, Mail } from 'lucide-react-native';
import { BottomSheet } from '../../../components/common/BottomSheet';
import { Button } from '../../../components/common/Button';
import { customerRepository } from '../../../database/repositories/customerRepository';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { Customer } from '../../../types';

interface QuickCustomerModalProps {
  visible: boolean;
  onClose: () => void;
  customers: Customer[];
  selectedCustomerId?: string;
  onSelectCustomer: (customer: Customer) => void;
  orgId: string;
}

export const QuickCustomerModal: React.FC<QuickCustomerModalProps> = ({
  visible,
  onClose,
  customers,
  selectedCustomerId,
  onSelectCustomer,
  orgId,
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'create'>('list');
  const [searchQuery, setSearchQuery] = useState('');

  // Form Fields for new customer
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.companyName && c.companyName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreateCustomer = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter customer name.');
      return;
    }

    setSaving(true);
    try {
      const newCust = await customerRepository.create({
        id: `cust-${Date.now()}`,
        organizationId: orgId,
        name: name.trim(),
        companyName: companyName.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
      });

      onSelectCustomer(newCust);
      setName('');
      setCompanyName('');
      setEmail('');
      setPhone('');
      setViewMode('list');
      onClose();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save customer.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={viewMode === 'list' ? 'Select Customer' : 'Add New Customer'}
      subtitle={
        viewMode === 'list'
          ? 'Choose a client or add a new one'
          : 'Save customer contact details for billing'
      }
    >
      {viewMode === 'list' ? (
        <View style={styles.container}>
          {/* Search Bar */}
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

          {/* Add New Customer CTA */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setViewMode('create')}
            style={styles.addNewRow}
          >
            <View style={styles.addIconBox}>
              <UserPlus size={18} color="#15803D" />
            </View>
            <Text style={styles.addNewText}>+ Add New Customer</Text>
          </TouchableOpacity>

          {/* Customers List */}
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {filteredCustomers.length === 0 ? (
              <View style={styles.emptyList}>
                <Text style={styles.emptyText}>No customers found.</Text>
                <Button
                  title="+ Create This Customer"
                  size="sm"
                  variant="outline"
                  onPress={() => {
                    setName(searchQuery);
                    setViewMode('create');
                  }}
                  style={{ marginTop: 10 }}
                />
              </View>
            ) : (
              filteredCustomers.map((cust) => {
                const isSelected = selectedCustomerId === cust.id;
                return (
                  <TouchableOpacity
                    key={cust.id}
                    activeOpacity={0.7}
                    onPress={() => {
                      onSelectCustomer(cust);
                      onClose();
                    }}
                    style={[
                      styles.customerCard,
                      isSelected && styles.customerCardSelected,
                    ]}
                  >
                    <View
                      style={[
                        styles.avatar,
                        isSelected && styles.avatarSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.avatarText,
                          isSelected && styles.avatarTextSelected,
                        ]}
                      >
                        {cust.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>

                    <View style={styles.custDetails}>
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.custName,
                          isSelected && styles.custNameSelected,
                        ]}
                      >
                        {cust.name}
                      </Text>
                      <Text numberOfLines={1} style={styles.custMeta}>
                        {cust.companyName || cust.email || cust.phone || 'No additional info'}
                      </Text>
                    </View>

                    {isSelected ? (
                      <View style={styles.checkCircle}>
                        <Check size={14} color="#FFFFFF" strokeWidth={3} />
                      </View>
                    ) : null}
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>
      ) : (
        <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Customer Name *</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. John Doe / Acme Corp"
              placeholderTextColor="#94A3B8"
              style={styles.textInput}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Company Name (Optional)</Text>
            <TextInput
              value={companyName}
              onChangeText={setCompanyName}
              placeholder="e.g. Acme Innovations LLC"
              placeholderTextColor="#94A3B8"
              style={styles.textInput}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="john@example.com"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.textInput}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="+1 555-0199"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
              style={styles.textInput}
            />
          </View>

          <View style={styles.btnRow}>
            <Button
              title="Back to List"
              variant="outline"
              onPress={() => setViewMode('list')}
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              title="Save & Select"
              onPress={handleCreateCustomer}
              loading={saving}
              disabled={!name.trim()}
              style={{ flex: 1.5 }}
            />
          </View>
        </ScrollView>
      )}
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    maxHeight: 420,
    paddingBottom: 16,
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
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: colors.text,
    padding: 0,
  },
  addNewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    marginBottom: 10,
  },
  addIconBox: {
    marginRight: 8,
  },
  addNewText: {
    ...typography.bodySemiBold,
    color: '#15803D',
    fontSize: 13,
  },
  list: {
    maxHeight: 280,
  },
  customerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  customerCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#F0FDF4',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarSelected: {
    backgroundColor: '#DCFCE7',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748B',
  },
  avatarTextSelected: {
    color: '#15803D',
  },
  custDetails: {
    flex: 1,
    paddingRight: 8,
  },
  custName: {
    ...typography.bodySemiBold,
    color: colors.text,
    fontSize: 14,
  },
  custNameSelected: {
    color: '#15803D',
    fontWeight: '700',
  },
  custMeta: {
    ...typography.captionRegular,
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyList: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  formContainer: {
    maxHeight: 420,
    paddingBottom: 16,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    ...typography.captionRegular,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
  },
  btnRow: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 16,
  },
});
