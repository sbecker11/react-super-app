// FILEPATH: /Users/sbecker11/workspace-react/react-app/src/components/Header.test.js

import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { TestRouter } from "../test-utils";
import Header from "./Header";

import { onHomeClick } from "./Home.test";
import { onAboutClick } from "./About.test";
import { onLoginRegisterClick } from "./LoginRegister.test";

describe("Header", () => {
  it("renders without crashing", () => {
    render(
      <TestRouter>
        <Header
          onHomeClick={() => {}}
          onAboutClick={() => {}}
          onLoginRegisterClick={() => {}}
        />
      </TestRouter>
    );
  });

  it("displays home link", () => {
    render(
      <TestRouter>
        <Header
          onHomeClick={() => {}}
          onAboutClick={() => {}}
          onLoginRegisterClick={() => {}}
        />
      </TestRouter>
    );
    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  it("displays about link", () => {
    render(
      <TestRouter>
        <Header
          onHomeClick={() => {}}
          onAboutClick={() => {}}
          onLoginRegisterClick={() => {}}
        />
      </TestRouter>
    );
    expect(screen.getByText("About")).toBeInTheDocument();
  });

  it("displays login/register link", () => {
    render(
      <TestRouter>
        <Header
          onHomeClick={() => {}}
          onAboutClick={() => {}}
          onLoginRegisterClick={() => {}}
        />
      </TestRouter>
    );
    expect(screen.getByText("Login/Register")).toBeInTheDocument();
  });

  it("calls onHomeClick when home link is clicked", () => {
    render(
      <TestRouter>
        <Header
          onHomeClick={onHomeClick}
          onAboutClick={() => {}}
          onLoginRegisterClick={() => {}}
        />
      </TestRouter>
    );

    // Get the Home link and click it
    const homeLink = screen.getByText(/home/i);
    fireEvent.click(homeLink);
    expect(onHomeClick).toHaveBeenCalled();
  });

  it("calls onAboutClick when about link is clicked", () => {
    render(
      <TestRouter>
        <Header
          onHomeClick={() => {}}
          onAboutClick={onAboutClick}
          onLoginRegisterClick={() => {}}
        />
      </TestRouter>
    );

    // Get the About link and click it
    const aboutLink = screen.getByText(/about/i);
    fireEvent.click(aboutLink);
    expect(onAboutClick).toHaveBeenCalled();
  });

  it("calls onLoginRegisterClick when login/register link is clicked", () => {
    render(
      <TestRouter>
        <Header
          onHomeClick={() => {}}
          onAboutClick={() => {}}
          onLoginRegisterClick={onLoginRegisterClick}
        />
      </TestRouter>
    );
    // Get the LoginRegister link and click it
    const loginRegisterLink = screen.getByText(/login\/register/i);
    fireEvent.click(loginRegisterLink);
    expect(onLoginRegisterClick).toHaveBeenCalled();
  });
});
