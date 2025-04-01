import { createContext, useEffect, useState } from "react";
import { food_list, menu_list } from "../assets/assets";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
    const [cartItems, setCartItems] = useState({});
    const [ordersData, setOrdersData] = useState({});
    const [foodList, setFoodList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get('https://spices-backend.vercel.app/api/products');
                setFoodList(response.data);
                setError(null);
            } catch (err) {
                console.error("Error fetching products:", err);
                setError("Failed to load products");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();

        // Load cart from localStorage
        const savedCart = localStorage.getItem("cartItems");
        if (savedCart) {
            setCartItems(JSON.parse(savedCart));
        }
    }, []);

    // Sync cart with localStorage whenever it changes
    useEffect(() => {
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
                delete newCart[itemId]; // Remove if quantity is 1 or 0
                return newCart;
            }
            return { ...prev, [itemId]: prev[itemId] - 1 };
        });
    };

    // Calculate total cart amount
    const getTotalCartAmount = () => {
        if (!foodList || !cartItems) return 0;
        
        return Object.entries(cartItems).reduce((total, [itemId, quantity]) => {
            const item = foodList.find((food) => food._id === itemId);
            if (!item) return total;
            // Parse the price as a number if it's a string
            const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
            return total + (price * quantity);
        }, 0);
    };

    // Place order & reset cart
    const placeOrder = (deliveryData) => {
        setOrdersData((prev) => ({
            ...prev,
            [Date.now()]: { items: cartItems, deliveryData },
        }));
        setCartItems({});
        localStorage.removeItem("cartItems"); // Clear cart after order
    };

    // Clear cart function
    const clearCart = () => {
        setCartItems({});
        localStorage.removeItem("cartItems"); // Clear from localStorage too
    };

    const contextValue = {
        food_list,
        menu_list,
        cartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount,
        placeOrder,
        foodList,
        isLoading,
        error,
        ordersData,
        clearCart,  // Make sure it's included in the context value
    };

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    );
};

export default StoreContextProvider;
