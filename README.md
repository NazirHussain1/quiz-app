# Quiz App 🎯

A modern, feature-rich quiz application built with Next.js 16 and React 19. Test your knowledge with trivia questions from the Open Trivia Database.

![Next.js](https://img.shields.io/badge/Next.js-16.0.4-black)
![React](https://img.shields.io/badge/React-19.2.0-blue)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.8-purple)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

### Core Functionality
- 🎮 10 multiple-choice trivia questions per quiz
- 📚 20+ quiz categories to choose from
- 🎯 Three difficulty levels (Easy, Medium, Hard)
- ⏱️ 15-second countdown timer per question
- 📊 Real-time score tracking
- 🏆 Leaderboard system with top 10 scores
- 💾 Auto-save progress with localStorage
- 🔄 Restart quiz with new questions

### User Experience
- 🎨 Dark mode support with toggle
- 🔊 Sound effects (correct/wrong/complete)
- ✨ Smooth animations with Framer Motion
- 📱 Fully responsive design
- ♿ Accessibility features (ARIA labels, keyboard navigation)
- 🎭 Visual feedback (green for correct, red for incorrect)
- 📈 Progress bar with percentage completion
- 🏅 Performance evaluation system

### Technical Features
- 🏗️ Scalable architecture with services and hooks
- 🧩 Reusable component library
- 🎯 Custom React hooks for state management
- 💨 Fast page transitions
- 🔐 Client-side data persistence
- 🎪 Animated UI transitions

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ installed
- npm, yarn, pnpm, or bun package manager

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd quiz-app

# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Production

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Linting

```bash
npm run lint
```

## 📁 Project Structure

```
quiz-app/
├── app/
│   ├── components/          # Reusable UI components
│   │   ├── CategoryBadge.js
│   │   ├── QuestionDisplay.js
│   │   ├── QuizProgress.js
│   │   ├── QuizResults.js
│   │   ├── SoundToggle.js
│   │   └── Timer.js
│   ├── hooks/               # Custom React hooks
│   │   ├── useLeaderboard.js
│   │   ├── useQuizState.js
│   │   └── useTimer.js
│   ├── leaderboard/
│   │   └── page.js          # Leaderboard page
│   ├── quiz/
│   │   └── page.js          # Quiz page
│   ├── services/            # API and storage services
│   │   ├── leaderboardService.js
│   │   ├── quizService.js
│   │   └── storageService.js
│   ├── utils/               # Utility functions
│   │   ├── shuffle.js
│   │   └── useSound.js
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.js
│   └── page.js              # Home page
├── public/
│   └── sounds/              # Sound effect files
│       ├── correct.mp3
│       ├── wrong.mp3
│       └── complete.mp3
├── next.config.ts
├── package.json
└── README.md
```

## 🏗️ Architecture

### Services Layer
Handles all external interactions and data persistence:
- **quizService**: API calls to Open Trivia Database
- **storageService**: localStorage operations
- **leaderboardService**: Leaderboard CRUD operations

### Custom Hooks
Encapsulates business logic and state management:
- **useQuizState**: Quiz state, questions, answers, progress
- **useTimer**: Countdown timer with callbacks
- **useLeaderboard**: Leaderboard state and operations
- **useSound**: Sound effects playback

### Components
Reusable, presentational UI components:
- **QuizProgress**: Score and progress display
- **Timer**: Animated countdown timer
- **QuestionDisplay**: Question and answer options
- **QuizResults**: Results screen with evaluation
- **CategoryBadge**: Category and difficulty badges
- **SoundToggle**: Sound control button

### Benefits
- ✅ Separation of concerns
- ✅ Reusable components and hooks
- ✅ Easy to test and maintain
- ✅ Scalable architecture
- ✅ Clear code organization

## 🎮 How to Play

1. **Enter Your Name**: Required to track your score
2. **Select Category**: Choose from 20+ categories or "Any Category"
3. **Choose Difficulty**: Easy, Medium, or Hard
4. **Start Quiz**: Answer 10 multiple-choice questions
5. **Beat the Timer**: 15 seconds per question
6. **View Results**: See your score and performance grade
7. **Check Leaderboard**: Compare with other players

## 🎯 Performance Grading

- **Below 40%**: Fail
- **40-59%**: Average - Need More Improvement
- **60-74%**: Good
- **75%+**: Excellent 🎉

## 🔊 Sound Effects

The app includes sound effect support for enhanced experience:
- ✅ Correct answer sound
- ❌ Wrong answer sound
- 🎉 Quiz completion sound

Toggle sounds on/off using the button in the quiz page. Preference is saved automatically.

### Adding Sound Files

The app currently has empty placeholder files in `public/sounds/`. To enable sounds:

1. Download or create MP3 files (0.5-2 seconds recommended)
2. Replace the placeholder files:
   - `public/sounds/correct.mp3` - Success/correct sound
   - `public/sounds/wrong.mp3` - Error/wrong sound
   - `public/sounds/complete.mp3` - Celebration/completion sound

**Free Sound Resources**:
- [Freesound.org](https://freesound.org/) - Large library of free sounds
- [Zapsplat](https://www.zapsplat.com/) - Free sound effects
- [Mixkit](https://mixkit.co/free-sound-effects/) - Free sound effects

**Note**: The app works perfectly without sound files - they're optional for enhanced UX.

## 🌐 API

Uses Open Trivia Database API:

1. **Categories**: `https://opentdb.com/api_category.php`
2. **Questions**: `https://opentdb.com/api.php?amount=10&type=multiple&category={id}&difficulty={level}`

## 🛠️ Technologies

- **Framework**: Next.js 16.0.4 (App Router)
- **UI Library**: React 19.2.0
- **Styling**: Bootstrap 5.3.8 + Tailwind CSS 4
- **Animations**: Framer Motion
- **API**: Open Trivia Database
- **Storage**: localStorage

## 🎨 Features in Detail

### Dark Mode
- Toggle between light and dark themes
- Preference saved to localStorage
- Smooth transitions
- All components styled for both themes

### Leaderboard
- Top 10 scores displayed
- Filter by difficulty level
- Shows player name, score, category, date
- Medal system for top 3 (🥇🥈🥉)
- Statistics dashboard

### Progress Tracking
- Auto-save after each answer
- Resume quiz after page refresh
- Separate progress per category/difficulty
- Cleared automatically on completion

### Animations
- Question transitions
- Answer selection feedback
- Result screen entrance
- Timer pulsing when low
- Button hover effects

## 📱 Responsive Design

Works perfectly on:
- 📱 Mobile phones
- 📱 Tablets
- 💻 Laptops
- 🖥️ Desktop monitors

## ♿ Accessibility

- ARIA labels for screen readers
- Keyboard navigation support
- High contrast colors
- Focus indicators
- Semantic HTML

## 🚀 Deploy on Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

The easiest way to deploy is using the [Vercel Platform](https://vercel.com/new).

## 📝 License

MIT

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 👨‍💻 Author

Built with ❤️ using Next.js and React

---

**Powered by Open Trivia Database**
