import { Link } from 'react-router-dom';
import { Heart, X } from 'lucide-react';
import { useWishlist } from '../contexts/WishlistContext';
import { DEFAULT_PRODUCT_IMAGE } from '../utils/constants';
import styles from '../styles/WishlistPage.module.css';

const WishlistPage = () => {
    const { wishlist, loading, toggleWishlist } = useWishlist();

    if (loading) {
        return (
            <div className={styles.wishlistPage}>
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div className={styles.wishlistPage}>
            {wishlist.length === 0 ? (
                <div className={styles.emptyWishlistContainer}>
                    <Heart size={60} className={styles.emptyWishlistIcon} />
                    <h1 className={styles.emptyWishlistTitle}>Your Wishlist is Empty</h1>
                    <p className={styles.emptyWishlistText}>
                        Explore products and add your favorites to your wishlist.
                    </p>
                    <Link to="/products" className="btn btn-primary">
                        Discover Products
                    </Link>
                </div>
            ) : (
                <div className="container">
                    <h1 className={styles.pageTitle}>My Wishlist</h1>
                    <div className={styles.wishlistGrid}>
                        {wishlist.map((product) => (
                            <div key={product._id} className={styles.productCard}>
                                <button
                                    onClick={() => toggleWishlist(product._id)}
                                    className={styles.removeButton}
                                    title="Remove from wishlist"
                                >
                                    <X size={20} />
                                </button>
                                <Link to={`/products/${product._id}`} className={styles.productImageLink}>
                                    <img
                                        src={product.image || DEFAULT_PRODUCT_IMAGE}
                                        alt={product.name}
                                        className={styles.productImage}
                                        onError={(e) => { e.target.src = DEFAULT_PRODUCT_IMAGE; }}
                                    />
                                </Link>
                                <div className={styles.productInfo}>
                                    <span className={styles.productCategory}>
                                        {product.category?.name || 'Uncategorized'}
                                    </span>
                                    <h4 className={styles.productName}>
                                        <Link to={`/products/${product._id}`}>{product.name}</Link>
                                    </h4>
                                    <p className={styles.productPrice}>₹{product.price.toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default WishlistPage; 