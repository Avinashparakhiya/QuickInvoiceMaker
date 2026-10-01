import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import {
  LayoutDashboard,
  ReceiptText,
  Plus,
  Calendar,
  BarChart3,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import { QuickCreateModal } from '../components/common/QuickCreateModal';

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const [quickCreateVisible, setQuickCreateVisible] = useState(false);

  const getTabIcon = (routeName: string, isFocused: boolean) => {
    const iconColor = isFocused ? colors.primary : '#94A3B8';
    const iconSize = 22;

    switch (routeName) {
      case 'DashboardTab':
        return <LayoutDashboard size={iconSize} color={iconColor} strokeWidth={isFocused ? 2.2 : 1.8} />;
      case 'TransactionsTab':
        return <ReceiptText size={iconSize} color={iconColor} strokeWidth={isFocused ? 2.2 : 1.8} />;
      case 'CalendarTab':
        return <Calendar size={iconSize} color={iconColor} strokeWidth={isFocused ? 2.2 : 1.8} />;
      case 'ReportsTab':
        return <BarChart3 size={iconSize} color={iconColor} strokeWidth={isFocused ? 2.2 : 1.8} />;
      default:
        return null;
    }
  };

  const getTabLabel = (routeName: string) => {
    switch (routeName) {
      case 'DashboardTab':
        return 'Home';
      case 'TransactionsTab':
        return 'Transactions';
      case 'CalendarTab':
        return 'Calendar';
      case 'ReportsTab':
        return 'Reports';
      default:
        return '';
    }
  };

  const handleQuickAction = (action: 'invoice' | 'estimate' | 'customer' | 'payment' | 'item' | 'expense') => {
    switch (action) {
      case 'invoice':
        (navigation as any).navigate('InvoiceCreate', {});
        break;
      case 'estimate':
        (navigation as any).navigate('EstimateCreate', {});
        break;
      case 'customer':
        (navigation as any).navigate('CustomerForm', {});
        break;
      case 'payment':
        (navigation as any).navigate('RecordPayment', {});
        break;
      case 'item':
        (navigation as any).navigate('ItemForm', {});
        break;
      case 'expense':
        (navigation as any).navigate('ExpenseForm', {});
        break;
    }
  };

  return (
    <>
      <View style={styles.barContainer}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const isCreateTab = route.name === 'CreateTab';

          if (isCreateTab) {
            return (
              <View key="create-button" style={styles.createButtonWrapper}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setQuickCreateVisible(true)}
                  style={styles.createButton}
                >
                  <Plus size={24} color="#FFFFFF" strokeWidth={3} />
                </TouchableOpacity>
              </View>
            );
          }

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              activeOpacity={0.7}
              onPress={onPress}
              style={styles.tabItem}
            >
              {getTabIcon(route.name, isFocused)}
              <Text
                style={[
                  styles.tabLabel,
                  isFocused && styles.tabLabelActive,
                ]}
              >
                {getTabLabel(route.name)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <QuickCreateModal
        visible={quickCreateVisible}
        onClose={() => setQuickCreateVisible(false)}
        onSelectAction={handleQuickAction}
      />
    </>
  );
};

const styles = StyleSheet.create({
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    height: Platform.OS === 'ios' ? 84 : 64,
    paddingBottom: Platform.OS === 'ios' ? 24 : 6,
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#94A3B8',
    marginTop: 4,
    letterSpacing: 0.1,
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  createButtonWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 0,
    marginTop: -22,
  },
  createButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
});
