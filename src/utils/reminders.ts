import { Invoice, Organization } from '../types';
import { formatCurrency } from './currency';
import { formatDate } from './dates';

export function generatePaymentReminderMessage(
  invoice: Invoice,
  org: Organization,
  type: 'UPCOMING' | 'OVERDUE' | 'FRIENDLY' = 'FRIENDLY'
): { subject: string; message: string; whatsappUrl?: string; emailUrl?: string; smsUrl?: string } {
  const symbol = invoice.currencySymbol || '$';
  const orgName = org.displayName || org.name;
  const custName = invoice.customerName || 'Valued Client';
  const amountStr = formatCurrency(invoice.balanceDue, symbol);

  let subject = `Invoice ${invoice.invoiceNumber} from ${orgName}`;
  let message = '';

  if (type === 'OVERDUE') {
    subject = `⚠️ Payment Reminder: Overdue Invoice ${invoice.invoiceNumber}`;
    message = `Hi ${custName},\n\nThis is a friendly reminder from ${orgName} regarding invoice #${invoice.invoiceNumber} for ${amountStr}, which was due on ${formatDate(invoice.dueDate)}.\n\nPlease let us know when we can expect payment, or settle via the bank/UPI details on your invoice.\n\nThank you!\n${orgName}`;
  } else if (type === 'UPCOMING') {
    subject = `Upcoming Invoice ${invoice.invoiceNumber} Due Soon`;
    message = `Hi ${custName},\n\nJust a quick heads up that invoice #${invoice.invoiceNumber} for ${amountStr} from ${orgName} is due on ${formatDate(invoice.dueDate)}.\n\nThank you for your business!\n${orgName}`;
  } else {
    subject = `Invoice #${invoice.invoiceNumber} from ${orgName}`;
    message = `Hi ${custName},\n\nHere are the details for invoice #${invoice.invoiceNumber} from ${orgName}.\n\nTotal Amount Due: ${amountStr}\nDue Date: ${formatDate(invoice.dueDate)}\n\nPlease find your invoice attached.\n\nBest regards,\n${orgName}`;
  }

  const cleanPhone = invoice.customer?.phone ? invoice.customer.phone.replace(/[^0-9]/g, '') : '';
  const cleanEmail = invoice.customerEmail || '';

  const whatsappUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
    : undefined;

  const emailUrl = cleanEmail
    ? `mailto:${cleanEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`
    : undefined;

  const smsUrl = cleanPhone
    ? `sms:${cleanPhone}?body=${encodeURIComponent(message)}`
    : undefined;

  return { subject, message, whatsappUrl, emailUrl, smsUrl };
}
