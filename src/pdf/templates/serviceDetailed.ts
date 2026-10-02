import { Invoice, Organization } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dates';
import { buildSignatureHtml } from './signatureHtml';

export function renderServiceDetailedTemplate(invoice: Invoice, org: Organization): string {
  const items = invoice.items || [];
  const symbol = invoice.currencySymbol || '$';
  const sigHtml = buildSignatureHtml(invoice, org, { lineColor: '#0284C7', textColor: '#0369A1' });

  const rows = items
    .map(
      (item) => `
    <div style="border-left: 3px solid #0284C7; padding: 12px 16px; background: #F0F9FF; margin-bottom: 12px; border-radius: 0 8px 8px 0;">
      <div style="display: flex; justify-content: space-between; align-items: baseline;">
        <span style="font-size: 14px; font-weight: 700; color: #0369A1;">${item.description}</span>
        <span style="font-size: 15px; font-weight: 800; color: #0F172A;">${formatCurrency(item.lineTotal, symbol)}</span>
      </div>
      <div style="font-size: 12px; color: #475569; margin-top: 4px;">
        Service Hours / Units: <strong>${item.quantity} ${item.unit || 'hrs'}</strong> • Hourly / Unit Rate: ${formatCurrency(item.rate, symbol)}
      </div>
    </div>
  `
    )
    .join('');

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; color: #0F172A; padding: 32px; background: #fff; margin: 0; }
        .top { display: flex; justify-content: space-between; border-bottom: 2px solid #0284C7; padding-bottom: 16px; margin-bottom: 24px; }
        .title { font-size: 24px; font-weight: 800; color: #0369A1; }
      </style>
    </head>
    <body>
      <div class="top">
        <div>
          <div class="title">${org.displayName || org.name}</div>
          <div style="font-size: 12px; color: #64748B;">Professional Services & Consulting</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 20px; font-weight: 800;">SERVICE INVOICE</div>
          <div style="font-size: 12px; color: #64748B;"># ${invoice.invoiceNumber} • ${formatDate(invoice.issueDate)}</div>
        </div>
      </div>

      <div style="margin-bottom: 20px;">
        <div style="font-size: 11px; text-transform: uppercase; color: #64748B; font-weight: 700;">Client:</div>
        <div style="font-size: 16px; font-weight: 700;">${invoice.customerName || 'Client'}</div>
      </div>

      <div style="margin-bottom: 20px;">
        ${rows}
      </div>

      <div style="width: 260px; margin-left: auto; background: #F8FAFC; padding: 16px; border-radius: 8px; border: 1px solid #E2E8F0;">
        <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px;">
          <span>Subtotal</span><span>${formatCurrency(invoice.subtotal, symbol)}</span>
        </div>
        ${invoice.taxAmount > 0 ? `<div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px;"><span>Tax</span><span>${formatCurrency(invoice.taxAmount, symbol)}</span></div>` : ''}
        <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: 800; color: #0369A1; border-top: 1px solid #CBD5E1; padding-top: 8px; margin-top: 8px;">
          <span>Total</span><span>${formatCurrency(invoice.totalAmount, symbol)}</span>
        </div>
      </div>

      ${sigHtml}
    </body>
  </html>
  `;
}
