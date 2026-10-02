import { Invoice, Organization } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dates';
import { buildSignatureHtml } from './signatureHtml';

export function renderClassicGreenTemplate(invoice: Invoice, org: Organization): string {
  const items = invoice.items || [];
  const symbol = invoice.currencySymbol || '$';
  const sigHtml = buildSignatureHtml(invoice, org, { lineColor: '#22C55E', textColor: '#15803D' });

  const rows = items
    .map(
      (item, idx) => `
    <tr style="background-color: ${idx % 2 === 0 ? '#FFFFFF' : '#F9FDFB'}; border-bottom: 1px solid #E2E8F0;">
      <td style="padding: 12px 10px; font-size: 13px; color: #0F172A;">
        <strong>${item.description}</strong>
        ${item.sku ? `<div style="font-size: 11px; color: #64748B;">SKU: ${item.sku}</div>` : ''}
      </td>
      <td style="padding: 12px 10px; font-size: 13px; color: #475569; text-align: center;">${item.quantity} ${item.unit || ''}</td>
      <td style="padding: 12px 10px; font-size: 13px; color: #475569; text-align: right;">${formatCurrency(item.rate, symbol)}</td>
      ${item.taxRate > 0 ? `<td style="padding: 12px 10px; font-size: 13px; color: #475569; text-align: right;">${item.taxRate}%</td>` : ''}
      <td style="padding: 12px 10px; font-size: 13px; color: #0F172A; text-align: right; font-weight: 700;">${formatCurrency(item.lineTotal, symbol)}</td>
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
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0F172A; padding: 32px; background: #fff; margin: 0; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #22C55E; padding-bottom: 20px; margin-bottom: 24px; }
        .org-name { font-size: 24px; font-weight: 800; color: #15803D; }
        .org-meta { font-size: 12px; color: #64748B; margin-top: 4px; line-height: 1.5; }
        .inv-box { text-align: right; }
        .inv-title { font-size: 30px; font-weight: 900; color: #0F172A; letter-spacing: -0.5px; }
        .inv-meta { font-size: 13px; color: #475569; margin-top: 4px; }
        .grid { display: flex; justify-content: space-between; margin-bottom: 24px; }
        .bill-label { font-size: 11px; text-transform: uppercase; font-weight: 700; color: #16A34A; margin-bottom: 4px; }
        .cust-name { font-size: 16px; font-weight: 700; }
        .cust-meta { font-size: 12px; color: #475569; line-height: 1.4; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        th { background-color: #EAF8EF; color: #15803D; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 10px; border-bottom: 2px solid #BBF7D0; }
        .totals-box { width: 280px; margin-left: auto; background-color: #F8FAFC; border-radius: 10px; padding: 16px; border: 1px solid #E2E8F0; }
        .tot-row { display: flex; justify-content: space-between; font-size: 13px; color: #475569; margin-bottom: 6px; }
        .tot-grand { display: flex; justify-content: space-between; font-size: 16px; font-weight: 800; color: #15803D; border-top: 2px solid #22C55E; padding-top: 8px; margin-top: 8px; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 700; text-transform: uppercase; background-color: #DCFCE7; color: #15803D; }
        .footer-box { border-top: 1px dashed #CBD5E1; padding-top: 16px; margin-top: 30px; font-size: 12px; color: #475569; line-height: 1.5; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="org-name">${org.displayName || org.name}</div>
          <div class="org-meta">
            ${org.addressStreet ? `${org.addressStreet}<br/>` : ''}
            ${org.addressCity ? `${org.addressCity}, ${org.addressState || ''} ${org.addressZip || ''}<br/>` : ''}
            ${org.email ? `Email: ${org.email} • ` : ''}${org.phone ? `Phone: ${org.phone}` : ''}
            ${org.taxId ? `<br/>Tax ID / GSTIN: ${org.taxId}` : ''}
          </div>
        </div>
        <div class="inv-box">
          <div class="inv-title">INVOICE</div>
          <div class="inv-meta">
            <strong># ${invoice.invoiceNumber}</strong><br/>
            Issued: ${formatDate(invoice.issueDate)}<br/>
            Due Date: <strong>${formatDate(invoice.dueDate)}</strong>
          </div>
        </div>
      </div>

      <div class="grid">
        <div>
          <div class="bill-label">Billed To:</div>
          <div class="cust-name">${invoice.customerName || 'Valued Client'}</div>
          ${invoice.customerEmail ? `<div class="cust-meta">${invoice.customerEmail}</div>` : ''}
          ${invoice.poNumber ? `<div class="cust-meta"><strong>PO Number:</strong> ${invoice.poNumber}</div>` : ''}
        </div>
        <div style="text-align: right;">
          <div class="bill-label">Status:</div>
          <div class="badge">${invoice.status}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="text-align: left;">Item & Description</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Rate</th>
            ${items.some((i) => i.taxRate > 0) ? '<th style="text-align: right;">Tax</th>' : ''}
            <th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>

      <div class="totals-box">
        <div class="tot-row">
          <span>Subtotal</span>
          <span>${formatCurrency(invoice.subtotal, symbol)}</span>
        </div>
        ${
          invoice.taxAmount > 0
            ? `
        <div class="tot-row">
          <span>Tax</span>
          <span>${formatCurrency(invoice.taxAmount, symbol)}</span>
        </div>`
            : ''
        }
        <div class="tot-grand">
          <span>Grand Total</span>
          <span>${formatCurrency(invoice.totalAmount, symbol)}</span>
        </div>
        ${
          invoice.paidAmount > 0
            ? `
        <div class="tot-row" style="color: #16A34A; margin-top: 6px;">
          <span>Paid</span>
          <span>-${formatCurrency(invoice.paidAmount, symbol)}</span>
        </div>
        <div class="tot-row" style="color: #EF4444; font-weight: 700;">
          <span>Balance Due</span>
          <span>${formatCurrency(invoice.balanceDue, symbol)}</span>
        </div>`
            : ''
        }
      </div>

      ${
        org.bankName || org.bankAccountNo || org.upiVpa
          ? `
      <div class="footer-box">
        <strong>Payment Instructions:</strong><br/>
        ${org.bankName ? `Bank: <strong>${org.bankName}</strong> • Account: ${org.bankAccountNo || ''} • IFSC/SWIFT: ${org.bankIfscSwift || ''}<br/>` : ''}
        ${org.upiVpa ? `UPI VPA: <strong>${org.upiVpa}</strong><br/>` : ''}
      </div>`
          : ''
      }

      ${
        invoice.notes || invoice.termsConditions
          ? `
      <div style="margin-top: 20px; font-size: 11px; color: #64748B;">
        ${invoice.notes ? `<p><strong>Notes:</strong> ${invoice.notes}</p>` : ''}
        ${invoice.termsConditions ? `<p><strong>Terms & Conditions:</strong> ${invoice.termsConditions}</p>` : ''}
      </div>`
          : ''
      }

      ${sigHtml}
    </body>
  </html>
  `;
}
