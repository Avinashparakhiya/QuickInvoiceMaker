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
  Home,
  ReceiptText,
  Plus,
  Calendar,
  BarChart3,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import { QuickCreateModal } from '../components/common/QuickCreateModal';
import { useResponsive } from '../utils/useResponsive';

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const { contentMaxWidth, isWideScreen } = useResponsive();
  const [quickCreateVisible, setQuickCreateVisible] = useState(false);

  const getTabIcon = (routeName: string, isFocused: boolean) => {
    const iconColor = isFocused ? '#059669' : '#64748B';
    const iconSize = 20;

    switch (routeName) {
      case 'DashboardTab':
        return <Home size={iconSize} color={iconColor} strokeWidth={isFocused ? 2.4 : 1.8} />;
      case 'TransactionsTab':
        return <ReceiptText size={iconSize} color={iconColor} strokeWidth={isFocused ? 2.4 : 1.8} />;
      case 'CalendarTab':
        return <Calendar size={iconSize} color={iconColor} strokeWidth={isFocused ? 2.4 : 1.8} />;
      case 'ReportsTab':
        return <BarChart3 size={iconSize} color={iconColor} strokeWidth={isFocused ? 2.4 : 1.8} />;
      default:
        return null;
    }
  };

  const getTabLabel = (routeName: string) => {
    switch (routeName) {
      case 'DashboardTab':
        return 'Home';
      case 'TransactionsTab':
        return 'Activity';
      case 'CalendarTab':
        return 'Schedule';
      case 'ReportsTab':
        return 'Analytics';
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
      <View style={styles.bottomOuter}>
        <View style={[styles.barContainer, { maxWidth: Math.min(contentMaxWidth, 800) }]}>
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;
            const isCreateTab = route.name === 'CreateTab';

            if (isCreateTab) {
              return (
                <View key="create-button" style={styles.createButtonWrapper}>
                  <TouchableOpacity
                    activeOpacity={0.88}
                    onPress={() => setQuickCreateVisible(true)}
                    style={styles.createButton}
                  >
                    <Plus size={24} color="#FFFFFF" strokeWidth={2.8} />
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
                <View style={[styles.iconContainer, isFocused && styles.iconContainerActive]}>
                  {getTabIcon(route.name, isFocused)}
                </View>
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
  bottomOuter: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(226, 232, 240, 0.8)',
    width: '100%',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 8,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    height: Platform.OS === 'ios' ? 84 : 64,
    paddingBottom: Platform.OS === 'ios' ? 24 : 4,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconContainer: {
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerActive: {
    backgroundColor: '#ECFDF5',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
    letterSpacing: -0.1,
  },
  tabLabelActive: {
    color: '#059669',
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
    borderRadius: 18,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 3.5,
    borderColor: '#FFFFFF',
  },
});
