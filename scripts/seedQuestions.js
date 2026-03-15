const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('Error: MONGODB_URI not found in .env.local');
  process.exit(1);
}

const questions = [];

const mathTopics = [
  { topic: "Algebra", q: "What is the value of x in 3x + 7 = 22?", opts: ["5", "7", "15", "3"], ans: "5", diff: "medium" },
  { topic: "Geometry", q: "What is the area of a circle with radius 5?", opts: ["78.54", "31.42", "25", "50"], ans: "78.54", diff: "medium" },
  { topic: "Trigonometry", q: "What is sin(90°)?", opts: ["1", "0", "-1", "0.5"], ans: "1", diff: "medium" },
  { topic: "Calculus", q: "What is the derivative of x³?", opts: ["3x²", "x²", "3x", "x³"], ans: "3x²", diff: "hard" },
  { topic: "Statistics", q: "What is the mean of 2, 4, 6, 8, 10?", opts: ["6", "5", "7", "8"], ans: "6", diff: "medium" },
  { topic: "Probability", q: "What is the probability of getting heads?", opts: ["0.5", "0.25", "1", "0.75"], ans: "0.5", diff: "easy" },
  { topic: "Algebra", q: "What is 2² + 3²?", opts: ["13", "25", "10", "5"], ans: "13", diff: "easy" },
  { topic: "Geometry", q: "How many sides does a hexagon have?", opts: ["6", "5", "7", "8"], ans: "6", diff: "easy" },
  { topic: "Arithmetic", q: "What is 15% of 200?", opts: ["30", "20", "40", "25"], ans: "30", diff: "easy" },
  { topic: "Algebra", q: "Solve for y: 2y - 5 = 11", opts: ["8", "6", "3", "16"], ans: "8", diff: "medium" },
  { topic: "Geometry", q: "Perimeter of square with side 4?", opts: ["16", "8", "12", "20"], ans: "16", diff: "easy" },
  { topic: "Fractions", q: "What is 1/2 + 1/4?", opts: ["3/4", "1/2", "2/4", "1/6"], ans: "3/4", diff: "easy" },
  { topic: "Algebra", q: "Quadratic formula?", opts: ["x=(-b±√(b²-4ac))/2a", "x=b²-4ac", "x=-b/2a", "x=√(b²-4ac)"], ans: "x=(-b±√(b²-4ac))/2a", diff: "hard" },
  { topic: "Geometry", q: "Volume of cube with side 3?", opts: ["27", "9", "18", "12"], ans: "27", diff: "medium" },
  { topic: "Trigonometry", q: "What is cos(0°)?", opts: ["1", "0", "-1", "0.5"], ans: "1", diff: "medium" },
  { topic: "Algebra", q: "Simplify: 3(x + 2)", opts: ["3x+6", "3x+2", "x+6", "3x+5"], ans: "3x+6", diff: "easy" },
  { topic: "Statistics", q: "Median of 3,7,9,12,15?", opts: ["9", "7", "12", "10"], ans: "9", diff: "medium" },
  { topic: "Geometry", q: "Degrees in right angle?", opts: ["90", "180", "45", "360"], ans: "90", diff: "easy" },
  { topic: "Arithmetic", q: "What is 12 × 8?", opts: ["96", "84", "104", "88"], ans: "96", diff: "easy" },
  { topic: "Algebra", q: "What is x² when x=5?", opts: ["25", "10", "15", "20"], ans: "25", diff: "easy" }
];

mathTopics.forEach(item => {
  questions.push({
    category: "Intermediate",
    subject: "Mathematics",
    topic: item.topic,
    difficulty: item.diff,
    question: item.q,
    options: item.opts,
    correctAnswer: item.ans
  });
});
