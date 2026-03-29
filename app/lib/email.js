import nodemailer from 'nodemailer';

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_PORT === '465',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Send email function
export async function sendEmail({ to, subject, html, text }) {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
      text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

// Send verification email
export async function sendVerificationEmail(email, userName, token) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;
  
  const subject = 'Verify Your Email - Quiz App';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #667eea;">Verify Your Email</h2>
      <p>Hi <strong>${userName}</strong>,</p>
      <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
      <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">Verify Email</a>
      <p>Or copy this link: ${verificationUrl}</p>
      <p><small>This link expires in 1 hour.</small></p>
    </div>
  `;
  const text = `Hi ${userName},\n\nVerify your email: ${verificationUrl}\n\nThis link expires in 1 hour.`;
  
  return await sendEmail({ to: email, subject, html, text });
}

// Send password reset email
export async function sendPasswordResetEmail(email, userName, token) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
  
  const subject = 'Reset Your Password - Quiz App';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f5576c;">Reset Your Password</h2>
      <p>Hi <strong>${userName}</strong>,</p>
      <p>We received a request to reset your password. Click the button below:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #f5576c; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">Reset Password</a>
      <p>Or copy this link: ${resetUrl}</p>
      <p><small>This link expires in 1 hour. If you didn't request this, ignore this email.</small></p>
    </div>
  `;
  const text = `Hi ${userName},\n\nReset your password: ${resetUrl}\n\nThis link expires in 1 hour.`;
  
  return await sendEmail({ to: email, subject, html, text });
}
