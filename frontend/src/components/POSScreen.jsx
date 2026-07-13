import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function POSScreen() {
  const [cart, setCart] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [products] = useState([
    { id: 1, name: 'Kopi Susu', price: 15000, stock: 50 },
    { id: 2, name: 'Teh Manis', price: 10000, stock: 30 },
    { id: 3, name: 'Nasi Goreng', price: 25000, stock: 20 },
    { id: 4, name: 'Mie Goreng', price: 20000, stock: 25 },
    { id: 5, name: 'Ayam Bakar', price: 35000, stock: 15 },
    { id: 6, name: 'Es Teh', price: 8000, stock: 40 },
  ]);

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, delta) => {
    setCart(cart.map(item => {
      if (item.id === productId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = () => {
    if (cart.length > 0) {
      setShowPaymentModal(true);
    }
  };

  const completePayment = (paymentMethod) => {
    // TODO: Send to backend API
    console.log('Payment completed:', { cart, total, paymentMethod });
    setCart([]);
    setShowPaymentModal(false);
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Product Grid */}
      <div className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
          Point of Sale
        </h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(product => (
            <motion.button
              key={product.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => addToCart(product)}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <div className="text-left">
                <h3 className="font-semibold text-gray-800 dark:text-white">
                  {product.name}
                </h3>
                <p className="text-green-600 dark:text-green-400 font-bold mt-2">
                  Rp {product.price.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Stock: {product.stock}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="w-96 bg-white dark:bg-gray-800 shadow-xl p-6 flex flex-col">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
          Cart
        </h2>
        
        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center mt-8">
              Cart is empty
            </p>
          ) : (
            <AnimatePresence>
              {cart.map(item => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-800 dark:text-white">
                      {item.name}
                    </h4>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded"
                      >
                        -
                      </button>
                      <span className="text-gray-800 dark:text-white font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded"
                      >
                        +
                      </button>
                    </div>
                    <p className="font-bold text-gray-800 dark:text-white">
                      Rp {(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        <div className="border-t dark:border-gray-700 pt-4 mt-4">
          <div className="flex justify-between mb-4">
            <span className="text-xl font-bold text-gray-800 dark:text-white">
              Total:
            </span>
            <span className="text-2xl font-bold text-green-600 dark:text-green-400">
              Rp {total.toLocaleString()}
            </span>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition-colors"
          >
            Checkout
          </motion.button>
        </div>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowPaymentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4"
            >
              <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                Payment
              </h3>
              <p className="text-xl mb-6 text-gray-700 dark:text-gray-300">
                Total: <span className="font-bold text-green-600">
                  Rp {total.toLocaleString()}
                </span>
              </p>
              <div className="space-y-3">
                {['Cash', 'Debit Card', 'Credit Card', 'E-Wallet'].map(method => (
                  <motion.button
                    key={method}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => completePayment(method)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
                  >
                    {method}
                  </motion.button>
                ))}
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="w-full mt-4 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
