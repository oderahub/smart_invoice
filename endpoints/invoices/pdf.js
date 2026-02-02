const { createHandler } = require('@app-core/server');
const { adminAuth } = require('@app/middlewares');
const { generatePdf } = require('@app/services/invoices');
const InvoiceMessages = require('@app/messages/invoice');

module.exports = createHandler({
  path: '/invoices/:id/pdf',
  method: 'get',
  middlewares: [adminAuth],
  async handler(rc, helpers) {
    const { buffer, filename, contentType } = await generatePdf(rc.params.id);

    // Set headers for PDF download
    rc.res.setHeader('Content-Type', contentType);
    rc.res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    rc.res.setHeader('Content-Length', buffer.length);

    // Send the PDF buffer directly
    rc.res.end(buffer);

    // Return null to prevent default response handling
    return {
      __raw: true,
      status: helpers.http_statuses.HTTP_200_OK,
      message: InvoiceMessages.PDF_GENERATED,
    };
  },
});
