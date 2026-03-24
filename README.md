# 🎯 Quiz App

A modern, production-ready quiz application built with Next.js 16 and React 19. Features adaptive difficulty, real-time analytics, custom quiz creation, and a global leaderboard system powered by MongoDB Atlas.

## ✨ Features

### Quiz Modes
- **Regular Mode**: 10 questions with 30-second timer per question
- **Exam Mode**: 30 questions with 30-minute total timer
- **Custom Quizzes**: Create and share your own quizzes

### Smart Learning
- Adaptive difficulty system that adjusts based on performance
- 100+ questions across 5 subjects (Mathematics, Physics, Chemistry, Biology, Computer Science)
- Three difficulty levels: Easy, Medium, Hard

### User Features
- Secure JWT-based authentication
- Personal analytics dashboard with visual charts
- Performance tracking by subject and difficulty
- Global leaderboard with filtering options

### Admin Panel
- Complete question management (CRUD operations)
- Filter by category, subject, and difficulty
- Real-time statistics

### Modern UI/UX
- Fully responsive design (mobile, tablet, desktop)
- Dark mode support
- Smooth animations with Framer Motion
- Sound effects for interactions
- Accessibility compliant

## 🛠 Tech Stack

### Frontend
- Next.js 16 (App Router)
- React 19
- Bootstrap 5.3.8
- Tailwind CSS 4
- Framer Motion 12
- Chart.js 4.5 with react-chartjs-2

### Backend
- MongoDB Atlas
- JWT Authentication (jose library)
- bcryptjs for password hashing

### State Management
- Redux Toolkit
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
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/quizapp?retryWrites=true&w=majority
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

5. Seed the database (optional):
Visit `http://localhost:3000/api/seed` in your browser

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB Atlas connection string | Yes |
| `JWT_SECRET` | Secret for JWT token signing (32+ chars) | Yes |
| `NEXTAUTH_URL` | Application URL | Yes |
| `NEXTAUTH_SECRET` | Secret for session encryption (32+ chars) | Yes |
| `NEXT_PUBLIC_APP_NAME` | Application name | No |

### MongoDB Setup
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string: Connect → Connect your application
4. Replace `<password>` with your database password
5. Set database name to `quizapp`
6. Whitelist IP: 0.0.0.0/0 (for Vercel deployment)

## 📁 Project Structure

```
quiz-app/
├── app/
│   ├── admin/              # Admin panel
│   ├── analytics/          # User analytics
│   ├── api/                # API routes
│   │   ├── admin/         # Admin endpoints
│   │   ├── auth/          # Authentication
│   │   ├── custom-quizzes/
│   │   ├── questions/
│   │   ├── results/
│   │   └── seed/
│   ├── components/         # React components
│   ├── contexts/           # Context providers
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Utilities
│   │   ├── models/        # MongoDB models
│   │   └── seed/          # Seed data
│   ├── services/           # Business logic
│   └── store/              # Redux store
├── public/sounds/          # Audio files
├── scripts/                # Utility scripts
├── .env.local.example      # Env template
└── package.json
```

## � API Documentation

### Authentication
- `POST /api/auth/signup` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Questions
- `GET /api/questions` - Fetch questions (filterable)
- `GET /api/questions/categories` - Get categories
- `GET /api/questions/subjects` - Get subjects

### Results
- `POST /api/results` - Save quiz result
- `GET /api/results` - Fetch results

### Custom Quizzes
- `GET /api/custom-quizzes` - List user quizzes
- `POST /api/custom-quizzes` - Create quiz
- `GET /api/custom-quizzes/[id]` - Get quiz
- `DELETE /api/custom-quizzes?id=[id]` - Delete quiz

### Admin (Protected)
- `GET /api/admin/questions` - List all questions
- `POST /api/admin/questions` - Add question
- `PUT /api/admin/questions` - Update question
- `DELETE /api/admin/questions?id=[id]` - Delete question
- `GET /api/admin/analytics` - Admin analytics

### Analytics
- `GET /api/analytics` - User analytics data

### Utility
- `POST /api/seed` - Seed database

## 🗄 Database Schema

### users
```javascript
{
  email: String,
  password: String (hashed),
  userName: String,
  role: String (student|admin),
  createdAt: Date,
  updatedAt: Date
}
```

### questions
```javascript
{
  category: String,
  subject: String,
  topic: String,
  difficulty: String (easy|medium|hard),
  question: String,
  options: [String],
  correctAnswer: String,
  createdAt: Date,
  updatedAt: Date
}
```

### results
```javascript
{
  userId: String,
  name: String,
  category: String,
  subject: String,
  score: Number,
  totalQuestions: Number,
  difficulty: String,
  timeTaken: Number,
  examMode: Boolean,
  customQuizId: String,
  createdAt: Date
}
```

### customQuizzes
```javascript
{
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
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run make-admin   # Make user admin (requires email)
npm run list-users   # List all users
```

### Admin Scripts

Make a user admin:
```bash
npm run make-admin user@example.com
```

List all users:
```bash
npm run list-users
```

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
   
   Add all variables from `.env.local.example` in:
   Vercel Dashboard → Project Settings → Environment Variables

4. Deploy and update `NEXTAUTH_URL` with your Vercel URL

### Post-Deployment

1. Seed database: Visit `https://your-app.vercel.app/api/seed`
2. Create admin user:
   ```bash
   npm run make-admin your-email@example.com
   ```

### Troubleshooting

- Verify all env variables in Vercel
- MongoDB Atlas: Whitelist 0.0.0.0/0
- Test build locally: `npm run build`

## 🤝 Contributing

Contributions welcome! Fork the repository, create a feature branch, and submit a PR.

## 📝 License

MIT License

---

Built with Next.js 16 and React 19 | Production-ready
