import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useWishlist } from '../contexts/WishlistContext';
import { DEFAULT_PRODUCT_IMAGE } from '../utils/constants';
import styles from '../styles/Home.module.css'; // Using home styles for consistency

const ProductCard = ({ product }) => {
    const { toggleWishlist, isProductInWishlist } = useWishlist();

    return (
        <div className={styles.productCard}>
            <div className={styles.productImageLink}>
                <img
                    src={product.image || DEFAULT_PRODUCT_IMAGE}
                    alt={product.name}
                    className={styles.productImage}
                    onError={(e) => { e.target.src = DEFAULT_PRODUCT_IMAGE; }}
                />
                <button
                    onClick={() => toggleWishlist(product._id)}
                    className={`${styles.wishlistBtn} ${isProductInWishlist(product._id) ? styles.inWishlist : ''}`}
                    title={isProductInWishlist(product._id) ? "Remove from wishlist" : "Add to wishlist"}
                >
                    <Heart size={20} />
                </button>
            </div>
            <div className={styles.productInfo}>
                <Link to={`/products?category=${product.category?._id}`} className={styles.productCategory}>
                    {product.category?.name || 'Uncategorized'}
                </Link>
                <h4 className={styles.productName}>
                    <Link to={`/products/${product._id}`}>{product.name}</Link>
                </h4>
                <p className={styles.productPrice}>₹{product.price.toLocaleString()}</p>
            </div>
        </div>
    );
};

export default ProductCard; 