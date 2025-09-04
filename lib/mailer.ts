import axios from "axios";

export async function sendOrderConfirmationEmailWithInvoice(
  recipient: string,
  invoiceNumber: string,
  customerName?: string,
  amount?: number
): Promise<{ success: boolean; error?: any }> {
  try {
    // Log input parameters and environment variables
    console.log("sendOrderConfirmationEmailWithInvoice - Input:", {
      recipient,
      invoiceNumber,
      customerName,
      amount,
      M365_TENANT_ID: process.env.M365_TENANT_ID,
      M365_CLIENT_ID: process.env.M365_CLIENT_ID,
      M365_CLIENT_SECRET: process.env.M365_CLIENT_SECRET ? "[REDACTED]" : undefined,
      M365_ACC: process.env.M365_ACC,
    });

    // Obtain access token
    const tokenResponse = await axios.post(
      `https://login.microsoftonline.com/${process.env.M365_TENANT_ID}/oauth2/v2.0/token`,
      new URLSearchParams({
        client_id: process.env.M365_CLIENT_ID as string,
        client_secret: process.env.M365_CLIENT_SECRET as string,
        grant_type: "client_credentials",
        scope: "https://graph.microsoft.com/.default",
      }).toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const accessToken: string = tokenResponse.data.access_token;
console.log("sendOrderConfirmationEmailWithInvoice - Access Token:", accessToken ? "[REDACTED]" : undefined);

    // Create HTML email content
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
        <h2>Invoice Confirmation</h2>
        <p>Dear ${customerName || "Customer"},</p>
        <p>Thank you for your purchase. Your invoice details are below:</p>
        <ul>
          <li><strong>Invoice #:</strong> ${invoiceNumber}</li>
          ${amount !== undefined ? `<li><strong>Amount:</strong> $${amount.toFixed(2)}</li>` : ""}
        </ul>
        <p>For inquiries, contact us at <a href="mailto:support@amtronics.co">support@amtronics.co</a>.</p>
        <br/>
        <p>Best regards,<br/>AMTRONICS Team</p>
      </div>
    `;

    // Prepare Graph API payload
    const payload = {
      message: {
        subject: `Invoice #${invoiceNumber} | AMTRONICS`,
        body: { contentType: "HTML", content: htmlContent },
        toRecipients: [{ emailAddress: { address: recipient } }],
      },
      saveToSentItems: true,
    };
console.log("sendOrderConfirmationEmailWithInvoice - Graph API Request:", {
  url: `https://graph.microsoft.com/v1.0/users/${process.env.M365_ACC}/sendMail`,
  payload,
});
    // Send email via Microsoft Graph
    await axios.post(
      `https://graph.microsoft.com/v1.0/users/${process.env.M365_ACC}/sendMail`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return { success: true };
  } catch (error: any) {
    console.error("Mailer error:", error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
}

export async function sendOrderCancellationEmail(
  recipient: string,
  orderId: string,
  customerName?: string,
  amount?: number
): Promise<{ success: boolean; error?: any }> {
  try {
     console.log("sendOrderCancellationEmail - Input:", {
      recipient,
      orderId,
      customerName,
      amount,
      M365_TENANT_ID: process.env.M365_TENANT_ID,
      M365_CLIENT_ID: process.env.M365_CLIENT_ID,
      M365_CLIENT_SECRET: process.env.M365_CLIENT_SECRET ? "[REDACTED]" : undefined,
      M365_ACC: process.env.M365_ACC,
    });
    // Obtain access token
    const tokenResponse = await axios.post(
      `https://login.microsoftonline.com/${process.env.M365_TENANT_ID}/oauth2/v2.0/token`,
      new URLSearchParams({
        client_id: process.env.M365_CLIENT_ID as string,
        client_secret: process.env.M365_CLIENT_SECRET as string,
        grant_type: "client_credentials",
        scope: "https://graph.microsoft.com/.default",
      }).toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const accessToken: string = tokenResponse.data.access_token;
console.log("sendOrderCancellationEmail - Access Token:", accessToken ? "[REDACTED]" : undefined);
    // Create HTML email content
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">
        <h2>Order Cancellation</h2>
        <p>Dear ${customerName || "Customer"},</p>
        <p>Your order <strong>#${orderId}</strong> has been <span style="color: #e53e3e;">canceled</span> as requested.</p>
        ${amount !== undefined ? `<p><strong>Amount Refunded:</strong> $${amount.toFixed(2)}</p>` : ""}
        <p>For inquiries, contact us at <a href="mailto:business@amtronics.co">business@amtronics.co</a>.</p>
        <br/>
        <p>Best regards,<br/>AMTRONICS Team</p>
      </div>
    `;

    // Prepare Graph API payload
    const payload = {
      message: {
        subject: `Order #${orderId} Cancellation | AMTRONICS`,
        body: { contentType: "HTML", content: htmlContent },
        toRecipients: [{ emailAddress: { address: recipient } }],
      },
      saveToSentItems: true,
    };

    // Send email via Microsoft Graph
    await axios.post(
      `https://graph.microsoft.com/v1.0/users/${process.env.M365_ACC}/sendMail`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return { success: true };
  } catch (error: any) {
    console.error("Mailer error:", error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
}

// export default {
//   sendOrderConfirmationEmailWithInvoice,
//   sendOrderCancellationEmail,
// };