// Test utilities for React Testing Library
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

// Mock AuthContext for testing
const MockAuthContext = React.createContext({
  user: null,
  token: null,
  loading: false,
  isAuthenticated: false,
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  updateUser: jest.fn(),
});

export const MockAuthProvider = ({ children, value }) => {
  const defaultValue = {
    user: null,
    token: null,
    loading: false,
    isAuthenticated: false,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    updateUser: jest.fn(),
    ...value,
  };
  
  return (
    <MockAuthContext.Provider value={defaultValue}>
      {children}
    </MockAuthContext.Provider>
  );
};

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

/**
 * Router wrapper with MockAuthProvider for components that need authentication context
 */
export const TestRouterWithAuth = ({ children, authValue }) => {
  return (
    <MockAuthProvider value={authValue}>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        {children}
      </BrowserRouter>
    </MockAuthProvider>
  );
};

