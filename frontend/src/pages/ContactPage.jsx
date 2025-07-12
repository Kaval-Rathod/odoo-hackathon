import { useState } from 'react';
import { contactAPI } from '../api/contact';
import toast from 'react-hot-toast';
import styles from '../styles/ContactPage.module.css';
import { Mail, Phone, MapPin } from 'lucide-react';

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic validation
        if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
            toast.error('Please fill in all fields');
            return;
        }

        if (formData.message.trim().length < 10) {
            toast.error('Message must be at least 10 characters long');
            return;
        }

        setLoading(true);
        try {
            await contactAPI.submitContact(formData);
            toast.success('Thank you for your message! We will get back to you soon.');
            setFormData({ name: '', email: '', message: '' });
        } catch (error) {
            console.error('Error submitting contact form:', error);
            // Error message is already handled by the API interceptor
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.contactPage}>
            <div className="container">
                <header className={styles.pageHeader}>
                    <h1 className={styles.pageTitle}>Contact Us</h1>
                    <p className={styles.pageSubtitle}>We'd love to hear from you. Reach out to us with any questions or feedback.</p>
                </header>

                <div className={styles.contactGrid}>
                    <div className={styles.contactForm}>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label htmlFor="name">Full Name</label>
                                <input 
                                    type="text" 
                                    id="name" 
                                    name="name" 
                                    value={formData.name}
                                    onChange={handleChange}
                                    required 
                                />
                            </div>
                             <div className={styles.formGroup}>
                                <label htmlFor="email">Email Address</label>
                                <input 
                                    type="email" 
                                    id="email" 
                                    name="email" 
                                    value={formData.email}
                                    onChange={handleChange}
                                    required 
                                />
                            </div>
                             <div className={styles.formGroup}>
                                <label htmlFor="message">Message</label>
                                <textarea 
                                    id="message" 
                                    name="message" 
                                    rows="6" 
                                    value={formData.message}
                                    onChange={handleChange}
                                    required 
                                />
                            </div>
                            <button 
                                type="submit" 
                                className="btn btn-primary" 
                                style={{width: '100%'}}
                                disabled={loading}
                            >
                                {loading ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    </div>
                    <div className={styles.contactInfo}>
                        <h3>Our Information</h3>
                        <p>You can also reach us at the following addresses:</p>
                        <ul>
                            <li><Mail size={18} /> <span>amba.parmar0705@gmail.com</span></li>
                            <li><Phone size={18} /> <span>+1 (234) 567-890</span></li>
                            <li><MapPin size={18} /> <span>123 Shopping Lane, Commerce City, 54321</span></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage; 