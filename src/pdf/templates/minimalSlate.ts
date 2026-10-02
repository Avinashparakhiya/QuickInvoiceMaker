import { Invoice, Organization } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dates';
import { buildSignatureHtml } from './signatureHtml';

export function renderMinimalSlateTemplate(invoice: Invoice, org: Organization): string {
  const items = invoice.items || [];
  const symbol = invoice.currencySymbol || '$';
  const sigHtml = buildSignatureHtml(invoice, org, { lineColor: '#0F172A', textColor: '#0F172A' });

  const rows = items
    .map(
      (item) => `
    <tr style="border-bottom: 1px solid #F1F5F9;">
      <td style="padding: 14px 0; font-size: 13px; color: #0F172A;">
        <span style="font-weight: 600;">${item.description}</span>
      </td>
      <td style="padding: 14px 0; font-size: 13px; color: #64748B; text-align: center;">${item.quantity} ${item.unit || ''}</td>
      <td style="padding: 14px 0; font-size: 13px; color: #64748B; text-align: right;">${formatCurrency(item.rate, symbol)}</td>
      <td style="padding: 14px 0; font-size: 13px; color: #0F172A; text-align: right; font-weight: 600;">${formatCurrency(item.lineTotal, symbol)}</td>
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
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0F172A; padding: 40px; background: #fff; margin: 0; line-height: 1.6; }
        .top-row { display: flex; justify-content: space-between; margin-bottom: 36px; }
        .brand-title { font-size: 20px; font-weight: 700; color: #0F172A; letter-spacing: -0.3px; }
        .inv-badge { font-size: 14px; font-weight: 600; color: #64748B; }
        .address-box { font-size: 12px; color: #64748B; margin-bottom: 30px; }
        .info-grid { display: flex; justify-content: space-between; margin-bottom: 32px; border-top: 1px solid #E2E8F0; border-bottom: 1px solid #E2E8F0; padding: 16px 0; }
        .info-col { font-size: 12px; }
        .info-label { font-size: 11px; text-transform: uppercase; color: #94A3B8; font-weight: 600; }
        .info-value { font-weight: 600; color: #0F172A; margin-top: 2px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        th { color: #94A3B8; font-size: 11px; font-weight: 600; text-transform: uppercase; padding: 10px 0; border-bottom: 1px solid #E2E8F0; }
        .totals { width: 240px; margin-left: auto; margin-top: 20px; }
        .tot-row { display: flex; justify-content: space-between; font-size: 13px; color: #64748B; margin-bottom: 6px; }
        .tot-grand { display: flex; justify-content: space-between; font-size: 16px; font-weight: 700; color: #0F172A; border-top: 1px solid #0F172A; padding-top: 8px; margin-top: 8px; }
      </style>
    </head>
    <body>
      <div class="top-row">
        <div>
          <div class="brand-title">${org.displayName || org.name}</div>
          <div class="address-box">
            ${org.addressStreet || ''} ${org.addressCity ? `• ${org.addressCity}` : ''}<br/>
            ${org.email || ''}
          </div>
        </div>
        <div style="text-align: right;">
          <div class="inv-badge">INVOICE #${invoice.invoiceNumber}</div>
          <div style="font-size: 12px; color: #64748B;">Status: ${invoice.status}</div>
        </div>
      </div>

      <div class="info-grid">
        <div class="info-col">
          <div class="info-label">Billed To</div>
          <div class="info-value">${invoice.customerName || 'Client'}</div>
        </div>
        <div class="info-col">
          <div class="info-label">Issue Date</div>
          <div class="info-value">${formatDate(invoice.issueDate)}</div>
        </div>
        <div class="info-col">
          <div class="info-label">Due Date</div>
          <div class="info-value">${formatDate(invoice.dueDate)}</div>
        </div>
        <div class="info-col" style="text-align: right;">
          <div class="info-label">Amount Due</div>
          <div class="info-value" style="color: #0F172A;">${formatCurrency(invoice.balanceDue, symbol)}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="text-align: left;">Item</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Rate</th>
            <th style="text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>

      <div class="totals">
        <div class="tot-row"><span>Subtotal</span><span>${formatCurrency(invoice.subtotal, symbol)}</span></div>
        ${invoice.taxAmount > 0 ? `<div class="tot-row"><span>Tax</span><span>${formatCurrency(invoice.taxAmount, symbol)}</span></div>` : ''}
        <div class="tot-grand"><span>Total</span><span>${formatCurrency(invoice.totalAmount, symbol)}</span></div>
      </div>

      ${sigHtml}
    </body>
  </html>
  `;
}
