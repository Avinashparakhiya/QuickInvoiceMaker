import { Invoice, Organization } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dates';

export function renderReceiptSlipTemplate(invoice: Invoice, org: Organization): string {
  const items = invoice.items || [];
  const symbol = invoice.currencySymbol || '$';

  const rows = items
    .map(
      (item) => `
    <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px;">
      <span>${item.quantity}x ${item.description}</span>
      <span style="font-weight: 700;">${formatCurrency(item.lineTotal, symbol)}</span>
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
        body { font-family: 'Courier New', Courier, monospace; font-size: 11px; color: #000; width: 300px; margin: 0 auto; padding: 20px 10px; background: #FFF; }
        .center { text-align: center; }
        .dashed { border-top: 1px dashed #000; margin: 8px 0; }
        .double { border-top: 2px solid #000; margin: 8px 0; }
      </style>
    </head>
    <body>
      <div class="center">
        <div style="font-size: 16px; font-weight: bold;">${org.displayName || org.name}</div>
        <div>${org.addressStreet || ''}</div>
        <div>${org.phone || ''}</div>
        <div style="margin-top: 4px;">*** PAYMENT RECEIPT ***</div>
      </div>

      <div class="dashed"></div>
      <div>Receipt #: ${invoice.invoiceNumber}</div>
      <div>Date: ${formatDate(invoice.issueDate)}</div>
      <div>Customer: ${invoice.customerName || 'Walk-in'}</div>
      <div class="dashed"></div>

      ${rows}

      <div class="double"></div>
      <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: bold;">
        <span>TOTAL:</span>
        <span>${formatCurrency(invoice.totalAmount, symbol)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 11px; margin-top: 4px;">
        <span>STATUS:</span>
        <span>${invoice.status}</span>
      </div>

      <div class="dashed"></div>
      <div class="center" style="font-size: 10px; margin-top: 8px;">
        THANK YOU FOR YOUR BUSINESS!<br/>
        PLEASE KEEP FOR YOUR RECORDS
      </div>
    </body>
  </html>
  `;
}
