const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

// 10 questions per subject - Pakistan textbook based
const questions = [
  // MATHEMATICS (10 questions)
  {
    subject: "Mathematics",
    difficulty: "easy",
    question: "اگر 2x + 5 = 15 ہو تو x کی قدر کیا ہے؟ (If 2x + 5 = 15, what is x?)",
    options: ["5", "10", "7", "3"],
    correctAnswer: 0,
    topic: "Algebra"
  },
  {
    subject: "Mathematics",
    difficulty: "easy",
    question: "مثلث کے تینوں زاویوں کا مجموعہ کتنا ہوتا ہے؟ (Sum of angles in triangle?)",
    options: ["180°", "360°", "90°", "270°"],
    correctAnswer: 0,
    topic: "Geometry"
  },
  {
    subject: "Mathematics",
    difficulty: "easy",
    question: "15 × 12 = ?",
    options: ["180", "170", "190", "160"],
    correctAnswer: 0,
    topic: "Arithmetic"
  },
  {
    subject: "Mathematics",
    difficulty: "medium",
    question: "1/2 + 1/4 = ?",
    options: ["3/4", "1/4", "2/4", "1/2"],
    correctAnswer: 0,
    topic: "Fractions"
  },
  {
    subject: "Mathematics",
    difficulty: "easy",
    question: "مربع کی چاروں اضلاع برابر ہوتی ہیں۔ اگر ایک ضلع 5 سینٹی میٹر ہو تو محیط کیا ہوگا؟",
    options: ["20 cm", "25 cm", "15 cm", "10 cm"],
    correctAnswer: 0,
    topic: "Geometry"
  },
  {
    subject: "Mathematics",
    difficulty: "medium",
    question: "50 کا 20% کتنا ہے؟ (What is 20% of 50?)",
    options: ["10", "20", "5", "15"],
    correctAnswer: 0,
    topic: "Percentage"
  },
  {
    subject: "Mathematics",
    difficulty: "medium",
    question: "اگر a = 3 اور b = 4 ہو تو a² + b² = ?",
    options: ["25", "49", "16", "9"],
    correctAnswer: 0,
    topic: "Algebra"
  },
  {
    subject: "Mathematics",
    difficulty: "hard",
    question: "دائرے کا رقبہ πr² ہے۔ اگر r = 7 ہو تو رقبہ کیا ہوگا؟ (π = 22/7)",
    options: ["154", "144", "164", "174"],
    correctAnswer: 0,
    topic: "Geometry"
  },
  {
    subject: "Mathematics",
    difficulty: "hard",
    question: "Solve: 3x - 7 = 2x + 5",
    options: ["12", "10", "8", "6"],
    correctAnswer: 0,
    topic: "Algebra"
  },
  {
    subject: "Mathematics",
    difficulty: "medium",
    question: "100 میں سے 25 کم کرنے پر کتنا رہ جائے گا؟",
    options: ["75", "80", "70", "65"],
    correctAnswer: 0,
    topic: "Arithmetic"
  },

  // ENGLISH (10 questions)
  {
    subject: "English",
    difficulty: "easy",
    question: "Choose the correct article: ___ apple a day keeps the doctor away.",
    options: ["An", "A", "The", "No article"],
    correctAnswer: 0,
    topic: "Articles"
  },
  {
    subject: "English",
    difficulty: "easy",
    question: "What is the plural of 'child'?",
    options: ["Children", "Childs", "Childes", "Childrens"],
    correctAnswer: 0,
    topic: "Grammar"
  },
  {
    subject: "English",
    difficulty: "easy",
    question: "I ___ to school every day.",
    options: ["go", "goes", "going", "gone"],
    correctAnswer: 0,
    topic: "Tenses"
  },
  {
    subject: "English",
    difficulty: "medium",
    question: "Choose the correct pronoun: ___ is my book.",
    options: ["This", "These", "Those", "Them"],
    correctAnswer: 0,
    topic: "Pronouns"
  },
  {
    subject: "English",
    difficulty: "medium",
    question: "The cat is ___ the table.",
    options: ["on", "in", "at", "by"],
    correctAnswer: 0,
    topic: "Prepositions"
  },
  {
    subject: "English",
    difficulty: "easy",
    question: "What is the opposite of 'hot'?",
    options: ["Cold", "Warm", "Cool", "Freezing"],
    correctAnswer: 0,
    topic: "Vocabulary"
  },
  {
    subject: "English",
    difficulty: "hard",
    question: "She ___ her homework when I called her.",
    options: ["was doing", "is doing", "does", "did"],
    correctAnswer: 0,
    topic: "Tenses"
  },
  {
    subject: "English",
    difficulty: "medium",
    question: "Choose the correct sentence:",
    options: ["He is taller than me.", "He is more tall than me.", "He is tall than me.", "He taller than me."],
    correctAnswer: 0,
    topic: "Grammar"
  },
  {
    subject: "English",
    difficulty: "hard",
    question: "Identify the verb: 'The quick brown fox jumps over the lazy dog.'",
    options: ["jumps", "quick", "brown", "lazy"],
    correctAnswer: 0,
    topic: "Grammar"
  },
  {
    subject: "English",
    difficulty: "medium",
    question: "What is the past tense of 'write'?",
    options: ["wrote", "writed", "written", "writing"],
    correctAnswer: 0,
    topic: "Tenses"
  },

  // SCIENCE (10 questions)
  {
    subject: "Science",
    difficulty: "easy",
    question: "پانی کا کیمیائی فارمولا کیا ہے؟ (Chemical formula of water?)",
    options: ["H₂O", "CO₂", "O₂", "H₂"],
    correctAnswer: 0,
    topic: "Chemistry"
  },
  {
    subject: "Science",
    difficulty: "easy",
    question: "انسانی جسم میں کتنی ہڈیاں ہوتی ہیں؟ (How many bones in human body?)",
    options: ["206", "205", "207", "200"],
    correctAnswer: 0,
    topic: "Biology"
  },
  {
    subject: "Science",
    difficulty: "easy",
    question: "روشنی کی رفتار کتنی ہے؟ (Speed of light?)",
    options: ["3 × 10⁸ m/s", "3 × 10⁶ m/s", "3 × 10⁷ m/s", "3 × 10⁹ m/s"],
    correctAnswer: 0,
    topic: "Physics"
  },
  {
    subject: "Science",
    difficulty: "medium",
    question: "فوٹو سنتھیسز کے عمل میں کیا پیدا ہوتا ہے؟ (What is produced in photosynthesis?)",
    options: ["Oxygen", "Carbon dioxide", "Nitrogen", "Hydrogen"],
    correctAnswer: 0,
    topic: "Biology"
  },
  {
    subject: "Science",
    difficulty: "medium",
    question: "نمک کا کیمیائی نام کیا ہے؟ (Chemical name of salt?)",
    options: ["Sodium Chloride", "Sodium Carbonate", "Calcium Chloride", "Potassium Chloride"],
    correctAnswer: 0,
    topic: "Chemistry"
  },
  {
    subject: "Science",
    difficulty: "easy",
    question: "زمین کا قدرتی سیٹلائٹ کون سا ہے؟ (Earth's natural satellite?)",
    options: ["Moon", "Sun", "Mars", "Venus"],
    correctAnswer: 0,
    topic: "Physics"
  },
  {
    subject: "Science",
    difficulty: "hard",
    question: "DNA کا مکمل نام کیا ہے؟",
    options: ["Deoxyribonucleic Acid", "Diribonucleic Acid", "Deoxyribose Acid", "Deoxyribonuclear Acid"],
    correctAnswer: 0,
    topic: "Biology"
  },
  {
    subject: "Science",
    difficulty: "hard",
    question: "نیوٹن کا پہلا قانون کیا ہے؟",
    options: ["Law of Inertia", "Law of Acceleration", "Law of Action-Reaction", "Law of Gravity"],
    correctAnswer: 0,
    topic: "Physics"
  },
  {
    subject: "Science",
    difficulty: "medium",
    question: "خون کا رنگ سرخ کیوں ہوتا ہے؟",
    options: ["Hemoglobin", "Plasma", "White cells", "Platelets"],
    correctAnswer: 0,
    topic: "Biology"
  },
  {
    subject: "Science",
    difficulty: "hard",
    question: "تیزاب اور بیس کے رد عمل سے کیا بنتا ہے؟",
    options: ["Salt and Water", "Only Salt", "Only Water", "Gas"],
    correctAnswer: 0,
    topic: "Chemistry"
  },

  // COMPUTER (10 questions)
  {
    subject: "Computer",
    difficulty: "easy",
    question: "CPU کا مطلب کیا ہے؟ (What does CPU stand for?)",
    options: ["Central Processing Unit", "Computer Processing Unit", "Central Program Unit", "Computer Program Unit"],
    correctAnswer: 0,
    topic: "Hardware"
  },
  {
    subject: "Computer",
    difficulty: "easy",
    question: "کمپیوٹر کی یاداشت کو کیا کہتے ہیں؟",
    options: ["Memory/RAM", "CPU", "Monitor", "Keyboard"],
    correctAnswer: 0,
    topic: "Hardware"
  },
  {
    subject: "Computer",
    difficulty: "easy",
    question: "انٹرنیٹ کیا ہے؟ (What is Internet?)",
    options: ["Network of networks", "A computer", "A software", "A website"],
    correctAnswer: 0,
    topic: "Internet"
  },
  {
    subject: "Computer",
    difficulty: "medium",
    question: "1 GB = ? MB",
    options: ["1024 MB", "1000 MB", "512 MB", "2048 MB"],
    correctAnswer: 0,
    topic: "Storage"
  },
  {
    subject: "Computer",
    difficulty: "medium",
    question: "MS Word کس قسم کا سافٹ ویئر ہے؟",
    options: ["Word Processor", "Spreadsheet", "Database", "Browser"],
    correctAnswer: 0,
    topic: "Software"
  },
  {
    subject: "Computer",
    difficulty: "easy",
    question: "کمپیوٹر کی بنیادی زبان کون سی ہے؟",
    options: ["Binary (0,1)", "English", "Urdu", "C++"],
    correctAnswer: 0,
    topic: "Basics"
  },
  {
    subject: "Computer",
    difficulty: "hard",
    question: "HTML کا مطلب کیا ہے؟",
    options: ["HyperText Markup Language", "High Text Markup Language", "HyperText Machine Language", "Home Tool Markup Language"],
    correctAnswer: 0,
    topic: "Internet"
  },
  {
    subject: "Computer",
    difficulty: "hard",
    question: "Operating System کی مثال کون سی ہے؟",
    options: ["Windows", "MS Word", "Chrome", "Photoshop"],
    correctAnswer: 0,
    topic: "Software"
  },
  {
    subject: "Computer",
    difficulty: "medium",
    question: "کمپیوٹر وائرس کیا ہے؟",
    options: ["Harmful program", "Hardware", "Memory", "Storage device"],
    correctAnswer: 0,
    topic: "Software"
  },
  {
    subject: "Computer",
    difficulty: "medium",
    question: "Input device کی مثال کون سی ہے؟",
    options: ["Keyboard", "Monitor", "Printer", "Speaker"],
    correctAnswer: 0,
    topic: "Hardware"
  },

  // GENERAL KNOWLEDGE (10 questions)
  {
    subject: "General Knowledge",
    difficulty: "easy",
    question: "پاکستان کا دارالحکومت کون سا ہے؟ (Capital of Pakistan?)",
    options: ["Islamabad", "Karachi", "Lahore", "Peshawar"],
    correctAnswer: 0,
    topic: "Pakistan"
  },
  {
    subject: "General Knowledge",
    difficulty: "easy",
    question: "دنیا کا سب سے بڑا ملک کون سا ہے؟ (Largest country?)",
    options: ["Russia", "China", "USA", "Canada"],
    correctAnswer: 0,
    topic: "World"
  },
  {
    subject: "General Knowledge",
    difficulty: "easy",
    question: "سال میں کتنے مہینے ہوتے ہیں؟ (Months in a year?)",
    options: ["12", "10", "11", "13"],
    correctAnswer: 0,
    topic: "General"
  },
  {
    subject: "General Knowledge",
    difficulty: "medium",
    question: "پاکستان کب آزاد ہوا؟ (When did Pakistan get independence?)",
    options: ["14 August 1947", "15 August 1947", "14 August 1948", "15 August 1946"],
    correctAnswer: 0,
    topic: "Pakistan"
  },
  {
    subject: "General Knowledge",
    difficulty: "medium",
    question: "دنیا کا سب سے اونچا پہاڑ کون سا ہے؟",
    options: ["Mount Everest", "K2", "Nanga Parbat", "Kilimanjaro"],
    correctAnswer: 0,
    topic: "Geography"
  },
  {
    subject: "General Knowledge",
    difficulty: "easy",
    question: "پاکستان کی قومی زبان کون سی ہے؟",
    options: ["Urdu", "English", "Punjabi", "Sindhi"],
    correctAnswer: 0,
    topic: "Pakistan"
  },
  {
    subject: "General Knowledge",
    difficulty: "hard",
    question: "اقوام متحدہ کا صدر دفتر کہاں ہے؟",
    options: ["New York", "London", "Paris", "Geneva"],
    correctAnswer: 0,
    topic: "World"
  },
  {
    subject: "General Knowledge",
    difficulty: "hard",
    question: "پاکستان کا قومی کھیل کون سا ہے؟",
    options: ["Hockey", "Cricket", "Football", "Squash"],
    correctAnswer: 0,
    topic: "Pakistan"
  },
  {
    subject: "General Knowledge",
    difficulty: "medium",
    question: "دنیا کا سب سے بڑا سمندر کون سا ہے؟",
    options: ["Pacific Ocean", "Atlantic Ocean", "Indian Ocean", "Arctic Ocean"],
    correctAnswer: 0,
    topic: "Geography"
  },
  {
    subject: "General Knowledge",
    difficulty: "medium",
    question: "پاکستان میں کتنے صوبے ہیں؟",
    options: ["4", "5", "3", "6"],
    correctAnswer: 0,
    topic: "Pakistan"
  },

  // ISLAMIC STUDIES (10 questions)
  {
    subject: "Islamic Studies",
    difficulty: "easy",
    question: "اسلام کے کتنے ارکان ہیں؟ (Pillars of Islam?)",
    options: ["5", "4", "6", "7"],
    correctAnswer: 0,
    topic: "Basics"
  },
  {
    subject: "Islamic Studies",
    difficulty: "easy",
    question: "پہلے نبی کون تھے؟ (First Prophet?)",
    options: ["Hazrat Adam (AS)", "Hazrat Nuh (AS)", "Hazrat Ibrahim (AS)", "Hazrat Musa (AS)"],
    correctAnswer: 0,
    topic: "Prophets"
  },
  {
    subject: "Islamic Studies",
    difficulty: "easy",
    question: "آخری نبی کون ہیں؟ (Last Prophet?)",
    options: ["Hazrat Muhammad (PBUH)", "Hazrat Isa (AS)", "Hazrat Musa (AS)", "Hazrat Ibrahim (AS)"],
    correctAnswer: 0,
    topic: "Prophets"
  },
  {
    subject: "Islamic Studies",
    difficulty: "medium",
    question: "قرآن پاک میں کتنی سورتیں ہیں؟ (Surahs in Quran?)",
    options: ["114", "110", "120", "100"],
    correctAnswer: 0,
    topic: "Quran"
  },
  {
    subject: "Islamic Studies",
    difficulty: "medium",
    question: "نماز دن میں کتنی بار فرض ہے؟",
    options: ["5", "3", "4", "6"],
    correctAnswer: 0,
    topic: "Prayer"
  },
  {
    subject: "Islamic Studies",
    difficulty: "easy",
    question: "اسلام کی پہلی مسجد کون سی ہے؟",
    options: ["Masjid Quba", "Masjid Nabawi", "Masjid Haram", "Masjid Aqsa"],
    correctAnswer: 0,
    topic: "History"
  },
  {
    subject: "Islamic Studies",
    difficulty: "hard",
    question: "حج کس ہجری سال میں فرض ہوا؟",
    options: ["9 Hijri", "8 Hijri", "10 Hijri", "7 Hijri"],
    correctAnswer: 0,
    topic: "Pillars"
  },
  {
    subject: "Islamic Studies",
    difficulty: "hard",
    question: "قرآن پاک کی پہلی وحی کہاں نازل ہوئی؟",
    options: ["Ghaar-e-Hira", "Ghaar-e-Saur", "Masjid Nabawi", "Masjid Haram"],
    correctAnswer: 0,
    topic: "Quran"
  },
  {
    subject: "Islamic Studies",
    difficulty: "medium",
    question: "زکوٰۃ کس پر فرض ہے؟",
    options: ["Sahib-e-Nisab", "Everyone", "Only rich", "Only poor"],
    correctAnswer: 0,
    topic: "Pillars"
  },
  {
    subject: "Islamic Studies",
    difficulty: "medium",
    question: "رمضان کس اسلامی مہینے میں آتا ہے؟",
    options: ["9th", "8th", "10th", "7th"],
    correctAnswer: 0,
    topic: "Basics"
  },

  // PAKISTAN STUDIES (10 questions)
  {
    subject: "Pakistan Studies",
    difficulty: "easy",
    question: "قائد اعظم کا اصل نام کیا تھا؟ (Quaid-e-Azam's real name?)",
    options: ["Muhammad Ali Jinnah", "Liaquat Ali Khan", "Allama Iqbal", "Fatima Jinnah"],
    correctAnswer: 0,
    topic: "Founder"
  },
  {
    subject: "Pakistan Studies",
    difficulty: "easy",
    question: "پاکستان کا قومی پرندہ کون سا ہے؟",
    options: ["Chakor", "Parrot", "Eagle", "Pigeon"],
    correctAnswer: 0,
    topic: "Symbols"
  },
  {
    subject: "Pakistan Studies",
    difficulty: "easy",
    question: "پاکستان کا قومی پھول کون سا ہے؟",
    options: ["Jasmine", "Rose", "Lily", "Sunflower"],
    correctAnswer: 0,
    topic: "Symbols"
  },
  {
    subject: "Pakistan Studies",
    difficulty: "medium",
    question: "پاکستان کا پہلا وزیر اعظم کون تھا؟",
    options: ["Liaquat Ali Khan", "Muhammad Ali Jinnah", "Khawaja Nazimuddin", "Ayub Khan"],
    correctAnswer: 0,
    topic: "History"
  },
  {
    subject: "Pakistan Studies",
    difficulty: "medium",
    question: "پاکستان کا سب سے بڑا صوبہ کون سا ہے؟",
    options: ["Balochistan", "Punjab", "Sindh", "KPK"],
    correctAnswer: 0,
    topic: "Geography"
  },
  {
    subject: "Pakistan Studies",
    difficulty: "easy",
    question: "پاکستان کا قومی ترانہ کس نے لکھا؟",
    options: ["Hafeez Jalandhari", "Allama Iqbal", "Faiz Ahmed Faiz", "Ahmad Faraz"],
    correctAnswer: 0,
    topic: "Symbols"
  },
  {
    subject: "Pakistan Studies",
    difficulty: "hard",
    question: "پاکستان کا پہلا آئین کب بنا؟",
    options: ["1956", "1947", "1962", "1973"],
    correctAnswer: 0,
    topic: "History"
  },
  {
    subject: "Pakistan Studies",
    difficulty: "hard",
    question: "پاکستان کا سب سے اونچا پہاڑ کون سا ہے؟",
    options: ["K2", "Nanga Parbat", "Tirich Mir", "Rakaposhi"],
    correctAnswer: 0,
    topic: "Geography"
  },
  {
    subject: "Pakistan Studies",
    difficulty: "medium",
    question: "پاکستان کا سب سے بڑا شہر کون سا ہے؟",
    options: ["Karachi", "Lahore", "Islamabad", "Faisalabad"],
    correctAnswer: 0,
    topic: "Geography"
  },
  {
    subject: "Pakistan Studies",
    difficulty: "medium",
    question: "علامہ اقبال کو کیا کہا جاتا ہے؟",
    options: ["Poet of the East", "Father of Nation", "Quaid-e-Azam", "National Poet"],
    correctAnswer: 0,
    topic: "History"
  }
];

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('quizapp');
    const collection = db.collection('questions');

    // Delete all existing questions
    const deleteResult = await collection.deleteMany({});
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing questions`);

    // Add category field to each question (same as subject for now)
    const questionsWithCategory = questions.map(q => ({
      ...q,
      category: q.subject,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    // Insert new questions
    const result = await collection.insertMany(questionsWithCategory);
    console.log(`✅ Inserted ${result.insertedCount} Pakistan textbook questions`);

    // Count questions by subject
    const subjects = await collection.distinct('subject');
    console.log('\n📊 Questions Summary:');
    for (const subject of subjects) {
      const count = await collection.countDocuments({ subject });
      console.log(`   ${subject}: ${count} questions`);
    }

    console.log(`\n✅ Total: ${result.insertedCount} questions added successfully!\n`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

seedDatabase();
