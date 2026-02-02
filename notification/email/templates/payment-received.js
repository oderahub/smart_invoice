module.exports = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Received - {{business_name}}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <tr>
            <td style="padding: 40px 30px; text-align: center; background-color: #10b981;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">💰 Payment Received!</h1>
            </td>
        </tr>
        <tr>
            <td style="padding: 40px 30px;">
                <h2 style="color: #333333; margin: 0 0 20px;">New Payment Notification</h2>

                <p style="color: #666666; font-size: 16px; line-height: 1.6;">
                    Great news! You've received a payment for Invoice <strong>{{invoice_number}}</strong>.
                </p>

                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <tr>
                        <td style="padding: 20px; background-color: #f9fafb;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="color: #666666; padding: 8px 0;">Client:</td>
                                    <td style="color: #333333; font-weight: bold; text-align: right;">{{client_name}}</td>
                                </tr>
                                <tr>
                                    <td style="color: #666666; padding: 8px 0;">Invoice Number:</td>
                                    <td style="color: #333333; font-weight: bold; text-align: right;">{{invoice_number}}</td>
                                </tr>
                                <tr>
                                    <td style="color: #666666; padding: 8px 0;">Amount Received:</td>
                                    <td style="color: #10b981; font-weight: bold; text-align: right; font-size: 18px;">₦{{amount_formatted}}</td>
                                </tr>
                                <tr>
                                    <td style="color: #666666; padding: 8px 0;">Payment Method:</td>
                                    <td style="color: #333333; font-weight: bold; text-align: right;">{{payment_method}}</td>
                                </tr>
                                <tr>
                                    <td style="color: #666666; padding: 8px 0;">Flutterwave Fee:</td>
                                    <td style="color: #ef4444; font-weight: bold; text-align: right;">-₦{{fee_formatted}}</td>
                                </tr>
                                <tr>
                                    <td style="color: #666666; padding: 8px 0;">Vendor Payouts:</td>
                                    <td style="color: #f59e0b; font-weight: bold; text-align: right;">-₦{{vendor_payouts_formatted}}</td>
                                </tr>
                                <tr style="border-top: 2px solid #e0e0e0;">
                                    <td style="color: #333333; padding: 12px 0; font-weight: bold;">Your Profit:</td>
                                    <td style="color: #2563eb; font-weight: bold; text-align: right; font-size: 20px;">₦{{profit_formatted}}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>

                <p style="color: #666666; font-size: 14px; line-height: 1.6;">
                    Vendor payouts will be processed automatically.
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
