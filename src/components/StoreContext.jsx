import { createContext, useEffect, useState } from "react";
import axios from 'axios';

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem("cartItems");
        return savedCart ? JSON.parse(savedCart) : {};
    });

    const [foodList, setFoodList] = useState([]);
    const [ordersData, setOrdersData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Fetch products from API on component mount
    useEffect(() => {
        setIsLoading(true);
        setError(null);
        axios.get('https://spices-backend-2jr1.vercel.app/api/products')
            .then(response => {
                setFoodList(response.data);
            })
            .catch(error => {
                setError(error.message);
                console.error("Error fetching products:", error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    useEffect(() => {
        // Sync cart with localStorage whenever cartItems changes
        localStorage.setItem("cartItems", JSON.stringify(cartItems));
    }, [cartItems]);

    // Add item to cart
    const addToCart = (itemId) => {
        setCartItems((prev) => ({
            ...prev,
            [itemId]: (prev[itemId] || 0) + 1,
        }));
    };

    // Remove item from cart
    const removeFromCart = (itemId) => {
        setCartItems((prev) => {
            if (!prev[itemId] || prev[itemId] === 1) {
                const newCart = { ...prev };
                delete newCart[itemId];  // Remove item if quantity is 1 or 0
                return newCart;
            }
            return { ...prev, [itemId]: prev[itemId] - 1 };
        });
    };

    // Get total cart amount
    const getTotalCartAmount = () => {
        return Object.entries(cartItems).reduce((total, [itemId, quantity]) => {
            const itemInfo = foodList.find((product) => product._id === itemId);
            return total + (itemInfo?.price || 0) * quantity;
        }, 0);
    };

    // Place order & reset cart
    const placeOrder = (deliveryData) => {
        setOrdersData((prev) => ({
            ...prev,
            [Date.now()]: { items: cartItems, deliveryData },
        }));
        setCartItems({});
        localStorage.removeItem("cartItems");
    };

    // Clear cart
    const clearCart = () => {
        setCartItems({});
        localStorage.removeItem("cartItems");
    };

    // Get cart item count
    const getCartItemCount = () => {
        return Object.values(cartItems).reduce((total, quantity) => total + quantity, 0);
    };

    const contextValue = {
        foodList,
        cartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount,
        placeOrder,
        isLoading,
        error,
        ordersData,
        clearCart,
        getCartItemCount,
    };

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    );
};

export default StoreContextProvider;
