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
} from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { useOrgStore } from '../../store/useOrgStore';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { activeOrg } = useOrgStore();

  const settingSections = [
    {
      title: 'Business Configuration',
      items: [
        {
          title: 'Organization Profiles',
          subtitle: `Active: ${activeOrg?.displayName || activeOrg?.name || 'Default'}`,
          icon: <Building2 size={20} color={colors.primaryDark} />,
          iconBg: colors.primarySoft,
          onPress: () => navigation.navigate('OrganizationList'),
        },
        {
          title: 'Bank & UPI QR Setup',
          subtitle: activeOrg?.upiVpa ? `UPI: ${activeOrg.upiVpa}` : 'Configure payment destination',
          icon: <QrCode size={20} color="#0369A1" />,
          iconBg: '#E0F2FE',
          onPress: () => navigation.navigate('OrganizationForm', { organizationId: activeOrg?.id }),
        },
        {
          title: 'Tax & GST Settings',
          subtitle: activeOrg?.taxId ? `Tax ID: ${activeOrg.taxId}` : 'Set default tax rates & GSTIN',
          icon: <Percent size={20} color="#B45309" />,
          iconBg: '#FEF3C7',
          onPress: () => navigation.navigate('OrganizationForm', { organizationId: activeOrg?.id }),
        },
      ],
    },
    {
      title: 'Invoice Preferences',
      items: [
        {
          title: 'Default Invoice Template',
          subtitle: `${activeOrg?.defaultTemplateId || 'classic_green'} (12 styles available)`,
          icon: <Palette size={20} color="#6D28D9" />,
          iconBg: '#EDE9FE',
          onPress: () => navigation.navigate('OrganizationForm', { organizationId: activeOrg?.id }),
        },
        {
          title: 'Currency & Numbering',
          subtitle: `${activeOrg?.currencySymbol || '$'} (${activeOrg?.currencyCode || 'USD'}) • Prefix: ${activeOrg?.invoicePrefix || 'INV-'}`,
          icon: <DollarSign size={20} color="#15803D" />,
          iconBg: '#DCFCE7',
          onPress: () => navigation.navigate('OrganizationForm', { organizationId: activeOrg?.id }),
        },
      ],
    },
    {
      title: 'System, Backup & Security',
      items: [
        {
          title: 'Backup & Data Export',
          subtitle: 'JSON database export, restore & CSV spreadsheets',
          icon: <Database size={20} color={colors.primaryDark} />,
          iconBg: colors.primarySoft,
          onPress: () => navigation.navigate('Backup'),
        },
        {
          title: 'Data Privacy & Local Storage',
          subtitle: '100% offline-first • All records stored securely on device',
          icon: <ShieldCheck size={20} color="#0369A1" />,
          iconBg: '#E0F2FE',
          onPress: () => navigation.navigate('Backup'),
        },
        {
          title: 'About Quick Invoice Maker',
          subtitle: 'Version 1.0.0 • React Native Local-First Edition',
          icon: <Info size={20} color={colors.textSecondary} />,
          iconBg: colors.gray100,
          onPress: () => {},
        },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <Header
        title="Settings"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {settingSections.map((section) => (
          <View key={section.title} style={styles.sectionContainer}>
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
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  sectionContainer: {
    marginTop: 16,
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
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
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
  },
  itemSubtitle: {
    ...typography.captionRegular,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
