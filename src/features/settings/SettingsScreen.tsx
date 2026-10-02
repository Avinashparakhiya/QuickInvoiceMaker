import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  Building2,
  DollarSign,
  Percent,
  QrCode,
  Palette,
  Database,
  Info,
  Hash,
  Bell,
  Lock,
  Layers,
  PenTool,
  Users,
  Sun,
} from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { ActiveOrgBanner } from '../../components/settings/ActiveOrgBanner';
import { SettingsSectionCard, SettingItem } from '../../components/settings/SettingsSectionCard';
import { SettingsSearchBar } from '../../components/settings/SettingsSearchBar';
import { OrgSwitcherModal } from '../../components/common/OrgSwitcherModal';
import { useOrgStore } from '../../store/useOrgStore';
import { colors } from '../../theme/colors';
import { useResponsive } from '../../utils/useResponsive';

interface SectionGroup {
  title: string;
  items: SettingItem[];
}

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { activeOrg } = useOrgStore();
  const { contentMaxWidth, horizontalPadding, isWideScreen } = useResponsive();
  const [searchQuery, setSearchQuery] = useState('');
  const [orgSwitcherVisible, setOrgSwitcherVisible] = useState(false);

  const orgName = activeOrg?.displayName || activeOrg?.name || 'Default Workspace';
  const currencyCode = activeOrg?.currencyCode || 'USD';
  const currencySymbol = activeOrg?.currencySymbol || '$';
  const taxId = activeOrg?.taxId || '';
  const taxMode = activeOrg?.taxType || 'Exclusive';
  const invoicePrefix = activeOrg?.invoicePrefix || 'INV-';
  const nextInvoiceNumber = activeOrg?.invoiceNextNumber || 1001;
  const defaultTemplate = activeOrg?.defaultTemplateId || 'classic_green';

  const allSections: SectionGroup[] = [
    {
      title: 'Business & Organization',
      items: [
        {
          title: 'Organization Profiles',
          subtitle: `Active: ${orgName}`,
          icon: <Building2 size={20} color="#15803D" strokeWidth={2.2} />,
          iconBg: '#DCFCE7',
          onPress: () => navigation.navigate('OrganizationList'),
        },
        {
          title: 'Edit Current Profile',
          subtitle: 'Address, business contact, tax ID & email',
          icon: <Layers size={20} color="#0369A1" strokeWidth={2.2} />,
          iconBg: '#E0F2FE',
          onPress: () => navigation.navigate('OrganizationForm', { organizationId: activeOrg?.id }),
        },
        {
          title: 'Customers & Contacts',
          subtitle: 'Manage clients and billing contacts',
          icon: <Users size={20} color="#7E22CE" strokeWidth={2.2} />,
          iconBg: '#F3E8FF',
          onPress: () => navigation.navigate('CustomerList'),
        },
      ],
    },
    {
      title: 'Financial Configuration',
      items: [
        {
          title: 'Currency & Formatting',
          subtitle: `${currencyCode} (${currencySymbol}) • Standard format`,
          icon: <DollarSign size={20} color="#15803D" strokeWidth={2.2} />,
          iconBg: '#DCFCE7',
          onPress: () => navigation.navigate('CurrencySettings'),
        },
        {
          title: 'Tax & GST Settings',
          subtitle: taxId
            ? `Tax ID: ${taxId} • Mode: ${taxMode}`
            : 'Configure tax calculations, GSTIN & VAT',
          icon: <Percent size={20} color="#B45309" strokeWidth={2.2} />,
          iconBg: '#FEF3C7',
          onPress: () => navigation.navigate('TaxSettings'),
        },
        {
          title: 'Bank & Receiving Payment Info',
          subtitle: activeOrg?.bankName
            ? `${activeOrg.bankName} • UPI: ${activeOrg.upiVpa || 'Configured'}`
            : 'Configure receiving bank details & UPI',
          icon: <QrCode size={20} color="#0284C7" strokeWidth={2.2} />,
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
          subtitle: `Prefix: ${invoicePrefix} • Next: #${nextInvoiceNumber}`,
          icon: <Hash size={20} color="#7E22CE" strokeWidth={2.2} />,
          iconBg: '#F3E8FF',
          onPress: () => navigation.navigate('InvoiceNumbering'),
        },
        {
          title: 'Invoice Templates Gallery',
          subtitle: `Active style: ${defaultTemplate.replace(/_/g, ' ')} (12 styles)`,
          icon: <Palette size={20} color="#C2410C" strokeWidth={2.2} />,
          iconBg: '#FFEDD5',
          onPress: () => navigation.navigate('TemplateGallery', {}),
        },
        {
          title: 'Digital Signature & Stamp',
          subtitle: activeOrg?.signatureUri ? 'Digital signature configured' : 'Configure signature & company stamp',
          icon: <PenTool size={20} color="#15803D" strokeWidth={2.2} />,
          iconBg: '#DCFCE7',
          onPress: () => navigation.navigate('SignatureSettings'),
        },
      ],
    },
    {
      title: 'App Preferences & Security',
      items: [
        {
          title: 'Notifications & Reminders',
          subtitle: 'Due date alerts, overdue notices & summaries',
          icon: <Bell size={20} color="#B45309" strokeWidth={2.2} />,
          iconBg: '#FEF3C7',
          onPress: () => navigation.navigate('NotificationSettings'),
        },
        {
          title: 'Security & App Lock',
          subtitle: 'Biometric / PIN passcode & local sandbox shield',
          icon: <Lock size={20} color="#15803D" strokeWidth={2.2} />,
          iconBg: '#DCFCE7',
          onPress: () => navigation.navigate('SecuritySettings'),
        },
        {
          title: 'Data & Backup',
          subtitle: 'Export CSV spreadsheets & full JSON database backup',
          icon: <Database size={20} color="#0369A1" strokeWidth={2.2} />,
          iconBg: '#E0F2FE',
          onPress: () => navigation.navigate('Backup'),
        },
        {
          title: 'Appearance',
          subtitle: 'Light mint green theme (Active)',
          icon: <Sun size={20} color="#D97706" strokeWidth={2.2} />,
          iconBg: '#FEF3C7',
          onPress: () => Alert.alert('Appearance', 'Quick Invoice Maker uses the curated Light Mint Green design system for high readability and print parity.'),
        },
        {
          title: 'About Quick Invoice Maker',
          subtitle: 'Version 1.0.0 • Offline-first SQLite edition',
          icon: <Info size={20} color="#475569" strokeWidth={2.2} />,
          iconBg: '#F1F5F9',
          onPress: () => navigation.navigate('About'),
        },
      ],
    },
  ];

  // Filter sections by search term
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return allSections;
    const term = searchQuery.toLowerCase();

    return allSections
      .map((section) => ({
        ...section,
        items: section.items.filter(
          (item) =>
            item.title.toLowerCase().includes(term) ||
            item.subtitle.toLowerCase().includes(term)
        ),
      }))
      .filter((section) => section.items.length > 0);
  }, [allSections, searchQuery]);

  return (
    <View style={styles.container}>
      {/* 1. Header with Back button, title, subtitle, and notification button */}
      <Header
        title="Settings Hub"
        subtitle="Configure workspaces, invoicing & security"
        showBack
        onBack={() => navigation.goBack()}
        onPressNotifications={() => navigation.navigate('NotificationSettings')}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { maxWidth: contentMaxWidth, paddingHorizontal: horizontalPadding },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Active Organization Card Banner */}
        <ActiveOrgBanner
          activeOrg={activeOrg}
          onPressSwitch={() => setOrgSwitcherVisible(true)}
        />

        {/* 3. Settings Search Bar */}
        <SettingsSearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {/* 4. Grouped Settings Sections Grid on wide screen */}
        {isWideScreen ? (
          <View style={styles.desktopGrid}>
            {filteredSections.map((section) => (
              <View key={section.title} style={styles.desktopCol}>
                <SettingsSectionCard
                  title={section.title}
                  items={section.items}
                />
              </View>
            ))}
          </View>
        ) : (
          filteredSections.map((section) => (
            <SettingsSectionCard
              key={section.title}
              title={section.title}
              items={section.items}
            />
          ))
        )}
      </ScrollView>

      {/* Organization Switcher Bottom Sheet Modal */}
      <OrgSwitcherModal
        visible={orgSwitcherVisible}
        onClose={() => setOrgSwitcherVisible(false)}
        onAddNewOrg={() => navigation.navigate('OrganizationForm', {})}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF8EF',
  },
  scrollContent: {
    width: '100%',
    alignSelf: 'center',
    paddingTop: 8,
    paddingBottom: 40,
  },
  desktopGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  desktopCol: {
    width: '48.5%',
  },
});
