module.exports = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payout Failed - {{business_name}}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <tr>
            <td style="padding: 40px 30px; text-align: center; background-color: #ef4444;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">⚠️ Payout Failed</h1>
            </td>
        </tr>
        <tr>
            <td style="padding: 40px 30px;">
                <h2 style="color: #333333; margin: 0 0 20px;">Action Required</h2>

                <p style="color: #666666; font-size: 16px; line-height: 1.6;">
                    A vendor payout has failed and requires your attention.
                </p>

                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0; border: 1px solid #fecaca; border-radius: 8px; background-color: #fef2f2;">
                    <tr>
                        <td style="padding: 20px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="color: #666666; padding: 8px 0;">Invoice:</td>
                                    <td style="color: #333333; font-weight: bold; text-align: right;">{{invoice_number}}</td>
                                </tr>
                                <tr>
                                    <td style="color: #666666; padding: 8px 0;">Vendor:</td>
                                    <td style="color: #333333; font-weight: bold; text-align: right;">{{vendor_name}}</td>
                                </tr>
                                <tr>
                                    <td style="color: #666666; padding: 8px 0;">Amount:</td>
                                    <td style="color: #333333; font-weight: bold; text-align: right;">₦{{amount_formatted}}</td>
                                </tr>
                                <tr>
                                    <td style="color: #666666; padding: 8px 0;">Bank:</td>
                                    <td style="color: #333333; font-weight: bold; text-align: right;">{{bank_name}}</td>
                                </tr>
                                <tr>
                                    <td style="color: #666666; padding: 8px 0;">Account:</td>
                                    <td style="color: #333333; font-weight: bold; text-align: right;">****{{account_last4}}</td>
                                </tr>
                                <tr>
                                    <td style="color: #666666; padding: 8px 0;">Retry Count:</td>
                                    <td style="color: #333333; font-weight: bold; text-align: right;">{{retry_count}} / 3</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>

                <div style="padding: 20px; background-color: #fef2f2; border-radius: 8px; margin: 20px 0;">
                    <p style="color: #991b1b; font-size: 14px; margin: 0;">
                        <strong>Error:</strong> {{failure_reason}}
                    </p>
                </div>

                {{#if can_retry}}
                <p style="color: #666666; font-size: 16px; line-height: 1.6;">
                    The system will automatically retry this payout. If it continues to fail, please verify the vendor's bank details.
                </p>
                {{else}}
                <p style="color: #666666; font-size: 16px; line-height: 1.6;">
                    Maximum retry attempts reached. Please manually process this payout or contact the vendor to verify their bank details.
                </p>
                {{/if}}
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
