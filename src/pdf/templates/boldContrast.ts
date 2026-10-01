import { Invoice, Organization } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dates';

export function renderBoldContrastTemplate(invoice: Invoice, org: Organization): string {
  const items = invoice.items || [];
  const symbol = invoice.currencySymbol || '$';

  const rows = items
    .map(
      (item) => `
    <tr style="border-bottom: 2px solid #000000;">
      <td style="padding: 12px 6px; font-size: 14px; font-weight: 800; color: #000000;">${item.description}</td>
      <td style="padding: 12px 6px; font-size: 13px; font-weight: 700; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px 6px; font-size: 13px; font-weight: 700; text-align: right;">${formatCurrency(item.rate, symbol)}</td>
      <td style="padding: 12px 6px; font-size: 14px; font-weight: 900; text-align: right;">${formatCurrency(item.lineTotal, symbol)}</td>
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
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; color: #000000; padding: 32px; background: #FFFFFF; margin: 0; }
        .hero-banner { background: #000000; color: #FFFFFF; padding: 24px; display: flex; justify-content: space-between; align-items: center; border-radius: 4px; }
        .hero-banner .title { font-size: 28px; font-weight: 900; color: #22C55E; }
        .meta-strip { background: #22C55E; color: #000000; font-weight: 800; padding: 12px 24px; margin-top: 4px; display: flex; justify-content: space-between; }
        table { width: 100%; border-collapse: collapse; margin-top: 24px; }
        th { background: #000000; color: #FFFFFF; font-size: 12px; font-weight: 900; text-transform: uppercase; padding: 10px 6px; }
      </style>
    </head>
    <body>
      <div class="hero-banner">
        <div>
          <div class="title">${org.displayName || org.name}</div>
          <div style="font-size: 12px; opacity: 0.9;">${org.email || ''}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 32px; font-weight: 900;">INVOICE</div>
        </div>
      </div>

      <div class="meta-strip">
        <span># ${invoice.invoiceNumber}</span>
        <span>CLIENT: ${invoice.customerName || 'CLIENT'}</span>
        <span>DUE: ${formatDate(invoice.dueDate)}</span>
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

      <div style="background: #000000; color: #22C55E; padding: 20px; border-radius: 4px; margin-top: 24px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 16px; font-weight: 900; text-transform: uppercase;">Total Amount Due</span>
        <span style="font-size: 32px; font-weight: 900;">${formatCurrency(invoice.totalAmount, symbol)}</span>
      </div>
    </body>
  </html>
  `;
}
