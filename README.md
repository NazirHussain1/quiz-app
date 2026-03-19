# 🎯 Quiz App - Interactive Learning Platform

A comprehensive, production-ready quiz application built with Next.js 16, React 19, and MongoDB Atlas. Features include adaptive difficulty, real-time analytics, custom quiz creation, and a global leaderboard system.

[![Next.js](https://img.shields.io/badge/Next.js-16.0.4-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.0-blue)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [Deployment](#-deployment)
- [API Routes](#-api-routes)
- [Database Schema](#-database-schema)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### Core Quiz Functionality
- **Multiple Quiz Modes**
  - Regular Mode: 10 questions with 15-second timer per question
  - Exam Mode: 30 questions with 30-minute total timer
  - Custom Quizzes: User-created quizzes with flexible settings

- **Adaptive Difficulty System**
  - Automatically adjusts question difficulty based on performance
  - Upgrades difficulty when score > 75%
  - Downgrades difficulty when score < 40%
  - Tracks performance history per subject

- **100+ Questions Database**
  - Mathematics, Physics, Chemistry, Biology, Computer Science
  - Three difficulty levels: Easy, Medium, Hard
  - Organized by category, subject, and topic

### User Features
- **Authentication System**
  - Secure JWT-based authentication
  - User registration and login
  - Password hashing with bcryptjs
  - Protected routes for authenticated users

- **Analytics Dashboard**
  - Visual charts showing performance trends
  - Score history line chart
  - Subject performance bar chart
  - Difficulty distribution doughnut chart
  - Weak areas identification (< 60%)
  - Strong areas highlighting (≥ 75%)

- **Global Leaderboard**
  - Top 50 scores worldwide
  - Filter by difficulty, category, and subject
  - Medal system for top 3 performers (🥇🥈🥉)
  - User rank highlighting
  - Real-time updates from MongoDB

- **Custom Quiz Creation**
  - Create quizzes manually or select from question pool
  - Public/private quiz options
  - Share quizzes with other users
  - Full CRUD operations

### Admin Features
- **Admin Panel**
  - Add, edit, and delete questions
  - Filter questions by category, subject, difficulty
  - Real-time question count
  - Protected with authentication

### UI/UX Features
- **Modern Interface**
  - Dark mode support
  - Responsive design (mobile, tablet, desktop)
  - Smooth animations with Framer Motion
  - Sound effects for interactions
  - Bootstrap 5 + Tailwind CSS styling

- **Accessibility**
  - ARIA labels for screen readers
  - Keyboard navigation support
  - High contrast colors
  - Semantic HTML

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

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ installed
- MongoDB Atlas account
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd quiz-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   Edit `.env.local` with your MongoDB credentials (see [Environment Variables](#-environment-variables))

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Seed Database (Optional)

After setting up your environment, you can seed the database with sample questions:

```bash
# Using the API endpoint
curl -X POST http://localhost:3000/api/seed
```

Or visit `http://localhost:3000/api/seed` in your browser.

## 🔐 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/quizapp?retryWrites=true&w=majority

# JWT Secret (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=your-secure-random-string-minimum-32-characters

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secure-random-string-minimum-32-characters

# Application Name (Optional)
NEXT_PUBLIC_APP_NAME=Quiz App
```

### Important Security Notes

⚠️ **NEVER commit `.env.local` to version control**

- The `.env.local` file contains sensitive credentials
- It is already included in `.gitignore`
- For production, set environment variables in your Vercel dashboard
- Generate strong, unique secrets for JWT_SECRET and NEXTAUTH_SECRET

### Getting MongoDB URI

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database password
6. Replace `<database>` with `quizapp`

## 📁 Project Structure

```
quiz-app/
├── app/
│   ├── admin/                 # Admin panel for question management
│   ├── analytics/             # User analytics dashboard
│   ├── api/
│   │   ├── admin/            # Admin API routes
│   │   ├── analytics/        # Analytics data API
│   │   ├── auth/             # Authentication endpoints
│   │   ├── custom-quizzes/   # Custom quiz CRUD
│   │   ├── questions/        # Question management
│   │   ├── results/          # Quiz results storage
│   │   └── seed/             # Database seeding
│   ├── components/           # Reusable React components
│   ├── contexts/             # React Context providers
│   ├── create-quiz/          # Quiz creation wizard
│   ├── custom-quiz/[id]/     # Take custom quiz
│   ├── exam/                 # Exam mode (30Q, 30min)
│   ├── hooks/                # Custom React hooks
│   ├── leaderboard/          # Global leaderboard
│   ├── lib/                  # Utilities and helpers
│   │   ├── auth.js          # Authentication helpers
│   │   ├── authMiddleware.js # JWT verification
│   │   ├── mongodb.js       # Database connection
│   │   └── seed/            # Seed data
│   ├── login/                # Login/Signup page
│   ├── my-quizzes/           # User's custom quizzes
│   ├── quiz/                 # Regular quiz mode
│   ├── services/             # Business logic layer
│   ├── subjects/             # Subject selection
│   └── utils/                # Helper functions
├── public/
│   └── sounds/               # Sound effect files
├── .env.local.example        # Environment variables template
├── .gitignore                # Git ignore rules
├── next.config.ts            # Next.js configuration
├── package.json              # Dependencies
└── README.md                 # This file
```

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Set Environment Variables**
   In Vercel dashboard → Project Settings → Environment Variables, add these **REQUIRED** variables:
   
   | Variable | Value | Description |
   |----------|-------|-------------|
   | `MONGODB_URI` | `mongodb+srv://username:password@cluster.mongodb.net/quizapp?retryWrites=true&w=majority` | Your MongoDB Atlas connection string |
   | `JWT_SECRET` | Random 32+ character string | For JWT token signing (generate with crypto) |
   | `NEXTAUTH_URL` | `https://your-app.vercel.app` | Your production URL (Vercel will provide this) |
   | `NEXTAUTH_SECRET` | Random 32+ character string | For NextAuth session encryption |
   | `NEXT_PUBLIC_APP_NAME` | `Quiz App` | Your application name (optional) |
   
   **How to generate secure secrets:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

4. **Deploy**
   - Click "Deploy"
   - Your app will be live in minutes!
   - After deployment, update `NEXTAUTH_URL` with your actual Vercel URL

### Post-Deployment Steps

1. **Update NEXTAUTH_URL**: After first deployment, go back to Environment Variables and update `NEXTAUTH_URL` with your actual Vercel URL (e.g., `https://quiz-app-xyz.vercel.app`)

2. **Seed Database**: Visit `https://your-app.vercel.app/api/seed` to populate sample questions

3. **Create Admin User**: 
   - Sign up for an account
   - Use the admin scripts locally to promote your user:
     ```bash
     npm run make-admin your-email@example.com
     ```

### Troubleshooting Deployment

If deployment fails, check:
- All environment variables are set correctly in Vercel
- MongoDB Atlas allows connections from anywhere (0.0.0.0/0) or Vercel IPs
- No syntax errors in code (`npm run build` succeeds locally)
- Next.js version is up to date (currently 16.1.7)

## 🔌 API Routes

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Questions
- `GET /api/questions` - Fetch questions (with filters)
- `POST /api/questions` - Create question
- `GET /api/questions/categories` - Get all categories
- `GET /api/questions/subjects` - Get all subjects

### Results
- `POST /api/results` - Save quiz result
- `GET /api/results` - Fetch results (with filters)

### Custom Quizzes
- `GET /api/custom-quizzes` - Get user's quizzes
- `POST /api/custom-quizzes` - Create custom quiz
- `GET /api/custom-quizzes/[id]` - Get specific quiz
- `DELETE /api/custom-quizzes?id=[id]` - Delete quiz

### Admin (Protected)
- `GET /api/admin/questions` - Get all questions
- `POST /api/admin/questions` - Add question
- `PUT /api/admin/questions` - Update question
- `DELETE /api/admin/questions?id=[id]` - Delete question

### Analytics (Protected)
- `GET /api/analytics` - Get user analytics data

### Seeding
- `POST /api/seed` - Seed database with sample questions

## 🗄 Database Schema

### Collections

#### users
```javascript
{
  _id: ObjectId,
  email: String,
  password: String (hashed),
  userName: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### questions
```javascript
{
  _id: ObjectId,
  category: String,
  subject: String,
  topic: String,
  difficulty: String (easy|medium|hard),
  question: String,
  options: [String, String, String, String],
  correctAnswer: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### results
```javascript
{
  _id: ObjectId,
  name: String,
  category: String,
  subject: String,
  score: Number,
  totalQuestions: Number,
  difficulty: String,
  timeTaken: Number (optional),
  examMode: Boolean,
  customQuizId: String (optional),
  createdAt: Date
}
```

#### customQuizzes
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

## 📊 Project Status

### ✅ Completed Features
- User authentication system
- Multiple quiz modes (Regular, Exam, Custom)
- Adaptive difficulty system
- Analytics dashboard with charts
- Global leaderboard
- Custom quiz creation
- Admin panel
- Dark mode
- Sound effects
- Responsive design
- MongoDB integration
- 100 sample questions

### 🔜 Planned Features
- Social features (share scores, challenge friends)
- Multiplayer quiz mode
- Badges and achievements
- Export analytics as PDF
- Mobile app version
- AI-powered question generation
- Voice-based quiz mode

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

Built with ❤️ using Next.js and React

---

**⭐ Star this repo if you find it helpful!**

For questions or support, please open an issue on GitHub.
