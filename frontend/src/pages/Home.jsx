import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI } from '../api/products';
import { categoriesAPI } from '../api/categories';
import toast from 'react-hot-toast';
import styles from '../styles/Home.module.css';
import ProductCard from '../components/ProductCard';
import useIntersectionObserver from '../hooks/useIntersectionObserver';
import Footer from '../components/Footer';

const DEFAULT_CATEGORY_IMAGE = 'https://via.placeholder.com/120x120?text=Category';
const DEFAULT_PRODUCT_IMAGE = 'https://via.placeholder.com/400x300?text=Product';

const HeroBanner = () => (
  <section className={styles.heroBanner}>
    <div className={styles.heroContent}>
      <p className={styles.heroSubtitle}>Explore the new collection</p>
      <h1 className={styles.heroTitle}>Discover Your Next Favorite Thing</h1>
      <p className={styles.heroDescription}>Curated products for a modern lifestyle. High quality, timeless design.</p>
      <Link to="/products" className={`${styles.btn} ${styles.btnPrimary}`}>Shop Now</Link>
    </div>
    <div className={styles.heroImageContainer}>
      <img 
        src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=2574&auto=format&fit=crop" 
        alt="Collection of products" 
        className={styles.heroImage} 
      />
    </div>
  </section>
);

const CategoryCarousel = ({ categories }) => {
  const [ref, isIntersecting] = useIntersectionObserver({
    threshold: 0.1,
  });

  if (!categories || categories.length === 0) {
    return (
      <section className={`${styles.section} ${styles.firstSection}`}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Best For Your Categories</h2>
          <p style={{ textAlign: 'center' }}>No categories have been added yet. <Link to="/admin/categories">Add categories</Link> to see them here.</p>
        </div>
      </section>
    );
  }

  return (
    <section className={`${styles.section} ${styles.firstSection}`} ref={ref}>
      <div className="container">
        <div className={styles.sectionHeader}>
            <div>
              <h2 className={`${styles.sectionTitle} ${isIntersecting ? styles.fadein : ''}`}>Best For Your Categories</h2>
              <p className={`${styles.sectionSubtitle} ${isIntersecting ? styles.fadein : ''}`} style={{ animationDelay: '0.2s' }}>Explore our top categories</p>
            </div>
            {categories.length > 6 && (
              <Link to="/categories" className={`${styles.viewAllLink} ${isIntersecting ? styles.fadein : ''}`} style={{ animationDelay: '0.3s' }}>
                View All
              </Link>
            )}
        </div>
        <div className={styles.categoriesGrid}>
          {categories.slice(0, 6).map((cat, index) => (
            <Link 
              to={`/products?category=${cat._id}`} 
              key={cat._id} 
              className={`${styles.categoryItem} ${isIntersecting ? styles.fadein : ''}`}
              style={{ animationDelay: `${0.3 + index * 0.1}s` }}
            >
              <div className={styles.categoryImageWrapper}>
                <img 
                  src={cat.image || DEFAULT_CATEGORY_IMAGE} 
                  alt={cat.name} 
                  className={styles.categoryImg}
                  onError={(e) => { e.target.src = DEFAULT_CATEGORY_IMAGE; }}
                />
              </div>
              <h3 className={styles.categoryName}>{cat.name}</h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

const PopularProducts = ({ products }) => {
  const [ref, isIntersecting] = useIntersectionObserver({
    threshold: 0.1,
  });

  if (!products || products.length === 0) {
    return (
      <section className={styles.section}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Popular Products</h2>
          <p style={{ textAlign: 'center' }}>No products have been added yet. <Link to="/admin/products/add">Add a product</Link> to see it here.</p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section} ref={ref}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={`${styles.sectionTitle} ${isIntersecting ? styles.fadein : ''}`}>Popular Products</h2>
            <p className={`${styles.sectionSubtitle} ${isIntersecting ? styles.fadein : ''}`} style={{ animationDelay: '0.2s' }}>Discover our most loved items</p>
          </div>
          {products.length > 8 && (
            <Link to="/products" className={`${styles.viewAllLink} ${isIntersecting ? styles.fadein : ''}`} style={{ animationDelay: '0.3s' }}>
              View All
            </Link>
          )}
        </div>
        <div className={styles.productsGrid}>
          {products.slice(0, 8).map((product, index) => (
            <div 
              key={product._id} 
              className={isIntersecting ? styles.fadein : ''}
              style={{ animationDelay: `${0.2 + index * 0.1}s` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const BenefitsBar = () => {
  const [ref, isIntersecting] = useIntersectionObserver({
    threshold: 0.1,
  });

  return (
    <section className={styles.section} style={{ borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)'}} ref={ref}>
    <div className="container">
      <div className={styles.benefitsGrid}>
          <div className={`${styles.benefitItem} ${isIntersecting ? styles.fadein : ''}`} style={{ animationDelay: '0.1s' }}>
          <h4 className={styles.benefitTitle}>Worldwide Shipping</h4>
          <p className={styles.benefitText}>On order over $199</p>
        </div>
          <div className={`${styles.benefitItem} ${isIntersecting ? styles.fadein : ''}`} style={{ animationDelay: '0.2s' }}>
          <h4 className={styles.benefitTitle}>Money Back Guarantee</h4>
          <p className={styles.benefitText}>Best returns in 7 days</p>
        </div>
          <div className={`${styles.benefitItem} ${isIntersecting ? styles.fadein : ''}`} style={{ animationDelay: '0.3s' }}>
          <h4 className={styles.benefitTitle}>Offers and Discounts</h4>
          <p className={styles.benefitText}>On all orders over $99</p>
        </div>
          <div className={`${styles.benefitItem} ${isIntersecting ? styles.fadein : ''}`} style={{ animationDelay: '0.4s' }}>
          <h4 className={styles.benefitTitle}>24/7 Support Service</h4>
          <p className={styles.benefitText}>Get help when you need it</p>
        </div>
      </div>
    </div>
  </section>
);
};

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          productsAPI.getAll(),
          categoriesAPI.getAll()
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        toast.error("Failed to load page data.");
        console.error("Failed to fetch home data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className={styles.home}>
      <HeroBanner />
      <CategoryCarousel categories={categories} />
      <PopularProducts products={products} />
      <BenefitsBar />
      <Footer />
    </div>
  );
};

export default Home; 