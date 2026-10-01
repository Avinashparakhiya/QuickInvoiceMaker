import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  Phone,
  Mail,
  MessageCircle,
  FileText,
  Plus,
  Edit,
  Trash2,
  Building,
  MapPin,
} from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useOrgStore } from '../../store/useOrgStore';
import { customerRepository } from '../../database/repositories/customerRepository';
import { invoiceRepository } from '../../database/repositories/invoiceRepository';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dates';
import { Customer, Invoice } from '../../types';

export const CustomerDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const customerId = route.params?.customerId;

  const { activeOrg } = useOrgStore();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    if (customerId && activeOrg) {
      loadCustomerData(customerId);
    }
  }, [customerId, activeOrg?.id]);

  const loadCustomerData = async (id: string) => {
    const cust = await customerRepository.getById(id);
    setCustomer(cust);

    if (activeOrg) {
      const invs = await invoiceRepository.getAll({
        orgId: activeOrg.id,
        customerId: id,
      });
      setInvoices(invs);
    }
  };

  const handleCall = () => {
    if (customer?.phone) {
      Linking.openURL(`tel:${customer.phone}`);
    }
  };

  const handleEmail = () => {
    if (customer?.email) {
      Linking.openURL(`mailto:${customer.email}`);
    }
  };

  const handleWhatsApp = () => {
    if (customer?.phone) {
      const cleanPhone = customer.phone.replace(/[^0-9]/g, '');
      Linking.openURL(`https://wa.me/${cleanPhone}`);
    }
  };

  const handleDelete = () => {
    if (!customer) return;
    Alert.alert(
      'Delete Customer',
      `Are you sure you want to delete ${customer.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await customerRepository.delete(customer.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  if (!customer) {
    return (
      <View style={styles.container}>
        <Header title="Customer Details" showBack onBack={() => navigation.goBack()} />
      </View>
    );
  }

  const symbol = activeOrg?.currencySymbol || '$';
  const totalBilled = invoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const totalPaid = invoices.reduce((sum, i) => sum + i.paidAmount, 0);
  const totalDue = invoices.reduce((sum, i) => sum + i.balanceDue, 0);

  return (
    <View style={styles.container}>
      <Header
        title={customer.name}
        showBack
        onBack={() => navigation.goBack()}
        rightAction={
          <View style={styles.headerRightActions}>
            <TouchableOpacity
              onPress={() => navigation.navigate('CustomerForm', { customerId: customer.id })}
              style={styles.iconBtn}
            >
              <Edit size={18} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={[styles.iconBtn, { marginLeft: 8 }]}>
              <Trash2 size={18} color={colors.danger} />
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <Card variant="softGreen" padding={18} style={styles.card}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{customer.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{customer.name}</Text>
              {customer.companyName ? (
                <Text style={styles.profileCompany}>{customer.companyName}</Text>
              ) : null}
              {customer.taxId ? (
                <Text style={styles.profileTax}>Tax ID: {customer.taxId}</Text>
              ) : null}
            </View>
          </View>

          {/* Contact Action Bar */}
          <View style={styles.contactBar}>
            {customer.phone ? (
              <TouchableOpacity activeOpacity={0.7} onPress={handleCall} style={styles.contactBtn}>
                <Phone size={16} color={colors.primaryDarker} />
                <Text style={styles.contactBtnText}>Call</Text>
              </TouchableOpacity>
            ) : null}
            {customer.phone ? (
              <TouchableOpacity activeOpacity={0.7} onPress={handleWhatsApp} style={styles.contactBtn}>
                <MessageCircle size={16} color="#16A34A" />
                <Text style={styles.contactBtnText}>WhatsApp</Text>
              </TouchableOpacity>
            ) : null}
            {customer.email ? (
              <TouchableOpacity activeOpacity={0.7} onPress={handleEmail} style={styles.contactBtn}>
                <Mail size={16} color="#0369A1" />
                <Text style={styles.contactBtnText}>Email</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </Card>

        {/* Financial Summary */}
        <Card variant="elevated" padding={16} style={styles.card}>
          <Text style={styles.sectionHeading}>Financial Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Billed</Text>
              <Text style={styles.summaryVal}>{formatCurrency(totalBilled, symbol)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Paid</Text>
              <Text style={[styles.summaryVal, { color: colors.success }]}>
                {formatCurrency(totalPaid, symbol)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Balance Due</Text>
              <Text style={[styles.summaryVal, { color: totalDue > 0 ? colors.danger : colors.text }]}>
                {formatCurrency(totalDue, symbol)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Billing Address */}
        {customer.billingStreet || customer.billingCity ? (
          <Card variant="elevated" padding={16} style={styles.card}>
            <View style={styles.addressTitleRow}>
              <MapPin size={16} color={colors.primaryDark} />
              <Text style={styles.sectionHeading}>Billing Address</Text>
            </View>
            <Text style={styles.addressText}>
              {customer.billingStreet ? `${customer.billingStreet}\n` : ''}
              {customer.billingCity ? `${customer.billingCity}, ` : ''}
              {customer.billingState ? `${customer.billingState} ` : ''}
              {customer.billingZip ? `${customer.billingZip}\n` : ''}
              {customer.billingCountry || ''}
            </Text>
          </Card>
        ) : null}

        {/* Customer's Invoice History */}
        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <Text style={styles.sectionHeading}>Invoice History ({invoices.length})</Text>
            <Button
              title="+ New Invoice"
              onPress={() => navigation.navigate('InvoiceCreate', {})}
              size="sm"
            />
          </View>

          {invoices.map((inv) => (
            <Card
              key={inv.id}
              variant="elevated"
              padding={14}
              onPress={() => navigation.navigate('InvoiceDetail', { invoiceId: inv.id })}
              style={styles.invCard}
            >
              <View style={styles.invRow}>
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.invNum}>{inv.invoiceNumber}</Text>
                    <Badge status={inv.status} size="sm" />
                  </View>
                  <Text style={styles.invDate}>Issued {formatDate(inv.issueDate)} • Due {formatDate(inv.dueDate)}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.invTotal}>{formatCurrency(inv.totalAmount, inv.currencySymbol)}</Text>
                  {inv.balanceDue > 0 ? (
                    <Text style={styles.invDue}>Bal: {formatCurrency(inv.balanceDue, inv.currencySymbol)}</Text>
                  ) : null}
                </View>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerRightActions: {
    flexDirection: 'row',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    marginBottom: 14,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    ...typography.h2,
    color: colors.primaryDarker,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...typography.h3,
    color: colors.text,
  },
  profileCompany: {
    ...typography.captionRegular,
    color: colors.textSecondary,
    marginTop: 2,
  },
  profileTax: {
    ...typography.micro,
    color: colors.textMuted,
    marginTop: 2,
  },
  contactBar: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    gap: 10,
  },
  contactBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: 6,
  },
  contactBtnText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
  },
  sectionHeading: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 12,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    ...typography.captionRegular,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  summaryVal: {
    ...typography.h3,
    color: colors.text,
  },
  addressTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addressText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  historySection: {
    marginTop: 4,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  invCard: {
    marginBottom: 8,
  },
  invRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  invNum: {
    ...typography.bodySemiBold,
    color: colors.text,
  },
  invDate: {
    ...typography.micro,
    color: colors.textMuted,
    marginTop: 2,
  },
  invTotal: {
    ...typography.bodySemiBold,
    color: colors.text,
  },
  invDue: {
    ...typography.micro,
    color: colors.danger,
    marginTop: 2,
  },
});
