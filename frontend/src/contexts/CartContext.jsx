import { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI } from '../api/cart';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();

  // Load cart when user is authenticated
  useEffect(() => {
    if (isAuthenticated && !user?.isAdmin) {
      loadCart();
    } else {
      setCart([]);
    }
  }, [isAuthenticated, user]);

  const loadCart = async () => {
    if (!isAuthenticated || user?.isAdmin) return;
    
    setLoading(true);
    try {
      const cartData = await cartAPI.getCart();
      setCart(cartData.items || []);
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }

    if (user?.isAdmin) {
      toast.error('Admin users cannot add items to cart');
      return;
    }

    try {
      await cartAPI.addToCart(productId, quantity);
      await loadCart(); // Reload cart after adding item
      toast.success('Item added to cart!');
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const removeFromCart = async (itemId) => {
    if (user?.isAdmin) {
      toast.error('Admin users cannot modify cart');
      return;
    }

    try {
      await cartAPI.removeFromCart(itemId);
      await loadCart(); // Reload cart after removing item
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Failed to remove from cart:', error);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }

    try {
      await cartAPI.updateQuantity(itemId, quantity);
      await loadCart(); // Reload cart after updating quantity
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    cart,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    loadCart,
    getCartTotal,
    getCartCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}; 