import React, { useState,useEffect } from "react";
import "../tracking.css";

const Tracking = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [details, setDetails] = useState([]);
  const [transactions, setTransactions] = useState([]);
  // const statusSteps = [
  //   { label: "Processing", value: "processing", color: "#6366F1", icon: "⏳" },
  //   { label: "Shipped", value: "shipped", color: "#3B82F6", icon: "🚚" },
  //   { label: "Out for Delivery", value: "out-for-delivery", color: "#F59E0B", icon: "📦" },
  //   { label: "Delivered", value: "delivered", color: "#10B981", icon: "✅" }
  // ];

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const API_URL = 'https://ecc-dab7cvdcceethsdz.centralindia-01.azurewebsites.net/api/OrderTraking/Track';
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
        console.log(data)
        
        // Transform API data to match our component structure
        const transformedDetails = data.map(dt => ({
          UserId: dt.userId || "",
          SupplierName: dt.supplierName || "",
          Product: dt.product || "",
          Amount: dt.amount || "",
          DeliveryStatusDatetime: dt.deliveryStatusDatetime || "",
          StatusName: dt.statusName || ""
        }));
        
        setDetails(transformedDetails);
        
        // Also update orders state with proper structure
        const transformedOrders = data.map(dt => ({
          id: dt.userId || "",
          status: (dt.statusName || "").toLowerCase().replace(/\s+/g, '-'),
          supplier: dt.supplierName || "",
          product: dt.product || "",
          amount: dt.amount || "",
          date: dt.deliveryStatusDatetime || "",
          customer: {
            name: "", // Not in API, so empty
            email: "" // Not in API, so empty
          },
          trackingId: "" // Not in API, so empty
        }));
        
        setOrders(transformedOrders);
      } catch (err) {
        setError(`SSL Certificate Error: Unable to connect to the server. Please ensure the backend SSL certificate is properly configured. Error: ${err.message}`);
        console.log('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  // const getStatusDetails = (status) => {
  //   return statusSteps.find(step => step.value === status) || statusSteps[0];
  // };

  // Filter functions based on StatusName
  const getDeliveredCount = () => {
    return details.filter(item => 
      item.StatusName && 
      (item.StatusName.toLowerCase().includes("delivered") || 
       item.StatusName.toLowerCase().includes("completed"))
    ).length;
  };

  const getProcessingCount = () => {
    return details.filter(item => 
      item.StatusName && 
      (item.StatusName.toLowerCase().includes("processing") || 
       item.StatusName.toLowerCase().includes("pending") ||
       item.StatusName.toLowerCase().includes("order"))
    ).length;
  };

  const getInTransitCount = () => {
    return details.filter(item => 
      item.StatusName && 
      (item.StatusName.toLowerCase().includes("shipped") || 
       item.StatusName.toLowerCase().includes("transit") ||
       item.StatusName.toLowerCase().includes("dispatch"))
    ).length;
  };

  return (
    <div className="tracking-dashboard">
      {/* Header Section */}
      <div className="tracking-header">
        <div className="header-content">
          <h1>Order Tracking</h1>
          <p>Monitor and manage all order activities in real-time</p>
        </div>
        {/* <div className="header-actions">
          <button className="btn btn-primary">
            <span className="btn-icon">➕</span>
            New Order
          </button>
          <button className="btn btn-secondary">
            <span className="btn-icon">📊</span>
            Generate Report
          </button>
        </div> */}
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
            <span className="stat-icon">📦</span>
          </div>
          <div className="stat-content">
            <h3>{details.length}</h3>
            <p>Total Orders</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
            <span className="stat-icon">✅</span>
          </div>
          <div className="stat-content">
            <h3>{getDeliveredCount()}</h3>
            <p>Delivered</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
            <span className="stat-icon">⏳</span>
          </div>
          <div className="stat-content">
            <h3>{getProcessingCount()}</h3>
            <p>Processing</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
            <span className="stat-icon">🚚</span>
          </div>
          <div className="stat-content">
            <h3>{getInTransitCount()}</h3>
            <p>In Transit</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="tracking-content">
        {/* Order Table Section */}
        <div className="content-card">
          <div className="card-header">
            <h2>Order Management</h2>
            <div className="card-actions">
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input type="text" placeholder="Search orders..." className="search-input" />
              </div>
              <button className="btn btn-outline">
                <span className="btn-icon">🔃</span>
                Refresh
              </button>
            </div>
          </div>

          <div className="table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order Details</th>
                  <th>Supplier</th>
                  <th>Product</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {details.map((item,index) => {
                  return (
                    <tr key={index} className="order-row">
                      <td>
                        <div className="order-info">
                          <div className="order-id">#{item.UserId}</div>
                          <div className="tracking-id">Tracking ID: N/A</div>
                          <div className="customer-info">
                            <div className="customer-name">Customer: Not Available</div>
                            <div className="customer-email">Email: Not Available</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="supplier-info">
                          {item.SupplierName || "Unknown Supplier"}
                        </div>
                      </td>
                      <td>
                        <div className="product-info">
                          {item.Product || "Unknown Product"}
                        </div>
                      </td>
                      <td>
                        <div className="amount-badge">
                          {item.Amount || "N/A"}
                        </div>
                      </td>
                      <td>
                        <div className="date-info">
                          {item.DeliveryStatusDatetime || "Date Not Available"}
                        </div>
                      </td>
                      <td>
                        <div className="status-indicator">
                          <span className="status-text">{item.StatusName || "Unknown Status"}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {loading && (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading orders...</p>
              </div>
            )}
            
            {error && (
              <div className="error-state">
                <div className="error-icon">⚠️</div>
                <h3>Connection Error</h3>
                <p>{error}</p>
              </div>
            )}
            
            {!loading && !error && details.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">📦</div>
                <h3>No orders found</h3>
                <p>There are currently no orders to display</p>
              </div>
            )}
          </div>
        </div>

        {/* Analytics Section */}
        <div className="analytics-sidebar">
          <div className="content-card">
            <div className="card-header">
              <h2>Order Distribution</h2>
            </div>
            
            {/* <div className="distribution-chart">
              {statusSteps.map(step => {
                const count = orders.filter(o => o.status === step.value).length;
                const percentage = orders.length > 0 ? (count / orders.length) * 100 : 0;
                
                return (
                  <div key={step.value} className="distribution-item">
                    <div className="distribution-header">
                      <div className="distribution-label">
                        <div 
                          className="color-badge" 
                          style={{backgroundColor: step.color}}
                        ></div>
                        <span className="label-text">{step.label}</span>
                      </div>
                      <span className="distribution-value">{count} orders</span>
                    </div>
                    
                    <div className="progress-container">
                      <div 
                        className="progress-bar" 
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: step.color
                        }}
                      ></div>
                    </div>
                    
                    <div className="percentage-display">
                      {percentage.toFixed(1)}%
                    </div>
                  </div>
                );
              })}
            </div> */}
          </div>

          {/* Recent Activity */}
          <div className="content-card">
            <div className="card-header">
              <h2>Recent Activity</h2>
            </div>
            
            <div className="activity-feed">
              <div className="activity-item">
                <div className="activity-icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>✅</div>
                <div className="activity-content">
                  <p>Order #3245 has been delivered successfully</p>
                  <span className="activity-time">2 minutes ago</span>
                </div>
              </div>
              
              <div className="activity-item">
                <div className="activity-icon" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>🚚</div>
                <div className="activity-content">
                  <p>Order #3241 has been shipped</p>
                  <span className="activity-time">1 hour ago</span>
                </div>
              </div>
              
              <div className="activity-item">
                <div className="activity-icon" style={{ background: 'rgba(99, 102, 241, 0.1)' }}>⏳</div>
                <div className="activity-content">
                  <p>New order #3246 received and is being processed</p>
                  <span className="activity-time">3 hours ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tracking;