import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { DEFAULT_PRODUCT_IMAGE } from '../utils/constants';
import styles from '../styles/CartPage.module.css';

const CartPage = () => {
  const { cart, loading, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const navigate = useNavigate();

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity >= 1) {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className={styles.wishlistPage}>
        <div className="spinner" />
      </div>
    );
  }

  if (cart.length === 0) {
    return (
        <div className={styles.wishlistPage}>
            <div className={styles.emptyWishlistContainer}>
                <ShoppingBag size={60} className={styles.emptyWishlistIcon} />
                <h1 className={styles.emptyWishlistTitle}>Your Cart is Empty</h1>
                <p className={styles.emptyWishlistText}>
                Looks like you haven't added anything to your cart yet.
            </p>
            <Link to="/products" className="btn btn-primary">
                Continue Shopping
            </Link>
            </div>
        </div>
    );
  }

  const subtotal = getCartTotal();
  const estimatedTax = subtotal * 0.18; // 18% tax
  const total = subtotal + estimatedTax;

  return (
    <div className={styles.wishlistPage}>
        <div className="container">
                    <h1 className={styles.pageTitle}>My Cart</h1>
            <div className={styles.cartLayout}>
                <div className={styles.wishlistGrid}>
                    {cart.map((item) => (
                        <div key={item._id} className={styles.productCard}>
                            <button
                                onClick={() => removeFromCart(item._id)}
                                className={styles.removeButton}
                                title="Remove from cart"
                            >
                                <Trash2 size={20} />
                            </button>
                            <Link to={`/products/${item.product._id}`} className={styles.productImageLink}>
                                    <img
                                        src={item.product.image || DEFAULT_PRODUCT_IMAGE}
                                        alt={item.product.name}
                                        className={styles.productImage}
                                        onError={(e) => { e.target.src = DEFAULT_PRODUCT_IMAGE; }}
                                    />
                            </Link>
                            <div className={styles.productInfo}>
                                <span className={styles.productCategory}>
                                    {item.product.category?.name || 'Uncategorized'}
                                </span>
                                <h4 className={styles.productName}>
                                    <Link to={`/products/${item.product._id}`}>{item.product.name}</Link>
                                </h4>
                                <p className={styles.productPrice}>₹{item.product.price.toLocaleString()}</p>
                                        <div className={styles.quantitySelector}>
                                            <button
                                                onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                                                disabled={item.quantity <= 1}
                                                className={styles.quantityButton}
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className={styles.quantityDisplay}>{item.quantity}</span>
                                            <button
                                                onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                                                className={styles.quantityButton}
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.orderSummary}>
                    <h2 className={styles.summaryTitle}>Order Summary</h2>
                    <div className={styles.summaryDetails}>
                        <div className={styles.summaryRow}>
                            <span>Subtotal</span>
                            <span>₹{subtotal.toLocaleString()}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>Shipping</span>
                            <span>Free</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>Estimated Tax</span>
                            <span>₹{estimatedTax.toLocaleString()}</span>
                        </div>
                    </div>
                    <div className={styles.summaryTotal}>
                        <span>Total</span>
                        <span>₹{total.toLocaleString()}</span>
                    </div>
                    <button
                        onClick={handleCheckout}
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                    >
                        Proceed to Checkout
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default CartPage;
