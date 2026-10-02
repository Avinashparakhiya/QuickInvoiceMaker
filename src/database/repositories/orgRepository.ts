import { queryAll, queryFirst, executeSql } from '../db';
import { Organization } from '../../types';

export const orgRepository = {
  async getAll(): Promise<Organization[]> {
    const rows = await queryAll<any>('SELECT * FROM organizations ORDER BY created_at ASC');
    return rows.map(mapRowToOrg);
  },

  async getActive(): Promise<Organization | null> {
    const row = await queryFirst<any>('SELECT * FROM organizations WHERE is_active = 1 LIMIT 1');
    if (!row) {
      // Fallback to first available organization
      const firstRow = await queryFirst<any>('SELECT * FROM organizations LIMIT 1');
      return firstRow ? mapRowToOrg(firstRow) : null;
    }
    return mapRowToOrg(row);
  },

  async getById(id: string): Promise<Organization | null> {
    const row = await queryFirst<any>('SELECT * FROM organizations WHERE id = ?', [id]);
    return row ? mapRowToOrg(row) : null;
  },

  async setActive(id: string): Promise<void> {
    await executeSql('UPDATE organizations SET is_active = 0');
    await executeSql('UPDATE organizations SET is_active = 1 WHERE id = ?', [id]);
  },

  async create(org: Omit<Organization, 'createdAt' | 'updatedAt'>): Promise<Organization> {
    const nowIso = new Date().toISOString();
    await executeSql(
      `INSERT INTO organizations (
        id, name, display_name, logo_uri, signature_uri, stamp_uri,
        email, phone, website, address_street, address_city, address_state,
        address_zip, address_country, tax_id, tax_enabled, tax_type,
        currency_code, currency_symbol, currency_position, decimal_places,
        invoice_prefix, invoice_next_number, invoice_padding,
        estimate_prefix, estimate_next_number, default_payment_terms,
        default_template_id, bank_name, bank_account_no, bank_ifsc_swift,
        bank_account_holder, upi_vpa, signatory_name, signatory_title, default_notes, default_terms,
        is_active, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?
      )`,
      [
        org.id,
        org.name,
        org.displayName || null,
        org.logoUri || null,
        org.signatureUri || null,
        org.stampUri || null,
        org.email || null,
        org.phone || null,
        org.website || null,
        org.addressStreet || null,
        org.addressCity || null,
        org.addressState || null,
        org.addressZip || null,
        org.addressCountry || null,
        org.taxId || null,
        org.taxEnabled ? 1 : 0,
        org.taxType || 'EXCLUSIVE',
        org.currencyCode || 'USD',
        org.currencySymbol || '$',
        org.currencyPosition || 'BEFORE',
        org.decimalPlaces ?? 2,
        org.invoicePrefix || 'INV-',
        org.invoiceNextNumber ?? 1001,
        org.invoicePadding ?? 4,
        org.estimatePrefix || 'EST-',
        org.estimateNextNumber ?? 101,
        org.defaultPaymentTerms || 'NET_30',
        org.defaultTemplateId || 'classic_green',
        org.bankName || null,
        org.bankAccountNo || null,
        org.bankIfscSwift || null,
        org.bankAccountHolder || null,
        org.upiVpa || null,
        org.signatoryName || null,
        org.signatoryTitle || null,
        org.defaultNotes || null,
        org.defaultTerms || null,
        org.isActive ? 1 : 0,
        nowIso,
        nowIso,
      ]
    );

    return (await this.getById(org.id))!;
  },

  async update(id: string, updates: Partial<Organization>): Promise<void> {
    const nowIso = new Date().toISOString();
    const fields: string[] = ['updated_at = ?'];
    const values: any[] = [nowIso];

    if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name); }
    if (updates.displayName !== undefined) { fields.push('display_name = ?'); values.push(updates.displayName); }
    if (updates.logoUri !== undefined) { fields.push('logo_uri = ?'); values.push(updates.logoUri); }
    if (updates.signatureUri !== undefined) { fields.push('signature_uri = ?'); values.push(updates.signatureUri); }
    if (updates.stampUri !== undefined) { fields.push('stamp_uri = ?'); values.push(updates.stampUri); }
    if (updates.email !== undefined) { fields.push('email = ?'); values.push(updates.email); }
    if (updates.phone !== undefined) { fields.push('phone = ?'); values.push(updates.phone); }
    if (updates.website !== undefined) { fields.push('website = ?'); values.push(updates.website); }
    if (updates.addressStreet !== undefined) { fields.push('address_street = ?'); values.push(updates.addressStreet); }
    if (updates.addressCity !== undefined) { fields.push('address_city = ?'); values.push(updates.addressCity); }
    if (updates.addressState !== undefined) { fields.push('address_state = ?'); values.push(updates.addressState); }
    if (updates.addressZip !== undefined) { fields.push('address_zip = ?'); values.push(updates.addressZip); }
    if (updates.addressCountry !== undefined) { fields.push('address_country = ?'); values.push(updates.addressCountry); }
    if (updates.taxId !== undefined) { fields.push('tax_id = ?'); values.push(updates.taxId); }
    if (updates.taxEnabled !== undefined) { fields.push('tax_enabled = ?'); values.push(updates.taxEnabled ? 1 : 0); }
    if (updates.taxType !== undefined) { fields.push('tax_type = ?'); values.push(updates.taxType); }
    if (updates.currencyCode !== undefined) { fields.push('currency_code = ?'); values.push(updates.currencyCode); }
    if (updates.currencySymbol !== undefined) { fields.push('currency_symbol = ?'); values.push(updates.currencySymbol); }
    if (updates.currencyPosition !== undefined) { fields.push('currency_position = ?'); values.push(updates.currencyPosition); }
    if (updates.decimalPlaces !== undefined) { fields.push('decimal_places = ?'); values.push(updates.decimalPlaces); }
    if (updates.invoicePrefix !== undefined) { fields.push('invoice_prefix = ?'); values.push(updates.invoicePrefix); }
    if (updates.invoiceNextNumber !== undefined) { fields.push('invoice_next_number = ?'); values.push(updates.invoiceNextNumber); }
    if (updates.invoicePadding !== undefined) { fields.push('invoice_padding = ?'); values.push(updates.invoicePadding); }
    if (updates.defaultPaymentTerms !== undefined) { fields.push('default_payment_terms = ?'); values.push(updates.defaultPaymentTerms); }
    if (updates.defaultTemplateId !== undefined) { fields.push('default_template_id = ?'); values.push(updates.defaultTemplateId); }
    if (updates.bankName !== undefined) { fields.push('bank_name = ?'); values.push(updates.bankName); }
    if (updates.bankAccountNo !== undefined) { fields.push('bank_account_no = ?'); values.push(updates.bankAccountNo); }
    if (updates.bankIfscSwift !== undefined) { fields.push('bank_ifsc_swift = ?'); values.push(updates.bankIfscSwift); }
    if (updates.bankAccountHolder !== undefined) { fields.push('bank_account_holder = ?'); values.push(updates.bankAccountHolder); }
    if (updates.upiVpa !== undefined) { fields.push('upi_vpa = ?'); values.push(updates.upiVpa); }
    if (updates.signatoryName !== undefined) { fields.push('signatory_name = ?'); values.push(updates.signatoryName); }
    if (updates.signatoryTitle !== undefined) { fields.push('signatory_title = ?'); values.push(updates.signatoryTitle); }
    if (updates.defaultNotes !== undefined) { fields.push('default_notes = ?'); values.push(updates.defaultNotes); }
    if (updates.defaultTerms !== undefined) { fields.push('default_terms = ?'); values.push(updates.defaultTerms); }

    values.push(id);
    await executeSql(`UPDATE organizations SET ${fields.join(', ')} WHERE id = ?`, values);
  },

  async incrementNextInvoiceNumber(orgId: string): Promise<void> {
    await executeSql('UPDATE organizations SET invoice_next_number = invoice_next_number + 1 WHERE id = ?', [orgId]);
  },

  async incrementNextEstimateNumber(orgId: string): Promise<void> {
    await executeSql('UPDATE organizations SET estimate_next_number = estimate_next_number + 1 WHERE id = ?', [orgId]);
  },

  async delete(id: string): Promise<void> {
    await executeSql('DELETE FROM organizations WHERE id = ?', [id]);
  },
};

function mapRowToOrg(row: any): Organization {
  return {
    id: row.id,
    name: row.name,
    displayName: row.display_name,
    logoUri: row.logo_uri,
    signatureUri: row.signature_uri,
    stampUri: row.stamp_uri,
    email: row.email,
    phone: row.phone,
    website: row.website,
    addressStreet: row.address_street,
    addressCity: row.address_city,
    addressState: row.address_state,
    addressZip: row.address_zip,
    addressCountry: row.address_country,
    taxId: row.tax_id,
    taxEnabled: Boolean(row.tax_enabled),
    taxType: row.tax_type,
    currencyCode: row.currency_code,
    currencySymbol: row.currency_symbol,
    currencyPosition: row.currency_position,
    decimalPlaces: row.decimal_places,
    invoicePrefix: row.invoice_prefix,
    invoiceNextNumber: row.invoice_next_number,
    invoicePadding: row.invoice_padding,
    estimatePrefix: row.estimate_prefix,
    estimateNextNumber: row.estimate_next_number,
    defaultPaymentTerms: row.default_payment_terms,
    defaultTemplateId: row.default_template_id,
    bankName: row.bank_name,
    bankAccountNo: row.bank_account_no,
    bankIfscSwift: row.bank_ifsc_swift,
    bankAccountHolder: row.bank_account_holder,
    upiVpa: row.upi_vpa,
    signatoryName: row.signatory_name,
    signatoryTitle: row.signatory_title,
    defaultNotes: row.default_notes,
    defaultTerms: row.default_terms,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
