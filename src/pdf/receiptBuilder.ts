import { Payment, Organization, Invoice } from '../types';
import { formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/dates';

export function buildPaymentReceiptHtml(
  payment: Payment,
  org: Organization,
  invoice?: Invoice | null
): string {
  const symbol = org.currencySymbol || '$';

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>Payment Receipt ${payment.paymentNumber}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #0F172A;
          margin: 0;
          padding: 36px;
          background: #FFFFFF;
        }
        .receipt-card {
          border: 1px solid #D7E5DC;
          border-radius: 16px;
          padding: 32px;
          max-width: 600px;
          margin: 0 auto;
          box-shadow: 0 4px 16px rgba(34, 197, 94, 0.08);
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #22C55E;
          padding-bottom: 18px;
          margin-bottom: 24px;
        }
        .brand-name {
          font-size: 22px;
          font-weight: 800;
          color: #15803D;
        }
        .badge {
          background: #DCFCE7;
          color: #15803D;
          font-weight: 700;
          font-size: 12px;
          padding: 6px 14px;
          border-radius: 20px;
          text-transform: uppercase;
        }
        .amount-box {
          background: #EAF8EF;
          border: 1.5px solid #BBF7D0;
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          margin-bottom: 24px;
        }
        .amount-label {
          font-size: 12px;
          text-transform: uppercase;
          color: #15803D;
          font-weight: 700;
        }
        .amount-val {
          font-size: 34px;
          font-weight: 900;
          color: #15803D;
          margin-top: 4px;
        }
        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 24px;
        }
        .detail-item {
          font-size: 13px;
        }
        .detail-label {
          font-size: 11px;
          color: #64748B;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 2px;
        }
        .detail-val {
          font-weight: 700;
          color: #0F172A;
        }
        .footer {
          border-top: 1px dashed #CBD5E1;
          padding-top: 16px;
          text-align: center;
          font-size: 12px;
          color: #64748B;
        }
      </style>
    </head>
    <body>
      <div class="receipt-card">
        <div class="header">
          <div>
            <div class="brand-name">${org.displayName || org.name}</div>
            <div style="font-size: 12px; color: #64748B; margin-top: 2px;">Official Payment Voucher</div>
          </div>
          <div class="badge">PAYMENT RECEIVED</div>
        </div>

        <div class="amount-box">
          <div class="amount-label">Amount Settled</div>
          <div class="amount-val">${formatCurrency(payment.amount, symbol)}</div>
        </div>

        <div class="details-grid">
          <div class="detail-item">
            <div class="detail-label">Receipt Number</div>
            <div class="detail-val">${payment.paymentNumber}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Payment Date</div>
            <div class="detail-val">${formatDate(payment.paymentDate)}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Received From</div>
            <div class="detail-val">${payment.customerName || 'Valued Customer'}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Payment Method</div>
            <div class="detail-val">${payment.paymentMethod.replace('_', ' ')}</div>
          </div>
          ${
            payment.referenceNumber
              ? `
          <div class="detail-item">
            <div class="detail-label">Transaction / Ref #</div>
            <div class="detail-val">${payment.referenceNumber}</div>
          </div>`
              : ''
          }
          ${
            payment.invoiceNumber
              ? `
          <div class="detail-item">
            <div class="detail-label">Applied To Invoice</div>
            <div class="detail-val"># ${payment.invoiceNumber}</div>
          </div>`
              : ''
          }
        </div>

        ${
          payment.notes
            ? `
        <div style="margin-bottom: 20px; font-size: 12px; color: #475569; background: #F8FAFC; padding: 12px; border-radius: 8px;">
          <strong>Notes:</strong> ${payment.notes}
        </div>`
            : ''
        }

        <div class="footer">
          Thank you for your payment! This is a system-generated official payment receipt.
        </div>
      </div>
    </body>
  </html>
  `;
}
