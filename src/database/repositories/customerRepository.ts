import { queryAll, queryFirst, executeSql } from '../db';
import { Customer } from '../../types';

export const customerRepository = {
  async getByOrg(orgId: string): Promise<Customer[]> {
    const rows = await queryAll<any>(
      'SELECT * FROM customers WHERE organization_id = ? ORDER BY name ASC',
      [orgId]
    );
    return rows.map(mapRowToCustomer);
  },

  async getById(id: string): Promise<Customer | null> {
    const row = await queryFirst<any>('SELECT * FROM customers WHERE id = ?', [id]);
    return row ? mapRowToCustomer(row) : null;
  },

  async search(orgId: string, query: string): Promise<Customer[]> {
    const term = `%${query.trim()}%`;
    const rows = await queryAll<any>(
      `SELECT * FROM customers 
       WHERE organization_id = ? 
       AND (name LIKE ? OR company_name LIKE ? OR email LIKE ? OR phone LIKE ?)
       ORDER BY name ASC LIMIT 20`,
      [orgId, term, term, term, term]
    );
    return rows.map(mapRowToCustomer);
  },

  async create(customer: Omit<Customer, 'createdAt' | 'updatedAt'>): Promise<Customer> {
    const nowIso = new Date().toISOString();
    await executeSql(
      `INSERT INTO customers (
        id, organization_id, name, company_name, email, phone,
        billing_street, billing_city, billing_state, billing_zip, billing_country,
        shipping_street, shipping_city, shipping_state, shipping_zip, shipping_country,
        tax_id, currency_code, notes, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?
      )`,
      [
        customer.id,
        customer.organizationId,
        customer.name,
        customer.companyName || null,
        customer.email || null,
        customer.phone || null,
        customer.billingStreet || null,
        customer.billingCity || null,
        customer.billingState || null,
        customer.billingZip || null,
        customer.billingCountry || null,
        customer.shippingStreet || null,
        customer.shippingCity || null,
        customer.shippingState || null,
        customer.shippingZip || null,
        customer.shippingCountry || null,
        customer.taxId || null,
        customer.currencyCode || null,
        customer.notes || null,
        nowIso,
        nowIso,
      ]
    );
    return (await this.getById(customer.id))!;
  },

  async update(id: string, updates: Partial<Customer>): Promise<void> {
    const nowIso = new Date().toISOString();
    const fields: string[] = ['updated_at = ?'];
    const values: any[] = [nowIso];

    if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name); }
    if (updates.companyName !== undefined) { fields.push('company_name = ?'); values.push(updates.companyName); }
    if (updates.email !== undefined) { fields.push('email = ?'); values.push(updates.email); }
    if (updates.phone !== undefined) { fields.push('phone = ?'); values.push(updates.phone); }
    if (updates.billingStreet !== undefined) { fields.push('billing_street = ?'); values.push(updates.billingStreet); }
    if (updates.billingCity !== undefined) { fields.push('billing_city = ?'); values.push(updates.billingCity); }
    if (updates.billingState !== undefined) { fields.push('billing_state = ?'); values.push(updates.billingState); }
    if (updates.billingZip !== undefined) { fields.push('billing_zip = ?'); values.push(updates.billingZip); }
    if (updates.billingCountry !== undefined) { fields.push('billing_country = ?'); values.push(updates.billingCountry); }
    if (updates.shippingStreet !== undefined) { fields.push('shipping_street = ?'); values.push(updates.shippingStreet); }
    if (updates.shippingCity !== undefined) { fields.push('shipping_city = ?'); values.push(updates.shippingCity); }
    if (updates.shippingState !== undefined) { fields.push('shipping_state = ?'); values.push(updates.shippingState); }
    if (updates.shippingZip !== undefined) { fields.push('shipping_zip = ?'); values.push(updates.shippingZip); }
    if (updates.shippingCountry !== undefined) { fields.push('shipping_country = ?'); values.push(updates.shippingCountry); }
    if (updates.taxId !== undefined) { fields.push('tax_id = ?'); values.push(updates.taxId); }
    if (updates.currencyCode !== undefined) { fields.push('currency_code = ?'); values.push(updates.currencyCode); }
    if (updates.notes !== undefined) { fields.push('notes = ?'); values.push(updates.notes); }

    values.push(id);
    await executeSql(`UPDATE customers SET ${fields.join(', ')} WHERE id = ?`, values);
  },

  async delete(id: string): Promise<void> {
    await executeSql('DELETE FROM customers WHERE id = ?', [id]);
  },
};

function mapRowToCustomer(row: any): Customer {
  return {
    id: row.id,
    organizationId: row.organization_id,
    name: row.name,
    companyName: row.company_name,
    email: row.email,
    phone: row.phone,
    billingStreet: row.billing_street,
    billingCity: row.billing_city,
    billingState: row.billing_state,
    billingZip: row.billing_zip,
    billingCountry: row.billing_country,
    shippingStreet: row.shipping_street,
    shippingCity: row.shipping_city,
    shippingState: row.shipping_state,
    shippingZip: row.shipping_zip,
    shippingCountry: row.shipping_country,
    taxId: row.tax_id,
    currencyCode: row.currency_code,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
