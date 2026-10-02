import { Invoice, Organization } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dates';
import { buildSignatureHtml } from './signatureHtml';

export function renderSimpleSageTemplate(invoice: Invoice, org: Organization): string {
  const items = invoice.items || [];
  const symbol = invoice.currencySymbol || '$';
  const sigHtml = buildSignatureHtml(invoice, org, { lineColor: '#38A169', textColor: '#276749' });

  const rows = items
    .map(
      (item) => `
    <tr style="border-bottom: 1px solid #D7E5DC;">
      <td style="padding: 10px 8px; color: #2D3748;">${item.description}</td>
      <td style="padding: 10px 8px; text-align: center; color: #718096;">${item.quantity} ${item.unit || ''}</td>
      <td style="padding: 10px 8px; text-align: right; color: #718096;">${formatCurrency(item.rate, symbol)}</td>
      <td style="padding: 10px 8px; text-align: right; font-weight: 700; color: #2F855A;">${formatCurrency(item.lineTotal, symbol)}</td>
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
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; color: #2D3748; padding: 32px; background: #FAFDFB; margin: 0; }
        .top { display: flex; justify-content: space-between; border-bottom: 2px solid #38A169; padding-bottom: 16px; margin-bottom: 20px; }
        .org-name { font-size: 22px; font-weight: 700; color: #276749; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background: #E6FFFA; color: #234E52; font-size: 11px; text-transform: uppercase; padding: 8px; text-align: left; }
        .tot-box { width: 240px; margin-left: auto; background: #E6FFFA; padding: 12px 16px; border-radius: 8px; border: 1px solid #B2F5EA; }
      </style>
    </head>
    <body>
      <div class="top">
        <div>
          <div class="org-name">${org.displayName || org.name}</div>
          <div style="font-size: 12px; color: #718096;">${org.email || ''}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 20px; font-weight: 700; color: #276749;">INVOICE #${invoice.invoiceNumber}</div>
          <div style="font-size: 12px; color: #718096;">Due: ${formatDate(invoice.dueDate)}</div>
        </div>
      </div>

      <div style="margin-bottom: 16px; font-size: 13px;">
        <strong>Billed To:</strong> ${invoice.customerName || 'Customer'}
      </div>

      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Price</th>
            <th style="text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>

      <div class="tot-box">
        <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px;"><span>Subtotal:</span><span>${formatCurrency(invoice.subtotal, symbol)}</span></div>
        <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: 700; color: #22543D; border-top: 1px solid #81E6D9; padding-top: 4px; margin-top: 4px;">
          <span>Total Due:</span><span>${formatCurrency(invoice.totalAmount, symbol)}</span>
        </div>
      </div>

      ${sigHtml}
    </body>
  </html>
  `;
}
