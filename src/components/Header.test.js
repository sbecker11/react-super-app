// FILEPATH: /Users/sbecker11/workspace-react/react-super-app/src/components/Header.test.js

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { TestRouterWithAllProviders } from "../test-utils";
import Header from "./Header";
import * as api from "../services/api";

import { onHomeClick } from "./Home.test";
import { onAboutClick } from "./About.test";
import { onLoginRegisterClick } from "./LoginRegister.test";

// Mock authAPI.getCurrentUser to prevent real API calls in AuthProvider
jest.mock('../services/api', () => {
  const actual = jest.requireActual('../services/api');
  return {
    ...actual,
    authAPI: {
      ...actual.authAPI,
      getCurrentUser: jest.fn().mockRejectedValue(new Error('Not authenticated')),
    },
  };
});

describe("Header", () => {
  beforeEach(() => {
    localStorage.removeItem('token');
    jest.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("renders without crashing", async () => {
    render(
      <TestRouterWithAllProviders>
        <Header
          onHomeClick={() => {}}
          onAboutClick={() => {}}
          onLoginRegisterClick={() => {}}
        />
      </TestRouterWithAllProviders>
    );
    // Wait for AuthProvider to finish loading
    await waitFor(() => {
      expect(screen.getByText("Home")).toBeInTheDocument();
    });
  });

  it("displays home link", async () => {
    render(
      <TestRouterWithAllProviders>
        <Header
          onHomeClick={() => {}}
          onAboutClick={() => {}}
          onLoginRegisterClick={() => {}}
        />
      </TestRouterWithAllProviders>
    );
    await waitFor(() => {
      expect(screen.getByText("Home")).toBeInTheDocument();
    });
  });

  it("displays about link", async () => {
    render(
      <TestRouterWithAllProviders>
        <Header
          onHomeClick={() => {}}
          onAboutClick={() => {}}
          onLoginRegisterClick={() => {}}
        />
      </TestRouterWithAllProviders>
    );
    await waitFor(() => {
      expect(screen.getByText("About")).toBeInTheDocument();
    });
  });

  it("displays login/register link", async () => {
    render(
      <TestRouterWithAllProviders>
        <Header
          onHomeClick={() => {}}
          onAboutClick={() => {}}
          onLoginRegisterClick={() => {}}
        />
      </TestRouterWithAllProviders>
    );
    await waitFor(() => {
      expect(screen.getByText("Login/Register")).toBeInTheDocument();
    });
  });

  it("calls onHomeClick when home link is clicked", async () => {
    render(
      <TestRouterWithAllProviders>
        <Header
          onHomeClick={onHomeClick}
          onAboutClick={() => {}}
          onLoginRegisterClick={() => {}}
        />
      </TestRouterWithAllProviders>
    );

    await waitFor(() => {
      expect(screen.getByText(/home/i)).toBeInTheDocument();
    });

    // Get the Home link and click it
    const homeLink = screen.getByText(/home/i);
    fireEvent.click(homeLink);
    expect(onHomeClick).toHaveBeenCalled();
  });

  it("calls onAboutClick when about link is clicked", async () => {
    render(
      <TestRouterWithAllProviders>
        <Header
          onHomeClick={() => {}}
          onAboutClick={onAboutClick}
          onLoginRegisterClick={() => {}}
        />
      </TestRouterWithAllProviders>
    );

    await waitFor(() => {
      expect(screen.getByText(/about/i)).toBeInTheDocument();
    });

    // Get the About link and click it
    const aboutLink = screen.getByText(/about/i);
    fireEvent.click(aboutLink);
    expect(onAboutClick).toHaveBeenCalled();
  });

  it("calls onLoginRegisterClick when login/register link is clicked", async () => {
    render(
      <TestRouterWithAllProviders>
        <Header
          onHomeClick={() => {}}
          onAboutClick={() => {}}
          onLoginRegisterClick={onLoginRegisterClick}
        />
      </TestRouterWithAllProviders>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/login\/register/i)).toBeInTheDocument();
    });

    // Get the LoginRegister link and click it
    const loginRegisterLink = screen.getByText(/login\/register/i);
    fireEvent.click(loginRegisterLink);
    expect(onLoginRegisterClick).toHaveBeenCalled();
  });

  // Branch coverage tests - These would require mocking AuthContext properly
  // For now, we'll skip these as they require more complex setup
  // The existing tests already cover the main branches
});
