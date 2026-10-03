import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Plus, Check, ChevronRight, Edit3 } from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { AmbientBackground } from '../../components/common/ScreenBackground';
import { useOrgStore } from '../../store/useOrgStore';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { useResponsive } from '../../utils/useResponsive';
import { Organization } from '../../types';

const ORG_AVATAR_COLORS = [
  { bg: '#DCFCE7', text: '#15803D', border: '#86EFAC' },
  { bg: '#E0F2FE', text: '#0369A1', border: '#7DD3FC' },
  { bg: '#EDE9FE', text: '#6D28D9', border: '#C4B5FD' },
  { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' },
  { bg: '#FCE7F3', text: '#BE185D', border: '#FBCFE8' },
];

export const OrganizationListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { organizations, activeOrg, setActiveOrg, loadOrganizations } = useOrgStore();
  const { contentMaxWidth } = useResponsive();

  useEffect(() => {
    loadOrganizations();
  }, []);

  return (
    <View style={styles.container}>
      <AmbientBackground />
      <Header
        title="Organization"
        showBack
        onBack={() => navigation.goBack()}
      />

      <FlatList
        data={organizations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContent, { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' }]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => {
          const isActive = activeOrg?.id === item.id;
          const colorTheme = ORG_AVATAR_COLORS[index % ORG_AVATAR_COLORS.length];

          return (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setActiveOrg(item.id)}
              style={[
                styles.orgCard,
                isActive && styles.orgCardSelected,
              ]}
            >
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: colorTheme.bg, borderColor: colorTheme.border },
                ]}
              >
                <Text style={[styles.avatarText, { color: colorTheme.text }]}>
                  {item.name.charAt(0).toUpperCase()}
                </Text>
              </View>

              <View style={styles.orgDetails}>
                <Text numberOfLines={1} style={[styles.orgName, isActive && styles.orgNameSelected]}>
                  {item.displayName || item.name}
                </Text>
                <Text numberOfLines={1} style={styles.orgMeta}>
                  {item.currencyCode} {item.taxId ? `| ${item.taxId}` : item.invoicePrefix ? `| ${item.invoicePrefix}` : ''}
                </Text>
              </View>

              {isActive ? (
                <View style={styles.checkCircle}>
                  <Check size={14} color="#FFFFFF" strokeWidth={3} />
                </View>
              ) : (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('OrganizationForm', { organizationId: item.id })}
                  style={styles.editBtn}
                >
                  <Edit3 size={16} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          );
        }}
        ListFooterComponent={
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('OrganizationForm', {})}
            style={styles.addOrgBtn}
          >
            <Plus size={18} color={colors.primaryDarker} strokeWidth={2.5} style={styles.addIcon} />
            <Text style={styles.addOrgText}>Add Organization</Text>
          </TouchableOpacity>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: 16,
  },
  orgCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  orgCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#F0FDF4',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
  },
  orgDetails: {
    flex: 1,
    paddingRight: 8,
  },
  orgName: {
    ...typography.bodySemiBold,
    color: colors.text,
    fontSize: 15,
  },
  orgNameSelected: {
    color: colors.primaryDarker,
    fontWeight: '700',
  },
  orgMeta: {
    ...typography.captionRegular,
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  addOrgBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: colors.primarySubtle,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    marginTop: 8,
  },
  addIcon: {
    marginRight: 8,
  },
  addOrgText: {
    ...typography.bodySemiBold,
    color: colors.primaryDarker,
    fontSize: 14,
  },
});
