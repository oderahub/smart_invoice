# Git Strategy - Smart Invoice & Payment System

## Branch Strategy

We'll use a simple feature-branch workflow:

```
main (production-ready)
  └── feature/* (individual features)
```

## Commit Convention

Format: `type(scope): description`

### Types
- `feat` - New feature
- `fix` - Bug fix
- `refactor` - Code refactoring
- `docs` - Documentation
- `test` - Tests
- `chore` - Maintenance

### Scopes
- `models` - Database models
- `repo` - Repositories
- `auth` - Authentication
- `clients` - Client management
- `vendors` - Vendor management
- `invoices` - Invoice system
- `payments` - Payment processing
- `payouts` - Vendor payouts
- `webhooks` - Webhook handling
- `flutterwave` - Flutterwave integration
- `email` - Email templates/workers
- `dashboard` - Dashboard/stats
- `workers` - Background workers

---

## Phase 1 Commits

### 1.1 - Environment & Models Setup
```bash
git add .env.example
git commit -m "chore(env): add Flutterwave and business config variables"
git push origin main
```

### 1.2 - Client Model
```bash
git add models/client.js repository/client/
git commit -m "feat(models): add Client model and repository"
git push origin main
```

### 1.3 - Vendor Model
```bash
git add models/vendor.js repository/vendor/
git commit -m "feat(models): add Vendor model and repository"
git push origin main
```

### 1.4 - Invoice Model
```bash
git add models/invoice.js repository/invoice/
git commit -m "feat(models): add Invoice model with line items and allocations"
git push origin main
```

### 1.5 - Payment Model
```bash
git add models/payment.js repository/payment/
git commit -m "feat(models): add Payment model and repository"
git push origin main
```

### 1.6 - Payout Model
```bash
git add models/payout.js repository/payout/
git commit -m "feat(models): add Payout model for vendor transfers"
git push origin main
```

### 1.7 - Webhook Log Model
```bash
git add models/webhook-log.js repository/webhook-log/
git commit -m "feat(models): add WebhookLog for idempotency and audit"
git push origin main
```

### 1.8 - Invoice Counter Model
```bash
git add models/invoice-counter.js repository/invoice-counter/
git commit -m "feat(models): add InvoiceCounter for sequential numbering"
git push origin main
```

### 1.9 - Model Index Updates
```bash
git add models/index.js repository/index.js
git commit -m "chore(models): export all models and repositories"
git push origin main
```

### 1.10 - Flutterwave HTTP Client
```bash
git add services/flutterwave/index.js
git commit -m "feat(flutterwave): add base HTTP client with auth headers"
git push origin main
```

### 1.11 - Auth Middleware
```bash
git add middlewares/auth.js services/auth/
git commit -m "feat(auth): add JWT authentication middleware"
git push origin main
```

---

## Phase 2 Commits

### 2.1 - Client CRUD Services
```bash
git add services/clients/ messages/client.js
git commit -m "feat(clients): add client CRUD services"
git push origin main
```

### 2.2 - Client Endpoints
```bash
git add endpoints/clients/
git commit -m "feat(clients): add client API endpoints"
git push origin main
```

### 2.3 - Bank Services
```bash
git add services/flutterwave/get-banks.js services/flutterwave/verify-bank-account.js
git commit -m "feat(flutterwave): add bank list and account verification"
git push origin main
```

### 2.4 - Vendor CRUD Services
```bash
git add services/vendors/ messages/vendor.js
git commit -m "feat(vendors): add vendor CRUD services with bank verification"
git push origin main
```

### 2.5 - Vendor Endpoints
```bash
git add endpoints/vendors/
git commit -m "feat(vendors): add vendor API endpoints"
git push origin main
```

---

## Phase 3 Commits

### 3.1 - Invoice Number Generation
```bash
git add services/invoices/generate-invoice-number.js
git commit -m "feat(invoices): add sequential invoice number generation"
git push origin main
```

### 3.2 - Invoice Allocation Logic
```bash
git add services/invoices/calculate-allocations.js
git commit -m "feat(invoices): add vendor allocation calculation"
git push origin main
```

### 3.3 - Invoice CRUD Services
```bash
git add services/invoices/create-invoice.js services/invoices/list-invoices.js \
        services/invoices/get-invoice.js services/invoices/update-invoice.js \
        services/invoices/delete-invoice.js messages/invoice.js
git commit -m "feat(invoices): add invoice CRUD services"
git push origin main
```

### 3.4 - Invoice Endpoints
```bash
git add endpoints/invoices/
git commit -m "feat(invoices): add invoice API endpoints"
git push origin main
```

### 3.5 - Payment Link Service
```bash
git add services/flutterwave/create-payment-link.js services/invoices/send-invoice.js
git commit -m "feat(invoices): add payment link generation and send invoice"
git push origin main
```

### 3.6 - PDF Generation
```bash
git add services/invoices/generate-pdf.js endpoints/invoices/pdf.js
git commit -m "feat(invoices): add PDF invoice generation with Puppeteer"
git push origin main
```

### 3.7 - Public Invoice Endpoints
```bash
git add endpoints/public/
git commit -m "feat(public): add public invoice view and payment callback"
git push origin main
```

---

## Phase 4 Commits

### 4.1 - Webhook Verification
```bash
git add services/flutterwave/verify-webhook-signature.js
git commit -m "feat(webhooks): add Flutterwave webhook signature verification"
git push origin main
```

### 4.2 - Payment Processing
```bash
git add services/payments/ messages/payment.js
git commit -m "feat(payments): add webhook processing and payment verification"
git push origin main
```

### 4.3 - Transfer Services
```bash
git add services/flutterwave/initiate-transfer.js \
        services/flutterwave/get-transfer-status.js \
        services/flutterwave/get-balance.js
git commit -m "feat(flutterwave): add transfer initiation and status services"
git push origin main
```

### 4.4 - Payout Services
```bash
git add services/payouts/ messages/payout.js
git commit -m "feat(payouts): add vendor payout processing and retry logic"
git push origin main
```

### 4.5 - Payout Worker
```bash
git add workers/process-vendor-payouts.js workers/index.js
git commit -m "feat(workers): add vendor payout background worker"
git push origin main
```

### 4.6 - Webhook Endpoint
```bash
git add endpoints/webhooks/
git commit -m "feat(webhooks): add Flutterwave webhook endpoint"
git push origin main
```

### 4.7 - Payment & Payout Endpoints
```bash
git add endpoints/payments/ endpoints/payouts/
git commit -m "feat(payments): add payment and payout API endpoints"
git push origin main
```

---

## Phase 5 Commits

### 5.1 - Email Templates
```bash
git add notification/email/templates/
git commit -m "feat(email): add invoice and payment email templates"
git push origin main
```

### 5.2 - Email Workers
```bash
git add workers/send-invoice-email.js workers/send-payment-receipt.js \
        workers/send-payout-notification.js
git commit -m "feat(workers): add email notification workers"
git push origin main
```

### 5.3 - Dashboard Services
```bash
git add services/dashboard/
git commit -m "feat(dashboard): add overview and revenue statistics"
git push origin main
```

### 5.4 - Dashboard Endpoints
```bash
git add endpoints/dashboard/
git commit -m "feat(dashboard): add dashboard API endpoints"
git push origin main
```

### 5.5 - Background Jobs
```bash
git add workers/check-overdue-invoices.js workers/retry-failed-payouts.js
git commit -m "feat(workers): add overdue checker and payout retry jobs"
git push origin main
```

---

## Phase 6 Commits

### 6.1 - Unit Tests
```bash
git add tests/
git commit -m "test: add unit tests for all services"
git push origin main
```

### 6.2 - Integration Tests
```bash
git add tests/integration/
git commit -m "test: add integration tests for payment flow"
git push origin main
```

---

## Quick Reference

After implementing each feature:

```bash
# 1. Check status
git status

# 2. Stage specific files
git add <files>

# 3. Commit with message
git commit -m "type(scope): description"

# 4. Push to remote
git push origin main
```

## Tagging Releases

After completing each phase:

```bash
# Phase 1 complete
git tag -a v0.1.0 -m "Phase 1: Foundation - Models and Repositories"
git push origin v0.1.0

# Phase 2 complete
git tag -a v0.2.0 -m "Phase 2: Core CRUD - Clients and Vendors"
git push origin v0.2.0

# Phase 3 complete
git tag -a v0.3.0 -m "Phase 3: Invoice System"
git push origin v0.3.0

# Phase 4 complete
git tag -a v0.4.0 -m "Phase 4: Payment Flow"
git push origin v0.4.0

# Phase 5 complete
git tag -a v0.5.0 -m "Phase 5: Notifications and Dashboard"
git push origin v0.5.0

# Phase 6 complete - Production Ready
git tag -a v1.0.0 -m "v1.0.0: Smart Invoice System - Production Release"
git push origin v1.0.0
```
