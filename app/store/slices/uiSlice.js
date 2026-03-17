import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    theme: 'light',
    soundEnabled: true,
    loading: false,
    error: null
  },
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', action.payload);
        document.documentElement.setAttribute('data-bs-theme', action.payload);
      }
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', state.theme);
        document.documentElement.setAttribute('data-bs-theme', state.theme);
      }
    },
    setSoundEnabled: (state, action) => {
      state.soundEnabled = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('soundEnabled', action.payload.toString());
      }
    },
    toggleSound: (state) => {
      state.soundEnabled = !state.soundEnabled;
      if (typeof window !== 'undefined') {
        localStorage.setItem('soundEnabled', state.soundEnabled.toString());
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    initializeTheme: (state) => {
      if (typeof window !== 'undefined') {
        const savedTheme = localStorage.getItem('theme') || 'light';
        state.theme = savedTheme;
        document.documentElement.setAttribute('data-bs-theme', savedTheme);
      }
    },
    initializeSound: (state) => {
      if (typeof window !== 'undefined') {
        const savedSound = localStorage.getItem('soundEnabled');
        state.soundEnabled = savedSound !== 'false';
      }
    }
  }
});

export const {
  setTheme,
  toggleTheme,
  setSoundEnabled,
  toggleSound,
  setLoading,
  setError,
  clearError,
  initializeTheme,
  initializeSound
} = uiSlice.actions;

export default uiSlice.reducer;
