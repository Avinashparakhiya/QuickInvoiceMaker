import { NavigatorScreenParams } from '@react-navigation/native';
import { Invoice, Customer, Item } from '../types';

export type MainTabParamList = {
  DashboardTab: undefined;
  TransactionsTab: undefined;
  CreateTab: undefined; // Intercepted by custom tab bar button
  CalendarTab: undefined;
  ReportsTab: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  InvoiceCreate: { invoiceId?: string; cloneFromId?: string; estimateId?: string };
  InvoiceDetail: { invoiceId: string };
  InvoicePreview: { invoice: Invoice };
  RecordPayment: { invoiceId?: string; customerId?: string };
  PaymentList: undefined;
  CreditNoteForm: { invoiceId?: string };
  CustomerList: undefined;
  CustomerDetail: { customerId: string };
  CustomerForm: { customerId?: string };
  ItemList: undefined;
  ItemForm: { itemId?: string };
  OrganizationList: undefined;
  OrganizationForm: { organizationId?: string };
  Settings: undefined;
  Backup: undefined;
  EstimateList: undefined;
  EstimateCreate: { estimateId?: string };
  EstimateDetail: { estimateId: string };
  ExpenseList: undefined;
  ExpenseForm: { expenseId?: string };
  PdfViewer: { uri: string; title: string };
};
