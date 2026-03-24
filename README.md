# 🎯 Quiz App - Interactive Learning Platform

A production-ready quiz application built with Next.js 16, React 19, and MongoDB Atlas. Features adaptive difficulty, real-time analytics, custom quiz creation, and a global leaderboard system.

[![Next.js](https://img.shields.io/badge/Next.js-16.1.7-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.0-blue)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://www.mongodb.com/)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)

## ✨ Features

### 🎮 Quiz Modes
- Regular Mode: 10 questions, 30s per question
- Exam Mode: 30 questions, 30-minute timer
- Custom Quizzes: User-created with flexible settings

### 🧠 Smart Features
- Adaptive difficulty based on performance
- 100+ questions across 5 subjects (Math, Physics, Chemistry, Biology, CS)
- Real-time analytics with visual charts
- Global leaderboard with filtering
- Custom quiz creation and sharing

### 🔐 User System
- JWT-based authentication
- Secure password hashing
- Protected routes
- User analytics dashboard

### 👨‍💼 Admin Panel
- Question management (CRUD operations)
- Filter by category, subject, difficulty
- Real-time statistics

### 🎨 Modern UI
- Responsive design (mobile, tablet, desktop)
- Dark mode support
- Smooth animations (Framer Motion)
- Sound effects
- Accessibility compliant

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Styling**: Bootstrap 5.3.8, Tailwind CSS 4
- **Animations**: Framer Motion 12
- **Charts**: Chart.js 4.5, react-chartjs-2 5.3

### Backend
- **Database**: MongoDB Atlas
- **Authentication**: JWT with jose, bcryptjs
- **API**: Next.js API Routes

### Deployment
- **Platform**: Vercel
- **CI/CD**: Automatic deployments from Git

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- MongoDB Atlas account
- npm or yarn

### Installation

1. Clone and install:
   ```bash
   git clone <repository-url>
   cd quiz-app
   npm install
   ```

2. Configure environment:
   ```bash
   cp .env.local.example .env.local
   ```
   Edit `.env.local` with your credentials (see below)

3. Run development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

4. Seed database (optional):
   Visit `http://localhost:3000/api/seed` or:
   ```bash
   curl -X POST http://localhost:3000/api/seed
   ```

## 🔐 Environment Variables

Create `.env.local` in the root directory:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/quizapp?retryWrites=true&w=majority
JWT_SECRET=your-secure-random-string-minimum-32-characters
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secure-random-string-minimum-32-characters
NEXT_PUBLIC_APP_NAME=Quiz App
```

### Generate Secrets
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### MongoDB Setup
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create cluster → Connect → Get connection string
3. Replace `<password>` and set database to `quizapp`
4. Whitelist IP: 0.0.0.0/0 (for Vercel)

⚠️ Never commit `.env.local` - it's in `.gitignore`

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
   
   | Variable | Value |
   |----------|-------|
   | `MONGODB_URI` | Your MongoDB connection string |
   | `JWT_SECRET` | Generate with crypto (32+ chars) |
   | `NEXTAUTH_URL` | `https://your-app.vercel.app` |
   | `NEXTAUTH_SECRET` | Generate with crypto (32+ chars) |
   | `NEXT_PUBLIC_APP_NAME` | `Quiz App` |

4. Deploy and update `NEXTAUTH_URL` with actual Vercel URL

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

## 🔌 API Documentation

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
  isAdmin: Boolean,
  createdAt: Date
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
  createdAt: Date
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
  createdAt: Date
}
```

## 📊 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run make-admin   # Make user admin
npm run list-users   # List all users
```

## 🤝 Contributing

Contributions welcome! Fork, create a feature branch, and submit a PR.

---

Built with Next.js 16 and React 19 | Ready for production deployment
