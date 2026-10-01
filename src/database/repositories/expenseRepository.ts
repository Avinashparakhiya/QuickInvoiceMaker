import { queryAll, queryFirst, executeSql } from '../db';
import { Expense } from '../../types';

export const expenseRepository = {
  async getByOrg(orgId: string): Promise<Expense[]> {
    const rows = await queryAll<any>(
      'SELECT * FROM expenses WHERE organization_id = ? ORDER BY expense_date DESC, created_at DESC',
      [orgId]
    );
    return rows.map(mapRowToExpense);
  },

  async getTotalByOrg(orgId: string): Promise<number> {
    const row = await queryFirst<any>(
      'SELECT SUM(amount) as total FROM expenses WHERE organization_id = ?',
      [orgId]
    );
    return Number(row?.total || 0);
  },

  async create(expense: Omit<Expense, 'createdAt'>): Promise<Expense> {
    const nowIso = new Date().toISOString();
    await executeSql(
      `INSERT INTO expenses (
        id, organization_id, category, amount, currency_code, expense_date,
        vendor, description, is_billable, customer_id, invoice_id, receipt_image_uri, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        expense.id,
        expense.organizationId,
        expense.category,
        expense.amount,
        expense.currencyCode || 'USD',
        expense.expenseDate,
        expense.vendor || null,
        expense.description || null,
        expense.isBillable ? 1 : 0,
        expense.customerId || null,
        expense.invoiceId || null,
        expense.receiptImageUri || null,
        nowIso,
      ]
    );

    const row = await queryFirst<any>('SELECT * FROM expenses WHERE id = ?', [expense.id]);
    return mapRowToExpense(row);
  },

  async delete(id: string): Promise<void> {
    await executeSql('DELETE FROM expenses WHERE id = ?', [id]);
  },
};

function mapRowToExpense(row: any): Expense {
  return {
    id: row.id,
    organizationId: row.organization_id,
    category: row.category,
    amount: Number(row.amount),
    currencyCode: row.currency_code,
    expenseDate: row.expense_date,
    vendor: row.vendor,
    description: row.description,
    isBillable: Boolean(row.is_billable),
    customerId: row.customer_id,
    invoiceId: row.invoice_id,
    receiptImageUri: row.receipt_image_uri,
    createdAt: row.created_at,
  };
}
