# Quiz App Setup Guide

## Environment Variables Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://Nazirhussain:fonbaLMZjEP4ARWL@cluster0.lkomkrd.mongodb.net/quizapp?retryWrites=true&w=majority

# JWT Secret (generate a secure random string)
JWT_SECRET=your-secure-random-string-here

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=another-secure-random-string
```

## Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   npm install bcryptjs jose
   ```

2. **Create Environment File**
   ```bash
   cp .env.local.example .env.local
   ```
   Then edit `.env.local` with your actual credentials.

3. **Generate Secure Secrets**
   You can generate secure random strings for JWT_SECRET and NEXTAUTH_SECRET:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

4. **Seed the Database** (Optional)
   ```bash
   # Start the dev server
   npm run dev
   
   # In another terminal, seed the database
   curl -X POST http://localhost:3000/api/seed
   ```

5. **Run the Application**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## Database Collections

The app uses the following MongoDB collections:

- `users` - User accounts (email, password, userName)
- `questions` - Quiz questions
- `results` - Quiz results linked to users

## First User Setup

1. Navigate to `/login`
2. Click "Sign Up"
3. Create your account
4. Login with your credentials

## Admin Access

After logging in, you can access:
- Admin Panel: `/admin`
- Analytics: (to be implemented)

## Security Notes

⚠️ **IMPORTANT**: 
- Never commit `.env.local` to version control
- Change JWT_SECRET and NEXTAUTH_SECRET in production
- Use strong, unique passwords
- Enable MongoDB IP whitelist in production

## Deployment to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `NEXTAUTH_URL` (your production URL)
   - `NEXTAUTH_SECRET`

4. Deploy!

## Troubleshooting

**MongoDB Connection Issues:**
- Verify your IP is whitelisted in MongoDB Atlas
- Check credentials are correct
- Ensure database name is `quizapp`

**Authentication Issues:**
- Clear browser cookies
- Verify JWT_SECRET is set
- Check token expiration (7 days default)

**Build Errors:**
- Run `npm install` to ensure all dependencies are installed
- Check Node.js version (20+ recommended)
