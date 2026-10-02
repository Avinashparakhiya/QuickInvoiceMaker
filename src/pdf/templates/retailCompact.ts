import { Invoice, Organization } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dates';
import { buildSignatureHtml } from './signatureHtml';

export function renderRetailCompactTemplate(invoice: Invoice, org: Organization): string {
  const items = invoice.items || [];
  const symbol = invoice.currencySymbol || '$';
  const sigHtml = buildSignatureHtml(invoice, org, { align: 'center', lineColor: '#0F172A', textColor: '#0F172A' });

  const rows = items
    .map(
      (item) => `
    <tr style="border-bottom: 1px solid #E2E8F0; font-size: 11px;">
      <td style="padding: 6px 4px;"><strong>${item.description}</strong> ${item.sku ? `(${item.sku})` : ''}</td>
      <td style="padding: 6px 4px; text-align: center;">${item.quantity}</td>
      <td style="padding: 6px 4px; text-align: right;">${formatCurrency(item.rate, symbol)}</td>
      <td style="padding: 6px 4px; text-align: right; font-weight: 700;">${formatCurrency(item.lineTotal, symbol)}</td>
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
        body { font-family: monospace, sans-serif; font-size: 12px; color: #0F172A; padding: 20px; background: #fff; margin: 0; }
        .header { text-align: center; border-bottom: 1px dashed #0F172A; padding-bottom: 10px; margin-bottom: 12px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
        th { border-bottom: 1px solid #0F172A; font-size: 11px; padding: 6px 4px; }
        .tot-box { border-top: 1px dashed #0F172A; padding-top: 8px; margin-top: 8px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div style="font-size: 18px; font-weight: bold;">${org.displayName || org.name}</div>
        <div>${org.addressStreet || ''} • ${org.phone || ''}</div>
        <div style="margin-top: 6px;">INVOICE #${invoice.invoiceNumber} • ${formatDate(invoice.issueDate)}</div>
      </div>

      <div style="margin-bottom: 10px;">
        Customer: <strong>${invoice.customerName || 'Cash Customer'}</strong>
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

      <div class="tot-box">
        <div style="display: flex; justify-content: space-between;"><span>Subtotal:</span><span>${formatCurrency(invoice.subtotal, symbol)}</span></div>
        ${invoice.taxAmount > 0 ? `<div style="display: flex; justify-content: space-between;"><span>Tax:</span><span>${formatCurrency(invoice.taxAmount, symbol)}</span></div>` : ''}
        <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: bold; margin-top: 4px;">
          <span>TOTAL DUE:</span><span>${formatCurrency(invoice.totalAmount, symbol)}</span>
        </div>
      </div>
      ${sigHtml}
      <div style="text-align: center; margin-top: 16px; font-size: 10px;">Thank you for your purchase!</div>
    </body>
  </html>
  `;
}
