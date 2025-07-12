import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Star, Plus, Minus, ChevronLeft, Loader2, Repeat } from 'lucide-react';
import { productsAPI } from '../api/products';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { DEFAULT_PRODUCT_IMAGE } from '../utils/constants';
import toast from 'react-hot-toast';
import styles from '../styles/ProductDetail.module.css';
import React from 'react';
import { swapAPI } from '../api/index';

// --- IMAGE GALLERY ---
const ImageGallery = ({ images = [], name }) => {
  const [main, setMain] = useState(images[0] || DEFAULT_PRODUCT_IMAGE);
  return (
    <div className={styles.galleryWrapper}>
      <div className={styles.mainImageWrapper}>
        <img src={main} alt={name} className={styles.mainImage} onError={e => { e.target.src = DEFAULT_PRODUCT_IMAGE; }} />
      </div>
      {images.length > 1 && (
        <div className={styles.thumbnailRow}>
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={name + ' thumbnail'}
              className={main === img ? styles.activeThumb : styles.thumb}
              onClick={() => setMain(img)}
              onError={e => { e.target.src = DEFAULT_PRODUCT_IMAGE; }}
              tabIndex={0}
              aria-label={`View image ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

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
  const [swapStatus, setSwapStatus] = useState(null);
  const [swapLoading, setSwapLoading] = useState(false);
  const [showSwapConfirm, setShowSwapConfirm] = useState(false);
  const [swapTypeToRequest, setSwapTypeToRequest] = useState(null);

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

  useEffect(() => {
    // Fetch swap status for this user and item
    const fetchSwapStatus = async () => {
      if (!user || !product) return;
      try {
        const swaps = await swapAPI.getMy();
        const req = swaps.find(r => r.item?._id === product._id);
        setSwapStatus(req || null);
      } catch {}
    };
    fetchSwapStatus();
  }, [user, product]);

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

  const handleSwapRequest = async (type) => {
    setSwapLoading(true);
    try {
      await swapAPI.create({ itemId: product._id, type });
      toast.success(type === 'swap' ? 'Swap request sent!' : 'Redemption request sent!');
      setSwapStatus({ status: 'pending', type });
      setShowSwapConfirm(false);
      setSwapTypeToRequest(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Request failed');
    } finally {
      setSwapLoading(false);
    }
  };

  const handleSwapClick = (type) => {
    setSwapTypeToRequest(type);
    setShowSwapConfirm(true);
  };

  const handleConfirmSwap = () => {
    if (swapTypeToRequest) {
      handleSwapRequest(swapTypeToRequest);
    }
  };

  const handleCancelSwap = () => {
    setShowSwapConfirm(false);
    setSwapTypeToRequest(null);
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

  // Use product.images (array) if available, else fallback to product.image
  const images = product?.images && product.images.length > 0 ? product.images : [product?.image || DEFAULT_PRODUCT_IMAGE];

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
            <ImageGallery images={images} name={product.name} />
          </div>
          <div className={styles.infoColumn}>
            <div className={styles.statusUploaderRow}>
              <span className={`${styles.statusBadge} ${styles[product.status]}`}>{product.status}</span>
              <div className={styles.uploaderCard}>
                <span className={styles.uploaderLabel}>Uploader:</span>
                <span className={styles.uploaderName}>{product.uploader?.name || 'N/A'}</span>
                <span className={styles.uploaderEmail}>{product.uploader?.email || ''}</span>
              </div>
            </div>
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
            {/* Tags, type, size, condition, etc. */}
            <div className={styles.metaRow}>
              {product.type && <span className={styles.metaTag}>Type: {product.type}</span>}
              {product.size && <span className={styles.metaTag}>Size: {product.size}</span>}
              {product.condition && <span className={styles.metaTag}>Condition: {product.condition}</span>}
              {product.tags && product.tags.length > 0 && product.tags.map((tag, i) => <span key={i} className={styles.metaTag}>#{tag}</span>)}
            </div>
            {/* Size/Model/Options selectors (unchanged) */}
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
                    aria-disabled={!product.countInStock || product.countInStock <= 0 || (user && user.isAdmin)}
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
            {/* Swap/Redemption Actions */}
            {user && !user.isAdmin && product.uploader?._id !== user.id && product.status === 'approved' && !swapStatus && (
              <div className={styles.swapRedeemRow}>
                <button
                  className="btn btn-primary"
                  onClick={() => handleSwapClick('swap')}
                  disabled={swapLoading}
                  title="Request a direct swap for this item"
                >
                  {swapLoading && swapTypeToRequest === 'swap' ? <Loader2 size={18} className="spin" style={{marginRight: 6}} /> : <Repeat size={18} style={{marginRight: 6}} />}
                  {swapLoading && swapTypeToRequest === 'swap' ? 'Requesting...' : 'Request Swap'}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleSwapClick('points')}
                  disabled={swapLoading}
                  title="Redeem this item using your points"
                  style={{ marginLeft: 12 }}
                >
                  {swapLoading && swapTypeToRequest === 'points' ? <Loader2 size={18} className="spin" style={{marginRight: 6}} /> : <ShoppingCart size={18} style={{marginRight: 6}} />}
                  {swapLoading && swapTypeToRequest === 'points' ? 'Requesting...' : 'Redeem via Points'}
                </button>
              </div>
            )}
            {swapStatus && (
              <div className={styles.swapStatusRow}>
                <strong>Request Status:</strong> <span className={styles.statusBadge}>{swapStatus.status} ({swapStatus.type})</span>
              </div>
            )}
            {/* Swap Confirmation Modal */}
            {showSwapConfirm && (
              <div className={styles.swapConfirmOverlay}>
                <div className={styles.swapConfirmModal}>
                  <h3>Confirm {swapTypeToRequest === 'swap' ? 'Swap' : 'Redemption'} Request</h3>
                  <p>Are you sure you want to {swapTypeToRequest === 'swap' ? 'request a swap' : 'redeem this item using your points'}?</p>
                  <div style={{ display: 'flex', gap: 16, marginTop: 24, justifyContent: 'flex-end' }}>
                    <button className="btn btn-secondary" onClick={handleCancelSwap} disabled={swapLoading}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleConfirmSwap} disabled={swapLoading}>
                      {swapLoading ? <Loader2 size={16} className="spin" style={{marginRight: 6}} /> : null}
                      Confirm
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

// TODO: Update ProductDetail.module.css for new classes: galleryWrapper, mainImageWrapper, mainImage, thumbnailRow, thumb, activeThumb, statusBadge, statusUploaderRow, uploaderCard, uploaderLabel, uploaderName, uploaderEmail, metaRow, metaTag, swapRedeemRow, swapStatusRow.
