const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

const pakistanQuestions = [
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
    
    console.log('\n✅ Total: 50 questions added successfully!');
    
    await client.close();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedDatabase();
