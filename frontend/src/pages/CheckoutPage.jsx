import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowLeft, CreditCard } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { ordersAPI } from '../api/orders';
import toast from 'react-hot-toast';
import styles from '../styles/CheckoutPage.module.css';

const CheckoutPage = () => {
    const { cart, getCartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    // Script loading state
    const [razorpayLoaded, setRazorpayLoaded] = useState(false);

    // Redirect if cart is empty
    useEffect(() => {
        if (cart.length === 0) {
            navigate('/cart');
        }

        // Load Razorpay script
        const loadRazorpay = () => {
            // Check if Razorpay is already loaded
            if (window.Razorpay) {
                setRazorpayLoaded(true);
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            // Remove credentials attribute to prevent OTP credentials error
            script.setAttribute('crossorigin', 'anonymous');
            script.onload = () => {
                setRazorpayLoaded(true);
                console.log('Razorpay script loaded successfully');
            };
            script.onerror = (error) => {
                console.error('Error loading Razorpay script:', error);
                toast.error("Could not load payment gateway. Please try again.");
            };
            document.body.appendChild(script);
        };

        loadRazorpay();

        // Cleanup
        return () => {
            const razorpayScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
            if (razorpayScript) {
                razorpayScript.remove();
            }
        };
    }, [cart.length, navigate]);

    const [formData, setFormData] = useState({
        shippingAddress: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'India'
        },
        paymentMethod: 'cod',
        phone: user?.phone || ''
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const initializeRazorpayPayment = async (amount) => {
        if (!window.Razorpay) {
            console.error("Razorpay SDK not loaded");
            toast.error("Payment service not available. Please try again later.");
            return false;
        }

        try {
            setLoading(true);
            
            // Ensure amount is a number and has at most 2 decimal places
            const sanitizedAmount = parseFloat(parseFloat(amount).toFixed(2));
            console.log('Creating Razorpay order for amount:', sanitizedAmount);

            // Create order on server
            const response = await ordersAPI.createRazorpayOrder(sanitizedAmount);
            
            console.log('Razorpay order response:', response);
            
            // Validation
            if (!response || !response.success || !response.order || !response.order.id) {
                throw new Error('Invalid response from server');
            }

            // Get the order details from response
            const { order, key } = response;
            
            // Very simple Razorpay options - minimal configuration
            const options = {
                key: key,
                amount: order.amount,
                currency: order.currency,
                name: 'E-commerce Store',
                description: 'Purchase',
                order_id: order.id,
                handler: function (response) {
                    console.log('Payment successful:', response);
                    handleOrderWithRazorpay(response);
                },
                modal: {
                    ondismiss: function() {
                        console.log('Payment modal dismissed');
                        setLoading(false);
                        toast.error('Payment cancelled');
                    },
                    confirm_close: true, // Ask for confirmation before closing
                    escape: true // Allow escape key to close the modal
                }
            };

            console.log('Initializing Razorpay with minimal options:', options);
            
            // Create a new instance with minimal configuration
            const paymentObject = new window.Razorpay(options);
            
            // Open the checkout
            paymentObject.open();
            return true;
        } catch (error) {
            console.error('Razorpay error:', error);
            toast.error('Payment initialization failed: ' + (error.message || 'Unknown error'));
            setLoading(false);
            return false;
        }
    };

    const handleOrderWithRazorpay = async (paymentResponse) => {
        try {
            console.log('Handling Razorpay payment completion:', paymentResponse);
            toast.loading('Confirming payment...');
            
            // Check if the required parameters exist in the response
            if (!paymentResponse.razorpay_payment_id || 
                !paymentResponse.razorpay_order_id ||
                !paymentResponse.razorpay_signature) {
                throw new Error('Incomplete payment response');
            }
            
            // Verify payment on server
            const verificationResponse = await ordersAPI.verifyRazorpayPayment({
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature
            });
            
            console.log('Payment verification response:', verificationResponse);

            if (verificationResponse.success) {
                // Place the order with payment details
                const orderData = {
                    items: cart.map(item => ({
                        product: item.product._id,
                        quantity: item.quantity,
                    })),
                    shippingAddress: formData.shippingAddress,
                    paymentMethod: 'razorpay',
                    phone: formData.phone,
                    totalAmount: total,
                    razorpayOrderId: paymentResponse.razorpay_order_id,
                    razorpayPaymentId: paymentResponse.razorpay_payment_id,
                    razorpaySignature: paymentResponse.razorpay_signature
                };
                
                console.log('Placing order with payment details:', orderData);
                const orderResponse = await ordersAPI.placeOrder(orderData);
                console.log('Order placed:', orderResponse);
                
                toast.dismiss();
                toast.success('Payment successful! Order placed.');
                clearCart();
                navigate('/order-success');
            } else {
                throw new Error('Payment verification failed');
            }
        } catch (error) {
            toast.dismiss();
            console.error('Error completing order after payment:', error);
            toast.error('Failed to complete order: ' + (error.message || 'Unknown error'));
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (formData.paymentMethod === 'razorpay') {
            // Handle Razorpay payment
            const initiated = await initializeRazorpayPayment(total);
            if (!initiated) {
                setLoading(false);
            }
            // Razorpay flow will continue in handleOrderWithRazorpay
            return;
        }

        // COD flow
        try {
            const orderData = {
                items: cart.map(item => ({
                    product: item.product._id,
                    quantity: item.quantity,
                })),
                shippingAddress: formData.shippingAddress,
                paymentMethod: formData.paymentMethod,
                phone: formData.phone,
                totalAmount: total
            };
            await ordersAPI.placeOrder(orderData);
            toast.success('Order placed successfully!');
            clearCart();
            navigate('/order-success');
        } catch (error) {
            toast.error('Failed to place order.');
            console.error('Checkout error:', error);
        } finally {
            setLoading(false);
        }
    };
    
    if (cart.length === 0) return null;

    const subtotal = getCartTotal();
    const tax = subtotal * 0.18;
    const total = subtotal + tax;

    // Add a test function for Razorpay
    const testRazorpayConnection = async () => {
        try {
            toast.loading('Testing payment gateway connection...');
            const response = await ordersAPI.testRazorpay();
            toast.dismiss();
            
            if (response && response.success) {
                toast.success('Payment gateway connection successful!');
                console.log('Test successful:', response);
            } else {
                toast.error('Payment gateway test failed');
                console.error('Test failed:', response);
            }
        } catch (error) {
            toast.dismiss();
            toast.error('Payment gateway test failed: ' + error.message);
            console.error('Test error:', error);
        }
    };

    return (
        <div className={styles.checkoutPage}>
            <div className="container">
                <button onClick={() => navigate('/cart')} className={styles.backButton}>
                    <ArrowLeft size={18} />
                    Back to Cart
                </button>

                <div className={styles.checkoutLayout}>
                    <div className={styles.formSection}>
                        <form onSubmit={handleSubmit} id="checkout-form">
                            <div className={styles.checkoutCard}>
                                <h2 className={styles.cardTitle}>Checkout</h2>
                                <div className={styles.shippingSection}>
                                    <h3 className={styles.sectionTitle}>
                                        <MapPin size={20} />
                                        <span>Shipping Address</span>
                                    </h3>
                                    <div className={styles.formGrid}>
                                        <div className={styles.formGroupFull}>
                                            <label htmlFor="street" className={styles.formLabel}>Street Address</label>
                                            <input type="text" id="street" name="shippingAddress.street" value={formData.shippingAddress.street} onChange={handleChange} className={styles.formInput} placeholder="Enter your street address" required />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label htmlFor="city" className={styles.formLabel}>City</label>
                                            <input type="text" id="city" name="shippingAddress.city" value={formData.shippingAddress.city} onChange={handleChange} className={styles.formInput} placeholder="Enter city" required />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label htmlFor="state" className={styles.formLabel}>State</label>
                                            <input type="text" id="state" name="shippingAddress.state" value={formData.shippingAddress.state} onChange={handleChange} className={styles.formInput} placeholder="Enter state" required />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label htmlFor="zipCode" className={styles.formLabel}>ZIP Code</label>
                                            <input type="text" id="zipCode" name="shippingAddress.zipCode" value={formData.shippingAddress.zipCode} onChange={handleChange} className={styles.formInput} placeholder="Enter ZIP code" required />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label htmlFor="country" className={styles.formLabel}>Country</label>
                                            <input type="text" id="country" name="shippingAddress.country" value={formData.shippingAddress.country} className={styles.formInput} disabled />
                                        </div>
                                        <div className={styles.formGroupFull}>
                                            <label htmlFor="phone" className={styles.formLabel}>Phone Number</label>
                                            <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} className={styles.formInput} placeholder="Enter your 10-digit phone number" required />
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.paymentSection}>
                                    <h3 className={styles.sectionTitle}>
                                        <CreditCard size={20} />
                                        <span>Payment Method</span>
                                    </h3>
                                    <div className={styles.paymentOptions}>
                                        <div className={styles.paymentOption}>
                                            <input
                                                type="radio"
                                                id="cod"
                                                name="paymentMethod"
                                                value="cod"
                                                checked={formData.paymentMethod === 'cod'}
                                                onChange={handleChange}
                                                className={styles.paymentRadio}
                                            />
                                            <label htmlFor="cod" className={styles.paymentLabel}>
                                                Cash on Delivery
                                            </label>
                                        </div>

                                        <div className={styles.paymentOption}>
                                            <input
                                                type="radio"
                                                id="razorpay"
                                                name="paymentMethod"
                                                value="razorpay"
                                                checked={formData.paymentMethod === 'razorpay'}
                                                onChange={handleChange}
                                                className={styles.paymentRadio}
                                            />
                                            <label htmlFor="razorpay" className={styles.paymentLabel}>
                                                Pay Online (Credit/Debit Card, UPI, Netbanking)
                                            </label>
                                        </div>
                                    </div>
                                    
                                    {/* Test button for developers */}
                                    <button 
                                        type="button"
                                        onClick={testRazorpayConnection}
                                        className={styles.testButton}
                                        style={{ 
                                            marginTop: '20px', 
                                            padding: '8px 16px', 
                                            fontSize: '14px', 
                                            backgroundColor: '#f0f0f0',
                                            color: '#333',
                                            border: '1px solid #ccc',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Test Payment Gateway Connection
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className={styles.summarySection}>
                        <div className={styles.checkoutCard}>
                            <h3 className={styles.cardTitle}>Order Summary</h3>
                            <div className={styles.summaryDetails}>
                                {cart.map(item => (
                                    <div key={item._id} className={styles.summaryItem}>
                                        <span className={styles.itemName}>{item.product.name} x {item.quantity}</span>
                                        <span className={styles.itemPrice}>₹{(item.product.price * item.quantity).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                            <div className={styles.summaryLine}>
                                <span>Subtotal</span>
                                <span>₹{subtotal.toLocaleString()}</span>
                            </div>
                            <div className={styles.summaryLine}>
                                <span>Tax (18%)</span>
                                <span>₹{tax.toLocaleString()}</span>
                            </div>
                            <div className={styles.summaryTotal}>
                                <span>Total</span>
                                <span>₹{total.toLocaleString()}</span>
                            </div>
                            <button type="submit" form="checkout-form" className={styles.placeOrderBtn} disabled={loading}>
                                {loading ? 'Processing...' : formData.paymentMethod === 'razorpay' ? 'Pay Now' : 'Place Order'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
