const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

const pakistanQuestions = [
  // ========== EXISTING 50 QUESTIONS (unchanged) ==========
  // MATHEMATICS - Easy (Matric) - 8 questions
  {
    category: "Mathematics",
    subject: "Algebra",
    difficulty: "easy",
    question: "اگر 2x + 5 = 15 ہو تو x کی قدر کیا ہے؟",
    options: ["5", "10", "7", "3"],
    correctAnswer: "5"
  },
  {
    category: "Mathematics",
    subject: "Geometry",
    difficulty: "easy",
    question: "مثلث کے تینوں زاویوں کا مجموعہ کتنا ہوتا ہے؟",
    options: ["180°", "360°", "90°", "270°"],
    correctAnswer: "180°"
  },
  {
    category: "Mathematics",
    subject: "Arithmetic",
    difficulty: "easy",
    question: "15 × 12 = ?",
    options: ["180", "170", "190", "160"],
    correctAnswer: "180"
  },
  {
    category: "Mathematics",
    subject: "Fractions",
    difficulty: "easy",
    question: "1/2 + 1/4 = ?",
    options: ["3/4", "1/4", "2/4", "1/2"],
    correctAnswer: "3/4"
  },
  {
    category: "Mathematics",
    subject: "Geometry",
    difficulty: "easy",
    question: "مربع کی چاروں اضلاع برابر ہوتی ہیں۔ اگر ایک ضلع 5 سینٹی میٹر ہو تو محیط کیا ہوگا؟",
    options: ["20 cm", "25 cm", "15 cm", "10 cm"],
    correctAnswer: "20 cm"
  },
  {
    category: "Mathematics",
    subject: "Percentage",
    difficulty: "easy",
    question: "100 کا 25% کتنا ہوگا؟",
    options: ["25", "50", "75", "20"],
    correctAnswer: "25"
  },
  {
    category: "Mathematics",
    subject: "Arithmetic",
    difficulty: "easy",
    question: "144 ÷ 12 = ?",
    options: ["12", "10", "14", "11"],
    correctAnswer: "12"
  },
  {
    category: "Mathematics",
    subject: "Algebra",
    difficulty: "easy",
    question: "3y - 7 = 14 میں y کی قدر کیا ہے؟",
    options: ["7", "5", "21", "3"],
    correctAnswer: "7"
  },
  // MATHEMATICS - Medium (FSc) - 4 questions
  {
    category: "Mathematics",
    subject: "Trigonometry",
    difficulty: "medium",
    question: "sin(90°) کی قدر کیا ہے؟",
    options: ["1", "0", "-1", "0.5"],
    correctAnswer: "1"
  },
  {
    category: "Mathematics",
    subject: "Calculus",
    difficulty: "medium",
    question: "x² کا مشتق (derivative) کیا ہے؟",
    options: ["2x", "x", "x²", "2"],
    correctAnswer: "2x"
  },
  {
    category: "Mathematics",
    subject: "Trigonometry",
    difficulty: "medium",
    question: "cos(0°) کی قدر کیا ہے؟",
    options: ["1", "0", "-1", "0.5"],
    correctAnswer: "1"
  },
  {
    category: "Mathematics",
    subject: "Algebra",
    difficulty: "medium",
    question: "Quadratic formula کیا ہے؟",
    options: ["x = (-b ± √(b²-4ac)) / 2a", "x = -b / 2a", "x = b² - 4ac", "x = a + b + c"],
    correctAnswer: "x = (-b ± √(b²-4ac)) / 2a"
  },
  // ENGLISH - Easy (Matric) - 8 questions
  {
    category: "English",
    subject: "Grammar",
    difficulty: "easy",
    question: "Choose the correct verb: He ___ to school every day.",
    options: ["goes", "go", "going", "gone"],
    correctAnswer: "goes"
  },
  {
    category: "English",
    subject: "Vocabulary",
    difficulty: "easy",
    question: "What is the opposite of 'hot'?",
    options: ["Cold", "Warm", "Cool", "Freezing"],
    correctAnswer: "Cold"
  },
  {
    category: "English",
    subject: "Grammar",
    difficulty: "easy",
    question: "I ___ a student.",
    options: ["am", "is", "are", "be"],
    correctAnswer: "am"
  },
  {
    category: "English",
    subject: "Tenses",
    difficulty: "easy",
    question: "She ___ her homework yesterday.",
    options: ["did", "do", "does", "doing"],
    correctAnswer: "did"
  },
  {
    category: "English",
    subject: "Vocabulary",
    difficulty: "easy",
    question: "What is the plural of 'child'?",
    options: ["Children", "Childs", "Childes", "Childrens"],
    correctAnswer: "Children"
  },
  {
    category: "English",
    subject: "Grammar",
    difficulty: "easy",
    question: "This is ___ book.",
    options: ["my", "me", "I", "mine"],
    correctAnswer: "my"
  },
  {
    category: "English",
    subject: "Prepositions",
    difficulty: "easy",
    question: "The cat is ___ the table.",
    options: ["on", "in", "at", "of"],
    correctAnswer: "on"
  },
  {
    category: "English",
    subject: "Articles",
    difficulty: "easy",
    question: "___ apple a day keeps the doctor away.",
    options: ["An", "A", "The", "No article"],
    correctAnswer: "An"
  },
  // SCIENCE - Easy (Matric) - 8 questions
  {
    category: "Science",
    subject: "Physics",
    difficulty: "easy",
    question: "زمین پر کشش ثقل کی قدر کتنی ہے؟",
    options: ["9.8 m/s²", "10 m/s²", "8.9 m/s²", "11 m/s²"],
    correctAnswer: "9.8 m/s²"
  },
  {
    category: "Science",
    subject: "Chemistry",
    difficulty: "easy",
    question: "پانی کا کیمیائی فارمولا کیا ہے؟",
    options: ["H₂O", "H₂O₂", "HO", "H₃O"],
    correctAnswer: "H₂O"
  },
  {
    category: "Science",
    subject: "Biology",
    difficulty: "easy",
    question: "انسانی جسم میں کتنی ہڈیاں ہوتی ہیں؟",
    options: ["206", "208", "204", "210"],
    correctAnswer: "206"
  },
  {
    category: "Science",
    subject: "Physics",
    difficulty: "easy",
    question: "روشنی کی رفتار کتنی ہے؟",
    options: ["3 × 10⁸ m/s", "3 × 10⁶ m/s", "3 × 10⁹ m/s", "3 × 10⁷ m/s"],
    correctAnswer: "3 × 10⁸ m/s"
  },
  {
    category: "Science",
    subject: "Chemistry",
    difficulty: "easy",
    question: "نمک (Table Salt) کا کیمیائی نام کیا ہے؟",
    options: ["NaCl", "KCl", "CaCl₂", "MgCl₂"],
    correctAnswer: "NaCl"
  },
  {
    category: "Science",
    subject: "Biology",
    difficulty: "easy",
    question: "خلیے کا پاور ہاؤس کون سا حصہ ہے؟",
    options: ["Mitochondria", "Nucleus", "Ribosome", "Chloroplast"],
    correctAnswer: "Mitochondria"
  },
  {
    category: "Science",
    subject: "Physics",
    difficulty: "easy",
    question: "قوت کی SI اکائی کیا ہے؟",
    options: ["Newton", "Joule", "Watt", "Pascal"],
    correctAnswer: "Newton"
  },
  {
    category: "Science",
    subject: "Biology",
    difficulty: "easy",
    question: "Photosynthesis کا عمل کہاں ہوتا ہے؟",
    options: ["Leaves", "Roots", "Stem", "Flowers"],
    correctAnswer: "Leaves"
  },
  // COMPUTER - Easy (Matric) - 6 questions
  {
    category: "Computer",
    subject: "Basics",
    difficulty: "easy",
    question: "CPU کا مطلب کیا ہے؟",
    options: ["Central Processing Unit", "Computer Personal Unit", "Central Program Unit", "Computer Processing Unit"],
    correctAnswer: "Central Processing Unit"
  },
  {
    category: "Computer",
    subject: "Hardware",
    difficulty: "easy",
    question: "کمپیوٹر کی یاداشت کو کیا کہتے ہیں؟",
    options: ["Memory/RAM", "CPU", "Monitor", "Keyboard"],
    correctAnswer: "Memory/RAM"
  },
  {
    category: "Computer",
    subject: "Software",
    difficulty: "easy",
    question: "MS Word کس قسم کا سافٹ ویئر ہے؟",
    options: ["Word Processor", "Spreadsheet", "Database", "Browser"],
    correctAnswer: "Word Processor"
  },
  {
    category: "Computer",
    subject: "Internet",
    difficulty: "easy",
    question: "WWW کا مطلب کیا ہے؟",
    options: ["World Wide Web", "World Web Wide", "Wide World Web", "Web World Wide"],
    correctAnswer: "World Wide Web"
  },
  {
    category: "Computer",
    subject: "Basics",
    difficulty: "easy",
    question: "Input device کی مثال کون سی ہے؟",
    options: ["Keyboard", "Monitor", "Printer", "Speaker"],
    correctAnswer: "Keyboard"
  },
  {
    category: "Computer",
    subject: "Storage",
    difficulty: "easy",
    question: "1 GB میں کتنے MB ہوتے ہیں؟",
    options: ["1024 MB", "1000 MB", "512 MB", "2048 MB"],
    correctAnswer: "1024 MB"
  },
  // GENERAL KNOWLEDGE - Easy (Matric) - 6 questions
  {
    category: "General Knowledge",
    subject: "World",
    difficulty: "easy",
    question: "دنیا کا سب سے بڑا سمندر کون سا ہے؟",
    options: ["Pacific Ocean", "Atlantic Ocean", "Indian Ocean", "Arctic Ocean"],
    correctAnswer: "Pacific Ocean"
  },
  {
    category: "General Knowledge",
    subject: "Geography",
    difficulty: "easy",
    question: "دنیا کی سب سے اونچی چوٹی کون سی ہے؟",
    options: ["Mount Everest", "K2", "Nanga Parbat", "Kilimanjaro"],
    correctAnswer: "Mount Everest"
  },
  {
    category: "General Knowledge",
    subject: "Countries",
    difficulty: "easy",
    question: "دنیا کا سب سے بڑا ملک (رقبے کے لحاظ سے) کون سا ہے؟",
    options: ["Russia", "Canada", "China", "USA"],
    correctAnswer: "Russia"
  },
  {
    category: "General Knowledge",
    subject: "Capitals",
    difficulty: "easy",
    question: "چین کا دارالحکومت کون سا شہر ہے؟",
    options: ["Beijing", "Shanghai", "Hong Kong", "Tokyo"],
    correctAnswer: "Beijing"
  },
  {
    category: "General Knowledge",
    subject: "World",
    difficulty: "easy",
    question: "اقوام متحدہ کا صدر دفتر کہاں ہے؟",
    options: ["New York", "London", "Paris", "Geneva"],
    correctAnswer: "New York"
  },
  {
    category: "General Knowledge",
    subject: "Science",
    difficulty: "easy",
    question: "سورج ایک کیا ہے؟",
    options: ["Star", "Planet", "Moon", "Comet"],
    correctAnswer: "Star"
  },
  // ISLAMIC STUDIES - Easy (Matric) - 5 questions
  {
    category: "Islamic Studies",
    subject: "Quran",
    difficulty: "easy",
    question: "قرآن مجید میں کتنی سورتیں ہیں؟",
    options: ["114", "110", "120", "100"],
    correctAnswer: "114"
  },
  {
    category: "Islamic Studies",
    subject: "Prophets",
    difficulty: "easy",
    question: "آخری نبی کا نام کیا ہے؟",
    options: ["حضرت محمد ﷺ", "حضرت عیسیٰ ؑ", "حضرت موسیٰ ؑ", "حضرت ابراہیم ؑ"],
    correctAnswer: "حضرت محمد ﷺ"
  },
  {
    category: "Islamic Studies",
    subject: "Pillars",
    difficulty: "easy",
    question: "اسلام کے کتنے بنیادی ارکان ہیں؟",
    options: ["5", "4", "6", "7"],
    correctAnswer: "5"
  },
  {
    category: "Islamic Studies",
    subject: "Prayer",
    difficulty: "easy",
    question: "ایک دن میں کتنی نمازیں فرض ہیں؟",
    options: ["5", "3", "7", "4"],
    correctAnswer: "5"
  },
  {
    category: "Islamic Studies",
    subject: "Holy Books",
    difficulty: "easy",
    question: "اسلام میں کتنی آسمانی کتابیں ہیں؟",
    options: ["4", "3", "5", "6"],
    correctAnswer: "4"
  },
  // PAKISTAN STUDIES - Easy (Matric) - 5 questions
  {
    category: "Pakistan Studies",
    subject: "History",
    difficulty: "easy",
    question: "پاکستان کب وجود میں آیا؟",
    options: ["14 اگست 1947", "15 اگست 1947", "14 اگست 1948", "23 مارچ 1940"],
    correctAnswer: "14 اگست 1947"
  },
  {
    category: "Pakistan Studies",
    subject: "Geography",
    difficulty: "easy",
    question: "پاکستان کا دارالحکومت کون سا شہر ہے؟",
    options: ["اسلام آباد", "کراچی", "لاہور", "پشاور"],
    correctAnswer: "اسلام آباد"
  },
  {
    category: "Pakistan Studies",
    subject: "Founder",
    difficulty: "easy",
    question: "قائد اعظم کا اصل نام کیا تھا؟",
    options: ["محمد علی جناح", "علامہ اقبال", "لیاقت علی خان", "سر سید احمد خان"],
    correctAnswer: "محمد علی جناح"
  },
  {
    category: "Pakistan Studies",
    subject: "Geography",
    difficulty: "easy",
    question: "پاکستان کا قومی جانور کون سا ہے؟",
    options: ["مارخور", "شیر", "ہاتھی", "چیتا"],
    correctAnswer: "مارخور"
  },
  {
    category: "Pakistan Studies",
    subject: "Symbols",
    difficulty: "easy",
    question: "پاکستان کا قومی پھول کون سا ہے؟",
    options: ["چنبیلی (Jasmine)", "گلاب", "سورج مکھی", "کنول"],
    correctAnswer: "چنبیلی (Jasmine)"
  },

  // ========== ADDITIONAL 150 QUESTIONS ==========
  // MATHEMATICS (add 28) - total 40
  // Mathematics Easy (8 more)
  {
    category: "Mathematics",
    subject: "Arithmetic",
    difficulty: "easy",
    question: "5 × 8 ÷ 4 = ?",
    options: ["10", "12", "8", "6"],
    correctAnswer: "10"
  },
  {
    category: "Mathematics",
    subject: "Algebra",
    difficulty: "easy",
    question: "x + 7 = 12 میں x کی قدر کیا ہے؟",
    options: ["5", "4", "6", "7"],
    correctAnswer: "5"
  },
  {
    category: "Mathematics",
    subject: "Geometry",
    difficulty: "easy",
    question: "مربع کا رقبہ (area) معلوم کرنے کا فارمولا کیا ہے؟",
    options: ["ضلع × ضلع", "2 × (لمبائی + چوڑائی)", "لمبائی × چوڑائی", "4 × ضلع"],
    correctAnswer: "ضلع × ضلع"
  },
  {
    category: "Mathematics",
    subject: "Percentage",
    difficulty: "easy",
    question: "50 کا 10% کتنا ہوگا؟",
    options: ["5", "10", "15", "20"],
    correctAnswer: "5"
  },
  {
    category: "Mathematics",
    subject: "Fractions",
    difficulty: "easy",
    question: "3/5 کو اعشاریہ میں کیا کہتے ہیں؟",
    options: ["0.6", "0.3", "0.5", "0.8"],
    correctAnswer: "0.6"
  },
  {
    category: "Mathematics",
    subject: "Arithmetic",
    difficulty: "easy",
    question: "2³ کی قدر کیا ہے؟",
    options: ["8", "6", "9", "4"],
    correctAnswer: "8"
  },
  {
    category: "Mathematics",
    subject: "Algebra",
    difficulty: "easy",
    question: "2x = 16 میں x = ?",
    options: ["8", "14", "18", "7"],
    correctAnswer: "8"
  },
  {
    category: "Mathematics",
    subject: "Geometry",
    difficulty: "easy",
    question: "دائرے کا رقبہ (area) معلوم کرنے کا فارمولا کیا ہے؟",
    options: ["πr²", "2πr", "πd", "πr"],
    correctAnswer: "πr²"
  },
  // Mathematics Medium (12 more)
  {
    category: "Mathematics",
    subject: "Trigonometry",
    difficulty: "medium",
    question: "tan(45°) کی قدر کیا ہے؟",
    options: ["1", "0", "∞", "√3"],
    correctAnswer: "1"
  },
  {
    category: "Mathematics",
    subject: "Calculus",
    difficulty: "medium",
    question: "∫ x dx کیا ہے؟",
    options: ["x²/2 + C", "x² + C", "2x + C", "x²/2"],
    correctAnswer: "x²/2 + C"
  },
  {
    category: "Mathematics",
    subject: "Algebra",
    difficulty: "medium",
    question: "اگر (x-3)(x+2) = 0 ہو تو x کی کیا قدریں ہیں؟",
    options: ["3, -2", "-3, 2", "3, 2", "-3, -2"],
    correctAnswer: "3, -2"
  },
  {
    category: "Mathematics",
    subject: "Geometry",
    difficulty: "medium",
    question: "مستطیل کا محیط 40 سینٹی میٹر اور لمبائی 12 سینٹی میٹر ہو تو چوڑائی کیا ہوگی؟",
    options: ["8 cm", "10 cm", "6 cm", "4 cm"],
    correctAnswer: "8 cm"
  },
  {
    category: "Mathematics",
    subject: "Trigonometry",
    difficulty: "medium",
    question: "sin²θ + cos²θ کتنا ہوتا ہے؟",
    options: ["1", "0", "2", "-1"],
    correctAnswer: "1"
  },
  {
    category: "Mathematics",
    subject: "Calculus",
    difficulty: "medium",
    question: "d/dx (sin x) کیا ہے؟",
    options: ["cos x", "-cos x", "sec x", "csc x"],
    correctAnswer: "cos x"
  },
  {
    category: "Mathematics",
    subject: "Algebra",
    difficulty: "medium",
    question: "log₁₀ 100 کی قدر کیا ہے؟",
    options: ["2", "10", "1", "100"],
    correctAnswer: "2"
  },
  {
    category: "Mathematics",
    subject: "Statistics",
    difficulty: "medium",
    question: "اعداد 2,4,6,8,10 کا اوسط (mean) کیا ہے؟",
    options: ["6", "5", "7", "8"],
    correctAnswer: "6"
  },
  {
    category: "Mathematics",
    subject: "Geometry",
    difficulty: "medium",
    question: "مثلث کے دو زاویے 45° اور 55° ہوں تو تیسرا زاویہ کیا ہوگا؟",
    options: ["80°", "100°", "90°", "85°"],
    correctAnswer: "80°"
  },
  {
    category: "Mathematics",
    subject: "Trigonometry",
    difficulty: "medium",
    question: "cosec θ = ?",
    options: ["1/sin θ", "1/cos θ", "1/tan θ", "1/cot θ"],
    correctAnswer: "1/sin θ"
  },
  {
    category: "Mathematics",
    subject: "Algebra",
    difficulty: "medium",
    question: "x² - 5x + 6 کے عوامل (factors) کیا ہیں؟",
    options: ["(x-2)(x-3)", "(x+2)(x+3)", "(x-2)(x+3)", "(x+2)(x-3)"],
    correctAnswer: "(x-2)(x-3)"
  },
  {
    category: "Mathematics",
    subject: "Arithmetic",
    difficulty: "medium",
    question: "اگر 4 کارکن 10 دن میں کام مکمل کریں تو 8 کارکن کتنے دن میں مکمل کریں گے؟",
    options: ["5 دن", "20 دن", "8 دن", "12 دن"],
    correctAnswer: "5 دن"
  },
  // Mathematics Hard (8 more)
  {
    category: "Mathematics",
    subject: "Calculus",
    difficulty: "hard",
    question: "lim (x→0) sin x / x کی قدر کیا ہے؟",
    options: ["1", "0", "∞", "نہیں"],
    correctAnswer: "1"
  },
  {
    category: "Mathematics",
    subject: "Trigonometry",
    difficulty: "hard",
    question: "cos 2θ کا فارمولا کیا ہے؟",
    options: ["cos²θ - sin²θ", "2 sinθ cosθ", "1 - 2 cos²θ", "2 cos²θ - 1"],
    correctAnswer: "cos²θ - sin²θ"
  },
  {
    category: "Mathematics",
    subject: "Algebra",
    difficulty: "hard",
    question: "x² + y² = 25 اور xy = 12 ہو تو x+y کیا ہوگا؟",
    options: ["±7", "±5", "±12", "±13"],
    correctAnswer: "±7"
  },
  {
    category: "Mathematics",
    subject: "Geometry",
    difficulty: "hard",
    question: "مخروط (cone) کا حجم کیا ہوتا ہے؟",
    options: ["1/3 πr²h", "πr²h", "2πrh", "πr² + πrl"],
    correctAnswer: "1/3 πr²h"
  },
  {
    category: "Mathematics",
    subject: "Calculus",
    difficulty: "hard",
    question: "d/dx (ln x) کیا ہے؟",
    options: ["1/x", "x", "ln x", "e^x"],
    correctAnswer: "1/x"
  },
  {
    category: "Mathematics",
    subject: "Statistics",
    difficulty: "hard",
    question: "اعداد 1,2,3,4,5 کا معیاری انحراف (standard deviation) کیا ہے؟",
    options: ["√2", "2", "√3", "1.5"],
    correctAnswer: "√2"
  },
  {
    category: "Mathematics",
    subject: "Trigonometry",
    difficulty: "hard",
    question: "sin 15° کی قدر کیا ہے؟",
    options: ["(√6 - √2)/4", "(√6 + √2)/4", "(√3 - 1)/2", "(√3 + 1)/2"],
    correctAnswer: "(√6 - √2)/4"
  },
  {
    category: "Mathematics",
    subject: "Algebra",
    difficulty: "hard",
    question: "اگر 2ˣ = 8ʸ اور 9ˣ = 27ʸ ہو تو x:y کیا ہے؟",
    options: ["3:2", "2:3", "1:1", "3:1"],
    correctAnswer: "3:2"
  },

  // ENGLISH (add 22) - total 30
  // English Easy (8 more)
  {
    category: "English",
    subject: "Grammar",
    difficulty: "easy",
    question: "Choose the correct sentence:",
    options: ["She don't like coffee.", "She doesn't like coffee.", "She not like coffee.", "She isn't like coffee."],
    correctAnswer: "She doesn't like coffee."
  },
  {
    category: "English",
    subject: "Vocabulary",
    difficulty: "easy",
    question: "What is the synonym of 'big'?",
    options: ["Large", "Small", "Tiny", "Narrow"],
    correctAnswer: "Large"
  },
  {
    category: "English",
    subject: "Tenses",
    difficulty: "easy",
    question: "They ___ playing football now.",
    options: ["are", "is", "am", "be"],
    correctAnswer: "are"
  },
  {
    category: "English",
    subject: "Prepositions",
    difficulty: "easy",
    question: "She is afraid ___ spiders.",
    options: ["of", "from", "to", "in"],
    correctAnswer: "of"
  },
  {
    category: "English",
    subject: "Articles",
    difficulty: "easy",
    question: "He is ___ honest man.",
    options: ["an", "a", "the", "no article"],
    correctAnswer: "an"
  },
  {
    category: "English",
    subject: "Grammar",
    difficulty: "easy",
    question: "Which word is a noun?",
    options: ["Happiness", "Run", "Beautiful", "Quickly"],
    correctAnswer: "Happiness"
  },
  {
    category: "English",
    subject: "Vocabulary",
    difficulty: "easy",
    question: "What is the opposite of 'difficult'?",
    options: ["Easy", "Hard", "Complex", "Tough"],
    correctAnswer: "Easy"
  },
  {
    category: "English",
    subject: "Tenses",
    difficulty: "easy",
    question: "I ___ to the cinema yesterday.",
    options: ["went", "go", "goes", "going"],
    correctAnswer: "went"
  },
  // English Medium (8 more)
  {
    category: "English",
    subject: "Grammar",
    difficulty: "medium",
    question: "Identify the correct passive voice: 'She wrote a letter.'",
    options: ["A letter was written by her.", "A letter is written by her.", "A letter has written by her.", "A letter was being written by her."],
    correctAnswer: "A letter was written by her."
  },
  {
    category: "English",
    subject: "Vocabulary",
    difficulty: "medium",
    question: "What does 'benevolent' mean?",
    options: ["Kind", "Cruel", "Angry", "Greedy"],
    correctAnswer: "Kind"
  },
  {
    category: "English",
    subject: "Tenses",
    difficulty: "medium",
    question: "By next year, I ___ my degree.",
    options: ["will have completed", "will complete", "complete", "have completed"],
    correctAnswer: "will have completed"
  },
  {
    category: "English",
    subject: "Prepositions",
    difficulty: "medium",
    question: "She is interested ___ learning English.",
    options: ["in", "on", "at", "for"],
    correctAnswer: "in"
  },
  {
    category: "English",
    subject: "Grammar",
    difficulty: "medium",
    question: "Choose the correct indirect speech: He said, 'I am happy.'",
    options: ["He said that he was happy.", "He said that I am happy.", "He said that he is happy.", "He said I am happy."],
    correctAnswer: "He said that he was happy."
  },
  {
    category: "English",
    subject: "Vocabulary",
    difficulty: "medium",
    question: "What is the antonym of 'abundant'?",
    options: ["Scarce", "Plentiful", "Ample", "Rich"],
    correctAnswer: "Scarce"
  },
  {
    category: "English",
    subject: "Tenses",
    difficulty: "medium",
    question: "She ___ in this city since 2010.",
    options: ["has been living", "is living", "lives", "lived"],
    correctAnswer: "has been living"
  },
  {
    category: "English",
    subject: "Conditionals",
    difficulty: "medium",
    question: "If I ___ you, I would study harder.",
    options: ["were", "was", "am", "is"],
    correctAnswer: "were"
  },
  // English Hard (6 more)
  {
    category: "English",
    subject: "Grammar",
    difficulty: "hard",
    question: "Identify the correct sentence:",
    options: ["Neither the teacher nor the students was present.", "Neither the teacher nor the students were present.", "Neither the teacher nor the students is present.", "Neither the teacher nor the students are present."],
    correctAnswer: "Neither the teacher nor the students were present."
  },
  {
    category: "English",
    subject: "Vocabulary",
    difficulty: "hard",
    question: "What does 'ephemeral' mean?",
    options: ["Short-lived", "Eternal", "Bright", "Heavy"],
    correctAnswer: "Short-lived"
  },
  {
    category: "English",
    subject: "Tenses",
    difficulty: "hard",
    question: "By the time you arrive, I ___ dinner.",
    options: ["will have cooked", "will cook", "cook", "have cooked"],
    correctAnswer: "will have cooked"
  },
  {
    category: "English",
    subject: "Grammar",
    difficulty: "hard",
    question: "Choose the correct use of 'whom':",
    options: ["Whom did you meet?", "Whom is coming?", "Whom are you?", "Whom does this belong?"],
    correctAnswer: "Whom did you meet?"
  },
  {
    category: "English",
    subject: "Vocabulary",
    difficulty: "hard",
    question: "What is the meaning of 'ubiquitous'?",
    options: ["Everywhere", "Rare", "Hidden", "Unknown"],
    correctAnswer: "Everywhere"
  },
  {
    category: "English",
    subject: "Conditionals",
    difficulty: "hard",
    question: "Had I known, I ___ you.",
    options: ["would have helped", "will help", "would help", "helped"],
    correctAnswer: "would have helped"
  },

  // SCIENCE (add 22) - total 30
  // Science Easy (8 more)
  {
    category: "Science",
    subject: "Physics",
    difficulty: "easy",
    question: "بجلی کی اکائی کیا ہے؟",
    options: ["Ampere", "Volt", "Watt", "Ohm"],
    correctAnswer: "Ampere"
  },
  {
    category: "Science",
    subject: "Chemistry",
    difficulty: "easy",
    question: "کاربن ڈائی آکسائیڈ کا فارمولا کیا ہے؟",
    options: ["CO₂", "CO", "C₂O", "C₂O₂"],
    correctAnswer: "CO₂"
  },
  {
    category: "Science",
    subject: "Biology",
    difficulty: "easy",
    question: "انسانی خون کا رنگ کیا ہوتا ہے؟",
    options: ["لال", "نیلا", "سبز", "پیلا"],
    correctAnswer: "لال"
  },
  {
    category: "Science",
    subject: "Physics",
    difficulty: "easy",
    question: "صوت کی رفتار کس میں زیادہ ہوتی ہے؟",
    options: ["ہوا", "پانی", "لوہا", "خلا"],
    correctAnswer: "لوہا"
  },
  {
    category: "Science",
    subject: "Chemistry",
    difficulty: "easy",
    question: "پانی کا ابلتا نقطہ (boiling point) کیا ہے؟",
    options: ["100°C", "0°C", "50°C", "212°C"],
    correctAnswer: "100°C"
  },
  {
    category: "Science",
    subject: "Biology",
    difficulty: "easy",
    question: "انسانی دل کے کتنے حصے (chambers) ہوتے ہیں؟",
    options: ["4", "2", "3", "5"],
    correctAnswer: "4"
  },
  {
    category: "Science",
    subject: "Physics",
    difficulty: "easy",
    question: "قوت کے اثر سے کسی چیز کی حرکت کی شرح میں تبدیلی کو کیا کہتے ہیں؟",
    options: ["Acceleration", "Speed", "Velocity", "Momentum"],
    correctAnswer: "Acceleration"
  },
  {
    category: "Science",
    subject: "Chemistry",
    difficulty: "easy",
    question: "تیزاب (acid) کا ذائقہ کیسا ہوتا ہے؟",
    options: ["کھٹا", "میٹھا", "نمکین", "تلخ"],
    correctAnswer: "کھٹا"
  },
  // Science Medium (8 more)
  {
    category: "Science",
    subject: "Physics",
    difficulty: "medium",
    question: "نیوٹن کا دوسرا قانون کیا کہتا ہے؟",
    options: ["F = ma", "Action = Reaction", "Every action has reaction", "F = G m1m2/r²"],
    correctAnswer: "F = ma"
  },
  {
    category: "Science",
    subject: "Chemistry",
    difficulty: "medium",
    question: "پی ایچ (pH) اسکیل کی رینج کیا ہے؟",
    options: ["0-14", "1-10", "0-7", "7-14"],
    correctAnswer: "0-14"
  },
  {
    category: "Science",
    subject: "Biology",
    difficulty: "medium",
    question: "فوٹو سنتھیسس کے لیے کون سی گیس ضروری ہے؟",
    options: ["کاربن ڈائی آکسائیڈ", "آکسیجن", "نائٹروجن", "ہائیڈروجن"],
    correctAnswer: "کاربن ڈائی آکسائیڈ"
  },
  {
    category: "Science",
    subject: "Physics",
    difficulty: "medium",
    question: "آئینے میں بننے والی تصویر کو کیا کہتے ہیں؟",
    options: ["Virtual image", "Real image", "Inverted image", "Upright image"],
    correctAnswer: "Virtual image"
  },
  {
    category: "Science",
    subject: "Chemistry",
    difficulty: "medium",
    question: "پانی کا سب سے بھاری آاسوٹوپ کون سا ہے؟",
    options: ["Tritium", "Deuterium", "Protium", "Oxygen-18"],
    correctAnswer: "Tritium"
  },
  {
    category: "Science",
    subject: "Biology",
    difficulty: "medium",
    question: "انسانی جسم میں سب سے بڑا عضو کون سا ہے؟",
    options: ["جلد", "جگر", "دماغ", "دل"],
    correctAnswer: "جلد"
  },
  {
    category: "Science",
    subject: "Physics",
    difficulty: "medium",
    question: "آواز کی رفتار ہوا میں کتنی ہوتی ہے؟",
    options: ["343 m/s", "300 m/s", "400 m/s", "500 m/s"],
    correctAnswer: "343 m/s"
  },
  {
    category: "Science",
    subject: "Chemistry",
    difficulty: "medium",
    question: "آکسیجن کا جوہری نمبر کیا ہے؟",
    options: ["8", "6", "7", "9"],
    correctAnswer: "8"
  },
  // Science Hard (6 more)
  {
    category: "Science",
    subject: "Physics",
    difficulty: "hard",
    question: "آئن سٹائن کا مشہور مساوات E=mc² میں c کیا ہے؟",
    options: ["روشنی کی رفتار", "صوت کی رفتار", "برقی رو", "کشش ثقل"],
    correctAnswer: "روشنی کی رفتار"
  },
  {
    category: "Science",
    subject: "Chemistry",
    difficulty: "hard",
    question: "پیریڈک ٹیبل میں سب سے زیادہ برقی منفی (electronegative) عنصر کون سا ہے؟",
    options: ["Fluorine", "Oxygen", "Chlorine", "Nitrogen"],
    correctAnswer: "Fluorine"
  },
  {
    category: "Science",
    subject: "Biology",
    difficulty: "hard",
    question: "DNA کا مکمل نام کیا ہے؟",
    options: ["Deoxyribonucleic acid", "Ribonucleic acid", "Deoxyribose nucleic acid", "Deoxyribose nuclear acid"],
    correctAnswer: "Deoxyribonucleic acid"
  },
  {
    category: "Science",
    subject: "Physics",
    difficulty: "hard",
    question: "کوانٹم میکانکس کے مطابق، روشنی کی نوعیت کیا ہے؟",
    options: ["ذرہ اور لہر دونوں", "صرف لہر", "صرف ذرہ", "انرجی"],
    correctAnswer: "ذرہ اور لہر دونوں"
  },
  {
    category: "Science",
    subject: "Chemistry",
    difficulty: "hard",
    question: "کاربن کے کتنے آاسوٹوپس پائے جاتے ہیں؟",
    options: ["3", "2", "4", "5"],
    correctAnswer: "3"
  },
  {
    category: "Science",
    subject: "Biology",
    difficulty: "hard",
    question: "انسانی جسم میں کتنی کروموسومز (chromosomes) ہوتی ہیں؟",
    options: ["46", "48", "44", "23"],
    correctAnswer: "46"
  },

  // COMPUTER (add 19) - total 25
  // Computer Easy (6 more)
  {
    category: "Computer",
    subject: "Basics",
    difficulty: "easy",
    question: "RAM کا مطلب کیا ہے؟",
    options: ["Random Access Memory", "Read Access Memory", "Readily Available Memory", "Randomly Accessed Memory"],
    correctAnswer: "Random Access Memory"
  },
  {
    category: "Computer",
    subject: "Hardware",
    difficulty: "easy",
    question: "کمپیوٹر کا 'دماغ' کسے کہتے ہیں؟",
    options: ["CPU", "RAM", "Hard Disk", "Motherboard"],
    correctAnswer: "CPU"
  },
  {
    category: "Computer",
    subject: "Software",
    difficulty: "easy",
    question: "Microsoft Excel کس قسم کا سافٹ ویئر ہے؟",
    options: ["Spreadsheet", "Word Processor", "Database", "Presentation"],
    correctAnswer: "Spreadsheet"
  },
  {
    category: "Computer",
    subject: "Internet",
    difficulty: "easy",
    question: "URL کا مطلب کیا ہے؟",
    options: ["Uniform Resource Locator", "Universal Resource Link", "Uniform Resource Link", "Universal Resource Locator"],
    correctAnswer: "Uniform Resource Locator"
  },
  {
    category: "Computer",
    subject: "Basics",
    difficulty: "easy",
    question: "Output device کی مثال کون سی ہے؟",
    options: ["Monitor", "Mouse", "Keyboard", "Scanner"],
    correctAnswer: "Monitor"
  },
  {
    category: "Computer",
    subject: "Storage",
    difficulty: "easy",
    question: "1 TB میں کتنے GB ہوتے ہیں؟",
    options: ["1024 GB", "1000 GB", "512 GB", "2048 GB"],
    correctAnswer: "1024 GB"
  },
  // Computer Medium (8 more)
  {
    category: "Computer",
    subject: "Programming",
    difficulty: "medium",
    question: "HTML کا مطلب کیا ہے؟",
    options: ["HyperText Markup Language", "HyperText Markdown Language", "HighText Markup Language", "Hyper Transfer Markup Language"],
    correctAnswer: "HyperText Markup Language"
  },
  {
    category: "Computer",
    subject: "OS",
    difficulty: "medium",
    question: "Windows کس قسم کا سافٹ ویئر ہے؟",
    options: ["Operating System", "Application", "Utility", "Firmware"],
    correctAnswer: "Operating System"
  },
  {
    category: "Computer",
    subject: "Networking",
    difficulty: "medium",
    question: "LAN کا مطلب کیا ہے؟",
    options: ["Local Area Network", "Large Area Network", "Long Area Network", "Low Area Network"],
    correctAnswer: "Local Area Network"
  },
  {
    category: "Computer",
    subject: "Programming",
    difficulty: "medium",
    question: "Which language is used for web development?",
    options: ["JavaScript", "C++", "Java", "Python"],
    correctAnswer: "JavaScript"
  },
  {
    category: "Computer",
    subject: "Database",
    difficulty: "medium",
    question: "SQL کا مطلب کیا ہے؟",
    options: ["Structured Query Language", "Simple Query Language", "Structured Question Language", "Standard Query Language"],
    correctAnswer: "Structured Query Language"
  },
  {
    category: "Computer",
    subject: "Hardware",
    difficulty: "medium",
    question: "SSD کس لیے استعمال ہوتا ہے؟",
    options: ["Storage", "Memory", "Processing", "Graphics"],
    correctAnswer: "Storage"
  },
  {
    category: "Computer",
    subject: "OS",
    difficulty: "medium",
    question: "Linux کس قسم کا OS ہے؟",
    options: ["Open Source", "Proprietary", "Commercial", "Closed Source"],
    correctAnswer: "Open Source"
  },
  {
    category: "Computer",
    subject: "Networking",
    difficulty: "medium",
    question: "IP کا مطلب کیا ہے؟",
    options: ["Internet Protocol", "Internal Protocol", "International Protocol", "Intranet Protocol"],
    correctAnswer: "Internet Protocol"
  },
  // Computer Hard (5 more)
  {
    category: "Computer",
    subject: "Programming",
    difficulty: "hard",
    question: "OOP کا مکمل نام کیا ہے؟",
    options: ["Object Oriented Programming", "Order Oriented Programming", "Object Operating Program", "Object Oriented Process"],
    correctAnswer: "Object Oriented Programming"
  },
  {
    category: "Computer",
    subject: "Algorithms",
    difficulty: "hard",
    question: "Big O notation کس لیے استعمال ہوتی ہے؟",
    options: ["Complexity analysis", "Data storage", "Network speed", "Memory size"],
    correctAnswer: "Complexity analysis"
  },
  {
    category: "Computer",
    subject: "Database",
    difficulty: "hard",
    question: "ACID کا 'C' کیا ہے؟",
    options: ["Consistency", "Concurrency", "Connection", "Control"],
    correctAnswer: "Consistency"
  },
  {
    category: "Computer",
    subject: "Security",
    difficulty: "hard",
    question: "DDoS کا مطلب کیا ہے؟",
    options: ["Distributed Denial of Service", "Direct Denial of Service", "Distributed Data of Service", "Direct Data of Service"],
    correctAnswer: "Distributed Denial of Service"
  },
  {
    category: "Computer",
    subject: "AI",
    difficulty: "hard",
    question: "Machine Learning کا سب سے بنیادی مقصد کیا ہے؟",
    options: ["Predictive modeling", "Data storage", "User interface", "Network security"],
    correctAnswer: "Predictive modeling"
  },

  // GENERAL KNOWLEDGE (add 19) - total 25
  // GK Easy (6 more)
  {
    category: "General Knowledge",
    subject: "World",
    difficulty: "easy",
    question: "دنیا کا سب سے چھوٹا براعظم کون سا ہے؟",
    options: ["آسٹریلیا", "یورپ", "انٹارکٹیکا", "ایشیا"],
    correctAnswer: "آسٹریلیا"
  },
  {
    category: "General Knowledge",
    subject: "Geography",
    difficulty: "easy",
    question: "دنیا کا سب سے لمبا دریا کون سا ہے؟",
    options: ["نیل", "ایمیزون", "یانگتسی", "مسسیپی"],
    correctAnswer: "نیل"
  },
  {
    category: "General Knowledge",
    subject: "Countries",
    difficulty: "easy",
    question: "دنیا کا سب سے زیادہ آبادی والا ملک کون سا ہے؟",
    options: ["چین", "بھارت", "امریکہ", "انڈونیشیا"],
    correctAnswer: "چین"
  },
  {
    category: "General Knowledge",
    subject: "Capitals",
    difficulty: "easy",
    question: "امریکہ کا دارالحکومت کیا ہے؟",
    options: ["Washington D.C.", "New York", "Los Angeles", "Chicago"],
    correctAnswer: "Washington D.C."
  },
  {
    category: "General Knowledge",
    subject: "World",
    difficulty: "easy",
    question: "اقوام متحدہ کا موجودہ سیکرٹری جنرل کون ہے؟ (as of 2026)",
    options: ["António Guterres", "Ban Ki-moon", "Kofi Annan", "Boutros Boutros-Ghali"],
    correctAnswer: "António Guterres"
  },
  {
    category: "General Knowledge",
    subject: "Science",
    difficulty: "easy",
    question: "چاند زمین سے کتنی دور ہے؟",
    options: ["3.84 × 10⁵ km", "1.5 × 10⁸ km", "4.5 × 10⁹ km", "2.5 × 10⁶ km"],
    correctAnswer: "3.84 × 10⁵ km"
  },
  // GK Medium (8 more)
  {
    category: "General Knowledge",
    subject: "History",
    difficulty: "medium",
    question: "برلن دیوار کب گری؟",
    options: ["1989", "1991", "1985", "1990"],
    correctAnswer: "1989"
  },
  {
    category: "General Knowledge",
    subject: "Geography",
    difficulty: "medium",
    question: "صحرائے صحارا کس براعظم میں ہے؟",
    options: ["افریقہ", "ایشیا", "یورپ", "آسٹریلیا"],
    correctAnswer: "افریقہ"
  },
  {
    category: "General Knowledge",
    subject: "Countries",
    difficulty: "medium",
    question: "جاپان کی کرنسی کیا ہے؟",
    options: ["ین", "وون", "ڈالر", "یورو"],
    correctAnswer: "ین"
  },
  {
    category: "General Knowledge",
    subject: "Capitals",
    difficulty: "medium",
    question: "آسٹریلیا کا دارالحکومت کون سا شہر ہے؟",
    options: ["کینبرا", "سڈنی", "ملبورن", "پرتھ"],
    correctAnswer: "کینبرا"
  },
  {
    category: "General Knowledge",
    subject: "World",
    difficulty: "medium",
    question: "گنیز بک آف ورلڈ ریکارڈز کس ملک نے شائع کی؟",
    options: ["برطانیہ", "امریکہ", "جرمنی", "فرانس"],
    correctAnswer: "برطانیہ"
  },
  {
    category: "General Knowledge",
    subject: "Sports",
    difficulty: "medium",
    question: "فیفا ورلڈ کپ کتنے سال بعد منعقد ہوتا ہے؟",
    options: ["4", "2", "3", "5"],
    correctAnswer: "4"
  },
  {
    category: "General Knowledge",
    subject: "Art",
    difficulty: "medium",
    question: "مونا لیزا پینٹنگ کس نے بنائی؟",
    options: ["لیونارڈو ڈا ونچی", "پابلو پکاسو", "ونسنٹ وین گوگ", "مائیکل اینجیلو"],
    correctAnswer: "لیونارڈو ڈا ونچی"
  },
  {
    category: "General Knowledge",
    subject: "Science",
    difficulty: "medium",
    question: "بجلی کا سب سے پہلا تجربہ کس نے کیا؟",
    options: ["بینجمن فرینکلن", "تھامس ایڈیسن", "نکولا ٹیسلا", "الیکسینڈر گراہم بیل"],
    correctAnswer: "بینجمن فرینکلن"
  },
  // GK Hard (5 more)
  {
    category: "General Knowledge",
    subject: "History",
    difficulty: "hard",
    question: "آزادی اعلامیہ (Declaration of Independence) پر کب دستخط ہوئے؟",
    options: ["1776", "1789", "1775", "1781"],
    correctAnswer: "1776"
  },
  {
    category: "General Knowledge",
    subject: "Geography",
    difficulty: "hard",
    question: "دنیا کا سب سے گہرا سمندر کون سا ہے؟",
    options: ["بحیرہ کا ریبین", "بحیرہ جنوبی چین", "بحر اوقیانوس", "بحر الکاہل"],
    correctAnswer: "بحر الکاہل"
  },
  {
    category: "General Knowledge",
    subject: "Countries",
    difficulty: "hard",
    question: "سب سے زیادہ سرحدی ممالک سے ملنے والا ملک کون سا ہے؟",
    options: ["چین", "روس", "برازیل", "بھارت"],
    correctAnswer: "چین"
  },
  {
    category: "General Knowledge",
    subject: "Economics",
    difficulty: "hard",
    question: "گروپ آف سات (G7) کے رکن ممالک کتنے ہیں؟",
    options: ["7", "6", "8", "5"],
    correctAnswer: "7"
  },
  {
    category: "General Knowledge",
    subject: "Literature",
    difficulty: "hard",
    question: "نوبل ادب انعام جیتنے والا پہلا اردو مصنف کون تھا؟",
    options: ["عبدالسلام", "علامہ اقبال", "فیض احمد فیض", "سر سید احمد خان"],
    correctAnswer: "عبدالسلام"
  },

  // ISLAMIC STUDIES (add 20) - total 25
  // Islamic Easy (5 more)
  {
    category: "Islamic Studies",
    subject: "Quran",
    difficulty: "easy",
    question: "قرآن مجید میں سب سے لمبی سورت کون سی ہے؟",
    options: ["البقرہ", "آل عمران", "النساء", "المائدہ"],
    correctAnswer: "البقرہ"
  },
  {
    category: "Islamic Studies",
    subject: "Prophets",
    difficulty: "easy",
    question: "حضرت آدم علیہ السلام کا پیشہ کیا تھا؟",
    options: ["کاشتکاری", "تجارت", "جانور پالنا", "دستکاری"],
    correctAnswer: "کاشتکاری"
  },
  {
    category: "Islamic Studies",
    subject: "Pillars",
    difficulty: "easy",
    question: "زکوٰۃ کس پر فرض ہے؟",
    options: ["مالدار مسلمان", "ہر مسلمان", "ہر انسان", "صرف مرد"],
    correctAnswer: "مالدار مسلمان"
  },
  {
    category: "Islamic Studies",
    subject: "Prayer",
    difficulty: "easy",
    question: "نماز میں سجدہ کتنی بار کیا جاتا ہے؟",
    options: ["2", "1", "3", "4"],
    correctAnswer: "2"
  },
  {
    category: "Islamic Studies",
    subject: "Holy Books",
    difficulty: "easy",
    question: "تورات کس نبی پر نازل ہوئی؟",
    options: ["حضرت موسیٰ", "حضرت داؤد", "حضرت عیسیٰ", "حضرت ابراہیم"],
    correctAnswer: "حضرت موسیٰ"
  },
  // Islamic Medium (10 more)
  {
    category: "Islamic Studies",
    subject: "Quran",
    difficulty: "medium",
    question: "سورہ فاتحہ کو کس نام سے بھی جانا جاتا ہے؟",
    options: ["ام الکتاب", "السبع المثانی", "اُم القرآن", "تمام اوپر"],
    correctAnswer: "تمام اوپر"
  },
  {
    category: "Islamic Studies",
    subject: "Prophets",
    difficulty: "medium",
    question: "حضرت عیسیٰ علیہ السلام کی والدہ کا نام کیا ہے؟",
    options: ["مریم", "آسیہ", "خدیجہ", "عائشہ"],
    correctAnswer: "مریم"
  },
  {
    category: "Islamic Studies",
    subject: "Pillars",
    difficulty: "medium",
    question: "حج کس پر فرض ہے؟",
    options: ["مالدار اور توانا", "ہر مسلمان", "صرف مرد", "صرف عورت"],
    correctAnswer: "مالدار اور توانا"
  },
  {
    category: "Islamic Studies",
    subject: "Prayer",
    difficulty: "medium",
    question: "نماز جمعہ میں کتنی رکعتیں ہیں؟",
    options: ["2", "4", "6", "8"],
    correctAnswer: "2"
  },
  {
    category: "Islamic Studies",
    subject: "Hadith",
    difficulty: "medium",
    question: "صحیح بخاری کس نے مرتب کی؟",
    options: ["امام بخاری", "امام مسلم", "امام ترمذی", "امام احمد"],
    correctAnswer: "امام بخاری"
  },
  {
    category: "Islamic Studies",
    subject: "History",
    difficulty: "medium",
    question: "غزوہ بدر کس سن ہجری میں ہوا؟",
    options: ["2 ہجری", "1 ہجری", "3 ہجری", "4 ہجری"],
    correctAnswer: "2 ہجری"
  },
  {
    category: "Islamic Studies",
    subject: "Quran",
    difficulty: "medium",
    question: "سورہ یٰسین کو کس نام سے پکارا جاتا ہے؟",
    options: ["قلب القرآن", "عروس القرآن", "سیدہ", "فاتحہ"],
    correctAnswer: "قلب القرآن"
  },
  {
    category: "Islamic Studies",
    subject: "Prophets",
    difficulty: "medium",
    question: "حضرت یوسف علیہ السلام کو کس عمر میں نبوت ملی؟",
    options: ["40", "30", "35", "45"],
    correctAnswer: "40"
  },
  {
    category: "Islamic Studies",
    subject: "Prayer",
    difficulty: "medium",
    question: "نماز میں تشہد کہاں پڑھی جاتی ہے؟",
    options: ["دوسری رکعت کے بعد", "پہلی رکعت کے بعد", "تیسری رکعت کے بعد", "آخری رکعت میں"],
    correctAnswer: "دوسری رکعت کے بعد"
  },
  {
    category: "Islamic Studies",
    subject: "Holy Books",
    difficulty: "medium",
    question: "انجیل کس نبی پر نازل ہوئی؟",
    options: ["حضرت عیسیٰ", "حضرت موسیٰ", "حضرت داؤد", "حضرت محمد"],
    correctAnswer: "حضرت عیسیٰ"
  },
  // Islamic Hard (5 more)
  {
    category: "Islamic Studies",
    subject: "Fiqh",
    difficulty: "hard",
    question: "فقہ میں 'اجماع' کا کیا مطلب ہے؟",
    options: ["امت کا اتفاق", "قیاس", "حدیث", "قرآن"],
    correctAnswer: "امت کا اتفاق"
  },
  {
    category: "Islamic Studies",
    subject: "Quran",
    difficulty: "hard",
    question: "سورہ کہف میں کتنے واقعات ہیں؟",
    options: ["4", "3", "5", "6"],
    correctAnswer: "4"
  },
  {
    category: "Islamic Studies",
    subject: "Hadith",
    difficulty: "hard",
    question: "صحیح مسلم میں کتنی احادیث ہیں؟",
    options: ["4000", "3000", "5000", "6000"],
    correctAnswer: "4000"
  },
  {
    category: "Islamic Studies",
    subject: "History",
    difficulty: "hard",
    question: "فتح مکہ کس سن ہجری میں ہوا؟",
    options: ["8 ہجری", "7 ہجری", "9 ہجری", "10 ہجری"],
    correctAnswer: "8 ہجری"
  },
  {
    category: "Islamic Studies",
    subject: "Prophets",
    difficulty: "hard",
    question: "حضرت ادریس علیہ السلام کا پیشہ کیا تھا؟",
    options: ["درزی", "کسان", "تجارت", "معلم"],
    correctAnswer: "درزی"
  },

  // PAKISTAN STUDIES (add 20) - total 25
  // Pakistan Easy (5 more)
  {
    category: "Pakistan Studies",
    subject: "History",
    difficulty: "easy",
    question: "قرارداد پاکستان کب منظور ہوئی؟",
    options: ["23 مارچ 1940", "14 اگست 1947", "27 رمضان 1947", "15 اگست 1947"],
    correctAnswer: "23 مارچ 1940"
  },
  {
    category: "Pakistan Studies",
    subject: "Geography",
    difficulty: "easy",
    question: "پاکستان کی بلند ترین چوٹی کون سی ہے؟",
    options: ["کے ٹو", "نانگا پربت", "را کا پوشی", "تریچ مر"],
    correctAnswer: "کے ٹو"
  },
  {
    category: "Pakistan Studies",
    subject: "Founder",
    difficulty: "easy",
    question: "قائد اعظم کا مزار کہاں ہے؟",
    options: ["کراچی", "لاہور", "اسلام آباد", "پشاور"],
    correctAnswer: "کراچی"
  },
  {
    category: "Pakistan Studies",
    subject: "Symbols",
    difficulty: "easy",
    question: "پاکستان کا قومی پرندہ کون سا ہے؟",
    options: ["چکور", "مور", "فاختہ", "عقاب"],
    correctAnswer: "چکور"
  },
  {
    category: "Pakistan Studies",
    subject: "Culture",
    difficulty: "easy",
    question: "پاکستان کا قومی لباس کیا ہے؟",
    options: ["شلوار قمیض", "کرتا", "سوٹ", "جرابہ"],
    correctAnswer: "شلوار قمیض"
  },
  // Pakistan Medium (10 more)
  {
    category: "Pakistan Studies",
    subject: "History",
    difficulty: "medium",
    question: "پاکستان کا پہلا آئین کب نافذ ہوا؟",
    options: ["1956", "1947", "1962", "1973"],
    correctAnswer: "1956"
  },
  {
    category: "Pakistan Studies",
    subject: "Geography",
    difficulty: "medium",
    question: "پاکستان کا سب سے بڑا صوبہ (رقبہ کے لحاظ سے) کون سا ہے؟",
    options: ["بلوچستان", "پنجاب", "سندھ", "خیبر پختونخوا"],
    correctAnswer: "بلوچستان"
  },
  {
    category: "Pakistan Studies",
    subject: "Economy",
    difficulty: "medium",
    question: "پاکستان کی قومی کرنسی کیا ہے؟",
    options: ["روپیہ", "ڈالر", "یورو", "پاؤنڈ"],
    correctAnswer: "روپیہ"
  },
  {
    category: "Pakistan Studies",
    subject: "History",
    difficulty: "medium",
    question: "پاکستان کا پہلا گورنر جنرل کون تھا؟",
    options: ["محمد علی جناح", "لیاقت علی خان", "سکندر مرزا", "غلام محمد"],
    correctAnswer: "محمد علی جناح"
  },
  {
    category: "Pakistan Studies",
    subject: "Geography",
    difficulty: "medium",
    question: "پاکستان کا سب سے بڑا شہر (آبادی کے لحاظ سے) کون سا ہے؟",
    options: ["کراچی", "لاہور", "فیصل آباد", "راولپنڈی"],
    correctAnswer: "کراچی"
  },
  {
    category: "Pakistan Studies",
    subject: "Sports",
    difficulty: "medium",
    question: "پاکستان نے کرکٹ ورلڈ کپ کب جیتا؟",
    options: ["1992", "1996", "1999", "2003"],
    correctAnswer: "1992"
  },
  {
    category: "Pakistan Studies",
    subject: "Culture",
    difficulty: "medium",
    question: "پاکستان کا قومی کھیل کیا ہے؟",
    options: ["ہاکی", "کرکٹ", "فٹبال", "کبڈی"],
    correctAnswer: "ہاکی"
  },
  {
    category: "Pakistan Studies",
    subject: "History",
    difficulty: "medium",
    question: "تحریک پاکستان کا مقصد کیا تھا؟",
    options: ["ایک علیحدہ مسلم ریاست", "ہندوستان میں مسلمانوں کے حقوق", "برطانوی حکومت کا خاتمہ", "آزاد ہندوستان"],
    correctAnswer: "ایک علیحدہ مسلم ریاست"
  },
  {
    category: "Pakistan Studies",
    subject: "Geography",
    difficulty: "medium",
    question: "پاکستان کا سب سے بڑا بند (dam) کون سا ہے؟",
    options: ["تربیلا", "منگلا", "وہار", "قادر آباد"],
    correctAnswer: "تربیلا"
  },
  {
    category: "Pakistan Studies",
    subject: "Economy",
    difficulty: "medium",
    question: "پاکستان کا قومی بینک کون سا ہے؟",
    options: ["اسٹیٹ بینک آف پاکستان", "نیشنل بینک آف پاکستان", "حبیب بینک", "یونائیٹڈ بینک"],
    correctAnswer: "اسٹیٹ بینک آف پاکستان"
  },
  // Pakistan Hard (5 more)
  {
    category: "Pakistan Studies",
    subject: "History",
    difficulty: "hard",
    question: "پاکستان کا دوسرا آئین کب نافذ ہوا؟",
    options: ["1962", "1956", "1973", "1985"],
    correctAnswer: "1962"
  },
  {
    category: "Pakistan Studies",
    subject: "Geography",
    difficulty: "hard",
    question: "پاکستان کی سب سے لمبی سرحد کس ملک سے ہے؟",
    options: ["بھارت", "افغانستان", "ایران", "چین"],
    correctAnswer: "بھارت"
  },
  {
    category: "Pakistan Studies",
    subject: "Military",
    difficulty: "hard",
    question: "پاکستان کا پہلا مارشل لا کس نے لگایا؟",
    options: ["اسکندر مرزا", "ایوب خان", "یحییٰ خان", "جنرل ضیاء"],
    correctAnswer: "اسکندر مرزا"
  },
  {
    category: "Pakistan Studies",
    subject: "Culture",
    difficulty: "hard",
    question: "پاکستان کا سب سے بڑا صوفی تہوار کہاں منعقد ہوتا ہے؟",
    options: ["مٹھن کوٹ", "لاہور", "ملتان", "کراچی"],
    correctAnswer: "مٹھن کوٹ"
  },
  {
    category: "Pakistan Studies",
    subject: "Economy",
    difficulty: "hard",
    question: "پاکستان کی سب سے بڑی برآمد کیا ہے؟",
    options: ["ٹیکسٹائل", "چاول", "چمڑہ", "سرجیکل"],
    correctAnswer: "ٹیکسٹائل"
  },
];

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('quizapp');
    const collection = db.collection('questions');
    
    // Clear existing questions
    const deleteResult = await collection.deleteMany({});
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing questions`);
    
    // Insert new questions
    const result = await collection.insertMany(pakistanQuestions);
    console.log(`✅ Inserted ${result.insertedCount} Pakistan textbook questions`);
    
    // Show summary
    const summary = await collection.aggregate([
      {
        $group: {
          _id: { category: '$category', difficulty: '$difficulty' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.category': 1, '_id.difficulty': 1 } }
    ]).toArray();
    
    console.log('\n📊 Questions Summary:');
    summary.forEach(item => {
      console.log(`   ${item._id.category} (${item._id.difficulty}): ${item.count} questions`);
    });
    
    console.log('\n✅ Total: 200 questions added successfully!');
    
    await client.close();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedDatabase();