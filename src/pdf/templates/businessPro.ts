import { Invoice, Organization } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dates';
import { buildSignatureHtml } from './signatureHtml';

export function renderBusinessProTemplate(invoice: Invoice, org: Organization): string {
  const items = invoice.items || [];
  const symbol = invoice.currencySymbol || '$';
  const sigHtml = buildSignatureHtml(invoice, org, { lineColor: '#0F172A', textColor: '#0F172A' });

  const rows = items
    .map(
      (item, idx) => `
    <tr style="border-bottom: 1px solid #CBD5E1;">
      <td style="padding: 10px; font-size: 13px; color: #1E293B;">
        <strong>${item.description}</strong>
        ${item.sku ? `<div style="font-size: 11px; color: #64748B;">SKU: ${item.sku}</div>` : ''}
      </td>
      <td style="padding: 10px; font-size: 13px; color: #475569; text-align: center;">${item.quantity} ${item.unit || ''}</td>
      <td style="padding: 10px; font-size: 13px; color: #475569; text-align: right;">${formatCurrency(item.rate, symbol)}</td>
      <td style="padding: 10px; font-size: 13px; color: #1E293B; text-align: right; font-weight: 700;">${formatCurrency(item.lineTotal, symbol)}</td>
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
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1E293B; padding: 36px; margin: 0; }
        .navy-bar { background-color: #0F172A; color: #FFFFFF; padding: 20px 24px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .brand-name { font-size: 24px; font-weight: 800; }
        .grid { display: flex; justify-content: space-between; margin-bottom: 28px; }
        .label { font-size: 11px; text-transform: uppercase; color: #64748B; font-weight: 700; margin-bottom: 4px; }
        .val-strong { font-size: 15px; font-weight: 700; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        th { background: #F1F5F9; color: #0F172A; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 10px; border-top: 1px solid #CBD5E1; border-bottom: 2px solid #0F172A; }
        .tot-card { width: 280px; margin-left: auto; border: 1px solid #CBD5E1; padding: 16px; border-radius: 6px; }
        .tot-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px; }
        .tot-grand { display: flex; justify-content: space-between; font-size: 16px; font-weight: 800; color: #0F172A; border-top: 2px solid #0F172A; padding-top: 8px; margin-top: 8px; }
      </style>
    </head>
    <body>
      <div class="navy-bar">
        <div>
          <div class="brand-name">${org.displayName || org.name}</div>
          <div style="font-size: 12px; opacity: 0.8; margin-top: 2px;">${org.email || ''} • ${org.phone || ''}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 20px; font-weight: 800;">INVOICE</div>
          <div style="font-size: 13px; opacity: 0.9;"># ${invoice.invoiceNumber}</div>
        </div>
      </div>

      <div class="grid">
        <div>
          <div class="label">Billed To:</div>
          <div class="val-strong">${invoice.customerName || 'Client'}</div>
          <div style="font-size: 12px; color: #64748B;">${invoice.customerEmail || ''}</div>
        </div>
        <div style="text-align: right;">
          <div class="label">Issue Date: <span style="color: #0F172A;">${formatDate(invoice.issueDate)}</span></div>
          <div class="label">Payment Due: <span style="color: #0F172A;">${formatDate(invoice.dueDate)}</span></div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="text-align: left;">Item Description</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Rate</th>
            <th style="text-align: right;">Line Total</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>

      <div class="tot-card">
        <div class="tot-row"><span>Subtotal</span><span>${formatCurrency(invoice.subtotal, symbol)}</span></div>
        ${invoice.taxAmount > 0 ? `<div class="tot-row"><span>Tax</span><span>${formatCurrency(invoice.taxAmount, symbol)}</span></div>` : ''}
        <div class="tot-grand"><span>Total</span><span>${formatCurrency(invoice.totalAmount, symbol)}</span></div>
      </div>

      ${sigHtml}
    </body>
  </html>
  `;
}
