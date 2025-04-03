import React, { useState, useEffect } from 'react';
import { FaBox, FaCheckCircle, FaTruck, FaHome, FaClipboardList, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import './ProductOrder.css';

const ProductOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);

  useEffect(() => {
    const fetchUserOrders = async () => {
      try {
        const token = localStorage.getItem('userToken');
        if (!token) {
          setError('Please login to view your orders');
          setLoading(false);
          return;
        }

        const response = await axios.get('https://spices-backend-2jr1.vercel.app/api/productorder/user', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setOrders(response.data);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err.response?.data?.message || 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchUserOrders();
  }, []);

  const getStepStatus = (step, currentStatus) => {
    const statusOrder = ['Order Placed', 'Processing', 'Confirmed', 'Shipped', 'Delivered'];
    const currentIdx = statusOrder.indexOf(currentStatus);
    const stepIdx = statusOrder.indexOf(step);
    
    return currentIdx >= stepIdx ? 'completed' : 'pending';
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="product-order-container">
        <h1 className="page-title">Your Orders</h1>
        <div className="loading-text">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-order-container">
        <h1 className="page-title">Your Orders</h1>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="product-order-container">
      <h1 className="page-title">Your Orders</h1>

      {orders.length === 0 ? (
        <div className="no-orders">
          <p>You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="orders-grid">
          {orders.map(order => (
            <div 
              key={order._id} 
              className="order-card"
              onClick={() => {
                setSelectedOrder(order);
                setShowStatusModal(true);
              }}
            >
              <div className="order-image-container">
                <img src={order.image} alt={order.name} className="order-image" />
              </div>
              <div className="order-details">
                <h3 className="order-name">{order.name}</h3>
                <p className="order-price">₹{order.price}</p>
                <p className="order-date">{formatDate(order.createdAt)}</p>
                <div className={`order-status ${order.orderStatus.toLowerCase().replace(' ', '-')}`}>
                  {order.orderStatus}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Status Modal */}
      {showStatusModal && selectedOrder && (
        <div className="status-modal-overlay">
          <div className="status-modal">
            <div className="modal-header">
              <h2>Order Status</h2>
              <button 
                className="close-button"
                onClick={() => setShowStatusModal(false)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="modal-body">
              <div className="order-summary">
                <div className="order-image-container">
                  <img src={selectedOrder.image} alt={selectedOrder.name} className="order-image" />
                </div>
                <div className="order-info">
                  <h3>{selectedOrder.name}</h3>
                  <p className="order-description">{selectedOrder.description}</p>
                  <p className="order-price">Price: ₹{selectedOrder.price}</p>
                  <p className="order-date">Ordered on: {formatDate(selectedOrder.createdAt)}</p>
                </div>
              </div>

              <div className="status-timeline">
                {['Order Placed', 'Processing', 'Confirmed', 'Shipped', 'Delivered'].map(step => (
                  <div 
                    key={step} 
                    className={`timeline-step ${getStepStatus(step, selectedOrder.orderStatus)}`}
                  >
                    <div className="step-icon">
                      {step === 'Order Placed' && <FaClipboardList />}
                      {step === 'Processing' && <FaBox />}
                      {step === 'Confirmed' && <FaCheckCircle />}
                      {step === 'Shipped' && <FaTruck />}
                      {step === 'Delivered' && <FaHome />}
                    </div>
                    <div className="step-info">
                      <h4>{step}</h4>
                      <p>
                        {step === 'Order Placed' && 'Your order has been received'}
                        {step === 'Processing' && 'We are preparing your order'}
                        {step === 'Confirmed' && 'Your order has been confirmed'}
                        {step === 'Shipped' && 'Your order is on its way'}
                        {step === 'Delivered' && 'Your order has been delivered'}
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

export default ProductOrder;