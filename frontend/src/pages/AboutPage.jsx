import styles from '../styles/AboutPage.module.css';

const AboutPage = () => {
    return (
        <div className={styles.aboutPage}>
            <div className="container">
                <header className={styles.pageHeader}>
                    <h1 className={styles.pageTitle}>About getcart</h1>
                    <p className={styles.pageSubtitle}>Your one-stop shop for everything you need.</p>
                </header>

                <div className={styles.contentSection}>
                    <div className={styles.textBlock}>
                        <h2>Our Story</h2>
                        <p>
                            Founded in 2024, getcart was born out of a desire to create a seamless and enjoyable online shopping experience. We noticed that finding high-quality, curated products in one place was a challenge. We wanted to build a platform where customers could discover their next favorite things, from the latest electronics to timeless fashion pieces and everyday essentials.
                        </p>
                        <p>
                            Our team is passionate about design, technology, and customer service. We work tirelessly to source the best products, build intuitive features, and provide support that makes you feel valued.
                        </p>
                    </div>

                    <div className={styles.imageBlock}>
                        <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2670&auto=format&fit=crop" alt="Our Team" />
                    </div>
                </div>

                <div className={`${styles.contentSection} ${styles.reverseOnMobile}`}>
                     <div className={styles.imageBlock}>
                        <img src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?q=80&w=2670&auto=format&fit=crop" alt="Our Mission" />
                    </div>
                    <div className={styles.textBlock}>
                        <h2>Our Mission</h2>
                        <p>
                            Our mission is simple: to provide a curated selection of high-quality products that enhance your modern lifestyle. We believe in quality over quantity, and we stand behind every item we sell. We aim to be more than just a retailer; we want to be a trusted partner in your daily life.
                        </p>
                        <p>
                            We are committed to sustainability, ethical sourcing, and creating a positive impact on our community. Thank you for joining us on this journey.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutPage; 