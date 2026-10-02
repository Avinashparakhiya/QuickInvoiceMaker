# 📱 QUICK INVOICE MAKER — Master Screen-by-Screen UI Design & Implementation Specification

> **Simple. Fast. Professional Invoices.**  
> *React Native • Clean Green (`#22C55E`) + White (`#FFFFFF`) + Soft Background (`#EAF8EF`) • Mobile Portrait 9:16*  
> **Visual Reference**: High-fidelity 12-screen mobile collage with rounded cards (14–18px), soft green background canvas, crisp line icons, dynamic donut/bar charts, and compact navigation.

---

## 📑 Master Table of Contents
1. [Global Design System & Tokens](#1-global-design-system--tokens)
2. [Visual Reference Collage Mapping (12 Key Screens)](#2-visual-reference-collage-mapping-12-key-screens)
3. [Master Phase-Wise Roadmap & Status](#3-master-phase-wise-roadmap--status)
4. [Complete Screen-by-Screen UI Design Specifications (Screens 01–40)](#4-complete-screen-by-screen-ui-design-specifications-screens-0140)
5. [Recommended User Flows & Navigation Architecture](#5-recommended-user-flows--navigation-architecture)
6. [Acceptance Criteria & Final UI Quality Checklist](#6-acceptance-criteria--final-ui-quality-checklist)

---

## 1. Global Design System & Tokens

| Design Element | Token / Spec | Exact Value | Visual Purpose |
| :--- | :--- | :--- | :--- |
| **Brand Primary** | `colors.primary` | `#22C55E` | Primary CTA buttons, active tab indicators, major success badges, key action links |
| **Brand Primary Dark** | `colors.primaryDark` | `#15803D` | Pressed button states, deep green icons, bold highlights |
| **Canvas Background**| `colors.background` | `#EAF8EF` | Ultra-soft light green canvas background (calm, easy on eyes) |
| **Card Surface** | `colors.surface` | `#FFFFFF` | Elevated crisp white cards, input containers, bottom sheet surfaces |
| **Secondary Surface**| `colors.surfaceSecondary`| `#F3FAF5` | Nested containers, table headers, tag pills, soft badges |
| **Border / Divider** | `colors.border` | `#D7E5DC` | Crisp, ultra-subtle border stroke for cards, inputs, and list dividers |
| **Text Primary** | `colors.text` | `#0F172A` | Slate 900 for high-contrast, crystal-clear headings, numbers, and titles |
| **Text Secondary** | `colors.textSecondary` | `#64748B` | Slate 500 for captions, timestamps, placeholder text, metadata |
| **Text Muted** | `colors.textMuted` | `#94A3B8` | Slate 400 for disabled states, micro-labels, and subtle hints |
| **Status: Paid** | `colors.success` | `#16A34A` on `#DCFCE7` | Dark green text on soft mint pill |
| **Status: Unpaid** | `colors.warning` | `#D97706` on `#FEF3C7` | Amber text on soft yellow pill |
| **Status: Partial** | `colors.info` | `#0284C7` on `#E0F2FE` | Sky blue text on soft cyan pill |
| **Status: Overdue** | `colors.danger` | `#EF4444` on `#FEE2E2` | Rose red text on soft red pill |
| **Status: Draft** | `colors.neutral` | `#64748B` on `#F1F5F9` | Slate text on light gray pill |
| **Card Radius** | `borderRadius` | `14px – 18px` | Smooth rounded corners on all elevated cards and sheets |
| **Typography** | `fontFamily` | `Inter / SF Pro / Roboto` | Modern legible sans-serif with negative letterSpacing on KPI numbers |
| **Bottom Navigation**| `BottomTabBar` | 5 items | `Home` \| `Transactions` \| **Floating `+ Create`** \| `Calendar` \| `Reports` |

---

## 2. Visual Reference Collage Mapping (12 Key Screens)

The attached 12-screen design collage serves as our visual benchmark:

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                               TOP ROW (SCREENS 1 TO 6)                                      │
├───────────────┬───────────────┬───────────────┬───────────────┬───────────────┬─────────────┤
│ 01. Splash    │ 02. Onboard   │ 03. Dashboard │ 04. Inv Step1 │ 05. Inv Step2 │ 06. Template│
│ Wave bg       │ Illustration  │ Greeting + Org│ 1 Customer    │ 2 Items       │ 2-Col Grid  │
│ Doc + Check   │ "Create with  │ 2x2 KPI Grid  │ Cust Picker   │ Line Steppers │ Category    │
│ App Name      │ Ease", CTA    │ Donut Chart   │ Inv & Due Date│ Sticky Totals │ Checkmark   │
├───────────────┼───────────────┼───────────────┼───────────────┼───────────────┼─────────────┤
│                               BOTTOM ROW (SCREENS 7 TO 12)                                  │
├───────────────┬───────────────┬───────────────┬───────────────┬───────────────┬─────────────┤
│ 07. Preview   │ 08. Transact  │ 09. Calendar  │ 10. Reports   │ 11. Orgs      │ 12. Settings│
│ A4 Paper Sheet│ Search + Chips│ Month Header  │ Period Filter │ Business Cards│ Grouped Menu│
│ Full Details  │ Color Badges  │ Date Dots     │ KPI + BarChart│ Check Active  │ Clean Icons │
│ Download/Share│ Date & Amounts│ Due Countdown │ Summary Count │ + Add Org     │ Chevron Nav │
└───────────────┴───────────────┴───────────────┴───────────────┴───────────────┴─────────────┘
```

---

## 3. Master Phase-Wise Roadmap & Status

```
┌──────────────────────────────────────────────────────────────────────┐
│  Phase 0: Foundation & Core Design Tokens               [100% ✅]    │
│  Phase 1: MVP Core Billing Engine & 12 Templates        [100% ✅]    │
│  Phase 2: Payment Tracking & Dynamic UPI QR Engine      [100% ✅]    │
│  Phase 3: Fintech Dashboard, Hub & Visual BI Analytics  [100% ✅]    │
│  Phase 4: Quotes / Estimates, Reminders & Expenses      [100% ✅]    │
│  Phase 5: Backup, Security & Customer Statements        [100% ✅]    │
│  Phase 6: Digital Signature, Recurring & POS Thermal    [⏳ ACTIVE]  │
└──────────────────────────────────────────────────────────────────────┘
```

### Phase Summary Matrix

| Phase | Milestone | Included Screens (from 40-Screen Spec) | Status |
| :---: | :--- | :--- | :---: |
| **Phase 0** | **Foundation & Design System** | `01` Splash, `02-03` Onboarding, Design Tokens, SQLite Engine | **Completed ✅** |
| **Phase 1** | **Core Invoicing Engine (P0)** | `05` Org Switcher, `06-07` Orgs, `08-09` Customers, `10` Items, `11-14` Invoice Builder, `15` Preview, `16` Success, `24-25` Templates | **Completed ✅** |
| **Phase 2** | **Payments & Ledger (P0/P1)** | `17` Invoice Details, `18` Record Payment, `19` Transactions Hub, UPI QR Codes | **Completed ✅** |
| **Phase 3** | **Dashboard & Visual BI (P1)** | `04` Dashboard & Donut, `20` Calendar, `21` Reports & Bar Chart, `36-38` Status Lists | **Completed ✅** |
| **Phase 4** | **Quotes, Reminders & Expenses (P2)**| `22-23` Estimates, Smart Payment Reminders, Business Expenses | **Completed ✅** |
| **Phase 5** | **Backup & Customer Statements (P2)**| `26-31` Settings, `34` Backup/Export, `35` Empty States, `39` Customer Statement PDF, `40` About | **Completed ✅** |
| **Phase 6** | **Advanced Capabilities (P2/P3)**| `32` Global Search, `33` Notifications Center, Digital Signature Pad, Recurring Invoices, POS Thermal Slip | **Active ⏳** |

---

## 4. Complete Screen-by-Screen UI Design Specifications (Screens 01–40)

### 🚀 Category: Launch & Onboarding

#### 01. Splash Screen
* **Category**: Launch
* **File**: [`SplashScreen.tsx`](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/onboarding/SplashScreen.tsx)
* **Design Prompt**: Design a premium mobile splash screen for "Quick Invoice Maker". White background with soft light-green abstract shapes, centered minimal invoice/document icon with green check mark, app name below and tagline "Simple. Fast. Professional Invoices.". `#22C55E` and `#EAF8EF`, modern finance SaaS, minimal, portrait 9:16.
* **Key Implementation**:
  - Smooth scale and fade animations on load.
  - Automatic transition to Onboarding (first time) or Dashboard (returning user).

#### 02. Onboarding — Welcome
* **Category**: Onboarding
* **File**: [`OnboardingScreen.tsx`](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/onboarding/OnboardingScreen.tsx)
* **Design Prompt**: Design a Quick Invoice Maker onboarding screen. White/light-green background, illustration of a professional invoice being created on a smartphone, headline "Create & Send Invoices with Ease", subtitle "Professional invoices without complicated setup.", green "Get Started" button and subtle "Skip". Modern rounded finance UI, portrait 9:16.
* **Key Implementation**:
  - Horizontal swipeable carousel with animated pagination indicator dots.

#### 03. Onboarding — Multi-Organizations
* **Category**: Onboarding
* **File**: [`OnboardingScreen.tsx`](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/onboarding/OnboardingScreen.tsx)
* **Design Prompt**: Design onboarding explaining multi-business support. Show 3 business profile cards with one selected. Headline "Manage multiple businesses", subtitle "Switch organizations and automatically use the correct business details on every invoice.", green Next button, clean white/light-green mobile UI.

---

### 🏠 Category: Main & Dashboard

#### 04. Dashboard / Home Screen
* **Category**: Main
* **File**: [`DashboardScreen.tsx`](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/dashboard/DashboardScreen.tsx)
* **Design Prompt**: Design the main Quick Invoice Maker dashboard inspired by the attached reference. White/light-green background, header with active organization and switcher, settings icon, large green "Create Invoice" button. KPI cards: Total Sales `$12,450`; Outstanding `$3,200`; Overdue `$1,250`; Total Invoices `28`. Add status summary with Donut chart (Paid 12, Unpaid 8, Partial 5, Overdue 3), due-soon card, recent invoices. Bottom navigation Home, Transactions, centered `+ Create`, Calendar, Reports. Premium mobile finance UI.
* **Key Implementation**:
  - Dynamic real-time calculation of KPIs connected to Zustand `useInvoiceStore`.
  - SVG Donut Chart with center count and interactive status segment filters.

---

### 🏢 Category: Business & Organizations

#### 05. Organization Switcher
* **Category**: Business
* **File**: [`OrgSwitcherModal.tsx`](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/components/common/OrgSwitcherModal.tsx)
* **Design Prompt**: Design a rounded bottom-sheet organization switcher. Title "Select Organization", current business highlighted green, 3 organizations with logo/name/tax ID/currency and check mark. Green "+ Add Organization" button. White sheet over dimmed dashboard.
* **Key Implementation**:
  - Instant <50ms organization switching across all stores, databases, and navigation tabs.

#### 06. Organizations Management
* **Category**: Business
* **File**: [`OrganizationListScreen.tsx`](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/organizations/OrganizationListScreen.tsx)
* **Design Prompt**: Design Organizations management screen. Header `< Organization`, + button, business cards showing logo avatar, name, email, phone, GST/tax ID, currency and active status badge. Green "+ Add Organization" CTA. Minimal accounting UI.

#### 07. Add / Edit Organization
* **Category**: Business
* **File**: [`OrganizationFormScreen.tsx`](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/organizations/OrganizationFormScreen.tsx)
* **Design Prompt**: Design Add Organization form: logo upload, business name, display name, email, phone, website, business address, GST/tax number, default currency, invoice prefix and starting number. Green Save button. Grouped white cards on light-green background.

---

### 👥 Category: Customers CRM

#### 08. Customers List
* **Category**: Customers
* **File**: [`CustomerListScreen.tsx`](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/customers/CustomerListScreen.tsx)
* **Design Prompt**: Design Customers screen with header, search, filter and +. Customer cards show name/company, phone/email, outstanding balance and invoice count. Green add customer CTA and empty state.

#### 09. Add Customer Form
* **Category**: Customers
* **File**: [`CustomerFormScreen.tsx`](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/customers/CustomerFormScreen.tsx)
* **Design Prompt**: Design Add Customer form with name/company, email, phone, tax ID/GSTIN, billing address, shipping address, same-as-billing toggle and notes. Green Save Customer button.

#### 39. Customer Details & Statement of Account
* **Category**: Customer
* **File**: [`CustomerDetailScreen.tsx`](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/customers/CustomerDetailScreen.tsx)
* **Design Prompt**: Design Customer Details with contact information, KPI cards Total Invoiced/Paid/Outstanding, tabs Invoices/Payments/Details, recent transactions, quick Call/WhatsApp/Email buttons, and **Statement of Account PDF generator** action.

---

### 📦 Category: Items Catalog

#### 10. Products & Services Catalog
* **Category**: Items
* **File**: [`ItemListScreen.tsx`](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/items/ItemListScreen.tsx) & [`ItemFormScreen.tsx`](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/items/ItemFormScreen.tsx)
* **Design Prompt**: Design Products & Services screen with search, tabs Products/Services, reusable item cards showing name, SKU, unit (pcs, hrs, days, etc.), price and tax rate. Green `+ Add Item` action.

---

### 📄 Category: Fast Invoice Creation (3 Steps)

#### 11. Create Invoice — Step 1: Customer & Details
* **Category**: Invoice
* **File**: [`InvoiceCreateScreen.tsx`](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/invoices/InvoiceCreateScreen.tsx)
* **Design Prompt**: Design first step of fast invoice creation. Header "Create Invoice", step progress 1 of 3 (1 Customer [active green], 2 Items, 3 Preview). Organization card, Select Customer card with picker and "+ Add New Customer", invoice date, due date, payment terms, and currency selector. Green "Next" button.

#### 12. Create Invoice — Step 2: Add Items & Math
* **Category**: Invoice
* **File**: [`InvoiceCreateScreen.tsx`](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/invoices/InvoiceCreateScreen.tsx)
* **Design Prompt**: Design second invoice step. Step progress 2 of 3. Line-item cards with description, quantity stepper `[-] 1 [+]`, unit price, discount, tax and total. Large green "+ Add Item" button. Sticky calculation summary card (Subtotal, Discount, Tax 18% GST, Total). "Back" and "Next" buttons.

#### 13. Add Invoice Item Modal
* **Category**: Invoice
* **File**: [`AddItemModal.tsx`](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/invoices/components/AddItemModal.tsx)
* **Design Prompt**: Design compact Add Item bottom sheet. Search saved products/services, recent items, fields Description, Quantity, Unit, Rate, Discount, Tax and calculated line total. "+ Create New Item" and green Add to Invoice.

#### 14. Invoice Details & Terms
* **Category**: Invoice
* **File**: [`InvoiceCreateScreen.tsx`](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/invoices/InvoiceCreateScreen.tsx)
* **Design Prompt**: Design invoice details step. Payment terms, PO/reference, customer notes, terms and conditions, payment instructions, and template selector. Green Preview Invoice button.

#### 15. Invoice Preview Screen
* **Category**: Invoice
* **File**: [`InvoicePreviewScreen.tsx`](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/invoices/InvoicePreviewScreen.tsx)
* **Design Prompt**: Design professional invoice preview. Mobile screen contains a realistic white A4 document: business logo/details, INVOICE title, number, issue/due dates, customer, line-item table, subtotal, discount, tax, grand total, payment instructions and terms. Green accents. Bottom actions Download PDF, Share PDF / WhatsApp.

#### 16. Invoice Created (Success Screen)
* **Category**: Success
* **File**: [`InvoiceSuccessModal.tsx`](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/invoices/components/InvoiceSuccessModal.tsx)
* **Design Prompt**: Design success screen after invoice creation. Green check circle, "Invoice Created", `#INV-0019`, amount, customer name, status badge. Buttons Share Invoice, Download PDF, View Invoice and Create Another Invoice.

#### 17. Invoice Details Screen & Actions
* **Category**: Invoice
* **File**: [`InvoiceDetailScreen.tsx`](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/invoices/InvoiceDetailScreen.tsx)
* **Design Prompt**: Design invoice detail screen. Header `#INV-0019` with Partially Paid badge. Total Invoiced, Paid, Balance, payment progress bar, line items breakdown, Duplicate / Clone Invoice button, Record Payment, Send Payment Reminder, and Share PDF.

---

### 💳 Category: Payments & Ledger

#### 18. Record Payment Screen
* **Category**: Payments
* **File**: [`RecordPaymentScreen.tsx`](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/payments/RecordPaymentScreen.tsx)
* **Design Prompt**: Design Record Payment screen. Invoice and balance at top. Fields amount, payment date, payment method chips UPI/Cash/Bank/Card/Other, reference, notes and optional Advance/Retainer toggle. Show remaining balance and green Save Payment.

#### 19. Transactions Hub (4-in-1 Hub)
* **Category**: Transactions
* **File**: [`TransactionsScreen.tsx`](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/transactions/TransactionsScreen.tsx)
* **Design Prompt**: Design Transactions screen with search/filter and tabs Invoices, Payments, Estimates, Expenses. Filter chips All, Paid, Unpaid, Partial, Overdue. Rows show customer, number, date, amount and status badges.

---

### 📅 Category: Calendar & Reports

#### 20. Cashflow Calendar Screen
* **Category**: Calendar
* **File**: [`CalendarScreen.tsx`](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/calendar/CalendarScreen.tsx)
* **Design Prompt**: Design finance calendar with month view and green highlights `< June 2024 >`. Legend Paid (green), Due Soon (amber), Overdue (red). Selected-day circle with "Upcoming Due Dates" cards below showing countdown text ("Due in 2 days", "Due in 5 days").

#### 21. Reports Dashboard Screen
* **Category**: Reports
* **File**: [`ReportsScreen.tsx`](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/reports/ReportsScreen.tsx)
* **Design Prompt**: Design Reports dashboard with date range selector `This Month ⌵`. KPI cards Total Sales `$12,450` (+12%), Total Paid `$8,250` (+8%); monthly invoiced-vs-paid bar chart; receivables aging (0-30, 31-60, 61-90, 90+ days); top customers ranking; CSV export and Statement PDF download.

---

### 📝 Category: Estimates & Quotes

#### 22. Estimates List Screen
* **Category**: Quotes
* **File**: [`EstimateListScreen.tsx`](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/estimates/EstimateListScreen.tsx)
* **Design Prompt**: Design Estimates screen with + button, status filters Draft, Sent, Accepted, Declined, Expired, Converted. Cards show estimate number, customer, amount, expiry and status. Accepted estimates have 1-Tap Convert to Invoice action.

#### 23. Create Estimate Screen
* **Category**: Quotes
* **File**: [`EstimateCreateScreen.tsx`](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/estimates/EstimateCreateScreen.tsx)
* **Design Prompt**: Design estimate creation flow matching invoice creation: customer, validity date, items, discount, tax, notes, terms and template. Sticky total and green Preview Estimate.

---

### 🎨 Category: 12 Invoice Templates

#### 24. Invoice Template Gallery Screen
* **Category**: Templates
* **File**: [`TemplateGalleryScreen.tsx`](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/invoices/TemplateGalleryScreen.tsx)
* **Design Prompt**: Design template gallery with 12 invoice previews in a 2-column grid: Modern 1, Modern 2, Classic 1, Classic 2, Professional 1, Professional 2, Minimal, Business, Colorful, Bold, Receipt Style, Simple Green. Category chips All, Modern, Classic, Professional. Selected template has green border and checkmark.

#### 25. Customize Template Screen
* **Category**: Templates
* **File**: [`TemplateGalleryScreen.tsx`](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/invoices/TemplateGalleryScreen.tsx)
* **Design Prompt**: Design template customization: live invoice preview plus Accent Color, Logo, Font Size, Show/Hide Tax, Payment Details, Footer Text and Signature. Green Save as Default Template.

---

### ⚙️ Category: Settings & Configuration

#### 26. Settings Screen
* **Category**: Settings
* **File**: [`SettingsScreen.tsx`](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/settings/SettingsScreen.tsx)
* **Design Prompt**: Design Settings screen with grouped cards: Organizations, Currency & Tax, Invoice Settings, Payment Settings, PDF & Templates, Notifications, Data & Backup, Security, Privacy and About. Line icons, white cards, light-green background.

#### 27. Currency Settings Screen
* **Category**: Settings
* **File**: [`CurrencySettingsScreen.tsx`](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/settings/CurrencySettingsScreen.tsx)
* **Design Prompt**: Design Currency Settings with search and currency list: INR ₹, USD $, EUR €, GBP £, AED, AUD, CAD, SGD. Selected currency has green check. Include decimal precision and symbol position.

#### 28. Tax & GST Settings Screen
* **Category**: Settings
* **File**: [`TaxSettingsScreen.tsx`](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/settings/TaxSettingsScreen.tsx)
* **Design Prompt**: Design Tax & GST Settings. Tax enabled toggle, GST/tax ID, default rate, inclusive/exclusive mode and optional CGST/SGST/IGST configuration. Green Save button and concise informational note.

#### 29. Invoice Numbering Screen
* **Category**: Settings
* **File**: [`InvoiceNumberingScreen.tsx`](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/settings/InvoiceNumberingScreen.tsx)
* **Design Prompt**: Design Invoice Numbering settings: prefix `INV-`, next number `0019`, starting number, automatic numbering, reset period and preview `#INV-0019`.

#### 30. Payment Settings Screen
* **Category**: Settings
* **File**: [`PaymentSettingsScreen.tsx`](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/settings/PaymentSettingsScreen.tsx)
* **Design Prompt**: Design Payment Settings with payment methods, bank details, UPI ID, QR upload, payment instructions and Show payment details on invoice toggle. Green Save button.

#### 31. Notifications Settings Screen
* **Category**: Settings
* **File**: [`NotificationSettingsScreen.tsx`](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/settings/NotificationSettingsScreen.tsx)
* **Design Prompt**: Design Notifications settings with toggles for due soon, overdue, payment received, recurring invoice and weekly summary. Reminder timing choices 7 days before, 3 days before, due date and 1 day after.

#### 32. Search & Filters (Full-Screen)
* **Category**: Utility
* **Status**: In Phase 6
* **Design Prompt**: Design full-screen search for invoices, customers, estimates and payments. Recent searches, filter chips organization/status/customer/date, grouped results with icons and amounts. Fast mobile UX.

#### 33. Notification Center Screen
* **Category**: Activity
* **Status**: In Phase 6
* **Design Prompt**: Design notification center with cards such as invoice due today, payment received, overdue invoice and monthly report ready. Use green/amber/red accents sparingly. Mark all as read.

#### 34. Backup / Export Screen
* **Category**: Data
* **File**: [`BackupScreen.tsx`](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/settings/BackupScreen.tsx)
* **Design Prompt**: Design Data & Backup screen showing last backup and data size. Actions Export Invoices, Customers, Payments, Full Backup (JSON) and Restore Backup. Secure trustworthy style with clear destructive-action warning.

#### 35. Empty State UI Components
* **Category**: Empty
* **File**: [`EmptyState.tsx`](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/components/common/EmptyState.tsx)
* **Design Prompt**: Design a friendly empty state: invoice/document illustration, headline "Create your first invoice", subtitle explaining the 3-step process, green Create Invoice button and secondary Add Organization.

#### 36. Overdue Invoices Filtered View
* **Category**: Status
* **File**: [`TransactionsScreen.tsx`](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/transactions/TransactionsScreen.tsx)
* **Design Prompt**: Design Overdue filtered screen. Summary total overdue, invoice cards with customer, number, due date, days overdue, amount and red Overdue badge. Quick actions Record Payment and Send Reminder.

#### 37. Paid Invoices Filtered View
* **Category**: Status
* **File**: [`TransactionsScreen.tsx`](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/transactions/TransactionsScreen.tsx)
* **Design Prompt**: Design Paid Invoices screen with total paid this period and list of paid invoices showing customer, invoice number, payment date and amount. Green Paid badges and filters.

#### 38. Partial Payments Filtered View
* **Category**: Status
* **File**: [`TransactionsScreen.tsx`](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/transactions/TransactionsScreen.tsx)
* **Design Prompt**: Design Partially Paid screen. Summary outstanding amount, invoice cards with Total, Paid, Balance and green payment progress bar. Quick Record Payment action.

#### 40. About & Privacy Screen
* **Category**: Settings
* **File**: [`AboutScreen.tsx`](file:///d:/Projects/app/Quick%20Invoice%20Maker/src/features/settings/AboutScreen.tsx)
* **Design Prompt**: Design About/Profile screen with app logo, Quick Invoice Maker, version, Support, Privacy Policy, Terms, Rate App and Contact Support. Minimal trustworthy UI.

---

## 5. Recommended User Flows & Navigation Architecture

```
Launch Flow:
[01. Splash] ──> [02. Onboarding Welcome] ──> [03. Onboarding Orgs] ──> [04. Dashboard]

Fast 60-Second Invoicing Flow:
[04. Dashboard] ──(+ Create)──> [11. Step 1: Customer] ──> [12. Step 2: Items]
       ──> [14. Step 3: Details] ──> [15. Preview] ──(Save)──> [16. Success]

Payment Settlement Flow:
[17. Invoice Detail] ──(Record Payment)──> [18. Record Payment]
       ──(Save)──> [04. Dashboard / 19. Transactions update]

Customer Account Statement Flow:
[08. Customers] ──(Select Customer)──> [39. Customer Detail]
       ──(Statement PDF)──> [Print / WhatsApp / Share Statement PDF]
```

---

## 6. Acceptance Criteria & Final UI Quality Checklist

* [x] **Color Harmony**: Strict adherence to `#22C55E` green primary, `#EAF8EF` light canvas, `#FFFFFF` cards, and `#0F172A` text.
* [x] **Visual Consistency**: All 12 key collage screens reproduced with exact card corner radius (14-18px), shadows, and badges.
* [x] **Fast Invoice Builder**: Complete 3-step wizard with live real-time recalculations and instant PDF preview.
* [x] **Real Financial Integrity**: Strict separation between invoice lifecycle states and payment ledger deposits.
* [x] **Local-First Speed**: Instant offline execution with SQLite databases.
* [x] **TypeScript Strictness**: Zero compilation errors (`npx tsc --noEmit` exits with 0).
