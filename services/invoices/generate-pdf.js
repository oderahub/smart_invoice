const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const { InvoiceRepo } = require('@app/repository');
const InvoiceMessages = require('@app/messages/invoice');

const BUSINESS_NAME = process.env.BUSINESS_NAME || 'Luzo DN Parsempo';
const DEFAULT_LOGO_URL = process.env.DEFAULT_LOGO_URL || '';

/**
 * Format amount from kobo to Naira with currency symbol
 * @param {Number} amountInKobo
 * @param {String} currency
 * @returns {String}
 */
function formatCurrency(amountInKobo, currency = 'NGN') {
  const amount = amountInKobo / 100;
  const symbol = currency === 'NGN' ? '₦' : currency;
  return `${symbol}${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format timestamp to readable date
 * @param {Number} timestamp
 * @returns {String}
 */
function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Generate HTML template for invoice PDF
 * @param {Object} invoice
 * @returns {String} HTML string
 */
function generateInvoiceHTML(invoice) {
  const lineItemsHTML = invoice.lineItems
    .map(
      (item, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${item.description}</td>
        <td style="text-align: center;">${item.quantity}</td>
        <td style="text-align: right;">${formatCurrency(item.unitPrice, invoice.currency)}</td>
        <td style="text-align: right;">${formatCurrency(item.amount, invoice.currency)}</td>
      </tr>
    `
    )
    .join('');

  const addressLines = [];
  if (invoice.clientAddress) {
    if (invoice.clientAddress.street) addressLines.push(invoice.clientAddress.street);
    if (invoice.clientAddress.city) addressLines.push(invoice.clientAddress.city);
    if (invoice.clientAddress.state) addressLines.push(invoice.clientAddress.state);
    if (invoice.clientAddress.country) addressLines.push(invoice.clientAddress.country);
  }

  const statusBadgeColor = {
    draft: '#6c757d',
    sent: '#007bff',
    viewed: '#17a2b8',
    paid: '#28a745',
    overdue: '#dc3545',
    cancelled: '#6c757d',
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoice.invoiceNumber}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      color: #333;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #f0f0f0;
    }

    .company-info {
      flex: 1;
    }

    .company-name {
      font-size: 24px;
      font-weight: bold;
      color: #2c3e50;
      margin-bottom: 5px;
    }

    .company-logo {
      max-width: 150px;
      max-height: 60px;
    }

    .invoice-title {
      text-align: right;
    }

    .invoice-title h1 {
      font-size: 32px;
      color: #2c3e50;
      margin-bottom: 5px;
    }

    .invoice-number {
      font-size: 16px;
      color: #666;
    }

    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      color: white;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
      margin-top: 10px;
    }

    .info-section {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
    }

    .bill-to, .invoice-details {
      flex: 1;
    }

    .bill-to {
      padding-right: 40px;
    }

    .invoice-details {
      text-align: right;
    }

    .section-title {
      font-size: 12px;
      font-weight: bold;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 10px;
    }

    .client-name {
      font-size: 18px;
      font-weight: bold;
      color: #2c3e50;
      margin-bottom: 5px;
    }

    .client-details {
      color: #666;
    }

    .detail-row {
      margin-bottom: 5px;
    }

    .detail-label {
      color: #888;
    }

    .detail-value {
      font-weight: 500;
    }

    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }

    .items-table th {
      background-color: #f8f9fa;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: #2c3e50;
      border-bottom: 2px solid #dee2e6;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .items-table td {
      padding: 12px;
      border-bottom: 1px solid #f0f0f0;
    }

    .items-table tr:last-child td {
      border-bottom: none;
    }

    .totals-section {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 40px;
    }

    .totals-table {
      width: 300px;
    }

    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .totals-row:last-child {
      border-bottom: none;
    }

    .totals-row.total {
      font-size: 18px;
      font-weight: bold;
      color: #2c3e50;
      border-top: 2px solid #2c3e50;
      padding-top: 15px;
      margin-top: 10px;
    }

    .notes-section {
      background-color: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
    }

    .notes-title {
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 10px;
    }

    .notes-content {
      color: #666;
    }

    .footer {
      text-align: center;
      color: #888;
      font-size: 12px;
      padding-top: 20px;
      border-top: 1px solid #f0f0f0;
    }

    .footer p {
      margin-bottom: 5px;
    }

    @media print {
      body {
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-info">
      ${DEFAULT_LOGO_URL ? `<img src="${DEFAULT_LOGO_URL}" alt="Logo" class="company-logo" />` : ''}
      <div class="company-name">${BUSINESS_NAME}</div>
    </div>
    <div class="invoice-title">
      <h1>INVOICE</h1>
      <div class="invoice-number">${invoice.invoiceNumber}</div>
      <div class="status-badge" style="background-color: ${statusBadgeColor[invoice.status] || '#6c757d'}">
        ${invoice.status}
      </div>
    </div>
  </div>

  <div class="info-section">
    <div class="bill-to">
      <div class="section-title">Bill To</div>
      <div class="client-name">${invoice.clientCompany || invoice.clientName}</div>
      <div class="client-details">
        ${invoice.clientCompany && invoice.clientName !== invoice.clientCompany ? `<div>${invoice.clientName}</div>` : ''}
        <div>${invoice.clientEmail}</div>
        ${addressLines.map((line) => `<div>${line}</div>`).join('')}
      </div>
    </div>
    <div class="invoice-details">
      <div class="section-title">Invoice Details</div>
      <div class="detail-row">
        <span class="detail-label">Issue Date:</span>
        <span class="detail-value">${formatDate(invoice.issueDate)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Due Date:</span>
        <span class="detail-value">${formatDate(invoice.dueDate)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Currency:</span>
        <span class="detail-value">${invoice.currency}</span>
      </div>
    </div>
  </div>

  <table class="items-table">
    <thead>
      <tr>
        <th style="width: 40px;">#</th>
        <th>Description</th>
        <th style="width: 80px; text-align: center;">Qty</th>
        <th style="width: 120px; text-align: right;">Unit Price</th>
        <th style="width: 120px; text-align: right;">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${lineItemsHTML}
    </tbody>
  </table>

  <div class="totals-section">
    <div class="totals-table">
      <div class="totals-row">
        <span>Subtotal</span>
        <span>${formatCurrency(invoice.subtotal, invoice.currency)}</span>
      </div>
      ${
        invoice.tax > 0
          ? `
      <div class="totals-row">
        <span>Tax</span>
        <span>${formatCurrency(invoice.tax, invoice.currency)}</span>
      </div>
      `
          : ''
      }
      ${
        invoice.discount > 0
          ? `
      <div class="totals-row">
        <span>Discount</span>
        <span>-${formatCurrency(invoice.discount, invoice.currency)}</span>
      </div>
      `
          : ''
      }
      <div class="totals-row total">
        <span>Total</span>
        <span>${formatCurrency(invoice.total, invoice.currency)}</span>
      </div>
    </div>
  </div>

  ${
    invoice.notes
      ? `
  <div class="notes-section">
    <div class="notes-title">Notes</div>
    <div class="notes-content">${invoice.notes}</div>
  </div>
  `
      : ''
  }

  <div class="footer">
    <p>Thank you for your business!</p>
    <p>${BUSINESS_NAME}</p>
  </div>
</body>
</html>
  `;
}

/**
 * Generate PDF for an invoice
 *
 * @param {String} invoiceId
 * @returns {Object} { buffer: Buffer, filename: String }
 */
async function generatePdf(invoiceId) {
  const invoice = await InvoiceRepo.findOne({ _id: invoiceId });

  if (!invoice) {
    throwAppError(InvoiceMessages.INVOICE_NOT_FOUND, ERROR_CODE.NOTFOUND);
  }

  // Dynamically import puppeteer (optional dependency)
  let puppeteer;
  try {
    // eslint-disable-next-line global-require, import/no-extraneous-dependencies
    puppeteer = require('puppeteer');
  } catch (error) {
    throwAppError('PDF generation requires puppeteer. Please install it: npm install puppeteer', ERROR_CODE.SRVRERR);
  }

  const html = generateInvoiceHTML(invoice);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm',
      },
    });

    const filename = `${invoice.invoiceNumber}.pdf`;

    return {
      buffer: pdfBuffer,
      filename,
      contentType: 'application/pdf',
    };
  } finally {
    await browser.close();
  }
}

module.exports = generatePdf;
