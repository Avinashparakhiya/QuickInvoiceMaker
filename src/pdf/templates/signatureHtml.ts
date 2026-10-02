import { Invoice, Organization, Estimate } from '../../types';

interface SignatureOptions {
  align?: 'left' | 'right' | 'center' | 'flex-end';
  textColor?: string;
  lineColor?: string;
  labelColor?: string;
}

export function buildSignatureHtml(
  doc: Invoice | Estimate | { signatureUri?: string; signatoryName?: string; signatoryTitle?: string; signatureEnabled?: boolean },
  org: Organization,
  options: SignatureOptions = {}
): string {
  const isEnabled = doc.signatureEnabled !== false;
  const sigUri = doc.signatureUri || org.signatureUri;
  const signatoryName = doc.signatoryName || org.signatoryName;
  const signatoryTitle = doc.signatoryTitle || org.signatoryTitle || (org.displayName || org.name);

  if (!isEnabled && !sigUri && !signatoryName) {
    return '';
  }

  const align = options.align || 'flex-end';
  const textColor = options.textColor || '#0F172A';
  const lineColor = options.lineColor || '#CBD5E1';
  const labelColor = options.labelColor || '#64748B';

  return `
    <div style="display: flex; flex-direction: column; align-items: ${align}; text-align: ${align === 'center' ? 'center' : align === 'left' ? 'left' : 'right'}; margin-top: 24px; margin-left: auto;">
      ${
        sigUri
          ? `<img src="${sigUri}" alt="Digital Signature" style="max-height: 48px; max-width: 140px; margin-bottom: 4px; object-fit: contain; ${align === 'center' ? 'margin: 0 auto 4px auto;' : ''}" />`
          : `<div style="height: 36px;"></div>`
      }
      <div style="width: 150px; border-bottom: 1.5px solid ${lineColor}; margin-bottom: 5px; ${align === 'center' ? 'margin-left: auto; margin-right: auto;' : ''}"></div>
      <div style="font-size: 12px; font-weight: 700; color: ${textColor};">${signatoryName || 'Authorized Signatory'}</div>
      ${signatoryTitle ? `<div style="font-size: 11px; color: ${labelColor}; margin-top: 2px;">${signatoryTitle}</div>` : ''}
    </div>
  `;
}
