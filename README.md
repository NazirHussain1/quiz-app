# Quiz App 🎯

A modern, interactive quiz application built with Next.js 16 and React 19. Test your knowledge with questions from the Open Trivia Database.

## Features

- Category selection from 20+ quiz categories
- 10 random multiple-choice trivia questions per quiz
- 15-second countdown timer for each question
- Real-time score tracking with dynamic calculation
- Visual feedback (green for correct, red for incorrect answers)
- Progress bar showing quiz completion
- Navigate between questions (Previous/Next buttons)
- Auto-advance to next question when timer expires
- Performance evaluation with grading system
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
│   ├── quiz/
│   │   └── page.js            # Quiz page with game logic
│   ├── utils/
│   │   └── shuffle.js         # Fisher-Yates shuffle algorithm
│   ├── favicon.ico            # App icon
│   ├── globals.css            # Global styles (Tailwind)
│   ├── layout.js              # Root layout with Bootstrap
│   └── page.js                # Home/landing page
├── public/                    # Static assets (SVG icons)
├── next.config.ts             # Next.js configuration
├── package.json               # Dependencies and scripts
└── README.md                  # Project documentation
```

## Technologies Used

- Next.js 16.0.4 (App Router)
- React 19.2.0
- Bootstrap 5.3.8
- Tailwind CSS 4
- Open Trivia Database API

## API

The app uses two Open Trivia Database API endpoints:

1. Categories: `https://opentdb.com/api_category.php`
   - Fetches all available quiz categories
   - Returns category ID and name

2. Questions: `https://opentdb.com/api.php?amount=10&type=multiple&category={id}`
   - Fetches 10 multiple-choice questions
   - Optional category parameter for filtered questions
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

## How It Works

1. Categories are fetched from Open Trivia Database API on home page load
2. User selects a category or chooses "Any Category" for random questions
3. Category ID is passed to quiz page via URL parameters
4. Questions are fetched based on selected category
5. Answers are shuffled using Fisher-Yates algorithm for randomization
6. Each question has a 15-second countdown timer
7. Timer resets when moving to a new question
8. When timer reaches zero, automatically moves to next question
9. Users select an answer, which locks the question and stops the timer
10. Visual feedback shows correct (green) and incorrect (red) answers
11. Navigate through questions using Previous/Next buttons
12. Score is calculated dynamically from all answers
13. Final results show score, category, and performance grade

## Deploy on Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/quiz-app)

The easiest way to deploy is using the [Vercel Platform](https://vercel.com/new).

## License

MIT
