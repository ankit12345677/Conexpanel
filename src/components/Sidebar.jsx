import React from "react";
import "../Sidebar.css";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ 
  activeSection, 
  setActiveSection, 
  setIsAuthenticated, 
  isSidebarOpen, 
  onClose 
}) => {
  const navigate = useNavigate();
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "newUsers", label: "New Users", icon: "🆕" },
    { id: "oldUsers", label: "Registered Users", icon: "👥" },
    { id: "tracking", label: "Order Tracking", icon: "🚚" },
    { id: "gains", label: "Profit & Gains", icon: "💰" },
  ];

  const handleMenuClick = (sectionId) => {
    setActiveSection(sectionId);
    // Close sidebar on mobile after selection
    if (window.innerWidth <= 1024 && onClose) {
      onClose();
    }
  };

  const handleLogout = () => {
    // Check if setIsAuthenticated is a function before calling it
    if (typeof setIsAuthenticated === 'function') {
      setIsAuthenticated(false);
      console.log("setIsAuthenticated called successfully");
    } else {
      console.error("setIsAuthenticated is not a function:", setIsAuthenticated);
    }
    
    // Remove from localStorage to prevent auto-login on refresh
    localStorage.removeItem("isAuthenticated");
    
    // Close sidebar on mobile before redirecting
    if (window.innerWidth <= 1024 && onClose) {
      onClose();
    }
    
    // Redirect to login page
    navigate("/login");
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <button 
            className="sidebar-close" 
            onClick={onClose}
            aria-label="Close menu"
          >
            ×
          </button>
          <div className="logo-container">
            <div className="logo">🛍️</div>
            <div className="logo-text">
              <h3>Admin Panel</h3>
              <p>E-Commerce Dashboard</p>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        {/* <div className="sidebar-stats">
          <div className="stats-title">
            <span>📈 Quick Stats</span>
          </div>
          <div className="stat-item">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <span className="stat-value">1,243</span>
              <span className="stat-label">Total Users</span>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">📦</div>
            <div className="stat-info">
              <span className="stat-value">245</span>
              <span className="stat-label">Total Orders</span>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <span className="stat-value">$12.5k</span>
              <span className="stat-label">Revenue</span>
            </div>
          </div>
        </div> */}

        {/* Navigation Menu */}
        <div className="sidebar-menu-section">
          <div className="menu-title">
            <span>📋 Navigation</span>
          </div>
          <ul className="sidebar-menu">
            {menuItems.map((item) => (
              <li
                key={item.id}
                className={`menu-item ${activeSection === item.id ? "active" : ""}`}
                onClick={() => handleMenuClick(item.id)}
              >
                <span className="menu-icon">{item.icon}</span>
                <span className="menu-label">{item.label}</span>
                {activeSection === item.id && <div className="active-indicator"></div>}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer with Logout */}
        <div className="sidebar-footer">
          {/* <div className="user-profile">
            <div className="user-avatar">👤</div>
            <div className="user-info">
              <span className="user-name">Admin User</span>
              <span className="user-role">Administrator</span>
            </div>
          </div> */}
          <button className="logout-btn" onClick={handleLogout}>
            <span className="logout-icon">🚪</span>
            <span className="logout-text">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;