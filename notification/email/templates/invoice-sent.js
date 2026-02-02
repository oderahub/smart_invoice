module.exports = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice from {{business_name}}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <tr>
            <td style="padding: 40px 30px; text-align: center; background-color: #2563eb;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">{{business_name}}</h1>
            </td>
        </tr>
        <tr>
            <td style="padding: 40px 30px;">
                <h2 style="color: #333333; margin: 0 0 20px;">Invoice {{invoice_number}}</h2>

                <p style="color: #666666; font-size: 16px; line-height: 1.6;">
                    Dear {{client_name}},
                </p>

                <p style="color: #666666; font-size: 16px; line-height: 1.6;">
                    Please find attached your invoice for the amount of <strong>₦{{amount_formatted}}</strong>.
                </p>

                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <tr>
                        <td style="padding: 20px; background-color: #f9fafb;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="color: #666666; padding: 8px 0;">Invoice Number:</td>
                                    <td style="color: #333333; font-weight: bold; text-align: right;">{{invoice_number}}</td>
                                </tr>
                                <tr>
                                    <td style="color: #666666; padding: 8px 0;">Amount Due:</td>
                                    <td style="color: #333333; font-weight: bold; text-align: right;">₦{{amount_formatted}}</td>
                                </tr>
                                <tr>
                                    <td style="color: #666666; padding: 8px 0;">Due Date:</td>
                                    <td style="color: #333333; font-weight: bold; text-align: right;">{{due_date}}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>

                <p style="color: #666666; font-size: 16px; line-height: 1.6;">
                    Click the button below to view your invoice and make payment:
                </p>

                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="text-align: center; padding: 30px 0;">
                            <a href="{{payment_link}}" style="display: inline-block; padding: 16px 40px; background-color: #2563eb; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 8px;">
                                Pay Now
                            </a>
                        </td>
                    </tr>
                </table>

                {{#if notes}}
                <p style="color: #666666; font-size: 14px; line-height: 1.6; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
                    <strong>Note:</strong> {{notes}}
                </p>
                {{/if}}

                <p style="color: #666666; font-size: 16px; line-height: 1.6; margin-top: 30px;">
                    If you have any questions about this invoice, please don't hesitate to contact us.
                </p>

                <p style="color: #666666; font-size: 16px; line-height: 1.6;">
                    Thank you for your business!
                </p>

                <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-top: 20px;">
                    Best regards,<br>
                    <strong>{{business_name}}</strong>
                </p>
            </td>
        </tr>
        <tr>
            <td style="padding: 30px; text-align: center; background-color: #f9fafb; border-top: 1px solid #e0e0e0;">
                <p style="color: #999999; font-size: 12px; margin: 0;">
                    This email was sent by {{business_name}}
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
`;
