import { Estimate, Organization } from '../types';
import { formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/dates';

export function buildEstimatePdfHtml(estimate: Estimate, org: Organization): string {
  const items = estimate.items || [];
  const symbol = estimate.currencySymbol || '$';

  const rows = items
    .map(
      (item) => `
    <tr style="border-bottom: 1px solid #E2E8F0;">
      <td style="padding: 12px 8px; font-size: 13px;">
        <strong>${item.description}</strong>
      </td>
      <td style="padding: 12px 8px; font-size: 13px; text-align: center; color: #64748B;">${item.quantity} ${item.unit || 'pcs'}</td>
      <td style="padding: 12px 8px; font-size: 13px; text-align: right; color: #64748B;">${formatCurrency(item.rate, symbol)}</td>
      <td style="padding: 12px 8px; font-size: 13px; text-align: right; font-weight: 700; color: #0369A1;">${formatCurrency(item.lineTotal, symbol)}</td>
    </tr>
  `
    )
    .join('');

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>Estimate ${estimate.estimateNumber}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0F172A; padding: 36px; background: #fff; margin: 0; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0284C7; padding-bottom: 20px; margin-bottom: 24px; }
        .org-name { font-size: 24px; font-weight: 800; color: #0369A1; }
        .est-title-box { text-align: right; }
        .est-title { font-size: 28px; font-weight: 900; color: #0F172A; }
        .grid { display: flex; justify-content: space-between; margin-bottom: 24px; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 700; background-color: #E0F2FE; color: #0369A1; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        th { background-color: #F0F9FF; color: #0369A1; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 10px 8px; border-bottom: 2px solid #BAE6FD; }
        .totals-box { width: 260px; margin-left: auto; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 16px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="org-name">${org.displayName || org.name}</div>
          <div style="font-size: 12px; color: #64748B; margin-top: 4px;">${org.email || ''} • ${org.phone || ''}</div>
        </div>
        <div class="est-title-box">
          <div class="est-title">ESTIMATE / QUOTE</div>
          <div style="font-size: 13px; color: #475569; margin-top: 4px;">
            <strong># ${estimate.estimateNumber}</strong><br/>
            Issued: ${formatDate(estimate.issueDate)}<br/>
            Valid Until: <strong>${formatDate(estimate.expiryDate)}</strong>
          </div>
        </div>
      </div>

      <div class="grid">
        <div>
          <div style="font-size: 11px; text-transform: uppercase; color: #64748B; font-weight: 700;">Proposed For:</div>
          <div style="font-size: 16px; font-weight: 700;">${estimate.customerName || 'Client'}</div>
        </div>
        <div>
          <div style="font-size: 11px; text-transform: uppercase; color: #64748B; font-weight: 700; margin-bottom: 4px;">Proposal Status:</div>
          <div class="badge">${estimate.status}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="text-align: left;">Scope / Deliverable</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Unit Price</th>
            <th style="text-align: right;">Estimated Total</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>

      <div class="totals-box">
        <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px;">
          <span>Subtotal</span><span>${formatCurrency(estimate.subtotal, symbol)}</span>
        </div>
        ${estimate.taxAmount > 0 ? `<div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px;"><span>Tax</span><span>${formatCurrency(estimate.taxAmount, symbol)}</span></div>` : ''}
        <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: 800; color: #0369A1; border-top: 1px solid #CBD5E1; padding-top: 8px; margin-top: 8px;">
          <span>Total Estimate</span><span>${formatCurrency(estimate.totalAmount, symbol)}</span>
        </div>
      </div>

      ${
        estimate.notes || estimate.termsConditions
          ? `
      <div style="margin-top: 24px; font-size: 12px; color: #64748B; border-top: 1px dashed #CBD5E1; padding-top: 16px;">
        ${estimate.notes ? `<p><strong>Notes:</strong> ${estimate.notes}</p>` : ''}
        ${estimate.termsConditions ? `<p><strong>Terms of Proposal:</strong> ${estimate.termsConditions}</p>` : ''}
      </div>`
          : ''
      }
    </body>
  </html>
  `;
}
