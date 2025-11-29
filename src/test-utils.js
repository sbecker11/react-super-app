// Test utilities for React Testing Library
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

/**
 * Router wrapper with React Router v7 future flags configured
 * to suppress deprecation warnings during tests
 */
export const TestRouter = ({ children }) => {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      {children}
    </BrowserRouter>
  );
};

