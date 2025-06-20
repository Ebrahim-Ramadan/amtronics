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