module.exports = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Overdue Invoice Alert - {{business_name}}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <tr>
            <td style="padding: 40px 30px; text-align: center; background-color: #f59e0b;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">📋 Overdue Invoice Alert</h1>
            </td>
        </tr>
        <tr>
            <td style="padding: 40px 30px;">
                <h2 style="color: #333333; margin: 0 0 20px;">Invoices Past Due Date</h2>

                <p style="color: #666666; font-size: 16px; line-height: 1.6;">
                    The following invoice(s) are now overdue and require follow-up:
                </p>

                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <tr style="background-color: #f9fafb;">
                        <td style="padding: 12px; color: #666666; font-weight: bold; border-bottom: 1px solid #e0e0e0;">Invoice</td>
                        <td style="padding: 12px; color: #666666; font-weight: bold; border-bottom: 1px solid #e0e0e0;">Client</td>
                        <td style="padding: 12px; color: #666666; font-weight: bold; text-align: right; border-bottom: 1px solid #e0e0e0;">Amount</td>
                        <td style="padding: 12px; color: #666666; font-weight: bold; text-align: right; border-bottom: 1px solid #e0e0e0;">Days Overdue</td>
                    </tr>
                    {{#each invoices}}
                    <tr>
                        <td style="padding: 12px; color: #333333; border-bottom: 1px solid #e0e0e0;">{{this.invoice_number}}</td>
                        <td style="padding: 12px; color: #333333; border-bottom: 1px solid #e0e0e0;">{{this.client_name}}</td>
                        <td style="padding: 12px; color: #333333; text-align: right; border-bottom: 1px solid #e0e0e0;">₦{{this.amount_formatted}}</td>
                        <td style="padding: 12px; color: #ef4444; font-weight: bold; text-align: right; border-bottom: 1px solid #e0e0e0;">{{this.days_overdue}}</td>
                    </tr>
                    {{/each}}
                </table>

                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #fef3c7;">
                    <tr>
                        <td style="padding: 20px;">
                            <p style="color: #92400e; font-size: 14px; margin: 0;">
                                <strong>Total Overdue:</strong> ₦{{total_overdue_formatted}} across {{invoice_count}} invoice(s)
                            </p>
                        </td>
                    </tr>
                </table>

                <p style="color: #666666; font-size: 16px; line-height: 1.6;">
                    Consider sending a reminder to these clients or following up directly.
                </p>
            </td>
        </tr>
        <tr>
            <td style="padding: 30px; text-align: center; background-color: #f9fafb; border-top: 1px solid #e0e0e0;">
                <p style="color: #999999; font-size: 12px; margin: 0;">
                    {{business_name}} Invoice System
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
`;
