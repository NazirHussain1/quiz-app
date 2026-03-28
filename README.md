# 🎯 Quiz App - Pakistan Textbook Based

A modern, production-ready quiz application built with Next.js 16 and React 19. Features adaptive difficulty, real-time analytics, custom quiz creation, admin panel, and a global leaderboard system powered by MongoDB Atlas.

## ✨ Features

### Quiz Modes
- **Regular Mode**: 10 questions with 30-second timer per question
- **Exam Mode**: 30 questions with 30-minute total timer
- **Custom Quizzes**: Create and share your own quizzes

### Smart Learning
- Adaptive difficulty system that adjusts based on performance
- 70+ Pakistan textbook-based questions across 7 subjects
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
- Secure JWT-based authentication
- Personal analytics dashboard with visual charts
- Performance tracking by subject and difficulty
- Global leaderboard with filtering options
- Sound effects for correct/wrong answers
- Responsive design for all devices

### Admin Panel
Complete admin dashboard with:
- **Dashboard**: Overview statistics and quick actions
- **Questions Management**: Full CRUD operations (Add, Edit, Delete)
  - Search questions by text
  - Filter by subject and difficulty
  - Pagination support (20 per page)
  - Color-coded difficulty levels
- **Users Management**: 
  - View all users with search
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
- Accessibility compliant

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
- JWT Authentication (jose 6.2.1)
- bcryptjs 3.0.3 for password hashing

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
MONGODB_URI=mongodb+srv://username:password@cluster0.lkomkrd.mongodb.net/quizapp?retryWrites=true&w=majority
JWT_SECRET=your-secure-random-string-minimum-32-characters
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secure-random-string-minimum-32-characters
NEXT_PUBLIC_APP_NAME=Quiz App
```

Generate secure secrets:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

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
│   ├── admin/                    # Admin panel
│   │   ├── analytics/           # Admin analytics page
│   │   ├── components/          # AdminLayout component
│   │   ├── questions/           # Questions management (NEW)
│   │   ├── settings/            # Settings page
│   │   ├── users/               # Users management
│   │   └── page.js              # Admin dashboard
│   ├── analytics/               # User analytics
│   ├── api/                     # API routes
│   │   ├── admin/              # Admin endpoints
│   │   │   ├── analytics/      # Analytics data
│   │   │   ├── questions/      # Question CRUD
│   │   │   └── users/          # User management
│   │   ├── auth/               # Authentication
│   │   │   ├── login/
│   │   │   ├── logout/
│   │   │   ├── me/
│   │   │   └── signup/
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
│   │   ├── SoundToggle.js
│   │   └── Timer.js
│   ├── contexts/                # Context providers
│   │   └── AuthContext.js
│   ├── create-quiz/             # Custom quiz creation
│   ├── custom-quiz/             # Custom quiz pages
│   ├── exam/                    # Exam mode
│   ├── hooks/                   # Custom hooks
│   │   ├── useLeaderboard.js
│   │   ├── useQuizState.js
│   │   └── useTimer.js
│   ├── leaderboard/             # Global leaderboard
│   ├── lib/                     # Utilities
│   │   ├── models/             # MongoDB models
│   │   │   └── Question.js
│   │   ├── seed/               # Seed data
│   │   │   ├── sampleQuestions.js
│   │   │   └── seedDatabase.js
│   │   ├── apiResponse.js
│   │   ├── auth.js
│   │   ├── authMiddleware.js
│   │   ├── jwt.js
│   │   ├── mongodb.js
│   │   ├── rateLimit.js
│   │   └── validation.js
│   ├── login/                   # Login page
│   ├── my-quizzes/              # User's custom quizzes
│   ├── quiz/                    # Quiz mode
│   ├── services/                # Business logic
│   │   ├── adaptiveDifficultyService.js
│   │   ├── leaderboardService.js
│   │   ├── quizService.js
│   │   └── storageService.js
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
│   ├── globals.css
│   ├── layout.js
│   └── page.js                  # Home page
├── public/
│   └── sounds/                  # Audio files
│       ├── complete.mp3
│       ├── correct.mp3
│       └── wrong.mp3
├── scripts/                     # Utility scripts
│   ├── createAdmin.js          # Create admin user
│   ├── createIndexes.js        # Create DB indexes
│   ├── listUsers.js            # List all users
│   ├── makeAdmin.js            # Make user admin
│   ├── resetPassword.js        # Reset user password
│   ├── seed70Questions.js      # Seed 70 questions (10 per subject)
│   └── updateUsername.js       # Update username
├── .env.local.example          # Environment template
├── .gitignore
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## 🔌 API Documentation

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user info

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

### Admin (Protected - Admin Only)
- `GET /api/admin/questions` - List all questions (with pagination, search, filters)
- `POST /api/admin/questions` - Add new question
- `PUT /api/admin/questions` - Update existing question
- `DELETE /api/admin/questions?id=[id]` - Delete question
- `GET /api/admin/analytics` - Get admin analytics data
- `GET /api/admin/users` - List all users
- `POST /api/admin/users/make-admin` - Make user admin
- `DELETE /api/admin/users/delete?id=[id]` - Delete user

### Analytics
- `GET /api/analytics` - Get user analytics data

### Utility
- `POST /api/seed` - Seed database with sample data

## 🗄 Database Schema

### users
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed with bcrypt),
  userName: String,
  role: String (student|admin),
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
  correctAnswer: Number (0-3 index),
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
    correctAnswer: Number
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
npm run make-admin   # Make user admin (requires email)
npm run list-users   # List all users

# Database
node scripts/seed70Questions.js      # Seed 70 questions (10 per subject)
node scripts/createIndexes.js        # Create database indexes
node scripts/createAdmin.js          # Create admin user
node scripts/resetPassword.js        # Reset user password
node scripts/updateUsername.js       # Update username
```

### Admin Scripts Examples

Make a user admin:
```bash
npm run make-admin nh534392@gmail.com
```

List all users:
```bash
npm run list-users
```

Seed database with 70 questions:
```bash
node scripts/seed70Questions.js
```

## 🎮 Usage Guide

### For Students

1. **Sign Up**: Create account at `/login`
2. **Select Subject**: Choose from 7 subjects
3. **Choose Mode**: 
   - Regular Quiz (10 questions, 30s each)
   - Exam Mode (30 questions, 30 min total)
4. **Take Quiz**: Answer questions with fixed bottom action bar
5. **View Results**: See score, correct answers, and performance
6. **Check Analytics**: View personal statistics and charts
7. **Leaderboard**: Compare with other students
8. **Create Custom Quiz**: Make your own quizzes

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

### Troubleshooting

- **Build fails**: Check environment variables are set
- **Runtime MongoDB error**: Verify `MONGODB_URI` is correct in Vercel
- **Connection timeout**: Check MongoDB Atlas IP whitelist (0.0.0.0/0)
- **JWT errors**: Verify `JWT_SECRET` and `NEXTAUTH_SECRET` are set (32+ chars)
- **Port issues**: App runs on port 3000 by default

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
