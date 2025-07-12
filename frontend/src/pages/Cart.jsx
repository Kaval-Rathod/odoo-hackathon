import { useEffect, useState } from 'react';
import axios from 'axios';

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  const fetchCart = async () => {
    try {
      const res = await axios.get('https://celebal-project-backend.onrender.com/api/cart', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(res.data.items);
    } catch (err) {
      setError('Failed to fetch cart');
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await axios.delete(`https://celebal-project-backend.onrender.com/api/cart/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCart();
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Your Cart</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div>
          {cart.map((item) => (
            <div key={item.product._id} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
              <h4>{item.product.name}</h4>
              <p>Price: ₹{item.product.price}</p>
              <p>Quantity: {item.quantity}</p>
              <button onClick={() => removeFromCart(item.product._id)}>Remove</button>
            </div>
          ))}
          <h3>Total: ₹{getTotal()}</h3>
        </div>
      )}
    </div>
  );
};

export default Cart;
