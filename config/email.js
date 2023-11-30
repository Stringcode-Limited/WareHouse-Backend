import nodemailer from 'nodemailer';

export const sendSoldEmail = async (productName, total) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'noreply.jessitel@gmail.com',
        pass: 'poic kfbv hkgr cwqe',
      },
    });
    const email = 'ayehenz29@gmail.com';

    const mailOptions = {
      from: 'noreply.jessitel@gmail.com',
      to: email,
      subject: 'Products Sold - Invoice Details',
      text: `Hello Admin,\n\nYou have new sales! Here are the details:\n\n`,
      html: `<div style="font-family: 'Arial', sans-serif; color: #333; line-height: 1.6; background-color: #f4f4f4; padding: 20px; border-radius: 8px;">
                <p style="font-size: 18px; color: #333;">Hello,</p>
                <p style="font-size: 16px; color: #555;">You have new sales! Here are the details:</p>
                <ul style="list-style: none; padding: 0; margin-left: 20px;">
                  ${productName.map(product => `<li style="margin-bottom: 8px;"><strong>${product.productName}</strong> - Quantity: ${product.quantity}</li>`).join('')}
                </ul>
                <p style="margin-top: 20px; font-size: 16px; color: #555;"><strong>Total Amount:</strong> ₦${total}</p>
                <p style="font-size: 16px; color: #555;">Thank you for your dedication to Jessitel Stores.</p>
                <p style="font-size: 16px; color: #555;">Best Regards,<br/>Jessitel Stores Admin</p>
              </div>`,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
