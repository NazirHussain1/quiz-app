# Email Verification & Password Reset System

Complete implementation guide for the email verification and password reset system in Quiz App.

## Features

✅ JWT-based email verification (1-hour expiry)  
✅ Secure password reset flow  
✅ Production-ready email templates  
✅ Rate limiting on all endpoints  
✅ Prevent login for unverified users  
✅ Resend verification email functionality  
✅ Token expiry validation  
✅ Secure password hashing  

## Setup

### 1. Install Dependencies

```bash
npm install nodemailer
```

### 2. Configure Environment Variables

Add these to your `.env.local`:

```env
# Email Configuration (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=Quiz App <your-email@gmail.com>
```

#### Gmail Setup:
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Enable 2-Factor Authentication
3. Generate App Password: [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
4. Use the generated password in `EMAIL_PASSWORD`

#### Other Email Providers:
- **SendGrid**: Use API key as password
- **Mailgun**: Use SMTP credentials
- **AWS SES**: Configure SMTP settings

### 3. Run Database Migration

```bash
node scripts/addEmailVerificationFields.js
```

This adds the following fields to existing users:
- `isVerified` (boolean) - set to `true` for existing users
- `verificationToken` (string)
- `verificationTokenExpiry` (date)
- `resetPasswordToken` (string)
- `resetPasswordExpiry` (date)

## API Endpoints

### 1. Send Verification Email
```http
POST /api/auth/send-verification
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Verification email sent successfully"
}
```

### 2. Verify Email
```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "token": "jwt-token-here"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully! You can now login."
}
```

### 3. Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "If an account exists with this email, you will receive a password reset link."
}
```

### 4. Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "jwt-token-here",
  "password": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully! You can now login with your new password."
}
```

## Frontend Pages

### 1. Verify Email Page
**URL:** `/verify-email?token=xxx`

Features:
- Automatic verification on page load
- Success/error states with icons
- Resend verification email form
- Auto-redirect to login after success

### 2. Forgot Password Page
**URL:** `/forgot-password`

Features:
- Email input form
- Success confirmation screen
- Link to login page
- Rate limiting protection

### 3. Reset Password Page
**URL:** `/reset-password?token=xxx`

Features:
- New password input with validation
- Confirm password field
- Show/hide password toggle
- Token validation
- Success screen with auto-redirect

## User Flow

### Email Verification Flow

```
1. User signs up
   ↓
2. Account created (isVerified: false)
   ↓
3. Verification email sent automatically
   ↓
4. User clicks link in email
   ↓
5. Redirected to /verify-email?token=xxx
   ↓
6. Token verified, isVerified set to true
   ↓
7. User can now login
```

### Password Reset Flow

```
1. User clicks "Forgot Password" on login page
   ↓
2. Enters email on /forgot-password
   ↓
3. Reset email sent (if account exists)
   ↓
4. User clicks link in email
   ↓
5. Redirected to /reset-password?token=xxx
   ↓
6. Enters new password
   ↓
7. Password updated, tokens cleared
   ↓
8. User can login with new password
```

## Security Features

### 1. JWT Token Security
- Tokens expire in 1 hour
- Signed with `JWT_SECRET`
- Type validation (verification vs password-reset)
- Stored in database for validation

### 2. Rate Limiting
All endpoints are rate-limited to prevent abuse:
- Login: 5 attempts per 15 minutes
- Verification: 10 requests per hour
- Password reset: 5 requests per hour

### 3. Email Enumeration Prevention
- Forgot password always returns success
- Doesn't reveal if email exists
- Prevents account discovery

### 4. Password Security
- Minimum 6 characters
- Hashed with bcrypt
- Salted automatically
- Never stored in plain text

### 5. Token Validation
- Expiry time checked
- Token must match database
- One-time use (cleared after use)
- Type-specific validation

## Email Templates

### Verification Email
- Professional HTML design
- Gradient header
- Clear call-to-action button
- Plain text fallback
- Expiry notice

### Password Reset Email
- Security-focused design
- Warning about unauthorized requests
- Clear instructions
- Plain text fallback
- Expiry notice

## Testing

### Test Email Verification

1. Create a new account:
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","userName":"TestUser"}'
```

2. Check email for verification link

3. Click link or manually verify:
```bash
curl -X POST http://localhost:3000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"token":"your-token-here"}'
```

### Test Password Reset

1. Request reset:
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

2. Check email for reset link

3. Reset password:
```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"your-token-here","password":"newpass123"}'
```

## Troubleshooting

### Email Not Sending

1. **Check SMTP credentials:**
   ```bash
   node -e "console.log(process.env.EMAIL_USER, process.env.EMAIL_HOST)"
   ```

2. **Test SMTP connection:**
   ```javascript
   const nodemailer = require('nodemailer');
   const transporter = nodemailer.createTransporter({
     host: process.env.EMAIL_HOST,
     port: process.env.EMAIL_PORT,
     auth: {
       user: process.env.EMAIL_USER,
       pass: process.env.EMAIL_PASSWORD
     }
   });
   transporter.verify().then(console.log).catch(console.error);
   ```

3. **Check spam folder**

4. **Verify Gmail App Password** (if using Gmail)

### Token Expired

- Tokens expire in 1 hour
- User must request new verification/reset email
- Old tokens are automatically invalidated

### User Can't Login

1. Check if email is verified:
   ```bash
   node scripts/listUsers.js
   ```

2. Manually verify user:
   ```javascript
   db.users.updateOne(
     { email: "user@example.com" },
     { $set: { isVerified: true } }
   )
   ```

## Production Deployment

### Vercel Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=Quiz App <your-email@gmail.com>
```

### Update NEXTAUTH_URL

```
NEXTAUTH_URL=https://your-app.vercel.app
```

### Email Service Recommendations

For production, consider:
- **SendGrid** - 100 emails/day free
- **Mailgun** - 5,000 emails/month free
- **AWS SES** - Very cheap, requires verification
- **Resend** - Modern, developer-friendly

## File Structure

```
app/
├── api/auth/
│   ├── send-verification/route.js
│   ├── verify-email/route.js
│   ├── forgot-password/route.js
│   └── reset-password/route.js
├── lib/
│   └── email.js
├── verify-email/page.js
├── forgot-password/page.js
└── reset-password/page.js

scripts/
└── addEmailVerificationFields.js
```

## Support

For issues or questions:
1. Check server logs for email errors
2. Verify environment variables
3. Test SMTP connection
4. Check MongoDB for user verification status

---

Built with ❤️ for Quiz App | Production-Ready | Secure | Modular
