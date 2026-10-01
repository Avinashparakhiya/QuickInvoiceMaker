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
import { typography } from '../theme/typography';
import { shadows } from '../theme/shadows';
import { QuickCreateModal } from '../components/common/QuickCreateModal';

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const [quickCreateVisible, setQuickCreateVisible] = useState(false);

  const getTabIcon = (routeName: string, isFocused: boolean) => {
    const iconColor = isFocused ? colors.primaryDark : colors.textMuted;
    const iconSize = 22;

    switch (routeName) {
      case 'DashboardTab':
        return <LayoutDashboard size={iconSize} color={iconColor} strokeWidth={isFocused ? 2.5 : 2} />;
      case 'TransactionsTab':
        return <ReceiptText size={iconSize} color={iconColor} strokeWidth={isFocused ? 2.5 : 2} />;
      case 'CalendarTab':
        return <Calendar size={iconSize} color={iconColor} strokeWidth={isFocused ? 2.5 : 2} />;
      case 'ReportsTab':
        return <BarChart3 size={iconSize} color={iconColor} strokeWidth={isFocused ? 2.5 : 2} />;
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
      <View style={[styles.barContainer, shadows.elevated]}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const isCreateTab = route.name === 'CreateTab';

          if (isCreateTab) {
            return (
              <View key="create-button" style={styles.createButtonContainer}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setQuickCreateVisible(true)}
                  style={[styles.createButton, shadows.fab]}
                >
                  <Plus size={26} color="#FFFFFF" strokeWidth={3} />
                </TouchableOpacity>
                <Text style={styles.createLabel}>Create</Text>
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
              <View style={[styles.iconWrapper, isFocused && styles.iconWrapperActive]}>
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
    borderTopColor: colors.borderLight,
    height: Platform.OS === 'ios' ? 84 : 68,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    borderRadius: 12,
  },
  iconWrapperActive: {
    backgroundColor: colors.primarySoft,
  },
  tabLabel: {
    ...typography.micro,
    color: colors.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  createButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    top: -14,
  },
  createButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  createLabel: {
    ...typography.micro,
    color: colors.primaryDarker,
    fontWeight: '700',
    marginTop: 2,
  },
});
