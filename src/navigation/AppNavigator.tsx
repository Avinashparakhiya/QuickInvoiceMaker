import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { BottomTabNavigator } from './BottomTabNavigator';
import { InvoiceCreateScreen } from '../features/invoices/InvoiceCreateScreen';
import { InvoiceDetailScreen } from '../features/invoices/InvoiceDetailScreen';
import { CustomerListScreen } from '../features/customers/CustomerListScreen';
import { CustomerDetailScreen } from '../features/customers/CustomerDetailScreen';
import { CustomerFormScreen } from '../features/customers/CustomerFormScreen';
import { ItemListScreen } from '../features/items/ItemListScreen';
import { ItemFormScreen } from '../features/items/ItemFormScreen';
import { OrganizationListScreen } from '../features/organizations/OrganizationListScreen';
import { OrganizationFormScreen } from '../features/organizations/OrganizationFormScreen';
import { RecordPaymentScreen } from '../features/payments/RecordPaymentScreen';
import { PaymentListScreen } from '../features/payments/PaymentListScreen';
import { CreditNoteFormScreen } from '../features/payments/CreditNoteFormScreen';
import { SettingsScreen } from '../features/settings/SettingsScreen';
import { BackupScreen } from '../features/settings/BackupScreen';
import { CurrencySettingsScreen } from '../features/settings/CurrencySettingsScreen';
import { TaxSettingsScreen } from '../features/settings/TaxSettingsScreen';
import { InvoiceNumberingScreen } from '../features/settings/InvoiceNumberingScreen';
import { PaymentSettingsScreen } from '../features/settings/PaymentSettingsScreen';
import { NotificationSettingsScreen } from '../features/settings/NotificationSettingsScreen';
import { SecuritySettingsScreen } from '../features/settings/SecuritySettingsScreen';
import { SignatureSettingsScreen } from '../features/settings/SignatureSettingsScreen';
import { AboutScreen } from '../features/settings/AboutScreen';
import { EstimateListScreen } from '../features/estimates/EstimateListScreen';
import { EstimateDetailScreen } from '../features/estimates/EstimateDetailScreen';
import { EstimateCreateScreen } from '../features/estimates/EstimateCreateScreen';
import { InvoicePreviewScreen } from '../features/invoices/InvoicePreviewScreen';
import { TemplateGalleryScreen } from '../features/invoices/TemplateGalleryScreen';
import { ExpenseListScreen } from '../features/expenses/ExpenseListScreen';
import { ExpenseFormScreen } from '../features/expenses/ExpenseFormScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
      <Stack.Screen
        name="InvoiceCreate"
        component={InvoiceCreateScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="InvoiceDetail" component={InvoiceDetailScreen} />
      <Stack.Screen name="InvoicePreview" component={InvoicePreviewScreen} />
      <Stack.Screen name="TemplateGallery" component={TemplateGalleryScreen} />
      <Stack.Screen name="CustomerList" component={CustomerListScreen} />
      <Stack.Screen name="CustomerDetail" component={CustomerDetailScreen} />
      <Stack.Screen
        name="CustomerForm"
        component={CustomerFormScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="ItemList" component={ItemListScreen} />
      <Stack.Screen
        name="ItemForm"
        component={ItemFormScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="OrganizationList" component={OrganizationListScreen} />
      <Stack.Screen
        name="OrganizationForm"
        component={OrganizationFormScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="RecordPayment"
        component={RecordPaymentScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="PaymentList" component={PaymentListScreen} />
      <Stack.Screen
        name="CreditNoteForm"
        component={CreditNoteFormScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Backup" component={BackupScreen} />
      <Stack.Screen name="CurrencySettings" component={CurrencySettingsScreen} />
      <Stack.Screen name="TaxSettings" component={TaxSettingsScreen} />
      <Stack.Screen name="InvoiceNumbering" component={InvoiceNumberingScreen} />
      <Stack.Screen name="PaymentSettings" component={PaymentSettingsScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <Stack.Screen name="SecuritySettings" component={SecuritySettingsScreen} />
      <Stack.Screen name="SignatureSettings" component={SignatureSettingsScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      
      {/* Estimates & Quotes */}
      <Stack.Screen name="EstimateList" component={EstimateListScreen} />
      <Stack.Screen name="EstimateDetail" component={EstimateDetailScreen} />
      <Stack.Screen
        name="EstimateCreate"
        component={EstimateCreateScreen}
        options={{ animation: 'slide_from_bottom' }}
      />

      {/* Expenses */}
      <Stack.Screen name="ExpenseList" component={ExpenseListScreen} />
      <Stack.Screen
        name="ExpenseForm"
        component={ExpenseFormScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
    </Stack.Navigator>
  );
};
