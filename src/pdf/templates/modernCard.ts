import { Invoice, Organization } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dates';

export function renderModernCardTemplate(invoice: Invoice, org: Organization): string {
  const items = invoice.items || [];
  const symbol = invoice.currencySymbol || '$';

  const rows = items
    .map(
      (item) => `
    <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 14px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div style="font-size: 14px; font-weight: 700; color: #0F172A;">${item.description}</div>
        <div style="font-size: 12px; color: #64748B; margin-top: 2px;">${item.quantity} ${item.unit || 'pcs'} × ${formatCurrency(item.rate, symbol)}</div>
      </div>
      <div style="font-size: 15px; font-weight: 800; color: #15803D;">${formatCurrency(item.lineTotal, symbol)}</div>
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
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F8FAFC; color: #0F172A; padding: 32px; margin: 0; }
        .hero-card { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; padding: 24px; margin-bottom: 20px; }
        .top-row { display: flex; justify-content: space-between; align-items: center; }
        .org-title { font-size: 22px; font-weight: 800; color: #0F172A; }
        .pill { background: #EAF8EF; color: #15803D; font-size: 12px; font-weight: 700; padding: 6px 14px; border-radius: 20px; }
        .details-grid { display: flex; justify-content: space-between; margin-top: 20px; padding-top: 16px; border-top: 1px solid #F1F5F9; }
        .label { font-size: 11px; text-transform: uppercase; color: #94A3B8; font-weight: 700; }
        .value { font-size: 14px; font-weight: 700; color: #0F172A; margin-top: 2px; }
        .total-card { background: #15803D; color: #FFFFFF; border-radius: 16px; padding: 20px; margin-top: 20px; display: flex; justify-content: space-between; align-items: center; }
      </style>
    </head>
    <body>
      <div class="hero-card">
        <div class="top-row">
          <div>
            <div class="org-title">${org.displayName || org.name}</div>
            <div style="font-size: 12px; color: #64748B; margin-top: 2px;">${org.email || ''} • ${org.phone || ''}</div>
          </div>
          <div class="pill">INVOICE #${invoice.invoiceNumber}</div>
        </div>

        <div class="details-grid">
          <div><div class="label">Billed To</div><div class="value">${invoice.customerName || 'Client'}</div></div>
          <div><div class="label">Issue Date</div><div class="value">${formatDate(invoice.issueDate)}</div></div>
          <div><div class="label">Due Date</div><div class="value">${formatDate(invoice.dueDate)}</div></div>
          <div><div class="label">Status</div><div class="value" style="color: #15803D;">${invoice.status}</div></div>
        </div>
      </div>

      <div style="font-size: 13px; font-weight: 700; color: #64748B; text-transform: uppercase; margin-bottom: 12px;">Line Items</div>
      ${rows}

      <div class="total-card">
        <div>
          <div style="font-size: 12px; text-transform: uppercase; opacity: 0.85;">Total Due</div>
          <div style="font-size: 28px; font-weight: 900;">${formatCurrency(invoice.totalAmount, symbol)}</div>
        </div>
        ${
          invoice.balanceDue > 0
            ? `<div style="text-align: right; background: rgba(0,0,0,0.2); padding: 8px 16px; border-radius: 10px;">
                <div style="font-size: 10px; text-transform: uppercase;">Balance Due</div>
                <div style="font-size: 18px; font-weight: 800;">${formatCurrency(invoice.balanceDue, symbol)}</div>
              </div>`
            : ''
        }
      </div>
    </body>
  </html>
  `;
}
