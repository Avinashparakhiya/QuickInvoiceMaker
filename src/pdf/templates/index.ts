import { Invoice, Organization, TemplateId } from '../../types';
import { renderClassicGreenTemplate } from './classicGreen';
import { renderMinimalSlateTemplate } from './minimalSlate';
import { renderModernCardTemplate } from './modernCard';
import { renderBusinessProTemplate } from './businessPro';
import { renderGstIndiaTemplate } from './gstIndia';
import { renderServiceDetailedTemplate } from './serviceDetailed';
import { renderRetailCompactTemplate } from './retailCompact';
import { renderFreelancerChicTemplate } from './freelancerChic';
import { renderEditorialSerifTemplate } from './editorialSerif';
import { renderBoldContrastTemplate } from './boldContrast';
import { renderReceiptSlipTemplate } from './receiptSlip';
import { renderSimpleSageTemplate } from './simpleSage';

export const templateRenderers: Record<
  TemplateId,
  (invoice: Invoice, org: Organization) => string
> = {
  classic_green: renderClassicGreenTemplate,
  minimal_slate: renderMinimalSlateTemplate,
  modern_card: renderModernCardTemplate,
  business_pro: renderBusinessProTemplate,
  gst_india: renderGstIndiaTemplate,
  service_detailed: renderServiceDetailedTemplate,
  retail_compact: renderRetailCompactTemplate,
  freelancer_chic: renderFreelancerChicTemplate,
  editorial_serif: renderEditorialSerifTemplate,
  bold_contrast: renderBoldContrastTemplate,
  receipt_slip: renderReceiptSlipTemplate,
  simple_sage: renderSimpleSageTemplate,
};

export function renderInvoiceHtmlByTemplate(
  invoice: Invoice,
  org: Organization,
  templateId?: TemplateId
): string {
  const targetId = templateId || invoice.templateId || 'classic_green';
  const renderer = templateRenderers[targetId] || renderClassicGreenTemplate;
  return renderer(invoice, org);
}
