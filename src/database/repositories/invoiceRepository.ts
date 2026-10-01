import { queryAll, queryFirst, executeSql } from '../db';
import { Invoice, InvoiceItem, KPISummary } from '../../types';
import { format, addDays } from 'date-fns';

export interface InvoiceFilterOptions {
  orgId: string;
  status?: string;
  search?: string;
  customerId?: string;
  startDate?: string;
  endDate?: string;
}

export const invoiceRepository = {
  async getAll(options: InvoiceFilterOptions): Promise<Invoice[]> {
    let sql = `
      SELECT i.*, c.name as customer_name, c.email as customer_email
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE i.organization_id = ?
    `;
    const params: any[] = [options.orgId];

    if (options.status && options.status !== 'ALL') {
      sql += ' AND i.status = ?';
      params.push(options.status);
    }

    if (options.customerId) {
      sql += ' AND i.customer_id = ?';
      params.push(options.customerId);
    }

    if (options.search) {
      const term = `%${options.search.trim()}%`;
      sql += ' AND (i.invoice_number LIKE ? OR c.name LIKE ? OR c.company_name LIKE ?)';
      params.push(term, term, term);
    }

    if (options.startDate) {
      sql += ' AND i.issue_date >= ?';
      params.push(options.startDate);
    }

    if (options.endDate) {
      sql += ' AND i.issue_date <= ?';
      params.push(options.endDate);
    }

    sql += ' ORDER BY i.issue_date DESC, i.created_at DESC';

    const rows = await queryAll<any>(sql, params);
    return rows.map(mapRowToInvoice);
  },

  async getById(id: string): Promise<Invoice | null> {
    const row = await queryFirst<any>(
      `SELECT i.*, c.name as customer_name, c.email as customer_email
       FROM invoices i
       LEFT JOIN customers c ON i.customer_id = c.id
       WHERE i.id = ?`,
      [id]
    );

    if (!row) return null;

    const invoice = mapRowToInvoice(row);

    // Fetch line items
    const itemRows = await queryAll<any>(
      'SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY sort_order ASC',
      [id]
    );
    invoice.items = itemRows.map(mapRowToInvoiceItem);

    // Fetch payments
    const paymentRows = await queryAll<any>(
      'SELECT * FROM payments WHERE invoice_id = ? ORDER BY payment_date DESC',
      [id]
    );
    invoice.payments = paymentRows.map((p) => ({
      id: p.id,
      organizationId: p.organization_id,
      invoiceId: p.invoice_id,
      customerId: p.customer_id,
      paymentNumber: p.payment_number,
      amount: Number(p.amount),
      paymentDate: p.payment_date,
      paymentType: p.payment_type,
      paymentMethod: p.payment_method,
      referenceNumber: p.reference_number,
      notes: p.notes,
      receiptUri: p.receipt_uri,
      createdAt: p.created_at,
    }));

    return invoice;
  },

  async create(invoice: Omit<Invoice, 'createdAt' | 'updatedAt'>, items: Omit<InvoiceItem, 'id' | 'invoiceId'>[]): Promise<Invoice> {
    const nowIso = new Date().toISOString();

    await executeSql(
      `INSERT INTO invoices (
        id, organization_id, customer_id, invoice_number, po_number,
        issue_date, due_date, payment_terms, status, template_id,
        currency_code, currency_symbol, subtotal, discount_type, discount_value, discount_amount,
        tax_amount, shipping_charge, adjustment_amount, total_amount, paid_amount, balance_due,
        notes, terms_conditions, payment_instructions, upi_qr_enabled, signature_enabled,
        attachment_uris, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?
      )`,
      [
        invoice.id,
        invoice.organizationId,
        invoice.customerId,
        invoice.invoiceNumber,
        invoice.poNumber || null,
        invoice.issueDate,
        invoice.dueDate,
        invoice.paymentTerms || 'NET_30',
        invoice.status || 'DRAFT',
        invoice.templateId || 'classic_green',
        invoice.currencyCode,
        invoice.currencySymbol,
        invoice.subtotal,
        invoice.discountType || 'PERCENTAGE',
        invoice.discountValue || 0,
        invoice.discountAmount || 0,
        invoice.taxAmount || 0,
        invoice.shippingCharge || 0,
        invoice.adjustmentAmount || 0,
        invoice.totalAmount,
        invoice.paidAmount || 0,
        invoice.balanceDue,
        invoice.notes || null,
        invoice.termsConditions || null,
        invoice.paymentInstructions || null,
        invoice.upiQrEnabled !== false ? 1 : 0,
        invoice.signatureEnabled !== false ? 1 : 0,
        invoice.attachmentUris ? JSON.stringify(invoice.attachmentUris) : null,
        nowIso,
        nowIso,
      ]
    );

    // Insert line items
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const itemId = `inv-item-${Date.now()}-${i}`;
      await executeSql(
        `INSERT INTO invoice_items (
          id, invoice_id, item_id, description, sku, unit, quantity, rate,
          discount_rate, tax_rate, tax_amount, line_total, sort_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          itemId,
          invoice.id,
          item.itemId || null,
          item.description,
          item.sku || null,
          item.unit || 'pcs',
          item.quantity,
          item.rate,
          item.discountRate || 0,
          item.taxRate || 0,
          item.taxAmount || 0,
          item.lineTotal,
          i,
        ]
      );
    }

    return (await this.getById(invoice.id))!;
  },

  async update(id: string, invoice: Partial<Invoice>, items?: Omit<InvoiceItem, 'id' | 'invoiceId'>[]): Promise<void> {
    const nowIso = new Date().toISOString();
    const fields: string[] = ['updated_at = ?'];
    const values: any[] = [nowIso];

    if (invoice.customerId !== undefined) { fields.push('customer_id = ?'); values.push(invoice.customerId); }
    if (invoice.invoiceNumber !== undefined) { fields.push('invoice_number = ?'); values.push(invoice.invoiceNumber); }
    if (invoice.poNumber !== undefined) { fields.push('po_number = ?'); values.push(invoice.poNumber); }
    if (invoice.issueDate !== undefined) { fields.push('issue_date = ?'); values.push(invoice.issueDate); }
    if (invoice.dueDate !== undefined) { fields.push('due_date = ?'); values.push(invoice.dueDate); }
    if (invoice.paymentTerms !== undefined) { fields.push('payment_terms = ?'); values.push(invoice.paymentTerms); }
    if (invoice.status !== undefined) { fields.push('status = ?'); values.push(invoice.status); }
    if (invoice.templateId !== undefined) { fields.push('template_id = ?'); values.push(invoice.templateId); }
    if (invoice.subtotal !== undefined) { fields.push('subtotal = ?'); values.push(invoice.subtotal); }
    if (invoice.discountType !== undefined) { fields.push('discount_type = ?'); values.push(invoice.discountType); }
    if (invoice.discountValue !== undefined) { fields.push('discount_value = ?'); values.push(invoice.discountValue); }
    if (invoice.discountAmount !== undefined) { fields.push('discount_amount = ?'); values.push(invoice.discountAmount); }
    if (invoice.taxAmount !== undefined) { fields.push('tax_amount = ?'); values.push(invoice.taxAmount); }
    if (invoice.shippingCharge !== undefined) { fields.push('shipping_charge = ?'); values.push(invoice.shippingCharge); }
    if (invoice.adjustmentAmount !== undefined) { fields.push('adjustment_amount = ?'); values.push(invoice.adjustmentAmount); }
    if (invoice.totalAmount !== undefined) { fields.push('total_amount = ?'); values.push(invoice.totalAmount); }
    if (invoice.paidAmount !== undefined) { fields.push('paid_amount = ?'); values.push(invoice.paidAmount); }
    if (invoice.balanceDue !== undefined) { fields.push('balance_due = ?'); values.push(invoice.balanceDue); }
    if (invoice.notes !== undefined) { fields.push('notes = ?'); values.push(invoice.notes); }
    if (invoice.termsConditions !== undefined) { fields.push('terms_conditions = ?'); values.push(invoice.termsConditions); }
    if (invoice.paymentInstructions !== undefined) { fields.push('payment_instructions = ?'); values.push(invoice.paymentInstructions); }
    if (invoice.upiQrEnabled !== undefined) { fields.push('upi_qr_enabled = ?'); values.push(invoice.upiQrEnabled ? 1 : 0); }
    if (invoice.signatureEnabled !== undefined) { fields.push('signature_enabled = ?'); values.push(invoice.signatureEnabled ? 1 : 0); }

    values.push(id);
    await executeSql(`UPDATE invoices SET ${fields.join(', ')} WHERE id = ?`, values);

    if (items && items.length > 0) {
      // Re-insert line items
      await executeSql('DELETE FROM invoice_items WHERE invoice_id = ?', [id]);
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const itemId = `inv-item-${Date.now()}-${i}`;
        await executeSql(
          `INSERT INTO invoice_items (
            id, invoice_id, item_id, description, sku, unit, quantity, rate,
            discount_rate, tax_rate, tax_amount, line_total, sort_order
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            itemId,
            id,
            item.itemId || null,
            item.description,
            item.sku || null,
            item.unit || 'pcs',
            item.quantity,
            item.rate,
            item.discountRate || 0,
            item.taxRate || 0,
            item.taxAmount || 0,
            item.lineTotal,
            i,
          ]
        );
      }
    }
  },

  async updatePaymentBalance(invoiceId: string, paidAmount: number): Promise<void> {
    const inv = await this.getById(invoiceId);
    if (!inv) return;

    const total = inv.totalAmount;
    const balance = Math.max(0, total - paidAmount);
    let status: Invoice['status'] = inv.status;

    if (balance === 0) {
      status = 'PAID';
    } else if (paidAmount > 0) {
      status = 'PARTIAL';
    } else {
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      status = inv.dueDate < todayStr ? 'OVERDUE' : 'UNPAID';
    }

    await executeSql(
      'UPDATE invoices SET paid_amount = ?, balance_due = ?, status = ?, updated_at = ? WHERE id = ?',
      [paidAmount, balance, status, new Date().toISOString(), invoiceId]
    );
  },

  async delete(id: string): Promise<void> {
    await executeSql('DELETE FROM invoices WHERE id = ?', [id]);
  },

  async getKPISummary(orgId: string): Promise<KPISummary> {
    const todayStr = format(new Date(), 'yyyy-MM-dd');

    const totalSalesRow = await queryFirst<any>(
      "SELECT SUM(total_amount) as total FROM invoices WHERE organization_id = ? AND status != 'CANCELLED' AND status != 'DRAFT'",
      [orgId]
    );
    const totalPaidRow = await queryFirst<any>(
      "SELECT SUM(paid_amount) as total FROM invoices WHERE organization_id = ? AND status != 'CANCELLED'",
      [orgId]
    );
    const outstandingRow = await queryFirst<any>(
      "SELECT SUM(balance_due) as total FROM invoices WHERE organization_id = ? AND status != 'CANCELLED' AND status != 'DRAFT'",
      [orgId]
    );
    const overdueRow = await queryFirst<any>(
      "SELECT SUM(balance_due) as total FROM invoices WHERE organization_id = ? AND due_date < ? AND status NOT IN ('PAID', 'CANCELLED', 'DRAFT')",
      [orgId, todayStr]
    );

    const countsRow = await queryFirst<any>(
      `SELECT 
        SUM(CASE WHEN status = 'PAID' THEN 1 ELSE 0 END) as paid_count,
        SUM(CASE WHEN status = 'PARTIAL' THEN 1 ELSE 0 END) as partial_count,
        SUM(CASE WHEN status = 'UNPAID' THEN 1 ELSE 0 END) as unpaid_count,
        SUM(CASE WHEN status = 'OVERDUE' OR (due_date < ? AND status NOT IN ('PAID', 'CANCELLED', 'DRAFT')) THEN 1 ELSE 0 END) as overdue_count,
        SUM(CASE WHEN status = 'DRAFT' THEN 1 ELSE 0 END) as draft_count
       FROM invoices WHERE organization_id = ?`,
      [todayStr, orgId]
    );

    return {
      totalSales: Number(totalSalesRow?.total || 0),
      totalPaid: Number(totalPaidRow?.total || 0),
      outstanding: Number(outstandingRow?.total || 0),
      overdue: Number(overdueRow?.total || 0),
      paidCount: Number(countsRow?.paid_count || 0),
      partialCount: Number(countsRow?.partial_count || 0),
      unpaidCount: Number(countsRow?.unpaid_count || 0),
      overdueCount: Number(countsRow?.overdue_count || 0),
      draftCount: Number(countsRow?.draft_count || 0),
    };
  },

  async getDueSoon(orgId: string): Promise<Invoice[]> {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const futureDateStr = format(addDays(new Date(), 7), 'yyyy-MM-dd');

    const rows = await queryAll<any>(
      `SELECT i.*, c.name as customer_name, c.email as customer_email
       FROM invoices i
       LEFT JOIN customers c ON i.customer_id = c.id
       WHERE i.organization_id = ? 
       AND i.status IN ('UNPAID', 'PARTIAL')
       AND i.due_date BETWEEN ? AND ?
       ORDER BY i.due_date ASC LIMIT 5`,
      [orgId, todayStr, futureDateStr]
    );

    return rows.map(mapRowToInvoice);
  },

  async getRecent(orgId: string, limit: number = 8): Promise<Invoice[]> {
    const rows = await queryAll<any>(
      `SELECT i.*, c.name as customer_name, c.email as customer_email
       FROM invoices i
       LEFT JOIN customers c ON i.customer_id = c.id
       WHERE i.organization_id = ?
       ORDER BY i.created_at DESC LIMIT ?`,
      [orgId, limit]
    );

    return rows.map(mapRowToInvoice);
  },
};

function mapRowToInvoice(row: any): Invoice {
  let attachmentUris: string[] = [];
  if (row.attachment_uris) {
    try {
      attachmentUris = JSON.parse(row.attachment_uris);
    } catch {}
  }

  return {
    id: row.id,
    organizationId: row.organization_id,
    customerId: row.customer_id,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    invoiceNumber: row.invoice_number,
    poNumber: row.po_number,
    issueDate: row.issue_date,
    dueDate: row.due_date,
    paymentTerms: row.payment_terms,
    status: row.status,
    templateId: row.template_id,
    currencyCode: row.currency_code,
    currencySymbol: row.currency_symbol,
    subtotal: Number(row.subtotal),
    discountType: row.discount_type,
    discountValue: Number(row.discount_value),
    discountAmount: Number(row.discount_amount),
    taxAmount: Number(row.tax_amount),
    shippingCharge: Number(row.shipping_charge),
    adjustmentAmount: Number(row.adjustment_amount),
    totalAmount: Number(row.total_amount),
    paidAmount: Number(row.paid_amount),
    balanceDue: Number(row.balance_due),
    notes: row.notes,
    termsConditions: row.terms_conditions,
    paymentInstructions: row.payment_instructions,
    upiQrEnabled: Boolean(row.upi_qr_enabled),
    signatureEnabled: Boolean(row.signature_enabled),
    attachmentUris,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapRowToInvoiceItem(row: any): InvoiceItem {
  return {
    id: row.id,
    invoiceId: row.invoice_id,
    itemId: row.item_id,
    description: row.description,
    sku: row.sku,
    unit: row.unit || 'pcs',
    quantity: Number(row.quantity),
    rate: Number(row.rate),
    discountRate: Number(row.discount_rate),
    taxRate: Number(row.tax_rate),
    taxAmount: Number(row.tax_amount),
    lineTotal: Number(row.line_total),
    sortOrder: Number(row.sort_order),
  };
}
