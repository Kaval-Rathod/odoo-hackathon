import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, Tag, MessageSquare } from 'lucide-react';
import styles from '../styles/AdminDashboard.module.css';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const AdminSidebar = () => {
    const location = useLocation();
    const navLinks = [
        { to: '/admin', text: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { to: '/admin/products', text: 'Products', icon: <Package size={20} /> },
        { to: '/admin/orders', text: 'Orders', icon: <ShoppingCart size={20} /> },
        { to: '/admin/customers', text: 'Customers', icon: <Users size={20} /> },
        { to: '/admin/categories', text: 'Categories', icon: <Tag size={20} /> },
        { to: '/admin/contact-messages', text: 'Messages', icon: <MessageSquare size={20} /> },
    ];

    return (
    <aside className={styles.sidebar}>
        <nav className={styles.sidebarNav}>
                {navLinks.map(link => {
                    const isActive =
                        link.to === '/admin'
                            ? location.pathname === '/admin'
                            : location.pathname.startsWith(link.to);
                    return (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={`${styles.sidebarLink} ${isActive ? styles.active : ''}`}
                        >
                            {link.icon}
                            <span>{link.text}</span>
            </Link>
                    );
                })}
        </nav>
    </aside>
);
};

const AdminLayout = () => {
    return (
        <div className={styles.adminLayout}>
            <AdminSidebar />
            <Outlet />
        </div>
    );
};

export default AdminLayout; 