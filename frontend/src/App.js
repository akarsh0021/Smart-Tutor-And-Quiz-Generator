// src/App.js
import React, { useState } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import Quiz from "./components/Quiz";
import AITutor from "./components/AITutor";

function App() {
  const [user, setUser] = useState(null);
  const [topic, setTopic] = useState("");
  const [showRegister, setShowRegister] = useState(false);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setShowRegister(false);
  };

  const handleRegisterSuccess = (userData) => {
    setUser(userData);
    setShowRegister(false);
  };

  const handleLogout = () => {
    setUser(null);
    setTopic("");
    setShowRegister(false);
  };

  const handleBackToTutor = () => {
    setTopic("");
  };

  const handleSwitchToRegister = () => {
    setShowRegister(true);
  };

  const handleSwitchToLogin = () => {
    setShowRegister(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {!user ? (
        showRegister ? (
          <Register
            onRegisterSuccess={handleRegisterSuccess}
            onSwitchToLogin={handleSwitchToLogin}
          />
        ) : (
          <Login
            onLoginSuccess={handleLoginSuccess}
            onSwitchToRegister={handleSwitchToRegister}
          />
        )
      ) : topic ? (
        <Quiz
          topic={topic}
          user={user}
          onBackToTutor={handleBackToTutor}
          onLogout={handleLogout}
        />
      ) : (
        <AITutor
          onSelectTopic={(t) => setTopic(t)}
          user={user}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default App;
