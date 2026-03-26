const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

const pakistanQuestions = [
  // MATHEMATICS - Easy (Matric Level) - 10 questions
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

  // MATHEMATICS - Medium (FSc Level) - 10 questions
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

  // ENGLISH - Easy (Matric Level) - 10 questions
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

  // SCIENCE - Easy (Matric Level) - 10 questions
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

  // COMPUTER - Easy (Matric Level) - 10 questions
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

  // GENERAL KNOWLEDGE - Easy (Matric Level) - 10 questions
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

  // ISLAMIC STUDIES - Easy (Matric Level) - 10 questions
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
    options: ["حضرت محمد ﷺ", "حضرت عیسیٰ علیہ السلام", "حضرت موسیٰ علیہ السلام", "حضرت ابراہیم علیہ السلام"],
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

  // PAKISTAN STUDIES - Easy (Matric Level) - 10 questions
  {
    category: "Pakistan Studies",
    subject: "History",
    difficulty: "easy",
    question: "پاکستان کب وجود میں آیا؟",
    options: ["14 اگست 1947", "15 اگست 1947", "14 اگست 1948", "23 مارچ 1947"],
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
    
    await client.close();
    console.log('\n✅ Database seeded successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedDatabase();
