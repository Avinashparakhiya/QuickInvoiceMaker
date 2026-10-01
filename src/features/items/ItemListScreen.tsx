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
import { Search, Plus, Package, Briefcase, ChevronRight } from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { useOrgStore } from '../../store/useOrgStore';
import { itemRepository } from '../../database/repositories/itemRepository';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { formatCurrency } from '../../utils/currency';
import { Item } from '../../types';

export const ItemListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { activeOrg } = useOrgStore();

  const [items, setItems] = useState<Item[]>([]);
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'SERVICE' | 'PRODUCT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (activeOrg) {
      loadItems();
    }
  }, [activeOrg?.id, searchQuery, filterCategory]);

  const loadItems = async () => {
    if (!activeOrg) return;
    let list: Item[] = [];
    if (searchQuery.trim()) {
      list = await itemRepository.search(activeOrg.id, searchQuery);
    } else {
      list = await itemRepository.getByOrg(activeOrg.id);
    }

    if (filterCategory !== 'ALL') {
      list = list.filter((i) => i.category === filterCategory);
    }
    setItems(list);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadItems();
    setRefreshing(false);
  };

  const symbol = activeOrg?.currencySymbol || '$';

  const renderItem = ({ item }: { item: Item }) => (
    <Card
      variant="elevated"
      padding={14}
      onPress={() => navigation.navigate('ItemForm', { itemId: item.id })}
      style={styles.card}
    >
      <View style={styles.cardRow}>
        <View style={styles.iconBox}>
          {item.category === 'SERVICE' ? (
            <Briefcase size={20} color={colors.primaryDark} />
          ) : (
            <Package size={20} color="#0369A1" />
          )}
        </View>

        <View style={styles.itemDetails}>
          <Text style={styles.itemName}>{item.name}</Text>
          {item.description ? (
            <Text numberOfLines={1} style={styles.itemDesc}>{item.description}</Text>
          ) : null}
          <View style={styles.badgeRow}>
            <Text style={styles.skuText}>{item.sku ? `SKU: ${item.sku}` : item.category}</Text>
            {item.taxRate > 0 ? (
              <Text style={styles.taxBadge}>Tax {item.taxRate}%</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>{formatCurrency(item.rate, symbol)}</Text>
          <Text style={styles.unitText}>per {item.unit}</Text>
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Header
        title="Products & Services"
        subtitle={`${items.length} items in catalog`}
        showBack
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('ItemForm', {})}
            style={styles.addBtn}
          >
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        }
      />

      <View style={styles.searchSection}>
        <Input
          placeholder="Search products & services..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          prefix={<Search size={18} color={colors.textSecondary} />}
          containerStyle={{ marginBottom: 8 }}
        />

        {/* Category Filter Tabs */}
        <View style={styles.catTabRow}>
          {(['ALL', 'SERVICE', 'PRODUCT'] as const).map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setFilterCategory(cat)}
              style={[
                styles.catTab,
                filterCategory === cat && styles.catTabActive,
              ]}
            >
              <Text style={[styles.catTabText, filterCategory === cat && styles.catTabTextActive]}>
                {cat === 'ALL' ? 'All Catalog' : cat === 'SERVICE' ? 'Services' : 'Products'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={items}
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
            icon={<Package size={28} color={colors.primaryDark} />}
            title="No Items Found"
            description="Add products or services to easily populate line items when building invoices."
            actionTitle="+ Add Item to Catalog"
            onAction={() => navigation.navigate('ItemForm', {})}
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
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  catTabRow: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 8,
  },
  catTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
  },
  catTabActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  catTabText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  catTabTextActive: {
    color: colors.primaryDarker,
    fontWeight: '700',
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
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
    paddingRight: 8,
  },
  itemName: {
    ...typography.bodySemiBold,
    color: colors.text,
  },
  itemDesc: {
    ...typography.captionRegular,
    color: colors.textSecondary,
    marginTop: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  skuText: {
    ...typography.micro,
    color: colors.textMuted,
  },
  taxBadge: {
    ...typography.micro,
    color: colors.primaryDarker,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    fontWeight: '600',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceText: {
    ...typography.bodySemiBold,
    color: colors.text,
    fontSize: 15,
  },
  unitText: {
    ...typography.micro,
    color: colors.textMuted,
  },
});
