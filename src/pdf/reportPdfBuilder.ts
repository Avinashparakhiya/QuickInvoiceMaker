import { Organization, KPISummary, Invoice, Payment } from '../types';
import { formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/dates';

export function buildFinancialReportPdfHtml(
  org: Organization,
  kpi: KPISummary | null,
  invoices: Invoice[],
  payments: Payment[]
): string {
  const symbol = org.currencySymbol || '$';
  const totalTax = invoices.reduce((sum, i) => sum + (i.taxAmount || 0), 0);

  const invRows = invoices
    .slice(0, 15)
    .map(
      (inv) => `
    <tr style="border-bottom: 1px solid #E2E8F0;">
      <td style="padding: 8px; font-size: 12px; font-weight: 600;">${inv.invoiceNumber}</td>
      <td style="padding: 8px; font-size: 12px;">${inv.customerName || 'Customer'}</td>
      <td style="padding: 8px; font-size: 12px;">${formatDate(inv.issueDate)}</td>
      <td style="padding: 8px; font-size: 12px;">${inv.status}</td>
      <td style="padding: 8px; font-size: 12px; text-align: right; font-weight: 700;">${formatCurrency(inv.totalAmount, symbol)}</td>
      <td style="padding: 8px; font-size: 12px; text-align: right; color: #EF4444;">${formatCurrency(inv.balanceDue, symbol)}</td>
    </tr>
  `
    )
    .join('');

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>Financial Report - ${org.displayName || org.name}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0F172A; padding: 36px; background: #fff; margin: 0; }
        .header { border-bottom: 2px solid #22C55E; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: baseline; }
        .title { font-size: 24px; font-weight: 800; color: #15803D; }
        .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
        .kpi-box { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px; }
        .kpi-label { font-size: 11px; text-transform: uppercase; color: #64748B; font-weight: 700; }
        .kpi-val { font-size: 20px; font-weight: 800; color: #0F172A; margin-top: 4px; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th { background: #EAF8EF; color: #15803D; font-size: 11px; text-transform: uppercase; padding: 8px; text-align: left; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="title">${org.displayName || org.name}</div>
          <div style="font-size: 12px; color: #64748B;">Financial Statement & Business Health Report</div>
        </div>
        <div style="font-size: 12px; color: #64748B;">Generated on: ${formatDate(new Date().toISOString())}</div>
      </div>

      <div class="kpi-grid">
        <div class="kpi-box">
          <div class="kpi-label">Total Invoiced</div>
          <div class="kpi-val">${formatCurrency(kpi?.totalSales || 0, symbol)}</div>
        </div>
        <div class="kpi-box">
          <div class="kpi-label">Cash Collected</div>
          <div class="kpi-val" style="color: #16A34A;">${formatCurrency(kpi?.totalPaid || 0, symbol)}</div>
        </div>
        <div class="kpi-box">
          <div class="kpi-label">Outstanding Balance</div>
          <div class="kpi-val" style="color: #D97706;">${formatCurrency(kpi?.outstanding || 0, symbol)}</div>
        </div>
        <div class="kpi-box">
          <div class="kpi-label">Overdue Amount</div>
          <div class="kpi-val" style="color: #EF4444;">${formatCurrency(kpi?.overdue || 0, symbol)}</div>
        </div>
      </div>

      <div style="font-size: 14px; font-weight: 700; color: #0F172A; margin-top: 20px;">Recent Invoices Breakdown</div>
      <table>
        <thead>
          <tr>
            <th>Invoice #</th>
            <th>Customer</th>
            <th>Issue Date</th>
            <th>Status</th>
            <th style="text-align: right;">Total</th>
            <th style="text-align: right;">Balance</th>
          </tr>
        </thead>
        <tbody>
          ${invRows}
        </tbody>
      </table>
    </body>
  </html>
  `;
}
