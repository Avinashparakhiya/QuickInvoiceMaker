import { Invoice, Organization } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dates';
import { buildSignatureHtml } from './signatureHtml';

export function renderGstIndiaTemplate(invoice: Invoice, org: Organization): string {
  const items = invoice.items || [];
  const symbol = invoice.currencySymbol || '₹';
  const sigHtml = buildSignatureHtml(invoice, org, { lineColor: '#0F172A', textColor: '#0F172A' });

  // Compute CGST/SGST (50% each)
  const halfTax = (invoice.taxAmount || 0) / 2;

  const rows = items
    .map(
      (item, idx) => `
    <tr style="border-bottom: 1px solid #E2E8F0;">
      <td style="padding: 8px; font-size: 12px; text-align: center;">${idx + 1}</td>
      <td style="padding: 8px; font-size: 12px;"><strong>${item.description}</strong></td>
      <td style="padding: 8px; font-size: 12px; text-align: center;">${item.sku || '998311'}</td>
      <td style="padding: 8px; font-size: 12px; text-align: center;">${item.quantity} ${item.unit || 'pcs'}</td>
      <td style="padding: 8px; font-size: 12px; text-align: right;">${formatCurrency(item.rate, symbol)}</td>
      <td style="padding: 8px; font-size: 12px; text-align: right;">${item.taxRate}%</td>
      <td style="padding: 8px; font-size: 12px; text-align: right; font-weight: 700;">${formatCurrency(item.lineTotal, symbol)}</td>
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
        body { font-family: -apple-system, BlinkMacSystemFont, Roboto, sans-serif; color: #0F172A; padding: 24px; margin: 0; }
        .tax-invoice-header { text-align: center; font-size: 18px; font-weight: 800; border-bottom: 2px solid #0F172A; padding-bottom: 8px; margin-bottom: 16px; }
        .grid { display: flex; justify-content: space-between; border: 1px solid #CBD5E1; padding: 12px; margin-bottom: 16px; border-radius: 4px; }
        .col { flex: 1; font-size: 12px; line-height: 1.4; }
        table { width: 100%; border-collapse: collapse; border: 1px solid #CBD5E1; margin-bottom: 16px; }
        th { background-color: #F1F5F9; font-size: 11px; text-transform: uppercase; font-weight: 700; padding: 8px; border: 1px solid #CBD5E1; }
        td { border: 1px solid #E2E8F0; }
        .tax-breakdown { width: 320px; margin-left: auto; border: 1px solid #CBD5E1; padding: 12px; font-size: 12px; }
        .tax-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
        .grand-row { display: flex; justify-content: space-between; font-weight: 800; font-size: 15px; border-top: 1px solid #0F172A; padding-top: 6px; margin-top: 6px; }
      </style>
    </head>
    <body>
      <div class="tax-invoice-header">TAX INVOICE (GST COMPLIANT)</div>

      <div class="grid">
        <div class="col">
          <strong>Supplier:</strong><br/>
          <strong>${org.displayName || org.name}</strong><br/>
          ${org.addressStreet || ''}, ${org.addressCity || ''} ${org.addressState || ''}<br/>
          <strong>GSTIN / Tax ID:</strong> ${org.taxId || '27AAAAA0000A1Z5'}<br/>
          Email: ${org.email || ''}
        </div>
        <div class="col" style="border-left: 1px solid #CBD5E1; padding-left: 12px;">
          <strong>Invoice Details:</strong><br/>
          Invoice No: <strong>${invoice.invoiceNumber}</strong><br/>
          Invoice Date: ${formatDate(invoice.issueDate)}<br/>
          Due Date: ${formatDate(invoice.dueDate)}<br/>
          Place of Supply: ${org.addressState || 'Domestic'}
        </div>
      </div>

      <div class="grid">
        <div class="col">
          <strong>Receiver / Billed To:</strong><br/>
          <strong>${invoice.customerName || 'Customer'}</strong><br/>
          GSTIN: ${invoice.customer?.taxId || 'Unregistered'}<br/>
          Email: ${invoice.customerEmail || ''}
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Description of Goods / Services</th>
            <th>HSN/SAC</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>GST %</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>

      <div class="tax-breakdown">
        <div class="tax-row"><span>Taxable Amount</span><span>${formatCurrency(invoice.subtotal, symbol)}</span></div>
        <div class="tax-row"><span>CGST</span><span>${formatCurrency(halfTax, symbol)}</span></div>
        <div class="tax-row"><span>SGST</span><span>${formatCurrency(halfTax, symbol)}</span></div>
        <div class="grand-row"><span>Total Invoice Value</span><span>${formatCurrency(invoice.totalAmount, symbol)}</span></div>
      </div>

      ${sigHtml}
    </body>
  </html>
  `;
}
