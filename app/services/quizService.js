/**
 * Quiz Service - Handles all API calls related to quiz questions and categories
 */

const BASE_URL = "https://opentdb.com";

/**
 * Fetch quiz categories from Open Trivia DB
 * @returns {Promise<Array>} Array of category objects
 */
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

/**
 * Fetch quiz questions based on parameters
 * @param {Object} params - Query parameters
 * @param {string} params.category - Category ID
 * @param {string} params.difficulty - Difficulty level (easy, medium, hard)
 * @param {number} params.amount - Number of questions (default: 10)
 * @returns {Promise<Array>} Array of formatted question objects
 */
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
