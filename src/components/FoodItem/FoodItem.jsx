import React, { useContext, useState, useEffect } from 'react';
import './FoodItem.css';
import { FaShoppingBag, FaCartPlus, FaMapMarkerAlt, FaPlus, FaTimes } from 'react-icons/fa';
import { StoreContext } from '../../Context/StoreContext';
import { AuthContext } from '../../Context/AuthContext';
import axios from 'axios';

const FoodItem = ({ _id, name, price, description, image }) => {
    const { addToCart, cartItems } = useContext(StoreContext);
    const { user, loading: authLoading } = useContext(AuthContext);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [updateError, setUpdateError] = useState(null);
    const [updateSuccess, setUpdateSuccess] = useState(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
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

    const saveNewAddress = async (addressData) => {
        try {
            const token = getAuthToken();
            if (!token) return false;

            const response = await axios.post(
                'https://spices-backend-2jr1.vercel.app/api/auth/addresses',
                addressData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            setUserAddresses(response.data.addresses);
            const newAddress = response.data.addresses.find(addr => 
                addr.houseFlatNo === addressData.houseFlatNo && 
                addr.street === addressData.street
            );
            
            if (newAddress) {
                setSelectedAddress(newAddress._id);
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
            const errorMessage = error.response?.data?.message || 'Failed to save address. Please try again.';
            setUpdateError(errorMessage);
            return false;
        }
    };

    const createProductOrder = async (paymentId) => {
        try {
            const token = getAuthToken();
            if (!token) {
                throw new Error('No authentication token provided');
            }

            const selectedAddr = userAddresses.find(addr => addr._id === selectedAddress);
            if (!selectedAddr) {
                throw new Error('No address selected');
            }

            const response = await axios.post(
                'https://spices-backend-2jr1.vercel.app/api/productorder/create',
                {
                    productId: _id,
                    quantity: 1,
                    paymentId: paymentId,
                    address: selectedAddr,
                    price: price,
                    name: name
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status !== 201) {
                throw new Error(response.data?.message || 'Failed to create order');
            }

            return response.data;
        } catch (error) {
            console.error('Error creating product order:', error);
            throw error;
        }
    };

    const handleBuyNowClick = () => {
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

            const selectedAddr = userAddresses.find(addr => addr._id === selectedAddress);
            if (!selectedAddr) {
                throw new Error('Selected address not found');
            }

            if (selectedAddr.isTemp) {
                const { isTemp, _id, ...addressData } = selectedAddr;
                const saved = await saveNewAddress(addressData);
                if (!saved) {
                    setIsProcessingPayment(false);
                    return;
                }
            }
            
            const { data } = await axios.post(
                'https://spices-backend-2jr1.vercel.app/api/create-order', 
                { 
                    amount: price * 100,
                    address: selectedAddr,
                    itemId: _id,
                    itemName: name,
                    currency: 'INR'
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const options = {
                key: 'rzp_test_4IVVmy5cqABEUR',
                amount: data.amount,
                currency: data.currency || 'INR',
                name: 'ABC - MASALE',
                description: `Payment for ${name}`,
                order_id: data.id,
                handler: async function (response) {
                    try {
                        const verifyRes = await axios.post(
                            'https://spices-backend-2jr1.vercel.app/api/verify-payment', 
                            {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                address: selectedAddr,
                                productId: _id
                            },
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                }
                            }
                        );

                        if (verifyRes.data.success) {
                            await createProductOrder(response.razorpay_payment_id);
                            alert('Payment Successful! Your order has been placed.');
                        } else {
                            alert('Payment Verification Failed');
                        }
                    } catch (error) {
                        console.error('Payment verification error:', error);
                        alert('Payment processing failed. Please contact support.');
                    } finally {
                        setIsProcessingPayment(false);
                        setShowAddressModal(false);
                    }
                },
                prefill: {
                    name: user?.name || 'Customer Name',
                    email: user?.email || 'customer@example.com',
                    contact: user?.contactNo || '9999999999'
                },
                theme: {
                    color: '#FF4C24'
                },
                modal: {
                    ondismiss: () => {
                        setIsProcessingPayment(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            console.error('Payment initiation error:', error);
            setUpdateError(error.response?.data?.message || 'Payment initiation failed. Please try again.');
            setIsProcessingPayment(false);
        }
    };

    const formatAddress = (address) => {
        if (!address) return '';
        return `${address.houseFlatNo}, ${address.street}, ${address.area}, ${address.city}, ${address.state} - ${address.pincode}`;
    };

    const handleAddAddressSubmit = async (e) => {
        e.preventDefault();
        
        if (!newAddress.houseFlatNo || !newAddress.street || !newAddress.area || 
            !newAddress.city || !newAddress.state || !newAddress.pincode) {
            setUpdateError('Please fill all required address fields');
            return;
        }

        const saved = await saveNewAddress(newAddress);
        if (saved) {
            setUpdateSuccess('Address added successfully');
            setTimeout(() => setUpdateSuccess(false), 3000);
        }
    };

    return (
        <>
            <div className="food-item">
                <div className="food-item-img-container">
                    <img className="food-item-image" src={image} alt={name} />
                </div>
                <div className="food-item-info">
                    <p className="food-item-name">{name}</p>
                    <p className="food-item-desc">{description}</p>
                    <p className="food-item-price">₹{price}</p>

                    <div className="food-item-buttons">
                        <button 
                            className="add-to-cart-button" 
                            onClick={() => addToCart(_id)}
                        >
                            <FaCartPlus />
                            Add to Cart
                            {cartItems[_id] > 0 && ` (${cartItems[_id]})`}
                        </button>
                        <button 
                            className="buy-now-button"
                            onClick={handleBuyNowClick}
                        >
                            <FaShoppingBag />
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>

            {showAddressModal && (
                <div className="address-modal-overlay">
                    <div className="address-modal">
                        <h3>Select Delivery Address</h3>
                        
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
                                        disabled={isLoadingLocation || authLoading}
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
                            <div className="add-address-form">
                                <button 
                                    className="back-button"
                                    onClick={() => setShowAddAddressForm(false)}
                                >
                                    <FaTimes /> Back to Address List
                                </button>
                                
                                <form onSubmit={handleAddAddressSubmit}>
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
                                            onChange={(e) => setNewAddress({
                                                ...newAddress,
                                                isDefault: e.target.checked
                                            })}
                                        />
                                        <label htmlFor="setAsDefault">Set as default address</label>
                                    </div>
                                    
                                    <button type="submit" className="save-address-button">
                                        Save Address
                                    </button>
                                </form>
                            </div>
                        )}
                        
                        {updateError && <p className="error-message">{updateError}</p>}
                        {updateSuccess && <p className="success-message">{updateSuccess}</p>}
                        
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
                                    disabled={!selectedAddress || isLoadingLocation || authLoading || isProcessingPayment}
                                >
                                    {isProcessingPayment ? 'Processing Payment...' : 'Proceed to Payment'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default FoodItem;