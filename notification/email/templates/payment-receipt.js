module.exports = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Receipt from {{business_name}}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <tr>
            <td style="padding: 40px 30px; text-align: center; background-color: #10b981;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Payment Received</h1>
            </td>
        </tr>
        <tr>
            <td style="padding: 40px 30px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <div style="width: 80px; height: 80px; background-color: #d1fae5; border-radius: 50%; display: inline-block; line-height: 80px;">
                        <span style="color: #10b981; font-size: 40px;">✓</span>
                    </div>
                </div>

                <h2 style="color: #333333; margin: 0 0 20px; text-align: center;">Thank You for Your Payment!</h2>

                <p style="color: #666666; font-size: 16px; line-height: 1.6; text-align: center;">
                    Dear {{client_name}},
                </p>

                <p style="color: #666666; font-size: 16px; line-height: 1.6; text-align: center;">
                    We have received your payment of <strong>₦{{amount_formatted}}</strong> for Invoice {{invoice_number}}.
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
                                    <td style="color: #666666; padding: 8px 0;">Amount Paid:</td>
                                    <td style="color: #10b981; font-weight: bold; text-align: right;">₦{{amount_formatted}}</td>
                                </tr>
                                <tr>
                                    <td style="color: #666666; padding: 8px 0;">Payment Method:</td>
                                    <td style="color: #333333; font-weight: bold; text-align: right;">{{payment_method}}</td>
                                </tr>
                                <tr>
                                    <td style="color: #666666; padding: 8px 0;">Payment Date:</td>
                                    <td style="color: #333333; font-weight: bold; text-align: right;">{{payment_date}}</td>
                                </tr>
                                <tr>
                                    <td style="color: #666666; padding: 8px 0;">Reference:</td>
                                    <td style="color: #333333; font-weight: bold; text-align: right;">{{transaction_ref}}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>

                <p style="color: #666666; font-size: 16px; line-height: 1.6;">
                    This receipt confirms that your payment has been successfully processed.
                </p>

                <p style="color: #666666; font-size: 16px; line-height: 1.6; margin-top: 30px;">
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
