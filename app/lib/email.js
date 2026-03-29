import nml, text } = emailTemplates.verification(verificationUrl, userName);
  
  return await sendEmail({
    to: email,
    subject,
    html,
    text,
  });
}

// Send password reset email
export async function sendPasswordResetEmail(email, userName, token) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
  const { subject, html, text } = emailTemplates.passwordReset(resetUrl, userName);
  
  return await sendEmail({
    to: email,
    subject,
    html,
    text,
  });
}
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
  const { subject, ht Quiz App account.\n\nClick the link below to reset your password:\n\n${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request a password reset, please ignore this email.\n\nBest regards,\nQuiz App Team`,
  }),
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
   lign: center; background-color: #f8f9fa; border-radius: 0 0 8px 8px;">
                      <p style="margin: 0; font-size: 14px; color: #666666;">
                        © ${new Date().getFullYear()} Quiz App. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
    text: `Hi ${userName},\n\nWe received a request to reset your password for your       </p>
                        <p style="margin: 0; font-size: 14px; line-height: 20px; color: #856404;">
                          This link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact support if you have concerns.
                        </p>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; text-agin: 0 0 20px 0; font-size: 14px; line-height: 20px; color: #f5576c; word-break: break-all;">
                        ${resetUrl}
                      </p>
                      
                      <div style="margin: 30px 0 0 0; padding: 20px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                        <p style="margin: 0 0 10px 0; font-size: 14px; line-height: 20px; color: #856404;">
                          <strong>⚠️ Security Notice:</strong>
                 ont-weight: bold; color: #ffffff; text-decoration: none; border-radius: 6px;">
                              Reset Password
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 30px 0 20px 0; font-size: 14px; line-height: 20px; color: #666666;">
                        Or copy and paste this link into your browser:
                      </p>
                      <p style="mar                   Click the button below to reset your password:
                      </p>
                      
                      <!-- Button -->
                      <table role="presentation" style="margin: 0 auto;">
                        <tr>
                          <td style="border-radius: 6px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                            <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 16px 40px; font-size: 16px; f      <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #333333;">
                        Hi <strong>${userName}</strong>,
                      </p>
                      <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #333333;">
                        We received a request to reset your password for your Quiz App account.
                      </p>
                      <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 24px; color: #333333;">
     td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 8px 8px 0 0;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                        🔐 Reset Your Password
                      </h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                dy style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <g the link below:\n\n${verificationUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't create an account, please ignore this email.\n\nBest regards,\nQuiz App Team`,
  }),

  passwordReset: (resetUrl, userName) => ({
    subject: 'Reset Your Password - Quiz App',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <bolor: #f8f9fa; border-radius: 0 0 8px 8px;">
                      <p style="margin: 0; font-size: 14px; color: #666666;">
                        © ${new Date().getFullYear()} Quiz App. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
    text: `Hi ${userName},\n\nThank you for signing up for Quiz App! Please verify your email address by clickinote:</strong> This link will expire in 1 hour for security reasons.
                      </p>
                      <p style="margin: 10px 0 0 0; font-size: 14px; line-height: 20px; color: #999999;">
                        If you didn't create an account, please ignore this email.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; text-align: center; background-co6666;">
                        Or copy and paste this link into your browser:
                      </p>
                      <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 20px; color: #667eea; word-break: break-all;">
                        ${verificationUrl}
                      </p>
                      
                      <p style="margin: 30px 0 0 0; font-size: 14px; line-height: 20px; color: #999999; border-top: 1px solid #eeeeee; padding-top: 20px;">
                        <strong>N                   <a href="${verificationUrl}" target="_blank" style="display: inline-block; padding: 16px 40px; font-size: 16px; font-weight: bold; color: #ffffff; text-decoration: none; border-radius: 6px;">
                              Verify Email Address
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 30px 0 20px 0; font-size: 14px; line-height: 20px; color: #66              </p>
                      <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 24px; color: #333333;">
                        Click the button below to verify your email:
                      </p>
                      
                      <!-- Button -->
                      <table role="presentation" style="margin: 0 auto;">
                        <tr>
                          <td style="border-radius: 6px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
             <tr>
                    <td style="padding: 40px;">
                      <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #333333;">
                        Hi <strong>${userName}</strong>,
                      </p>
                      <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #333333;">
                        Thank you for signing up for Quiz App! To complete your registration and start taking quizzes, please verify your email address.
          <!-- Content -->
              h1>
                    </td>
                  </tr>
                  
                📧 Verify Your Email
                      </d;">
                        >
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: boll - Quiz App',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;";

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Email templates
export const emailTemplates = {
  verification: (verificationUrl, userName) => ({
    subject: 'Verify Your Emaiodemailer from 'nodemailer'