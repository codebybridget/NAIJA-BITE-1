import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = ({ children, setShowLogin }) => {
  const [cartItem, setCartItems] = useState({});
  const [food_list, setFoodList] = useState([]);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const url = import.meta.env.VITE_API_URL;

  const formatNaira = (amount) => `₦${amount.toLocaleString()}`;
  const normalizeCart = (data) => (data ? data : {});

  const handleUnauthorized = () => {
    setToken("");
    localStorage.removeItem("token");
    if (setShowLogin) setShowLogin(true);
  };

  // ✅ Axios instance
  const axiosInstance = axios.create({
    baseURL: url,
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });

  axiosInstance.interceptors.request.use((config) => {
    const authToken = token || localStorage.getItem("token");
    if (authToken) config.headers.Authorization = `Bearer ${authToken}`;
    return config;
  });

  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) handleUnauthorized();
      return Promise.reject(error);
    }
  );

  // ✅ Fetch food list
  const fetchFoodList = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get("/api/food/list");
      if (response.data && Array.isArray(response.data.foods)) {
        setFoodList(response.data.foods);
      } else {
        setFoodList([]);
        setError("No data found");
      }
    } catch (err) {
      setError(err.message || "Failed to fetch food list");
      setFoodList([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCart = async () => {
    if (!token) return;
    try {
      const response = await axiosInstance.post("/api/cart/get");
      if (response.data.success) {
        setCartItems(normalizeCart(response.data.cartData));
      }
    } catch (err) {
      console.error("Error fetching cart:", err.message);
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      fetchCart();
    }
    fetchFoodList();
  }, []);

  return (
    <StoreContext.Provider
      value={{
        food_list,
        cartItem,
        setCartItems,
        fetchCart,
        formatNaira,
        addToCart: async (itemId) => {
          const updatedCart = { ...cartItem, [itemId]: (cartItem[itemId] || 0) + 1 };
          setCartItems(updatedCart);
          if (!token) return;
          try {
            const response = await axiosInstance.post("/api/cart/add", { itemId });
            if (response.data.success) setCartItems(response.data.cartData);
          } catch (err) {
            console.error("Error adding to cart:", err.message);
          }
        },
        removeFromCart: async (itemId) => {
          const updatedCart = { ...cartItem };
          if (updatedCart[itemId] > 1) updatedCart[itemId] -= 1;
          else delete updatedCart[itemId];
          setCartItems(updatedCart);
          if (!token) return;
          try {
            const response = await axiosInstance.post("/api/cart/remove", { itemId });
            if (response.data.success) setCartItems(response.data.cartData);
          } catch (err) {
            console.error("Error removing from cart:", err.message);
          }
        },
        getTotalCartAmount: () => {
          let total = 0;
          for (let id in cartItem) {
            const item = food_list.find((food) => food._id === id);
            if (item) total += item.price * cartItem[id];
          }
          return total;
        },
        url,
        token,
        setToken,
        loading,
        error,
        axiosInstance,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
