import { Invoice, Organization } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dates';
import { buildSignatureHtml } from './signatureHtml';

export function renderFreelancerChicTemplate(invoice: Invoice, org: Organization): string {
  const items = invoice.items || [];
  const symbol = invoice.currencySymbol || '$';
  const sigHtml = buildSignatureHtml(invoice, org, { lineColor: '#7C3AED', textColor: '#6D28D9' });

  const rows = items
    .map(
      (item) => `
    <tr style="border-bottom: 1px solid #EDE9FE;">
      <td style="padding: 12px 6px; font-size: 13px; color: #4C1D95; font-weight: 600;">${item.description}</td>
      <td style="padding: 12px 6px; font-size: 13px; color: #6D28D9; text-align: center;">${item.quantity} ${item.unit || ''}</td>
      <td style="padding: 12px 6px; font-size: 13px; color: #6D28D9; text-align: right;">${formatCurrency(item.rate, symbol)}</td>
      <td style="padding: 12px 6px; font-size: 13px; color: #4C1D95; text-align: right; font-weight: 700;">${formatCurrency(item.lineTotal, symbol)}</td>
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
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; color: #4C1D95; padding: 36px; background: #FAF5FF; margin: 0; }
        .card { background: #FFFFFF; border-radius: 20px; padding: 32px; box-shadow: 0 4px 20px rgba(109, 40, 217, 0.08); }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #EDE9FE; padding-bottom: 20px; margin-bottom: 24px; }
        .name { font-size: 24px; font-weight: 800; color: #6D28D9; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        th { color: #7C3AED; font-size: 11px; text-transform: uppercase; padding: 10px 6px; border-bottom: 2px solid #DDD6FE; }
        .tot-box { width: 260px; margin-left: auto; background: #F5F3FF; padding: 16px; border-radius: 12px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div>
            <div class="name">${org.displayName || org.name}</div>
            <div style="font-size: 12px; color: #7C3AED; margin-top: 2px;">Freelance Specialist • ${org.email || ''}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 22px; font-weight: 800; color: #6D28D9;">INVOICE</div>
            <div style="font-size: 12px; color: #7C3AED;"># ${invoice.invoiceNumber}</div>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; margin-bottom: 24px; font-size: 13px;">
          <div><strong>Client:</strong> ${invoice.customerName || 'Client'}</div>
          <div><strong>Due Date:</strong> ${formatDate(invoice.dueDate)}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="text-align: left;">Deliverable</th>
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
          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px;"><span>Subtotal</span><span>${formatCurrency(invoice.subtotal, symbol)}</span></div>
          <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: 800; color: #6D28D9; border-top: 1px solid #DDD6FE; padding-top: 6px; margin-top: 6px;">
            <span>Total</span><span>${formatCurrency(invoice.totalAmount, symbol)}</span>
          </div>
        </div>

        ${sigHtml}

        <div style="margin-top: 24px; text-align: center; font-size: 12px; color: #7C3AED; font-style: italic;">
          "It's a pleasure working with you!"
        </div>
      </div>
    </body>
  </html>
  `;
}
