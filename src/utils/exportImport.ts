import { queryAll, executeSql } from '../database/db';
import { Invoice, Payment, Customer, Expense } from '../types';

export interface DatabaseBackup {
  version: string;
  exportedAt: string;
  appName: string;
  organizations: any[];
  customers: any[];
  items: any[];
  invoices: any[];
  invoiceItems: any[];
  estimates: any[];
  estimateItems: any[];
  payments: any[];
  expenses: any[];
}

/**
 * Exports all database tables to a unified JSON backup object
 */
export async function exportDatabaseToJson(): Promise<DatabaseBackup> {
  const organizations = await queryAll('SELECT * FROM organizations');
  const customers = await queryAll('SELECT * FROM customers');
  const items = await queryAll('SELECT * FROM items');
  const invoices = await queryAll('SELECT * FROM invoices');
  const invoiceItems = await queryAll('SELECT * FROM invoice_items');
  const estimates = await queryAll('SELECT * FROM estimates');
  const estimateItems = await queryAll('SELECT * FROM estimate_items');
  const payments = await queryAll('SELECT * FROM payments');
  const expenses = await queryAll('SELECT * FROM expenses');

  return {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    appName: 'Quick Invoice Maker',
    organizations,
    customers,
    items,
    invoices,
    invoiceItems,
    estimates,
    estimateItems,
    payments,
    expenses,
  };
}

/**
 * Restores all database tables from a JSON backup object
 */
export async function restoreDatabaseFromJson(backup: DatabaseBackup): Promise<{ success: boolean; message: string }> {
  if (!backup || !backup.organizations || !Array.isArray(backup.organizations)) {
    throw new Error('Invalid backup file format: Missing organization data.');
  }

  try {
    // 1. Restore organizations
    for (const org of backup.organizations) {
      await executeSql(
        `INSERT OR REPLACE INTO organizations (
          id, name, display_name, logo_uri, signature_uri, stamp_uri, email, phone, website,
          address_street, address_city, address_state, address_zip, address_country, tax_id,
          tax_enabled, tax_type, currency_code, currency_symbol, currency_position, decimal_places,
          invoice_prefix, invoice_next_number, invoice_padding, estimate_prefix, estimate_next_number,
          default_payment_terms, default_template_id, bank_name, bank_account_no, bank_ifsc_swift,
          bank_account_holder, upi_vpa, default_notes, default_terms, is_active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          org.id, org.name, org.display_name, org.logo_uri, org.signature_uri, org.stamp_uri, org.email, org.phone, org.website,
          org.address_street, org.address_city, org.address_state, org.address_zip, org.address_country, org.tax_id,
          org.tax_enabled, org.tax_type, org.currency_code, org.currency_symbol, org.currency_position, org.decimal_places,
          org.invoice_prefix, org.invoice_next_number, org.invoice_padding, org.estimate_prefix, org.estimate_next_number,
          org.default_payment_terms, org.default_template_id, org.bank_name, org.bank_account_no, org.bank_ifsc_swift,
          org.bank_account_holder, org.upi_vpa, org.default_notes, org.default_terms, org.is_active, org.created_at, org.updated_at
        ]
      );
    }

    // 2. Restore customers
    if (Array.isArray(backup.customers)) {
      for (const c of backup.customers) {
        await executeSql(
          `INSERT OR REPLACE INTO customers (
            id, organization_id, name, company_name, email, phone,
            billing_street, billing_city, billing_state, billing_zip, billing_country,
            shipping_street, shipping_city, shipping_state, shipping_zip, shipping_country,
            tax_id, currency_code, notes, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            c.id, c.organization_id, c.name, c.company_name, c.email, c.phone,
            c.billing_street, c.billing_city, c.billing_state, c.billing_zip, c.billing_country,
            c.shipping_street, c.shipping_city, c.shipping_state, c.shipping_zip, c.shipping_country,
            c.tax_id, c.currency_code, c.notes, c.created_at, c.updated_at
          ]
        );
      }
    }

    // 3. Restore items
    if (Array.isArray(backup.items)) {
      for (const it of backup.items) {
        await executeSql(
          `INSERT OR REPLACE INTO items (
            id, organization_id, name, sku, description, unit, rate, tax_rate, category, is_active, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            it.id, it.organization_id, it.name, it.sku, it.description, it.unit,
            it.rate, it.tax_rate, it.category, it.is_active, it.created_at, it.updated_at
          ]
        );
      }
    }

    // 4. Restore invoices & items
    if (Array.isArray(backup.invoices)) {
      for (const inv of backup.invoices) {
        await executeSql(
          `INSERT OR REPLACE INTO invoices (
            id, organization_id, customer_id, invoice_number, po_number, issue_date, due_date,
            payment_terms, status, template_id, currency_code, currency_symbol, subtotal,
            discount_type, discount_value, discount_amount, tax_amount, shipping_charge,
            adjustment_amount, total_amount, paid_amount, balance_due, notes, terms_conditions,
            payment_instructions, upi_qr_enabled, signature_enabled, attachment_uris, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            inv.id, inv.organization_id, inv.customer_id, inv.invoice_number, inv.po_number, inv.issue_date, inv.due_date,
            inv.payment_terms, inv.status, inv.template_id, inv.currency_code, inv.currency_symbol, inv.subtotal,
            inv.discount_type, inv.discount_value, inv.discount_amount, inv.tax_amount, inv.shipping_charge,
            inv.adjustment_amount, inv.total_amount, inv.paid_amount, inv.balance_due, inv.notes, inv.terms_conditions,
            inv.payment_instructions, inv.upi_qr_enabled, inv.signature_enabled, inv.attachment_uris, inv.created_at, inv.updated_at
          ]
        );
      }
    }

    if (Array.isArray(backup.invoiceItems)) {
      for (const ii of backup.invoiceItems) {
        await executeSql(
          `INSERT OR REPLACE INTO invoice_items (
            id, invoice_id, item_id, description, sku, unit, quantity, rate, discount_rate, tax_rate, tax_amount, line_total, sort_order
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            ii.id, ii.invoice_id, ii.item_id, ii.description, ii.sku, ii.unit, ii.quantity,
            ii.rate, ii.discount_rate, ii.tax_rate, ii.tax_amount, ii.line_total, ii.sort_order
          ]
        );
      }
    }

    // 5. Restore estimates
    if (Array.isArray(backup.estimates)) {
      for (const est of backup.estimates) {
        await executeSql(
          `INSERT OR REPLACE INTO estimates (
            id, organization_id, customer_id, estimate_number, issue_date, expiry_date,
            status, template_id, currency_code, currency_symbol, subtotal, discount_amount,
            tax_amount, shipping_charge, total_amount, converted_invoice_id, notes, terms_conditions,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            est.id, est.organization_id, est.customer_id, est.estimate_number, est.issue_date, est.expiry_date,
            est.status, est.template_id, est.currency_code, est.currency_symbol, est.subtotal, est.discount_amount,
            est.tax_amount, est.shipping_charge, est.total_amount, est.converted_invoice_id, est.notes, est.terms_conditions,
            est.created_at, est.updated_at
          ]
        );
      }
    }

    if (Array.isArray(backup.estimateItems)) {
      for (const ei of backup.estimateItems) {
        await executeSql(
          `INSERT OR REPLACE INTO estimate_items (
            id, estimate_id, item_id, description, unit, quantity, rate, discount_rate, tax_rate, line_total, sort_order
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            ei.id, ei.estimate_id, ei.item_id, ei.description, ei.unit, ei.quantity,
            ei.rate, ei.discount_rate, ei.tax_rate, ei.line_total, ei.sort_order
          ]
        );
      }
    }

    // 6. Restore payments
    if (Array.isArray(backup.payments)) {
      for (const p of backup.payments) {
        await executeSql(
          `INSERT OR REPLACE INTO payments (
            id, organization_id, invoice_id, customer_id, payment_number, amount,
            payment_date, payment_type, payment_method, reference_number, notes, receipt_uri, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            p.id, p.organization_id, p.invoice_id, p.customer_id, p.payment_number, p.amount,
            p.payment_date, p.payment_type, p.payment_method, p.reference_number, p.notes, p.receipt_uri, p.created_at
          ]
        );
      }
    }

    // 7. Restore expenses
    if (Array.isArray(backup.expenses)) {
      for (const exp of backup.expenses) {
        await executeSql(
          `INSERT OR REPLACE INTO expenses (
            id, organization_id, category, amount, currency_code, expense_date,
            vendor, description, is_billable, customer_id, invoice_id, receipt_image_uri, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            exp.id, exp.organization_id, exp.category, exp.amount, exp.currency_code, exp.expense_date,
            exp.vendor, exp.description, exp.is_billable, exp.customer_id, exp.invoice_id, exp.receipt_image_uri, exp.created_at
          ]
        );
      }
    }

    return { success: true, message: 'Database restored successfully!' };
  } catch (err: any) {
    throw new Error(`Database restore error: ${err.message}`);
  }
}

/**
 * CSV Export Helpers
 */
export function generateInvoicesCsv(invoices: Invoice[]): string {
  const headers = [
    'Invoice Number',
    'Customer Name',
    'Issue Date',
    'Due Date',
    'Status',
    'Subtotal',
    'Tax Amount',
    'Total Amount',
    'Paid Amount',
    'Balance Due',
  ];

  const rows = invoices.map((inv) => [
    `"${inv.invoiceNumber}"`,
    `"${inv.customerName || ''}"`,
    `"${inv.issueDate}"`,
    `"${inv.dueDate}"`,
    `"${inv.status}"`,
    inv.subtotal.toFixed(2),
    inv.taxAmount.toFixed(2),
    inv.totalAmount.toFixed(2),
    inv.paidAmount.toFixed(2),
    inv.balanceDue.toFixed(2),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function generatePaymentsCsv(payments: Payment[]): string {
  const headers = [
    'Payment Number',
    'Customer Name',
    'Date',
    'Method',
    'Amount',
    'Type',
    'Invoice #',
    'Reference #',
  ];

  const rows = payments.map((p) => [
    `"${p.paymentNumber}"`,
    `"${p.customerName || ''}"`,
    `"${p.paymentDate}"`,
    `"${p.paymentMethod}"`,
    p.amount.toFixed(2),
    `"${p.paymentType}"`,
    `"${p.invoiceNumber || ''}"`,
    `"${p.referenceNumber || ''}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function generateCustomersCsv(customers: Customer[]): string {
  const headers = [
    'Name',
    'Company',
    'Email',
    'Phone',
    'Tax ID / GSTIN',
    'Billing City',
    'Billing Country',
  ];

  const rows = customers.map((c) => [
    `"${c.name}"`,
    `"${c.companyName || ''}"`,
    `"${c.email || ''}"`,
    `"${c.phone || ''}"`,
    `"${c.taxId || ''}"`,
    `"${c.billingCity || ''}"`,
    `"${c.billingCountry || ''}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function generateExpensesCsv(expenses: Expense[]): string {
  const headers = [
    'Date',
    'Category',
    'Vendor',
    'Amount',
    'Currency',
    'Description',
    'Is Billable',
  ];

  const rows = expenses.map((e) => [
    `"${e.expenseDate}"`,
    `"${e.category}"`,
    `"${e.vendor || ''}"`,
    e.amount.toFixed(2),
    `"${e.currencyCode || 'USD'}"`,
    `"${e.description || ''}"`,
    e.isBillable ? 'YES' : 'NO',
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
