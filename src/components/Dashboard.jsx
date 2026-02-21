import React, { useState,useEffect } from "react";
import Sidebar from "./Sidebar";
import NewUsers from "./NewUsers";
import OldUsers from "./OldUsers";
import Tracking from "./Tracking";
import Gains from "./Gains";
import "./Dashboard.css";

// Dashboard Home Component
const DashboardHome = () => {
  // // Sample data
  // const dashboardData = {
  //   totalOrders: 245,
  //   totalRevenue: 12548,
  //   totalCustomers: 1243,
  //   pendingOrders: 56,
  //   totalSuppliers: 42,
  //   activeSuppliers: 38,
  //   newCustomers: 23,
  //   conversionRate: 4.2,
  //   completedOrders: 189,
  //   activeUsers: 856,
  //   pendingReviews: 12,
  //   issuesReported: 3
const [users, setUsers] = useState([]);
const [dashboardData, setDashboardData] = useState();
const [loading, setLoading] = useState();
const [error, setError] = useState();
const [stats, setStats] = useState({
    totalOrder: 0,
    revenue: 0,
    totalCustomers: 0,
    totalSuppliers: 0,
    active: 0
  });

  const recentActivities = [
    { type: "completed", message: "Order #3245 has been completed", time: "2 minutes ago", icon: "✅" },
    { type: "new_customer", message: "New customer registered: John Doe", time: "10 minutes ago", icon: "🆕" },
    { type: "shipped", message: "Order #3241 has been shipped", time: "1 hour ago", icon: "📦" },
    { type: "payment", message: "Payment received for Order #3238", time: "2 hours ago", icon: "💳" },
    { type: "supplier", message: "New supplier registration: Tech Solutions Inc.", time: "3 hours ago", icon: "🏢" }
  ];
  
    useEffect(() => {
        const fetchDash = async () => {
          try {
            setLoading(true);
            setError(null);
            
            const API_URL = 'https://ecc-dab7cvdcceethsdz.centralindia-01.azurewebsites.net/api/Dashboard/Dash';
            const response = await fetch(API_URL, {
              
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
              mode: 'cors'
            });
            
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log(data)
            
            // Transform API data to match our component structure
            const transformedUsers = data.map(ut => ({
              totalOrder: ut.totalOrder,
              revenue: ut.revenue,
              totalCustomers: ut.totalCustomers,
              totalSuppliers: ut.totalSuppliers,
              active: ut.active
            }));
            
            setUsers(transformedUsers);
          } catch (err) {
            setError(`SSL Certificate Error: Unable to connect to the server. Please ensure the backend SSL certificate is properly configured. Error: ${err.message}`);
            console.log('Error fetching users:', err);
          } finally {
            setLoading(false);
          }
        };
        
        fetchDash();
      }, []);
      
          useEffect(() => {
        if (users.length === 0) return;
      
        // Use the API values AS-IS
        const apiStats = users[0]; // If API returns a single record
      
        setStats({
              totalOrder: apiStats.totalOrder,
              revenue: apiStats.revenue,
              totalCustomers: apiStats.totalCustomers,
              totalSuppliers: apiStats.totalSuppliers,
              active: apiStats.active
        });
      
       // setTransactions(users); // If you want to show a table
      }, [users]);

  return (
    <div className="dashboard-home">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Dashboard Overview</h1>
          <p>Welcome back! Here's what's happening with your business today</p>
        </div>
        <div className="header-actions">
          <div className="date-display">
            <span className="day">Tuesday</span>
            <span className="date">June 27, 2023</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
            <span>📊</span>
          </div>
          <div className="stat-content">
            <h3>{stats.totalOrder.toLocaleString()}</h3>
            <p>Total Orders</p>
            <div className="stat-trend positive">
              <span>↑ 12%</span> from last week
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
            <span>💰</span>
          </div>
          <div className="stat-content">
            <h3>₹{stats.revenue.toLocaleString()}</h3>
            <p>Total Revenue</p>
            <div className="stat-trend positive">
              <span>↑ 8.5%</span> from last week
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}>
            <span>👥</span>
          </div>
          <div className="stat-content">
            <h3>{stats.totalCustomers.toLocaleString()}</h3>
            <p>Total Customers</p>
            <div className="stat-trend positive">
              <span>↑ 5.2%</span> from last week
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'}}>
            <span>🏢</span>
          </div>
          <div className="stat-content">
            <h3>{stats.totalSuppliers}</h3>
            <p>Total Suppliers</p>
            <div className="stat-trend">
              <span>{stats.active} active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
const Dashboard = ({ setIsAuthenticated }) => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Toggle function
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Close sidebar when clicking on overlay or menu item
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Close sidebar when section changes (on mobile)
  const handleSectionChange = (section) => {
    setActiveSection(section);
    // Close sidebar on mobile after selection
    if (window.innerWidth <= 1024) {
      closeSidebar();
    }
  };

  const renderSection = () => {
    switch(activeSection) {
      case "newUsers":
        return <NewUsers />;
      case "oldUsers":
        return <OldUsers />;
      case "tracking":
        return <Tracking />;
      case "gains":
        return <Gains />;
      default:
        return <DashboardHome />;
    }
  };
  return (
    <div className="dashboard-container">
      {/* Mobile Menu Toggle Button */}
      <button 
        className="menu-toggle"
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        <span className="toggle-icon">☰</span>
      </button>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={closeSidebar}
        />
      )}

      <Sidebar 
        activeSection={activeSection} 
        setActiveSection={handleSectionChange}
        setIsAuthenticated={setIsAuthenticated}
        isSidebarOpen={isSidebarOpen}
        onClose={closeSidebar}
      />
      
      <main>
        {renderSection()}
      </main>
    </div>
  );
};

export default Dashboard;