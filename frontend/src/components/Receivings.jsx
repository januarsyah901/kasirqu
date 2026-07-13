import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { useLanguage } from '../auth/LanguageContext';

export default function Receivings() {
  const { t } = useLanguage();
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [rows, setRows] = useState([{ product_id: '', quantity: 1, cost: '' }]);
  const [form, setForm] = useState({ supplier_id: '', location_id: '', comment: '', payment_type: 'cash' });

  useEffect(() => {
    let c = false;
    Promise.all([api.get('/receivings'), api.get('/suppliers'), api.get('/locations'), api.get('/products')])
      .then(([r, s, l, p]) => {
        if (c) return;
        setItems(r.data?.data?.data || r.data?.data || []);
        setSuppliers(Array.isArray(s.data?.data?.data) ? s.data.data.data : (s.data?.data || []));
        setLocations(Array.isArray(l.data?.data?.data) ? l.data.data.data : (l.data?.data || []));
        setProducts(Array.isArray(p.data?.data?.data) ? p.data.data.data : (p.data?.data || []));
      })
      .catch(() => !c && setError(t('common.loading')))
      .finally(() => !c && setLoading(false));
    return () => { c = true; };
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const payload = {
      ...form,
      employee_id: 1,
      items: rows.filter(r => r.product_id).map(r => ({ item_id: Number(r.product_id), quantity_purchased: Number(r.quantity), item_cost_price: Number(r.cost || 0) })),
    };
    try {
      await api.post('/receivings', payload);
      setRows([{ product_id: '', quantity: 1, cost: '' }]);
      setForm({ supplier_id: '', location_id: '', comment: '', payment_type: 'cash' });
      const res = await api.get('/receivings');
      setItems(res.data?.data?.data || res.data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">{t('receivings.title')}</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <form onSubmit={submit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('receivings.supplier')}</label>
            <select value={form.supplier_id} onChange={e => setForm({ ...form, supplier_id: e.target.value })} className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white" required>
              <option value="">--</option>
              {suppliers.map(s => <option key={s.supplier_id || s.id} value={s.supplier_id || s.id}>{s.person_name || s.name || s.supplier_id}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('receivings.location')}</label>
            <select value={form.location_id} onChange={e => setForm({ ...form, location_id: e.target.value })} className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white" required>
              <option value="">--</option>
              {locations.map(l => <option key={l.location_id || l.id} value={l.location_id || l.id}>{l.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('receivings.paymentType')}</label>
            <select value={form.payment_type} onChange={e => setForm({ ...form, payment_type: e.target.value })} className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white">
              <option value="cash">Cash</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('receivings.comment')}</label>
          <input value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })} className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('receivings.item')}</label>
            <button type="button" onClick={() => setRows([...rows, { product_id: '', quantity: 1, cost: '' }])} className="text-blue-600 hover:text-blue-700 text-sm">{t('receivings.addRow')}</button>
          </div>
          {rows.map((r, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 mb-2">
              <select value={r.product_id} onChange={e => { const n = [...rows]; n[idx].product_id = e.target.value; setRows(n); }} className="col-span-6 px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white">
                <option value="">--</option>
                {products.map(p => <option key={p.item_id || p.id} value={p.item_id || p.id}>{p.name} ({p.item_number})</option>)}
              </select>
              <input type="number" min="1" value={r.quantity} onChange={e => { const n = [...rows]; n[idx].quantity = e.target.value; setRows(n); }} className="col-span-2 px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
              <input type="number" min="0" value={r.cost} onChange={e => { const n = [...rows]; n[idx].cost = e.target.value; setRows(n); }} className="col-span-3 px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
              {rows.length > 1 && <button type="button" onClick={() => setRows(rows.filter((_, i) => i !== idx))} className="col-span-1 text-red-600">✕</button>}
            </div>
          ))}
        </div>
        <button type="submit" disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 rounded-lg">{t('receivings.createReceiving')}</button>
      </form>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-4"><h2 className="text-xl font-semibold text-gray-800 dark:text-white">{t('common.list')}</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700"><tr><th className="px-4 py-3 text-left text-sm">ID</th><th className="px-4 py-3 text-left text-sm">{t('receivings.supplier')}</th><th className="px-4 py-3 text-left text-sm">{t('receivings.comment')}</th></tr></thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? <tr><td colSpan={3} className="px-4 py-6 text-center">{t('common.loading')}</td></tr> : items.length === 0 ? <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-500">{t('common.noData')}</td></tr> : items.map(r => (
                <tr key={r.receiving_id || r.id}><td className="px-4 py-3 text-sm">{r.receiving_id || r.id}</td><td className="px-4 py-3 text-sm">{r.supplier_name || r.supplier_id || '-'}</td><td className="px-4 py-3 text-sm">{r.comment || '-'}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
