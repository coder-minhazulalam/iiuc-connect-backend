const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

async function sendRegistrationEmail(toEmail, userName, registrationNumber) {
  const mailOptions = {
    from: `"IIUC Connect" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: "Registration Successful - IIUC Connect",
    html: `
      <div style="font-family: Arial, sans-serif; background:#000; color:#fff; padding:32px; border-radius:12px; max-width:600px; margin:auto;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
          <h2 style="margin:0; color:#fff;">IIUC Connect</h2>
          <span style="background:#00c46a; color:#000; padding:4px 14px; border-radius:20px; font-size:13px; font-weight:bold;">Registration Successful</span>
        </div>
        <p style="font-weight:bold; font-size:16px;">Welcome to IIUC Connect!</p>
        <p>Dear ${userName},</p>
        <p>Your registration has been completed successfully.</p>
        <p>Your unique registration number is:</p>
        <div style="text-align:center; margin:28px 0;">
          <p style="font-size:11px; letter-spacing:2px; color:#aaa; text-transform:uppercase; margin-bottom:8px;">YOUR REGISTRATION NUMBER</p>
          <h1 style="color:#00c46a; font-size:28px; letter-spacing:2px; margin:0;">${registrationNumber}</h1>
        </div>
        <p>Please keep this number safe. You can use it for future identification and communication.</p>
        <p>Regards,</p>
        <p><strong>IIUC Connect Team</strong></p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendRegistrationEmail };
