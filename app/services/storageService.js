export function saveProgress(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving progress:", error);
  }
}

export function loadProgress(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error loading progress:", error);
    return null;
  }
}

export function removeProgress(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Error removing progress:", error);
  }
}

export function savePlayerName(name) {
  try {
    localStorage.setItem("playerName", name);
  } catch (error) {
    console.error("Error saving player name:", error);
  }
}

export function loadPlayerName() {
  try {
    return localStorage.getItem("playerName");
  } catch (error) {
    console.error("Error loading player name:", error);
    return null;
  }
}

export function saveTheme(theme) {
  try {
    localStorage.setItem("theme", theme);
  } catch (error) {
    console.error("Error saving theme:", error);
  }
}

export function loadTheme() {
  try {
    return localStorage.getItem("theme");
  } catch (error) {
    console.error("Error loading theme:", error);
    return null;
  }
}

export function saveSoundPreference(enabled) {
  try {
    localStorage.setItem("soundEnabled", enabled.toString());
  } catch (error) {
    console.error("Error saving sound preference:", error);
  }
}

export function loadSoundPreference() {
  try {
    const saved = localStorage.getItem("soundEnabled");
    return saved !== null ? saved === "true" : true;
  } catch (error) {
    console.error("Error loading sound preference:", error);
    return true;
  }
}
