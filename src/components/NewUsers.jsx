import React, { useState, useEffect } from "react";
import "../NewUsers.css";

const NewUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [expandedImage, setExpandedImage] = useState(null);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [otp, setOtp] = useState("");

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        const API_URL = 'https://ecc-dab7cvdcceethsdz.centralindia-01.azurewebsites.net/api/NewUser/GetSupplier';
        // const API_URL = 'http://localhost:5202/api/NewUser/GetSupplier';
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

        function formatAddress(addr) {
          if (!addr) return "";

          return [
            addr.Address1,
            addr.Address2,
            addr.Address3,
            `${addr.City}, ${addr.State} - ${addr.Pincode}`
          ]
            .filter(x => x && x.trim() !== "")
            .join(", ");
        }

        const transformedUsers = await Promise.all(
          data.map(async (user) => {
            let formattedAddress = "";

            try {
              if (user.addressUrlString) {
                const response = await fetch(user.addressUrlString);  // Fetch .txt file
                const addressText = await response.text();            // Read text
                const addressJson = JSON.parse(addressText);          // Convert to JSON
                formattedAddress = formatAddress(addressJson);        // Format for display
              }
            } catch (err) {
              console.error("Address fetch/parse failed:", err);
              formattedAddress = "Unable to load address";
            }

            return {
              id: user.userId,
              name: user.userName,
              email: user.email,
              company: user.businessName,
              address: formattedAddress,  // Final clean formatted address
              phone: user.phone,
              status: user.status || "pending",
              registrationDate: new Date(user.lastLogTime).toLocaleDateString(),
              pendingProductCount: user.pendingProductCount,
              products: user.pendingProductCount > 0
                ? [
                  {
                    name: user.productname,
                    amount: user.price,
                    images: [user.primaryImageUrl]
                  }
                ]
                : [],
              accountHolderName: user.accountHolderName,
              accountNumber: user.accountNumber,
              ifscCode: user.ifscCode
            };

          })

        );



        setUsers(transformedUsers);
      } catch (err) {
        setError(err.message || "Failed to fetch users");
        console.log('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowModal(true);
    setCurrentProductIndex(0);
    setCurrentImageIndex(0);
    setOtp("");
  };

  const handleApprovedUser = async (id) => {

    try {
      // const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
       console.log("sdhdjug")
      // Here you would call your OTP API
      await fetch(`https://ecc-dab7cvdcceethsdz.centralindia-01.azurewebsites.net/api/VerifySupp/VerifySup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          SupplierId: id,
        })
      });

      alert(`Verification  has been sent to user ${id}. User will verify on their platform.`);
      
      setShowModal(false);
    } catch (err) {
      alert('Failed to send OTP. Please try again.');
      console.error('Error sending OTP:', err);
    }
  };

  const handleApproveAll = () => {
    const pendingUsers = users.filter(user => user.status === "pending");
    if (pendingUsers.length === 0) {
      alert("No pending users to send OTP.");
      return;
    }

    if (window.confirm(`Send OTP to all ${pendingUsers.length} pending users?`)) {
      alert(`OTP sent to all pending users. Users will verify on their respective platforms.`);
      setUsers(users.map(user =>
        user.status === "pending" ? { ...user, status: "otp_sent" } : user
      ));
    }
  };

  const handleRejectUser = async (userId, productId) => {
    if (window.confirm("Are you sure you want to reject this user?")) {
      try {
        // Here you would call your reject user API
        await fetch(`https://ecc-dab7cvdcceethsdz.centralindia-01.azurewebsites.net/api/DeleteNewSupp/DelSupplier`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            supplierid: userId,
            productid: productId

          })
        });

        setUsers(users.filter(user => user.id !== id));
        setShowModal(false);
        alert("User has been rejected.");
      } catch (err) {
        alert('Failed to reject user. Please try again.');
        console.error('Error rejecting user:', err);
      }
    }
  };

  // Product Navigation
  const handleNextProduct = () => {
    if (selectedUser && selectedUser.products) {
      setCurrentProductIndex(prev =>
        prev < selectedUser.products.length - 1 ? prev + 1 : prev
      );
      setCurrentImageIndex(0);
    }
  };

  const handlePrevProduct = () => {
    setCurrentProductIndex(prev => prev > 0 ? prev - 1 : prev);
    setCurrentImageIndex(0);
  };

  // Image Navigation
  const handleNextImage = () => {
    if (selectedUser && selectedUser.products[currentProductIndex]) {
      const currentProduct = selectedUser.products[currentProductIndex];
      setCurrentImageIndex(prev =>
        prev < currentProduct.images.length - 1 ? prev + 1 : prev
      );
    }
  };

  const handlePrevImage = () => {
    setCurrentImageIndex(prev => prev > 0 ? prev - 1 : prev);
  };

  const getCurrentProduct = () => {
    return selectedUser?.products?.[currentProductIndex];
  };

  const getCurrentImage = () => {
    const currentProduct = getCurrentProduct();
    return currentProduct?.images?.[currentImageIndex];
  };

  // Check if admin is on the last product
  const isLastProduct = () => {
    return selectedUser && currentProductIndex === selectedUser.products.length - 1;
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.company.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "all" || user.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const pendingCount = users.filter(u => u.status === "pending").length;
  const otpSentCount = users.filter(u => u.status === "otp_sent").length;

  if (loading) {
    return (
      <div className="new-users-dashboard">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <h3>Loading users...</h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="new-users-dashboard">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>SSL Certificate Error</h3>
          <p>{error}</p>
          <div className="error-solutions">
            <h4>Possible Solutions:</h4>
            <ul>
              <li>🔧 Contact Azure support to fix the SSL certificate</li>
              <li>🌐 Check if the backend service is running properly</li>
              <li>🔒 Ensure the SSL certificate is valid and not expired</li>
              <li>🔄 Try accessing the API directly in browser to verify</li>
              <li>⚙️ Check Azure App Service SSL settings and certificate bindings</li>
            </ul>
          </div>
          <button className="btn btn-primary" onClick={() => window.location.reload()} style={{ marginTop: '1rem' }}>
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="new-users-dashboard">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>User Registration Management</h1>
          <p>Manage new user registrations and OTP verification process</p>
        </div>
        <div className="header-actions">
          <div className="date-display">
            <span className="day">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</span>
            <span className="date">{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <span>👥</span>
          </div>
          <div className="stat-content">
            <h3>{users.length}</h3>
            <p>Total Requests</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)' }}>
            <span>⏳</span>
          </div>
          <div className="stat-content">
            <h3>{pendingCount}</h3>
            <p>Pending Verification</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
            <span>✅</span>
          </div>
          <div className="stat-content">
            <h3>{users.filter(u => u.status === "approved").length}</h3>
            <p>Approved Users</p>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="filters-section">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="otp_sent">OTP Sent</option>
            <option value="approved">Approved</option>
          </select>
        </div>

        <button className="btn btn-primary" onClick={handleApproveAll}>
          <span className="btn-icon">📨</span>
          Send OTP to All Pending
        </button>
      </div>

      {/* Users Table */}
      <div className="content-card">
        <div className="card-header">
          <h2>User Registration Requests</h2>
          <span className="results-count">{filteredUsers.length} results</span>
        </div>

        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>User Details</th>
                <th>Business Name</th>
                <th>Pending Products</th>
                <th>Registration Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} className="user-row">
                  <td>
                    <div className="user-info">
                      <div className="user-name">{user.name}</div>
                      <div className="user-email">{user.email}</div>
                      <div className="user-phone">{user.phone}</div>
                    </div>
                  </td>
                  <td>
                    <div className="company-info">
                      {user.company}
                    </div>
                  </td>
                  <td>
                    <div className="pending-products">
                      <span className="pending-count">{user.pendingProductCount}</span>
                      <span className="pending-label">products pending</span>
                    </div>
                  </td>
                  <td>
                    <div className="date-info">
                      {user.registrationDate}
                    </div>
                  </td>
                  <td>
                    <div className={`status-indicator status-${user.status}`}>
                      <span className="status-icon">
                        {user.status === "pending" ? "⏳" :
                          user.status === "otp_sent" ? "📨" : "✅"}
                      </span>
                      <span className="status-text">
                        {user.status === "pending" ? "Pending" :
                          user.status === "otp_sent" ? "OTP Sent" : "Approved"}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn view-btn"
                        title="View Details"
                        onClick={() => handleViewDetails(user)}
                      >
                        👁️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <h3>No users found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* User Detail Modal */}
      {showModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>User Details</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className="user-details-grid">
                {/* Address Details Section */}
                <div className="detail-section">
                  <h3>Address Details</h3>
                  <div className="detail-item">
                    <label>Full Address:</label>
                    <span>{selectedUser.address}</span>
                  </div>
                  <div className="detail-item">
                    <label>Account Holder name:</label>
                    <span>{selectedUser.accountHolderName}</span>
                    <label>Account Number:</label>
                    <span>{selectedUser.accountNumber}</span>
                    <label>IFSC code:</label>
                    <span>{selectedUser.ifscCode}</span>
                  </div>
                </div>

                {/* Order Details Section */}
                <div className="detail-section">
                  <h3>User Information</h3>
                  <div className="detail-item">
                    <label>User ID:</label>
                    <span>{selectedUser.id}</span>
                  </div>
                  <div className="detail-item">
                    <label>Business Name:</label>
                    <span>{selectedUser.company}</span>
                  </div>
                  <div className="detail-item">
                    <label>Registration Date:</label>
                    <span>{selectedUser.registrationDate}</span>
                  </div>
                  <div className="detail-item">
                    <label>Pending Products:</label>
                    <span className="pending-count-badge">{selectedUser.pendingProductCount}</span>
                  </div>
                </div>

                {/* OTP Section */}
                {selectedUser.status === "otp_sent" && otp && (
                  <div className="detail-section">
                    <h3>OTP Information</h3>
                    <div className="otp-section">
                      <div className="otp-display">
                        <span className="otp-label">Generated OTP:</span>
                        <span className="otp-code">{otp}</span>
                      </div>
                      <p className="otp-help-text">OTP has been sent to the user for verification</p>
                    </div>
                  </div>
                )}

                {/* Product Images Section with Dual Navigation */}
                <div className="detail-section full-width">
                  <h3>Product Images</h3>
                  <div className="product-images-container">
                    {/* Product Navigation */}
                    <div className="product-navigation">
                      <button
                        className="nav-btn product-prev-btn"
                        onClick={handlePrevProduct}
                        disabled={currentProductIndex === 0}
                      >
                        ‹ Previous Product
                      </button>

                      <div className="product-info">
                        <div className="product-counter">
                          Product {currentProductIndex + 1} of {selectedUser.products.length}
                        </div>
                        <div className="product-name">{getCurrentProduct()?.name}</div>
                      </div>

                      <button
                        className="nav-btn product-next-btn"
                        onClick={handleNextProduct}
                        disabled={currentProductIndex === selectedUser.products.length - 1}
                      >
                        Next Product ›
                      </button>
                    </div>

                    {/* Image Navigation */}
                    <div className="image-navigation">
                      <button
                        className="nav-btn image-prev-btn"
                        onClick={handlePrevImage}
                        disabled={currentImageIndex === 0}
                      >
                        ‹ Previous Image
                      </button>

                      <div className="image-display">
                        {getCurrentImage() ? (
                          <img
                            src={getCurrentImage()}
                            alt={`${getCurrentProduct()?.name} - View ${currentImageIndex + 1}`}
                            className="product-image"
                          />
                        ) : (
                          <div className="no-image-placeholder">
                            <span className="no-image-icon">📷</span>
                            <p>No product image available</p>
                          </div>
                        )}
                      </div>

                      <button
                        className="nav-btn image-next-btn"
                        onClick={handleNextImage}
                        disabled={currentImageIndex === (getCurrentProduct()?.images?.length - 1 || 0)}
                      >
                        Next Image ›
                      </button>
                    </div>

                    <div className="navigation-info">
                      <div className="image-counter">
                        Image {currentImageIndex + 1} of {getCurrentProduct()?.images?.length || 0}
                      </div>
                      {/* <div className="completion-status">
                        {isLastProduct() ? (
                          <span className="status-complete">✅ All products reviewed</span>
                        ) : (
                          <span className="status-incomplete">⏳ Review all products to send OTP</span>
                        )}
                      </div> */}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              {selectedUser.status === "pending" && (
                <button
                  className="action-btn approve-btn"
                  title="Approved user"
                  onClick={() => handleApprovedUser(selectedUser.id)}
                >
                  Approved user
                </button>
              )}


              <button
                className="btn btn-danger"
                onClick={() => handleRejectUser(selectedUser.id)}
              >
                <span className="btn-icon">❌</span>
                Reject User
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default NewUsers;