import React from 'react';
import { CheckCircle, Package, Mail, Phone, MapPin, ShoppingBag, ArrowRight } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const OrderSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const orderData = location.state || {
    orderId: 'N/A',
    orderNumber: 'N/A',
    customerName: 'Customer',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    items: [],
    subtotal: 0,
    shippingCost: 0,
    total: 0,
    specialInstructions: ''
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Success Header */}
          <div className="bg-green-50 px-4 sm:px-6 py-6 sm:py-8 text-center border-b">
            <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="text-green-600 w-6 h-6 sm:w-10 sm:h-10" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
            <p className="text-sm sm:text-base text-gray-600">
              Thank you, {orderData.customerName}! Your order has been received and is being processed.
            </p>
          </div>

          <div className="p-4 sm:p-6">
            {/* Order Details */}
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Order Number:</span>
                  <span className="font-medium text-gray-900 ml-2">#{orderData.orderNumber}</span>
                </div>
                <div>
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-medium text-gray-900 ml-2">{orderData.total.toFixed(2)} DA</span>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 ml-2">
                    Pending
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium text-gray-900 ml-2">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Package className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">{orderData.customerName}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-gray-600">{orderData.customerEmail}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-gray-600">{orderData.customerPhone}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-gray-600">{orderData.customerAddress}</p>
                  </div>
                </div>
                {orderData.specialInstructions && (
                  <div className="flex items-start space-x-3">
                    <Package className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-gray-700">Special Instructions:</p>
                      <p className="text-gray-600">{orderData.specialInstructions}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
              <div className="space-y-3">
                {orderData.items.map((item: any, index: number) => (
                  <div key={index} className="flex items-center space-x-3 sm:space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.image_url || '/placeholder-product.jpg'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm sm:text-base font-medium text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Qty: {item.quantity} × {item.price.toFixed(2)} DA
                      </p>
                    </div>
                    <div className="text-sm sm:text-base font-medium text-gray-900 flex-shrink-0">
                      {(item.quantity * item.price).toFixed(2)} DA
                    </div>
                  </div>
                ))}
                
                {/* Order Totals */}
                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">{orderData.subtotal.toFixed(2)} DA</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-900">
                      {orderData.shippingCost === 0 ? 'Free' : `${orderData.shippingCost.toFixed(2)} DA`}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold pt-2 border-t">
                    <span>Total</span>
                    <span>{orderData.total.toFixed(2)} DA</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 rounded-lg p-4 sm:p-6 mb-6">
              <h3 className="font-semibold text-blue-900 mb-3">What happens next?</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900">Email Confirmation</p>
                    <p className="text-blue-700">You'll receive an order confirmation email shortly</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Package className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900">Order Processing</p>
                    <p className="text-blue-700">We'll prepare your order for shipping</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900">Delivery Update</p>
                    <p className="text-blue-700">We'll contact you with delivery details</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => navigate('/')}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Continue Shopping</span>
              </button>
              <button
                onClick={() => window.location.href = 'mailto:support@sportshop.com'}
                className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Contact Support
              </button>
            </div>

            {/* Support Info */}
            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-500">
                Need help? Contact us at support@sportshop.com or +213 XXX XXX XXX
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;