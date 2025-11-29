// utils/sendEmail.js
const nodemailer = require('nodemailer');

const sendWelcomeEmail = async (toEmail, name, username, password) => {
  try {
    // Create transporter (CORRECTED: createTransport, not createTransporter)
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Your 16-digit App Password
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: toEmail,
      subject: "Welcome to Mittsure – Your Login Credentials",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #f9f9f9;">
          <h2 style="color: #1976d2; text-align: center;">Welcome to Mittsure Technologies!</h2>
          <p>Dear <strong>${name}</strong>,</p>
          <p>Your account has been successfully created. You can now log in to the Mittsure Sales Portal using the credentials below:</p>

          <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 5px solid #1976d2;">
            <p style="margin: 10px 0;"><strong>Username:</strong> <span style="font-size:18px; color:#1976d2;">${username}</span></p>
            <p style="margin: 10px 0;"><strong>Password:</strong> <span style="font-size:18px; color:#d32f2f; font-family: monospace;">${password}</span></p>
          </div>

          <p><a href="https://your-sales-portal.com/login" style="background:#1976d2; color:white; padding:12px 30px; text-decoration:none; border-radius:8px; display:inline-block; font-weight:bold;">
            Login Now
          </a></p>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 13px;">
            This is an automated message. Please do not reply.<br>
            For support: contact admin@mittsure.com
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent successfully to ${toEmail}`);
    return { success: true };
  } catch (error) {
    console.error("❌ Email send failed:", error.message);
    // Don't throw — we don't want to block user creation if email fails
    return { success: false, error: error.message };
  }
};

module.exports = { sendWelcomeEmail };