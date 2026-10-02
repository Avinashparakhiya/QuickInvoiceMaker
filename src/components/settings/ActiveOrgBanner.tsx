import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Organization } from '../../types';

interface ActiveOrgBannerProps {
  activeOrg: Organization | null;
  onPressSwitch: () => void;
}

export const ActiveOrgBanner: React.FC<ActiveOrgBannerProps> = ({
  activeOrg,
  onPressSwitch,
}) => {
  const orgName = activeOrg?.displayName || activeOrg?.name || 'Default Workspace';
  const initial = orgName.trim().charAt(0).toUpperCase() || 'A';
  const currencyInfo = `${activeOrg?.currencySymbol || '$'} ${activeOrg?.currencyCode || 'USD'}`;
  const taxInfo = activeOrg?.taxId ? `Tax: ${activeOrg.taxId}` : 'Tax ID Unset';

  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>

        <View style={styles.infoCol}>
          <Text numberOfLines={1} style={styles.name}>
            {orgName}
          </Text>
          <Text numberOfLines={1} style={styles.subtext}>
            {currencyInfo} • {taxInfo}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPressSwitch}
        style={styles.switchBtn}
      >
        <Text style={styles.switchBtnText}>Switch</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D7E5DC',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  infoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  subtext: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  switchBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#22C55E',
  },
  switchBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
});
