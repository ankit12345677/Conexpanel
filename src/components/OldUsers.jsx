import React, { useState, useEffect } from "react";
import "../OldUsers.css";

const OldUsers = () => {
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

  // New state for editing amount
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [editedAmount, setEditedAmount] = useState("");
  const [editHistory, setEditHistory] = useState([]);

  // New state for enhanced navigation
  const [showProductGrid, setShowProductGrid] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [showBulkApprove, setShowBulkApprove] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        const API_URL = 'https://ecc-dab7cvdcceethsdz.centralindia-01.azurewebsites.net/api/OldUsers/Old';
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

        // Group products by userId
        const userMap = new Map();

        await Promise.all(
          data.map(async (item) => {
            let formattedAddress = "";

            try {
              if (item.addressUrlString) {
                const response = await fetch(item.addressUrlString);
                const addressText = await response.text();
                const addressJson = JSON.parse(addressText);
                formattedAddress = formatAddress(addressJson);
              }
            } catch (err) {
              console.error("Address fetch/parse failed:", err);
              formattedAddress = "Unable to load address";
            }

            // Create product object
            const product = {
              id: item.productId,
              name: item.productName,
              productId: item.productId,
              amount: `₹${parseFloat(item.updatedPrice || item.price || 0).toLocaleString('en-IN')}`,
              price: parseFloat(item.updatedPrice || item.price || 0),
              status: item.isApproved === "approved" ? "approved" : "pending",
              images: item.primaryImageUrl ? [item.primaryImageUrl] : [],
              category: item.category,
              subCategory: item.subCategory,
              brand: item.brand,
              stock: item.stock,
              minOrderQuantity: item.minOrderQuantity,
              discountPrice: item.discountPrice
            };

            if (userMap.has(item.userId)) {
              const existingUser = userMap.get(item.userId);
              existingUser.products.push(product);
              // Update user status if any product is pending
              if (item.isApproved !== "approved") {
                existingUser.status = "pending";
              }
              // Update total revenue
              const totalRevenue = existingUser.products.reduce((sum, p) => sum + (p.price || 0), 0);
              existingUser.revenue = `₹${totalRevenue.toLocaleString('en-IN')}`;
              userMap.set(item.userId, existingUser);
            } else {
              const newUser = {
                id: item.userId,
                name: item.businessName || "N/A",
                email: item.email || "N/A",
                phone: item.phone || "N/A",
                company: item.businessName || "N/A",
                address: formattedAddress,
                revenue: `₹${parseFloat(item.updatedPrice || item.price || 0).toLocaleString('en-IN')}`,
                orders: 0,
                joinDate: "2023-01-01",
                lastActive: "Recently",
                status: item.isApproved === "approved" ? "approved" : "pending",
                products: [product]
              };
              userMap.set(item.userId, newUser);
            }
          })
        );

        const transformedUsers = Array.from(userMap.values());
        setUsers(transformedUsers);
        console.log("Transformed users:", transformedUsers);
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
    setIsEditingAmount(false);
    setShowProductGrid(false);
    setProductSearchTerm("");
    setShowBulkApprove(false);
    setSelectedProducts([]);
  };

  const handleApproveProduct = async (userId, productId, editedAmount) => {
    console.log("Approving product - UserId:", userId, "ProductId:", productId, "Amount:", editedAmount);

    if (!window.confirm("Are you sure you want to approve this product?")) return;

    try {
      const currentUser = users.find(u => u.id === userId);
      const currentProduct = currentUser?.products?.find(p => p.id === productId);

      if (!currentProduct) {
        alert("❌ Product not found");
        return;
      }

      let rawAmount;
      if (editedAmount) {
        rawAmount = editedAmount;
      } else if (currentProduct.price) {
        rawAmount = currentProduct.price;
      } else if (currentProduct.amount) {
        rawAmount = currentProduct.amount.replace(/[₹$,]/g, "");
      } else {
        alert("❌ Could not determine product price");
        return;
      }

      const numericAmount = parseFloat(rawAmount.toString().replace(/[₹$,]/g, ""));

      console.log("Parsed amount:", numericAmount);

      if (isNaN(numericAmount) || numericAmount <= 0) {
        alert("❌ Invalid amount");
        return;
      }

      const response = await fetch(
        "https://ecc-dab7cvdcceethsdz.centralindia-01.azurewebsites.net/api/UpdatePrice/Price",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            SupplierId: userId,
            Productid: productId,
            Price: numericAmount.toString(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Approve product API failed");
      }

      const formattedAmount = `₹${numericAmount.toLocaleString("en-IN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      })}`;

      // Update local state
      setUsers(prev =>
        prev.map(user =>
          user.id === userId
            ? {
                ...user,
                products: user.products.map(p =>
                  p.id === productId
                    ? {
                        ...p,
                        status: "approved",
                        amount: formattedAmount,
                        price: numericAmount
                      }
                    : p
                ),
                status: user.products.every(p => 
                  p.id === productId ? true : p.status === "approved"
                ) ? "approved" : "pending",
                revenue: `₹${user.products
                  .map(p => p.id === productId ? numericAmount : (p.price || 0))
                  .reduce((sum, price) => sum + price, 0)
                  .toLocaleString('en-IN')}`
              }
            : user
        )
      );

      // Update selected user if modal is open
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser(prev => ({
          ...prev,
          products: prev.products.map(p =>
            p.id === productId
              ? {
                  ...p,
                  status: "approved",
                  amount: formattedAmount,
                  price: numericAmount
                }
              : p
          ),
          status: prev.products.every(p => 
            p.id === productId ? true : p.status === "approved"
          ) ? "approved" : "pending",
          revenue: `₹${prev.products
            .map(p => p.id === productId ? numericAmount : (p.price || 0))
            .reduce((sum, price) => sum + price, 0)
            .toLocaleString('en-IN')}`
        }));
      }

      alert("✅ Product approved & price updated successfully");
      setIsEditingAmount(false);
      
      // Remove selected product from bulk list if in bulk mode
      setSelectedProducts(prev => prev.filter(id => id !== productId));

    } catch (err) {
      console.error(err);
      alert("❌ Failed to approve product. Please try again.");
    }
  };

  const handleBulkApprove = async () => {
    if (selectedProducts.length === 0) {
      alert("Please select at least one product");
      return;
    }

    if (!window.confirm(`Are you sure you want to approve ${selectedProducts.length} products?`)) return;

    let successCount = 0;
    let failCount = 0;

    for (const productId of selectedProducts) {
      try {
        const product = selectedUser.products.find(p => p.id === productId);
        await handleApproveProduct(selectedUser.id, productId, product.price);
        successCount++;
      } catch (error) {
        console.error(`Failed to approve product ${productId}:`, error);
        failCount++;
      }
    }

    alert(`✅ ${successCount} products approved successfully\n❌ ${failCount} products failed`);
    setSelectedProducts([]);
    setShowBulkApprove(false);
  };

  const handleRejectProduct = (userId, productId) => {
    if (window.confirm("Are you sure you want to reject this product?")) {
      setUsers(users.map(user =>
        user.id === userId
          ? {
              ...user,
              products: user.products.map(product =>
                product.id === productId
                  ? { ...product, status: "rejected" }
                  : product
              ),
              status: "rejected",
              revenue: `₹${user.products
                .map(p => p.id === productId ? 0 : (p.price || 0))
                .reduce((sum, price) => sum + price, 0)
                .toLocaleString('en-IN')}`
            }
          : user
      ));

      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser(prev => ({
          ...prev,
          products: prev.products.map(product =>
            product.id === productId
              ? { ...product, status: "rejected" }
              : product
          ),
          status: "rejected",
          revenue: `₹${prev.products
            .map(p => p.id === productId ? 0 : (p.price || 0))
            .reduce((sum, price) => sum + price, 0)
            .toLocaleString('en-IN')}`
        }));
      }

      alert("Product has been rejected.");
      setSelectedProducts(prev => prev.filter(id => id !== productId));
    }
  };

  const handleUpdateAmount = (userId, productId, newAmount) => {
    if (!newAmount || isNaN(newAmount) || parseFloat(newAmount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    const numericAmount = parseFloat(newAmount);
    const formattedAmount = `₹${numericAmount.toLocaleString('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`;

    setUsers(users.map(user =>
      user.id === userId
        ? {
            ...user,
            products: user.products.map(product =>
              product.id === productId
                ? { ...product, amount: formattedAmount, price: numericAmount }
                : product
            ),
            revenue: `₹${user.products
              .map(p => p.id === productId ? numericAmount : (p.price || 0))
              .reduce((sum, price) => sum + price, 0)
              .toLocaleString('en-IN')}`
          }
        : user
    ));

    if (selectedUser && selectedUser.id === userId) {
      setSelectedUser(prev => ({
        ...prev,
        products: prev.products.map(product =>
          product.id === productId
            ? { ...product, amount: formattedAmount, price: numericAmount }
            : product
        ),
        revenue: `₹${prev.products
          .map(p => p.id === productId ? numericAmount : (p.price || 0))
          .reduce((sum, price) => sum + price, 0)
          .toLocaleString('en-IN')}`
      }));
    }

    const product = users.find(u => u.id === userId)?.products.find(p => p.id === productId);
    if (product) {
      const editRecord = {
        userId,
        productId,
        productName: product.name,
        oldAmount: product.amount,
        newAmount: formattedAmount,
        timestamp: new Date().toLocaleString()
      };
      setEditHistory(prev => [...prev, editRecord]);
    }

    setIsEditingAmount(false);
    alert(`Amount updated to ${formattedAmount}`);
  };

  const canMoveToNextProduct = () => {
    if (!selectedUser || currentProductIndex >= selectedUser.products.length - 1) {
      return false;
    }
    const currentProduct = selectedUser.products[currentProductIndex];
    return currentProduct.status === "approved";
  };

  const areAllProductsApproved = () => {
    if (!selectedUser) return false;
    return selectedUser.products.every(product => product.status === "approved");
  };

  const handleNextProduct = () => {
    if (canMoveToNextProduct()) {
      setCurrentProductIndex(prev => prev + 1);
      setCurrentImageIndex(0);
      setIsEditingAmount(false);
    }
  };

  const handlePrevProduct = () => {
    setCurrentProductIndex(prev => prev > 0 ? prev - 1 : prev);
    setCurrentImageIndex(0);
    setIsEditingAmount(false);
  };

  const handleNextImage = () => {
    if (selectedUser && selectedUser.products[currentProductIndex]) {
      const currentProduct = selectedUser.products[currentProductIndex];
      const maxImages = Math.min(currentProduct.images.length, 5);
      setCurrentImageIndex(prev =>
        prev < maxImages - 1 ? prev + 1 : prev
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
    const images = currentProduct?.images?.slice(0, 5) || [];
    return images[currentImageIndex];
  };

  const getProductImages = (product) => {
    return product.images.slice(0, 5);
  };

  const totalRevenue = users.reduce((sum, user) => {
    const revenue = parseFloat(
      (user.revenue || "₹0").replace('₹', '').replace(/,/g, '')
    );
    return sum + (isNaN(revenue) ? 0 : revenue);
  }, 0);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.company.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "all" || user.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const filteredProducts = selectedUser?.products.filter(product =>
    product.name.toLowerCase().includes(productSearchTerm.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <div className="old-users-dashboard">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="old-users-dashboard">
        <div className="error-state">
          <div className="error-icon">❌</div>
          <h3>Error Loading Users</h3>
          <p>{error}</p>
          <button 
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="old-users-dashboard">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Registered Users Management</h1>
          <p>Manage existing users and view their activity metrics</p>
        </div>
        <div className="header-actions">
          <div className="date-display">
            <span className="day">Tuesday</span>
            <span className="date">June 27, 2023</span>
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
            <p>Total Users</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)' }}>
            <span>📊</span>
          </div>
          <div className="stat-content">
            <h3>{users.reduce((sum, user) => sum + user.orders, 0)}</h3>
            <p>Total Orders</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)' }}>
            <span>💰</span>
          </div>
          <div className="stat-content">
            <h3>₹{totalRevenue.toLocaleString('en-IN')}</h3>
            <p>Total Revenue</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
            <span>⭐</span>
          </div>
          <div className="stat-content">
            <h3>85%</h3>
            <p>Avg. Satisfaction</p>
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
            <option value="approved">Approved</option>
            <option value="pending">Pending Review</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="content-card">
        <div className="card-header">
          <h2>Registered Users</h2>
          <span className="results-count">{filteredUsers.length} results</span>
        </div>

        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>User Details</th>
                <th>Company</th>
                <th>Products</th>
                <th>Revenue</th>
                <th>Join Date</th>
                <th>Orders</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr key={`${user.id}-${index}`} className="user-row">
                  <td>
                    <div className="user-info">
                      <div className="user-name">{user.name}</div>
                      <div className="user-email">{user.email}</div>
                      <div className="user-phone">{user.phone}</div>
                      <div className="user-id">ID: {user.id}</div>
                    </div>
                  </td>
                  <td>
                    <div className="company-info">
                      {user.company}
                    </div>
                  </td>
                  <td>
                    <div className="products-info">
                      {user.products.map((product, index) => (
                        <div key={product.id} className="product-tag">
                          {product.name}
                          <span className={`product-status status-${product.status}`}>
                            {product.status === "approved" ? " ✅" :
                              product.status === "rejected" ? " ❌" : " ⏳"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="revenue-badge">
                      {user.revenue}
                    </div>
                  </td>
                  <td>
                    <div className="date-info">
                      {user.joinDate}
                    </div>
                  </td>
                  <td>
                    <div className="orders-badge">
                      {user.orders}
                    </div>
                  </td>
                  <td>
                    <div className={`status-indicator status-${user.status}`}>
                      <span className="status-icon">
                        {user.status === "approved" ? "✅" :
                          user.status === "pending" ? "⏳" : "❌"}
                      </span>
                      <span className="status-text">
                        {user.status === "approved" ? "Approved" :
                          user.status === "pending" ? "Pending Review" : "Rejected"}
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
          <div className="modal modal-large">
            <div className="modal-header">
              <h2>User Details - {selectedUser.name}</h2>
              <div className="modal-header-actions">
                {selectedUser.products.length > 5 && (
                  <button
                    className="btn btn-outline-primary bulk-approve-btn"
                    onClick={() => setShowBulkApprove(!showBulkApprove)}
                  >
                    {showBulkApprove ? 'Cancel Bulk Approve' : '📦 Bulk Approve'}
                  </button>
                )}
                <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
              </div>
            </div>

            <div className="modal-body">
              {/* Quick Navigation Dropdown */}
              <div className="quick-nav-section">
                <div className="product-jump-dropdown">
                  <label>Quick Jump to Product:</label>
                  <select 
                    value={currentProductIndex}
                    onChange={(e) => {
                      setCurrentProductIndex(parseInt(e.target.value));
                      setCurrentImageIndex(0);
                      setShowProductGrid(false);
                    }}
                    className="product-select"
                  >
                    {selectedUser.products.map((product, index) => (
                      <option key={product.id} value={index}>
                        {index + 1}. {product.name.substring(0, 30)}{product.name.length > 30 ? '...' : ''} - {product.amount} 
                        [{product.status === "approved" ? "✅" : 
                          product.status === "rejected" ? "❌" : "⏳"}]
                      </option>
                    ))}
                  </select>
                </div>

                {/* Product Search */}
                <div className="product-search-section">
                  <div className="product-search-box">
                    <span className="search-icon">🔍</span>
                    <input
                      type="text"
                      placeholder="Search products by name..."
                      value={productSearchTerm}
                      onChange={(e) => setProductSearchTerm(e.target.value)}
                      className="product-search-input"
                    />
                  </div>
                  {productSearchTerm && filteredProducts.length > 0 && (
                    <div className="product-search-results">
                      {filteredProducts.map((product) => {
                        const actualIndex = selectedUser.products.findIndex(p => p.id === product.id);
                        return (
                          <div 
                            key={product.id}
                            className="search-result-item"
                            onClick={() => {
                              setCurrentProductIndex(actualIndex);
                              setCurrentImageIndex(0);
                              setProductSearchTerm("");
                            }}
                          >
                            <span className="result-name">{product.name}</span>
                            <span className={`result-status status-${product.status}`}>
                              {product.status}
                            </span>
                            <span className="result-amount">{product.amount}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Product Grid Toggle */}
                <div className="product-grid-toggle">
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={() => setShowProductGrid(!showProductGrid)}
                  >
                    {showProductGrid ? 'Hide Product Grid' : '📊 Show All Products Grid'}
                  </button>
                </div>
              </div>

              {/* Product Grid View */}
              {showProductGrid && (
                <div className="product-grid">
                  <h4>All Products ({selectedUser.products.length})</h4>
                  <div className="product-grid-container">
                    {selectedUser.products.map((product, index) => (
                      <div 
                        key={product.id}
                        className={`product-grid-item ${currentProductIndex === index ? 'active' : ''} status-${product.status}`}
                        onClick={() => {
                          setCurrentProductIndex(index);
                          setCurrentImageIndex(0);
                          setShowProductGrid(false);
                        }}
                      >
                        <div className="product-grid-image">
                          {product.images[0] ? (
                            <img src={product.images[0]} alt={product.name} />
                          ) : (
                            <span className="no-image">📷</span>
                          )}
                        </div>
                        <div className="product-grid-info">
                          <div className="product-grid-name">{product.name}</div>
                          <div className="product-grid-amount">{product.amount}</div>
                          <div className={`product-grid-status status-${product.status}`}>
                            {product.status === "approved" ? "✅ Approved" : 
                             product.status === "rejected" ? "❌ Rejected" : "⏳ Pending"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bulk Approve Section */}
              {showBulkApprove && (
                <div className="bulk-approve-section">
                  <h4>Select Products to Approve</h4>
                  <div className="bulk-approve-grid">
                    {selectedUser.products.map(product => (
                      <label key={product.id} className="bulk-approve-item">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProducts([...selectedProducts, product.id]);
                            } else {
                              setSelectedProducts(selectedProducts.filter(id => id !== product.id));
                            }
                          }}
                          disabled={product.status === "approved"}
                        />
                        <div className="bulk-product-info">
                          <span className="bulk-product-name">{product.name}</span>
                          <span className="bulk-product-amount">{product.amount}</span>
                          <span className={`bulk-product-status status-${product.status}`}>
                            {product.status}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                  {selectedProducts.length > 0 && (
                    <div className="bulk-actions">
                      <button 
                        className="btn btn-success"
                        onClick={handleBulkApprove}
                      >
                        ✅ Approve Selected ({selectedProducts.length})
                      </button>
                      <button 
                        className="btn btn-secondary"
                        onClick={() => setSelectedProducts([])}
                      >
                        Clear Selection
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="user-details-grid">
                {/* User Information Sections */}
                <div className="detail-section">
                  <h3>Personal Information</h3>
                  <div className="detail-item">
                    <label>Full Name:</label>
                    <span>{selectedUser.name}</span>
                  </div>
                  <div className="detail-item">
                    <label>Email Address:</label>
                    <span>{selectedUser.email}</span>
                  </div>
                  <div className="detail-item">
                    <label>Phone Number:</label>
                    <span>{selectedUser.phone}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Business Information</h3>
                  <div className="detail-item">
                    <label>Company Name:</label>
                    <span>{selectedUser.company}</span>
                  </div>
                  <div className="detail-item">
                    <label>User ID:</label>
                    <span>{selectedUser.id}</span>
                  </div>
                  <div className="detail-item">
                    <label>Address:</label>
                    <span>{selectedUser.address}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Performance Metrics</h3>
                  <div className="detail-item">
                    <label>Total Orders:</label>
                    <span>{selectedUser.orders}</span>
                  </div>
                  <div className="detail-item">
                    <label>Total Revenue:</label>
                    <span className="revenue">{selectedUser.revenue}</span>
                  </div>
                  <div className="detail-item">
                    <label>Last Active:</label>
                    <span>{selectedUser.lastActive}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Current Product ({currentProductIndex + 1} of {selectedUser.products.length})</h3>
                  <div className="detail-item">
                    <label>Product/Service:</label>
                    <span>{getCurrentProduct()?.name}</span>
                  </div>
                  <div className="detail-item">
                    <label>Product ID:</label>
                    <span>{getCurrentProduct()?.id}</span>
                  </div>
                  <div className="detail-item">
                    <label>Category:</label>
                    <span>{getCurrentProduct()?.category || "N/A"}</span>
                  </div>
                  <div className="detail-item">
                    <label>Brand:</label>
                    <span>{getCurrentProduct()?.brand || "N/A"}</span>
                  </div>
                  <div className="detail-item">
                    <label>Stock:</label>
                    <span>{getCurrentProduct()?.stock || 0}</span>
                  </div>
                  <div className="detail-item">
                    <label>Amount:</label>
                    <div className="amount-container">
                      {isEditingAmount ? (
                        <div className="amount-edit-container">
                          <div className="amount-input-group">
                            <span className="currency-sign">₹</span>
                            <input
                              type="number"
                              value={editedAmount}
                              onChange={(e) => setEditedAmount(e.target.value)}
                              className="amount-input"
                              placeholder="Enter amount"
                              min="0"
                              step="0.01"
                            />
                          </div>
                          <div className="amount-edit-buttons">
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleUpdateAmount(
                                selectedUser.id,
                                getCurrentProduct()?.id,
                                editedAmount
                              )}
                            >
                              Save
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => {
                                setIsEditingAmount(false);
                                setEditedAmount(getCurrentProduct()?.amount.replace('₹', '').replace(/,/g, ''));
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="amount-display-container">
                          <span className="amount-display">
                            {getCurrentProduct()?.amount}
                          </span>
                          {getCurrentProduct()?.status === "pending" && (
                            <button
                              className="btn btn-warning btn-sm edit-amount-btn"
                              onClick={() => {
                                setIsEditingAmount(true);
                                setEditedAmount(
                                  getCurrentProduct()?.amount.replace(/[₹$,]/g, '')
                                );
                              }}
                              title="Edit amount"
                            >
                              ✏ Edit Amount
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="detail-item">
                    <label>Status:</label>
                    <span className={`product-status-badge status-${getCurrentProduct()?.status}`}>
                      {getCurrentProduct()?.status === "approved" ? "Approved" :
                        getCurrentProduct()?.status === "rejected" ? "Rejected" : "Pending Review"}
                    </span>
                  </div>
                </div>

                {/* Product Images Section */}
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
                        <div className="product-amount">{getCurrentProduct()?.amount}</div>
                        <div className="approval-status">
                          {getCurrentProduct()?.status === "approved" ? (
                            <span className="status-approved">✅ Approved</span>
                          ) : getCurrentProduct()?.status === "rejected" ? (
                            <span className="status-rejected">❌ Rejected</span>
                          ) : (
                            <span className="status-pending">⏳ Pending Approval</span>
                          )}
                        </div>
                      </div>

                      <button
                        className="nav-btn product-next-btn"
                        onClick={handleNextProduct}
                        disabled={!canMoveToNextProduct()}
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
                        disabled={currentImageIndex === (getProductImages(getCurrentProduct()).length - 1 || 0)}
                      >
                        Next Image ›
                      </button>
                    </div>

                    <div className="navigation-info">
                      <div className="image-counter">
                        Image {currentImageIndex + 1} of {getProductImages(getCurrentProduct()).length || 0}
                        {getCurrentProduct()?.images.length > 5 && (
                          <span className="image-limit-note"> (showing first 5 of {getCurrentProduct()?.images.length})</span>
                        )}
                      </div>
                      {!canMoveToNextProduct() && currentProductIndex < selectedUser.products.length - 1 && (
                        <div className="next-product-message">
                          ⚠️ Approve this product to continue to the next one
                        </div>
                      )}
                    </div>

                    {/* Product Approval Actions */}
                    {getCurrentProduct()?.status === "pending" && (
                      <div className="product-actions">
                        <div className="action-buttons">
                          <button
                            className="btn btn-success"
                            onClick={() => {
                              const amountToSend = isEditingAmount ? editedAmount : undefined;
                              handleApproveProduct(
                                selectedUser.id,
                                getCurrentProduct().id,
                                amountToSend
                              );
                            }}
                            disabled={isEditingAmount && (!editedAmount || parseFloat(editedAmount) <= 0)}
                          >
                            <span className="btn-icon">✅</span>
                            Approve Product
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={() => handleRejectProduct(selectedUser.id, getCurrentProduct()?.id)}
                          >
                            <span className="btn-icon">❌</span>
                            Reject Product
                          </button>
                        </div>
                        {isEditingAmount && (
                          <div className="edit-notice">
                            ⚠️ Finish editing the amount before approving or rejecting
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Edit History Section */}
                {editHistory.length > 0 && editHistory.some(edit =>
                  edit.userId === selectedUser.id && edit.productId === getCurrentProduct()?.id
                ) && (
                    <div className="detail-section">
                      <h3>Edit History</h3>
                      <div className="edit-history">
                        {editHistory
                          .filter(edit =>
                            edit.userId === selectedUser.id && edit.productId === getCurrentProduct()?.id
                          )
                          .map((edit, index) => (
                            <div key={index} className="edit-record">
                              <span className="edit-timestamp">{edit.timestamp}</span>
                              <span className="edit-change">
                                {edit.oldAmount} → {edit.newAmount}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>

            <div className="modal-footer">
              <div className="completion-status">
                {areAllProductsApproved() ? (
                  <span className="all-approved">✅ All products have been reviewed</span>
                ) : (
                  <span className="pending-approval">
                    ⏳ {selectedUser.products.filter(p => p.status === "pending").length} products pending approval
                  </span>
                )}
              </div>
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

export default OldUsers;