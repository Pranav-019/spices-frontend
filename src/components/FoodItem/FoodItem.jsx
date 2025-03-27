import React, { useContext } from 'react';
import './FoodItem.css';
import { FaShoppingBag, FaCartPlus } from 'react-icons/fa';
import { StoreContext } from '../../Context/StoreContext';
import axios from 'axios';

const FoodItem = ({ _id, name, price, description, image }) => {
    const { addToCart, cartItems } = useContext(StoreContext);

    const handleBuyNow = async () => {
        try {
            const { data } = await axios.post('http://localhost:5000/api/create-order', { 
                amount: price 
            });

            const options = {
                key: 'rzp_test_4IVVmy5cqABEUR',
                amount: data.amount,
                currency: 'INR',
                name: 'ABC - MASALE',
                description: `Payment for ${name}`,
                order_id: data.id,
                handler: async function (response) {
                    try {
                        const verifyRes = await axios.post('http://localhost:5000/api/verify-payment', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });

                        if (verifyRes.data.success) {
                            alert('Payment Successful!');
                        } else {
                            alert('Payment Verification Failed');
                        }
                    } catch (error) {
                        console.error('Payment verification error:', error);
                        alert('Payment verification failed. Please contact support.');
                    }
                },
                prefill: {
                    name: 'Customer Name',
                    email: 'customer@example.com',
                    contact: '9999999999'
                },
                theme: {
                    color: '#FF4C24'
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            console.error('Error initiating payment:', error);
            alert('Failed to initiate payment. Please try again.');
        }
    };

    return (
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
                        onClick={handleBuyNow}
                    >
                        <FaShoppingBag />
                        Buy Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FoodItem;
