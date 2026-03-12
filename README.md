# Quiz App 🎯

A modern, interactive quiz application built with Next.js 16 and React 19. Test your knowledge with questions from the Open Trivia Database.

## Features

- Sound effects for correct/wrong answers and quiz completion
- Sound toggle button with localStorage persistence
- Dark mode support with toggle button and localStorage persistence
- Player name input and tracking
- Leaderboard system with top 10 scores
- Category selection from 20+ quiz categories
- Difficulty level selection (Easy, Medium, Hard)
- 10 random multiple-choice trivia questions per quiz
- Enhanced question progress indicator with percentage completion
- Animated progress bar showing quiz completion
- 15-second countdown timer for each question with visual alerts
- Real-time score tracking with dynamic calculation
- LocalStorage support - automatically saves and restores quiz progress
- Visual feedback (green for correct, red for incorrect answers)
- Navigate between questions (Previous/Next buttons)
- Auto-advance to next question when timer expires
- Restart quiz feature with new questions
- Performance evaluation with grading system
- Leaderboard filtering by difficulty level
- Responsive design with Bootstrap 5
- Accessibility features (ARIA labels, keyboard navigation, screen reader support)
- Comprehensive error handling and loading states
- Fisher-Yates shuffle algorithm for proper randomization
- Answer locking (cannot change after selection)

## Getting Started

### Prerequisites

- Node.js 20+ installed
- npm, yarn, pnpm, or bun package manager

### Installation

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
quiz-app/
├── app/
│   ├── components/
│   │   └── QuestionCard.js    # Question card component
│   ├── leaderboard/
│   │   └── page.js            # Leaderboard page
│   ├── quiz/
│   │   └── page.js            # Quiz page with game logic
│   ├── utils/
│   │   └── shuffle.js         # Fisher-Yates shuffle algorithm
│   │   └── useSound.js        # Sound effects hook
│   ├── favicon.ico            # App icon
│   ├── globals.css            # Global styles (Tailwind + dark mode)
│   ├── layout.js              # Root layout with dark mode toggle
│   └── page.js                # Home/landing page with name input
├── public/
│   └── sounds/                # Sound effect files
│       ├── correct.mp3        # Correct answer sound
│       ├── wrong.mp3          # Wrong answer sound
│       └── complete.mp3       # Quiz completion sound
├── next.config.ts             # Next.js configuration
├── package.json               # Dependencies and scripts
└── README.md                  # Project documentation
```

## Technologies Used

- Next.js 16.0.4 (App Router)
- React 19.2.0
- Bootstrap 5.3.8 (with dark mode support)
- Tailwind CSS 4
- Open Trivia Database API

## API

The app uses two Open Trivia Database API endpoints:

1. Categories: `https://opentdb.com/api_category.php`
   - Fetches all available quiz categories
   - Returns category ID and name

2. Questions: `https://opentdb.com/api.php?amount=10&type=multiple&category={id}&difficulty={level}`
   - Fetches 10 multiple-choice questions
   - Optional category parameter for filtered questions
   - Optional difficulty parameter (easy, medium, hard)
   - Returns questions with correct and incorrect answers

## Performance Grading

- Below 40%: Fail
- 40-59%: Average - Need More Improvement
- 60-74%: Good
- 75%+: Excellent 🎉

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Sound Effects

The app includes sound effects for enhanced user experience:
- **Correct Answer**: Plays when user selects the correct answer
- **Wrong Answer**: Plays when user selects an incorrect answer
- **Quiz Complete**: Plays when the quiz is finished

Sound effects can be toggled on/off using the sound button in the quiz page. The preference is saved to localStorage.

**Note**: Placeholder MP3 files are included. For the best experience, replace them with actual sound files from free resources like:
- [Freesound.org](https://freesound.org/)
- [Zapsplat](https://www.zapsplat.com/)
- [Mixkit](https://mixkit.co/free-sound-effects/)

See `public/sounds/README.md` for more details.

## How It Works

1. User enters their name on the home page (saved to localStorage)
2. Categories are fetched from Open Trivia Database API on home page load
3. User selects a category or chooses "Any Category" for random questions
4. User selects difficulty level (Easy, Medium, or Hard) - defaults to Medium
5. Category ID and difficulty are passed to quiz page via URL parameters
6. App checks localStorage for saved progress and restores if available
7. Questions are fetched based on selected category and difficulty (if no saved progress)
8. Answers are shuffled using Fisher-Yates algorithm for randomization
9. Each question has a 15-second countdown timer
10. Progress is automatically saved to localStorage after each answer
11. Timer resets when moving to a new question
12. When timer reaches zero, automatically moves to next question
13. Users select an answer, which locks the question and stops the timer
14. Visual feedback shows correct (green) and incorrect (red) answers
15. Navigate through questions using Previous/Next buttons
16. Score is calculated dynamically from all answers
17. Final results show score, category, difficulty, and performance grade
18. Score is automatically saved to leaderboard with player name, date, and details
19. LocalStorage is cleared when quiz finishes or restarts
20. Users can view leaderboard, restart quiz, or choose new category
21. Leaderboard displays top 10 scores with filtering by difficulty

## Deploy on Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/quiz-app)

The easiest way to deploy is using the [Vercel Platform](https://vercel.com/new).

## License

MIT
