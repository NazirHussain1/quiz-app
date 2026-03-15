# Requirements Document

## Introduction

This document specifies the requirements for the Custom Category Cards feature, which replaces the Open Trivia Database API category dropdown with custom category cards on the home page. The system enables users to select from five predefined categories (Matric, Intermediate, Programming, Islamic Studies, General Knowledge), then choose a subject, and finally take a quiz using questions from MongoDB. The feature maintains responsive design and dark mode compatibility while providing an improved user experience through visual category cards.

## Glossary

- **System**: The quiz application web interface and backend API
- **HomePage**: The landing page component displaying category cards
- **CategoryCard**: A Bootstrap card component representing a single quiz category
- **SubjectSelectionPage**: The page displaying available subjects for a selected category
- **QuizPage**: The page displaying quiz questions and managing quiz flow
- **MongoDB**: The database storing quiz questions with category, subject, and difficulty fields
- **Player**: A user taking the quiz
- **Category**: One of five predefined quiz categories (Matric, Intermediate, Programming, Islamic Studies, General Knowledge)
- **Subject**: A specific topic within a category (e.g., "Mathematics" within "Matric")
- **Difficulty**: The question difficulty level (easy, medium, or hard)

## Requirements

### Requirement 1: Category Display

**User Story:** As a player, I want to see available quiz categories as visual cards on the home page, so that I can easily identify and select a category that interests me.

#### Acceptance Criteria

1. WHEN the HomePage loads, THE System SHALL fetch unique categories from MongoDB
2. WHEN categories are fetched successfully, THE System SHALL display only categories that have questions in the database
3. THE System SHALL display each category as a Bootstrap card with an icon, name, and description
4. THE System SHALL arrange category cards in a responsive grid layout
5. WHEN displaying categories, THE System SHALL show exactly five predefined categories: "Matric", "Intermediate", "Programming", "Islamic Studies", and "General Knowledge"
6. WHILE the categories are loading, THE System SHALL display a loading indicator
7. IF category fetching fails, THEN THE System SHALL display an error message with retry option

### Requirement 2: Category Selection

**User Story:** As a player, I want to click on a category card to select it, so that I can proceed to choose a subject within that category.

#### Acceptance Criteria

1. WHEN a player clicks a CategoryCard, THE System SHALL validate that the player name is entered
2. IF the player name is empty, THEN THE System SHALL display an alert message "Please enter your name to start the quiz!" and prevent navigation
3. WHEN a player clicks a CategoryCard with a valid player name, THE System SHALL save the player name to localStorage
4. WHEN a player clicks a CategoryCard with a valid player name, THE System SHALL navigate to the SubjectSelectionPage with category and difficulty parameters
5. WHILE hovering over a CategoryCard, THE System SHALL display visual feedback indicating the card is clickable
6. THE System SHALL apply dark mode compatible styling to all CategoryCard components

### Requirement 3: Subject Fetching and Display

**User Story:** As a player, I want to see available subjects for my selected category, so that I can choose a specific topic for my quiz.

#### Acceptance Criteria

1. WHEN the SubjectSelectionPage loads, THE System SHALL extract the category parameter from the URL
2. WHEN the category parameter is valid, THE System SHALL fetch subjects from MongoDB filtered by the selected category
3. WHEN subjects are fetched successfully, THE System SHALL display them as a clickable list or cards
4. IF no subjects are available for the category, THEN THE System SHALL display the message "No subjects available for this category" and redirect to HomePage after 3 seconds
5. IF the category parameter is invalid or missing, THEN THE System SHALL redirect to HomePage with a notification
6. WHILE subjects are loading, THE System SHALL display a loading indicator
7. IF subject fetching fails, THEN THE System SHALL display an error message with retry and back navigation options

### Requirement 4: Subject Selection

**User Story:** As a player, I want to click on a subject to select it, so that I can start the quiz with questions from that specific subject.

#### Acceptance Criteria

1. WHEN a player clicks a subject, THE System SHALL navigate to the QuizPage with category, subject, and difficulty parameters
2. THE System SHALL preserve the player name in localStorage during navigation
3. THE System SHALL preserve the selected difficulty level during navigation
4. THE System SHALL preserve the selected category during navigation

### Requirement 5: Quiz Question Fetching

**User Story:** As a player, I want the quiz to load questions from MongoDB based on my selected category, subject, and difficulty, so that I receive relevant questions for my quiz.

#### Acceptance Criteria

1. WHEN the QuizPage loads, THE System SHALL extract category, subject, and difficulty parameters from the URL
2. WHEN all parameters are valid, THE System SHALL fetch 10 random questions from MongoDB matching the category, subject, and difficulty filters
3. IF any parameter is invalid or missing, THEN THE System SHALL redirect to HomePage with an error notification
4. IF no questions are available for the selected criteria, THEN THE System SHALL display an error message "No questions available for selected criteria" with back navigation option
5. WHEN questions are fetched successfully, THE System SHALL format each question with shuffled options
6. THE System SHALL validate that each fetched question has exactly 4 options
7. THE System SHALL validate that the correct answer is one of the 4 options
8. WHILE questions are loading, THE System SHALL display a loading indicator
9. IF question fetching fails, THEN THE System SHALL display an error message with retry option

### Requirement 6: Quiz Question Validation

**User Story:** As a system administrator, I want all quiz questions to be validated before display, so that players receive properly formatted questions.

#### Acceptance Criteria

1. THE System SHALL validate that each question belongs to the selected category
2. THE System SHALL validate that each question belongs to the selected subject
3. THE System SHALL validate that each question matches the selected difficulty level
4. THE System SHALL validate that each question has exactly 4 options
5. THE System SHALL validate that the correct answer exists within the options array

### Requirement 7: Player Name Management

**User Story:** As a player, I want my name to be saved when I start a quiz, so that my score can be recorded on the leaderboard.

#### Acceptance Criteria

1. WHEN a player enters their name on HomePage, THE System SHALL trim whitespace from the input
2. WHEN a player selects a category, THE System SHALL save the trimmed player name to localStorage
3. THE System SHALL retrieve the player name from localStorage when saving quiz scores
4. THE System SHALL prevent category selection if the player name is empty or contains only whitespace

### Requirement 8: Responsive Design

**User Story:** As a player using different devices, I want the category cards and subject selection to display properly on all screen sizes, so that I can use the quiz on any device.

#### Acceptance Criteria

1. THE System SHALL display category cards in a responsive grid that adapts to screen size
2. WHEN the screen width is large (≥992px), THE System SHALL display 3 category cards per row
3. WHEN the screen width is medium (≥768px and <992px), THE System SHALL display 2 category cards per row
4. WHEN the screen width is small (<768px), THE System SHALL display 1 category card per row
5. THE System SHALL ensure all text and icons remain readable on all screen sizes

### Requirement 9: Dark Mode Compatibility

**User Story:** As a player who prefers dark mode, I want all new UI components to support dark mode, so that I have a consistent visual experience.

#### Acceptance Criteria

1. THE System SHALL apply dark mode compatible colors to CategoryCard components
2. THE System SHALL apply dark mode compatible colors to SubjectSelectionPage components
3. WHEN dark mode is active, THE System SHALL ensure text contrast meets accessibility standards
4. WHEN dark mode is active, THE System SHALL apply appropriate hover effects to interactive elements

### Requirement 10: API Endpoints

**User Story:** As a developer, I want API endpoints to fetch categories and subjects from MongoDB, so that the frontend can display dynamic data.

#### Acceptance Criteria

1. THE System SHALL provide a GET endpoint at `/api/questions/categories` that returns unique categories
2. WHEN `/api/questions/categories` is called, THE System SHALL query MongoDB for distinct category values
3. THE System SHALL provide a GET endpoint at `/api/questions/subjects` that accepts a category query parameter
4. WHEN `/api/questions/subjects?category=X` is called, THE System SHALL return distinct subjects for category X
5. THE System SHALL provide a GET endpoint at `/api/questions` that accepts category, subject, difficulty, and limit parameters
6. WHEN `/api/questions` is called with valid parameters, THE System SHALL return random questions matching all filters
7. THE System SHALL validate all query parameters on the server side
8. IF invalid parameters are provided, THEN THE System SHALL return an error response with appropriate HTTP status code
9. THE System SHALL implement rate limiting on all API endpoints to prevent abuse

### Requirement 11: Error Recovery

**User Story:** As a player, I want clear error messages and recovery options when something goes wrong, so that I can continue using the quiz application.

#### Acceptance Criteria

1. WHEN an API request fails, THE System SHALL display a user-friendly error message
2. WHEN an error occurs, THE System SHALL provide a retry button to attempt the operation again
3. WHEN an error occurs on SubjectSelectionPage, THE System SHALL provide a back button to return to HomePage
4. WHEN an error occurs on QuizPage, THE System SHALL provide a back button to return to SubjectSelectionPage
5. IF a category has no subjects, THEN THE System SHALL automatically redirect to HomePage after 3 seconds with a notification

### Requirement 12: Data Integrity

**User Story:** As a system administrator, I want the system to maintain data integrity during quiz operations, so that players receive accurate questions and scores are recorded correctly.

#### Acceptance Criteria

1. THE System SHALL ensure that only questions matching all filter criteria are returned
2. THE System SHALL ensure that the number of questions returned never exceeds the requested limit
3. THE System SHALL ensure that each question's correct answer is always included in the options array
4. THE System SHALL ensure that player names are sanitized to prevent XSS attacks
5. THE System SHALL ensure that MongoDB queries are validated to prevent injection attacks

### Requirement 13: Leaderboard Integration

**User Story:** As a player, I want my quiz results to be saved with category and subject information, so that leaderboards can show detailed performance data.

#### Acceptance Criteria

1. WHEN a player completes a quiz, THE System SHALL save the score to localStorage
2. WHEN saving a score, THE System SHALL include the category name
3. WHEN saving a score, THE System SHALL include the subject name
4. WHEN saving a score, THE System SHALL include the difficulty level
5. WHEN saving a score, THE System SHALL include the player name from localStorage

### Requirement 14: Navigation State Preservation

**User Story:** As a player, I want my selections to be preserved as I navigate through the quiz flow, so that I don't lose my progress or have to re-enter information.

#### Acceptance Criteria

1. WHEN navigating from HomePage to SubjectSelectionPage, THE System SHALL preserve the selected difficulty in URL parameters
2. WHEN navigating from SubjectSelectionPage to QuizPage, THE System SHALL preserve category, subject, and difficulty in URL parameters
3. THE System SHALL maintain player name in localStorage throughout the entire quiz flow
4. WHEN using browser back button, THE System SHALL restore the previous page state correctly
