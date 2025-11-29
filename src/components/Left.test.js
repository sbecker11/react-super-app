import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { TestRouter } from "../test-utils";

import Left from "./Left";

import { onHomeClick } from "./Home.test";
import { onAboutClick } from "./About.test";
import { onLoginRegisterClick } from "./LoginRegister.test";

describe("Left", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    render(
      <TestRouter>
        <Left
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
        <Left
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
        <Left
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
        <Left
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
        <Left
          onHomeClick={onHomeClick}
          onAboutClick={() => {}}
          onLoginRegisterClick={() => {}}
        />
      </TestRouter>
    );

    const homeLink = screen.getByText(/home/i);
    fireEvent.click(homeLink);
    expect(onHomeClick).toHaveBeenCalled();
  });

  it("calls onAboutClick when about link is clicked", () => {
    render(
      <TestRouter>
        <Left
          onHomeClick={() => {}}
          onAboutClick={onAboutClick}
          onLoginRegisterClick={() => {}}
        />
      </TestRouter>
    );

    const aboutLink = screen.getByText(/about/i);
    fireEvent.click(aboutLink);
    expect(onAboutClick).toHaveBeenCalled();
  });

  it("calls onLoginRegisterClick when login/register link is clicked", () => {
    render(
      <TestRouter>
        <Left
          onHomeClick={() => {}}
          onAboutClick={() => {}}
          onLoginRegisterClick={onLoginRegisterClick}
        />
      </TestRouter>
    );
    const loginRegisterLink = screen.getByText(/login\/register/i);
    fireEvent.click(loginRegisterLink);
    expect(onLoginRegisterClick).toHaveBeenCalled();
  });

  it("has the correct container class", () => {
    const { container } = render(
      <TestRouter>
        <Left
          onHomeClick={() => {}}
          onAboutClick={() => {}}
          onLoginRegisterClick={() => {}}
        />
      </TestRouter>
    );
    const leftElement = container.querySelector('.left');
    expect(leftElement).toBeInTheDocument();
  });
});
