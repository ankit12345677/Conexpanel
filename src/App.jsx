import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import NewUsers from "./components/NewUsers";
import OldUsers from "./components/OldUsers";
import Tracking from "./components/Tracking";
import Login from "./components/Login";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check localStorage on initial load
    return localStorage.getItem("isAuthenticated") === "true";
  });

  // Update localStorage when authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem("isAuthenticated", "true");
    } else {
      localStorage.removeItem("isAuthenticated");
    }
  }, [isAuthenticated]);

  return (
    <Router>
      <Routes>
        {/* Login Page */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? 
            <Navigate to="/dashboard" replace /> : 
            <Login setIsAuthenticated={setIsAuthenticated} />
          } 
        />

        {/* Protected Routes */}
        {isAuthenticated ? (
          <>
            <Route 
              path="/dashboard" 
              element={<Dashboard setIsAuthenticated={setIsAuthenticated} />} 
            />
            <Route path="/new-users" element={<NewUsers />} />
            <Route path="/old-users" element={<OldUsers />} />
            <Route path="/tracking" element={<Tracking />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;