export type InvoiceStatus =
  | 'DRAFT'
  | 'UNPAID'
  | 'PARTIAL'
  | 'PAID'
  | 'OVERDUE'
  | 'CANCELLED';

export type EstimateStatus =
  | 'DRAFT'
  | 'SENT'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'EXPIRED'
  | 'CONVERTED';

export type PaymentType =
  | 'PAYMENT'
  | 'ADVANCE_RETAINER'
  | 'REFUND'
  | 'CREDIT_NOTE';

export type PaymentMethod =
  | 'CASH'
  | 'BANK_TRANSFER'
  | 'UPI'
  | 'CARD'
  | 'CHEQUE'
  | 'ONLINE'
  | 'OTHER';

export type DiscountType = 'PERCENTAGE' | 'FIXED';
export type TaxType = 'INCLUSIVE' | 'EXCLUSIVE';

export type PaymentTerms =
  | 'DUE_ON_RECEIPT'
  | 'NET_7'
  | 'NET_15'
  | 'NET_30'
  | 'NET_45'
  | 'NET_60'
  | 'CUSTOM';

export type TemplateId =
  | 'classic_green'
  | 'minimal_slate'
  | 'modern_card'
  | 'business_pro'
  | 'gst_india'
  | 'service_detailed'
  | 'retail_compact'
  | 'freelancer_chic'
  | 'editorial_serif'
  | 'bold_contrast'
  | 'receipt_slip'
  | 'simple_sage';

export interface Organization {
  id: string;
  name: string;
  displayName?: string;
  logoUri?: string;
  signatureUri?: string;
  stampUri?: string;
  email?: string;
  phone?: string;
  website?: string;
  addressStreet?: string;
  addressCity?: string;
  addressState?: string;
  addressZip?: string;
  addressCountry?: string;
  taxId?: string; // GSTIN / VAT / EIN
  taxEnabled: boolean;
  taxType: TaxType;
  currencyCode: string;
  currencySymbol: string;
  currencyPosition: 'BEFORE' | 'AFTER';
  decimalPlaces: number;
  invoicePrefix: string;
  invoiceNextNumber: number;
  invoicePadding: number;
  estimatePrefix: string;
  estimateNextNumber: number;
  defaultPaymentTerms: PaymentTerms;
  defaultTemplateId: TemplateId;
  bankName?: string;
  bankAccountNo?: string;
  bankIfscSwift?: string;
  bankAccountHolder?: string;
  upiVpa?: string;
  defaultNotes?: string;
  defaultTerms?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  organizationId: string;
  name: string;
  companyName?: string;
  email?: string;
  phone?: string;
  billingStreet?: string;
  billingCity?: string;
  billingState?: string;
  billingZip?: string;
  billingCountry?: string;
  shippingStreet?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingZip?: string;
  shippingCountry?: string;
  taxId?: string;
  currencyCode?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Item {
  id: string;
  organizationId: string;
  name: string;
  sku?: string;
  description?: string;
  unit: string; // pcs, hrs, days, kg, box, etc.
  rate: number;
  taxRate: number;
  category: 'PRODUCT' | 'SERVICE';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  itemId?: string;
  description: string;
  sku?: string;
  unit: string;
  quantity: number;
  rate: number;
  discountRate: number; // percentage
  taxRate: number; // percentage
  taxAmount: number;
  lineTotal: number;
  sortOrder: number;
}

export interface Invoice {
  id: string;
  organizationId: string;
  customerId: string;
  customerName?: string;
  customerEmail?: string;
  invoiceNumber: string;
  poNumber?: string;
  issueDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  paymentTerms: PaymentTerms;
  status: InvoiceStatus;
  templateId: TemplateId;
  currencyCode: string;
  currencySymbol: string;
  subtotal: number;
  discountType: DiscountType;
  discountValue: number;
  discountAmount: number;
  taxAmount: number;
  shippingCharge: number;
  adjustmentAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  notes?: string;
  termsConditions?: string;
  paymentInstructions?: string;
  upiQrEnabled: boolean;
  signatureEnabled: boolean;
  attachmentUris?: string[];
  items?: InvoiceItem[];
  payments?: Payment[];
  customer?: Customer;
  createdAt: string;
  updatedAt: string;
}

export interface EstimateItem {
  id: string;
  estimateId: string;
  itemId?: string;
  description: string;
  unit: string;
  quantity: number;
  rate: number;
  discountRate: number;
  taxRate: number;
  lineTotal: number;
  sortOrder: number;
}

export interface Estimate {
  id: string;
  organizationId: string;
  customerId: string;
  customerName?: string;
  estimateNumber: string;
  issueDate: string;
  expiryDate: string;
  status: EstimateStatus;
  templateId: TemplateId;
  currencyCode: string;
  currencySymbol: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  shippingCharge: number;
  totalAmount: number;
  convertedInvoiceId?: string;
  notes?: string;
  termsConditions?: string;
  items?: EstimateItem[];
  customer?: Customer;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  organizationId: string;
  invoiceId?: string;
  invoiceNumber?: string;
  customerId: string;
  customerName?: string;
  paymentNumber: string;
  amount: number;
  paymentDate: string;
  paymentType: PaymentType;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  notes?: string;
  receiptUri?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  organizationId: string;
  category: string;
  amount: number;
  currencyCode: string;
  expenseDate: string;
  vendor?: string;
  description?: string;
  isBillable: boolean;
  customerId?: string;
  invoiceId?: string;
  receiptImageUri?: string;
  createdAt: string;
}

export interface KPISummary {
  totalSales: number;
  totalPaid: number;
  outstanding: number;
  overdue: number;
  paidCount: number;
  partialCount: number;
  unpaidCount: number;
  overdueCount: number;
  draftCount: number;
}
