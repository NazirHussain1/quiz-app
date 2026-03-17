"use client";

import { Provider } from 'react-redux';
import { store } from './index';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { checkAuth } from './slices/authSlice';
import { initializeTheme, initializeSound } from './slices/uiSlice';

function StoreInitializer({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuth());
    dispatch(initializeTheme());
    dispatch(initializeSound());
  }, [dispatch]);

  return children;
}

export function ReduxProvider({ children }) {
  return (
    <Provider store={store}>
      <StoreInitializer>
        {children}
      </StoreInitializer>
    </Provider>
  );
}
