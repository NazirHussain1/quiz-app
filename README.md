# 🎯 Quiz App - Pakistan Textbook Based

A modern, production-ready quiz application built with Next.js 16 and React 19. Features email verification, role-based access control, adaptive difficulty, real-time analytics, custom quiz creation, admin panel, and global leaderboard powered by MongoDB Atlas.

## ✨ Features

### Authentication & Security
- **Email Verification**: JWT-based email verification system (1-hour expiry)
- **Password Reset**: Secure password reset with email tokens
- **Role-Based Access Control (RBAC)**: 4 roles with granular permissions
  - Superadmin: Full system access
  - Admin: Manage users and questions
  - Moderator: Manage questions only
  - Student: Take quizzes only
- **Security Hardening**: Rate limiting, IP throttling, input validation with Zod
- **JWT Authentication**: Secure token-based authentication with httpOnly cookies

### Quiz Modes
- **Regular Mode**: 10 questions with 30-second timer per question
- **Exam Mode**: 30 questions with 30-minute total timer
- **Custom Quizzes**: Create and share your own quizzes

### Smart Learning
- Adaptive difficulty system that adjusts based on performance
- 70 Pakistan textbook-based questions across 7 subjects
- Three difficulty levels: Easy (Matric), Medium (FSC), Hard (Higher)

### Subjects
- Mathematics
- English
- Science
- Computer
- General Knowledge
- Islamic Studies
- Pakistan Studies

### User Features
- Secure JWT-based authentication with email verification
- Personal analytics dashboard with visual charts
- Performance tracking by subject and difficulty
- Global leaderboard with filtering options
- Sound effects for correct/wrong answers
- Responsive design for all devices

### Admin Panel
Complete admin dashboard with role-based access:
- **Dashboard**: Overview statistics and quick actions
- **Questions Management**: Full CRUD operations (Add, Edit, Delete)
  - Search questions by text
  - Filter by subject and difficulty
  - Pagination support (20 per page)
  - Color-coded difficulty levels
- **Users Management**: 
  - View all users with search
  - Change user roles (superadmin only)
  - Make users admin
  - Delete users
  - User statistics
- **Analytics**: 
  - Real-time charts and graphs
  - Subject performance tracking
  - Daily activity monitoring
  - Top performers leaderboard
  - Weak/Strong topics analysis
- **Settings**: System configuration options

### Modern UI/UX
- Fully responsive design (mobile, tablet, desktop)
- Smooth animations with Framer Motion
- Sound effects for interactions (correct/wrong/complete)
- Fixed bottom action bar for quiz navigation
- Adaptive options layout (2-column for short, 1-column for long)
- Color-coded feedback (dark green for correct, dark red for wrong)
- No scrolling required during quiz
- Role-based UI rendering

## 🛠 Tech Stack

### Frontend
- Next.js 16.1.7 (App Router with Turbopack)
- React 19.2.0
- Tailwind CSS 4.2.2
- Framer Motion 12.36.0
- Chart.js 4.5.1 with react-chartjs-2 5.3.1
- Lucide React (Icons)

### Backend
- MongoDB Atlas 7.1.0
- JWT Authentication (jose 6.2.1) with enhanced security
- bcryptjs 3.0.3 (12 salt rounds)
- Nodemailer 8.0.4 for email services
- Zod 4.3.6 for input validation
- Redis (ioredis 5.10.1) for caching
- Winston 3.19.0 for logging

### Security
- JWT with issuer/audience validation (32+ char secret required)
- Rate limiting with IP-based throttling
- Input validation and sanitization with Zod
- Password hashing with bcrypt (12 rounds)
- Sensitive data exclusion from queries
- XSS and NoSQL injection prevention

### State Management
- Redux Toolkit 2.11.2
- React Context API

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- MongoDB Atlas account
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd quiz-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials:
```env
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://username:password@cluster0.lkomkrd.mongodb.net/quizapp?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-secure-random-string-minimum-32-characters
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secure-random-string-minimum-32-characters

# Application
NEXT_PUBLIC_APP_NAME=Quiz App

# Email Configuration (for verification and password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
EMAIL_FROM=Quiz App <your-email@gmail.com>
```

Generate secure secrets:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

For Gmail App Password:
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification
3. Generate App Password at [App Passwords](https://myaccount.google.com/apppasswords)
4. Use the generated password in `EMAIL_PASSWORD`

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

5. Seed the database with 70 questions:
```bash
node scripts/seed70Questions.js
```

6. Create admin user:
```bash
npm run make-admin nh534392@gmail.com
```

Default admin credentials:
- Email: `nh534392@gmail.com`
- Password: `969797`
- Username: `NazirHussain`

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB Atlas connection string | Yes |
| `JWT_SECRET` | Secret for JWT token signing (32+ chars) | Yes |
| `NEXTAUTH_URL` | Application URL (http://localhost:3000 for dev) | Yes |
| `NEXTAUTH_SECRET` | Secret for session encryption (32+ chars) | Yes |
| `EMAIL_HOST` | SMTP server host (e.g., smtp.gmail.com) | Yes |
| `EMAIL_PORT` | SMTP server port (587 for TLS, 465 for SSL) | Yes |
| `EMAIL_USER` | Email account username | Yes |
| `EMAIL_PASSWORD` | Email account password or app password | Yes |
| `EMAIL_FROM` | From address for emails | Yes |
| `NEXT_PUBLIC_APP_NAME` | Application name | No |

### MongoDB Setup
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster (cluster0.lkomkrd.mongodb.net)
3. Get connection string: Connect → Connect your application
4. Replace `<password>` with your database password
5. Set database name to `quizapp`
6. Whitelist IP: 0.0.0.0/0 (for Vercel deployment)

## 📁 Project Structure

```
quiz-app/
├── app/
│   ├── admin/                    # Admin panel (RBAC protected)
│   │   ├── analytics/           # Admin analytics page
│   │   ├── components/          # AdminLayout component
│   │   ├── questions/           # Questions management
│   │   ├── settings/            # Settings page
│   │   ├── users/               # Users management
│   │   └── page.js              # Admin dashboard
│   ├── analytics/               # User analytics
│   ├── api/                     # API routes (thin controllers)
│   │   ├── admin/              # Admin endpoints (RBAC protected)
│   │   │   ├── analytics/      # Analytics data
│   │   │   ├── questions/      # Question CRUD
│   │   │   ├── roles/          # Role management
│   │   │   └── users/          # User management
│   │   ├── auth/               # Authentication
│   │   │   ├── forgot-password/  # Password reset request
│   │   │   ├── login/
│   │   │   ├── logout/
│   │   │   ├── me/
│   │   │   ├── reset-password/   # Password reset
│   │   │   ├── send-verification/ # Resend verification
│   │   │   ├── signup/
│   │   │   └── verify-email/     # Email verification
│   │   ├── custom-quizzes/     # Custom quiz endpoints
│   │   ├── questions/          # Question endpoints
│   │   │   ├── categories/
│   │   │   └── subjects/
│   │   ├── results/            # Quiz results
│   │   └── seed/               # Database seeding
│   ├── components/              # React components
│   │   ├── CategoryBadge.js
│   │   ├── Navbar.js
│   │   ├── QuestionDisplay.js
│   │   ├── QuizProgress.js
│   │   ├── QuizResults.js
│   │   ├── RBACGuard.js        # RBAC guard components
│   │   ├── SoundToggle.js
│   │   └── Timer.js
│   ├── contexts/                # Context providers
│   │   └── AuthContext.js
│   ├── create-quiz/             # Custom quiz creation
│   ├── custom-quiz/             # Custom quiz pages
│   ├── exam/                    # Exam mode
│   ├── forgot-password/         # Password reset request page
│   ├── hooks/                   # Custom hooks
│   │   ├── useLeaderboard.js
│   │   ├── useQuizState.js
│   │   ├── useRBAC.js          # RBAC hook
│   │   └── useTimer.js
│   ├── leaderboard/             # Global leaderboard
│   ├── lib/                     # Core utilities
│   │   ├── database/           # Database layer
│   │   │   ├── BaseRepository.js
│   │   │   ├── connection.js
│   │   │   └── schemas.js
│   │   ├── middleware/         # Middleware modules
│   │   │   ├── auth.js        # Authentication middleware
│   │   │   ├── rbac.js        # RBAC middleware
│   │   │   ├── utils.js       # Utility functions
│   │   │   └── index.js       # Centralized exports
│   │   ├── models/             # MongoDB models
│   │   │   └── Question.js
│   │   ├── seed/               # Seed data
│   │   │   ├── sampleQuestions.js
│   │   │   └── seedDatabase.js
│   │   ├── auth.js
│   │   ├── cache.js
│   │   ├── email.js            # Email service
│   │   ├── errorHandler.js
│   │   ├── jwt.js
│   │   ├── logger.js
│   │   ├── middleware.js       # Legacy exports (backward compatibility)
│   │   ├── rateLimit.js        # Rate limiting & IP throttling
│   │   ├── rbac.js             # RBAC configuration
│   │   ├── validation.js
│   │   └── zodSchemas.js       # Zod validation schemas
│   ├── login/                   # Login page
│   ├── my-quizzes/              # User's custom quizzes
│   ├── quiz/                    # Quiz mode
│   ├── reset-password/          # Password reset page
│   ├── services/                # Business logic layer
│   │   ├── adaptiveDifficultyService.js
│   │   ├── analyticsService.js      # Analytics business logic
│   │   ├── authService.js           # Auth business logic
│   │   ├── customQuizService.js     # Custom quiz business logic
│   │   ├── leaderboardService.js
│   │   ├── questionService.js       # Question business logic
│   │   ├── quizResultService.js     # Quiz result business logic
│   │   ├── storageService.js
│   │   └── userService.js           # User management business logic
│   ├── store/                   # Redux store
│   │   ├── slices/
│   │   │   ├── authSlice.js
│   │   │   └── uiSlice.js
│   │   ├── index.js
│   │   └── ReduxProvider.js
│   ├── subjects/                # Subject selection
│   ├── utils/                   # Utility functions
│   │   ├── shuffle.js
│   │   └── useSound.js
│   ├── verify-email/            # Email verification page
│   ├── globals.css
│   ├── layout.js
│   └── page.js                  # Home page
├── public/
│   └── sounds/                  # Audio files
│       ├── complete.mp3
│       ├── correct.mp3
│       └── wrong.mp3
├── scripts/                     # Utility scripts
│   ├── addEmailVerificationFields.js  # Migration script
│   ├── changeUserRole.js       # Change user role (RBAC)
│   ├── createAdmin.js          # Create admin user
│   ├── createIndexes.js        # Create DB indexes
│   ├── listUsers.js            # List all users
│   ├── makeAdmin.js            # Make user admin
│   ├── resetPassword.js        # Reset user password
│   ├── seed70Questions.js      # Seed 70 questions (10 per subject)
│   ├── seedProperQuestions.js  # Alternative seed script
│   └── updateUsername.js       # Update username
├── .env.local.example          # Environment template
├── .gitignore
├── CHANGELOG.md                # Version history & changes
├── PROJECT_DOCUMENTATION.md    # Complete documentation
├── SUMMARY.md                  # Quick reference guide
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## 🏗 Architecture

### Clean Architecture Pattern

The application follows a clean, layered architecture for better maintainability:

**API Routes (Controllers)** → **Services (Business Logic)** → **Database Layer**

#### Layers

1. **API Routes** (`app/api/**/route.js`)
   - Thin controllers handling HTTP requests/responses
   - Request validation and rate limiting
   - Minimal logic - delegates to services
   - Consistent error handling

2. **Services** (`app/services/`)
   - Business logic layer
   - Reusable across different routes
   - Independent of HTTP concerns
   - Easy to test and maintain
   
   Services:
   - `authService.js` - Authentication & authorization
   - `userService.js` - User management
   - `questionService.js` - Question CRUD operations
   - `quizResultService.js` - Quiz results & leaderboard
   - `customQuizService.js` - Custom quiz management
   - `analyticsService.js` - Analytics & statistics

3. **Middleware** (`app/lib/middleware/`)
   - Modular middleware components
   - `auth.js` - Authentication verification
   - `rbac.js` - Role-based access control
   - `utils.js` - Utility functions
   - `index.js` - Centralized exports

4. **Database Layer** (`app/lib/database/`)
   - Connection management
   - Schema definitions
   - Base repository pattern

### Benefits

- **Separation of Concerns**: Each layer has a single responsibility
- **Reusability**: Services can be used by multiple routes
- **Testability**: Business logic isolated from HTTP layer
- **Maintainability**: Changes in one layer don't affect others
- **Consistency**: Standardized patterns across the codebase

## 🔌 API Documentation

### Authentication
- `POST /api/auth/signup` - Register new user (sends verification email)
- `POST /api/auth/login` - Login user (requires verified email)
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/send-verification` - Resend verification email
- `POST /api/auth/verify-email` - Verify email with token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Questions
- `GET /api/questions` - Fetch questions (filterable by subject, difficulty, category)
- `GET /api/questions/categories` - Get all categories
- `GET /api/questions/subjects` - Get all subjects

### Results
- `POST /api/results` - Save quiz result
- `GET /api/results` - Fetch user results

### Custom Quizzes
- `GET /api/custom-quizzes` - List user's custom quizzes
- `POST /api/custom-quizzes` - Create new custom quiz
- `GET /api/custom-quizzes/[id]` - Get specific quiz
- `DELETE /api/custom-quizzes?id=[id]` - Delete custom quiz

### Admin (Protected - Role-Based)
- `GET /api/admin/questions` - List all questions (with pagination, search, filters)
- `POST /api/admin/questions` - Add new question (admin, moderator)
- `PUT /api/admin/questions` - Update existing question (admin, moderator)
- `DELETE /api/admin/questions?id=[id]` - Delete question (admin, moderator)
- `GET /api/admin/analytics` - Get admin analytics data (admin only)
- `GET /api/admin/users` - List all users (admin only)
- `POST /api/admin/roles` - Change user role (superadmin only)
- `POST /api/admin/users/make-admin` - Make user admin (admin only)
- `DELETE /api/admin/users/delete?id=[id]` - Delete user (admin only)

### Analytics
- `GET /api/analytics` - Get user analytics data

### Utility
- `POST /api/seed` - Seed database with sample data

## 🗄 Database Schema

### Indexes
The application uses comprehensive database indexes for optimal performance:
- **users**: email (unique), role, createdAt, verification/reset tokens
- **questions**: subject, category, difficulty, text search
- **results**: score, subject, difficulty, createdAt (for leaderboard)
- **customQuizzes**: userId, createdAt

Run `node scripts/createIndexes.js` to create all indexes.

### users
```javascript
{
  _id: ObjectId,
  email: String (unique, lowercase),
  password: String (hashed with bcrypt),
  userName: String,
  role: String (superadmin|admin|moderator|student),
  isVerified: Boolean (default: false),
  verificationToken: String (nullable),
  verificationTokenExpiry: Date (nullable),
  resetPasswordToken: String (nullable),
  resetPasswordExpiry: Date (nullable),
  createdAt: Date,
  updatedAt: Date
}
```

### questions
```javascript
{
  _id: ObjectId,
  category: String,
  subject: String (Mathematics|English|Science|Computer|General Knowledge|Islamic Studies|Pakistan Studies),
  topic: String,
  difficulty: String (easy|medium|hard),
  question: String (unique),
  options: [String] (4 options),
  correctAnswer: String (the correct option text),
  createdAt: Date,
  updatedAt: Date
}
```

### results
```javascript
{
  _id: ObjectId,
  userId: String,
  name: String,
  category: String,
  subject: String,
  score: Number,
  totalQuestions: Number,
  difficulty: String,
  timeTaken: Number (seconds),
  examMode: Boolean,
  customQuizId: String (optional),
  createdAt: Date
}
```

### customQuizzes
```javascript
{
  _id: ObjectId,
  userId: String,
  userName: String,
  title: String,
  description: String,
  subject: String,
  difficulty: String,
  questions: [{
    question: String,
    options: [String],
    correctAnswer: String
  }],
  isPublic: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## 📊 Scripts

```bash
# Development
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# User Management
npm run make-admin <email>      # Make user admin
npm run change-role <email> <role>  # Change user role (superadmin|admin|moderator|student)
npm run list-users              # List all users

# Database
node scripts/seed70Questions.js      # Seed 70 questions (10 per subject)
node scripts/createIndexes.js        # Create database indexes
node scripts/createAdmin.js          # Create admin user
node scripts/resetPassword.js        # Reset user password
node scripts/updateUsername.js       # Update username
node scripts/addEmailVerificationFields.js  # Add email verification fields (migration)
```

### Script Examples

Make a user admin:
```bash
npm run make-admin nh534392@gmail.com
```

Change user role:
```bash
npm run change-role user@example.com moderator
npm run change-role admin@example.com superadmin
```

List all users:
```bash
npm run list-users
```

Seed database with 70 questions:
```bash
node scripts/seed70Questions.js
```

Reset user password:
```bash
node scripts/resetPassword.js user@example.com newPassword123
```

## 🎮 Usage Guide

### For Students

1. **Sign Up**: Create account at `/login`
2. **Verify Email**: Check your email and click verification link
3. **Select Subject**: Choose from 7 subjects
4. **Choose Mode**: 
   - Regular Quiz (10 questions, 30s each)
   - Exam Mode (30 questions, 30 min total)
5. **Take Quiz**: Answer questions with fixed bottom action bar
6. **View Results**: See score, correct answers, and performance
7. **Check Analytics**: View personal statistics and charts
8. **Leaderboard**: Compare with other students
9. **Create Custom Quiz**: Make your own quizzes

### For Admins

1. **Login**: Use admin credentials
2. **Access Admin Panel**: Navigate to `/admin`
3. **Dashboard**: View overview statistics
4. **Manage Questions**: 
   - Add new questions at `/admin/questions`
   - Edit existing questions
   - Delete questions
   - Search and filter
5. **Manage Users**: 
   - View all users at `/admin/users`
   - Make users admin
   - Delete users
6. **View Analytics**: Check system-wide statistics at `/admin/analytics`
7. **Settings**: Configure system at `/admin/settings`

### For Superadmins

All admin features plus:
- **Change User Roles**: Promote/demote users to any role
- **Full System Control**: Access to all features and settings
- **Role Management**: Assign superadmin, admin, moderator, or student roles

## 🚀 Deployment

### Deploy to Vercel

1. Push to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

2. Deploy on Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel auto-detects Next.js

3. Set Environment Variables in Vercel:
   
   **IMPORTANT**: Add these in Vercel Dashboard → Project Settings → Environment Variables
   
   | Variable | Value | Required |
   |----------|-------|----------|
   | `MONGODB_URI` | Your MongoDB connection string | Yes |
   | `JWT_SECRET` | Generate with crypto (32+ chars) | Yes |
   | `NEXTAUTH_URL` | `https://your-app.vercel.app` | Yes |
   | `NEXTAUTH_SECRET` | Generate with crypto (32+ chars) | Yes |
   | `EMAIL_HOST` | `smtp.gmail.com` | Yes |
   | `EMAIL_PORT` | `587` | Yes |
   | `EMAIL_USER` | Your Gmail address | Yes |
   | `EMAIL_PASSWORD` | Gmail App Password | Yes |
   | `EMAIL_FROM` | `Quiz App <your-email@gmail.com>` | Yes |
   | `NEXT_PUBLIC_APP_NAME` | `Quiz App` | No |

   Generate secrets:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

4. Deploy
   - Click "Deploy"
   - Build will succeed
   - After deployment, update `NEXTAUTH_URL` with your actual Vercel URL

### MongoDB Atlas Setup for Vercel

1. Go to MongoDB Atlas → Network Access
2. Add IP Address: `0.0.0.0/0` (allows all IPs including Vercel)
3. Or add specific Vercel IP ranges from [Vercel documentation](https://vercel.com/docs/concepts/solutions/databases)

### Post-Deployment

1. Seed database: 
   ```bash
   node scripts/seed70Questions.js
   ```
   Or visit `https://your-app.vercel.app/api/seed`

2. Create admin user:
   ```bash
   npm run make-admin your-email@example.com
   ```

3. Test email verification:
   - Sign up with a new account
   - Check email for verification link
   - Verify email and login

### Troubleshooting

- **Build fails**: Check environment variables are set
- **Runtime MongoDB error**: Verify `MONGODB_URI` is correct in Vercel
- **Connection timeout**: Check MongoDB Atlas IP whitelist (0.0.0.0/0)
- **JWT errors**: Verify `JWT_SECRET` and `NEXTAUTH_SECRET` are set (32+ chars)
- **Email not sending**: Verify Gmail App Password and SMTP settings
- **Port issues**: App runs on port 3000 by default
- **Email verification not working**: Check `NEXTAUTH_URL` matches your domain

## 🎨 UI Features

### Quiz Interface
- Fixed/sticky bottom action bar (no scrolling needed)
- Adaptive options layout:
  - 2-column grid for short options
  - 1-column stack for long options
- Color-coded feedback:
  - Dark green for correct answers
  - Dark red for wrong answers
- Timer display at top
- Progress bar showing current question
- Sound effects (can be toggled)

### Admin Interface
- Modern dashboard with statistics cards
- Interactive charts and graphs
- Search and filter functionality
- Modal forms for add/edit operations
- Responsive tables with pagination
- Color-coded badges for categories

## 🤝 Contributing

Contributions welcome! 

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT License

## 👨‍💻 Author

Nazir Hussain
- Email: nh534392@gmail.com

---

Built with ❤️ using Next.js 16.1.7 and React 19.2.0 | Production-ready | Pakistan Textbook Based


## 🔒 Security Features

### Authentication & Authorization
- JWT with issuer/audience validation
- Minimum 32-character secret enforcement
- Email verification (1-hour token expiry)
- Password reset with secure tokens
- Role-Based Access Control with 4 roles
- bcrypt password hashing (12 rounds)
- Sensitive data exclusion from all queries

### Rate Limiting & Throttling
- IP-based throttling (max 5 requests/minute per IP)
- Login rate limiting (5 attempts/minute)
- Signup rate limiting (3 attempts/hour)
- API rate limiting with configurable limits
- Automatic cleanup to prevent memory leaks

### Input Validation
- Zod schema validation for all inputs
- Email, password, username validation
- MongoDB ObjectId validation
- Subject, difficulty, role validation
- XSS prevention through sanitization
- NoSQL injection prevention

### Security Headers
- CORS configuration
- Helmet security headers
- Content Security Policy (CSP)
- XSS protection headers

### Database Security
- MongoDB connection with authentication
- NoSQL injection prevention
- Parameterized queries
- Input sanitization

### Deployment Security
- Environment variable validation
- Secure secret generation
- IP whitelisting for MongoDB Atlas
- HTTPS enforcement in production

## 🎯 Key Features Summary

### For Students
✅ Email verification required
✅ Take quizzes with adaptive difficulty
✅ Track personal analytics
✅ Create custom quizzes
✅ View global leaderboard
✅ Sound effects and animations

### For Moderators
✅ All student features
✅ Manage questions (CRUD)
✅ Filter and search questions
✅ View question analytics

### For Admins
✅ All moderator features
✅ Manage users
✅ View system analytics
✅ Delete users
✅ Access admin dashboard

### For Superadmins
✅ All admin features
✅ Change user roles
✅ Full system control
✅ Role management

---

**Version**: 2.0.0 | **Status**: Production Ready | **Security**: Hardened | **Performance**: Optimized
