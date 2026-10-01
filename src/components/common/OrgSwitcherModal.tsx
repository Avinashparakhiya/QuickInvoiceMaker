import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Check, Plus, Building2, ChevronRight } from 'lucide-react-native';
import { BottomSheet } from './BottomSheet';
import { useOrgStore } from '../../store/useOrgStore';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Organization } from '../../types';

interface OrgSwitcherModalProps {
  visible: boolean;
  onClose: () => void;
  onAddNewOrg: () => void;
}

const ORG_AVATAR_COLORS = [
  { bg: '#DCFCE7', text: '#15803D', border: '#86EFAC' },
  { bg: '#E0F2FE', text: '#0369A1', border: '#7DD3FC' },
  { bg: '#EDE9FE', text: '#6D28D9', border: '#C4B5FD' },
  { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' },
  { bg: '#FCE7F3', text: '#BE185D', border: '#FBCFE8' },
];

export const OrgSwitcherModal: React.FC<OrgSwitcherModalProps> = ({
  visible,
  onClose,
  onAddNewOrg,
}) => {
  const { organizations, activeOrg, setActiveOrg } = useOrgStore();

  const handleSelect = async (orgId: string) => {
    await setActiveOrg(orgId);
    onClose();
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Select Organization"
      subtitle="Choose active profile for invoices & reports"
    >
      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        {organizations.map((org: Organization, index: number) => {
          const isSelected = activeOrg?.id === org.id;
          const colorTheme = ORG_AVATAR_COLORS[index % ORG_AVATAR_COLORS.length];

          return (
            <TouchableOpacity
              key={org.id}
              activeOpacity={0.7}
              onPress={() => handleSelect(org.id)}
              style={[
                styles.orgCard,
                isSelected && styles.orgCardSelected,
              ]}
            >
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: colorTheme.bg, borderColor: colorTheme.border },
                ]}
              >
                <Text style={[styles.avatarText, { color: colorTheme.text }]}>
                  {org.name.charAt(0).toUpperCase()}
                </Text>
              </View>

              <View style={styles.orgDetails}>
                <Text numberOfLines={1} style={[styles.orgName, isSelected && styles.orgNameSelected]}>
                  {org.displayName || org.name}
                </Text>
                <Text numberOfLines={1} style={styles.orgMeta}>
                  {org.currencyCode} ({org.currencySymbol}) {org.taxId ? `| ${org.taxId}` : org.invoicePrefix ? `| Prefix: ${org.invoicePrefix}` : ''}
                </Text>
              </View>

              {isSelected ? (
                <View style={styles.checkCircle}>
                  <Check size={14} color="#FFFFFF" strokeWidth={3} />
                </View>
              ) : (
                <ChevronRight size={18} color={colors.textMuted} />
              )}
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            onClose();
            onAddNewOrg();
          }}
          style={styles.addOrgBtn}
        >
          <Plus size={18} color={colors.primaryDarker} strokeWidth={2.5} style={styles.addIcon} />
          <Text style={styles.addOrgText}>Add Organization</Text>
        </TouchableOpacity>
      </ScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    maxHeight: 400,
    paddingBottom: 16,
  },
  orgCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
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
    width: 42,
    height: 42,
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
  addOrgBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#EAF8EF',
    borderWidth: 1,
    borderColor: '#86EFAC',
    marginTop: 6,
    marginBottom: 8,
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
