const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;

const mathQuestions = [
  { topic: "Algebra", difficulty: "medium", question: "What is the value of x in 3x + 7 = 22?", options: ["5", "7", "15", "3"], correctAnswer: "5" },
  { topic: "Geometry", difficulty: "medium", question: "What is the area of a circle with radius 5?", options: ["78.54", "31.42", "25", "50"], correctAnswer: "78.54" },
  { topic: "Trigonometry", difficulty: "medium", question: "What is sin(90°)?", options: ["1", "0", "-1", "0.5"], correctAnswer: "1" },
  { topic: "Calculus", difficulty: "hard", question: "What is the derivative of x³?", options: ["3x²", "x²", "3x", "x³"], correctAnswer: "3x²" },
  { topic: "Statistics", difficulty: "medium", question: "What is the mean of 2, 4, 6, 8, 10?", options: ["6", "5", "7", "8"], correctAnswer: "6" },
  { topic: "Probability", difficulty: "medium", question: "What is the probability of getting heads in a coin toss?", options: ["0.5", "0.25", "1", "0.75"], correctAnswer: "0.5" },
  { topic: "Algebra", difficulty: "easy", question: "What is 2² + 3²?", options: ["13", "25", "10", "5"], correctAnswer: "13" },
  { topic: "Geometry", difficulty: "medium", question: "How many sides does a hexagon have?", options: ["6", "5", "7", "8"], correctAnswer: "6" },
  { topic: "Arithmetic", difficulty: "easy", question: "What is 15% of 200?", options: ["30", "20", "40", "25"], correctAnswer: "30" },
  { topic: "Algebra", difficulty: "medium", question: "Solve for y: 2y - 5 = 11", options: ["8", "6", "3", "16"], correctAnswer: "8" },
  { topic: "Geometry", difficulty: "medium", question: "What is the perimeter of a square with side 4?", options: ["16", "8", "12", "20"], correctAnswer: "16" },
  { topic: "Fractions", difficulty: "easy", question: "What is 1/2 + 1/4?", options: ["3/4", "1/2", "2/4", "1/6"], correctAnswer: "3/4" },
  { topic: "Algebra", difficulty: "hard", question: "What is the quadratic formula?", options: ["x = (-b ± √(b²-4ac)) / 2a", "x = b² - 4ac", "x = -b/2a", "x = √(b²-4ac)"], correctAnswer: "x = (-b ± √(b²-4ac)) / 2a" },
  { topic: "Geometry", difficulty: "medium", question: "What is the volume of a cube with side 3?", options: ["27", "9", "18", "12"], correctAnswer: "27" },
  { topic: "Trigonometry", difficulty: "medium", question: "What is cos(0°)?", options: ["1", "0", "-1", "0.5"], correctAnswer: "1" },
  { topic: "Algebra", difficulty: "medium", question: "Simplify: 3(x + 2)", options: ["3x + 6", "3x + 2", "x + 6", "3x + 5"], correctAnswer: "3x + 6" },
  { topic: "Statistics", difficulty: "medium", question: "What is the median of 3, 7, 9, 12, 15?", options: ["9", "7", "12", "10"], correctAnswer: "9" },
  { topic: "Geometry", difficulty: "easy", question: "How many degrees in a right angle?", options: ["90", "180", "45", "360"], correctAnswer: "90" },
  { topic: "Arithmetic", difficulty: "easy", question: "What is 12 × 8?", options: ["96", "84", "104", "88"], correctAnswer: "96" },
  { topic: "Algebra", difficulty: "medium", question: "What is x² when x = 5?", options: ["25", "10", "15", "20"], correctAnswer: "25" }
];

const physicsQuestions = [
  { topic: "Motion", difficulty: "medium", question: "What is the SI unit of velocity?", options: ["m/s", "kg", "Newton", "Watt"], correctAnswer: "m/s" },
  { topic: "Force", difficulty: "medium", question: "What is Newton's second law?", options: ["F = ma", "E = mc²", "F = G(m1m2)/r²", "P = mv"], correctAnswer: "F = ma" },
  { topic: "Energy", difficulty: "medium", question: "What is the SI