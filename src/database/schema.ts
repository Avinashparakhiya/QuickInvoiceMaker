export const CREATE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    display_name TEXT,
    logo_uri TEXT,
    signature_uri TEXT,
    stamp_uri TEXT,
    email TEXT,
    phone TEXT,
    website TEXT,
    address_street TEXT,
    address_city TEXT,
    address_state TEXT,
    address_zip TEXT,
    address_country TEXT,
    tax_id TEXT,
    tax_enabled INTEGER DEFAULT 1,
    tax_type TEXT DEFAULT 'EXCLUSIVE',
    currency_code TEXT DEFAULT 'USD',
    currency_symbol TEXT DEFAULT '$',
    currency_position TEXT DEFAULT 'BEFORE',
    decimal_places INTEGER DEFAULT 2,
    invoice_prefix TEXT DEFAULT 'INV-',
    invoice_next_number INTEGER DEFAULT 1001,
    invoice_padding INTEGER DEFAULT 4,
    estimate_prefix TEXT DEFAULT 'EST-',
    estimate_next_number INTEGER DEFAULT 101,
    default_payment_terms TEXT DEFAULT 'NET_30',
    default_template_id TEXT DEFAULT 'classic_green',
    bank_name TEXT,
    bank_account_no TEXT,
    bank_ifsc_swift TEXT,
    bank_account_holder TEXT,
    upi_vpa TEXT,
    signatory_name TEXT,
    signatory_title TEXT,
    default_notes TEXT,
    default_terms TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    name TEXT NOT NULL,
    company_name TEXT,
    email TEXT,
    phone TEXT,
    billing_street TEXT,
    billing_city TEXT,
    billing_state TEXT,
    billing_zip TEXT,
    billing_country TEXT,
    shipping_street TEXT,
    shipping_city TEXT,
    shipping_state TEXT,
    shipping_zip TEXT,
    shipping_country TEXT,
    tax_id TEXT,
    currency_code TEXT,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    name TEXT NOT NULL,
    sku TEXT,
    description TEXT,
    unit TEXT DEFAULT 'pcs',
    rate REAL NOT NULL DEFAULT 0.0,
    tax_rate REAL DEFAULT 0.0,
    category TEXT DEFAULT 'SERVICE',
    is_active INTEGER DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    customer_id TEXT NOT NULL,
    invoice_number TEXT NOT NULL,
    po_number TEXT,
    issue_date TEXT NOT NULL,
    due_date TEXT NOT NULL,
    payment_terms TEXT DEFAULT 'NET_30',
    status TEXT NOT NULL DEFAULT 'DRAFT',
    template_id TEXT NOT NULL DEFAULT 'classic_green',
    currency_code TEXT NOT NULL DEFAULT 'USD',
    currency_symbol TEXT NOT NULL DEFAULT '$',
    subtotal REAL NOT NULL DEFAULT 0.0,
    discount_type TEXT DEFAULT 'PERCENTAGE',
    discount_value REAL DEFAULT 0.0,
    discount_amount REAL DEFAULT 0.0,
    tax_amount REAL DEFAULT 0.0,
    shipping_charge REAL DEFAULT 0.0,
    adjustment_amount REAL DEFAULT 0.0,
    total_amount REAL NOT NULL DEFAULT 0.0,
    paid_amount REAL NOT NULL DEFAULT 0.0,
    balance_due REAL NOT NULL DEFAULT 0.0,
    notes TEXT,
    terms_conditions TEXT,
    payment_instructions TEXT,
    upi_qr_enabled INTEGER DEFAULT 1,
    signature_enabled INTEGER DEFAULT 1,
    signature_uri TEXT,
    signatory_name TEXT,
    signatory_title TEXT,
    attachment_uris TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS invoice_items (
    id TEXT PRIMARY KEY,
    invoice_id TEXT NOT NULL,
    item_id TEXT,
    description TEXT NOT NULL,
    sku TEXT,
    unit TEXT DEFAULT 'pcs',
    quantity REAL NOT NULL DEFAULT 1.0,
    rate REAL NOT NULL DEFAULT 0.0,
    discount_rate REAL DEFAULT 0.0,
    tax_rate REAL DEFAULT 0.0,
    tax_amount REAL DEFAULT 0.0,
    line_total REAL NOT NULL DEFAULT 0.0,
    sort_order INTEGER DEFAULT 0,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS estimates (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    customer_id TEXT NOT NULL,
    estimate_number TEXT NOT NULL,
    issue_date TEXT NOT NULL,
    expiry_date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'DRAFT',
    template_id TEXT NOT NULL DEFAULT 'classic_green',
    currency_code TEXT NOT NULL DEFAULT 'USD',
    currency_symbol TEXT NOT NULL DEFAULT '$',
    subtotal REAL NOT NULL DEFAULT 0.0,
    discount_amount REAL DEFAULT 0.0,
    tax_amount REAL DEFAULT 0.0,
    shipping_charge REAL DEFAULT 0.0,
    total_amount REAL NOT NULL DEFAULT 0.0,
    converted_invoice_id TEXT,
    notes TEXT,
    terms_conditions TEXT,
    signature_enabled INTEGER DEFAULT 1,
    signature_uri TEXT,
    signatory_name TEXT,
    signatory_title TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS estimate_items (
    id TEXT PRIMARY KEY,
    estimate_id TEXT NOT NULL,
    item_id TEXT,
    description TEXT NOT NULL,
    unit TEXT DEFAULT 'pcs',
    quantity REAL NOT NULL DEFAULT 1.0,
    rate REAL NOT NULL DEFAULT 0.0,
    discount_rate REAL DEFAULT 0.0,
    tax_rate REAL DEFAULT 0.0,
    line_total REAL NOT NULL DEFAULT 0.0,
    sort_order INTEGER DEFAULT 0,
    FOREIGN KEY (estimate_id) REFERENCES estimates(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    invoice_id TEXT,
    customer_id TEXT NOT NULL,
    payment_number TEXT NOT NULL,
    amount REAL NOT NULL,
    payment_date TEXT NOT NULL,
    payment_type TEXT NOT NULL DEFAULT 'PAYMENT',
    payment_method TEXT NOT NULL DEFAULT 'BANK_TRANSFER',
    reference_number TEXT,
    notes TEXT,
    receipt_uri TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    category TEXT NOT NULL,
    amount REAL NOT NULL,
    currency_code TEXT NOT NULL DEFAULT 'USD',
    expense_date TEXT NOT NULL,
    vendor TEXT,
    description TEXT,
    is_billable INTEGER DEFAULT 0,
    customer_id TEXT,
    invoice_id TEXT,
    receipt_image_uri TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_invoices_org ON invoices(organization_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_payments_org ON payments(organization_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_customers_org ON customers(organization_id);
CREATE INDEX IF NOT EXISTS idx_items_org ON items(organization_id);
`;
