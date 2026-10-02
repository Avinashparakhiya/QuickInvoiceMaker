import { Invoice, Organization } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dates';
import { buildSignatureHtml } from './signatureHtml';

export function renderEditorialSerifTemplate(invoice: Invoice, org: Organization): string {
  const items = invoice.items || [];
  const symbol = invoice.currencySymbol || '$';
  const sigHtml = buildSignatureHtml(invoice, org, { lineColor: '#1E293B', textColor: '#1E293B' });

  const rows = items
    .map(
      (item) => `
    <tr style="border-bottom: 1px solid #E2E8F0;">
      <td style="padding: 16px 0; font-family: Georgia, serif; font-size: 15px; color: #1E293B;">${item.description}</td>
      <td style="padding: 16px 0; text-align: center; color: #64748B;">${item.quantity} ${item.unit || ''}</td>
      <td style="padding: 16px 0; text-align: right; color: #64748B;">${formatCurrency(item.rate, symbol)}</td>
      <td style="padding: 16px 0; text-align: right; font-weight: 700; color: #0F172A;">${formatCurrency(item.lineTotal, symbol)}</td>
    </tr>
  `
    )
    .join('');

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: Georgia, 'Times New Roman', serif; color: #1E293B; padding: 48px; background: #FFFDF9; margin: 0; line-height: 1.6; }
        .hero-title { font-size: 32px; font-weight: 400; letter-spacing: -0.5px; border-bottom: 1px solid #1E293B; padding-bottom: 24px; margin-bottom: 32px; display: flex; justify-content: space-between; align-items: baseline; }
        .meta-grid { display: flex; justify-content: space-between; font-family: -apple-system, sans-serif; font-size: 12px; margin-bottom: 40px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 36px; }
        th { font-family: -apple-system, sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #94A3B8; padding: 8px 0; border-bottom: 1px solid #1E293B; }
        .totals { width: 260px; margin-left: auto; font-family: -apple-system, sans-serif; }
      </style>
    </head>
    <body>
      <div class="hero-title">
        <span>${org.displayName || org.name}</span>
        <span style="font-size: 18px; font-style: italic; color: #64748B;">Invoice Nº ${invoice.invoiceNumber}</span>
      </div>

      <div class="meta-grid">
        <div><strong>Prepared For:</strong><br/>${invoice.customerName || 'Client'}<br/>${invoice.customerEmail || ''}</div>
        <div><strong>Date:</strong><br/>${formatDate(invoice.issueDate)}</div>
        <div><strong>Due:</strong><br/>${formatDate(invoice.dueDate)}</div>
        <div><strong>Status:</strong><br/>${invoice.status}</div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="text-align: left;">Item</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Rate</th>
            <th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>

      <div class="totals">
        <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px;"><span>Subtotal</span><span>${formatCurrency(invoice.subtotal, symbol)}</span></div>
        <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: 700; color: #0F172A; border-top: 1px solid #1E293B; padding-top: 8px; margin-top: 8px;">
          <span>Grand Total</span><span>${formatCurrency(invoice.totalAmount, symbol)}</span>
        </div>
      </div>

      ${sigHtml}
    </body>
  </html>
  `;
}
