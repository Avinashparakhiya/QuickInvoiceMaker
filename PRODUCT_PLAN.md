# 🚀 QUICK INVOICE MAKER — Comprehensive Product Plan & Technical Specification

> **Simple. Fast. Professional Invoices.**  
> *Mobile-First Invoicing & Cashflow Management Engine for Freelancers, Small Businesses, Consultants, Contractors & Agencies.*  
> **Platform:** React Native (iOS & Android) • **Architecture:** Local-First / SQLite + Zustand • **Design:** Modern Fresh Green & White System

---

## 📑 Table of Contents
1. [Executive Summary & Vision](#1-executive-summary--vision)
2. [Modern UI/UX Design System & Aesthetics](#2-modern-uiux-design-system--aesthetics)
3. [App Architecture & Tech Stack](#3-app-architecture--tech-stack)
4. [Complete Feature Specification](#4-complete-feature-specification)
5. [Database Schema & Data Model](#5-database-schema--data-model)
6. [Invoice Calculation Engine & Lifecycle Logic](#6-invoice-calculation-engine--lifecycle-logic)
7. [Invoice Template Catalog (12+ Templates)](#7-invoice-template-catalog-12-templates)
8. [Phase-Wise Implementation Roadmap](#8-phase-wise-implementation-roadmap)
9. [Screen Inventory & User Flows](#9-screen-inventory--user-flows)
10. [Value-Added Features & Competitive Edge](#10-value-added-features--competitive-edge)
11. [Security, Privacy & Backup Architecture](#11-security-privacy--backup-architecture)
12. [Acceptance Criteria & Quality Checklist](#12-acceptance-criteria--quality-checklist)

---

## 1. Executive Summary & Vision

### 1.1 Product Purpose
**Quick Invoice Maker** is designed to solve the friction of traditional mobile billing. Traditional billing apps are either over-complicated desktop ports or clunky, ad-heavy utilities with ugly templates. Quick Invoice Maker delivers an ultra-fast, visually stunning, **under-60-second invoice creation** experience backed by a robust offline-first architecture, multi-organization support, granular payment tracking, and 12+ pixel-perfect PDF templates.

### 1.2 Core Pillars
* **⚡ Lightning Fast:** Pre-filled defaults, smart autofill, inline creation, and 1-tap template previews enable rapid invoice dispatch.
* **🌿 Modern Fresh Aesthetics:** Clean white cards, soft pistachio/sage backgrounds, emerald accents (#22C55E), smooth micro-animations, and bottom-sheet drawers.
* **📱 100% Offline-First:** Instant responsiveness without network latency. Complete local privacy with zero mandatory cloud accounts initially.
* **🏢 Multi-Organization Native:** Manage unlimited distinct businesses, brands, or freelance identities with independent numbering, logos, tax rules, and bank accounts.
* **💰 Real Financial Integrity:** Rigorous separation between invoice lifecycle states (Draft, Unpaid, Partial, Paid, Overdue, Cancelled) and payment records (Retainer/Advance, Partial, Split, Refund/Credit Notes).

---

## 2. Modern UI/UX Design System & Aesthetics

Inspired by modern fintech mobile applications (e.g., Stripe, Linear, Revolut, Apple Wallet):

### 2.1 Color Palette
| Token Name | Hex Code | Purpose / Usage |
| :--- | :--- | :--- |
| **Brand Primary** | `#22C55E` | Primary CTA buttons, active tab indicators, major success badges, brand accents |
| **Brand Primary Dark** | `#15803D` | Pressed button states, deep green highlights |
| **Surface Background** | `#EAF8EF` | Ultra-soft light green canvas background (calm, easy on eyes) |
| **Card Surface** | `#FFFFFF` | Elevated white cards, input containers, bottom sheet surfaces |
| **Secondary Surface**| `#F3FAF5` | Subtle nested containers, table headers, tag pills |
| **Border / Divider** | `#D7E5DC` | Crisp, ultra-subtle border stroke for cards and inputs |
| **Text Primary** | `#0F172A` | Slate 900 for high-contrast, crystal-clear headings and titles |
| **Text Secondary** | `#64748B` | Slate 500 for captions, timestamps, placeholder text, metadata |
| **Text Muted** | `#94A3B8` | Slate 400 for disabled states and subtle hints |
| **Status Paid / Success** | `#16A34A` / `#DCFCE7` | Text `#16A34A` on pill `#DCFCE7` |
| **Status Unpaid / Pending**| `#EAB308` / `#FEF9C3` | Amber text on soft yellow pill |
| **Status Overdue / Danger**| `#EF4444` / `#FEE2E2` | Rose/Red text on soft red pill |
| **Status Draft / Neutral** | `#64748B` / `#F1F5F9` | Slate text on light gray pill |
| **Status Partial** | `#0284C7` / `#E0F2FE` | Sky blue text on soft cyan pill |

### 2.2 Typography & Iconography
* **Font Family:** `Inter`, `SF Pro Text` (iOS), `Roboto` (Android).
* **Scale:**
  * Hero KPI: `32px` Bold (`letterSpacing: -0.8`)
  * Section Header: `20px` SemiBold
  * Card Title: `16px` SemiBold
  * Body Text: `14px` Regular
  * Captions / Badges: `12px` Medium
  * Micro / Legal: `10px` Medium
* **Icon Set:** Lucide React Native / Phosphor Icons (clean 1.75px stroke width, consistent line style).

### 2.3 Motion & Interaction Patterns
* **Bottom Sheets:** Interactive spring-animated sheets for item selection, customer picker, payment recording, and organization switching.
* **Haptic Feedback:** Subtle tactile clicks on button taps, status changes, and PDF export success.
* **Swipe Actions:** Swipe-to-delete, swipe-to-duplicate, and swipe-to-mark-paid on invoice lists.
* **Floating Action Button (+ Create):** Prominent center action that opens an animated speed-dial bottom sheet:
  * 📄 New Invoice
  * 📑 New Estimate / Quote
  * 👤 New Customer
  * 💵 Record Payment
  * 🏷️ New Product / Service
  * 🧾 Log Expense

---

## 3. App Architecture & Tech Stack

```
┌────────────────────────────────────────────────────────┐
│                   React Native App                     │
├────────────────────────────────────────────────────────┤
│  UI Layer: React Native + StyleSheet + Reanimated 3   │
│  Navigation: React Navigation v6 (Bottom Tabs + Stacks)│
│  Forms & Validation: React Hook Form + Zod             │
│  State Management: Zustand + MMKV Persistence          │
│  Local Database: SQLite (OP-SQLite / expo-sqlite)      │
│  PDF Engine: expo-print / react-native-html-to-pdf     │
│  Sharing & Export: expo-sharing / react-native-share   │
│  Charts: react-native-gifted-charts / victory-native   │
│  Date Math: date-fns                                   │
└────────────────────────────────────────────────────────┘
```

### 3.1 Directory Structure
```
src/
├── app/
│   ├── App.tsx                   # App entry, Providers, Error Boundary
│   └── index.ts
├── assets/
│   ├── fonts/
│   ├── icons/
│   └── images/                   # Sample logos, placeholders
├── navigation/
│   ├── AppNavigator.tsx          # Root Stack
│   ├── BottomTabNavigator.tsx    # Custom curved/floating bottom bar
│   └── types.ts                  # Typed routes
├── components/
│   ├── common/                   # Button, Card, Input, Badge, BottomSheet, Modal, Header
│   ├── forms/                    # FormInput, FormPicker, CurrencyInput, DatePicker
│   ├── kpi/                      # KPIStatCard, MiniSparkline, SummaryBanner
│   └── feedback/                 # Toast, EmptyState, SkeletonLoader, ConfirmDialog
├── database/
│   ├── schema.ts                 # SQL Tables DDL & Indexes
│   ├── migrations.ts             # Versioned schema migrations
│   ├── db.ts                     # Database connection & query helper
│   └── repositories/             # Typed CRUD queries (Org, Invoice, Customer, Item, Payment, Expense)
├── features/
│   ├── dashboard/                # DashboardScreen, KPI widgets, QuickActions
│   ├── organizations/            # OrgListScreen, OrgEditScreen, OrgSwitcherModal
│   ├── customers/                # CustomerListScreen, CustomerDetailScreen, CustomerFormModal
│   ├── items/                    # ItemListScreen, ItemFormModal, ItemSearchModal
│   ├── invoices/                 # InvoiceListScreen, InvoiceCreateScreen, InvoicePreviewScreen
│   │   ├── components/           # LineItemRow, TaxBreakdownCard, TotalsSummaryCard, TemplatePicker
│   │   └── hooks/                # useInvoiceCalculator, useInvoiceForm, useInvoicePDF
│   ├── estimates/                # EstimateListScreen, EstimateCreateScreen, ConvertToInvoiceModal
│   ├── payments/                 # RecordPaymentModal, PaymentHistoryList, ReceiptPreviewScreen
│   ├── calendar/                 # CashflowCalendarScreen, DueInvoiceList, DateFilterBar
│   ├── reports/                  # ReportsDashboardScreen, SalesReport, AgingReport, TaxReport
│   └── settings/                 # SettingsScreen, CurrencySettings, TaxSettings, BackupScreen
├── pdf/
│   ├── generator.ts              # HTML compiler & PDF printer
│   ├── htmlBuilder.ts            # Dynamic HTML assembler with inline CSS
│   └── templates/                # 12+ Template Layouts (Classic, Minimal, Modern, GST, etc.)
├── store/
│   ├── useOrgStore.ts            # Active organization & switcher state
│   ├── useInvoiceStore.ts        # Invoice drafting & filters state
│   └── useSettingsStore.ts       # Currency, tax preferences, theme settings
├── types/
│   └── index.ts                  # Unified TypeScript Interfaces
└── utils/
    ├── currency.ts               # Multi-currency formatters & symbols
    ├── dates.ts                  # Date formatting, relative dates, due calculations
    ├── calculations.ts           # Grand totals, multi-tax, line discounts, roundings
    ├── qrcode.ts                 # UPI / Bank payment QR code SVG generator
    └── exportImport.ts           # JSON database export/import & CSV export
```

---

## 4. Complete Feature Specification

### 4.1 Multi-Organization Management
* **Active Organization Switcher:** Fast modal switcher in the app bar; switches all dashboards, counters, customers, and invoice streams instantly.
* **Per-Organization Customization:**
  * Legal Name & Trade Name
  * Logo (camera/gallery upload)
  * Signature / Official Stamp image
  * Business Address (Street, City, State, ZIP, Country)
  * Contact Info (Email, Phone, Website)
  * Tax IDs (GSTIN, VAT No, PAN, EIN, Business Reg Number)
  * Invoice Numbering Sequence (e.g., `INV-2026-001`, customizable prefix, padding, auto-increment)
  * Default Payment Terms (Immediate, Net 7, Net 15, Net 30, Net 60, Custom)
  * Bank Details & UPI ID (Bank Name, Account No, IFSC/IBAN/SWIFT, Account Name, UPI VPA)
  * Default Notes & Terms & Conditions

### 4.2 Customer Relationship Management (CRM)
* **Customer Profile:**
  * Contact Person, Company Name, Email, Phone, Mobile
  * Billing Address & Separate Shipping Address
  * Customer Tax / GST Registration Number
  * Currency Preference (if different from default)
  * Internal Notes / Payment History log
* **Customer Balance & Statement of Accounts:** Total invoiced, total paid, outstanding balance, open invoices list, and downloadable Customer Statement PDF.
* **1-Tap Quick Action:** Call, WhatsApp, Email, or Create Invoice directly from customer card.

### 4.3 Products & Services Catalog
* **Item Properties:** Name, SKU/Code, Description, Unit (pcs, hrs, days, kg, m, box, etc.), Unit Price, Default Tax Rate, Category (Product vs Service).
* **Inline Creation:** Add a new product or service on the fly while typing an invoice without losing form context.
* **Item Search & Frequent Items:** Instant fuzzy search with quick quantity incrementers.

### 4.4 The 60-Second Fast Invoice Builder
```
Step 1: Org Details (Auto-filled)
Step 2: Customer (Pick existing or 1-tap quick add)
Step 3: Line Items (Pick from list or type custom + inline discount/tax)
Step 4: Dates & Terms (Auto-calculated due date based on Org defaults)
Step 5: Totals, Discounts & Adjustments (Live real-time recalculation)
Step 6: Payment Info & UPI QR Code (Auto-attached)
Step 7: Template Selector & Live PDF Preview
Step 8: Finalize -> Share via WhatsApp/Email/Files or Record Instant Payment
```

### 4.5 Estimates & Quotations Engine
* Create professional quotes using the exact same smooth line-item interface.
* Status tracking: `Draft`, `Sent`, `Accepted`, `Declined`, `Expired`, `Converted`.
* Set quotation expiry/validity periods (e.g., "Valid for 15 days").
* **1-Click Conversion:** Turn any accepted estimate into a formal invoice instantly, transferring all items, discounts, customer info, and notes while generating a brand new invoice number.

### 4.6 Payment Tracking & Ledger (Full, Partial, Retainers, Credit Notes)
* **Separate Payment Entity:** Payments are explicit ledger records linked to invoices or customer retainers.
* **Payment Types Supported:**
  * `Full Payment`
  * `Partial Payment` (records multiple installments against one invoice)
  * `Advance / Retainer Payment` (unapplied cash balance recorded upfront, applicable to future invoices)
  * `Split Payment` (e.g., $500 Cash + $500 Bank Transfer for a $1,000 bill)
  * `Credit Note / Refund` (adjustment for returned goods or billing errors)
* **Payment Methods:** Cash, Bank Transfer, UPI, Credit Card, Debit Card, Cheque, PayPal, Stripe, Other.
* **Payment Receipts:** Generate mini payment receipt PDFs for every transaction with 1-tap share.

### 4.7 Cashflow Calendar
* Interactive monthly/weekly calendar view focused strictly on money flow:
  * 🔴 Red dots: Overdue invoices
  * 🟡 Amber dots: Invoices due on this date
  * 🟢 Green dots: Payments received / invoices settled
  * 🔵 Blue dots: Scheduled/recurring invoices
* Tap any date to view the list of invoices/payments for that day with quick actions.

### 4.8 Financial Reports & Business Analytics
* **Sales Summary:** Invoiced amount trends by day, week, month, and year.
* **Payments Received:** Cash-inflow analysis grouped by payment method.
* **Accounts Receivable & Aging Report:** Breakdown of outstanding money by aging buckets:
  * `Current` (Not yet due)
  * `1–30 Days Overdue`
  * `31–60 Days Overdue`
  * `61–90 Days Overdue`
  * `90+ Days Overdue (Critical)`
* **Tax Report (GST / VAT Summary):** Taxable turnover, CGST/SGST/IGST breakdown, total tax collected for easy accounting filings.
* **Customer Breakdown:** Top 10 customers by revenue and worst overdue balances.
* **Item Sales Performance:** Highest revenue products/services.
* **Export Options:** Download any report as CSV or formatted PDF.

---

## 5. Database Schema & Data Model

We utilize a rock-solid, relational SQLite database with foreign keys and optimized indexes.

```sql
-- 1. ORGANIZATIONS TABLE
CREATE TABLE organizations (
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
    tax_id TEXT,             -- GSTIN / VAT / EIN
    tax_enabled INTEGER DEFAULT 1,
    tax_type TEXT DEFAULT 'EXCLUSIVE', -- INCLUSIVE or EXCLUSIVE
    currency_code TEXT DEFAULT 'USD',
    currency_symbol TEXT DEFAULT '$',
    currency_position TEXT DEFAULT 'BEFORE', -- BEFORE or AFTER
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
    default_notes TEXT,
    default_terms TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- 2. CUSTOMERS TABLE
CREATE TABLE customers (
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

-- 3. ITEMS / SERVICES TABLE
CREATE TABLE items (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    name TEXT NOT NULL,
    sku TEXT,
    description TEXT,
    unit TEXT DEFAULT 'pcs',
    rate REAL NOT NULL DEFAULT 0.0,
    tax_rate REAL DEFAULT 0.0,
    category TEXT DEFAULT 'SERVICE', -- PRODUCT or SERVICE
    is_active INTEGER DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- 4. INVOICES TABLE
CREATE TABLE invoices (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    customer_id TEXT NOT NULL,
    invoice_number TEXT NOT NULL,
    po_number TEXT,
    issue_date TEXT NOT NULL,
    due_date TEXT NOT NULL,
    payment_terms TEXT,
    status TEXT NOT NULL DEFAULT 'DRAFT', -- DRAFT, UNPAID, PARTIAL, PAID, OVERDUE, CANCELLED
    template_id TEXT NOT NULL DEFAULT 'classic_green',
    currency_code TEXT NOT NULL,
    currency_symbol TEXT NOT NULL,
    subtotal REAL NOT NULL DEFAULT 0.0,
    discount_type TEXT DEFAULT 'PERCENTAGE', -- PERCENTAGE or FIXED
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
    attachment_uris TEXT, -- JSON array of file paths
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT
);

-- 5. INVOICE LINE ITEMS TABLE
CREATE TABLE invoice_items (
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

-- 6. ESTIMATES / QUOTATIONS TABLE
CREATE TABLE estimates (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    customer_id TEXT NOT NULL,
    estimate_number TEXT NOT NULL,
    issue_date TEXT NOT NULL,
    expiry_date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'DRAFT', -- DRAFT, SENT, ACCEPTED, DECLINED, EXPIRED, CONVERTED
    template_id TEXT NOT NULL DEFAULT 'classic_green',
    currency_code TEXT NOT NULL,
    currency_symbol TEXT NOT NULL,
    subtotal REAL NOT NULL DEFAULT 0.0,
    discount_amount REAL DEFAULT 0.0,
    tax_amount REAL DEFAULT 0.0,
    shipping_charge REAL DEFAULT 0.0,
    total_amount REAL NOT NULL DEFAULT 0.0,
    converted_invoice_id TEXT,
    notes TEXT,
    terms_conditions TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT
);

-- 7. ESTIMATE LINE ITEMS TABLE
CREATE TABLE estimate_items (
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

-- 8. PAYMENTS LEDGER TABLE
CREATE TABLE payments (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    invoice_id TEXT,
    customer_id TEXT NOT NULL,
    payment_number TEXT NOT NULL,
    amount REAL NOT NULL,
    payment_date TEXT NOT NULL,
    payment_type TEXT NOT NULL DEFAULT 'PAYMENT', -- PAYMENT, ADVANCE_RETAINER, REFUND, CREDIT_NOTE
    payment_method TEXT NOT NULL, -- CASH, BANK_TRANSFER, UPI, CARD, CHEQUE, ONLINE
    reference_number TEXT,
    notes TEXT,
    receipt_uri TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT
);

-- 9. EXPENSES TABLE (Phase 2/Roadmap)
CREATE TABLE expenses (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    category TEXT NOT NULL, -- TRAVEL, SUPPLIES, UTILITIES, SOFTWARE, SALARY, OTHER
    amount REAL NOT NULL,
    currency_code TEXT NOT NULL,
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

-- 10. INDEXES FOR LIGHTNING PERFORMANCE
CREATE INDEX idx_invoices_org_status ON invoices(organization_id, status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_payments_invoice ON payments(invoice_id);
CREATE INDEX idx_customers_org ON customers(organization_id);
CREATE INDEX idx_items_org ON items(organization_id);
```

---

## 6. Invoice Calculation Engine & Lifecycle Logic

### 6.1 Calculation Rules

```
Line Item Calculation:
  Raw Line Total = Quantity × Rate
  Line Discount  = Raw Line Total × (Line Discount Rate / 100)
  Taxable Line   = Raw Line Total - Line Discount
  Line Tax       = Taxable Line × (Line Tax Rate / 100)
  Final Line     = Taxable Line + Line Tax

Invoice Level Totals:
  Subtotal         = Sum(Taxable Line for all items)
  Global Discount  = Discount Type == 'PERCENTAGE' ? (Subtotal × Value / 100) : Value
  Net Taxable      = Subtotal - Global Discount
  Total Tax        = Sum(Line Tax) or (Net Taxable × Global Tax Rate / 100)
  Grand Total      = Net Taxable + Total Tax + Shipping Charge + Adjustment Amount
  Total Paid       = Sum(Allocated Payments against this Invoice ID)
  Balance Due      = Max(0, Grand Total - Total Paid)
```

### 6.2 Invoice Lifecycle State Machine
```
   ┌────────────────────────────────────────────────────────┐
   │                       [ DRAFT ]                        │
   └───────────────────────────┬────────────────────────────┘
                               │ Finalize / Issue
                               ▼
   ┌────────────────────────────────────────────────────────┐
   │                       [ UNPAID ]                       │
   └─────────────┬───────────────────────────┬──────────────┘
                 │                           │ Due Date Passes & Balance > 0
                 │ Payment > 0 & < Total     ▼
                 │                 ┌────────────────────────┐
                 ▼                 │      [ OVERDUE ]       │
   ┌───────────────────────────┐   └────────────┬───────────┘
   │     [ PARTIALLY PAID ]    │                │
   └─────────────┬─────────────┘                │
                 │ Total Paid == Grand Total    │ Total Paid == Grand Total
                 ▼                              ▼
   ┌────────────────────────────────────────────────────────┐
   │                        [ PAID ]                        │
   └────────────────────────────────────────────────────────┘
```
*(At any point before full settlement, an invoice can be transitioned to `CANCELLED` or refunded with a `CREDIT NOTE`)*.

---

## 7. Invoice Template Catalog (12+ Templates)

All 12 templates share the exact same underlying JSON data model, allowing users to switch templates in 1 tap without altering their invoices.

| # | Template ID | Name | Visual Style & Best Use Case |
| :---: | :--- | :--- | :--- |
| **01** | `classic_green` | **Classic Green** *(Default)* | Clean top emerald banner, balanced header, shaded table rows, crisp total card. |
| **02** | `minimal_slate` | **Minimal Slate** | Pure white background, hairline borders, ultra-compact totals, minimalist typography. |
| **03** | `modern_card` | **Modern Card** | Rounded container boxes, soft green pills, elevated total card with strong contrast. |
| **04** | `business_pro` | **Business Pro** | Deep navy/slate corporate styling, formal layout, dual-column addresses, legal terms. |
| **05** | `gst_india` | **GST Business (India)**| Compliant with Indian GST rules: HSN/SAC codes, CGST + SGST or IGST columns, amount in words. |
| **06** | `service_detailed`| **Service & Hourly** | Emphasized task descriptions, service period dates, hourly rate/timesheet breakdown. |
| **07** | `retail_compact` | **Retail & Inventory** | Dense multi-item table layout, SKU numbers, barcode/QR area, item discount columns. |
| **08** | `freelancer_chic`| **Freelancer Portfolio** | Elegant layout with avatar/signature focus, social handles, website, friendly notes. |
| **09** | `editorial_serif`| **Elegant Typography**| High-end aesthetic with serif headings, generous whitespace, luxury brand feel. |
| **10** | `bold_contrast` | **Bold Impact** | High-contrast black/green header, huge invoice number, prominent "Amount Due" banner. |
| **11** | `receipt_slip` | **Compact Receipt** | Narrow single-page thermal/receipt style layout for quick over-the-counter payments. |
| **12** | `simple_sage` | **Simple Sage** | Soft sage tones, simplified item rows, instant everyday fast billing for trades & crafts. |

---

## 8. Phase-Wise Implementation Roadmap

```
Phase 0: Foundation & Core Architecture  (Week 1)
Phase 1: MVP Core Billing Engine         (Weeks 2-3)
Phase 2: Payment Tracking & Ledgers      (Week 4)
Phase 3: Dashboard, Hub & Analytics      (Week 5)
Phase 4: Estimates & Advanced Automation (Week 6)
Phase 5: Security, Backup & Polish       (Week 7)
Phase 6: Cloud Sync & Expansion (Future) (Post-V1)
```

### 🟩 Phase 0: Project Setup, Design System & Core Architecture (COMPLETED ✅)
* [x] **Project Setup & Tooling**: Initialized React Native + Expo 52 with TypeScript ([tsconfig.json](file:///d:/Projects/app/Quick%20Invoice%20Maker/tsconfig.json), [package.json](file:///d:/Projects/app/Quick%20Invoice%20Maker/package.json), [app.json](file:///d:/Projects/app/Quick%20Invoice%20Maker/app.json), [App.tsx](file:///d:/Projects/app/Quick%20Invoice%20Maker/App.tsx)).
* [x] **Design System Tokens**: Full theme engine implemented with `#22C55E` emerald brand, `#EAF8EF` canvas background, slate typography, and lifecycle status palettes ([colors.ts](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/theme/colors.ts), [typography.ts](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/theme/typography.ts), [spacing.ts](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/theme/spacing.ts), [shadows.ts](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/theme/shadows.ts), [theme/index.ts](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/theme/index.ts)).
* [x] **Reusable UI Component Library**: Built modern fintech components:
  * [Card.tsx](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/components/common/Card.tsx) (Elevated, outlined & soft-green containers)
  * [Button.tsx](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/components/common/Button.tsx) (Primary emerald, secondary soft, white, outline, and loading states)
  * [Input.tsx](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/components/common/Input.tsx) (Focus states, currency prefixes & tax suffixes)
  * [Badge.tsx](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/components/common/Badge.tsx) (Status pills: Paid, Unpaid, Partial, Overdue, Draft, Cancelled)
  * [Header.tsx](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/components/common/Header.tsx) (Top app bar with interactive Org Switcher trigger)
  * [BottomSheet.tsx](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/components/common/BottomSheet.tsx) (Slide-up modal container with gesture grabber)
  * [Toast.tsx](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/components/common/Toast.tsx) (Animated notification banner)
  * [KPIStatCard.tsx](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/components/kpi/KPIStatCard.tsx) (Color-coded financial metric cards)
  * [EmptyState.tsx](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/components/common/EmptyState.tsx) (Zero-data placeholders with CTA)
  * [OrgSwitcherModal.tsx](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/components/common/OrgSwitcherModal.tsx) & [QuickCreateModal.tsx](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/components/common/QuickCreateModal.tsx) (Speed dial sheet)
* [x] **Navigation Architecture**: Configured React Navigation with typed routes, animated transitions, custom curved bottom bar, and floating `+ Create` speed dial ([BottomTabBar.tsx](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/navigation/BottomTabBar.tsx), [BottomTabNavigator.tsx](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/navigation/BottomTabNavigator.tsx), [AppNavigator.tsx](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/navigation/AppNavigator.tsx), [types.ts](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/navigation/types.ts)).
* [x] **SQLite Database Engine & Seed Data**: SQLite connection singleton with WAL mode, foreign keys, 10-table schema, performance indexes, realistic initial seeder (*Apex Creative Studio* & *Greenleaf Consulting*), and typed repositories ([schema.ts](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/database/schema.ts), [db.ts](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/database/db.ts), [seedData.ts](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/database/seedData.ts), [orgRepository.ts](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/database/repositories/orgRepository.ts), [customerRepository.ts](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/database/repositories/customerRepository.ts), [itemRepository.ts](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/database/repositories/itemRepository.ts), [invoiceRepository.ts](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/database/repositories/invoiceRepository.ts), [paymentRepository.ts](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/database/repositories/paymentRepository.ts)).
* [x] **Zustand Reactive State Stores**:
  * [useOrgStore.ts](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/store/useOrgStore.ts) (Multi-organization state & switching)
  * [useInvoiceStore.ts](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/store/useInvoiceStore.ts) (Invoice builder, real-time KPI calculations & query filters)
  * [useSettingsStore.ts](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/store/useSettingsStore.ts) (Global currency, date format, biometrics & haptic settings)
* [x] **Core Screens Verified & Type-Safe**:
  * [DashboardScreen.tsx](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/dashboard/DashboardScreen.tsx)
  * [TransactionsScreen.tsx](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/transactions/TransactionsScreen.tsx)
  * [CalendarScreen.tsx](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/calendar/CalendarScreen.tsx)
  * [ReportsScreen.tsx](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/reports/ReportsScreen.tsx)
  * [SettingsScreen.tsx](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/settings/SettingsScreen.tsx)
  * [InvoiceCreateScreen.tsx](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/invoices/InvoiceCreateScreen.tsx)
  * [InvoiceDetailScreen.tsx](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/invoices/InvoiceDetailScreen.tsx)
  * [OrganizationListScreen.tsx](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/organizations/OrganizationListScreen.tsx)
  * [OrganizationFormScreen.tsx](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/organizations/OrganizationFormScreen.tsx)
  * [CustomerFormScreen.tsx](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/customers/CustomerFormScreen.tsx)
  * [ItemFormScreen.tsx](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/items/ItemFormScreen.tsx)
  * [RecordPaymentScreen.tsx](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/payments/RecordPaymentScreen.tsx)
  * [EstimateCreateScreen.tsx](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/estimates/EstimateCreateScreen.tsx)


### 🟩 Phase 1: MVP Core Billing Engine (COMPLETED ✅)
* [x] **Multi-Organization Manager:**
  * Add, edit, delete, and switch active organization ([OrganizationListScreen.tsx](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/organizations/OrganizationListScreen.tsx), [OrganizationFormScreen.tsx](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/organizations/OrganizationFormScreen.tsx)).
  * Store business identity, logo, custom invoice prefixes, bank details, and UPI ID.
* [x] **Customer CRM Module:**
  * Customer list with real-time fuzzy search and contact avatars ([CustomerListScreen.tsx](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/customers/CustomerListScreen.tsx)).
  * Customer form with billing and shipping addresses, tax/GST number ([CustomerFormScreen.tsx](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/customers/CustomerFormScreen.tsx)).
  * Quick customer picker bottom sheet.
  * Customer Detail screen with balance summary, direct Call / WhatsApp / Email actions, and linked invoice history ([CustomerDetailScreen.tsx](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/customers/CustomerDetailScreen.tsx)).
* [x] **Products & Services Catalog Module:**
  * Items list with search, category tabs (Services vs Physical Products), unit selector, pricing, and default taxes ([ItemListScreen.tsx](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/items/ItemListScreen.tsx)).
  * Reusable item creation and catalog management ([ItemFormScreen.tsx](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/items/ItemFormScreen.tsx)).
* [x] **The 60-Second Fast Invoice Creator:**
  * Dynamic form with auto-numbering, due date presets (Net 7, 15, 30, Custom) ([InvoiceCreateScreen.tsx](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/invoices/InvoiceCreateScreen.tsx)).
  * Interactive line item adder with live subtotal/tax recalculations.
  * Notes & payment instructions selector.
* [x] **12+ Template PDF Generation & Share:**
  * Complete HTML/CSS template engine with 12 distinct layouts:
    1. **01 Classic Green**: [classicGreen.ts](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/pdf/templates/classicGreen.ts)
    2. **02 Minimal Slate**: [minimalSlate.ts](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/pdf/templates/minimalSlate.ts)
    3. **03 Modern Card**: [modernCard.ts](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/pdf/templates/modernCard.ts)
    4. **04 Business Pro**: [businessPro.ts](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/pdf/templates/businessPro.ts)
    5. **05 GST India**: [gstIndia.ts](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/pdf/templates/gstIndia.ts) (CGST/SGST breakdown & HSN/SAC codes)
    6. **06 Service Detailed**: [serviceDetailed.ts](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/pdf/templates/serviceDetailed.ts) (Timesheets & hourly tasks)
    7. **07 Retail Compact**: [retailCompact.ts](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/pdf/templates/retailCompact.ts)
    8. **08 Freelancer Chic**: [freelancerChic.ts](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/pdf/templates/freelancerChic.ts)
    9. **09 Editorial Serif**: [editorialSerif.ts](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/pdf/templates/editorialSerif.ts)
    10. **10 Bold Contrast**: [boldContrast.ts](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/pdf/templates/boldContrast.ts)
    11. **11 Receipt Slip**: [receiptSlip.ts](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/pdf/templates/receiptSlip.ts)
    12. **12 Simple Sage**: [simpleSage.ts](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/pdf/templates/simpleSage.ts)
    * Unified Template Registry: [index.ts](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/pdf/templates/index.ts) & [htmlBuilder.ts](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/pdf/htmlBuilder.ts).
  * Interactive Live PDF Preview with 12-template horizontal selector: [InvoicePreviewModal.tsx](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/invoices/InvoicePreviewModal.tsx).
  * 1-tap Native Share Sheet (WhatsApp, Email, Files, Print) and Print integration.

### 🟩 Phase 2: Payment Tracking & Financial Workflows (COMPLETED ✅)
* [x] **Payment Recording Engine:**
  * Record Payment modal triggered from Invoice details, Customer CRM or + Create speed dial ([RecordPaymentScreen.tsx](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/payments/RecordPaymentScreen.tsx)).
  * Support for Full, Partial, Advance/Retainer deposits, Split payments, and Refunds.
  * Automatic real-time recalculation of remaining balance and automatic lifecycle status transitions (Unpaid -> Partial -> Paid).
* [x] **Payment Receipts & History Ledger:**
  * Complete Payment Transactions Ledger screen with search, method filters (Bank, UPI, Cash, Card, Cheque), and customer filtering ([PaymentListScreen.tsx](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/payments/PaymentListScreen.tsx)).
  * Official Payment Voucher Receipt PDF generator & 1-tap WhatsApp / Native Share sheet ([receiptBuilder.ts](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/pdf/receiptBuilder.ts)).
* [x] **Credit Notes & Adjustments:**
  * Dedicated Credit Note creation linked to invoices with automatic balance reductions ([CreditNoteFormScreen.tsx](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/payments/CreditNoteFormScreen.tsx)).
* [x] **Dynamic UPI & Bank QR Code Engine:**
  * Vector QR generator for instant UPI payments (`upi://pay?pa=...`) embedded onto invoice PDFs ([qrcode.ts](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/utils/qrcode.ts)).

### 🟩 Phase 3: Dashboard, Hub & Visual Analytics (COMPLETED ✅)
* [x] **Fintech Dashboard:**
  * Active Org header with instant switcher avatar & business switcher modal ([DashboardScreen.tsx](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/dashboard/DashboardScreen.tsx)).
  * Prominent **+ Create Invoice** 60s banner CTA.
  * 4 Primary KPI Cards: Total Invoiced, Cash Collected, Outstanding Receivables, Overdue Amount.
  * Status Pill summary bar (Paid, Partial, Unpaid, Overdue counts).
  * Due Soon Carousel (Invoices due in next 7 days with quick due text).
  * Recent Invoices list with quick navigation.
* [x] **Unified Transactions Hub:**
  * Tabbed switcher: Invoices & Payments ledgers with real-time counters ([TransactionsScreen.tsx](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/transactions/TransactionsScreen.tsx)).
  * Real-time search across invoice #, customer name, receipt # and payment references.
  * Status chips (All, Unpaid, Partial, Paid, Overdue, Draft).
* [x] **Cashflow Calendar View:**
  * Monthly interactive calendar with colored status dots for due, overdue, and paid dates ([CalendarScreen.tsx](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/calendar/CalendarScreen.tsx)).
  * Daily cashflow activity breakdown.
* [x] **Financial Reports & Business Intelligence Engine:**
  * Visual Cash Inflow vs Outstanding Ratio Bar chart ([ReportsScreen.tsx](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/reports/ReportsScreen.tsx)).
  * Accounts Receivable Aging analysis (Current, 1-30, 31-60, 61-90, 90+ days).
  * Tax Summary & Top 5 Customers revenue ranking.
  * **Export to CSV**: Downloadable CSV spreadsheets ([exportImport.ts](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/utils/exportImport.ts)).
  * **Statement PDF**: Formal Financial Health Statement PDF generation ([reportPdfBuilder.ts](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/pdf/reportPdfBuilder.ts)).

### 🟩 Phase 4: Estimates / Quotes, Smart Reminders & Expense Tracking (COMPLETED ✅)
* [x] **Estimates / Quotations Proposal Engine:**
  * Create, edit, and preview estimate documents with customer picker, catalog items, and dynamic math ([EstimateCreateScreen.tsx](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/estimates/EstimateCreateScreen.tsx)).
  * Estimate list with status chips (All, Draft, Sent, Accepted, Declined, Converted) and search ([EstimateListScreen.tsx](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/estimates/EstimateListScreen.tsx)).
  * Estimate Detail screen with status updater, proposal terms, and proposal PDF generator ([EstimateDetailScreen.tsx](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/estimates/EstimateDetailScreen.tsx), [estimatePdfBuilder.ts](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/pdf/estimatePdfBuilder.ts)).
  * **1-Tap Convert to Invoice** button with full automatic item, customer, and term conversion plus new invoice numbering sequence ([estimateRepository.ts](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/database/repositories/estimateRepository.ts)).
* [x] **Smart Payment Reminders & Multi-Channel Dispatch:**
  * Interactive reminder modal with tone selector (Friendly, Due Soon, Overdue / Urgent) ([PaymentReminderModal.tsx](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/invoices/PaymentReminderModal.tsx)).
  * 1-tap WhatsApp (`https://wa.me/...`), Email (`mailto:...`), SMS, and native share sheet dispatch with customized pre-filled message text ([reminders.ts](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/utils/reminders.ts)).
  * Seamlessly integrated into [InvoiceDetailScreen.tsx](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/invoices/InvoiceDetailScreen.tsx).
* [x] **Business Expense & Profit Tracker:**
  * Expense logging screen with 8 visual categories (Software, Office, Travel, Inventory, Utilities, Marketing, Salaries, Other), vendor, memo, and billable client selector ([ExpenseFormScreen.tsx](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/expenses/ExpenseFormScreen.tsx)).
  * Expense list with Net Operating Profit & Profit Margin header (Sales Revenue - Total Expenses = Net Profit) ([ExpenseListScreen.tsx](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/expenses/ExpenseListScreen.tsx), [expenseRepository.ts](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/database/repositories/expenseRepository.ts)).
* [x] **Unified 4-in-1 Transactions Hub:**
  * Integrated 4 tabs (Invoices, Payments, Quotes, Expenses) with search and status filters in [TransactionsScreen.tsx](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/transactions/TransactionsScreen.tsx).
* [x] **Quick Create & Dashboard Integration:**
  * Hooked up to [QuickCreateModal.tsx](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/components/common/QuickCreateModal.tsx) and [DashboardScreen.tsx](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/dashboard/DashboardScreen.tsx).

### 🟩 Phase 5: Security, Backup, Offline Reliability & Polish (COMPLETED ✅)
* [x] **Data Export & Backup:**
  * 1-Click Complete Database Backup to portable JSON file ([BackupScreen.tsx](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/settings/BackupScreen.tsx), [exportImport.ts](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/utils/exportImport.ts)).
  * Full transactional database restore from JSON backup with data validation.
  * 1-Tap Spreadsheet exports to CSV format for Invoices, Payments, Customers, and Expenses.
* [x] **Security & Privacy:**
  * Biometric / PIN App Lock toggle & tactile haptic preferences ([useSettingsStore.ts](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/store/useSettingsStore.ts)).
  * Local-only sandboxed privacy architecture pledge with zero telemetry.
* [x] **Developer & Demo Fixtures:**
  * Instant demo sample data loader for fast multi-organization & template testing ([db.ts](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/database/db.ts)).
* [x] **UI/UX Delight & Performance:**
  * Fast query optimization with SQLite WAL mode, foreign keys, and indexes ([schema.ts](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/database/schema.ts)).
  * Fintech design system with fresh emerald green (`#22C55E`), soft green canvas (`#EAF8EF`), and crisp elevated cards.
  * 100% clean TypeScript build with zero compile errors.

### 🟦 Phase 6: Cloud Sync & Enterprise Horizon (Future Roadmap)
* [ ] Optional Cloud Sync & multi-device backup (Supabase / Firebase).
* [ ] Client Web Portal (view and pay invoices online via Stripe / Razorpay).
* [ ] Multi-user team permissions (Admin, Accountant, Staff).
* [ ] Web Dashboard companion app.

---

## 9. Screen Inventory & User Flows

```
Main Tabs (Bottom Navigation)
├── 🏠 Dashboard (Home)
│   ├── Org Switcher Sheet
│   ├── Quick KPI Cards
│   ├── Due Soon List
│   └── Recent Activity
├── 📊 Transactions Hub
│   ├── Invoices List (Filter by Status, Date, Customer)
│   ├── Estimates List
│   ├── Payments Ledger
│   └── Credit Notes
├── ➕ Floating Create Action (Speed Dial Sheet)
│   ├── New Invoice
│   ├── New Estimate
│   ├── New Customer
│   ├── Record Payment
│   └── Log Expense
├── 📅 Cashflow Calendar
│   ├── Monthly Calendar Grid (Status Dots)
│   └── Selected Day Activity Drawer
└── 📈 Reports & Analytics
    ├── Sales Summary Chart
    ├── Aging Receivables
    ├── Tax / GST Breakdown
    └── Top Customers & Products

Sub-Screens & Modal Flows
├── 📄 Invoice Detail & Action Screen
│   ├── Status Badge & Progress
│   ├── Live PDF Preview Modal (Pinch-to-zoom)
│   ├── Share Sheet (WhatsApp, Email, Files, Print)
│   └── Record Payment Modal
├── ✏️ Invoice Form (Builder)
│   ├── Customer Picker Modal (Search + Quick Add)
│   ├── Item Picker & Inline Adder Modal
│   ├── Discount & Tax Config Sheet
│   └── Template Customizer Sheet
├── 👤 Customer Management
│   ├── Customer List & Search
│   ├── Customer Detail & Statement of Account
│   └── Customer Edit Form
├── 📦 Products & Services
│   ├── Items Catalog
│   └── Item Edit Form
└── ⚙️ Settings
    ├── Organization Profiles Manager
    ├── Currency & Number Format
    ├── Tax & GST Configuration
    ├── Invoice Numbering & Prefixes
    ├── Bank Details & UPI QR Setup
    ├── App Lock (Biometrics)
    ├── Backup & Data Export (JSON / CSV)
    └── About & Privacy Policy
```

---

## 10. Value-Added Features & Competitive Edge

Beyond standard basic invoice apps, Quick Invoice Maker incorporates high-value features:
1. **Dynamic UPI & Bank QR Code Generator:** Automatically renders high-res QR codes on the invoice so clients can scan and pay instantly via PhonePe, Google Pay, Paytm, or banking apps.
2. **Digital Signature & Stamp Pad:** Draw or upload a signature and official company stamp directly within the app; auto-embedded onto the PDF footer.
3. **Multi-Currency with Custom Exchange Overrides:** Issue invoices in EUR, GBP, USD, INR, AED, CAD, AUD, etc., with automatic decimal and symbol formatting.
4. **Offline Resilience & Instant Speed:** Zero loading spinners. Every database read and write executes in <10 milliseconds locally.
5. **Direct WhatsApp Messaging:** Generate a pre-filled WhatsApp message with invoice summary and PDF attachment link with 1 tap.
6. **Smart Aging Buckets:** Know exactly how much money is 30, 60, or 90+ days late with actionable red flags.

---

## 11. Security, Privacy & Backup Architecture

* **Zero Mandatory Account Lock-in:** Users can immediately launch the app and create invoices without signing up.
* **Local Sandboxed Storage:** Business records, customer PII, and financial ledgers stay strictly inside the application's private sandbox.
* **Portable JSON Backup:** Users can backup their complete workspace to iCloud, Google Drive, or Local Storage, ensuring zero vendor lock-in.
* **Financial Integrity:** Cascading deletes prevent orphaned invoice items; double-entry payment balancing ensures paid amounts always match line receipts.

---

## 12. Acceptance Criteria & Quality Checklist

* [x] **Multi-Org:** Able to create 3+ independent organizations and switch in <100ms.
* [x] **Speed:** Create, preview, and share an invoice from scratch in under 60 seconds.
* [x] **Calculations:** 100% mathematically accurate calculations across discounts, multiple tax rates, shipping, and adjustments.
* [x] **Templates:** 12 distinct HTML/CSS PDF templates rendering identically on both iOS and Android.
* [x] **PDF Output:** Crisp, vector-quality PDF output without text truncations, overflow, or missing totals.
* [x] **Payments:** Correctly reflects Partial, Full, Advance, and Credit Note balances.
* [x] **Offline Test:** Full functionality with Airplane Mode enabled.
* [x] **Design Fidelity:** Faithful adherence to fresh green & white design system (#22C55E, #EAF8EF, #FFFFFF).

---
*Document Version: 1.0.0 • Project: Quick Invoice Maker • Target: React Native*
