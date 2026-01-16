import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import RegistrationForm from './components/RegistrationForm';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('adminToken');
  });

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="container">
            <h1 className="navbar-title">Member Registration System</h1>
            <div className="navbar-links">
              <Link to="/" className="nav-link">Register</Link>
              <Link to="/admin" className="nav-link">Admin</Link>
              {isAuthenticated && (
                <button className="nav-link" onClick={handleLogout} style={{marginLeft: '10px'}}>Logout</button>
              )}
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<RegistrationForm />} />
          <Route path="/admin" element={
            isAuthenticated ? <AdminDashboard /> : <AdminLogin onLogin={handleLogin} />
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
