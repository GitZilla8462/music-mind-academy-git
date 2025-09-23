// src/MinimalApp.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

function MinimalApp() {
  return (
    <Router basename="/teacher_dashboard">
      <div style={{ padding: '20px' }}>
        <h1>Minimal App with Router</h1>
        <div>
          <Link to="/edit-class/123">Test Edit Class Page</Link>
        </div>
        <Routes>
          <Route path="/" element={<div>Home Route Works!</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default MinimalApp;