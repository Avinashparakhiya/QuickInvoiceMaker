import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Plus, Check, Building2, ChevronRight, Edit } from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { useOrgStore } from '../../store/useOrgStore';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Organization } from '../../types';

export const OrganizationListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { organizations, activeOrg, setActiveOrg, loadOrganizations } = useOrgStore();

  useEffect(() => {
    loadOrganizations();
  }, []);

  return (
    <View style={styles.container}>
      <Header
        title="Business Profiles"
        showBack
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('OrganizationForm', {})}
            style={styles.addBtn}
          >
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        }
      />

      <FlatList
        data={organizations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const isActive = activeOrg?.id === item.id;
          return (
            <Card
              variant="elevated"
              padding={16}
              onPress={() => setActiveOrg(item.id)}
              style={[styles.card, isActive && styles.activeCard]}
            >
              <View style={styles.row}>
                <View style={[styles.avatar, isActive && styles.avatarActive]}>
                  <Text style={[styles.avatarText, isActive && styles.avatarTextActive]}>
                    {item.name.charAt(0).toUpperCase()}
                  </Text>
                </View>

                <View style={styles.details}>
                  <View style={styles.titleRow}>
                    <Text style={styles.name}>{item.name}</Text>
                    {isActive ? (
                      <Badge label="Active Profile" variant="paid" size="sm" />
                    ) : null}
                  </View>
                  <Text style={styles.meta}>
                    {item.currencySymbol} ({item.currencyCode}) • Prefix: {item.invoicePrefix}
                  </Text>
                  <Text style={styles.address}>
                    {item.addressCity ? `${item.addressCity}, ${item.addressCountry || ''}` : 'No address set'}
                  </Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('OrganizationForm', { organizationId: item.id })}
                  style={styles.editBtn}
                >
                  <Edit size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </Card>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
  },
  activeCard: {
    borderColor: colors.primary,
    borderWidth: 1.5,
    backgroundColor: colors.primarySubtle,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarActive: {
    backgroundColor: colors.primarySoft,
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
  },
  avatarText: {
    ...typography.h2,
    color: colors.textSecondary,
  },
  avatarTextActive: {
    color: colors.primaryDarker,
  },
  details: {
    flex: 1,
    paddingRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  name: {
    ...typography.bodySemiBold,
    color: colors.text,
    fontSize: 15,
  },
  meta: {
    ...typography.captionRegular,
    color: colors.textSecondary,
    marginTop: 2,
  },
  address: {
    ...typography.micro,
    color: colors.textMuted,
    marginTop: 2,
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
