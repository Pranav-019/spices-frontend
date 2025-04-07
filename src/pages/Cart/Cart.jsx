import { useContext, useState, useEffect } from "react";
import { StoreContext } from "../../Context/StoreContext";
import "./Cart.css";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaPlus, FaMinus, FaMapMarkerAlt, FaTimes, FaExclamationTriangle } from "react-icons/fa";
import axios from 'axios';
import { AuthContext } from "../../Context/AuthContext";

const Cart = () => {
    const { 
        cartItems, 
        foodList, 
        removeFromCart, 
        addToCart, 
        getTotalCartAmount,
        clearCart,
        isLoading,
        error 
    } = useContext(StoreContext);
    
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    // Address modal state
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [updateError, setUpdateError] = useState(null);
    const [updateSuccess, setUpdateSuccess] = useState(false);
    const [userAddresses, setUserAddresses] = useState([]);
    const [showAddAddressForm, setShowAddAddressForm] = useState(false);
    const [newAddress, setNewAddress] = useState({
        houseFlatNo: '',
        landmark: '',
        street: '',
        area: '',
        city: '',
        state: '',
        pincode: '',
        isDefault: false
    });
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    const getAuthToken = () => {
        const token = localStorage.getItem('userToken');
        if (!token) {
            setUpdateError('Please login to continue');
            return null;
        }
        return token;
    };

    useEffect(() => {
        const fetchUserAddresses = async () => {
            if (showAddressModal && user) {
                setUpdateError(null);
                try {
                    const token = getAuthToken();
                    if (!token) return;

                    const response = await axios.get(
                        'https://spices-backend-2jr1.vercel.app/api/auth/user',
                        {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }
                    );
                    
                    if (response.data.addresses && response.data.addresses.length > 0) {
                        setUserAddresses(response.data.addresses);
                        const defaultAddress = response.data.addresses.find(addr => addr.isDefault);
                        if (defaultAddress) {
                            setSelectedAddress(defaultAddress._id);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching user addresses:', error);
                    setUpdateError('Failed to load your addresses. Please try again.');
                }
            }
        };
        fetchUserAddresses();
    }, [showAddressModal, user]);

    const getCurrentLocation = async () => {
        setIsLoadingLocation(true);
        setUpdateError(null);
        
        try {
            if (!navigator.geolocation) {
                throw new Error('Geolocation not supported');
            }

            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });

            const { latitude, longitude } = position.coords;
            const response = await axios.get(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            
            const addressData = {
                houseFlatNo: '',
                landmark: 'Current Location',
                street: '',
                area: response.data.address?.suburb || response.data.address?.neighbourhood || '',
                city: response.data.address?.city || response.data.address?.town || '',
                state: response.data.address?.state || '',
                pincode: response.data.address?.postcode || '',
                isDefault: false,
                fullAddress: response.data.display_name
            };

            // Create a temporary address object for display
            setUserAddresses(prev => [...prev, {
                ...addressData,
                _id: 'temp-' + Date.now(),
                isTemp: true
            }]);
            
            setSelectedAddress('temp-' + Date.now());
            setUpdateSuccess(true);
            setTimeout(() => setUpdateSuccess(false), 3000);
        } catch (error) {
            console.error('Error getting location:', error);
            setUpdateError('Failed to get location. Please enter manually.');
        } finally {
            setIsLoadingLocation(false);
        }
    };

    const handleAddressInputChange = (e) => {
        const { name, value } = e.target;
        setNewAddress(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateAddress = (address) => {
        const requiredFields = ['houseFlatNo', 'street', 'area', 'city', 'state', 'pincode'];
        const missingFields = requiredFields.filter(field => !address[field]);
        
        if (missingFields.length > 0) {
            throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }

        if (!/^\d{6}$/.test(address.pincode)) {
            throw new Error('Pincode must be 6 digits');
        }

        return true;
    };

    const saveNewAddress = async (addressData) => {
        try {
            const token = getAuthToken();
            if (!token) return false;

            // Validate address data
            validateAddress(addressData);

            const response = await axios.post(
                'https://spices-backend-2jr1.vercel.app/api/auth/addresses',
                addressData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    validateStatus: (status) => status < 500 // Don't throw for 4xx errors
                }
            );

            if (response.status >= 400) {
                throw new Error(response.data?.message || 'Failed to save address');
            }

            setUserAddresses(response.data.addresses);
            const savedAddress = response.data.addresses.find(addr => 
                addr.houseFlatNo === addressData.houseFlatNo && 
                addr.street === addressData.street
            );
            
            if (savedAddress) {
                setSelectedAddress(savedAddress._id);
            }
            
            setShowAddAddressForm(false);
            setNewAddress({
                houseFlatNo: '',
                landmark: '',
                street: '',
                area: '',
                city: '',
                state: '',
                pincode: '',
                isDefault: false
            });
            
            return true;
        } catch (error) {
            console.error('Error saving address:', error);
            const errorMessage = error.response?.data?.message || 
                               error.message || 
                               'Failed to save address. Please try again.';
            setUpdateError(errorMessage);
            return false;
        }
    };

    const createProductOrders = async (paymentId) => {
        try {
            const token = getAuthToken();
            if (!token) {
                throw new Error('No authentication token provided');
            }

            const selectedAddr = userAddresses.find(addr => addr._id === selectedAddress);
            if (!selectedAddr) {
                throw new Error('No address selected');
            }

            // Create an order for each product in the cart
            const orderPromises = Object.entries(cartItems).map(async ([productId, quantity]) => {
                const product = foodList.find(item => item._id === productId);
                if (!product) {
                    console.warn(`Product ${productId} not found in foodList`);
                    return null;
                }

                const orderData = {
                    productId,
                    quantity,
                    paymentId,
                    address: selectedAddr,
                    price: product.price * quantity,
                    name: product.name
                };

                const response = await axios.post(
                    'https://spices-backend-2jr1.vercel.app/api/productorder/create',
                    orderData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                return response.data;
            });

            const results = await Promise.all(orderPromises);
            return results.filter(order => order !== null);
        } catch (error) {
            console.error('Error creating product orders:', error);
            throw error;
        }
    };

    const handleCheckout = () => {
        if (!user) {
            setUpdateError('Please login to place an order');
            return;
        }
        setShowAddressModal(true);
        setUpdateError(null);
        setUpdateSuccess(false);
        setShowAddAddressForm(false);
    };

    const proceedToPayment = async () => {
        if (!selectedAddress) {
            setUpdateError('Please select a delivery address');
            return;
        }
    
        setUpdateError(null);
        setIsProcessingPayment(true);
    
        try {
            const token = getAuthToken();
            if (!token) {
                setIsProcessingPayment(false);
                return;
            }
    
            // 1. Validate Address
            const selectedAddr = userAddresses.find(addr => addr._id === selectedAddress);
            if (!selectedAddr) throw new Error('Selected address not found');
            
            try {
                validateAddress(selectedAddr);
            } catch (error) {
                throw new Error(`Address is invalid: ${error.message}`);
            }
    
            // 2. Calculate Amount in Rupees Only (no paise conversion)
            const subtotal = getTotalCartAmount();
            const deliveryFee = 40;
            const total = Math.round(subtotal + deliveryFee); // Round to nearest rupee
    
            console.log(`Order Total: ₹${total}`);
    
            // 3. Prepare Order Items
            const orderItems = Object.entries(cartItems).map(([itemId, quantity]) => {
                const product = foodList.find(food => food._id === itemId);
                if (!product) throw new Error(`Product ${itemId} not found`);
                return {
                    itemId,
                    quantity,
                    price: product.price,
                    name: product.name
                };
            });
    
            if (orderItems.length === 0) throw new Error('Cart is empty');
    
            // 4. Create Order Data (using rupees only)
            const orderData = {
                amount: total, // Now in rupees
                currency: 'INR',
                receipt: `order_${Date.now()}`,
                notes: {
                    customerId: user._id,
                    address: JSON.stringify(selectedAddr),
                    items: JSON.stringify(orderItems),
                    amountType: 'rupees' // Explicitly state we're using rupees
                }
            };
    
            console.log('Creating Order with:', orderData);
    
            // 5. Create Razorpay Order
            const { data } = await axios.post(
                'https://spices-backend-2jr1.vercel.app/api/create-order',
                {
                    ...orderData,
                    // Convert to paise ONLY at the last moment before sending to Razorpay
                    razorpayAmount: total * 100 // Backend should handle this carefully
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            ).catch(error => {
                console.error('Order creation failed:', error.response?.data || error.message);
                throw new Error(error.response?.data?.error?.description || 'Failed to create payment order');
            });
    
            if (!data?.id) throw new Error('Invalid order response from server');
    
            // 6. Initialize Razorpay Checkout with Rupee-based Display
            const options = {
                key: 'rzp_test_4IVVmy5cqABEUR',
                amount: data.amount, // Use amount from backend
                currency: 'INR',
                order_id: data.id,
                name: 'Your Store Name',
                description: `Order Total: ₹${total}`, // Show rupee amount clearly
                handler: async (response) => {
                    try {
                        const verification = await axios.post(
                            'https://spices-backend-2jr1.vercel.app/api/verify-payment',
                            {
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature,
                                originalAmount: total, // Rupee amount
                                paidAmount: response.amount / 100 // Convert back to rupees
                            },
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`
                                }
                            }
                        );
    
                        if (verification.data.success) {
                            await createProductOrders(response.razorpay_payment_id);
                            alert(`Payment of ₹${total} successful!`);
                            clearCart();
                            navigate('/orders');
                        } else {
                            throw new Error('Payment verification failed');
                        }
                    } catch (error) {
                        console.error('Payment processing error:', error);
                        setUpdateError('Payment verification failed. Please contact support.');
                    } finally {
                        setIsProcessingPayment(false);
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                    contact: user.contact || '9000000000'
                },
                theme: {
                    color: '#3399cc'
                },
                display: {
                    // Force display in rupees format
                    value: total,
                    currency: 'INR',
                    format: '₹{{value}}'
                }
            };
    
            const rzp = new window.Razorpay(options);
            
            rzp.on('payment.failed', (response) => {
                console.error('Payment failed:', response.error);
                setUpdateError(`Payment of ₹${total} failed: ${response.error.description}`);
                setIsProcessingPayment(false);
            });
    
            rzp.open();
    
        } catch (error) {
            console.error('Checkout error:', error);
            setUpdateError(error.message || 'Checkout process failed');
        } finally {
            setIsProcessingPayment(false);
        }
    };


    const formatAddress = (address) => {
        if (!address) return '';
        return `${address.houseFlatNo}, ${address.street}, ${address.area}, ${address.city}, ${address.state} - ${address.pincode}`;
    };

    const handleAddAddressSubmit = async (e) => {
        e.preventDefault();
        
        try {
            validateAddress(newAddress);
            const saved = await saveNewAddress(newAddress);
            if (saved) {
                setUpdateSuccess('Address added successfully');
                setTimeout(() => setUpdateSuccess(false), 3000);
            }
        } catch (error) {
            setUpdateError(error.message);
        }
    };

    if (isLoading) {
        return <div className="cart-loading">Loading cart...</div>;
    }

    if (error) {
        return <div className="cart-error">Error loading cart: {error}</div>;
    }

    if (!foodList || !Array.isArray(foodList)) {
        return <div className="cart-loading">Loading products...</div>;
    }

    const handleClearCart = () => {
        if (window.confirm("Are you sure you want to clear your cart?")) {
            clearCart();
        }
    };

    if (!cartItems || Object.keys(cartItems).length === 0) {
        return (
            <div className="cart">
                <div className="cart-header">
                    <h2>Shopping Cart</h2>
                </div>
                <div className="empty-cart">
                    <p>Your cart is empty.</p>
                    <button 
                        className="continue-shopping-btn"
                        onClick={() => navigate("/menu")}
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        );
    }

    // Calculate cart totals
    const subtotal = getTotalCartAmount();
    const deliveryFee = 40;
    const total = subtotal + deliveryFee;

    return (
        <>
            <div className="cart">
                <div className="cart-header">
                    <h2>Shopping Cart</h2>
                    {Object.keys(cartItems).length > 0 && (
                        <button 
                            className="clear-cart-btn"
                            onClick={handleClearCart}
                        >
                            Clear Cart
                        </button>
                    )}
                </div>

                <div className="cart-content">
                    <div className="cart-items">
                        {Object.entries(cartItems).map(([itemId, quantity]) => {
                            const item = foodList.find((food) => food._id === itemId);
                            
                            if (!item) {
                                return null;
                            }

                            const itemTotal = item.price * quantity;

                            return (
                                <div key={itemId} className="cart-item">
                                    <div className="cart-item-image">
                                        <img src={item.image} alt={item.name} />
                                    </div>
                                    <div className="cart-item-details">
                                        <h3>{item.name}</h3>
                                        <p className="item-price">₹{item.price}</p>
                                    </div>
                                    <div className="cart-item-controls">
                                        <div className="quantity-controls">
                                            <button 
                                                onClick={() => removeFromCart(itemId)}
                                                aria-label="Decrease quantity"
                                            >
                                                <FaMinus />
                                            </button>
                                            <span>{quantity}</span>
                                            <button 
                                                onClick={() => addToCart(itemId)}
                                                aria-label="Increase quantity"
                                            >
                                                <FaPlus />
                                            </button>
                                        </div>
                                        <p className="item-total">₹{itemTotal}</p>
                                        <button 
                                            className="remove-item"
                                            onClick={() => {
                                                if (window.confirm("Remove this item from cart?")) {
                                                    for (let i = 0; i < quantity; i++) {
                                                        removeFromCart(itemId);
                                                    }
                                                }
                                            }}
                                            aria-label="Remove item"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="cart-summary">
                        <div className="cart-total">
                            <h3>Order Summary</h3>
                            <div className="total-row">
                                <span>Subtotal:</span>
                                <span>₹{subtotal}</span>
                            </div>
                            <div className="total-row">
                                <span>Delivery Fee:</span>
                                <span>₹{deliveryFee}</span>
                            </div>
                            <div className="total-row grand-total">
                                <span>Total:</span>
                                <span>₹{total}</span>
                            </div>
                        </div>
                        <button 
                            className="checkout-btn"
                            onClick={handleCheckout}
                        >
                            Proceed to Checkout (₹{total})
                        </button>
                        <button 
                            className="continue-shopping"
                            onClick={() => navigate("/")}
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>

            {/* Address Modal */}
            {showAddressModal && (
                <div className="address-modal-overlay">
                    <div className="address-modal">
                        <h3>Select Delivery Address</h3>
                        
                        {updateError && (
                            <div className="error-message">
                                <FaExclamationTriangle /> {updateError}
                                <button onClick={() => setUpdateError(null)}>
                                    <FaTimes />
                                </button>
                            </div>
                        )}
                        {updateSuccess && (
                            <div className="success-message">
                                {updateSuccess}
                            </div>
                        )}

                        {!showAddAddressForm ? (
                            <>
                                <div className="address-list">
                                    {userAddresses.length > 0 ? (
                                        userAddresses.map(address => (
                                            <div 
                                                key={address._id} 
                                                className={`address-card ${selectedAddress === address._id ? 'selected' : ''}`}
                                                onClick={() => setSelectedAddress(address._id)}
                                            >
                                                <div className="address-radio">
                                                    <input 
                                                        type="radio" 
                                                        id={`address-${address._id}`}
                                                        name="deliveryAddress"
                                                        checked={selectedAddress === address._id}
                                                        onChange={() => setSelectedAddress(address._id)}
                                                    />
                                                </div>
                                                <div className="address-details">
                                                    <p className="address-text">{formatAddress(address)}</p>
                                                    {address.landmark && <p className="address-landmark">Landmark: {address.landmark}</p>}
                                                    {address.isDefault && <span className="default-badge">Default</span>}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="no-addresses">No saved addresses found</p>
                                    )}
                                </div>
                                
                                <div className="address-options">
                                    <button 
                                        className="location-button"
                                        onClick={getCurrentLocation}
                                        disabled={isLoadingLocation}
                                    >
                                        <FaMapMarkerAlt />
                                        {isLoadingLocation ? 'Fetching Location...' : 'Use Current Location'}
                                    </button>
                                    <button 
                                        className="add-address-button"
                                        onClick={() => setShowAddAddressForm(true)}
                                    >
                                        <FaPlus /> Add New Address
                                    </button>
                                </div>
                            </>
                        ) : (
                                 // Add New Address Form
                                 <div className="add-address-form-container">
                                 <div className="add-address-form-header">
                                     <button
                                         className="back-button"
                                         onClick={() => setShowAddAddressForm(false)}
                                     >
                                         <FaTimes /> Back to Address List
                                     </button>
                                     <h4>Add New Address</h4>
                                 </div>
                                 <div className="add-address-form-scrollable">
                                     <form onSubmit={handleAddAddressSubmit}>
                                         <div className="form-row">
                                             <div className="form-group">
                                                 <label>House/Flat No*</label>
                                                 <input
                                                     type="text"
                                                     name="houseFlatNo"
                                                     value={newAddress.houseFlatNo}
                                                     onChange={handleAddressInputChange}
                                                     required
                                                 />
                                             </div>
                                             <div className="form-group">
                                                 <label>Landmark</label>
                                                 <input
                                                     type="text"
                                                     name="landmark"
                                                     value={newAddress.landmark}
                                                     onChange={handleAddressInputChange}
                                                 />
                                             </div>
                                         </div>
                                         <div className="form-row">
                                             <div className="form-group">
                                                 <label>Street*</label>
                                                 <input
                                                     type="text"
                                                     name="street"
                                                     value={newAddress.street}
                                                     onChange={handleAddressInputChange}
                                                     required
                                                 />
                                             </div>
                                             <div className="form-group">
                                                 <label>Area*</label>
                                                 <input
                                                     type="text"
                                                     name="area"
                                                     value={newAddress.area}
                                                     onChange={handleAddressInputChange}
                                                     required
                                                 />
                                             </div>
                                         </div>
                                         <div className="form-row">
                                             <div className="form-group">
                                                 <label>City*</label>
                                                 <input
                                                     type="text"
                                                     name="city"
                                                     value={newAddress.city}
                                                     onChange={handleAddressInputChange}
                                                     required
                                                 />
                                             </div>
                                             <div className="form-group">
                                                 <label>State*</label>
                                                 <input
                                                     type="text"
                                                     name="state"
                                                     value={newAddress.state}
                                                     onChange={handleAddressInputChange}
                                                     required
                                                 />
                                             </div>
                                         </div>
                                         <div className="form-group">
                                             <label>Pincode*</label>
                                             <input
                                                 type="text"
                                                 name="pincode"
                                                 value={newAddress.pincode}
                                                 onChange={handleAddressInputChange}
                                                 required
                                             />
                                         </div>
                                         <div className="form-group checkbox-group">
                                             <input
                                                 type="checkbox"
                                                 id="setAsDefault"
                                                 name="isDefault"
                                                 checked={newAddress.isDefault}
                                                 onChange={(e) =>
                                                     setNewAddress({
                                                         ...newAddress,
                                                         isDefault: e.target.checked,
                                                     })
                                                 }
                                             />
                                             <label htmlFor="setAsDefault">
                                                 Set as default address
                                             </label>
                                         </div>
                                         <button
                                             type="submit"
                                             className="save-address-button"
                                         >
                                             Save Address
                                         </button>
                                     </form>
                                 </div>
                             </div>
                        )}
                        
                        {!showAddAddressForm && (
                            <div className="modal-buttons">
                                <button 
                                    className="cancel-button"
                                    onClick={() => {
                                        setShowAddressModal(false);
                                        setIsProcessingPayment(false);
                                    }}
                                    disabled={isProcessingPayment}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className="proceed-button"
                                    onClick={proceedToPayment}
                                    disabled={!selectedAddress || isLoadingLocation || isProcessingPayment}
                                >
                                    {isProcessingPayment ? 'Processing...' : 'Proceed to Payment'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default Cart;