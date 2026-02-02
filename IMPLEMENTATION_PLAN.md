# Smart Invoice & Payment System - Implementation Plan

## Overview

Build a **single-tenant** Smart Invoice & Payment System for **Luzo DN Parsempo** that automates:
- Professional invoice creation with hidden vendor allocations
- Payment collection via Flutterwave (card, bank transfer, USSD)
- **Automatic vendor payouts via direct bank transfers** when clients pay
- Complete privacy - clients never see vendor details or profit margins

---

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Tenant Model** | Single-tenant (Luzo DN Parsempo only) | Built specifically for one business |
| **Payout Method** | Direct Bank Transfers (`POST /v3/transfers`) | No vendor BVN/registration needed |
| **Currency Storage** | Kobo (minor units) | Avoid floating-point errors |
| **Vendor Privacy** | Allocations never exposed to clients | Per PRD requirement |
| **PDF Generation** | Puppeteer (HTML-to-PDF) | Professional invoice rendering |

---

## Data Models

### 1. Client Model (`/models/client.js`)

Invoice recipients - companies/people who receive and pay invoices.

```javascript
{
  _id: ULID,
  name: String,                    // "ABC Corporation"
  email: String,                   // "finance@abccorp.com"
  company: String,                 // Company name (optional if same as name)
  phone: String,                   // "+2348012345678"
  address: {
    street: String,
    city: String,
    state: String,
    country: String               // Default: "Nigeria"
  },
  notes: String,                   // Internal notes about client

  // Stats (auto-calculated)
  totalInvoiced: Number,          // Total amount invoiced (kobo)
  totalPaid: Number,              // Total amount paid (kobo)
  invoiceCount: Number,           // Number of invoices

  // Metadata
  status: String,                 // 'active' | 'archived'
  created: Number,
  updated: Number
}

// Indexes: email (unique), status
```

### 2. Vendor Model (`/models/vendor.js`)

Payment recipients who receive automatic payouts.

```javascript
{
  _id: ULID,
  name: String,                    // "John Ade" or "TechPro Solutions"
  email: String,                   // For notifications (optional)
  phone: String,                   // Contact number
  role: String,                    // "sourcer", "developer", "designer", etc.

  // Bank Details (stored securely)
  bankDetails: {
    bankCode: String,              // "044" (Access Bank)
    bankName: String,              // "Access Bank" (for display)
    accountNumber: String,         // "0690000031"
    accountName: String            // "JOHN ADE" (verified via Flutterwave)
  },

  // Default allocation (optional - for quick invoice creation)
  defaultAllocationType: String,   // 'percentage' | 'fixed' | null
  defaultAllocationValue: Number,  // 5 (for 5%) or 20000000 (₦200,000 in kobo)

  // Stats
  totalPaid: Number,               // Total amount paid to vendor (kobo)
  payoutCount: Number,             // Number of successful payouts

  // Metadata
  status: String,                  // 'active' | 'inactive'
  notes: String,                   // Internal notes
  created: Number,
  updated: Number
}

// Indexes: status, bankDetails.accountNumber + bankDetails.bankCode (unique)
```

### 3. Invoice Model (`/models/invoice.js`)

Core invoice entity with vendor allocations.

```javascript
{
  _id: ULID,
  invoiceNumber: String,           // "INV-2025-0001" (auto-generated)

  // Client Info (denormalized for PDF generation)
  clientId: String,
  clientName: String,
  clientEmail: String,
  clientCompany: String,
  clientAddress: Object,

  // Line Items
  lineItems: [{
    description: String,           // "Website Development"
    quantity: Number,              // 1
    unitPrice: Number,             // 50000000 (₦500,000 in kobo)
    amount: Number                 // quantity * unitPrice
  }],

  // Financials (all in kobo)
  subtotal: Number,                // Sum of line items
  tax: Number,                     // Tax amount (if applicable)
  discount: Number,                // Discount amount
  total: Number,                   // Final invoice amount
  currency: String,                // "NGN"

  // Vendor Allocations (HIDDEN from client)
  vendorAllocations: [{
    vendorId: String,
    vendorName: String,            // Denormalized for display
    allocationType: String,        // 'percentage' | 'fixed'
    allocationValue: Number,       // 5 (for 5%) or 20000000 (₦200,000 in kobo)
    calculatedAmount: Number,      // Actual amount in kobo

    // Payout tracking
    payoutId: String,              // Reference to Payout record
    payoutStatus: String           // 'pending' | 'processing' | 'completed' | 'failed'
  }],

  // Fee Breakdown (calculated when payment received)
  flutterwaveFee: Number,          // Collection fee
  stampDuty: Number,               // ₦50 if > ₦10,000
  totalFees: Number,               // flutterwaveFee + stampDuty
  totalVendorPayouts: Number,      // Sum of all vendor allocations
  ownerProfit: Number,             // total - totalFees - totalVendorPayouts

  // Dates
  issueDate: Number,               // Timestamp
  dueDate: Number,                 // Payment due date

  // Status Flow: draft → sent → viewed → paid OR overdue → cancelled
  status: String,                  // 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled'
  sentAt: Number,
  viewedAt: Number,
  paidAt: Number,
  cancelledAt: Number,

  // Payment Link
  paymentLinkId: String,           // Flutterwave payment link ID
  paymentLinkUrl: String,          // Full URL for client
  paymentReference: String,        // tx_ref for Flutterwave

  // Notes
  notes: String,                   // Visible to client on invoice
  internalNotes: String,           // Hidden, for internal use

  // Metadata
  created: Number,
  updated: Number
}

// Indexes: invoiceNumber (unique), clientId, status, dueDate, paymentReference
```

### 4. Payment Model (`/models/payment.js`)

Records of payments received from clients.

```javascript
{
  _id: ULID,
  invoiceId: String,

  // Flutterwave Transaction Details
  flutterwaveId: Number,           // Transaction ID from Flutterwave
  flutterwaveRef: String,          // flw_ref
  transactionRef: String,          // tx_ref (our reference)

  // Payment Details
  amount: Number,                  // Amount paid (kobo)
  currency: String,                // "NGN"
  paymentMethod: String,           // 'card' | 'bank_transfer' | 'ussd'

  // Fees
  flutterwaveFee: Number,          // Fee charged
  stampDuty: Number,
  netAmount: Number,               // amount - fees

  // Payer Info
  payerName: String,
  payerEmail: String,

  // Status
  status: String,                  // 'pending' | 'successful' | 'failed'

  // Vendor Payout Status
  vendorPayoutStatus: String,      // 'pending' | 'processing' | 'completed' | 'partial' | 'failed'
  vendorPayoutsInitiated: Number,  // Timestamp when payouts started
  vendorPayoutsCompleted: Number,  // Timestamp when all payouts done

  // Raw webhook data (for debugging)
  webhookPayload: Object,

  // Metadata
  created: Number,
  updated: Number
}

// Indexes: invoiceId, flutterwaveRef (unique), transactionRef, status
```

### 5. Payout Model (`/models/payout.js`)

Individual vendor payout records.

```javascript
{
  _id: ULID,
  invoiceId: String,
  paymentId: String,
  vendorId: String,

  // Vendor Info (denormalized)
  vendorName: String,
  bankCode: String,
  bankName: String,
  accountNumber: String,           // Last 4 digits only for display
  accountNumberFull: String,       // Full number (for transfer)

  // Amount
  amount: Number,                  // Payout amount (kobo)
  currency: String,                // "NGN"
  allocationType: String,          // 'percentage' | 'fixed'
  allocationValue: Number,         // Original allocation value

  // Transfer Details
  flutterwaveTransferId: Number,   // Transfer ID from Flutterwave
  flutterwaveReference: String,    // Our unique reference

  // Status Flow: pending → processing → successful/failed
  status: String,                  // 'pending' | 'queued' | 'processing' | 'successful' | 'failed'
  failureReason: String,           // If failed

  // Retry tracking
  retryCount: Number,              // Default: 0, max: 3
  lastRetryAt: Number,

  // Timestamps
  initiatedAt: Number,             // When transfer was initiated
  completedAt: Number,             // When transfer completed/failed

  // Metadata
  created: Number,
  updated: Number
}

// Indexes: invoiceId, paymentId, vendorId, status, flutterwaveReference (unique)
```

### 6. Webhook Log Model (`/models/webhook-log.js`)

Audit trail for all incoming webhooks.

```javascript
{
  _id: ULID,
  source: String,                  // 'flutterwave'
  eventType: String,               // 'charge.completed', 'transfer.completed'

  // Identification
  webhookId: String,               // Unique ID from provider (for idempotency)
  flutterwaveRef: String,          // flw_ref or transfer reference

  // Request Details
  headers: Object,                 // Request headers
  payload: Object,                 // Full webhook payload
  signature: String,               // verif-hash header

  // Verification
  signatureValid: Boolean,

  // Processing
  processed: Boolean,              // Has this been processed?
  processedAt: Number,
  processingError: String,         // If processing failed

  // Related Records
  relatedInvoiceId: String,
  relatedPaymentId: String,
  relatedPayoutId: String,

  // Metadata
  created: Number
}

// Indexes: webhookId (unique), flutterwaveRef, eventType, processed
```

### 7. Invoice Counter Model (`/models/invoice-counter.js`)

For generating sequential invoice numbers.

```javascript
{
  _id: String,                     // 'main' (singleton)
  prefix: String,                  // 'INV'
  currentNumber: Number,           // 1, 2, 3...
  year: Number,                    // 2025
  updated: Number
}
```

---

## Flutterwave Integration (v3 API)

### Configuration

```env
FLUTTERWAVE_BASE_URL=https://api.flutterwave.com/v3
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-xxxxx
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-xxxxx
FLUTTERWAVE_WEBHOOK_HASH=your-webhook-secret-hash
```

### Service Structure

```
/services/flutterwave/
├── index.js                    # HTTP client with auth headers
├── get-banks.js                # GET /banks/NG
├── verify-bank-account.js      # POST /accounts/resolve
├── create-payment-link.js      # POST /payments
├── verify-transaction.js       # GET /transactions/:id/verify
├── initiate-transfer.js        # POST /transfers
├── get-transfer-status.js      # GET /transfers/:id
├── get-balance.js              # GET /balances/NGN
└── verify-webhook-signature.js # Verify verif-hash header
```

### API Endpoints

#### 1. Get Nigerian Banks
```
GET /banks/NG
Response: { status: "success", data: [{ id, code, name }] }
```

#### 2. Verify Bank Account
```
POST /accounts/resolve
Request: { account_number, account_bank }
Response: { status: "success", data: { account_number, account_name } }
```

#### 3. Create Payment Link
```
POST /payments
Request: {
  tx_ref: "INV-01HXYZ-01ABC",
  amount: 500000,  // Naira (not kobo!)
  currency: "NGN",
  redirect_url: "https://yourapp.com/payment/callback",
  customer: { email, name, phonenumber },
  customizations: { title, description, logo },
  meta: { invoice_id, invoice_number }
}
Response: { status: "success", data: { link: "https://checkout.flutterwave.com/..." } }
```

#### 4. Verify Transaction
```
GET /transactions/{id}/verify
-- OR --
GET /transactions/verify_by_reference?tx_ref=INV-01HXYZ-01ABC

Response: {
  status: "success",
  data: {
    id, tx_ref, flw_ref, amount, charged_amount,
    status: "successful", payment_type: "card",
    customer: { email, name }
  }
}
```

#### 5. Initiate Transfer (Vendor Payout)
```
POST /transfers
Request: {
  account_bank: "044",
  account_number: "0690000040",
  amount: 200000,  // Naira (not kobo!)
  currency: "NGN",
  reference: "PAY-inv123-ven456-1706789012",  // MUST be unique!
  narration: "Payout for Invoice INV-2025-0001",
  debit_currency: "NGN"
}
Response: {
  status: "success",
  data: { id: 789, reference: "...", status: "NEW", amount: 200000 }
}
```

#### 6. Get Transfer Status
```
GET /transfers/{id}
Response: {
  status: "success",
  data: {
    id, reference, status: "SUCCESSFUL" | "FAILED" | "PENDING",
    amount, fee, bank_name, complete_message
  }
}
```

#### 7. Get Wallet Balance
```
GET /balances/NGN
Response: {
  status: "success",
  data: { available_balance: 500000, ledger_balance: 500000 }
}
```

#### 8. Webhook Verification
```javascript
// Flutterwave sends verif-hash header
const signature = req.headers['verif-hash'];
const valid = signature === process.env.FLUTTERWAVE_WEBHOOK_HASH;
```

### Fee Structure (Nigeria)

| Transaction Type | Fee |
|-----------------|-----|
| Local Cards | 1.4% (capped at ₦2,000) |
| Bank Transfer | 1.4% (capped at ₦2,000) |
| USSD | 1.4% (capped at ₦2,000) |
| International Cards | 3.8% (no cap) |
| Stamp Duty | ₦50 (for transactions > ₦10,000) |
| Transfer Payout | ₦10 - ₦50 per transfer |

---

## Payment Flow (7 Steps)

```
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 1: CREATE INVOICE                                              │
├─────────────────────────────────────────────────────────────────────┤
│ • Select client, add line items, add vendor allocations             │
│ • System validates allocations don't exceed available amount        │
│ • Invoice saved as 'draft'                                          │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 2: SEND INVOICE                                                │
├─────────────────────────────────────────────────────────────────────┤
│ • Generate payment reference (tx_ref)                               │
│ • Call Flutterwave POST /payments to create payment link            │
│ • Generate PDF invoice, email to client                             │
│ • Update status to 'sent'                                           │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 3: CLIENT VIEWS & PAYS                                         │
├─────────────────────────────────────────────────────────────────────┤
│ • Client sees ONLY: Company name, amount, due date, Pay Now         │
│ • Client does NOT see: Vendors, allocations, profit margin          │
│ • Client pays via Flutterwave checkout                              │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 4: WEBHOOK RECEIVED (charge.completed)                         │
├─────────────────────────────────────────────────────────────────────┤
│ • Verify signature (verif-hash header)                              │
│ • Log webhook, check idempotency                                    │
│ • Verify transaction via Flutterwave API                            │
│ • Create Payment record, update Invoice to 'paid'                   │
│ • Queue vendor payout worker                                        │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 5: AUTO-DISTRIBUTE TO VENDORS                                  │
├─────────────────────────────────────────────────────────────────────┤
│ • Check Flutterwave balance >= total payouts                        │
│ • For each vendor:                                                  │
│   - Create Payout record                                            │
│   - Generate unique reference: PAY-{invId}-{venId}-{timestamp}      │
│   - Call POST /transfers                                            │
│                                                                     │
│ Example for ₦500,000 invoice:                                       │
│ ┌────────────────┬────────────┬────────────────────────────────┐    │
│ │ Recipient      │ Amount     │ Reference                      │    │
│ ├────────────────┼────────────┼────────────────────────────────┤    │
│ │ John Ade (5%)  │ ₦25,000    │ PAY-inv123-ven456-1706789012   │    │
│ │ TechPro        │ ₦200,000   │ PAY-inv123-ven789-1706789013   │    │
│ │ DesignHub      │ ₦75,000    │ PAY-inv123-ven012-1706789014   │    │
│ └────────────────┴────────────┴────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 6: TRANSFER WEBHOOKS (transfer.completed)                      │
├─────────────────────────────────────────────────────────────────────┤
│ • Update each Payout status to 'successful' or 'failed'             │
│ • If failed, increment retryCount (max 3)                           │
│ • When ALL complete, notify owner                                   │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 7: COMPLETE                                                    │
├─────────────────────────────────────────────────────────────────────┤
│ Owner Profit = ₦500,000 - ₦2,050 (fees) - ₦300,000 (vendors)       │
│            = ₦197,950                                               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

### Authentication (`/endpoints/auth/`)
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | /auth/login | Admin login | No |
| GET | /auth/me | Get profile | Yes |

### Clients (`/endpoints/clients/`)
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | /clients | Create client | Yes |
| GET | /clients | List clients | Yes |
| GET | /clients/:id | Get client | Yes |
| PUT | /clients/:id | Update client | Yes |
| DELETE | /clients/:id | Archive client | Yes |

### Vendors (`/endpoints/vendors/`)
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | /vendors | Create vendor (with bank verification) | Yes |
| GET | /vendors | List vendors | Yes |
| GET | /vendors/:id | Get vendor | Yes |
| PUT | /vendors/:id | Update vendor | Yes |
| DELETE | /vendors/:id | Deactivate vendor | Yes |
| GET | /vendors/banks | List Nigerian banks | Yes |
| POST | /vendors/verify-bank | Verify bank account | Yes |

### Invoices (`/endpoints/invoices/`)
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | /invoices | Create invoice | Yes |
| GET | /invoices | List invoices | Yes |
| GET | /invoices/:id | Get invoice | Yes |
| PUT | /invoices/:id | Update draft | Yes |
| DELETE | /invoices/:id | Cancel/delete | Yes |
| POST | /invoices/:id/send | Send to client | Yes |
| GET | /invoices/:id/pdf | Download PDF | Yes |
| POST | /invoices/:id/duplicate | Duplicate | Yes |

### Public (No Auth)
| Method | Path | Description |
|--------|------|-------------|
| GET | /public/invoice/:token | Client view |
| POST | /public/invoice/:token/viewed | Mark viewed |
| GET | /public/payment/callback | Payment redirect |

### Payments & Payouts
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | /payments | List payments | Yes |
| GET | /payments/:id | Get payment | Yes |
| GET | /payouts | List payouts | Yes |
| POST | /payouts/:id/retry | Retry failed | Yes |
| POST | /webhooks/flutterwave | Webhook handler | Signature |

### Dashboard
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | /dashboard/overview | Stats summary | Yes |
| GET | /dashboard/revenue | Revenue by period | Yes |

---

## Services Layer

```
/services/
├── auth/
│   └── login.js
├── clients/
│   ├── create-client.js
│   ├── list-clients.js
│   ├── get-client.js
│   ├── update-client.js
│   └── delete-client.js
├── vendors/
│   ├── create-vendor.js         # Includes bank verification
│   ├── list-vendors.js
│   ├── get-vendor.js
│   ├── update-vendor.js
│   └── delete-vendor.js
├── invoices/
│   ├── create-invoice.js
│   ├── list-invoices.js
│   ├── get-invoice.js
│   ├── update-invoice.js
│   ├── delete-invoice.js
│   ├── send-invoice.js          # Create payment link + email
│   ├── calculate-allocations.js # Core allocation logic
│   ├── generate-invoice-number.js
│   └── generate-pdf.js          # Puppeteer HTML-to-PDF
├── payments/
│   ├── process-webhook.js
│   ├── verify-payment.js
│   └── calculate-fees.js
├── payouts/
│   ├── process-invoice-payouts.js
│   ├── execute-payout.js
│   └── retry-payout.js
├── flutterwave/
│   ├── index.js
│   ├── get-banks.js
│   ├── verify-bank-account.js
│   ├── create-payment-link.js
│   ├── verify-transaction.js
│   ├── initiate-transfer.js
│   ├── get-transfer-status.js
│   ├── get-balance.js
│   └── verify-webhook-signature.js
└── dashboard/
    ├── get-overview.js
    └── get-revenue.js
```

---

## Background Workers

```
/workers/
├── process-vendor-payouts.js      # Execute all vendor transfers
├── send-invoice-email.js          # Email invoice to client
├── send-payment-receipt.js        # Receipt after payment
├── send-payout-notification.js    # Notify owner of completions
├── check-overdue-invoices.js      # Daily cron
├── retry-failed-payouts.js        # Every 15 min
└── generate-invoice-pdf.js        # Puppeteer PDF
```

---

## Email Templates

| Template | Recipient | Purpose |
|----------|-----------|---------|
| `invoice-sent.js` | Client | Invoice with "Pay Now" button |
| `payment-receipt.js` | Client | Confirmation after payment |
| `payment-received.js` | Owner | Payment notification |
| `payouts-completed.js` | Owner | All vendors paid |
| `payout-failed.js` | Owner | Failed payout alert |
| `invoice-overdue.js` | Owner | Overdue reminder |

---

## Environment Variables

```env
# App
APP_NAME="Luzo DN Parsempo Invoice System"
APP_URL=https://api.luzoparsempo.com

# Database
MONGODB_URI=mongodb://localhost:27017/smart_invoice

# Authentication
JWT_SECRET=your-32-char-minimum-secret-key
ADMIN_EMAIL=admin@luzoparsempo.com

# Flutterwave
FLUTTERWAVE_BASE_URL=https://api.flutterwave.com/v3
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-xxxxx
FLUTTERWAVE_SECRET_KEY=FLWSECK-xxxxx
FLUTTERWAVE_WEBHOOK_HASH=your-webhook-secret

# Email (Resend)
RESEND_API_KEY=re_xxxxx
EMAIL_FROM="Luzo DN Parsempo <invoices@luzoparsempo.com>"

# Redis
REDIS_URL=redis://localhost:6379

# Business Config
BUSINESS_NAME="Luzo DN Parsempo"
DEFAULT_LOGO_URL=https://yourcdn.com/logo.png
INVOICE_PREFIX=INV
DEFAULT_CURRENCY=NGN
```

---

## File Structure Summary

```
smart_invoice/
├── endpoints/          (~35 files)
├── models/             (7 files)
├── repository/         (7 folders)
├── services/           (~45 files)
├── workers/            (7 files)
├── middlewares/        (2 files)
├── messages/           (5 files)
└── notification/email/templates/ (6 files)

Total: ~95 files
```

---

## Verification Checklist

1. [ ] Login as admin
2. [ ] Create client
3. [ ] Create 3 vendors with verified banks
4. [ ] Create invoice with allocations
5. [ ] Send invoice (verify email)
6. [ ] Pay via Flutterwave test mode
7. [ ] Verify webhook processed
8. [ ] Verify transfers initiated
9. [ ] Check dashboard stats
