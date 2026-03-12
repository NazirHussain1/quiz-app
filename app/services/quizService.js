const BASE_URL = "https://opentdb.com";

export async function fetchCategories() {
  try {
    const response = await fetch(`${BASE_URL}/api_category.php`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }
    
    const data = await response.json();
    return data.trivia_categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
}

export async function fetchQuestions({ category, difficulty, amount = 10 }) {
  try {
    let apiUrl = `${BASE_URL}/api.php?amount=${amount}&type=multiple`;
    
    if (category) {
      apiUrl += `&category=${category}`;
    }
    
    if (difficulty) {
      apiUrl += `&difficulty=${difficulty}`;
    }
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error("Failed to fetch questions");
    }
    
    const data = await response.json();
    
    if (data.response_code !== 0) {
      throw new Error("No questions available for this category");
    }
    
    return data.results;
  } catch (error) {
    console.error("Error fetching questions:", error);
    throw error;
  }
}
