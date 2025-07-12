import styles from '../styles/AboutPage.module.css';

const AboutPage = () => {
    return (
        <div className={styles.aboutPage}>
            <div className="container">
                <header className={styles.pageHeader}>
                    <h1 className={styles.pageTitle}>About ReWear</h1>
                    <p className={styles.pageSubtitle}>Your community for sustainable fashion and conscious swapping.</p>
                </header>

                <div className={styles.contentSection}>
                    <div className={styles.textBlock}>
                        <h2>Our Story</h2>
                        <p>
                            Founded in 2024, ReWear was created to transform the way we think about clothing. We saw a world where too many great clothes go unused, and where fashion’s impact on the planet is too often ignored. Our team set out to build a platform where anyone can give their clothes a second life, discover unique pieces, and join a movement for a more sustainable future.
                        </p>
                    </div>
                    <div className={styles.imageBlock}>
                        <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2670&auto=format&fit=crop" alt="Our Team" />
                    </div>
                </div>

                <div className={`${styles.contentSection} ${styles.reverseOnMobile}`}> 
                    <div className={styles.imageBlock}>
                        <img src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?q=80&w=2670&auto=format&fit=crop" alt="Our Vision" />
                    </div>
                    <div className={styles.textBlock}>
                        <h2>Our Vision</h2>
                        <p>
                            We believe fashion should be circular, accessible, and community-driven. ReWear empowers you to swap, redeem, and share clothing—reducing waste, saving money, and making style more fun and eco-friendly. Our vision is to build a thriving community where every item has a story, and every swap makes a difference.
                        </p>
                    </div>
                </div>

                <div className={styles.contentSection}>
                    <div className={styles.textBlock}>
                        <h2>Our Commitment</h2>
                        <ul style={{ paddingLeft: '1.2em', marginBottom: '1em' }}>
                            <li><strong>Sustainability:</strong> We champion reuse and conscious consumption.</li>
                            <li><strong>Community:</strong> We connect people who care about style and the planet.</li>
                            <li><strong>Trust:</strong> Every item is reviewed for quality and authenticity.</li>
                            <li><strong>Innovation:</strong> We’re always improving, listening, and building for you.</li>
                        </ul>
                        <p>Thank you for being part of ReWear. Together, we’re making fashion better for everyone.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutPage; 