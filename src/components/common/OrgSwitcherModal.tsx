import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Check, Plus, Building2 } from 'lucide-react-native';
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
      title="Switch Business"
      subtitle="Select active profile for invoicing & reports"
    >
      <View style={styles.listContainer}>
        {organizations.map((org: Organization) => {
          const isSelected = activeOrg?.id === org.id;

          return (
            <TouchableOpacity
              key={org.id}
              activeOpacity={0.7}
              onPress={() => handleSelect(org.id)}
              style={[
                styles.orgRow,
                isSelected && styles.orgRowSelected,
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
                  {org.name.charAt(0).toUpperCase()}
                </Text>
              </View>

              <View style={styles.orgDetails}>
                <Text style={[styles.orgName, isSelected && styles.orgNameSelected]}>
                  {org.name}
                </Text>
                <Text style={styles.orgMeta}>
                  {org.currencySymbol} • {org.invoicePrefix} • {org.taxId || 'No Tax ID'}
                </Text>
              </View>

              {isSelected ? (
                <View style={styles.checkCircle}>
                  <Check size={16} color="#FFFFFF" strokeWidth={3} />
                </View>
              ) : null}
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
          <View style={styles.addIconCircle}>
            <Plus size={18} color={colors.primaryDark} strokeWidth={2.5} />
          </View>
          <Text style={styles.addOrgText}>Add New Business Profile</Text>
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: 16,
  },
  orgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    marginBottom: 10,
  },
  orgRowSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySubtle,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarSelected: {
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  avatarText: {
    ...typography.h3,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  avatarTextSelected: {
    color: colors.primaryDarker,
  },
  orgDetails: {
    flex: 1,
  },
  orgName: {
    ...typography.bodySemiBold,
    color: colors.text,
    fontSize: 15,
  },
  orgNameSelected: {
    color: colors.primaryDarker,
  },
  orgMeta: {
    ...typography.captionRegular,
    color: colors.textSecondary,
    marginTop: 2,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addOrgBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    backgroundColor: colors.backgroundSecondary,
    marginTop: 4,
  },
  addIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  addOrgText: {
    ...typography.bodyMedium,
    color: colors.primaryDarker,
    fontWeight: '600',
  },
});
