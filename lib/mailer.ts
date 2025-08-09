import nodemailer from 'nodemailer';

// Create a transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.GMAIL_ACC,
    pass: process.env.apppassword,
  },
});

const subject = 'Order Confirmation | AMTRONICS';
const emailContentTemplate = `
<div>
  <div>
    Dear [clientName]
  </div>
  <div>
  You've got great taste! We're thrilled you chose 
  <span>
  <a href='https://amtronics.co'>Amtronics</a>
  </span>
  .
  </div>
  <div>
  Your order,
  <span>
  <a href='https://amtronics.co/myorders'>[orderID]</a>
  </span>
  , is now under our care and is being processed by our crew.
  </div>
  <div>We'll notify you by email when your items are dispatched and ready for delivery. For precise delivery dates or to track and manage your order, please check your 'Order Summary'.</div>
  <a href='https://amtronics.co/myorders'>View Orders Summary</a>
 


</div>
`;
export const sendOrderConfirmationEmail = async (email: string, orderID: string, clientName: string) => {
  const mailOptions = {
    from: '"AMTRONICS" <noreply@amtronics.co>',
    to: email,
    subject,
    html: emailContentTemplate.replace('[orderID]', orderID).replace('[clientName]', clientName),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${email}`);
  } catch (error) {
    console.error(`Error sending email to ${email}: ${error}`);
  }
};

const cancelSubject = 'Order Cancellation Confirmation | AMTRONICS';
const cancelEmailContentTemplate = `
<div>
  <div>
    Dear [clientName]
  </div>
  <div>
    We've successfully processed your cancellation request for order 
    <span>
      <a href='https://amtronics.co/myorders'>[orderID]</a>
    </span>
    .
  </div>
  <div>
    Your order has been canceled and all product quantities have been restored to our inventory. 
    If you made any payment, we will process your refund within 3-5 business days.
  </div>
  <div>
    If you have any questions about this cancellation or need assistance with a new order, 
    please don't hesitate to contact our support team.
  </div>
  <div style="margin-top: 20px;">
    <a href='https://amtronics.co/products' style="background-color: #00B8DB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
      Continue Shopping
    </a>
  </div>
  <div style="margin-top: 20px;">
    <a href='https://amtronics.co/myorders'>View All Orders</a>
  </div>
</div>
`;

export const sendOrderCancellationEmail = async (email: string, orderID: string, clientName: string) => {
  const mailOptions = {
    from: '"AMTRONICS" <noreply@amtronics.co>',
    to: email,
    subject: cancelSubject,
    html: cancelEmailContentTemplate.replace('[orderID]', orderID).replace('[clientName]', clientName),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Cancellation email sent to ${email}`);
  } catch (error) {
    console.error(`Error sending cancellation email to ${email}: ${error}`);
  }
};