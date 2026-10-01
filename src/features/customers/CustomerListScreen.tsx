import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Search, Plus, User, Phone, Mail, ChevronRight } from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { EmptyState } from '../../components/common/EmptyState';
import { useOrgStore } from '../../store/useOrgStore';
import { customerRepository } from '../../database/repositories/customerRepository';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Customer } from '../../types';

export const CustomerListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { activeOrg } = useOrgStore();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (activeOrg) {
      loadCustomers();
    }
  }, [activeOrg?.id, searchQuery]);

  const loadCustomers = async () => {
    if (!activeOrg) return;
    if (searchQuery.trim()) {
      const results = await customerRepository.search(activeOrg.id, searchQuery);
      setCustomers(results);
    } else {
      const list = await customerRepository.getByOrg(activeOrg.id);
      setCustomers(list);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCustomers();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: Customer }) => (
    <Card
      variant="elevated"
      padding={14}
      onPress={() => navigation.navigate('CustomerDetail', { customerId: item.id })}
      style={styles.card}
    >
      <View style={styles.cardRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
        </View>

        <View style={styles.details}>
          <Text style={styles.name}>{item.name}</Text>
          {item.companyName ? <Text style={styles.company}>{item.companyName}</Text> : null}
          <View style={styles.metaRow}>
            {item.phone ? (
              <View style={styles.metaItem}>
                <Phone size={12} color={colors.textMuted} />
                <Text style={styles.metaText}>{item.phone}</Text>
              </View>
            ) : null}
            {item.email ? (
              <View style={styles.metaItem}>
                <Mail size={12} color={colors.textMuted} />
                <Text style={styles.metaText}>{item.email}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <ChevronRight size={18} color={colors.textMuted} />
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Header
        title="Customers"
        subtitle={`${customers.length} clients in ${activeOrg?.displayName || activeOrg?.name || 'Workspace'}`}
        showBack
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('CustomerForm', {})}
            style={styles.addBtn}
          >
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        }
      />

      <View style={styles.searchContainer}>
        <Input
          placeholder="Search customers by name, company, email..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          prefix={<Search size={18} color={colors.textSecondary} />}
          containerStyle={{ marginBottom: 8 }}
        />
      </View>

      <FlatList
        data={customers}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon={<User size={28} color={colors.primaryDark} />}
            title="No Customers Found"
            description="Add your client contact details and addresses to quickly create invoices."
            actionTitle="+ Add First Customer"
            onAction={() => navigation.navigate('CustomerForm', {})}
          />
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
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    marginBottom: 10,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    ...typography.h3,
    color: colors.primaryDarker,
    fontWeight: '700',
  },
  details: {
    flex: 1,
  },
  name: {
    ...typography.bodySemiBold,
    color: colors.text,
    fontSize: 15,
  },
  company: {
    ...typography.captionRegular,
    color: colors.textSecondary,
    marginTop: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...typography.micro,
    color: colors.textSecondary,
  },
});
