import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  Search,
  Plus,
  Package,
  Briefcase,
  ChevronRight,
  PackagePlus,
  Sparkles,
} from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { EmptyState } from '../../components/common/EmptyState';
import { AmbientBackground } from '../../components/common/ScreenBackground';
import { useOrgStore } from '../../store/useOrgStore';
import { itemRepository } from '../../database/repositories/itemRepository';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { formatCurrency } from '../../utils/currency';
import { Item } from '../../types';
import { useResponsive } from '../../utils/useResponsive';

export const ItemListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { contentMaxWidth, isWideScreen } = useResponsive();
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

  const currencySymbol = activeOrg?.currencySymbol || '$';

  return (
    <View style={styles.container}>
      <AmbientBackground />
      <Header
        title="Products & Services"
        subtitle={`${items.length} items in catalog`}
        showBack
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('ItemForm', {})}
            style={styles.headerAddBtn}
          >
            <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
        }
      />

      {/* Search Bar & Category Filter Chips */}
      <View style={[styles.searchSection, { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' }]}>
        <View style={styles.searchBox}>
          <Search size={18} color="#94A3B8" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search catalog items, SKU, description..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
          />
        </View>

        <View style={styles.catTabRow}>
          {(['ALL', 'SERVICE', 'PRODUCT'] as const).map((cat) => {
            const isSelected = filterCategory === cat;
            const label =
              cat === 'ALL'
                ? `All (${items.length})`
                : cat === 'SERVICE'
                ? 'Services'
                : 'Products';

            return (
              <TouchableOpacity
                key={cat}
                activeOpacity={0.7}
                onPress={() => setFilterCategory(cat)}
                style={[
                  styles.catTab,
                  isSelected && styles.catTabActive,
                ]}
              >
                <Text
                  style={[
                    styles.catTabText,
                    isSelected && styles.catTabTextActive,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContent, { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        renderItem={({ item }) => {
          const isService = item.category === 'SERVICE';
          const iconBg = isService ? '#DCFCE7' : '#E0F2FE';
          const iconColor = isService ? '#15803D' : '#0369A1';

          return (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('ItemForm', { itemId: item.id })}
              style={styles.itemCard}
            >
              <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
                {isService ? (
                  <Briefcase size={20} color={iconColor} />
                ) : (
                  <Package size={20} color={iconColor} />
                )}
              </View>

              <View style={styles.itemDetails}>
                <Text numberOfLines={1} style={styles.itemName}>
                  {item.name}
                </Text>
                {item.description ? (
                  <Text numberOfLines={1} style={styles.itemDesc}>
                    {item.description}
                  </Text>
                ) : null}
                <View style={styles.badgeRow}>
                  <View style={styles.skuBadge}>
                    <Text style={styles.skuText}>
                      {item.sku ? `SKU: ${item.sku}` : isService ? 'Service' : 'Product'}
                    </Text>
                  </View>
                  {item.taxRate > 0 ? (
                    <View style={styles.taxBadge}>
                      <Text style={styles.taxBadgeText}>Tax {item.taxRate}%</Text>
                    </View>
                  ) : null}
                </View>
              </View>

              <View style={styles.priceContainer}>
                <Text style={styles.priceText}>
                  {formatCurrency(item.rate, currencySymbol)}
                </Text>
                <Text style={styles.unitText}>per {item.unit || 'pcs'}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListFooterComponent={
          items.length > 0 ? (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('ItemForm', {})}
              style={styles.addItemBtn}
            >
              <PackagePlus size={18} color="#15803D" strokeWidth={2.5} />
              <Text style={styles.addItemBtnText}>+ Add Item / Service</Text>
            </TouchableOpacity>
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            icon={<PackagePlus size={32} color="#15803D" />}
            title="No Catalog Items Found"
            description="Add products and services to quickly populate invoice line items in seconds."
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
  headerAddBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: colors.text,
    padding: 0,
  },
  catTabRow: {
    flexDirection: 'row',
    gap: 8,
  },
  catTab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  catTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  catTabText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  catTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 32,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
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
    fontSize: 15,
    fontWeight: '700',
  },
  itemDesc: {
    ...typography.captionRegular,
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  skuBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  skuText: {
    ...typography.micro,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  taxBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  taxBadgeText: {
    ...typography.micro,
    color: '#15803D',
    fontWeight: '700',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceText: {
    ...typography.bodySemiBold,
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  unitText: {
    ...typography.micro,
    color: colors.textMuted,
    marginTop: 2,
  },
  addItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySubtle,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    borderRadius: 14,
    paddingVertical: 13,
    marginTop: 6,
    marginBottom: 16,
    gap: 8,
  },
  addItemBtnText: {
    ...typography.bodySemiBold,
    color: '#15803D',
    fontSize: 14,
  },
});
