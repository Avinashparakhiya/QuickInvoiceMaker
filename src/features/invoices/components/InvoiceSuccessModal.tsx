import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Check, Eye, Share2, Plus, ArrowRight } from 'lucide-react-native';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { formatCurrency } from '../../../utils/currency';
import { Invoice } from '../../../types';

interface InvoiceSuccessModalProps {
  visible: boolean;
  invoice: Invoice | null;
  onViewInvoice: () => void;
  onShare: () => void;
  onCreateAnother: () => void;
  onClose: () => void;
}

export const InvoiceSuccessModal: React.FC<InvoiceSuccessModalProps> = ({
  visible,
  invoice,
  onViewInvoice,
  onShare,
  onCreateAnother,
}) => {
  if (!invoice) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Animated Success Check Icon */}
          <View style={styles.iconCircleOuter}>
            <View style={styles.iconCircleInner}>
              <Check size={36} color="#FFFFFF" strokeWidth={3.5} />
            </View>
          </View>

          <Text style={styles.title}>Invoice Created!</Text>
          <Text style={styles.subtitle}>
            Your invoice has been generated and is ready to share.
          </Text>

          {/* Invoice Summary Card */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Invoice Number</Text>
              <Text style={styles.summaryValBold}>{invoice.invoiceNumber}</Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Billed To</Text>
              <Text style={styles.summaryVal}>
                {invoice.customerName || 'Walk-in Customer'}
              </Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Amount</Text>
              <Text style={styles.summaryAmount}>
                {formatCurrency(invoice.totalAmount, invoice.currencySymbol)}
              </Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Payment Status</Text>
              <Badge status={invoice.status || 'UNPAID'} size="sm" />
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsContainer}>
            <Button
              title="View Invoice Details"
              onPress={onViewInvoice}
              icon={<Eye size={18} color="#FFFFFF" />}
              style={styles.primaryBtn}
            />

            <Button
              title="Share PDF / WhatsApp"
              variant="outline"
              onPress={onShare}
              icon={<Share2 size={18} color={colors.primaryDarker} />}
              style={styles.secondaryBtn}
            />

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onCreateAnother}
              style={styles.createAnotherBtn}
            >
              <Plus size={16} color={colors.textSecondary} />
              <Text style={styles.createAnotherText}>Create Another Invoice</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 28,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  iconCircleOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconCircleInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.h2,
    color: colors.text,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    ...typography.captionRegular,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  summaryCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 6,
  },
  summaryLabel: {
    ...typography.captionRegular,
    color: colors.textSecondary,
    fontSize: 13,
  },
  summaryVal: {
    ...typography.bodyMedium,
    color: colors.text,
    fontSize: 13,
  },
  summaryValBold: {
    ...typography.bodySemiBold,
    color: colors.text,
    fontSize: 14,
  },
  summaryAmount: {
    ...typography.bodySemiBold,
    color: '#15803D',
    fontSize: 15,
    fontWeight: '700',
  },
  actionsContainer: {
    width: '100%',
    gap: 10,
  },
  primaryBtn: {
    width: '100%',
  },
  secondaryBtn: {
    width: '100%',
  },
  createAnotherBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
    marginTop: 4,
  },
  createAnotherText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
