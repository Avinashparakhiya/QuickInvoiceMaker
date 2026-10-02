import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  Building2,
  DollarSign,
  Percent,
  QrCode,
  Palette,
  ShieldCheck,
  Database,
  Info,
  ChevronRight,
  Hash,
  Bell,
  Lock,
  FileSpreadsheet,
  Layers,
  ArrowRight,
} from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { useOrgStore } from '../../store/useOrgStore';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { useResponsive } from '../../utils/useResponsive';

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { activeOrg } = useOrgStore();
  const { contentMaxWidth, isWideScreen } = useResponsive();

  const settingSections = [
    {
      title: 'Business & Organization',
      items: [
        {
          title: 'Organization Profiles',
          subtitle: `Active: ${activeOrg?.displayName || activeOrg?.name || 'Default Business'}`,
          icon: <Building2 size={20} color={colors.primaryDarker} />,
          iconBg: '#DCFCE7',
          onPress: () => navigation.navigate('OrganizationList'),
        },
        {
          title: 'Edit Current Profile',
          subtitle: 'Address, business contact, tax ID & email',
          icon: <Layers size={20} color="#0369A1" />,
          iconBg: '#E0F2FE',
          onPress: () => navigation.navigate('OrganizationForm', { organizationId: activeOrg?.id }),
        },
      ],
    },
    {
      title: 'Financial Configuration',
      items: [
        {
          title: 'Currency & Formatting',
          subtitle: `${activeOrg?.currencyCode || 'USD'} (${activeOrg?.currencySymbol || '$'}) • Standard format`,
          icon: <DollarSign size={20} color="#15803D" />,
          iconBg: '#DCFCE7',
          onPress: () => navigation.navigate('CurrencySettings'),
        },
        {
          title: 'Tax & GST Settings',
          subtitle: activeOrg?.taxId
            ? `Tax ID: ${activeOrg.taxId} • Mode: ${activeOrg.taxType || 'Exclusive'}`
            : 'Configure tax calculations, GSTIN & VAT',
          icon: <Percent size={20} color="#B45309" />,
          iconBg: '#FEF3C7',
          onPress: () => navigation.navigate('TaxSettings'),
        },
        {
          title: 'Bank & Receiving Payment Info',
          subtitle: activeOrg?.bankName ? `${activeOrg.bankName} • UPI: ${activeOrg.upiVpa || 'Active'}` : 'Configure receiving bank details',
          icon: <QrCode size={20} color="#0369A1" />,
          iconBg: '#E0F2FE',
          onPress: () => navigation.navigate('PaymentSettings'),
        },
      ],
    },
    {
      title: 'Document & Invoice Defaults',
      items: [
        {
          title: 'Invoice Numbering & Terms',
          subtitle: `Prefix: ${activeOrg?.invoicePrefix || 'INV-'} • Next: #${activeOrg?.invoiceNextNumber || '1001'}`,
          icon: <Hash size={20} color="#7E22CE" />,
          iconBg: '#F3E8FF',
          onPress: () => navigation.navigate('InvoiceNumbering'),
        },
        {
          title: 'Invoice Templates Gallery',
          subtitle: `Active style: ${activeOrg?.defaultTemplateId || 'classic_green'} (12 styles available)`,
          icon: <Palette size={20} color="#C2410C" />,
          iconBg: '#FFEDD5',
          onPress: () => navigation.navigate('TemplateGallery', {}),
        },
      ],
    },
    {
      title: 'App Preferences & Security',
      items: [
        {
          title: 'Notifications & Reminders',
          subtitle: 'Due date alerts, overdue notices & summaries',
          icon: <Bell size={20} color="#B45309" />,
          iconBg: '#FEF3C7',
          onPress: () => navigation.navigate('NotificationSettings'),
        },
        {
          title: 'Security & App Lock',
          subtitle: 'Biometric / PIN passcode & local sandbox shield',
          icon: <Lock size={20} color="#15803D" />,
          iconBg: '#DCFCE7',
          onPress: () => navigation.navigate('SecuritySettings'),
        },
        {
          title: 'Backup & Data Export',
          subtitle: 'Export CSV spreadsheets & full JSON database backup',
          icon: <Database size={20} color="#0369A1" />,
          iconBg: '#E0F2FE',
          onPress: () => navigation.navigate('Backup'),
        },
      ],
    },
    {
      title: 'About & Information',
      items: [
        {
          title: 'About Quick Invoice Maker',
          subtitle: 'Version 1.0.0 • Offline-first SQLite edition',
          icon: <Info size={20} color={colors.textSecondary} />,
          iconBg: '#F1F5F9',
          onPress: () => navigation.navigate('About'),
        },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <Header
        title="Settings Hub"
        subtitle="Configure workspaces, invoicing & security"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={[styles.scrollContent, { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' }]} showsVerticalScrollIndicator={false}>
        {/* Active Workspace Banner Card */}
        <Card variant="softGreen" padding={16} style={styles.workspaceCard}>
          <View style={styles.workspaceRow}>
            <View style={styles.orgAvatar}>
              <Text style={styles.orgAvatarText}>
                {(activeOrg?.displayName || activeOrg?.name || 'Q')[0].toUpperCase()}
              </Text>
            </View>
            <View style={styles.workspaceInfo}>
              <Text numberOfLines={1} style={styles.workspaceName}>
                {activeOrg?.displayName || activeOrg?.name || 'Default Workspace'}
              </Text>
              <Text style={styles.workspaceSub}>
                {activeOrg?.currencySymbol || '$'} {activeOrg?.currencyCode || 'USD'} • {activeOrg?.taxId ? `Tax: ${activeOrg.taxId}` : 'Tax ID Unset'}
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('OrganizationList')}
              style={styles.switchBtn}
            >
              <Text style={styles.switchBtnText}>Switch</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Grouped Settings Sections Grid on wide screen */}
        <View style={isWideScreen ? styles.gridContainer : undefined}>
          {settingSections.map((section) => (
            <View key={section.title} style={[styles.sectionContainer, isWideScreen && styles.sectionContainerWide]}>
              <Text style={styles.sectionHeaderTitle}>{section.title}</Text>
              <Card variant="elevated" padding={0} style={styles.sectionCard}>
                {section.items.map((item, idx) => (
                  <TouchableOpacity
                    key={item.title}
                    activeOpacity={0.7}
                    onPress={item.onPress}
                    style={[
                      styles.itemRow,
                      idx < section.items.length - 1 && styles.itemBorder,
                    ]}
                  >
                    <View style={[styles.iconContainer, { backgroundColor: item.iconBg }]}>
                      {item.icon}
                    </View>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemTitle}>{item.title}</Text>
                      <Text numberOfLines={1} style={styles.itemSubtitle}>
                        {item.subtitle}
                      </Text>
                    </View>
                    <ChevronRight size={18} color={colors.textMuted} />
                  </TouchableOpacity>
                ))}
              </Card>
            </View>
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
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  sectionContainerWide: {
    width: '48.5%',
  },
  workspaceCard: {
    marginBottom: 8,
    borderRadius: 16,
  },
  workspaceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orgAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  orgAvatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  workspaceInfo: {
    flex: 1,
    paddingRight: 8,
  },
  workspaceName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  workspaceSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  switchBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D7E5DC',
  },
  switchBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDarker,
  },
  sectionContainer: {
    marginTop: 14,
  },
  sectionHeaderTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: {
    overflow: 'hidden',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D7E5DC',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
    paddingRight: 8,
  },
  itemTitle: {
    ...typography.bodySemiBold,
    color: colors.text,
    fontSize: 14,
  },
  itemSubtitle: {
    ...typography.captionRegular,
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
});
