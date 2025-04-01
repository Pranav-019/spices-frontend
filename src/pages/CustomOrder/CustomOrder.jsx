import React, { useState, useEffect } from 'react';
import './CustomOrder.css';
import { FaBox, FaCheckCircle, FaTruck, FaHome, FaClipboardList, FaTimes, FaBars } from 'react-icons/fa';
import axios from 'axios';

const CustomOrder = () => {
  // Main order form state
  const [orderDetails, setOrderDetails] = useState({
    category: '',
    productName: '',
    quantity: '',
    grindLevel: 'medium',
    specialInstructions: '',
  });

  // Order tracking state
  const [orderStatus, setOrderStatus] = useState(() => {
    return localStorage.getItem('currentOrderStatus') || 'initial';
  });
  const [orderId, setOrderId] = useState(() => {
    return localStorage.getItem('currentOrderId') || null;
  });

  // Product data state
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(new Set());
  const [filteredProducts, setFilteredProducts] = useState([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [tokenAmount, setTokenAmount] = useState(0);
  const [userOrders, setUserOrders] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [pollingActive, setPollingActive] = useState(false);
  
  // Order history modal state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Persist order state to localStorage
  useEffect(() => {
    if (orderId) {
      localStorage.setItem('currentOrderId', orderId);
      setPollingActive(true);
    } else {
      localStorage.removeItem('currentOrderId');
      setPollingActive(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (orderStatus !== 'initial') {
      localStorage.setItem('currentOrderStatus', orderStatus);
    } else {
      localStorage.removeItem('currentOrderStatus');
    }
  }, [orderStatus]);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // Fetch products
        const productsResponse = await axios.get('https://spices-backend.vercel.app/api/products');
        setProducts(productsResponse.data);
        setCategories(new Set(productsResponse.data.map(p => p.category)));
        
        // Check authentication
        const token = localStorage.getItem('userToken');
        if (!token) {
          setLoading(false);
          return;
        }
        
        // Set auth header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Fetch user orders
        const ordersResponse = await axios.get('https://spices-backend.vercel.app/api/orders');
        setUserOrders(ordersResponse.data);
        
        // Handle saved order state
        const savedOrderId = localStorage.getItem('currentOrderId');
        if (savedOrderId) {
          try {
            const orderResponse = await axios.get(`https://spices-backend.vercel.app/api/orders/${savedOrderId}`);
            setOrderId(savedOrderId);
            updateFrontendStatus(orderResponse.data.orderStatus);
          } catch (err) {
            if (err.response?.status === 404) {
              localStorage.removeItem('currentOrderId');
              localStorage.removeItem('currentOrderStatus');
              setOrderId(null);
              setOrderStatus('initial');
            }
          }
        } else if (ordersResponse.data.length > 0) {
          const latestOrder = ordersResponse.data[0];
          setOrderId(latestOrder._id);
          updateFrontendStatus(latestOrder.orderStatus);
        }
      } catch (error) {
        console.error('Initialization error:', error);
        setError('Failed to load application data');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Filter products when category changes
  useEffect(() => {
    if (orderDetails.category && products.length > 0) {
      const filtered = products.filter(p => p.category === orderDetails.category);
      setFilteredProducts(filtered);
      
      if (orderDetails.productName && !filtered.some(p => p.name === orderDetails.productName)) {
        setOrderDetails(prev => ({ ...prev, productName: '' }));
      }
    } else {
      setFilteredProducts([]);
    }
  }, [orderDetails.category, products]);

  // Calculate token amount
  useEffect(() => {
    if (orderDetails.productName && orderDetails.quantity > 0) {
      const product = filteredProducts.find(p => p.name === orderDetails.productName);
      if (product) {
        const calculatedAmount = (product.price * (orderDetails.quantity / 500)) * 0.2;
        setTokenAmount(calculatedAmount.toFixed(2));
        return;
      }
    }
    setTokenAmount(0);
  }, [orderDetails.productName, orderDetails.quantity, filteredProducts]);

  // Order status polling
  useEffect(() => {
    if (!pollingActive || !orderId) return;

    let isMounted = true;
    let intervalId;

    const pollStatus = async () => {
      try {
        const response = await axios.get(`https://spices-backend.vercel.app/api/orders/${orderId}`);
        if (!isMounted) return;
        
        updateFrontendStatus(response.data.orderStatus);
        
        const ordersResponse = await axios.get('https://spices-backend.vercel.app/api/orders');
        if (isMounted) setUserOrders(ordersResponse.data);

        if (response.data.orderStatus === 'Delivered') {
          clearInterval(intervalId);
          setPollingActive(false);
        }
      } catch (error) {
        if (!isMounted) return;
        
        console.error('Polling error:', error);
        
        if (error.response?.status === 404) {
          clearInterval(intervalId);
          setPollingActive(false);
          setOrderId(null);
          setOrderStatus('initial');
          localStorage.removeItem('currentOrderId');
          localStorage.removeItem('currentOrderStatus');
          setError('Order not found - it may have been deleted');
        }
      }
    };

    pollStatus();
    intervalId = setInterval(pollStatus, 5000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [pollingActive, orderId]);

  const updateFrontendStatus = (backendStatus) => {
    const statusMap = {
      'Order Placed': 'Order Placed',
      'Processing': 'Processing',
      'Confirmed': 'Confirmed',
      'Shipped': 'Shipped',
      'Delivered': 'Delivered'
    };
    
    if (statusMap[backendStatus]) {
      setOrderStatus(statusMap[backendStatus]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderDetails(prev => ({
      ...prev,
      [name]: name === 'quantity' ? Math.max(1, parseInt(value) || 1) : value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!orderDetails.category || !orderDetails.productName || !orderDetails.quantity) {
      setError('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const orderData = {
        ...orderDetails,
        tokenAmount: parseFloat(tokenAmount),
        orderStatus: 'Order Placed'
      };

      const response = await axios.post('https://spices-backend.vercel.app/api/orders/create', orderData);
      setOrderId(response.data.order._id);
      setOrderStatus('Order Placed');
      setPollingActive(true);
      
      const ordersResponse = await axios.get('https://spices-backend.vercel.app/api/orders');
      setUserOrders(ordersResponse.data);
    } catch (error) {
      console.error('Order creation failed:', error);
      setError(error.response?.data?.message || 'Failed to create order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetOrderFlow = () => {
    setOrderId(null);
    setOrderStatus('initial');
    setOrderDetails({
      category: '',
      productName: '',
      quantity: '',
      grindLevel: 'medium',
      specialInstructions: '',
    });
    setPollingActive(false);
    localStorage.removeItem('currentOrderId');
    localStorage.removeItem('currentOrderStatus');
  };

  const viewOrderStatus = (order) => {
    setSelectedOrder(order);
    setShowStatusModal(true);
    setMobileMenuOpen(false); // Close mobile menu when opening modal
  };

  const getStepStatus = (step, statusToCheck) => {
    const statusOrder = ['initial', 'Order Placed', 'Processing', 'Confirmed', 'Shipped', 'Delivered'];
    const currentIdx = statusOrder.indexOf(statusToCheck || orderStatus);
    const stepIdx = statusOrder.indexOf(step);
    
    return currentIdx >= stepIdx ? 'completed' : 'pending';
  };

  if (loading) {
    return (
      <div className="custom-order">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="custom-order">
      {/* Mobile Menu Button */}
      <button 
        className="mobile-menu-button"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        <FaBars />
      </button>

      <h1>Custom Order</h1>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      <div className="main-content">
        <div className={`order-form-container ${mobileMenuOpen ? 'mobile-hidden' : ''}`}>
          <form onSubmit={handleSubmit} className="order-form">
            <div className="form-group">
              <label>Category</label>
              <select
                name="category"
                value={orderDetails.category}
                onChange={handleInputChange}
                required
                disabled={orderStatus !== 'initial'}
              >
                <option value="">Select Category</option>
                {Array.from(categories).map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Product Name</label>
              <select
                name="productName"
                value={orderDetails.productName}
                onChange={handleInputChange}
                required
                disabled={!orderDetails.category || orderStatus !== 'initial'}
              >
                <option value="">Select Product</option>
                {filteredProducts.map(product => (
                  <option key={product._id} value={product.name}>{product.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Quantity (in grams)</label>
              <input
                type="number"
                name="quantity"
                value={orderDetails.quantity}
                onChange={handleInputChange}
                min="1"
                required
                disabled={orderStatus !== 'initial'}
              />
            </div>

            <div className="form-group">
              <label>Grind Level</label>
              <select
                name="grindLevel"
                value={orderDetails.grindLevel}
                onChange={handleInputChange}
                disabled={orderStatus !== 'initial'}
              >
                <option value="coarse">Coarse</option>
                <option value="medium">Medium</option>
                <option value="fine">Fine</option>
              </select>
            </div>

            <div className="form-group">
              <label>Special Instructions</label>
              <textarea
                name="specialInstructions"
                value={orderDetails.specialInstructions}
                onChange={handleInputChange}
                placeholder="Any special requirements?"
                disabled={orderStatus !== 'initial'}
              />
            </div>

            <div className="form-group">
              <label>Token Amount</label>
              <input
                type="text"
                value={`₹${tokenAmount}`}
                readOnly
              />
            </div>

            {orderStatus === 'initial' ? (
              <button type="submit" className="submit-button" disabled={isSubmitting}>
                {isSubmitting ? 'Processing...' : 'Place Order'}
              </button>
            ) : (
              <div className="order-controls">
                <button type="button" className="status-button" disabled>
                  {orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1)}
                </button>
                <button type="button" className="reset-button" onClick={resetOrderFlow}>
                  New Order
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Order History Section */}
        <div className={`order-history-section ${mobileMenuOpen ? 'mobile-visible' : ''}`}>
          <h2>Your Orders</h2>
          {userOrders.length === 0 ? (
            <p className="no-orders">No orders found</p>
          ) : (
            <div className="order-cards-container">
              {userOrders.map(order => (
                <div 
                  key={order._id} 
                  className={`order-card ${order._id === orderId ? 'active' : ''}`}
                  onClick={() => viewOrderStatus(order)}
                >
                  <div className="order-card-content">
                    <div className="order-card-header">
                      <h3>{order.productName}</h3>
                      <span className={`order-status ${order.orderStatus.toLowerCase()}`}>
                        {order.orderStatus}
                      </span>
                    </div>
                    <div className="order-card-body">
                      <p><strong>Order ID:</strong> {order._id.slice(-6)}</p>
                      <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                      <p><strong>Amount:</strong> ₹{order.tokenAmount}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Order Status Tracking - Current Order */}
      {orderStatus !== 'initial' && (
        <div className={`order-tracking ${mobileMenuOpen ? 'mobile-hidden' : ''}`}>
          <h2>Current Order Status</h2>
          <div className="tracking-container">
            {['Order Placed', 'Processing', 'Confirmed', 'Shipped', 'Delivered'].map(step => (
              <div key={step} className={`tracking-step ${getStepStatus(step)}`}>
                <div className="step-icon">
                  {step === 'Order Placed' && <FaClipboardList />}
                  {step === 'Processing' && <FaBox />}
                  {step === 'Confirmed' && <FaCheckCircle />}
                  {step === 'Shipped' && <FaTruck />}
                  {step === 'Delivered' && <FaHome />}
                </div>
                <div className="step-info">
                  <h3>{step}</h3>
                  <p>
                    {step === 'Order Placed' && 'Your order has been placed'}
                    {step === 'Processing' && 'Your order is being prepared'}
                    {step === 'Confirmed' && 'Your order has been confirmed'}
                    {step === 'Shipped' && 'Your order is on the way'}
                    {step === 'Delivered' && 'Your order has arrived'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Order Status Modal */}
      {showStatusModal && selectedOrder && (
        <div className="status-modal-overlay">
          <div className="status-modal">
            <div className="modal-header">
              <h2>Order Status: {selectedOrder.productName}</h2>
              <button className="close-button" onClick={() => setShowStatusModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="order-details">
                <p><strong>Order ID:</strong> {selectedOrder._id}</p>
                <p><strong>Category:</strong> {selectedOrder.category}</p>
                <p><strong>Quantity:</strong> {selectedOrder.quantity}g</p>
                <p><strong>Grind Level:</strong> {selectedOrder.grindLevel}</p>
                <p><strong>Token Amount:</strong> ₹{selectedOrder.tokenAmount}</p>
                {selectedOrder.specialInstructions && (
                  <p><strong>Special Instructions:</strong> {selectedOrder.specialInstructions}</p>
                )}
              </div>
              
              <div className="tracking-container">
                {['Order Placed', 'Processing', 'Confirmed', 'Shipped', 'Delivered'].map(step => (
                  <div key={step} className={`tracking-step ${getStepStatus(step, selectedOrder.orderStatus)}`}>
                    <div className="step-icon">
                      {step === 'Order Placed' && <FaClipboardList />}
                      {step === 'Processing' && <FaBox />}
                      {step === 'Confirmed' && <FaCheckCircle />}
                      {step === 'Shipped' && <FaTruck />}
                      {step === 'Delivered' && <FaHome />}
                    </div>
                    <div className="step-info">
                      <h3>{step}</h3>
                      <p>
                        {step === 'Order Placed' && 'Your order has been placed'}
                        {step === 'Processing' && 'Your order is being prepared'}
                        {step === 'Confirmed' && 'Your order has been confirmed'}
                        {step === 'Shipped' && 'Your order is on the way'}
                        {step === 'Delivered' && 'Your order has arrived'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomOrder;