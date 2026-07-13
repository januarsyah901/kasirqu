import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import { useLanguage } from '../auth/LanguageContext';
import SaleReceipt from './SaleReceipt';

export default function POSScreen() {
  const { t } = useLanguage();
  const [cart, setCart] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState('');
  const [barcode, setBarcode] = useState('');
  const [suspending, setSuspending] = useState(false);
  const [lastSale, setLastSale] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setProductsLoading(true);
    api.get('/products')
      .then((res) => {
        if (!cancelled) {
          const data = res.data?.data?.data || res.data?.data || [];
          setProducts(data);
        }
      })
      .catch(() => !cancelled && setProductsError('Failed to load products'))
      .finally(() => !cancelled && setProductsLoading(false));
    return () => { cancelled = true; };
  }, []);

  const addToCart = (product) => {
    const id = product.item_id || product.id;
    const existing = cart.find(item => item.id === id);
    if (existing) {
      setCart(cart.map(item => (item.id === id) ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, id, quantity: 1 }]);
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

  const total = cart.reduce((sum, item) => sum + (item.unit_price || item.price || 0) * item.quantity, 0);

  const handleBarcode = async (e) => {
    e.preventDefault();
    const code = barcode.trim();
    if (!code) return;
    try {
      const res = await api.get('/products', { params: { search: code } });
      const list = res.data?.data?.data || res.data?.data || [];
      const match = list.find(p => (p.item_number || '').toLowerCase() === code.toLowerCase()) || list[0];
      if (match) {
        addToCart(match);
      }
      setBarcode('');
    } catch {
      // ignore
    }
  };

  const handleCheckout = () => {
    if (cart.length > 0) {
      setShowPaymentModal(true);
      setPaymentMessage('');
    }
  };

  const buildPayload = () => ({
    employee_id: 1,
    items: cart.map(p => ({
      item_id: p.item_id || p.id,
      quantity_purchased: p.quantity,
      item_unit_price: p.unit_price || p.price || 0,
      item_location: 1,
    })),
    payments: [{ payment_type: 'Cash', payment_amount: total }],
  });

  const completePayment = async (paymentMethod) => {
    setSubmitting(true);
    setPaymentMessage('');
    try {
      const payload = buildPayload();
      payload.payments = [{ payment_type: paymentMethod === 'Cash' ? 'Cash' : paymentMethod, payment_amount: total }];
      const res = await api.post('/sales', payload);
      const saleId = res.data?.data?.sale_id || res.data?.sale_id;
      setLastSale({ ...payload, sale_id: saleId, sale_time: new Date().toLocaleString(), items: cart.map(p => ({ name: p.name, quantity: p.quantity, unit_price: p.unit_price || p.price })) });
      setCart([]);
      setShowPaymentModal(false);
      setPaymentMessage('Payment completed successfully');
    } catch (err) {
      setPaymentMessage(err?.response?.data?.message || 'Payment failed');
    } finally {
      setSubmitting(false);
    }
  };

  const suspendSale = async () => {
    if (cart.length === 0) return;
    setSuspending(true);
    setPaymentMessage('');
    try {
      const payload = buildPayload();
      const res = await api.post('/sales', payload);
      const saleId = res.data?.data?.sale_id || res.data?.sale_id;
      await api.post('/sales/' + saleId + '/suspend');
      setCart([]);
      setPaymentMessage('Sale suspended');
    } catch (err) {
      setPaymentMessage(err?.response?.data?.message || 'Suspend failed');
    } finally {
      setSuspending(false);
    }
  };

  const printReceipt = () => {
    setShowReceipt(true);
    setTimeout(() => { window.print(); }, 100);
  };

  const priceFor = (p) => p.unit_price || p.price || 0;
  const nameFor = (p) => p.name;
  const stockFor = (p) => {
    const q = p.quantities || [];
    return q.reduce((s, x) => s + (x.quantity || 0), 0);
  };

  const store = {
    name: localStorage.getItem('store_name') || 'KasirQu Store',
    address: localStorage.getItem('store_address') || '',
    phone: localStorage.getItem('store_phone') || '',
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">{t('pos.title')}</h1>

        <form onSubmit={handleBarcode} className="flex items-end gap-3 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('pos.barcode')}</label>
            <input value={barcode} onChange={e => setBarcode(e.target.value)} placeholder="Scan or type item number" className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
          </div>
          <button type="submit" className="px-6 py-2 bg-gray-700 hover:bg-gray-800 text-white font-semibold rounded-lg">{t('pos.barcode')}</button>
        </form>

        {productsError && <p className="text-red-600 mb-4">{productsError}</p>}
        {productsLoading ? (
          <p className="text-gray-600 dark:text-gray-300">Loading products...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(product => (
              <motion.button
                key={product.item_id || product.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => addToCart(product)}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-lg transition-shadow text-left"
              >
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">{nameFor(product)}</h3>
                  <p className="text-green-600 dark:text-green-400 font-bold mt-2">Rp {priceFor(product).toLocaleString()}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Stock: {stockFor(product)}</p>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      <div className="w-96 bg-white dark:bg-gray-800 shadow-xl p-6 flex flex-col">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Cart</h2>
        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center mt-8">Cart is empty</p>
          ) : (
            <AnimatePresence>
              {cart.map(item => (
                <motion.div key={item.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-800 dark:text-white">{nameFor(item)}</h4>
                    <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700">✕</button>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <button onClick={() => updateQuantity(item.id, -1)} className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">-</button>
                      <span className="text-gray-800 dark:text-white font-semibold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">+</button>
                    </div>
                    <p className="font-bold text-gray-800 dark:text-white">Rp {(priceFor(item) * item.quantity).toLocaleString()}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        <div className="border-t dark:border-gray-700 pt-4 mt-4">
          {paymentMessage && (
            <p className={`text-sm mb-2 ${paymentMessage.includes('success') || paymentMessage.includes('suspend') ? 'text-green-600' : 'text-red-600'}`}>{paymentMessage}</p>
          )}
          <div className="flex justify-between mb-4">
            <span className="text-xl font-bold text-gray-800 dark:text-white">Total:</span>
            <span className="text-2xl font-bold text-green-600 dark:text-green-400">Rp {total.toLocaleString()}</span>
          </div>
          <div className="space-y-2">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleCheckout} disabled={cart.length === 0 || submitting} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition-colors">Checkout</motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={suspendSale} disabled={cart.length === 0 || suspending} className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white font-bold py-2 rounded-lg transition-colors">{t('pos.suspendSale')}</motion.button>
            {lastSale && (
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={printReceipt} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg transition-colors">{t('pos.printReceipt')}</motion.button>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showPaymentModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => !submitting && setShowPaymentModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4">
              <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Payment</h3>
              <p className="text-xl mb-6 text-gray-700 dark:text-gray-300">Total: <span className="font-bold text-green-600">Rp {total.toLocaleString()}</span></p>
              <div className="space-y-3">
                {['Cash', 'Debit Card', 'Credit Card', 'E-Wallet'].map(method => (
                  <motion.button key={method} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => completePayment(method)} disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors">{method}</motion.button>
                ))}
              </div>
              <button onClick={() => setShowPaymentModal(false)} disabled={submitting} className="w-full mt-4 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">Cancel</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showReceipt && lastSale && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg max-h-[90vh] overflow-auto">
              <SaleReceipt sale={lastSale} store={store} />
              <div className="flex gap-2 mt-4 print:hidden">
                <button onClick={() => window.print()} className="flex-1 bg-blue-600 text-white py-2 rounded">Print</button>
                <button onClick={() => setShowReceipt(false)} className="flex-1 bg-gray-400 text-white py-2 rounded">Close</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
