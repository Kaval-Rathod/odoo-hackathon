import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Search } from 'lucide-react';
import { productsAPI } from '../api/products';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useWishlist } from '../contexts/WishlistContext';
import { DEFAULT_PRODUCT_IMAGE } from '../utils/constants';
import styles from '../styles/ProductList.module.css';
import { categoriesAPI } from '../api/categories';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    
    const query = useQuery();
    const location = useLocation();

    const [searchTerm, setSearchTerm] = useState(query.get('search') || '');
    const [selectedCategory, setSelectedCategory] = useState(query.get('category') || 'all');
    const [allCategories, setAllCategories] = useState([]);

    const { addToCart } = useCart();
    const { isAuthenticated } = useAuth();
    const { toggleWishlist, isProductInWishlist } = useWishlist();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await categoriesAPI.getAll();
                setAllCategories([{ _id: 'all', name: 'All Categories' }, ...data]);
            } catch (err) {
                console.error("Failed to load categories");
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams(location.search);
                const data = await productsAPI.getAll(params);
                setProducts(data);
            } catch (err) {
                setError('Failed to load products');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [location.search]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        const params = new URLSearchParams(location.search);

        if (name === 'category') {
            setSelectedCategory(value);
            if (value === 'all') {
                params.delete('category');
            } else {
                params.set('category', value);
            }
        }
        
        navigate(`/products?${params.toString()}`);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const params = new URLSearchParams(location.search);
        params.set('search', searchTerm);
        navigate(`/products?${params.toString()}`);
    };

    const handleAddToCart = async (productId) => {
        if (!isAuthenticated) return;
        try {
          await addToCart(productId, 1);
        } catch (error) {
          console.error('Failed to add to cart:', error);
        }
    };
    
    if (loading) {
        return (
            <div className={styles.productListContainer}>
                <div className={styles.loadingWrapper}><div className={styles.spinner}></div></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.productListContainer}>
                <div className={styles.errorWrapper}><p>{error}</p></div>
            </div>
        );
    }
    
    return (
        <div className={styles.productListContainer}>
            <div className={styles.headerSection}>
                <h1 className={styles.productListTitle}>{query.get('search') ? `Results for "${query.get('search')}"` : 'Our Products'}</h1>
                <div className={styles.searchFilterRow}>
                    <form onSubmit={handleSearchSubmit} className={styles.searchInputWrapper}>
                        <Search className={styles.searchIcon} size={20} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className={styles.searchInput}
                        />
                    </form>
                    <select
                        name="category"
                        value={selectedCategory}
                        onChange={handleFilterChange}
                        className={styles.categorySelect}
                    >
                        {allCategories.map(category => (
                            <option key={category._id} value={category._id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {products.length === 0 ? (
                <div className={styles.noProductsWrapper}>
                    <p className={styles.noProductsText}>No products found.</p>
                </div>
            ) : (
                <div className={styles.productGrid}>
                    {products.map((product) => (
                        <div key={product._id} className={styles.productCard}>
                             <div className={styles.productImageWrapper}>
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
                            <div className={styles.productCardBody}>
                                <span className={styles.productCategory}>
                                    {product.category?.name || 'Uncategorized'}
                                </span>
                                <Link to={`/products/${product._id}`} className={styles.productName}>
                                    {product.name}
                                </Link>
                                <div className={styles.productCardFooter}>
                                    <span className={styles.productPrice}>₹{product.price?.toLocaleString()}</span>
                                    <button
                                        onClick={() => handleAddToCart(product._id)}
                                        className={styles.addToCartBtn}
                                        disabled={!isAuthenticated}
                                        title={!isAuthenticated ? 'Login to add to cart' : 'Add to cart'}
                                    >
                                        <ShoppingCart size={18} />
                                        <span className={styles.cartText}>Add to cart</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductList;
