import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { useLanguage } from '../auth/LanguageContext';

export default function Inventory() {
  const { t } = useLanguage();
  const [tab, setTab] = useState('adjust');
  const [items, setItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let c = false;
    Promise.all([api.get('/inventory'), api.get('/locations'), api.get('/products')])
      .then(([r, l, p]) => {
        if (c) return;
        setItems(r.data?.data?.data || r.data?.data || []);
        setLocations(Array.isArray(l.data?.data?.data) ? l.data.data.data : (l.data?.data || []));
        setProducts(Array.isArray(p.data?.data?.data) ? p.data.data.data : (p.data?.data || []));
      })
      .catch(() => !c && setError(t('common.loading')))
      .finally(() => !c && setLoading(false));
    return () => { c = true; };
  }, []);

  const adjust = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.target);
    const payload = { trans_items: Number(fd.get('item_id')), trans_location: Number(fd.get('location_id')), trans_inventory: Number(fd.get('delta')), trans_comment: fd.get('comment'), trans_user: 'web' };
    try {
      await api.post('/inventory', payload);
      const res = await api.get('/inventory');
      setItems(res.data?.data?.data || res.data?.data || []);
      e.target.reset();
    } catch (err) {
      setError(err?.response?.data?.message || 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  const transfer = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.target);
    const payload = { item_id: Number(fd.get('item_id')), from_location: Number(fd.get('from_location')), to_location: Number(fd.get('to_location')), quantity: Number(fd.get('transfer_qty')), trans_user: 'web' };
    try {
      await api.post('/inventory/transfer', payload);
      setError('');
      e.target.reset();
    } catch (err) {
      setError(err?.response?.data?.message || 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">{t('inventory.title')}</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <div className="flex space-x-4 mb-6">
        <button onClick={() => setTab('adjust')} className={`px-4 py-2 rounded-lg ${tab === 'adjust' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>{t('inventory.tabAdjust')}</button>
        <button onClick={() => setTab('transfer')} className={`px-4 py-2 rounded-lg ${tab === 'transfer' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>{t('inventory.tabTransfer')}</button>
      </div>
      {tab === 'adjust' && (
        <form onSubmit={adjust} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('inventory.item')}</label><select name="item_id" className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white" required><option value="">--</option>{products.map(p => <option key={p.item_id || p.id} value={p.item_id || p.id}>{p.name}</option>)}</select></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('inventory.tabTransfer').includes('Transfer') ? 'Location' : t('inventory.tabAdjust') + ' Location'}</label><select name="location_id" className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white" required><option value="">--</option>{locations.map(l => <option key={l.location_id || l.id} value={l.location_id || l.id}>{l.name}</option>)}</select></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('inventory.delta')}</label><input type="number" name="delta" className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('inventory.comment')}</label><input name="comment" className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white" /></div>
          <div className="md:col-span-4"><button type="submit" disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 rounded-lg">{t('inventory.adjust')}</button></div>
        </form>
      )}
      {tab === 'transfer' && (
        <form onSubmit={transfer} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('inventory.item')}</label><select name="item_id" className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white" required><option value="">--</option>{products.map(p => <option key={p.item_id || p.id} value={p.item_id || p.id}>{p.name}</option>)}</select></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('inventory.fromLocation')}</label><select name="from_location" className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white" required><option value="">--</option>{locations.map(l => <option key={l.location_id || l.id} value={l.location_id || l.id}>{l.name}</option>)}</select></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('inventory.toLocation')}</label><select name="to_location" className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white" required><option value="">--</option>{locations.map(l => <option key={l.location_id || l.id} value={l.location_id || l.id}>{l.name}</option>)}</select></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('inventory.transferQty')}</label><input type="number" name="transfer_qty" min="1" className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white" required /></div>
          <div className="flex items-end"><button type="submit" disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 rounded-lg">{t('inventory.transfer')}</button></div>
        </form>
      )}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-4"><h2 className="text-xl font-semibold text-gray-800 dark:text-white">{t('common.list')}</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700"><tr><th className="px-4 py-3 text-left text-sm">ID</th><th className="px-4 py-3 text-left text-sm">{t('inventory.item')}</th><th className="px-4 py-3 text-left text-sm">Qty</th></tr></thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? <tr><td colSpan={3} className="px-4 py-6 text-center">{t('common.loading')}</td></tr> : items.length === 0 ? <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-500">{t('common.noData')}</td></tr> : items.map(x => (
                <tr key={x.inventory_id || x.id}><td className="px-4 py-3 text-sm">{x.inventory_id || x.id}</td><td className="px-4 py-3 text-sm">{x.item_name || x.item_id || '-'}</td><td className="px-4 py-3 text-sm">{x.quantity}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
