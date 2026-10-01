import { queryAll, queryFirst, executeSql } from '../db';
import { Estimate, EstimateItem, Invoice } from '../../types';
import { invoiceRepository } from './invoiceRepository';
import { orgRepository } from './orgRepository';
import { addDays, format } from 'date-fns';

export const estimateRepository = {
  async getByOrg(orgId: string): Promise<Estimate[]> {
    const rows = await queryAll<any>(
      `SELECT e.*, c.name as customer_name
       FROM estimates e
       LEFT JOIN customers c ON e.customer_id = c.id
       WHERE e.organization_id = ?
       ORDER BY e.created_at DESC`,
      [orgId]
    );
    return rows.map(mapRowToEstimate);
  },

  async getById(id: string): Promise<Estimate | null> {
    const row = await queryFirst<any>(
      `SELECT e.*, c.name as customer_name
       FROM estimates e
       LEFT JOIN customers c ON e.customer_id = c.id
       WHERE e.id = ?`,
      [id]
    );
    if (!row) return null;

    const estimate = mapRowToEstimate(row);
    const itemRows = await queryAll<any>(
      'SELECT * FROM estimate_items WHERE estimate_id = ? ORDER BY sort_order ASC',
      [id]
    );
    estimate.items = itemRows.map(mapRowToEstimateItem);
    return estimate;
  },

  async create(
    estimate: Omit<Estimate, 'createdAt' | 'updatedAt'>,
    items: Omit<EstimateItem, 'id' | 'estimateId'>[]
  ): Promise<Estimate> {
    const nowIso = new Date().toISOString();
    await executeSql(
      `INSERT INTO estimates (
        id, organization_id, customer_id, estimate_number, issue_date,
        expiry_date, status, template_id, currency_code, currency_symbol,
        subtotal, discount_amount, tax_amount, shipping_charge, total_amount,
        notes, terms_conditions, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        estimate.id,
        estimate.organizationId,
        estimate.customerId,
        estimate.estimateNumber,
        estimate.issueDate,
        estimate.expiryDate,
        estimate.status || 'DRAFT',
        estimate.templateId || 'classic_green',
        estimate.currencyCode,
        estimate.currencySymbol,
        estimate.subtotal,
        estimate.discountAmount || 0,
        estimate.taxAmount || 0,
        estimate.shippingCharge || 0,
        estimate.totalAmount,
        estimate.notes || null,
        estimate.termsConditions || null,
        nowIso,
        nowIso,
      ]
    );

    for (let i = 0; i < items.length; i++) {
      const itm = items[i];
      const itemId = `est-item-${Date.now()}-${i}`;
      await executeSql(
        `INSERT INTO estimate_items (
          id, estimate_id, item_id, description, unit, quantity, rate, discount_rate, tax_rate, line_total, sort_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          itemId,
          estimate.id,
          itm.itemId || null,
          itm.description,
          itm.unit || 'pcs',
          itm.quantity,
          itm.rate,
          itm.discountRate || 0,
          itm.taxRate || 0,
          itm.lineTotal,
          i,
        ]
      );
    }

    return (await this.getById(estimate.id))!;
  },

  async updateStatus(id: string, status: Estimate['status']): Promise<void> {
    await executeSql('UPDATE estimates SET status = ?, updated_at = ? WHERE id = ?', [
      status,
      new Date().toISOString(),
      id,
    ]);
  },

  async convertToInvoice(estimateId: string): Promise<Invoice> {
    const est = await this.getById(estimateId);
    if (!est) throw new Error('Estimate not found');

    const org = await orgRepository.getById(est.organizationId);
    if (!org) throw new Error('Organization not found');

    const nextNum = org.invoiceNextNumber || 1001;
    const padded = nextNum.toString().padStart(org.invoicePadding || 4, '0');
    const invoiceNumber = `${org.invoicePrefix || 'INV-'}${padded}`;
    const invoiceId = `inv-${Date.now()}`;

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const dueStr = format(addDays(new Date(), 30), 'yyyy-MM-dd');

    const items = (est.items || []).map((i, idx) => ({
      itemId: i.itemId,
      description: i.description,
      unit: i.unit,
      quantity: i.quantity,
      rate: i.rate,
      discountRate: i.discountRate,
      taxRate: i.taxRate,
      taxAmount: (i.quantity * i.rate * (i.taxRate / 100)),
      lineTotal: i.lineTotal,
      sortOrder: i.sortOrder ?? idx,
    }));

    const newInvoice = await invoiceRepository.create(
      {
        id: invoiceId,
        organizationId: est.organizationId,
        customerId: est.customerId,
        invoiceNumber,
        issueDate: todayStr,
        dueDate: dueStr,
        paymentTerms: 'NET_30',
        status: 'UNPAID',
        templateId: est.templateId,
        currencyCode: est.currencyCode,
        currencySymbol: est.currencySymbol,
        subtotal: est.subtotal,
        discountType: 'PERCENTAGE',
        discountValue: 0,
        discountAmount: est.discountAmount,
        taxAmount: est.taxAmount,
        shippingCharge: est.shippingCharge,
        adjustmentAmount: 0,
        totalAmount: est.totalAmount,
        paidAmount: 0,
        balanceDue: est.totalAmount,
        notes: est.notes,
        termsConditions: est.termsConditions,
        upiQrEnabled: true,
        signatureEnabled: true,
      },
      items
    );

    // Increment org next invoice number
    await orgRepository.incrementNextInvoiceNumber(org.id);

    // Mark estimate as CONVERTED
    await executeSql(
      'UPDATE estimates SET status = ?, converted_invoice_id = ?, updated_at = ? WHERE id = ?',
      ['CONVERTED', invoiceId, new Date().toISOString(), estimateId]
    );

    return newInvoice;
  },

  async delete(id: string): Promise<void> {
    await executeSql('DELETE FROM estimates WHERE id = ?', [id]);
  },
};

function mapRowToEstimate(row: any): Estimate {
  return {
    id: row.id,
    organizationId: row.organization_id,
    customerId: row.customer_id,
    customerName: row.customer_name,
    estimateNumber: row.estimate_number,
    issueDate: row.issue_date,
    expiryDate: row.expiry_date,
    status: row.status,
    templateId: row.template_id,
    currencyCode: row.currency_code,
    currencySymbol: row.currency_symbol,
    subtotal: Number(row.subtotal),
    discountAmount: Number(row.discount_amount),
    taxAmount: Number(row.tax_amount),
    shippingCharge: Number(row.shipping_charge),
    totalAmount: Number(row.total_amount),
    convertedInvoiceId: row.converted_invoice_id,
    notes: row.notes,
    termsConditions: row.terms_conditions,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapRowToEstimateItem(row: any): EstimateItem {
  return {
    id: row.id,
    estimateId: row.estimate_id,
    itemId: row.item_id,
    description: row.description,
    unit: row.unit || 'pcs',
    quantity: Number(row.quantity),
    rate: Number(row.rate),
    discountRate: Number(row.discount_rate),
    taxRate: Number(row.tax_rate),
    lineTotal: Number(row.line_total),
    sortOrder: Number(row.sort_order),
  };
}
