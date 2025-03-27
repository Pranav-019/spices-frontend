import { useContext } from "react";
import { StoreContext } from "../../Context/StoreContext";
import "./Cart.css";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaPlus, FaMinus } from "react-icons/fa";
import axios from 'axios';

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
    
    const navigate = useNavigate();

    // Calculate cart totals
    const subtotal = getTotalCartAmount();
    const deliveryFee = 40;
    const total = subtotal + deliveryFee;

    const handleCheckout = async () => {
        try {
            const { data } = await axios.post('http://localhost:5000/api/create-order', { 
                amount: total  // Using the calculated total
            });

            const options = {
                key: 'rzp_test_4IVVmy5cqABEUR',
                amount: data.amount,
                currency: 'INR',
                name: 'ABC - MASALE',
                description: 'Cart Payment',
                order_id: data.id,
                handler: async function (response) {
                    try {
                        const paymentData = {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        };

                        const verifyRes = await axios.post('http://localhost:5000/api/verify-payment', paymentData);

                        if (verifyRes.data.success) {
                            alert('Payment Successful! Redirecting to checkout...');
                            navigate('/checkout', { 
                                state: { 
                                    cartItems,
                                    total,
                                    paymentId: response.razorpay_payment_id 
                                } 
                            });
                            clearCart();
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
            console.error('Error initiating Razorpay:', error);
            alert('Failed to initiate payment. Please try again.');
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

    return (
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
    );
};

export default Cart;
