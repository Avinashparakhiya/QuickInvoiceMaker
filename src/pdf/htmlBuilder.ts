import { Invoice, Organization, TemplateId } from '../types';
import { renderInvoiceHtmlByTemplate } from './templates';

export function buildInvoiceHtml(invoice: Invoice, org: Organization, templateOverride?: TemplateId): string {
  return renderInvoiceHtmlByTemplate(invoice, org, templateOverride);
}
