module.exports = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vendor Payouts Completed - {{business_name}}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <tr>
            <td style="padding: 40px 30px; text-align: center; background-color: #2563eb;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">✅ Payouts Completed</h1>
            </td>
        </tr>
        <tr>
            <td style="padding: 40px 30px;">
                <h2 style="color: #333333; margin: 0 0 20px;">Vendor Payouts Summary</h2>

                <p style="color: #666666; font-size: 16px; line-height: 1.6;">
                    All vendor payouts for Invoice <strong>{{invoice_number}}</strong> have been processed.
                </p>

                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <tr>
                        <td style="padding: 20px; background-color: #f9fafb;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="color: #666666; padding: 8px 0;">Invoice:</td>
                                    <td style="color: #333333; font-weight: bold; text-align: right;">{{invoice_number}}</td>
                                </tr>
                                <tr>
                                    <td style="color: #666666; padding: 8px 0;">Client:</td>
                                    <td style="color: #333333; font-weight: bold; text-align: right;">{{client_name}}</td>
                                </tr>
                                <tr>
                                    <td style="color: #666666; padding: 8px 0;">Total Payouts:</td>
                                    <td style="color: #333333; font-weight: bold; text-align: right;">₦{{total_payouts_formatted}}</td>
                                </tr>
                                <tr>
                                    <td style="color: #666666; padding: 8px 0;">Vendors Paid:</td>
                                    <td style="color: #333333; font-weight: bold; text-align: right;">{{vendor_count}}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>

                <h3 style="color: #333333; margin: 30px 0 15px;">Payout Details</h3>

                <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e0e0e0; border-radius: 8px;">
                    <tr style="background-color: #f9fafb;">
                        <td style="padding: 12px; color: #666666; font-weight: bold; border-bottom: 1px solid #e0e0e0;">Vendor</td>
                        <td style="padding: 12px; color: #666666; font-weight: bold; text-align: right; border-bottom: 1px solid #e0e0e0;">Amount</td>
                        <td style="padding: 12px; color: #666666; font-weight: bold; text-align: center; border-bottom: 1px solid #e0e0e0;">Status</td>
                    </tr>
                    {{#each payouts}}
                    <tr>
                        <td style="padding: 12px; color: #333333; border-bottom: 1px solid #e0e0e0;">{{this.vendor_name}}</td>
                        <td style="padding: 12px; color: #333333; text-align: right; border-bottom: 1px solid #e0e0e0;">₦{{this.amount_formatted}}</td>
                        <td style="padding: 12px; text-align: center; border-bottom: 1px solid #e0e0e0;">
                            {{#if this.success}}
                            <span style="color: #10b981;">✓ Sent</span>
                            {{else}}
                            <span style="color: #ef4444;">✗ Failed</span>
                            {{/if}}
                        </td>
                    </tr>
                    {{/each}}
                </table>
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
