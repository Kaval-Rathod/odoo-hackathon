import { createContext, useContext, useState, useEffect } from 'react';
import { wishlistAPI } from '../api/wishlist';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const WishlistContext = createContext();

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(false);
    const { isAuthenticated, user } = useAuth();

    useEffect(() => {
        if (isAuthenticated && !user?.isAdmin) {
            loadWishlist();
        } else {
            setWishlist([]);
        }
    }, [isAuthenticated, user]);

    const loadWishlist = async () => {
        setLoading(true);
        try {
            const data = await wishlistAPI.getWishlist();
            setWishlist(data.products || []);
        } catch (error) {
            console.error('Failed to load wishlist:', error);
            setWishlist([]);
        } finally {
            setLoading(false);
        }
    };

    const isProductInWishlist = (productId) => {
        return wishlist.some(product => product._id === productId);
    };

    const toggleWishlist = async (productId) => {
        if (!isAuthenticated) return toast.error('Please log in to manage your wishlist.');
        if (user?.isAdmin) return toast.error('Admins cannot have a wishlist.');

        try {
            if (isProductInWishlist(productId)) {
                const data = await wishlistAPI.removeFromWishlist(productId);
                setWishlist(data.products || []);
                toast.success('Removed from wishlist');
            } else {
                const data = await wishlistAPI.addToWishlist(productId);
                setWishlist(data.products || []);
                toast.success('Added to wishlist');
            }
        } catch (error) {
            toast.error('Failed to update wishlist.');
            console.error('Wishlist toggle error:', error);
        }
    };

    const value = {
        wishlist,
        loading,
        toggleWishlist,
        isProductInWishlist,
        getWishlistCount: () => wishlist.length,
    };

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
}; 