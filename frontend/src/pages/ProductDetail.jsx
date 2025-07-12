import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Star, Plus, Minus, ChevronLeft } from 'lucide-react';
import { productsAPI } from '../api/products';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { DEFAULT_PRODUCT_IMAGE } from '../utils/constants';
import toast from 'react-hot-toast';
import styles from '../styles/ProductDetail.module.css';
import React from 'react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedOptions, setSelectedOptions] = useState({});

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await productsAPI.getById(id);
        setProduct(data);
      } catch (err) {
        setError('Failed to load product details');
        toast.error('Could not load product.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleQuantityChange = (amount) => {
    setQuantity((prev) => {
      const newQuantity = prev + amount;
      if (newQuantity < 1) return 1;
      if (newQuantity > product.countInStock) return product.countInStock;
      return newQuantity;
    });
  };

  const isFashion = product?.category?.name?.toLowerCase().includes('fashion');
  const isElectronics = product?.category?.name?.toLowerCase().includes('electronic');

  const handleOptionChange = (optionName, value) => {
    setSelectedOptions(prev => ({ ...prev, [optionName]: value }));
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to add items to your cart.');
      navigate('/login');
      return;
    }
    if (user?.isAdmin) {
      toast.error('Admins cannot add products to cart.');
      return;
    }
    if (isFashion && product.sizes?.length && !selectedSize) {
      toast.error('Please select a size.');
      return;
    }
    if (isElectronics && product.models?.length && !selectedModel) {
      toast.error('Please select a model/storage.');
      return;
    }
    if (product.options && product.options.length > 0) {
      for (const opt of product.options) {
        if (!selectedOptions[opt.name]) {
          toast.error(`Please select ${opt.name}.`);
          return;
        }
      }
    }
    addToCart(product._id, quantity);
    let extra = '';
    if (isFashion && selectedSize) extra = ` (Size: ${selectedSize})`;
    if (isElectronics && selectedModel) extra = ` (Model: ${selectedModel})`;
    if (product.options && product.options.length > 0) {
      extra = ' (' + product.options.map(opt => `${opt.name}: ${selectedOptions[opt.name] || ''}`).join(', ') + ')';
    }
    toast.success(`${quantity} x ${product.name}${extra} added to cart!`);
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={`container ${styles.errorContainer}`}>
        <p>{error || 'Product not found.'}</p>
        <Link to="/products" className="btn btn-primary">
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.productDetailContainer}>
      <div className="container">
        <div className={styles.backLinkWrapper}>
            <Link to="/products" className={styles.backLink}>
                <ChevronLeft size={18} />
                Back to products
            </Link>
        </div>
        <div className={styles.productGrid}>
          <div className={styles.imageColumn}>
            <div className={styles.productImageWrapper}>
              <img
                src={product.image || DEFAULT_PRODUCT_IMAGE}
                alt={product.name}
                className={styles.productImage}
                onError={(e) => { e.target.src = DEFAULT_PRODUCT_IMAGE; }}
              />
            </div>
          </div>
          <div className={styles.infoColumn}>
            <Link to={`/products?category=${product.category?._id}`} className={styles.productCategory}>
              {product.category?.name || 'Uncategorized'}
            </Link>
            <h1 className={styles.productTitle}>{product.name}</h1>
            
            <div className={styles.productRatingWrapper}>
              <div className={styles.productRatingStars}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} fill="currentColor" />
                ))}
              </div>
              <span className={styles.productRatingText}>(5.0)</span>
            </div>

            <p className={styles.productPrice}>₹{product.price?.toLocaleString()}</p>

            <p className={styles.productDescription}>
              {product.description
                ? product.description.split('\n').map((line, idx) => (
                    <React.Fragment key={idx}>
                      {line}
                      <br />
                    </React.Fragment>
                  ))
                : 'A timeless piece, crafted with precision and care, perfect for any occasion.'}
            </p>

            {/* Size/Model selection */}
            {isFashion && product.sizes?.length > 0 && (
              <div className={styles.optionSelector}>
                <label htmlFor="size-select">Select Size:</label>
                <select id="size-select" value={selectedSize} onChange={e => setSelectedSize(e.target.value)}>
                  <option value="">Choose size</option>
                  {product.sizes.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
            )}
            {isElectronics && product.models?.length > 0 && (
              <div className={styles.optionSelector}>
                <label htmlFor="model-select">Select Model/Storage:</label>
                <select id="model-select" value={selectedModel} onChange={e => setSelectedModel(e.target.value)}>
                  <option value="">Choose model</option>
                  {product.models.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Dynamic options selection */}
            {product.options && product.options.length > 0 && product.options.map(opt => (
              <div className={styles.optionSelector} key={opt.name}>
                <label htmlFor={`option-${opt.name}`}>Select {opt.name}:</label>
                <select
                  id={`option-${opt.name}`}
                  value={selectedOptions[opt.name] || ''}
                  onChange={e => handleOptionChange(opt.name, e.target.value)}
                >
                  <option value="">Choose {opt.name}</option>
                  {opt.values.map(val => (
                    <option key={val} value={val}>{val}</option>
                  ))}
                </select>
              </div>
            ))}

            <div className={styles.actionsWrapper}>
                <div className={styles.quantitySelector}>
                    <button onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}><Minus size={16}/></button>
                    <span>{quantity}</span>
                    <button onClick={() => handleQuantityChange(1)} disabled={quantity >= product.countInStock}><Plus size={16}/></button>
                </div>
                <button
                    className={`${styles.addToCartBtn} btn btn-primary`}
                    onClick={handleAddToCart}
                    disabled={!product.countInStock || product.countInStock <= 0 || (user && user.isAdmin)}
                >
                    <ShoppingCart size={18} />
                    {user?.isAdmin
                    ? 'Admin View'
                    : product.countInStock > 0
                        ? 'Add to Cart'
                        : 'Out of Stock'}
                </button>
            </div>
            <div className={styles.stockInfo}>
                {product.countInStock > 0 ? `${product.countInStock} items in stock` : 'Currently out of stock'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
