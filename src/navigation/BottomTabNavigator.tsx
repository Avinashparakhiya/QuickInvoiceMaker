import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { BottomTabBar } from './BottomTabBar';
import { DashboardScreen } from '../features/dashboard/DashboardScreen';
import { TransactionsScreen } from '../features/transactions/TransactionsScreen';
import { CalendarScreen } from '../features/calendar/CalendarScreen';
import { ReportsScreen } from '../features/reports/ReportsScreen';
import { View } from 'react-native';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Dummy component for the center Create tab placeholder (it is intercepted by custom tab bar button)
const CreatePlaceholder = () => <View />;

export const BottomTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="DashboardTab" component={DashboardScreen} />
      <Tab.Screen name="TransactionsTab" component={TransactionsScreen} />
      <Tab.Screen name="CreateTab" component={CreatePlaceholder} />
      <Tab.Screen name="CalendarTab" component={CalendarScreen} />
      <Tab.Screen name="ReportsTab" component={ReportsScreen} />
    </Tab.Navigator>
  );
};
