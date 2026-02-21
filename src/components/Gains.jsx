import React, { useState, useEffect } from "react";

const Gains = () => {
  const [users, setUsers] = useState([]);
  const [timeRange, setTimeRange] = useState("daily");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [details, setDetails] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    adminProfit: 0,
    supplierProfit: 0,
    transactionCount: 0
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const API_URL = 'https://ecc-dab7cvdcceethsdz.centralindia-01.azurewebsites.net/api/SplitPayment/AdminPro';
        console.log(API_URL)
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
        console.log("AdminPro data:", data);
        
        // Transform API data to match our component structure
        const transformedUsers = Array.isArray(data) ? data.map(ut => ({
          totalRevenue: ut.revenue || 0,
          adminProfit: ut.adminProfit || 0,
          supplierProfit: ut.suppProfit || 0,
          transactionCount: ut.transaction || 0
        })) : [];
        
        setUsers(transformedUsers);
      } catch (err) {
        setError(`SSL Certificate Error: Unable to connect to the server. Please ensure the backend SSL certificate is properly configured. Error: ${err.message}`);
        console.log('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchDetails = async () => {
      try {
        const API_URL = 'https://ecc-dab7cvdcceethsdz.centralindia-01.azurewebsites.net/api/SplitPayment/Details';
        console.log(API_URL)
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
        console.log("Details data:", data);
        
        // Transform API data to match our component structure
        const transformedDetails = Array.isArray(data) ? data.map(dt => ({
          date: dt.date || "N/A",
          businessName: dt.businessName || "Unknown",
          supplierAmount: parseFloat(dt.supplierAmount) || 0,
          adminAmount: parseFloat(dt.adminAmount) || 0,
          totalAmount: parseFloat(dt.totalAmount) || 0
        })) : [];
        
        setDetails(transformedDetails);
      } catch (err) {
        console.log('Error fetching details:', err);
      }
    };
    
    fetchUsers();
    fetchDetails();
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      // Use the first user's data for stats
      const apiStats = users[0];
      
      setStats({
        totalRevenue: parseFloat(apiStats.totalRevenue) || 0,
        adminProfit: parseFloat(apiStats.adminProfit) || 0,
        supplierProfit: parseFloat(apiStats.supplierProfit) || 0,
        transactionCount: parseInt(apiStats.transactionCount) || 0,
      });
    }
    
    // Set transactions from details
    if (details.length > 0) {
      setTransactions(details);
    }
  }, [users, details]);

  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) return "₹0.00";
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="dashboard-section">
      <div className="section-header">
        <h2>Profit & Gains</h2>
        <div className="time-range-selector">
          <button 
            className={timeRange === "daily" ? "btn btn-primary btn-sm" : "btn btn-outline btn-sm"} 
            onClick={() => setTimeRange("daily")}
          >
            Daily
          </button>
          <button 
            className={timeRange === "weekly" ? "btn btn-primary btn-sm" : "btn btn-outline btn-sm"} 
            onClick={() => setTimeRange("weekly")}
          >
            Weekly
          </button>
          <button 
            className={timeRange === "monthly" ? "btn btn-primary btn-sm" : "btn btn-outline btn-sm"} 
            onClick={() => setTimeRange("monthly")}
          >
            Monthly
          </button>
        </div>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading profit data...</p>
        </div>
      )}

      {error && (
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Connection Error</h3>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{background: '#e3f2fd'}}>
                <span>💰</span>
              </div>
              <div className="stat-content">
                <h3>{formatCurrency(stats.totalRevenue)}</h3>
                <p>Total Revenue</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon" style={{background: '#e8f5e9'}}>
                <span>👑</span>
              </div>
              <div className="stat-content">
                <h3>{formatCurrency(stats.adminProfit)}</h3>
                <p>Admin Profit (10%)</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon" style={{background: '#fff3e0'}}>
                <span>🏢</span>
              </div>
              <div className="stat-content">
                <h3>{formatCurrency(stats.supplierProfit)}</h3>
                <p>Supplier Profit (90%)</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon" style={{background: '#fbe9e7'}}>
                <span>📊</span>
              </div>
              <div className="stat-content">
                <h3>{stats.transactionCount}</h3>
                <p>Total Transactions</p>
              </div>
            </div>
          </div>

          <div className="profit-distribution">
            <div className="card">
              <div className="card-header">
                <h3>Profit Distribution</h3>
              </div>
              <div className="distribution-chart">
                <div className="chart-bars">
                  <div 
                    className="chart-bar admin-bar" 
                    style={{ 
                      width: stats.totalRevenue > 0 ? `${(stats.adminProfit / stats.totalRevenue * 100)}%` : '10%',
                      minWidth: '50px' // Ensure it's visible even for small amounts
                    }}
                  >
                    <div className="bar-label">Admin: {formatCurrency(stats.adminProfit)}</div>
                  </div>
                  <div 
                    className="chart-bar supplier-bar" 
                    style={{ 
                      width: stats.totalRevenue > 0 ? `${(stats.supplierProfit / stats.totalRevenue * 100)}%` : '90%',
                      minWidth: '50px' // Ensure it's visible even for small amounts
                    }}
                  >
                    <div className="bar-label">Suppliers: {formatCurrency(stats.supplierProfit)}</div>
                  </div>
                </div>
                <div className="chart-legend">
                  <div className="legend-item">
                    <div className="color-box admin-color"></div>
                    <span>Admin ({stats.totalRevenue > 0 ? ((stats.adminProfit / stats.totalRevenue * 100).toFixed(1)) : 10}%)</span>
                  </div>
                  <div className="legend-item">
                    <div className="color-box supplier-color"></div>
                    <span>Suppliers ({stats.totalRevenue > 0 ? ((stats.supplierProfit / stats.totalRevenue * 100).toFixed(1)) : 90}%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="recent-transactions">
            <div className="card">
              <div className="card-header">
                <h3>Recent Transactions</h3>
                <span className="badge">{details.length}</span>
              </div>
              
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Supplier</th>
                      <th>Amount</th>
                      <th>Admin Share</th>
                      <th>Supplier Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {details.length > 0 ? (
                      details.map((item, index) => (
                        <tr key={index}>
                          <td>{item.date}</td>
                          <td>{item.businessName}</td>
                          <td className="amount">{formatCurrency(item.totalAmount)}</td>
                          <td className="admin-amount">{formatCurrency(item.adminAmount)}</td>
                          <td className="supplier-amount">{formatCurrency(item.supplierAmount)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center">
                          No transaction data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="summary-card">
            <div className="card">
              <div className="card-header">
                <h3>Profit Summary</h3>
              </div>
              <div className="summary-content">
                <div className="summary-item">
                  <span className="summary-label">Total Revenue:</span>
                  <span className="summary-value">{formatCurrency(stats.totalRevenue)}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Admin Profit:</span>
                  <span className="summary-value admin-value">{formatCurrency(stats.adminProfit)}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Supplier Profit:</span>
                  <span className="summary-value supplier-value">{formatCurrency(stats.supplierProfit)}</span>
                </div>
                <div className="summary-divider"></div>
                <div className="summary-item total">
                  <span className="summary-label">Net Amount Distributed:</span>
                  <span className="summary-value">{formatCurrency(stats.totalRevenue)}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Gains;