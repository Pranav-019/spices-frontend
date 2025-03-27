import React, { useState, useEffect } from 'react';
import './CustomOrder.css';
import { FaBox, FaCheckCircle, FaTruck, FaHome, FaClipboardList } from 'react-icons/fa';
import axios from 'axios';

const CustomOrder = () => {
  const [orderDetails, setOrderDetails] = useState({
    category: '',
    productName: '',
    quantity: '',
    grindLevel: 'medium',
    specialInstructions: '',
  });

  const [orderStatus, setOrderStatus] = useState('initial'); // initial, placed, processing, confirmed, shipped, delivered
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(new Set());
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tokenAmount, setTokenAmount] = useState(0); // State to store token amount
  const [orderId, setOrderId] = useState(null); // State to store the order ID after creation

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products');
        setProducts(response.data);
        // Extract unique categories
        const uniqueCategories = new Set(response.data.map(product => product.category));
        setCategories(uniqueCategories);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Filter products based on selected category
  useEffect(() => {
    if (orderDetails.category) {
      const filtered = products.filter(product => product.category === orderDetails.category);
      setFilteredProducts(filtered);
    }
  }, [orderDetails.category, products]);

  // Calculate token amount whenever product or quantity changes
  useEffect(() => {
    if (orderDetails.productName && orderDetails.quantity) {
      const selectedProduct = filteredProducts.find(product => product.name === orderDetails.productName);
      if (selectedProduct) {
        const pricePer500g = selectedProduct.price; // Assuming price is for 500g
        const quantityIn500g = orderDetails.quantity / 500;
        const calculatedTokenAmount = (pricePer500g * quantityIn500g) * 0.2; // 20% of the total price
        setTokenAmount(calculatedTokenAmount.toFixed(2)); // Round to 2 decimal places
      }
    } else {
      setTokenAmount(0); // Reset token amount if no product or quantity is selected
    }
  }, [orderDetails.productName, orderDetails.quantity, filteredProducts]);

  // Poll order status from the backend
  useEffect(() => {
    if (!orderId) return; // Don't poll if no order ID is set

    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/orders/${orderId}`);
        const backendOrderStatus = response.data.orderStatus;

        // Map backend status to frontend status
        const statusMapping = {
          'Order Placed': 'placed',
          'Processing': 'processing',
          'Confirmed': 'confirmed',
          'Shipped': 'shipped',
          'Delivered': 'delivered',
        };

        if (statusMapping[backendOrderStatus]) {
          setOrderStatus(statusMapping[backendOrderStatus]);
        }

        // Stop polling if the order is delivered
        if (backendOrderStatus === 'Delivered') {
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Error fetching order status:', error);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [orderId]);

  const handleInputChange = (e) => {
    setOrderDetails({
      ...orderDetails,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare order data
    const orderData = {
      ...orderDetails,
      tokenAmount: parseFloat(tokenAmount),
      orderStatus: 'Order Placed' // Set initial status
    };

    try {
      // Send order to the API
      const response = await axios.post('http://localhost:5000/api/orders/create', orderData);
      console.log('Order created:', response.data);

      // Set the order ID for polling
      setOrderId(response.data._id);

      // Update order status
      setOrderStatus('placed');
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  const getStepStatus = (step) => {
    const stages = {
      'initial': 0,
      'placed': 1,
      'processing': 2,
      'confirmed': 3,
      'shipped': 4,
      'delivered': 5
    };

    return stages[orderStatus] >= stages[step] ? 'completed' : 'pending';
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="custom-order">
      <h1>Custom Order</h1>

      {/* Order Form */}
      <div className="order-form-container">
        <form onSubmit={handleSubmit} className="order-form">
          <div className="form-group">
            <label>Category</label>
            <select
              name="category"
              value={orderDetails.category}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Category</option>
              {Array.from(categories).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
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
              disabled={!orderDetails.category}
            >
              <option value="">Select Product</option>
              {filteredProducts.map((product) => (
                <option key={product._id} value={product.name}>
                  {product.name}
                </option>
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
              placeholder="Enter quantity"
              required
            />
          </div>

          <div className="form-group">
            <label>Grind Level</label>
            <select
              name="grindLevel"
              value={orderDetails.grindLevel}
              onChange={handleInputChange}
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
            />
          </div>

          {/* Display Token Amount */}
          <div className="form-group">
            <label>Token Amount</label>
            <input
              type="text"
              value={`₹${tokenAmount}`}
              readOnly
            />
          </div>

          <button type="submit" className="submit-button" disabled={orderStatus !== 'initial'}>
            {orderStatus === 'initial' ? 'Place Custom Order' : 'Order Placed'}
          </button>
        </form>
      </div>

      {/* Order Tracking */}
      <div className="order-tracking">
        <h2>Order Status</h2>
        <div className="tracking-container">
          <div className={`tracking-step ${getStepStatus('placed')}`}>
            <div className="step-icon">
              <FaClipboardList />
            </div>
            <div className="step-info">
              <h3>Order Placed</h3>
              <p>Your order has been placed</p>
            </div>
          </div>

          <div className={`tracking-step ${getStepStatus('processing')}`}>
            <div className="step-icon">
              <FaBox />
            </div>
            <div className="step-info">
              <h3>Order Processing</h3>
              <p>Your order is being processed</p>
            </div>
          </div>

          <div className={`tracking-step ${getStepStatus('confirmed')}`}>
            <div className="step-icon">
              <FaCheckCircle />
            </div>
            <div className="step-info">
              <h3>Order Confirmed</h3>
              <p>Your order has been confirmed</p>
            </div>
          </div>

          <div className={`tracking-step ${getStepStatus('shipped')}`}>
            <div className="step-icon">
              <FaTruck />
            </div>
            <div className="step-info">
              <h3>Order Shipped</h3>
              <p>Your order is on the way</p>
            </div>
          </div>

          <div className={`tracking-step ${getStepStatus('delivered')}`}>
            <div className="step-icon">
              <FaHome />
            </div>
            <div className="step-info">
              <h3>Order Delivered</h3>
              <p>Your order has been delivered</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomOrder;