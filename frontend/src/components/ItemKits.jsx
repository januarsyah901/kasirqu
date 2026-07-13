import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { useLanguage } from '../auth/LanguageContext';

export default function ItemKits() {
  const { t } = useLanguage();
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [rows, setRows] = useState([{ item_id: '', quantity: 1, unit_price: '' }]);
  const [form, setForm] = useState({ name: '', description: '', unit_price: '' });
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    let c = false;
    Promise.all([api.get('/item_kits'), api.get('/products')])
      .then(([r, p]) => {
        if (c) return;
        setItems(r.data?.data?.data || r.data?.data || []);
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
      unit_price: Number(form.unit_price || 0),
      items: rows.filter(r => r.item_id).map(r => ({ item_id: Number(r.item_id), quantity: Number(r.quantity), unit_price: Number(r.unit_price || 0) })),
    };
    try {
      await api.post('/item_kits', payload);
      setRows([{ item_id: '', quantity: 1, unit_price: '' }]);
      setForm({ name: '', description: '' });
      const res = await api.get('/item_kits');
      setItems(res.data?.data?.data || res.data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">{t('itemkits.title')}</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <form onSubmit={submit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('itemkits.name')}</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('itemkits.description')}</label><input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('itemkits.unitPrice')}</label><input type="number" min="0" step="0.01" value={form.unit_price} onChange={e => setForm({ ...form, unit_price: e.target.value })} className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white" required /></div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-2"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('itemkits.items')}</label><button type="button" onClick={() => setRows([...rows, { item_id: '', quantity: 1, unit_price: '' }])} className="text-blue-600 text-sm">{t('receivings.addRow')}</button></div>
          {rows.map((r, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 mb-2">
              <select value={r.item_id} onChange={e => { const n = [...rows]; n[idx].item_id = e.target.value; setRows(n); }} className="col-span-6 px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white"><option value="">--</option>{products.map(p => <option key={p.item_id || p.id} value={p.item_id || p.id}>{p.name}</option>)}</select>
              <input type="number" min="1" value={r.quantity} onChange={e => { const n = [...rows]; n[idx].quantity = e.target.value; setRows(n); }} className="col-span-3 px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
              <input type="number" min="0" value={r.unit_price} onChange={e => { const n = [...rows]; n[idx].unit_price = e.target.value; setRows(n); }} className="col-span-2 px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
              {rows.length > 1 && <button type="button" onClick={() => setRows(rows.filter((_, i) => i !== idx))} className="col-span-1 text-red-600">✕</button>}
            </div>
          ))}
        </div>
        <button type="submit" disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 rounded-lg">{t('itemkits.createKit')}</button>
      </form>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-4"><h2 className="text-xl font-semibold text-gray-800 dark:text-white">{t('common.list')}</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700"><tr><th className="px-4 py-3 text-left text-sm">ID</th><th className="px-4 py-3 text-left text-sm">{t('itemkits.name')}</th><th className="px-4 py-3 text-left text-sm">#</th></tr></thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? <tr><td colSpan={3} className="px-4 py-6 text-center">{t('common.loading')}</td></tr> : items.length === 0 ? <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-500">{t('common.noData')}</td></tr> : items.map(x => (
                <>
                  <tr key={x.item_kit_id || x.id}>
                    <td className="px-4 py-3 text-sm">{x.item_kit_id || x.id}</td>
                    <td className="px-4 py-3 text-sm">{x.name}</td>
                    <td className="px-4 py-3 text-sm"><button onClick={() => setExpanded(expanded === (x.item_kit_id || x.id) ? null : (x.item_kit_id || x.id))} className="text-blue-600">{t('itemkits.expand')}</button></td>
                  </tr>
                  {expanded === (x.item_kit_id || x.id) && (
                    <tr key={'k' + (x.item_kit_id || x.id)}>
                      <td colSpan={3} className="px-8 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {(x.items || []).map(it => <div key={it.item_id}>{it.name || it.item_id} x {it.quantity}</div>)}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
