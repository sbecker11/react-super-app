import React from "react";
import { BrowserRouter as Router } from "react-router-dom"; // Import the router components and Routes
import { Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import Left from "./components/Left";
import Footer from "./components/Footer";
import "./App.css"; // Import the CSS file
import About from "./components/About";
import Home from "./components/Home";
import LoginRegister from "./components/LoginRegister";
import JDAnalyzer from './components/JDAnalyzer';

function App() {
  function handleHomeClick() {
    console.log("handleHomeClick");
  }
  function handleAboutClick() {
    console.log("handleAboutClick");
  }
  function handleLoginRegisterClick() {
    console.log("handleLoginRegisterClick");
  }

  const body_content = (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/home" element={<Home />} />
      <Route path="/login-register" element={<LoginRegister />} />
    </Routes>
  );

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <div>
        <Header
          onHomeClick={handleHomeClick}
          onAboutClick={handleAboutClick}
          onLoginRegisterClick={handleLoginRegisterClick}
        />
        <div className="container">
          <div className="left-column">
            <Left
              onHomeClick={handleHomeClick}
              onAboutClick={handleAboutClick}
              onLoginRegisterClick={handleLoginRegisterClick}
            />
          </div>
          <div className="body-content">{body_content}</div>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
