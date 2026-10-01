import * as SQLite from 'expo-sqlite';
import { format, subDays, addDays } from 'date-fns';

export async function seedInitialData(db: SQLite.SQLiteDatabase): Promise<void> {
  const now = new Date();
  const todayStr = format(now, 'yyyy-MM-dd');
  const nowIso = now.toISOString();

  // 1. Seed Organizations
  const org1Id = 'org-apex-001';
  const org2Id = 'org-green-002';

  await db.runAsync(
    `INSERT INTO organizations (
      id, name, display_name, email, phone, website,
      address_street, address_city, address_state, address_zip, address_country,
      tax_id, tax_enabled, tax_type, currency_code, currency_symbol, currency_position,
      decimal_places, invoice_prefix, invoice_next_number, invoice_padding,
      estimate_prefix, estimate_next_number, default_payment_terms, default_template_id,
      bank_name, bank_account_no, bank_ifsc_swift, bank_account_holder, upi_vpa,
      default_notes, default_terms, is_active, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?
    )`,
    [
      org1Id,
      'Apex Creative Studio',
      'Apex Studio',
      'billing@apexstudio.io',
      '+1 (555) 234-5678',
      'www.apexstudio.io',
      '742 Evergreen Terrace, Suite 400',
      'San Francisco',
      'CA',
      '94107',
      'United States',
      'US-TAX-892144',
      1,
      'EXCLUSIVE',
      'USD',
      '$',
      'BEFORE',
      2,
      'APX-',
      1005,
      4,
      'EST-',
      102,
      'NET_30',
      'classic_green',
      'Silicon Valley Bank',
      '9876543210',
      'SVBUS6S',
      'Apex Creative LLC',
      'apex@okaxis',
      'Thank you for partnering with Apex Creative Studio. We appreciate your business!',
      'Payment is due within 30 days of invoice date. Late payments incur a 1.5% monthly fee.',
      1,
      nowIso,
      nowIso,
    ]
  );

  await db.runAsync(
    `INSERT INTO organizations (
      id, name, display_name, email, phone, website,
      address_street, address_city, address_state, address_zip, address_country,
      tax_id, tax_enabled, tax_type, currency_code, currency_symbol, currency_position,
      decimal_places, invoice_prefix, invoice_next_number, invoice_padding,
      estimate_prefix, estimate_next_number, default_payment_terms, default_template_id,
      bank_name, bank_account_no, bank_ifsc_swift, bank_account_holder, upi_vpa,
      default_notes, default_terms, is_active, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?
    )`,
    [
      org2Id,
      'Greenleaf Consulting Group',
      'Greenleaf Consulting',
      'contact@greenleaf.co',
      '+1 (555) 987-6543',
      'www.greenleaf.co',
      '120 Market Street, 14th Floor',
      'New York',
      'NY',
      '10005',
      'United States',
      'US-TAX-339811',
      1,
      'EXCLUSIVE',
      'USD',
      '$',
      'BEFORE',
      2,
      'GLC-',
      1002,
      4,
      'EST-',
      101,
      'NET_15',
      'modern_card',
      'JPMorgan Chase',
      '1122334455',
      'CHASUS33',
      'Greenleaf Consulting Inc.',
      'greenleaf@upi',
      'Thank you for choosing Greenleaf Consulting.',
      'Standard terms: Net 15 days from date of issuance.',
      1,
      nowIso,
      nowIso,
    ]
  );

  // 2. Seed Customers
  const cust1Id = 'cust-acme-001';
  const cust2Id = 'cust-nexus-002';
  const cust3Id = 'cust-lumina-003';

  await db.runAsync(
    `INSERT INTO customers (
      id, organization_id, name, company_name, email, phone,
      billing_street, billing_city, billing_state, billing_zip, billing_country,
      tax_id, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      cust1Id,
      org1Id,
      'Sarah Jenkins',
      'Acme Corp International',
      'sarah.j@acmecorp.com',
      '+1 (415) 890-1234',
      '500 Tech Boulevard',
      'San Jose',
      'CA',
      '95113',
      'United States',
      'ACME-US-991',
      nowIso,
      nowIso,
    ]
  );

  await db.runAsync(
    `INSERT INTO customers (
      id, organization_id, name, company_name, email, phone,
      billing_street, billing_city, billing_state, billing_zip, billing_country,
      tax_id, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      cust2Id,
      org1Id,
      'Michael Chen',
      'Nexus Global Logistics',
      'mchen@nexuslogistics.com',
      '+1 (415) 777-8899',
      '120 Harbor View Dr',
      'Seattle',
      'WA',
      '98101',
      'United States',
      'NEXUS-TAX-44',
      nowIso,
      nowIso,
    ]
  );

  await db.runAsync(
    `INSERT INTO customers (
      id, organization_id, name, company_name, email, phone,
      billing_street, billing_city, billing_state, billing_zip, billing_country,
      tax_id, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      cust3Id,
      org1Id,
      'Elena Rostova',
      'Lumina Media Labs',
      'elena@luminamedia.io',
      '+1 (212) 444-5566',
      '88 Broadway, Suite 12',
      'New York',
      'NY',
      '10003',
      'United States',
      'LUMINA-883',
      nowIso,
      nowIso,
    ]
  );

  // 3. Seed Items / Services
  const item1Id = 'item-ui-001';
  const item2Id = 'item-brand-002';
  const item3Id = 'item-dev-003';
  const item4Id = 'item-consult-004';

  await db.runAsync(
    `INSERT INTO items (
      id, organization_id, name, sku, description, unit, rate, tax_rate, category, is_active, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      item1Id,
      org1Id,
      'Mobile App UI/UX Design',
      'SRV-UI-01',
      'End-to-end design system, wireframing, high-fidelity prototypes and UI assets.',
      'hrs',
      120.0,
      10.0,
      'SERVICE',
      1,
      nowIso,
      nowIso,
    ]
  );

  await db.runAsync(
    `INSERT INTO items (
      id, organization_id, name, sku, description, unit, rate, tax_rate, category, is_active, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      item2Id,
      org1Id,
      'Brand Identity & Guidelines Kit',
      'SRV-BRD-02',
      'Logo design, color palette, typography guidelines and corporate stationery.',
      'pkg',
      2500.0,
      10.0,
      'SERVICE',
      1,
      nowIso,
      nowIso,
    ]
  );

  await db.runAsync(
    `INSERT INTO items (
      id, organization_id, name, sku, description, unit, rate, tax_rate, category, is_active, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      item3Id,
      org1Id,
      'React Native Frontend Development',
      'SRV-DEV-03',
      'Cross-platform mobile application development and native API integration.',
      'hrs',
      150.0,
      10.0,
      'SERVICE',
      1,
      nowIso,
      nowIso,
    ]
  );

  await db.runAsync(
    `INSERT INTO items (
      id, organization_id, name, sku, description, unit, rate, tax_rate, category, is_active, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      item4Id,
      org1Id,
      'Design Sprint & Strategy Consulting',
      'SRV-STRAT-04',
      '2-day strategic product discovery sprint with stakeholder interviews.',
      'day',
      1800.0,
      10.0,
      'SERVICE',
      1,
      nowIso,
      nowIso,
    ]
  );

  // 4. Seed Sample Invoices
  // Invoice 1: Paid ($3,960)
  const inv1Id = 'inv-apx-1001';
  const inv1Date = format(subDays(now, 20), 'yyyy-MM-dd');
  const inv1Due = format(subDays(now, 5), 'yyyy-MM-dd');

  await db.runAsync(
    `INSERT INTO invoices (
      id, organization_id, customer_id, invoice_number, po_number,
      issue_date, due_date, payment_terms, status, template_id,
      currency_code, currency_symbol, subtotal, discount_type, discount_value, discount_amount,
      tax_amount, shipping_charge, adjustment_amount, total_amount, paid_amount, balance_due,
      notes, terms_conditions, upi_qr_enabled, signature_enabled, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?
    )`,
    [
      inv1Id,
      org1Id,
      cust1Id,
      'APX-1001',
      'PO-88910',
      inv1Date,
      inv1Due,
      'NET_15',
      'PAID',
      'classic_green',
      'USD',
      '$',
      3600.0,
      'PERCENTAGE',
      0,
      0,
      360.0,
      0,
      0,
      3960.0,
      3960.0,
      0.0,
      'Thank you for your prompt payment!',
      'Net 15 days',
      1,
      1,
      nowIso,
      nowIso,
    ]
  );

  await db.runAsync(
    `INSERT INTO invoice_items (
      id, invoice_id, item_id, description, sku, unit, quantity, rate, discount_rate, tax_rate, tax_amount, line_total, sort_order
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'inv-item-1',
      inv1Id,
      item1Id,
      'Mobile App UI/UX Design (Wireframes & System)',
      'SRV-UI-01',
      'hrs',
      30,
      120.0,
      0,
      10.0,
      360.0,
      3960.0,
      0,
    ]
  );

  // Payment Record for Invoice 1
  await db.runAsync(
    `INSERT INTO payments (
      id, organization_id, invoice_id, customer_id, payment_number,
      amount, payment_date, payment_type, payment_method, reference_number, notes, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'pay-001',
      org1Id,
      inv1Id,
      cust1Id,
      'PAY-1001',
      3960.0,
      format(subDays(now, 6), 'yyyy-MM-dd'),
      'PAYMENT',
      'BANK_TRANSFER',
      'WIRE-992188',
      'Full settlement received via Wire Transfer.',
      nowIso,
    ]
  );

  // Invoice 2: Partially Paid ($5,500 total, $2,500 paid, $3,000 balance)
  const inv2Id = 'inv-apx-1002';
  const inv2Date = format(subDays(now, 10), 'yyyy-MM-dd');
  const inv2Due = format(addDays(now, 20), 'yyyy-MM-dd');

  await db.runAsync(
    `INSERT INTO invoices (
      id, organization_id, customer_id, invoice_number, po_number,
      issue_date, due_date, payment_terms, status, template_id,
      currency_code, currency_symbol, subtotal, discount_type, discount_value, discount_amount,
      tax_amount, shipping_charge, adjustment_amount, total_amount, paid_amount, balance_due,
      notes, terms_conditions, upi_qr_enabled, signature_enabled, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?
    )`,
    [
      inv2Id,
      org1Id,
      cust2Id,
      'APX-1002',
      'PO-NEXUS-02',
      inv2Date,
      inv2Due,
      'NET_30',
      'PARTIAL',
      'modern_card',
      'USD',
      '$',
      5000.0,
      'PERCENTAGE',
      0,
      0,
      500.0,
      0,
      0,
      5500.0,
      2500.0,
      3000.0,
      'First milestone payment received with thanks.',
      'Net 30 days',
      1,
      1,
      nowIso,
      nowIso,
    ]
  );

  await db.runAsync(
    `INSERT INTO invoice_items (
      id, invoice_id, item_id, description, sku, unit, quantity, rate, discount_rate, tax_rate, tax_amount, line_total, sort_order
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'inv-item-2',
      inv2Id,
      item2Id,
      'Brand Identity & Guidelines Kit',
      'SRV-BRD-02',
      'pkg',
      2,
      2500.0,
      0,
      10.0,
      500.0,
      5500.0,
      0,
    ]
  );

  // Payment Record for Invoice 2 (Partial)
  await db.runAsync(
    `INSERT INTO payments (
      id, organization_id, invoice_id, customer_id, payment_number,
      amount, payment_date, payment_type, payment_method, reference_number, notes, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'pay-002',
      org1Id,
      inv2Id,
      cust2Id,
      'PAY-1002',
      2500.0,
      format(subDays(now, 5), 'yyyy-MM-dd'),
      'PAYMENT',
      'CARD',
      'TXN-CC-8823',
      '50% deposit received on project kickoff.',
      nowIso,
    ]
  );

  // Invoice 3: Unpaid / Due Soon ($1,980, due in 4 days)
  const inv3Id = 'inv-apx-1003';
  const inv3Date = format(subDays(now, 3), 'yyyy-MM-dd');
  const inv3Due = format(addDays(now, 4), 'yyyy-MM-dd');

  await db.runAsync(
    `INSERT INTO invoices (
      id, organization_id, customer_id, invoice_number, po_number,
      issue_date, due_date, payment_terms, status, template_id,
      currency_code, currency_symbol, subtotal, discount_type, discount_value, discount_amount,
      tax_amount, shipping_charge, adjustment_amount, total_amount, paid_amount, balance_due,
      notes, terms_conditions, upi_qr_enabled, signature_enabled, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?
    )`,
    [
      inv3Id,
      org1Id,
      cust3Id,
      'APX-1003',
      'PO-LUM-77',
      inv3Date,
      inv3Due,
      'NET_7',
      'UNPAID',
      'classic_green',
      'USD',
      '$',
      1800.0,
      'PERCENTAGE',
      0,
      0,
      180.0,
      0,
      0,
      1980.0,
      0.0,
      1980.0,
      'Strategy workshop deliverables completed.',
      'Net 7 days',
      1,
      1,
      nowIso,
      nowIso,
    ]
  );

  await db.runAsync(
    `INSERT INTO invoice_items (
      id, invoice_id, item_id, description, sku, unit, quantity, rate, discount_rate, tax_rate, tax_amount, line_total, sort_order
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'inv-item-3',
      inv3Id,
      item4Id,
      'Design Sprint & Strategy Consulting',
      'SRV-STRAT-04',
      'day',
      1,
      1800.0,
      0,
      10.0,
      180.0,
      1980.0,
      0,
    ]
  );

  // Invoice 4: Overdue ($2,475, overdue by 8 days)
  const inv4Id = 'inv-apx-1004';
  const inv4Date = format(subDays(now, 22), 'yyyy-MM-dd');
  const inv4Due = format(subDays(now, 8), 'yyyy-MM-dd');

  await db.runAsync(
    `INSERT INTO invoices (
      id, organization_id, customer_id, invoice_number, po_number,
      issue_date, due_date, payment_terms, status, template_id,
      currency_code, currency_symbol, subtotal, discount_type, discount_value, discount_amount,
      tax_amount, shipping_charge, adjustment_amount, total_amount, paid_amount, balance_due,
      notes, terms_conditions, upi_qr_enabled, signature_enabled, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?
    )`,
    [
      inv4Id,
      org1Id,
      cust1Id,
      'APX-1004',
      'PO-88944',
      inv4Date,
      inv4Due,
      'NET_15',
      'OVERDUE',
      'bold_contrast',
      'USD',
      '$',
      2250.0,
      'PERCENTAGE',
      0,
      0,
      225.0,
      0,
      0,
      2475.0,
      0.0,
      2475.0,
      'Friendly reminder: this invoice is past due.',
      'Net 15 days',
      1,
      1,
      nowIso,
      nowIso,
    ]
  );

  await db.runAsync(
    `INSERT INTO invoice_items (
      id, invoice_id, item_id, description, sku, unit, quantity, rate, discount_rate, tax_rate, tax_amount, line_total, sort_order
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'inv-item-4',
      inv4Id,
      item3Id,
      'React Native Frontend Development (Sprint 2)',
      'SRV-DEV-03',
      'hrs',
      15,
      150.0,
      0,
      10.0,
      225.0,
      2475.0,
      0,
    ]
  );
}
