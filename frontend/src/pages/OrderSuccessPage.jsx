// src/pages/OrderSuccessPage.jsx
import { Link } from 'react-router-dom';
import { CheckCircle, Package, Home, ShoppingBag } from 'lucide-react';

const OrderSuccessPage = () => {
  return (
    <div className="container">
      <div className="flex justify-center items-center min-h-screen py-12">
        <div className="w-full max-w-md text-center">
          <div className="card">
            <div className="card-body">
              <div className="mb-6">
                <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="text-green-600" size={40} />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Order Placed Successfully!
                </h1>
                <p className="text-gray-600">
                  Thank you for your purchase. We'll send you an order confirmation with order details.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Package className="text-primary-color" size={20} />
                  <span className="font-semibold">What's Next?</span>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• You'll receive an order confirmation email</li>
                  <li>• We'll process your order within 24 hours</li>
                  <li>• You'll get tracking information once shipped</li>
                  <li>• Delivery typically takes 3-5 business days</li>
                </ul>
              </div>

              <div className="space-y-3">
                <Link to="/myorders" className="btn btn-primary w-full">
                  <ShoppingBag size={20} />
                  <span>View My Orders</span>
                </Link>
                
                <Link to="/products" className="btn btn-outline w-full">
                  <Home size={20} />
                  <span>Continue Shopping</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
