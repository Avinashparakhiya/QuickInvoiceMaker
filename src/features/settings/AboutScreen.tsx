import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  FileText,
  ShieldCheck,
  Star,
  Mail,
  ExternalLink,
  ChevronRight,
  Heart,
  Sparkles,
} from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { useResponsive } from '../../utils/useResponsive';

export const AboutScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { contentMaxWidth } = useResponsive();

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Unable to Open', `Could not navigate to ${url}`);
    });
  };

  return (
    <View style={styles.container}>
      <Header
        title="About & Support"
        subtitle="Quick Invoice Maker v1.0.0"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={[styles.scrollContent, { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' }]} showsVerticalScrollIndicator={false}>
        {/* App Branding Hero Card */}
        <Card variant="softGreen" padding={20} style={styles.heroCard}>
          <View style={styles.logoBadge}>
            <FileText size={32} color={colors.primaryDarker} />
          </View>
          <Text style={styles.appName}>Quick Invoice Maker</Text>
          <Text style={styles.appTagline}>Simple. Fast. Professional Invoices.</Text>
          <View style={styles.versionPill}>
            <Text style={styles.versionText}>Version 1.0.0 • Build 100</Text>
          </View>
        </Card>

        {/* Value Propositions */}
        <Card variant="elevated" padding={16} style={styles.card}>
          <Text style={styles.sectionTitle}>Key Features</Text>

          <View style={styles.featureRow}>
            <View style={styles.featureIcon}>
              <Sparkles size={16} color={colors.primaryDarker} />
            </View>
            <View style={styles.featureInfo}>
              <Text style={styles.featureTitle}>12 Professional PDF Templates</Text>
              <Text style={styles.featureDesc}>Modern, classic, clean, and corporate document layouts</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.featureRow}>
            <View style={styles.featureIcon}>
              <ShieldCheck size={16} color={colors.primaryDarker} />
            </View>
            <View style={styles.featureInfo}>
              <Text style={styles.featureTitle}>100% Offline-First SQLite</Text>
              <Text style={styles.featureDesc}>Full privacy and zero dependence on external cloud servers</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.featureRow}>
            <View style={styles.featureIcon}>
              <Star size={16} color={colors.primaryDarker} />
            </View>
            <View style={styles.featureInfo}>
              <Text style={styles.featureTitle}>Multi-Organization & Currency</Text>
              <Text style={styles.featureDesc}>Switch between distinct businesses and currency formats</Text>
            </View>
          </View>
        </Card>

        {/* Links & Support */}
        <Card variant="elevated" padding={0} style={styles.linksCard}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => openLink('mailto:support@quickinvoicemaker.com')}
            style={styles.linkRow}
          >
            <View style={[styles.linkIconBox, { backgroundColor: '#DCFCE7' }]}>
              <Mail size={18} color="#15803D" />
            </View>
            <View style={styles.linkInfo}>
              <Text style={styles.linkTitle}>Email Support</Text>
              <Text style={styles.linkSub}>support@quickinvoicemaker.com</Text>
            </View>
            <ExternalLink size={16} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.rowBorder} />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => Alert.alert('Rate App', 'Thank you for supporting Quick Invoice Maker!')}
            style={styles.linkRow}
          >
            <View style={[styles.linkIconBox, { backgroundColor: '#FEF3C7' }]}>
              <Star size={18} color="#B45309" />
            </View>
            <View style={styles.linkInfo}>
              <Text style={styles.linkTitle}>Rate on App Store</Text>
              <Text style={styles.linkSub}>Leave a 5-star review</Text>
            </View>
            <ChevronRight size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.rowBorder} />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => Alert.alert('Privacy Policy', 'Quick Invoice Maker stores 100% of data locally in SQLite on your device. We do not transmit or sell personal customer data.')}
            style={styles.linkRow}
          >
            <View style={[styles.linkIconBox, { backgroundColor: '#E0F2FE' }]}>
              <ShieldCheck size={18} color="#0369A1" />
            </View>
            <View style={styles.linkInfo}>
              <Text style={styles.linkTitle}>Privacy Policy</Text>
              <Text style={styles.linkSub}>Local data privacy details</Text>
            </View>
            <ChevronRight size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </Card>

        {/* Footer Credit */}
        <View style={styles.footerCredit}>
          <Text style={styles.creditText}>Crafted with care for small businesses & freelancers</Text>
          <Text style={styles.copyrightText}>© 2024 Quick Invoice Maker. All rights reserved.</Text>
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
  heroCard: {
    alignItems: 'center',
    marginBottom: 12,
    borderRadius: 16,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  appName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  appTagline: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  versionPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#D7E5DC',
  },
  versionText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDarker,
  },
  card: {
    marginBottom: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D7E5DC',
  },
  sectionTitle: {
    ...typography.bodySemiBold,
    color: colors.text,
    fontSize: 15,
    marginBottom: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  featureDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 8,
  },
  linksCard: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D7E5DC',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowBorder: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  linkIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  linkInfo: {
    flex: 1,
  },
  linkTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  linkSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  footerCredit: {
    alignItems: 'center',
    marginVertical: 10,
  },
  creditText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  copyrightText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
});
