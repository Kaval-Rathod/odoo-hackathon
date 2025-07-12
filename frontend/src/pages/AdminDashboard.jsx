import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, Package, ShoppingCart, Users, BarChart3, 
    Plus, Edit, Trash2, ArrowUpRight, Tag, Eye, X, MessageSquare 
} from 'lucide-react';
import { productsAPI } from '../api/products';
import { ordersAPI } from '../api/orders';
import { authAPI } from '../api/auth';
import { contactAPI } from '../api/contact';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { DEFAULT_PRODUCT_IMAGE } from '../utils/constants';
import styles from '../styles/AdminDashboard.module.css';
import AdminLayout from '../components/AdminLayout';

const StatCard = ({ icon, label, value, detail }) => (
    <div className={styles.statCard}>
        <div className={styles.statIconWrapper}>{icon}</div>
        <div className={styles.statInfo}>
            <p className={styles.statLabel}>{label}</p>
            <p className={styles.statValue}>{value}</p>
            {detail && <p className={styles.statDetail}>{detail}</p>}
        </div>
    </div>
);

const DashboardContent = ({ stats, products, orders, handleDeleteProduct }) => (
    <main className={styles.mainContent}>
        <header className={styles.mainHeader}>
            <h1 className={styles.mainTitle}>Dashboard</h1>
            <Link to="/admin/products/add" className={`btn btn-primary ${styles.addBtn}`}>
                <Plus size={18} />
                <span>Add Product</span>
            </Link>
        </header>

        {/* Stats */}
        <div className={styles.statsGrid}>
            <StatCard 
                icon={<BarChart3 size={24} />}
                label="Total Revenue"
                value={`₹${stats.totalRevenue.toLocaleString()}`}
                detail="+2.5% from last month"
            />
            <StatCard 
                icon={<ShoppingCart size={24} />}
                label="Total Orders"
                value={stats.orders.length}
                detail="+5 from yesterday"
            />
            <StatCard 
                icon={<Package size={24} />}
                label="Total Products"
                value={stats.products.length}
                detail="2 new products added"
            />
            <StatCard 
                icon={<Users size={24} />}
                label="Total Users"
                value={stats.users.length}
                detail="1 new user registered"
            />
        </div>

        {/* Recent Orders */}
        <div className={styles.recentOrders}>
            <h2 className={styles.sectionTitle}>Recent Orders</h2>
            <div className={styles.tableWrapper}>
                <table className={styles.orderTable}>
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.slice(0, 5).map((order) => (
                            <tr key={order._id}>
                                <td className={styles.orderId}>{order._id.slice(-8)}</td>
                                <td>{order.user?.name || 'N/A'}</td>
                                <td>₹{order.totalAmount?.toLocaleString()}</td>
                                <td>
                                    <span className={`${styles.statusBadge} ${styles[order.status?.toLowerCase()]}`}>
                                        {order.status || 'Pending'}
                                    </span>
                                </td>
                                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <div className={styles.actionButtons}>
                                        <Link to={`/admin/orders/edit/${order._id}`} title="Edit Order & Tracking">
                                            <Edit size={16} />
                                        </Link>
                                        <Link to={`/orders/${order._id}`} title="View Details">
                                            <Eye size={16} />
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {orders.length === 0 && <p>No orders found.</p>}
        </div>

        {/* Recent Products */}
        <div className={styles.recentProducts}>
            <h2 className={styles.sectionTitle}>Recent Products</h2>
            <div className={styles.tableWrapper}>
                <table className={styles.productTable}>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.slice(0, 5).map((product) => (
                            <tr key={product._id}>
                                <td>
                                    <div className={styles.productCell}>
                                        <img
                                            src={product.image || DEFAULT_PRODUCT_IMAGE}
                                            alt={product.name}
                                            className={styles.productImage}
                                            onError={(e) => { e.target.src = DEFAULT_PRODUCT_IMAGE; }}
                                        />
                                        <span>{product.name}</span>
                                    </div>
                                </td>
                                <td>{product.category?.name || 'N/A'}</td>
                                <td>₹{product.price?.toLocaleString()}</td>
                                <td>
                                    <span className={product.countInStock > 0 ? styles.inStock : styles.outOfStock}>
                                        {product.countInStock || 0}
                                    </span>
                                </td>
                                <td>
                                    <div className={styles.actionButtons}>
                                        <Link to={`/admin/products/edit/${product._id}`} title="Edit">
                                            <Edit size={16} />
                                        </Link>
                                        <button onClick={() => handleDeleteProduct(product._id)} title="Delete">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {products.length === 0 && <p>No products found.</p>}
        </div>
    </main>
);

const ProductsContent = ({ products, handleDeleteProduct }) => (
    <main className={styles.mainContent}>
        <header className={styles.mainHeader}>
            <h1 className={styles.mainTitle}>Products</h1>
            <Link to="/admin/products/add" className={`btn btn-primary ${styles.addBtn}`}>
                <Plus size={18} />
                <span>Add Product</span>
            </Link>
        </header>

        <div className={styles.productList}>
            {products.map((product) => (
                <div key={product._id} className={styles.productRow}>
                    <img
                        src={product.image || DEFAULT_PRODUCT_IMAGE}
                        alt={product.name}
                        className={styles.productRowImage}
                        onError={(e) => { e.target.src = DEFAULT_PRODUCT_IMAGE; }}
                    />
                    <div className={styles.productRowInfo}>
                        <Link to={`/products/${product._id}`} className={styles.productRowName}>{product.name}</Link>
                        <span className={styles.productRowCategory}>{product.category?.name || 'Uncategorized'}</span>
                    </div>
                    <div className={styles.productRowPrice}>₹{product.price.toLocaleString()}</div>
                    <div className={styles.productRowStock}>
                        {product.countInStock > 0 
                            ? <span className={styles.inStock}>{product.countInStock} in stock</span>
                            : <span className={styles.outOfStock}>Out of stock</span>
                        }
                    </div>
                    <div className={styles.productRowActions}>
                        <Link to={`/admin/products/edit/${product._id}`} className={styles.actionBtn} title="Edit">
                            <Edit size={16} />
                        </Link>
                        <button onClick={() => handleDeleteProduct(product._id)} className={styles.actionBtn} title="Delete">
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
        {products.length === 0 && <p>No products found.</p>}
    </main>
);

const OrdersContent = ({ orders }) => (
    <main className={styles.mainContent}>
        <header className={styles.mainHeader}>
            <h1 className={styles.mainTitle}>Orders</h1>
        </header>

        <div className={styles.tableWrapper}>
            <table className={styles.orderTable}>
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order) => (
                        <tr key={order._id}>
                            <td className={styles.orderId}>{order._id.slice(-8)}</td>
                            <td>{order.user?.name || 'N/A'}</td>
                            <td>₹{order.totalAmount?.toLocaleString()}</td>
                            <td>
                                <span className={`${styles.statusBadge} ${styles[order.status?.toLowerCase().replace(/ /g, '')]}`}>
                                    {order.status || 'Pending'}
                                </span>
                            </td>
                            <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td>
                                <div className={styles.actionButtons}>
                                    <Link to={`/admin/orders/edit/${order._id}`} className={styles.actionBtn} title="Edit Order & Tracking">
                                        <Edit size={16} />
                                    </Link>
                                    <Link to={`/orders/${order._id}`} className={styles.actionBtn} title="View Details">
                                        <Eye size={16} />
                                    </Link>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        {orders.length === 0 && <p>No orders found.</p>}
    </main>
);

const CustomerOrdersModal = ({ customer, orders, isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Orders for {customer.name}</h2>
                    <button onClick={onClose} className={styles.modalClose}>
                        <X size={20} />
                    </button>
                </div>
                <div className={styles.modalBody}>
                    {orders.length === 0 ? (
                        <p className={styles.noOrders}>No orders found for this customer.</p>
                    ) : (
                        <div className={styles.tableWrapper}>
                            <table className={styles.orderTable}>
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr key={order._id}>
                                            <td className={styles.orderId}>{order._id.slice(-8)}</td>
                                            <td>₹{order.totalAmount?.toLocaleString()}</td>
                                            <td>
                                                <span className={`${styles.statusBadge} ${styles[order.status?.toLowerCase().replace(/ /g, '')]}`}>
                                                    {order.status || 'Pending'}
                                                </span>
                                            </td>
                                            <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <div className={styles.actionButtons}>
                                                    <Link to={`/admin/orders/edit/${order._id}`} className={styles.actionBtn} title="Edit Order & Tracking">
                                                        <Edit size={16} />
                                                    </Link>
                                                    <Link to={`/orders/${order._id}`} className={styles.actionBtn} title="View Details">
                                                        <Eye size={16} />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const CustomersContent = ({ customers }) => {
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customerOrders, setCustomerOrders] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleCustomerClick = async (customer) => {
        setLoading(true);
        try {
            const orders = await ordersAPI.getOrdersByUserId(customer._id);
            setCustomerOrders(orders);
            setSelectedCustomer(customer);
            setIsModalOpen(true);
        } catch (error) {
            console.error('Error fetching customer orders:', error);
            toast.error('Failed to load customer orders.');
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedCustomer(null);
        setCustomerOrders([]);
    };

    return (
        <>
            <main className={styles.mainContent}>
                <header className={styles.mainHeader}>
                    <h1 className={styles.mainTitle}>Customers</h1>
                </header>

                <div className={styles.tableWrapper}>
                    <table className={styles.orderTable}>
                        <thead>
                            <tr>
                                <th>Customer ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Joined On</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map((customer) => (
                                <tr 
                                    key={customer._id} 
                                    className={styles.clickableRow}
                                    onClick={() => handleCustomerClick(customer)}
                                >
                                    <td className={styles.orderId}>{customer._id.slice(-8)}</td>
                                    <td className={styles.customerName}>{customer.name}</td>
                                    <td>{customer.email}</td>
                                    <td>{new Date(customer.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {customers.length === 0 && <p>No customers found.</p>}
            </main>

            <CustomerOrdersModal 
                customer={selectedCustomer}
                orders={customerOrders}
                isOpen={isModalOpen}
                onClose={closeModal}
            />
        </>
    );
};

const ContactMessagesContent = ({ contacts }) => {
    const [selectedContact, setSelectedContact] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Debug logging
    console.log('ContactMessagesContent rendered with contacts:', contacts);

    const handleContactClick = (contact) => {
        setSelectedContact(contact);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedContact(null);
    };

    const handleStatusUpdate = async (contactId, newStatus) => {
        try {
            await contactAPI.updateContactStatus(contactId, newStatus);
            toast.success('Status updated successfully');
            // Refresh the page to get updated data
            window.location.reload();
        } catch (error) {
            console.error('Error updating contact status:', error);
        }
    };

    const handleDeleteContact = async (contactId) => {
        if (window.confirm('Are you sure you want to delete this message?')) {
            try {
                await contactAPI.deleteContact(contactId);
                toast.success('Message deleted successfully');
                window.location.reload();
            } catch (error) {
                console.error('Error deleting contact:', error);
            }
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'unread': return styles.unread;
            case 'read': return styles.read;
            case 'replied': return styles.replied;
            default: return '';
        }
    };

    return (
        <>
            <main className={styles.mainContent}>
                <header className={styles.mainHeader}>
                    <h1 className={styles.mainTitle}>Contact Messages</h1>
                    <p>Total messages: {contacts ? contacts.length : 0}</p>
                </header>

                <div className={styles.tableWrapper}>
                    {contacts && contacts.length > 0 ? (
                        <table className={styles.orderTable}>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contacts.map((contact) => (
                                    <tr 
                                        key={contact._id} 
                                        className={styles.clickableRow}
                                        onClick={() => handleContactClick(contact)}
                                    >
                                        <td className={styles.customerName}>{contact.name}</td>
                                        <td>{contact.email}</td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${getStatusBadgeClass(contact.status)}`}>
                                                {contact.status}
                                            </span>
                                        </td>
                                        <td>{new Date(contact.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <div className={styles.actionButtons}>
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleStatusUpdate(contact._id, 'read');
                                                    }}
                                                    className={styles.actionBtn}
                                                    title="Mark as Read"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteContact(contact._id);
                                                    }}
                                                    className={styles.actionBtn}
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>No contact messages found. {contacts === undefined ? '(Loading...)' : '(No messages yet)'}</p>
                    )}
                </div>
            </main>

            {selectedContact && (
                <div className={styles.modalOverlay} onClick={closeModal}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>Message from {selectedContact.name}</h2>
                            <button onClick={closeModal} className={styles.modalClose}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.contactDetails}>
                                <p><strong>Email:</strong> {selectedContact.email}</p>
                                <p><strong>Date:</strong> {new Date(selectedContact.createdAt).toLocaleString()}</p>
                                <p><strong>Status:</strong> 
                                    <span className={`${styles.statusBadge} ${getStatusBadgeClass(selectedContact.status)}`}>
                                        {selectedContact.status}
                                    </span>
                                </p>
                            </div>
                            <div className={styles.messageContent}>
                                <h4>Message:</h4>
                                <p>{selectedContact.message}</p>
                            </div>
                            <div className={styles.modalActions}>
                                <button 
                                    onClick={() => handleStatusUpdate(selectedContact._id, 'replied')}
                                    className="btn btn-primary"
                                >
                                    Mark as Replied
                                </button>
                                <button 
                                    onClick={() => handleDeleteContact(selectedContact._id)}
                                    className="btn btn-danger"
                                >
                                    Delete Message
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

const AdminDashboard = () => {
    const [stats, setStats] = useState({ products: [], orders: [], users: [], totalRevenue: 0 });
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!user?.isAdmin) {
            navigate('/login');
            return;
        }
        fetchData();
    }, [user, navigate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [productsData, ordersData, usersData, contactsData] = await Promise.all([
                productsAPI.getAll(),
                ordersAPI.getAll(),
                authAPI.getAll(),
                contactAPI.getAllContacts()
            ]);
            
            const totalRevenue = ordersData.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
            
            setProducts(productsData);
            setOrders(ordersData);
            setContacts(contactsData);
            setStats({
                products: productsData,
                orders: ordersData,
                users: usersData,
                totalRevenue
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Failed to load dashboard data.');
            // Set empty arrays to prevent undefined errors
            setProducts([]);
            setOrders([]);
            setContacts([]);
            setStats({
                products: [],
                orders: [],
                users: [],
                totalRevenue: 0
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await productsAPI.delete(productId);
                toast.success('Product deleted successfully');
                fetchData(); // Refetch all data
            } catch (error) {
                console.error('Failed to delete product:', error);
                toast.error('Failed to delete product.');
            }
        }
    };

    if (loading) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
                <div className="spinner"></div>
            </div>
        );
    }
    
    const isProductsPage = location.pathname === '/admin/products';
    const isOrdersPage = location.pathname === '/admin/orders';
    const isCustomersPage = location.pathname === '/admin/customers';
    const isContactMessagesPage = location.pathname === '/admin/contact-messages';

    return (
        <>
            {isProductsPage ? (
                <ProductsContent products={products} handleDeleteProduct={handleDeleteProduct} />
            ) : isOrdersPage ? (
                <OrdersContent orders={orders} />
            ) : isCustomersPage ? (
                <CustomersContent customers={stats.users} />
            ) : isContactMessagesPage ? (
                <ContactMessagesContent contacts={contacts} />
            ) : (
                <DashboardContent stats={stats} products={products} orders={orders} handleDeleteProduct={handleDeleteProduct} />
            )}
        </>
    );
};

export default AdminDashboard; 