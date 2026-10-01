# Quick Invoice Maker 🧾⚡

> **Simple. Fast. Professional Invoices.**
> A modern, local-first, offline-ready mobile invoicing & billing application built with React Native (Expo SDK 52), TypeScript, SQLite, and 12+ pixel-perfect HTML/CSS PDF templates.

---

## ✨ Features Overview

### 🏛️ 1. Multi-Organization Profiles
- Switch effortlessly between multiple businesses (Freelancing, Agency, Retail, Consulting).
- Configure business logos, tax numbers (GSTIN/VAT/EIN), UPI VPA IDs, addresses, and payment instructions per organization.

### 👥 2. Customer CRM & Ledger
- Quick customer creation with name, email, phone, billing/shipping addresses, and tax identifiers.
- Customer detail view with total billed, total paid, outstanding balance, and full invoice/payment history.

### 📦 3. Products & Services Catalog
- Item master with SKU, unit price, tax rate (%), discount (%), and units (hrs, pcs, items, days, etc.).
- 1-tap item insertion into invoices and estimates.

### 📄 4. 60-Second Fast Invoice Builder
- Auto-incrementing invoice numbers (`INV-0001`, `INV-0002`...).
- Live subtotal, line-item tax, global discount, and total calculations.
- Due date calculation with pre-set terms (Net 7, Net 15, Net 30, Due on Receipt).
- Real-time in-app HTML invoice preview.

### 🎨 5. 12+ Vector-Grade PDF Templates
1. **Classic Green**: Clean emerald header with organized tabular layout.
2. **Minimal Slate**: High-contrast, minimalist design with crisp typography.
3. **Modern Card**: Rounded card elements with soft borders and badge accents.
4. **Business Pro**: Executive corporate layout with dual-column headers.
5. **GST India**: Dual CGST + SGST tax breakdown columns with HSN codes.
6. **Service Detailed**: Hourly rate breakdown with notes and milestones.
7. **Retail Compact**: High-density format for physical product counters and stores.
8. **Freelancer Chic**: Creative agency styling with elegant typography.
9. **Editorial Serif**: Publication-inspired luxury aesthetic with serif headers.
10. **Bold Contrast**: Dark mode header with prominent summary blocks.
11. **Receipt Slip**: 80mm POS thermal-style receipt layout.
12. **Simple Sage**: Soft sage green minimalist layout.

### 💳 6. Payment Tracking & Receipts
- Record full or partial payments via Cash, UPI, Bank Transfer, Card, or Cheque.
- Automatic status transitions: `DRAFT` ➔ `UNPAID` ➔ `PARTIALLY_PAID` ➔ `PAID` / `OVERDUE`.
- Generate professional PDF Payment Receipt vouchers.
- Dynamic UPI QR Code generator in PDFs for instant mobile scan-and-pay.
- Credit Notes with deduction from outstanding invoices.

### 📊 7. Dashboard & Financial Reports
- 4 Live KPI Cards: Total Invoiced, Collected Revenue, Outstanding AR, and Overdue Balance.
- Accounts Receivable (AR) Aging Buckets (`0-30`, `31-60`, `61-90`, `90+` days).
- Top 5 Customers by Revenue chart.
- Cashflow Calendar with color-coded daily status dots.
- Export accounting reports to CSV and customer account statements to PDF.

### 📝 8. Estimates & Proposals
- Create quotes and proposals with expiry dates.
- 1-tap conversion: automatically convert an accepted Estimate into an Invoice.

### 💬 9. Smart Payment Reminders
- Send payment reminders across WhatsApp, SMS, or Email.
- Tone templates: **Friendly Reminder**, **Due Soon**, and **Urgent / Overdue Notice** with pre-filled invoice links and amounts.

### 💰 10. Expenses & Profit Tracking
- Log operational business expenses across 7 categories (Supplies, Travel, Software, Marketing, Rent, Utilities, Other).
- Live Net Profit calculation (Revenue Collected − Expenses).

### 🔒 11. Privacy, Backup & Security
- **Local-First & Offline-Ready**: Fast SQLite database directly on device (`expo-sqlite`).
- **Full Database Backup & Restore**: Export and import complete JSON backups across all 9 relational tables.
- **CSV Data Exports**: Export Invoices, Payments, Customers, and Expenses to spreadsheet CSV files.
- **Biometric / PIN App Lock**: Secure financial data with device biometric authentication.

---

## 🛠️ Tech Stack

- **Framework**: [React Native](https://reactnative.dev/) / [Expo SDK 52](https://expo.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Database**: [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) (WAL mode, Foreign Keys enabled)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **PDF Generation & Print**: [expo-print](https://docs.expo.dev/versions/latest/sdk/print/) & [expo-sharing](https://docs.expo.dev/versions/latest/sdk/sharing/)
- **Icons**: [@expo/vector-icons](https://icons.expo.fyi/) (Ionicons, Feather, MaterialCommunityIcons)
- **Design System**: Custom Fintech Green palette (`#22C55E`, `#EAF8EF`, `#FFFFFF`)

---

## 📁 Project Structure

```
Quick Invoice Maker/
├── assets/                    # App icons, splash screens, and images
├── src/
│   ├── components/            # Reusable UI component library
│   │   ├── common/            # Button, Card, Input, Badge, Header, BottomSheet, etc.
│   │   └── kpi/               # Financial KPI summary cards
│   ├── database/              # SQLite database schema, initialization & seed data
│   │   ├── repositories/      # Relational CRUD repositories
│   │   ├── db.ts              # Database connection & migrations
│   │   ├── schema.ts          # 9-table relational SQLite schema
│   │   └── seedData.ts        # Starter sample business data
│   ├── features/              # Feature modules & screens
│   │   ├── calendar/          # Cashflow Calendar screen
│   │   ├── customers/         # Customer CRM & Detail screens
│   │   ├── dashboard/         # Dashboard & KPI overview
│   │   ├── estimates/         # Estimates & Quote conversion
│   │   ├── expenses/          # Business Expense tracking
│   │   ├── invoices/          # Invoice Builder, Detail, Preview, & Reminders
│   │   ├── items/             # Items & Services catalog
│   │   ├── payments/          # Payment recording, Ledger & Credit notes
│   │   ├── reports/           # Financial analytics & AR aging
│   │   ├── settings/          # Organizations, Backup & Security settings
│   │   └── transactions/      # Unified 4-in-1 Transactions Hub
│   ├── navigation/            # Bottom tabs & Stack navigators
│   ├── pdf/                   # 12 HTML/CSS PDF templates & PDF builders
│   ├── store/                 # Zustand state stores
│   ├── theme/                 # Design tokens (colors, typography, spacing, shadows)
│   ├── types/                 # TypeScript interfaces & domain models
│   └── utils/                 # Calculations, formatters, CSV export & UPI QR
├── App.tsx                    # Application entry point
├── package.json               # Dependencies & scripts
└── tsconfig.json              # TypeScript configuration
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Expo Go app on iOS/Android device or Xcode / Android Studio emulators

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Avinashparakhiya/QuickInvoiceMaker.git
   cd QuickInvoiceMaker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npx expo start
   ```

4. **Run on a device or emulator:**
   - Press `a` for Android Emulator
   - Press `i` for iOS Simulator
   - Scan the QR code using the **Expo Go** app on your physical mobile device.

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
