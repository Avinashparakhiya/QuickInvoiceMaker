import { Organization, Customer, Invoice, Payment } from '../types';
import { formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/dates';

export function buildCustomerStatementPdfHtml(
  org: Organization,
  customer: Customer,
  invoices: Invoice[],
  payments: Payment[]
): string {
  const symbol = org.currencySymbol || '$';
  const totalBilled = invoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const totalPaid = invoices.reduce((sum, i) => sum + i.paidAmount, 0);
  const balanceDue = invoices.reduce((sum, i) => sum + i.balanceDue, 0);

  // Combine and sort ledger entries by date
  type LedgerEntry = {
    date: string;
    type: 'INVOICE' | 'PAYMENT';
    ref: string;
    description: string;
    amount: number;
    paid: number;
    status?: string;
  };

  const ledger: LedgerEntry[] = [];

  invoices.forEach((inv) => {
    ledger.push({
      date: inv.issueDate,
      type: 'INVOICE',
      ref: inv.invoiceNumber,
      description: `Invoice ${inv.invoiceNumber} (Due: ${formatDate(inv.dueDate, 'dd MMM yyyy')})`,
      amount: inv.totalAmount,
      paid: 0,
      status: inv.status,
    });
  });

  payments.forEach((p) => {
    ledger.push({
      date: p.paymentDate,
      type: 'PAYMENT',
      ref: p.paymentNumber,
      description: `Payment ${p.paymentNumber} via ${p.paymentMethod}${p.referenceNumber ? ` (${p.referenceNumber})` : ''}`,
      amount: 0,
      paid: p.amount,
    });
  });

  // Sort chronological
  ledger.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let runningBalance = 0;
  const ledgerRows = ledger
    .map((entry) => {
      if (entry.type === 'INVOICE') {
        runningBalance += entry.amount;
      } else {
        runningBalance -= entry.paid;
      }

      return `
      <tr style="border-bottom: 1px solid #E2E8F0;">
        <td style="padding: 10px 8px; font-size: 11px; color: #475569;">${formatDate(entry.date, 'dd MMM yyyy')}</td>
        <td style="padding: 10px 8px; font-size: 11px; font-weight: 600; color: ${entry.type === 'INVOICE' ? '#0F172A' : '#15803D'};">
          ${entry.type === 'INVOICE' ? '📄 Invoice' : '💳 Payment'} - ${entry.ref}
        </td>
        <td style="padding: 10px 8px; font-size: 11px; color: #64748B;">${entry.description}</td>
        <td style="padding: 10px 8px; font-size: 11px; text-align: right; font-weight: 600;">
          ${entry.amount > 0 ? formatCurrency(entry.amount, symbol) : '-'}
        </td>
        <td style="padding: 10px 8px; font-size: 11px; text-align: right; font-weight: 600; color: #16A34A;">
          ${entry.paid > 0 ? formatCurrency(entry.paid, symbol) : '-'}
        </td>
        <td style="padding: 10px 8px; font-size: 11px; text-align: right; font-weight: 700; color: ${runningBalance > 0 ? '#0F172A' : '#16A34A'};">
          ${formatCurrency(runningBalance, symbol)}
        </td>
      </tr>
    `;
    })
    .join('');

  const orgAddress = [org.addressStreet, org.addressCity, org.addressState, org.addressZip, org.addressCountry]
    .filter(Boolean)
    .join(', ');

  const custAddress = [customer.billingStreet, customer.billingCity, customer.billingState, customer.billingZip, customer.billingCountry]
    .filter(Boolean)
    .join(', ');

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>Statement of Account - ${customer.name}</title>
      <style>
        * { box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: #0F172A;
          padding: 40px;
          background: #FFFFFF;
          margin: 0;
          line-height: 1.4;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #22C55E;
          padding-bottom: 20px;
          margin-bottom: 24px;
        }
        .org-name {
          font-size: 22px;
          font-weight: 800;
          color: #15803D;
        }
        .org-meta {
          font-size: 12px;
          color: #64748B;
          margin-top: 4px;
        }
        .statement-title {
          font-size: 20px;
          font-weight: 800;
          color: #0F172A;
          text-align: right;
        }
        .statement-meta {
          font-size: 12px;
          color: #64748B;
          text-align: right;
          margin-top: 4px;
        }
        .party-section {
          display: flex;
          justify-content: space-between;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 24px;
        }
        .party-box {
          flex: 1;
        }
        .party-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          color: #94A3B8;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
        }
        .party-name {
          font-size: 14px;
          font-weight: 700;
          color: #0F172A;
        }
        .party-detail {
          font-size: 12px;
          color: #475569;
          margin-top: 2px;
        }
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }
        .kpi-card {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          padding: 14px;
          text-align: center;
        }
        .kpi-label {
          font-size: 11px;
          text-transform: uppercase;
          font-weight: 700;
          color: #64748B;
        }
        .kpi-val {
          font-size: 20px;
          font-weight: 800;
          margin-top: 4px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        th {
          background: #EAF8EF;
          color: #15803D;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          padding: 10px 8px;
          text-align: left;
        }
        .bank-box {
          margin-top: 28px;
          background: #F8FAFC;
          border: 1px dashed #CBD5E1;
          border-radius: 8px;
          padding: 16px;
        }
        .bank-title {
          font-size: 12px;
          font-weight: 700;
          color: #0F172A;
          margin-bottom: 6px;
        }
        .bank-details {
          font-size: 11px;
          color: #475569;
          line-height: 1.5;
        }
        .footer {
          margin-top: 32px;
          border-top: 1px solid #E2E8F0;
          padding-top: 12px;
          text-align: center;
          font-size: 11px;
          color: #94A3B8;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="org-name">${org.displayName || org.name}</div>
          <div class="org-meta">
            ${orgAddress || ''}
            ${org.email ? `<br/>Email: ${org.email}` : ''}
            ${org.phone ? ` • Phone: ${org.phone}` : ''}
            ${org.taxId ? `<br/>Tax Reg: ${org.taxId}` : ''}
          </div>
        </div>
        <div>
          <div class="statement-title">STATEMENT OF ACCOUNT</div>
          <div class="statement-meta">
            Date: <strong>${formatDate(new Date().toISOString(), 'dd MMM yyyy')}</strong><br/>
            Currency: <strong>${org.currencyCode || 'USD'} (${symbol})</strong>
          </div>
        </div>
      </div>

      <div class="party-section">
        <div class="party-box">
          <div class="party-label">Statement For:</div>
          <div class="party-name">${customer.name}</div>
          ${customer.companyName ? `<div class="party-detail">${customer.companyName}</div>` : ''}
          ${custAddress ? `<div class="party-detail">${custAddress}</div>` : ''}
          ${customer.taxId ? `<div class="party-detail">Tax ID: ${customer.taxId}</div>` : ''}
        </div>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card" style="border-top: 3px solid #64748B;">
          <div class="kpi-label">Total Invoiced</div>
          <div class="kpi-val" style="color: #0F172A;">${formatCurrency(totalBilled, symbol)}</div>
        </div>
        <div class="kpi-card" style="border-top: 3px solid #16A34A;">
          <div class="kpi-label">Total Paid</div>
          <div class="kpi-val" style="color: #16A34A;">${formatCurrency(totalPaid, symbol)}</div>
        </div>
        <div class="kpi-card" style="border-top: 3px solid ${balanceDue > 0 ? '#EF4444' : '#16A34A'};">
          <div class="kpi-label">Balance Outstanding</div>
          <div class="kpi-val" style="color: ${balanceDue > 0 ? '#EF4444' : '#16A34A'};">
            ${formatCurrency(balanceDue, symbol)}
          </div>
        </div>
      </div>

      <div style="font-size: 13px; font-weight: 700; color: #0F172A; margin-top: 10px; margin-bottom: 4px;">
        Transaction History & Balance Ledger
      </div>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Reference</th>
            <th>Description</th>
            <th style="text-align: right;">Invoiced</th>
            <th style="text-align: right;">Paid</th>
            <th style="text-align: right;">Balance</th>
          </tr>
        </thead>
        <tbody>
          ${ledgerRows.length > 0 ? ledgerRows : `<tr><td colspan="6" style="text-align:center; padding: 20px; color: #94A3B8;">No transactions found for this customer.</td></tr>`}
        </tbody>
      </table>

      ${
        org.bankName || org.bankAccountNo || org.upiVpa
          ? `
        <div class="bank-box">
          <div class="bank-title">Payment Instructions</div>
          <div class="bank-details">
            ${org.bankName ? `<strong>Bank Name:</strong> ${org.bankName}<br/>` : ''}
            ${org.bankAccountHolder ? `<strong>Account Name:</strong> ${org.bankAccountHolder}<br/>` : ''}
            ${org.bankAccountNo ? `<strong>Account Number:</strong> ${org.bankAccountNo}<br/>` : ''}
            ${org.bankIfscSwift ? `<strong>IFSC / Routing / IBAN:</strong> ${org.bankIfscSwift}<br/>` : ''}
            ${org.upiVpa ? `<strong>UPI ID:</strong> ${org.upiVpa}<br/>` : ''}
          </div>
        </div>
      `
          : ''
      }

      <div class="footer">
        Thank you for your business! If you have questions regarding this statement, please contact ${org.email || org.phone || org.name}.
      </div>
    </body>
  </html>
  `;
}
