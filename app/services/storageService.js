/**
 * Storage Service - Handles all localStorage operations
 */

/**
 * Save quiz progress to localStorage
 * @param {string} key - Storage key
 * @param {Object} data - Progress data to save
 */
export function saveProgress(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving progress:", error);
  }
}

/**
 * Load quiz progress from localStorage
 * @param {string} key - Storage key
 * @returns {Object|null} Saved progress or null
 */
export function loadProgress(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error loading progress:", error);
    return null;
  }
}

/**
 * Remove quiz progress from localStorage
 * @param {string} key - Storage key
 */
export function removeProgress(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Error removing progress:", error);
  }
}

/**
 * Save player name to localStorage
 * @param {string} name - Player name
 */
export function savePlayerName(name) {
  try {
    localStorage.setItem("playerName", name);
  } catch (error) {
    console.error("Error saving player name:", error);
  }
}

/**
 * Load player name from localStorage
 * @returns {string|null} Player name or null
 */
export function loadPlayerName() {
  try {
    return localStorage.getItem("playerName");
  } catch (error) {
    console.error("Error loading player name:", error);
    return null;
  }
}

/**
 * Save theme preference to localStorage
 * @param {string} theme - Theme name (light or dark)
 */
export function saveTheme(theme) {
  try {
    localStorage.setItem("theme", theme);
  } catch (error) {
    console.error("Error saving theme:", error);
  }
}

/**
 * Load theme preference from localStorage
 * @returns {string|null} Theme name or null
 */
export function loadTheme() {
  try {
    return localStorage.getItem("theme");
  } catch (error) {
    console.error("Error loading theme:", error);
    return null;
  }
}

/**
 * Save sound preference to localStorage
 * @param {boolean} enabled - Sound enabled state
 */
export function saveSoundPreference(enabled) {
  try {
    localStorage.setItem("soundEnabled", enabled.toString());
  } catch (error) {
    console.error("Error saving sound preference:", error);
  }
}

/**
 * Load sound preference from localStorage
 * @returns {boolean} Sound enabled state
 */
export function loadSoundPreference() {
  try {
    const saved = localStorage.getItem("soundEnabled");
    return saved !== null ? saved === "true" : true;
  } catch (error) {
    console.error("Error loading sound preference:", error);
    return true;
  }
}
