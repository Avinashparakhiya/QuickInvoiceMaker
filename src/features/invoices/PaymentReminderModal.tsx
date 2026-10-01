import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
  Share,
} from 'react-native';
import {
  MessageSquare,
  Mail,
  Phone,
  Copy,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
} from 'lucide-react-native';
import { BottomSheet } from '../../components/common/BottomSheet';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { generatePaymentReminderMessage } from '../../utils/reminders';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Invoice, Organization } from '../../types';

interface PaymentReminderModalProps {
  visible: boolean;
  onClose: () => void;
  invoice: Invoice;
  org: Organization;
}

export const PaymentReminderModal: React.FC<PaymentReminderModalProps> = ({
  visible,
  onClose,
  invoice,
  org,
}) => {
  const [tone, setTone] = useState<'FRIENDLY' | 'UPCOMING' | 'OVERDUE'>(
    invoice.status === 'OVERDUE' ? 'OVERDUE' : 'FRIENDLY'
  );

  const reminderData = generatePaymentReminderMessage(invoice, org, tone);

  const handleOpenWhatsApp = async () => {
    if (!reminderData.whatsappUrl) {
      Alert.alert(
        'Phone Number Required',
        'Customer has no phone number on file. Would you like to share the message via standard share sheet?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Share Text',
            onPress: () => Share.share({ message: reminderData.message }),
          },
        ]
      );
      return;
    }
    try {
      const supported = await Linking.canOpenURL(reminderData.whatsappUrl);
      if (supported) {
        await Linking.openURL(reminderData.whatsappUrl);
        onClose();
      } else {
        await Linking.openURL(reminderData.whatsappUrl);
        onClose();
      }
    } catch {
      Share.share({ message: reminderData.message });
    }
  };

  const handleOpenEmail = async () => {
    if (!reminderData.emailUrl) {
      Alert.alert(
        'Email Address Required',
        'Customer has no email address on file. Would you like to share the message via standard share sheet?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Share Text',
            onPress: () => Share.share({ message: reminderData.message }),
          },
        ]
      );
      return;
    }
    try {
      await Linking.openURL(reminderData.emailUrl);
      onClose();
    } catch (err: any) {
      Alert.alert('Email Error', err.message || 'Unable to launch email client.');
    }
  };

  const handleOpenSMS = async () => {
    if (!reminderData.smsUrl) {
      Alert.alert('Phone Number Required', 'Customer has no phone number on file.');
      return;
    }
    try {
      await Linking.openURL(reminderData.smsUrl);
      onClose();
    } catch (err: any) {
      Alert.alert('SMS Error', err.message || 'Unable to launch SMS client.');
    }
  };

  const handleShareUniversal = async () => {
    try {
      await Share.share({
        title: reminderData.subject,
        message: reminderData.message,
      });
      onClose();
    } catch (err: any) {
      Alert.alert('Share Error', err.message);
    }
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Payment Reminder"
      subtitle={`Send reminder to ${invoice.customerName || 'Customer'}`}
    >
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Tone Selector */}
        <View style={styles.toneSelector}>
          <TouchableOpacity
            onPress={() => setTone('FRIENDLY')}
            style={[styles.toneBtn, tone === 'FRIENDLY' && styles.toneBtnActive]}
          >
            <Sparkles size={16} color={tone === 'FRIENDLY' ? '#15803D' : colors.textSecondary} />
            <Text style={[styles.toneText, tone === 'FRIENDLY' && styles.toneTextActive]}>
              Friendly
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setTone('UPCOMING')}
            style={[styles.toneBtn, tone === 'UPCOMING' && styles.toneBtnActive]}
          >
            <Clock size={16} color={tone === 'UPCOMING' ? '#0369A1' : colors.textSecondary} />
            <Text style={[styles.toneText, tone === 'UPCOMING' && styles.toneTextActive]}>
              Due Soon
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setTone('OVERDUE')}
            style={[styles.toneBtn, tone === 'OVERDUE' && styles.toneBtnActive]}
          >
            <AlertTriangle size={16} color={tone === 'OVERDUE' ? '#B91C1C' : colors.textSecondary} />
            <Text style={[styles.toneText, tone === 'OVERDUE' && styles.toneTextActive]}>
              Overdue
            </Text>
          </TouchableOpacity>
        </View>

        {/* Message Preview Box */}
        <Card variant="softGreen" padding={14} style={styles.previewCard}>
          <Text style={styles.previewSubject}>{reminderData.subject}</Text>
          <View style={styles.previewDivider} />
          <Text style={styles.previewBody}>{reminderData.message}</Text>
        </Card>

        {/* Action Channels */}
        <Text style={styles.channelHeader}>Send via:</Text>

        <View style={styles.actionGrid}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleOpenWhatsApp}
            style={[styles.channelBtn, { backgroundColor: '#25D366' }]}
          >
            <MessageSquare size={20} color="#FFFFFF" />
            <Text style={styles.channelBtnText}>WhatsApp</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleOpenEmail}
            style={[styles.channelBtn, { backgroundColor: '#0284C7' }]}
          >
            <Mail size={20} color="#FFFFFF" />
            <Text style={styles.channelBtnText}>Email</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleOpenSMS}
            style={[styles.channelBtn, { backgroundColor: '#475569' }]}
          >
            <Phone size={20} color="#FFFFFF" />
            <Text style={styles.channelBtnText}>SMS</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleShareUniversal}
            style={[styles.channelBtn, { backgroundColor: colors.primaryDark }]}
          >
            <Share2 size={20} color="#FFFFFF" />
            <Text style={styles.channelBtnText}>Other App</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
  },
  toneSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  toneBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  toneBtnActive: {
    backgroundColor: colors.primarySubtle,
    borderColor: colors.primary,
  },
  toneText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  toneTextActive: {
    color: colors.primaryDarker,
  },
  previewCard: {
    marginBottom: 16,
  },
  previewSubject: {
    ...typography.bodySemiBold,
    color: colors.text,
    fontSize: 13,
  },
  previewDivider: {
    height: 1,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    marginVertical: 8,
  },
  previewBody: {
    ...typography.body,
    color: colors.text,
    fontSize: 13,
    lineHeight: 18,
  },
  channelHeader: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  channelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 4,
  },
  channelBtnText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 11,
  },
});
