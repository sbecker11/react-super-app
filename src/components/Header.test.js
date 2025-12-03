// FILEPATH: /Users/sbecker11/workspace-react/react-super-app/src/components/Header.test.js

import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { TestRouterWithAllProviders } from "../test-utils";
import Header from "./Header";
import { authAPI } from "../services/api";

import { onHomeClick } from "./Home.test";
import { onAboutClick } from "./About.test";
import { onLoginRegisterClick } from "./LoginRegister.test";

// Mock authAPI.getCurrentUser to prevent real API calls in AuthProvider
// This mock is scoped to this test file only
beforeEach(() => {
  jest.spyOn(require('../services/api').authAPI, 'getCurrentUser').mockRejectedValue(
    new Error('Not authenticated')
  );
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("Header", () => {
  beforeEach(() => {
    jest.spyOn(authAPI, 'getCurrentUser').mockRejectedValue(
      new Error('Not authenticated')
    );
    localStorage.removeItem('token');
  });

  afterEach(() => {
    jest.restoreAllMocks();
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
});
