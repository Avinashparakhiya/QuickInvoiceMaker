import { queryAll, queryFirst, executeSql } from '../db';
import { Payment } from '../../types';
import { invoiceRepository } from './invoiceRepository';

export const paymentRepository = {
  async getByOrg(orgId: string): Promise<Payment[]> {
    const rows = await queryAll<any>(
      `SELECT p.*, i.invoice_number, c.name as customer_name
       FROM payments p
       LEFT JOIN invoices i ON p.invoice_id = i.id
       LEFT JOIN customers c ON p.customer_id = c.id
       WHERE p.organization_id = ?
       ORDER BY p.payment_date DESC, p.created_at DESC`,
      [orgId]
    );
    return rows.map(mapRowToPayment);
  },

  async getByInvoice(invoiceId: string): Promise<Payment[]> {
    const rows = await queryAll<any>(
      `SELECT p.*, i.invoice_number, c.name as customer_name
       FROM payments p
       LEFT JOIN invoices i ON p.invoice_id = i.id
       LEFT JOIN customers c ON p.customer_id = c.id
       WHERE p.invoice_id = ?
       ORDER BY p.payment_date DESC`,
      [invoiceId]
    );
    return rows.map(mapRowToPayment);
  },

  async recordPayment(payment: Omit<Payment, 'createdAt'>): Promise<Payment> {
    const nowIso = new Date().toISOString();
    await executeSql(
      `INSERT INTO payments (
        id, organization_id, invoice_id, customer_id, payment_number,
        amount, payment_date, payment_type, payment_method, reference_number, notes, receipt_uri, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        payment.id,
        payment.organizationId,
        payment.invoiceId || null,
        payment.customerId,
        payment.paymentNumber,
        payment.amount,
        payment.paymentDate,
        payment.paymentType || 'PAYMENT',
        payment.paymentMethod || 'BANK_TRANSFER',
        payment.referenceNumber || null,
        payment.notes || null,
        payment.receiptUri || null,
        nowIso,
      ]
    );

    // If linked to an invoice, recalculate and update invoice balance
    if (payment.invoiceId) {
      const allPayments = await queryFirst<any>(
        'SELECT SUM(amount) as total_paid FROM payments WHERE invoice_id = ?',
        [payment.invoiceId]
      );
      const totalPaid = Number(allPayments?.total_paid || 0);
      await invoiceRepository.updatePaymentBalance(payment.invoiceId, totalPaid);
    }

    const row = await queryFirst<any>('SELECT * FROM payments WHERE id = ?', [payment.id]);
    return mapRowToPayment(row);
  },

  async delete(id: string): Promise<void> {
    const payment = await queryFirst<any>('SELECT * FROM payments WHERE id = ?', [id]);
    if (!payment) return;

    await executeSql('DELETE FROM payments WHERE id = ?', [id]);

    if (payment.invoice_id) {
      const allPayments = await queryFirst<any>(
        'SELECT SUM(amount) as total_paid FROM payments WHERE invoice_id = ?',
        [payment.invoice_id]
      );
      const totalPaid = Number(allPayments?.total_paid || 0);
      await invoiceRepository.updatePaymentBalance(payment.invoice_id, totalPaid);
    }
  },
};

function mapRowToPayment(row: any): Payment {
  return {
    id: row.id,
    organizationId: row.organization_id,
    invoiceId: row.invoice_id,
    invoiceNumber: row.invoice_number,
    customerId: row.customer_id,
    customerName: row.customer_name,
    paymentNumber: row.payment_number,
    amount: Number(row.amount),
    paymentDate: row.payment_date,
    paymentType: row.payment_type,
    paymentMethod: row.payment_method,
    referenceNumber: row.reference_number,
    notes: row.notes,
    receiptUri: row.receipt_uri,
    createdAt: row.created_at,
  };
}
