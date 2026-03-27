const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

const additionalQuestions = [
  // MATHEMATICS - Easy (2 more to make 10)
  {
    category: "Mathematics",
    subject: "Arithmetic",
    difficulty: "easy",
    question: "50 ÷ 5 = ?",
    options: ["10", "5", "15", "20"],
    correctAnswer: "10"
  },
  {
    category: "Mathematics",
    subject: "Geometry",
    difficulty: "easy",
    question: "دائرے کا رقبہ نکالنے کا فارمولا کیا ہے؟",
    options: ["πr²", "2πr", "πd", "r²"],
    correctAnswer: "πr²"
  },

  // MATHEMATICS - Medium (6 more to make 10)
  {
    category: "Mathematics",
    subject: "Algebra",
    difficulty: "medium",
    question: "اگر a² - b² = (a+b)(a-b) ہو تو یہ کون سی شناخت ہے؟",
    options: ["Difference of squares", "Perfect square", "Sum of squares", "Product formula"],
    correctAnswer: "Difference of squares"
  },
  {
    category: "Mathematics",
    subject: "Trigonometry",
    difficulty: "medium",
    question: "tan(45°) کی قدر کیا ہے؟",
    options: ["1", "0", "√3", "1/√2"],
    correctAnswer: "1"
  },
  {
    category: "Mathematics",
    subject: "Calculus",
    difficulty: "medium",
    question: "∫x dx = ?",
    options: ["x²/2 + C", "x² + C", "2x + C", "x/2 + C"],
    correctAnswer: "x²/2 + C"
  },
  {
    category: "Mathematics",
    subject: "Algebra",
    difficulty: "medium",
    question: "اگر x + y = 10 اور x - y = 2 ہو تو x کی قدر کیا ہے؟",
    options: ["6", "8", "4", "5"],
    correctAnswer: "6"
  },
  {
    category: "Mathematics",
    subject: "Geometry",
    difficulty: "medium",
    question: "مثلث کا رقبہ = ?",
    options: ["1/2 × base × height", "base × height", "2 × base × height", "base + height"],
    correctAnswer: "1/2 × base × height"
  },
  {
    category: "Mathematics",
    subject: "Statistics",
    difficulty: "medium",
    question: "Mode کیا ہوتا ہے؟",
    options: ["Most frequent value", "Middle value", "Average", "Range"],
    correctAnswer: "Most frequent value"
  },

  // MATHEMATICS - Hard (10 questions)
  {
    category: "Mathematics",
    subject: "Calculus",
    difficulty: "hard",
    question: "lim(x→0) (sin x)/x = ?",
    options: ["1", "0", "∞", "undefined"],
    correctAnswer: "1"
  },
  {
    category: "Mathematics",
    subject: "Algebra",
    difficulty: "hard",
    question: "Matrix multiplication کے لیے کون سی شرط ضروری ہے؟",
    options: ["Columns of A = Rows of B", "Rows of A = Columns of B", "Same dimensions", "Square matrices"],
    correctAnswer: "Columns of A = Rows of B"
  },
  {
    category: "Mathematics",
    subject: "Trigonometry",
    difficulty: "hard",
    question: "sin²θ + cos²θ = ?",
    options: ["1", "0", "2", "θ"],
    correctAnswer: "1"
  },
  {
    category: "Mathematics",
    subject: "Calculus",
    difficulty: "hard",
    question: "d/dx(eˣ) = ?",
    options: ["eˣ", "xeˣ⁻¹", "ln x", "1/x"],
    correctAnswer: "eˣ"
  },
  {
    category: "Mathematics",
    subject: "Algebra",
    difficulty: "hard",
    question: "Determinant of 2×2 matrix [[a,b],[c,d]] = ?",
    options: ["ad - bc", "ac - bd", "ab - cd", "ad + bc"],
    correctAnswer: "ad - bc"
  },
  {
    category: "Mathematics",
    subject: "Geometry",
    difficulty: "hard",
    question: "Sphere کا حجم = ?",
    options: ["4/3 πr³", "πr³", "4πr²", "2πr³"],
    correctAnswer: "4/3 πr³"
  },
  {
    category: "Mathematics",
    subject: "Calculus",
    difficulty: "hard",
    question: "∫(1/x) dx = ?",
    options: ["ln|x| + C", "x² + C", "1/x² + C", "e^x + C"],
    correctAnswer: "ln|x| + C"
  },
  {
    category: "Mathematics",
    subject: "Trigonometry",
    difficulty: "hard",
    question: "cos(2θ) = ?",
    options: ["cos²θ - sin²θ", "2cosθ", "cos²θ + sin²θ", "2sinθcosθ"],
    correctAnswer: "cos²θ - sin²θ"
  },
  {
    category: "Mathematics",
    subject: "Algebra",
    difficulty: "hard",
    question: "Binomial theorem: (a+b)² = ?",
    options: ["a² + 2ab + b²", "a² + b²", "a² - b²", "2ab"],
    correctAnswer: "a² + 2ab + b²"
  },
  {
    category: "Mathematics",
    subject: "Statistics",
    difficulty: "hard",
    question: "Standard deviation کا مربع کیا کہلاتا ہے؟",
    options: ["Variance", "Mean", "Mode", "Range"],
    correctAnswer: "Variance"
  },

  // ENGLISH - Easy (2 more to make 10)
  {
    category: "English",
    subject: "Grammar",
    difficulty: "easy",
    question: "They ___ playing cricket.",
    options: ["are", "is", "am", "be"],
    correctAnswer: "are"
  },
  {
    