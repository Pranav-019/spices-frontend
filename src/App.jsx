import React, { useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import Home from './pages/Home/Home';
import Footer from './components/Footer/Footer';
import Navbar from './components/Navbar/Navbar';
import Cart from './pages/Cart/Cart';
import LoginPopup from './components/LoginPopup/LoginPopup';
import PlaceOrder from './pages/PlaceOrder/PlaceOrder';
import MyOrders from './pages/MyOrders/MyOrders';
import CustomOrder from './pages/CustomOrder/CustomOrder';
import { AuthProvider } from './Context/AuthContext';
import ProductOrder from './pages/ProductOrderProductorder';

const App = () => {
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate for redirection

  // Function to handle add-to-cart action and redirect
  const handleAddToCartRedirect = () => {
    navigate('/cart'); // Redirect to cart page after adding an item
  };

  return (
    <AuthProvider>
      {showLogin && <LoginPopup setShowLogin={setShowLogin} />} {/* Show Login Popup when showLogin is true */}
      
      <div className="app">
        <Navbar setShowLogin={setShowLogin} /> {/* Navbar now handles login visibility */}
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<ProductOrder />} />
          <Route path="/myorder" element={<MyOrders />} />
          <Route path="/custom-order" element={<CustomOrder />} />
        </Routes>
        
        {/* Additional Add-to-Cart Button or other interactions can be handled globally */}
      </div>
      
      <Footer />
    </AuthProvider>
  );
};

export default App;

///